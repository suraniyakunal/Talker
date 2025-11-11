import express from 'express'
import http from 'http'
import dotenv from 'dotenv'
import cors from 'cors'
import { initializeSocketConnection } from './sockets/socketHandle.js'

const app = express()



//global middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ["GET", "POST"]
}))
dotenv.config()
app.use(express.json())


const server = http.createServer(app)
//socket connection
initializeSocketConnection(server)


//global routes
app.get('/', (req, res) => {
  res.json("hello from the server")
})

const PORT = process.env.PORT
server.listen(PORT, () => {
  console.log(`The server is online on port ${PORT}'`)
})
