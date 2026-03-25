import express, { json } from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initializeSocketConnection } from './sockets/socketHandle.js';
import dbContext from './controllers/dbConnection.js';
import userRouter from './routes/userRoutes.js';
import roomRouter from './routes/roomRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import postRouter from './routes/postRoutes.js';


export const app = express();
const uri = process.env.MONGODB_URL;


app.use(express.json());
app.use(cookieParser());

//global middleware
app.use(
  cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:4173'].filter(Boolean),
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
app.use('/api/posts', postRouter);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`The server is online on port ${PORT}`);
  });
}
