import { Server } from 'socket.io'
import { socketAuth } from './socketAuth.js'
import Room from '../models/roomModel.js'
import mediasoup from 'mediasoup'

let worker
let rooms = new Map()
let socketTransports = new Map()

const createWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
    logLevel: 'warn'
  });

  worker.on('died', (error) => {
    console.error('mediasoup worker died:', error);
    setTimeout(() => process.exit(1), 2000);
  });

  console.log('mediasoup worker created');
}


const initializeSocketConnection = async (server) => {
  await createWorker()
  const io = new Server(server, {
    cors: {
      origin: 'https://talker-one.vercel.app',
      methods: ["GET", "POST"],
      credentials: true
    }
  })


  //Middleware
  io.use(socketAuth)

  //  connection logic 
  io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`)

    socket.on('createRoom', async (roomDetails) => {
      try {
        const createdRoom = new Room(roomDetails)
        await createdRoom.save()
        if (!createdRoom) {
          socket.emit('roomError', { error: 'There is some error in saving he room Details' })
        }
        // const findRoom = await Room.findById(createdRoom._id)
        socket.to(createdRoom._id).emit('roomReady', { createdRoom, message: 'Room created Sucessfully' })
        socket.emit('roomCreated', createdRoom._id)
      } catch (error) {
        console.log(error)
        return
      }
    })

    socket.on('getAllRooms', async () => {
      const Rooms = await Room.find({})
      socket.emit('getRooms', Rooms)
    })


    socket.on('joinRoom', async (data, userData) => {
      const { roomId } = data;
      const { userId } = userData;

      socket.join(roomId);
      const getRoom = await Room.findOne({ _id: roomId });

      const isOwner = getRoom.owner.toString() === socket.userId;
      const isSpeaker = getRoom.speakers.some(id => id.toString() === socket.userId);
      const role = isOwner || isSpeaker ? 'speaker' : 'listener';

      // SFU router setup
      if (!rooms.has(roomId)) {
        const router = await worker.createRouter({
          mediaCodecs: [
            { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
            { kind: 'audio', mimeType: 'audio/PCMU', clockRate: 8000 }
          ]
        });
        rooms.set(roomId, { router, producers: new Map() });
        console.log(`✅ Router created for room: ${roomId}`);
      }

      const roomState = rooms.get(roomId);

      // Send room info + SFU capabilities to client
      socket.emit('roomJoined', {
        roomId,
        role,
        room: getRoom,
        rtpCapabilities: roomState.router.rtpCapabilities
      });

      // Notify others
      socket.to(roomId).emit('userJoined', `${socket.id} joined this room`);

      // Get existing producers for new user
      const producerIds = Array.from(roomState.producers.values()).map(p => p.id);
      socket.emit('signalProducers', producerIds);

      console.log(`${socket.id} joined room: ${roomId} as ${role}`);
    });


    //create send transport for speaker


    socket.on('createWebRtcTransport', async ({ sender, roomId, producerId }, callback) => {
      console.log('🟢 SERVER GOT createWebRtcTransport:', { sender, roomId, producerId });

      const roomState = rooms.get(roomId);
      if (!roomState) return callback({ error: 'Room not found' });

      // CHECK IF TRANSPORT ALREADY EXISTS
      const roomData = socketTransports.get(socket.id)?.get(roomId);
      if (roomData) {
        if (sender && roomData.sendTransport) {
          return callback({
            params: {
              id: roomData.sendTransport.id,
              iceParameters: roomData.sendTransport.iceParameters,
              iceCandidates: roomData.sendTransport.iceCandidates,
              dtlsParameters: roomData.sendTransport.dtlsParameters
            }
          });
        }
        if (!sender && producerId && roomData.recvTransports.has(producerId)) {
          const existingTransport = roomData.recvTransports.get(producerId);
          return callback({
            params: {
              id: existingTransport.id,
              iceParameters: existingTransport.iceParameters,
              iceCandidates: existingTransport.iceCandidates,
              dtlsParameters: existingTransport.dtlsParameters
            }
          });
        }
      }

      try {
        const transport = await roomState.router.createWebRtcTransport({
          listenIps: [{ ip: '0.0.0.0', announcedIp: null }],
          enableUdp: true,
          enableTcp: true,
          preferUdp: true
        });

        // ENSURE roomData exists
        if (!socketTransports.has(socket.id)) socketTransports.set(socket.id, new Map());
        if (!socketTransports.get(socket.id).has(roomId)) {
          socketTransports.get(socket.id).set(roomId, { sendTransport: null, recvTransports: new Map() });
        }
        const roomDataNow = socketTransports.get(socket.id).get(roomId);

        if (sender) {
          roomDataNow.sendTransport = transport;
        } else if (producerId) {
          roomDataNow.recvTransports.set(producerId, transport);
        }

        callback({
          params: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters
          }
        });
      } catch (err) {
        callback({ error: err.message });
      }
    });
    //handle audio from speaker side

    // Handle transport connect

    socket.on('transport-connect', async ({ dtlsParameters, roomId, producerId }, callback) => {
      console.log('🔄 Transport connect:', { roomId, producerId });

      const roomData = socketTransports.get(socket.id)?.get(roomId);
      if (!roomData) return callback({ error: 'Room data not found' });

      let transport;
      if (roomData.sendTransport && !roomData.sendTransport.conn) {
        transport = roomData.sendTransport;
      } else if (producerId) {
        transport = roomData.recvTransports.get(producerId);
        if (transport && transport.conn) return callback(); // Already connected
      }

      if (!transport) return callback({ error: 'No connectable transport' });

      try {
        await transport.connect({ dtlsParameters });
        callback();
      } catch (err) {
        callback({ error: err.message });
      }
    });

    // Handle transport produce  
    socket.on('transport-produce', async ({ kind, rtpParameters, roomId, userId }, callback) => {
      const roomState = rooms.get(roomId);
      const roomData = socketTransports.get(socket.id)?.get(roomId);
      const transport = roomData?.sendTransport;

      if (!transport) return callback({ error: 'Transport not found' });

      const producer = await transport.produce({ kind, rtpParameters });
      roomState.producers.set(userId, producer);

      // Notify others
      socket.to(roomId).emit('new-producer', { producerId: producer.id, userId });

      callback({ id: producer.id });
    });

    socket.on('getProducers', (roomId) => {
      const roomState = rooms.get(roomId)
      const producerIds = Array.from(roomState.producers.values()).map(p => p.id)
      socket.emit('signalProducers', producerIds)

    })


    socket.on('consume', async ({ remoteProducerId, rtpCapabilities, roomId }, callback) => {
      console.log('🟢 SERVER GOT consume:', { remoteProducerId, roomId });

      const roomState = rooms.get(roomId);
      if (!roomState) return callback({ error: 'Room not found' });

      const producer = Array.from(roomState.producers.values()).find(p => p.id === remoteProducerId);
      if (!producer) return callback({ error: 'Producer not found' });

      // Create recv transport if not exists
      if (!socketTransports.has(socket.id)) socketTransports.set(socket.id, new Map());
      if (!socketTransports.get(socket.id).has(roomId)) {
        socketTransports.get(socket.id).set(roomId, { sendTransport: null, recvTransports: new Map() });
      }
      const roomData = socketTransports.get(socket.id).get(roomId);

      let transport = roomData.recvTransports.get(remoteProducerId);
      if (!transport) {
        transport = await roomState.router.createWebRtcTransport({
          listenIps: [{ ip: '0.0.0.0', announcedIp: null }],
          enableUdp: true,
          enableTcp: true,
          preferUdp: true,
          iceParameters
        });
        roomData.recvTransports.set(remoteProducerId, transport);
      }

      try {
        const consumer = await transport.consume({
          producerId: remoteProducerId,
          rtpCapabilities,
          paused: true
        });

        callback({
          params: {
            id: consumer.id,
            producerId: consumer.producerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters
          }
        });
      } catch (err) {
        callback({ error: err.message });
      }
    });


    socket.on('leaveRoom', async (roomId) => {
      console.log('🧹 Cleaning up transports for:', socket.id, roomId);

      // CLOSE TRANSPORTS
      const roomData = socketTransports.get(socket.id)?.get(roomId);
      if (roomData) {
        roomData.sendTransport?.close();
        roomData.recvTransports.forEach(t => t.close());
        socketTransports.get(socket.id)?.delete(roomId);
      }

      // REMOVE PRODUCER
      const roomState = rooms.get(roomId);
      if (roomState) {
        roomState.producers.delete(socket.userId);
      }

      socket.leave(roomId);

      const getRoom = await Room.findOne({ _id: roomId });
      // ✅ FIXED LOGIC
      if (getRoom.owner.toString() !== socket.userId.toString()) {
        getRoom.listeners = getRoom.listeners.filter(id => id.toString() !== socket.userId.toString());
        await getRoom.save();
      }

      socket.to(roomId).emit('userLeft', { userId: socket.id, roomId });
      socket.emit('leftRoom', { roomId, message: 'Left Successfully' });
    });


    socket.on('disconnect', () => {
      console.log('🧹 Full cleanup for:', socket.id);

      socketTransports.get(socket.id)?.forEach((roomData, roomId) => {
        roomData.sendTransport?.close();
        roomData.recvTransports.forEach(t => t.close());
      });
      socketTransports.delete(socket.id);
    });
  })

}

export { initializeSocketConnection }


