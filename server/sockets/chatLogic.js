export const chatLogic = async (socket, io, userSocketMap) => {
  socket.on('send_friend_request', async ({ sender, receiverId, requestId }) => {
    console.log('sender ,receiver ,requestId', sender, receiverId, requestId);

    if (!sender || !receiverId || !requestId) return console.log('data not found');

    const receiveSocketId = userSocketMap.get(receiverId);

    io.to(receiveSocketId).emit('new-request', {
      message: `request from ${sender.username}`,
      sender,
      requestId,
    });

    console.log(`Sending to socket ID: ${receiveSocketId}`);
  });

  socket.on('join-chats', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined: ${room}`)
  });

  socket.on('new-message', (newMessage) => {
    const room = newMessage.conversationId;
    socket.in(room).emit('message-received', newMessage);
  });

  socket.on('leave-chats', (room) => {
    socket.leave(room);
    console.log(`user ${socket.id} has left the room ${room}`)
  });

  // ── Voice room live chat ──────────────────────────────────────────────────
  // Broadcast a room chat message to everyone else in the voice room socket channel
  socket.on('voiceroom:chat-message', ({ roomId, message }) => {
    if (!roomId || !message?.text?.trim()) return
    socket.to(roomId).emit('voiceroom:chat-message', message)
  })
};
