
const rooms = new Map()
const voiceRoomLogic = async (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    console.log(`${socket.id} has joined the room ${roomId}`)
  })

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId)
    console.log(`${socket.id} has left the room ${roomId}`)
  })
}

export default voiceRoomLogic;
