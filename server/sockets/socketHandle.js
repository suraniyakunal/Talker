import { Server } from 'socket.io'

const initializeSocketConnection = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  })

  // *** You MUST add connection logic here ***
  io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Add handlers for specific events your frontend sends
    // socket.on('yourEvent', (data) => { ... });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  // Optional: Return 'io' if you need to use it elsewhere in your server.js
  return io;
}

export { initializeSocketConnection }


