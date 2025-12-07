import { Server } from 'socket.io'
import { socketAuth } from './socketAuth.js'
import Room from '../models/roomModel.js'

const initializeSocketConnection = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
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

    let roomBroadcasters = new Map()

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId)
      console.log(`${socket.id} joined room: ${roomId}`); // Add this!

      const braodcaster = roomBroadcasters.get(roomId)
      if (braodcaster) {
        socket.emit('broadcaster-ready', { broadcasterId: braodcaster })
      }
      socket.to(roomId).emit(`${socket.id} joined this room`)
      socket.emit('roomJoined', { roomId, message: 'joined Sucessfully' })
    })

    socket.on('register-broadcaster', (roomId) => {
      roomBroadcasters.set(roomId, socket.id)
      socket.to(roomId).emit('broadcaster-ready', { broadcasterId: socket.id })
    })

    socket.on('voice-stream-offer', () => {
      socket.to(data.targetId).emit('voice-stream-offer', data)
    })

    socket.on('voice-stream-answer', (data) => {
      socket.to(data.targetId).emit('voice-stream-answer', data)
    })

    socket.on('voice-ice-candidate', (data) => {
      socket.to(data.targetId).emit('voice-ice-candidate', data)
    })

    socket.on('leaveRoom', (roomId) => {
      console.log('3. Server got leaveRoom:', roomId, 'from', socket.id)
      socket.leave(roomId);
      socket.to(roomId).emit('userLeft', { userId: socket.id, roomId })
      socket.emit('leftRoom', { roomId, message: 'Left Successfully' })
    })

    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })

}

export { initializeSocketConnection }


