import express, { json } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initializeSocketConnection } from './sockets/socketHandle.js';
import dbContext from './controllers/dbConnection.js';
import userRouter from './routes/userRoutes.js';
import roomRouter from './routes/roomRoutes.js';
import chatRouter from './routes/chatRoutes.js';


// loadEnvFile('.env.dev')
dotenv.config('.env.dev');
// console.log(process.env)
export const app = express();
const uri = process.env.MONGODB_URL;


app.use(express.json());
app.use(cookieParser());

//global middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

const server = http.createServer(app);

if (process.env.NODE_ENV !== 'test') {
  dbContext(uri)

  //socket connection
  initializeSocketConnection(server);
}



app.get('/', (req, res) => {
  res.send({ message: 'the server is online' })
})

//global routes
app.use('/api/users', userRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/chats', chatRouter);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`The server is online on port ${PORT}`);
  });
}
