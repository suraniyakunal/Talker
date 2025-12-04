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
      console.log('room details are :', roomDetails)
      const createRoom = new Room(roomDetails)
      await createRoom.save()
      if (!createRoom) {
        socket.emit('roomError', { error: 'There is some error in saving he room Details' })
      }
      console.log('on create room ', createRoom)
      const findRoom = await Room.findById(createRoom._id)
      console.log('the room has been created', findRoom)
    })

    socket.on('getAllRooms', async () => {
      const Rooms = await Room.find({})
      console.log(Rooms)
      socket.emit('getRooms', Rooms)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })

}

export { initializeSocketConnection }


