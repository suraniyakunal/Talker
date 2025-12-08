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

    socket.on('joinRoom', async ({ roomId }, { userId }) => {
      socket.join(roomId)
      const getRoom = await Room.findOne({ _id: roomId })
      const isOwner = getRoom.owner.toString() === socket.userId
      const isSpeaker = getRoom.speakers.some(id => id.toString() === socket.userId)
      const role = isOwner || isSpeaker ? 'speaker' : 'listener'

      console.log(`${socket.id} joined room: ${roomId}`); // Add this!

      const broadcaster = roomBroadcasters.get(roomId)
      if (broadcaster) {
        socket.emit('broadcaster-ready', { broadcasterId: broadcaster })
      }
      socket.to(roomId).emit('userJoined', `${socket.id} joined this room`)
      socket.emit('roomJoined', { roomId, role, room: getRoom, message: 'joined Sucessfully' })
    })


    socket.on('leaveRoom', async (roomId) => {
      console.log(' Server got leaveRoom:', roomId, 'from', socket.id)
      socket.leave(roomId)
      const getRoom = await Room.findOne({ _id: roomId })

      if (!getRoom.owner.toString() === socket.userId.toString()) {
        getRoom.listeners = getRoom.listeners.filter(userId => userId !== socket.userId)
        if (getRoom.listeners) {
          console.log(getRoom.listeners)
        }
      }
      socket.to(roomId).emit('userLeft', { userId: socket.id, roomId })
      socket.emit('leftRoom', { roomId, message: 'Left Successfully' })
    })

    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })

}

export { initializeSocketConnection }


