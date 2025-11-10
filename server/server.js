import express from 'express'
import http from 'http'
import { Server as SocketIoServer } from 'socket.io'
import cors from 'cors'
const app = express()
const server = http.createServer(app)
const io = new SocketIoServer(server, {
  // cors: {
  //   origin: "http://localhost:5173/",
  //   methods: ["GET", "POST"]
  // }
})

//middlware
// app.use(cors())
app.use(express.json())

const PORT = 3000

app.get('/', (req, res) => {
  res.json("hello from the server")
})

server.listen(PORT, () => {
  console.log(`The server is online on port ${PORT}'`)
})
