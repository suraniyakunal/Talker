import express from 'express'
import http from 'http'
import dotenv from 'dotenv'
import cors from 'cors'
import { initializeSocketConnection } from './sockets/socketHandle.js'
import dbContext from './controllers/dbConnection.js'
import userRouter from './routes/userRoutes.js'

dotenv.config()

const app = express()
const uri = process.env.MONGODB_URL

app.use(express.json())


//global middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ["GET", "POST"]
}))



const server = http.createServer(app)
//socket connection
initializeSocketConnection(server)
dbContext(uri)

//global routes
app.get('/', (req, res) => {
  res.json("hello from the server")
})

app.use('/api/users', userRouter)

const PORT = process.env.PORT
server.listen(PORT, () => {
  console.log(`The server is online on port ${PORT}'`)
})
