import Room from "../models/roomModel.js"
import User from '../models/userModel.js'

const roomState = new Map()
const roomRouter = new Map()
const transportMap = new Map()

const voiceRoomLogic = async (socket, worker) => {

  const ensureRoom = (roomId) => {
    if (!roomState.has(roomId)) {
      roomState.set(roomId, {
        speakers: new Set(),
        listeners: new Set(),
      })
    }
    return roomState.get(roomId)
  }

  const canBecomeSpeaker = (roomId) => {
    const room = ensureRoom(roomId)
    return room.speakers.size < 8
  }

  const getOrCreateRouter = async (roomId) => {

    if (roomRouter.has(roomId)) return roomRouter.get(roomId)

    const mediaCodecs = [{
      kind: 'audio',
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2,
    },]

    const router = await worker.createRouter({ mediaCodecs })
    roomRouter.set(roomId, router)

    return router
  }

  socket.on('create-voiceroom', async (roomId) => {
    await getOrCreateRouter(roomId)
  })

  socket.on('join-room', async ({ roomId, user, asSpeaker }, callback) => {

    try {

      if (!roomId || !user) return

      const roomcheck = ensureRoom(roomId)

      socket.join(roomId)

      const room = await Room.findById(roomId);
      const ishost = room.host.toString() === user._id.toString();
      if (ishost) {
        // If it's the host rejoining, we don't need to add them to any arrays
        // They are already the 'host' in the DB.
        console.log(`Host ${user.username} reconnected.`);
      }
      if (!room) {
        return callback({ ok: false, error: 'room not found in database' });
      }


      // 1. Determine the actual role being used
      let actualRole = "listener";
      if (ishost || asSpeaker) {
        actualRole = "speaker";
      }

      // 2. Set Memory State
      if (ishost || asSpeaker) {
        if (!ishost && !canBecomeSpeaker(roomId)) {
          return callback({ ok: false, error: 'max speakers reached' });
        }
        roomcheck.speakers.add(socket.id);
      } else {
        roomcheck.listeners.add(socket.id);
      }

      let updatedroom


      if (ishost) {
        // host: don't update arrays, just populate and return
        updatedroom = await Room.findById(roomId)
          .populate('host', 'username profile_Pic')
          .populate('speaker', 'username profile_Pic')
          .populate('speaker', 'username profile_Pic')
      } else {
        // non-host: add to either speaker or listener array
        const updatefield = asSpeaker ? { speaker: user._id } : { listener: user._id };
        updatedroom = await Room.findByIdAndUpdate(
          roomId,
          { $addtoset: updatefield },
          { new: true }
        )
          .populate('host', 'username profile_Pic')
          .populate('speaker', 'username profile_Pic')
          .populate('listener', 'username profile_Pic')
      }

      socket.to(roomId).emit('room-data-update', 'host speaker listener');

      console.log(`✅ ${user.username} joined ${roomId} as ${ishost ? 'Host' : actualRole}`)

      callback({ ok: true, roomdata: updatedroom })

    } catch (error) {
      console.error("join room error:", error);
      callback({ ok: false, error: 'internal server error' })
    }

  })


  socket.on('voiceroom:leave-room', async ({ roomId }) => {
    try {
      // 1. Leave the Socket.io room
      socket.leave(roomId);

      // 2. Clean up Mediasoup server-side transports
      const entry = transportMap.get(socket.id);
      if (entry) {
        if (entry.sendTransport) entry.sendTransport.close();
        if (entry.recvTransport) entry.recvTransport.close();
        transportMap.delete(socket.id);
      }

      // 3. Remove user from MongoDB
      const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        { $pull: { listener: socket.userId, speaker: socket.userId } },
        { new: true }
      ).populate('host speaker listener', '-password')      // 4. Notify others in the room
      socket.to(roomId).emit('room-data-update', updatedRoom);

      // 5. Clean up memory state
      const room = roomState.get(roomId);
      if (room) {
        room.speakers.delete(socket.id);
        room.listeners.delete(socket.id);
      }

      console.log(`User ${socket.userId} left room ${roomId}`);
    } catch (error) {
      console.error("Leave Room Error:", error);
    }
  });

  // RTP Capabilities for client
  socket.on('voiceroom:get-rtp-capabilities', async ({ roomId }, callback) => {
    const router = await getOrCreateRouter(roomId)
    callback(router.rtpCapabilities)
  })

  // create webrtc transport 
  socket.on('voiceroom:create-transport', async ({ roomId, direction }, callback) => {
    const router = await getOrCreateRouter(roomId)

    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: process.env.PUBLIC_IP || null }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    })

    let entry = transportMap.get(socket.id) || {}
    if (direction === 'send') {
      entry.sendTransport = transport
    } else {
      entry.recvTransport = transport
    }
    transportMap.set(socket.id, entry)

    callback({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    })

  })

  // connect transport
  socket.on('voiceroom:connect-transport', async ({ direction, dtlsParameters }, callback) => {
    const entry = transportMap.get(socket.id)
    const transport = direction === 'send' ? entry?.sendTransport : entry?.recvTransport

    if (!transport) return callback({ ok: false, error: 'No Transport' })

    await transport.connect({ dtlsParameters })

    callback({ ok: true })
  })

  // produce audio for speaker in the room
  socket.on('voiceroom:produce', async ({ kind, rtpParameters, roomId }, callback) => {
    const entry = transportMap.get(socket.id)
    const currentSendTransport = entry?.sendTransport
    if (!currentSendTransport) return callback({ ok: false, error: 'Cannot Produce the audio' })

    const producer = await currentSendTransport.produce({ kind, rtpParameters })

    producer.on('transportclose', () => {
      console.log('producer transport closed')
      producer.close()
    })

    // If the speaker explicitly stops their mic
    socket.on('voiceroom:close-producer', () => {
      producer.close()
      socket.to(roomId).emit('voiceroom:producer-closed', { producerId: producer.id })
    })

    producer.appData = { roomId }

    socket.to(roomId).emit('voiceroom:new-producer', {
      producerId: producer.id,
      kind,
    })

    callback({ ok: true, id: producer.id })
  })


  socket.on('disconnect', () => {
    const entry = transportMap.get(socket.id);
    if (entry) {
      if (entry.sendTransport) entry.sendTransport.close();
      if (entry.recvTransport) entry.recvTransport.close();
      transportMap.delete(socket.id);
    }

    // Cleanup memory room state
    for (const [roomId, room] of roomState.entries()) {
      room.speakers.delete(socket.id);
      room.listeners.delete(socket.id);
    }
  });


  // server.js (inside io.on('connection'))
  socket.on('voiceroom:consume', async ({ roomId, producerId, rtpCapabilities }, cb) => {
    const router = await getOrCreateRouter(roomId)

    if (!router.canConsume({ producerId, rtpCapabilities })) {
      return cb({ error: 'cannot consume' })
    }

    const entry = transportMap.get(socket.id)
    const recvTransport = entry?.recvTransport
    if (!recvTransport) return cb({ error: 'NO_RECV_TRANSPORT' })

    const consumer = await recvTransport.consume({
      producerId,
      rtpCapabilities,
      paused: false,
    })

    cb({
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    })
  })


  socket.on('voiceroom:close-producer', async ({ roomId }) => {
    const entry = transportMap.get(socket.id);
    const producer = entry?.producer; // Ensure you stored the producer in the entry!

    if (producer) {
      producer.close();
      // Notify everyone else in the room
      socket.to(roomId).emit('voiceroom:producer-closed', {
        producerId: producer.id,
        socketId: socket.id
      });
    }
  });


  socket.on('disconnecting', async () => {
    // socket.rooms is a Set containing the socket's id and any rooms they joined
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        // Remove user from both arrays in DB
        const updatedRoom = await Room.findByIdAndUpdate(
          roomId,
          { $pull: { listener: socket.userId, speaker: socket.userId } },
          { new: true }
        ).populate([
          { path: 'host', model: User },
          { path: 'speaker', model: User },
          { path: 'listener', model: User }
        ])

        // Notify others in the room
        socket.to(roomId).emit('room-data-update', updatedRoom);
      }
    }
  });
}

export default voiceRoomLogic;
