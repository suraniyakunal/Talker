import { Server } from 'socket.io'
import { socketAuth } from './socketAuth.js'

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



    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })

}

export { initializeSocketConnection }


