import { Server } from 'socket.io';
import { socketAuth } from './socketAuth.js';
import Room from '../models/roomModel.js';
import mediasoup from 'mediasoup';
import { chatLogic } from './chatLogic.js';
import voiceRoomLogic from './voiceRoomLogic.js';

let worker;
let userSocketMap = new Map();

const createWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
    logLevel: 'warn',
  });

  worker.on('died', (error) => {
    console.error('mediasoup worker died:', error);
    setTimeout(() => process.exit(1), 2000);
  });

  console.log('mediasoup worker created');
};

const initializeSocketConnection = async (server) => {
  await createWorker();
  const io = new Server(await server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  //Middleware
  io.use(socketAuth);

  //  connection logic
  io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
    }
    chatLogic(socket, io, userSocketMap);
    voiceRoomLogic(socket, worker, userSocketMap);

    socket.on('disconnect', () => {
      console.log('🧹 Full cleanup for:', socket.id);
    })
  })
}

export { initializeSocketConnection };
