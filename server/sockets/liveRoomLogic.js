import Room from "../models/roomModel.js"
import User from '../models/userModel.js'

const roomState = new Map()
const roomRouter = new Map()
const transportMap = new Map()

// Helper to get a populated room object
const getPopulatedRoom = (roomId) =>
  Room.findById(roomId)
    .populate('host', 'username profile_Pic')
    .populate('speaker', 'username profile_Pic')
    .populate('listener', 'username profile_Pic')

const liveRoomLogic = async (socket, worker, userSocketMap) => {

  const ensureRoom = (roomId) => {
    if (!roomState.has(roomId)) {
      roomState.set(roomId, {
        speakers: new Set(),
        listeners: new Set(),
        pendingRequests: new Map(), // userId -> { user, socketId }
      })
    }
    return roomState.get(roomId)
  }

  const canBecomeSpeaker = (roomId) => {
    const room = ensureRoom(roomId)
    return room.speakers.size < 4
  }

  const getOrCreateRouter = async (roomId) => {
    if (roomRouter.has(roomId)) return roomRouter.get(roomId)

    const mediaCodecs = [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
          'x-google-start-bitrate': 1000
        }
      }
    ]

    const router = await worker.createRouter({ mediaCodecs })
    roomRouter.set(roomId, router)
    return router
  }

  // ─── CREATE ROOM ────────────────────────────────────────────────────────────
  socket.on('create-liveroom', async (roomId) => {
    await getOrCreateRouter(roomId)
  })

  // ─── JOIN ROOM ────────────────────────────────────────────────────────────
  socket.on('join-room', async ({ roomId, user, asBroadcaster }, callback) => {
    try {
      if (!roomId || !user) return callback?.({ ok: false, error: 'Missing data' })

      const room = await Room.findById(roomId)
      if (!room) return callback?.({ ok: false, error: 'Room not found' })

      const isHost = room.host.toString() === user._id.toString()
      const isAlreadySpeaker = room.speaker?.some(id => id.toString() === user._id.toString())

      socket.join(roomId)
      const state = ensureRoom(roomId)

      let updatedRoom

      if (isHost) {
        state.speakers.add(socket.id)
        updatedRoom = await getPopulatedRoom(roomId)
      } else if (asBroadcaster || isAlreadySpeaker) {
        if (!canBecomeSpeaker(roomId) && !isAlreadySpeaker) {
          return callback?.({ ok: false, error: 'Max broadcasters reached (4)' })
        }
        state.speakers.add(socket.id)
        updatedRoom = await Room.findByIdAndUpdate(
          roomId,
          { $addToSet: { speaker: user._id }, $pull: { listener: user._id } },
          { new: true }
        ).populate('host', 'username profile_Pic').populate('speaker', 'username profile_Pic').populate('listener', 'username profile_Pic')
      } else {
        state.listeners.add(socket.id)
        updatedRoom = await Room.findByIdAndUpdate(
          roomId,
          { $addToSet: { listener: user._id }, $pull: { speaker: user._id } },
          { new: true }
        ).populate('host', 'username profile_Pic').populate('speaker', 'username profile_Pic').populate('listener', 'username profile_Pic')
      }

      socket.to(roomId).emit('room-data-update', updatedRoom)
      callback?.({ ok: true, roomdata: updatedRoom })

    } catch (error) {
      console.error("join-room error:", error)
      callback?.({ ok: false, error: 'Internal server error' })
    }
  })


  // ─── LEAVE ROOM ────────────────────────────────────────────────────────────
  socket.on('liveroom:leave-room', async ({ roomId }) => {
    try {
      socket.leave(roomId)
      const entry = transportMap.get(socket.id)
      if (entry) {
        if (entry.sendTransport) entry.sendTransport.close()
        if (entry.recvTransport) entry.recvTransport.close()
        transportMap.delete(socket.id)
      }

      const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        { $pull: { listener: socket.userId, speaker: socket.userId } },
        { new: true }
      ).populate('host', 'username profile_Pic').populate('speaker', 'username profile_Pic').populate('listener', 'username profile_Pic')

      socket.to(roomId).emit('room-data-update', updatedRoom)
      const state = roomState.get(roomId)
      if (state) {
        state.speakers.delete(socket.id)
        state.listeners.delete(socket.id)
      }
    } catch (error) { }
  })


  // ─── HOST CLOSES ROOM ─────────────────────────────────────────────────────
  socket.on('liveroom:close-room', async ({ roomId }) => {
    try {
      const room = await Room.findById(roomId)
      if (!room || room.host.toString() !== (socket.userId || '')) return

      socket.to(roomId).emit('room-closed', { roomId, message: 'The host has ended the room.' })

      if (roomRouter.has(roomId)) {
        roomRouter.get(roomId).close()
        roomRouter.delete(roomId)
      }
      roomState.delete(roomId)
      await Room.findByIdAndDelete(roomId)
    } catch (error) { }
  })

  // ─── REQUEST & APPROVAL ───────────────────────────────────────────────────
  socket.on('liveroom:request-to-speak', async ({ roomId, user }) => {
    try {
      const room = await Room.findById(roomId)
      if (!room) return

      const state = ensureRoom(roomId)
      state.pendingRequests.set(user._id.toString(), { user, socketId: socket.id })

      const hostSocketId = userSocketMap.get(room.host.toString())
      if (hostSocketId) {
        socket.to(hostSocketId).emit('liveroom:broadcaster-request', { requestingUser: user, roomId })
      }
    } catch (error) { }
  })

  socket.on('liveroom:approve-broadcaster', async ({ roomId, userId }, callback) => {
    try {
      const room = await Room.findById(roomId)
      if (!room || room.host.toString() !== (socket.userId || '')) return

      const state = ensureRoom(roomId)
      const request = state.pendingRequests.get(userId.toString())
      if (!request) return callback?.({ ok: false, error: 'No request' })

      const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        { $addToSet: { speaker: userId }, $pull: { listener: userId } },
        { new: true }
      ).populate('host', 'username profile_Pic').populate('speaker', 'username profile_Pic').populate('listener', 'username profile_Pic')

      if (request.socketId) {
        state.speakers.add(request.socketId)
        state.listeners.delete(request.socketId)
        socket.to(request.socketId).emit('liveroom:you-are-approved', { roomId, roomdata: updatedRoom })
      }

      state.pendingRequests.delete(userId.toString())
      socket.to(roomId).emit('room-data-update', updatedRoom)
      socket.emit('room-data-update', updatedRoom)

      callback?.({ ok: true, roomdata: updatedRoom })
    } catch (error) {
      callback?.({ ok: false })
    }
  })

  socket.on('liveroom:deny-broadcaster', async ({ roomId, userId }, callback) => {
    try {
      const state = ensureRoom(roomId)
      const request = state.pendingRequests.get(userId.toString())
      if (request?.socketId) {
        socket.to(request.socketId).emit('liveroom:you-are-denied', { roomId })
      }
      state.pendingRequests.delete(userId.toString())
      callback?.({ ok: true })
    } catch (error) { }
  })

  // ─── CHAT ────────────────────────────────────────────────────────────────
  socket.on('liveroom:chat-message', ({ roomId, message }) => {
    socket.to(roomId).emit('liveroom:chat-message', message)
  })


  // ─── MEDIASOUP TRANSPORT ──────────────────────────────────────────────────
  socket.on('liveroom:get-rtp-capabilities', async ({ roomId }, callback) => {
    const router = await getOrCreateRouter(roomId)
    callback(router.rtpCapabilities)
  })

  socket.on('liveroom:create-transport', async ({ roomId, direction }, callback) => {
    const router = await getOrCreateRouter(roomId)

    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: process.env.PUBLIC_IP || null }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    })

    let entry = transportMap.get(socket.id) || { producers: new Map() }
    if (direction === 'send') entry.sendTransport = transport
    else entry.recvTransport = transport
    transportMap.set(socket.id, entry)

    callback({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    })
  })

  socket.on('liveroom:connect-transport', async ({ direction, dtlsParameters }, callback) => {
    const entry = transportMap.get(socket.id)
    const transport = direction === 'send' ? entry?.sendTransport : entry?.recvTransport
    if (!transport) return callback({ ok: false })
    await transport.connect({ dtlsParameters })
    callback({ ok: true })
  })

  socket.on('liveroom:produce', async ({ kind, rtpParameters, roomId, appData }, callback) => {
    const entry = transportMap.get(socket.id)
    const sendTransport = entry?.sendTransport
    if (!sendTransport) return callback({ ok: false })

    const producer = await sendTransport.produce({ kind, rtpParameters, appData })
    entry.producers.set(producer.id, producer)

    producer.on('transportclose', () => { producer.close() })

    socket.to(roomId).emit('liveroom:new-producer', {
      producerId: producer.id,
      kind,
      userId: socket.userId
    })

    callback({ ok: true, id: producer.id })
  })

  // 🚀 Fetch Existing Producers
  socket.on('liveroom:get-producers', ({ roomId }, callback) => {
    const producers = []
    transportMap.forEach((entry, targetSocketId) => {
      if (entry.producers) {
        entry.producers.forEach((producer) => {
          // If the socket room is actually matching... technically relying on the fact that existing sockets are in the room.
          producers.push({
            producerId: producer.id,
            kind: producer.kind,
            userId: producer.appData.userId, // This needs to be set above during produce
          })
        })
      }
    })
    callback(producers)
  })

  socket.on('liveroom:close-producer', async ({ roomId }) => {
    const entry = transportMap.get(socket.id)
    if (entry && entry.producers) {
      entry.producers.forEach((producer, id) => {
        producer.close()
        socket.to(roomId).emit('liveroom:producer-closed', { producerId: id, socketId: socket.id })
      })
      entry.producers.clear()
    }
  })

  socket.on('liveroom:consume', async ({ roomId, producerId, rtpCapabilities }, cb) => {
    const router = await getOrCreateRouter(roomId)
    if (!router.canConsume({ producerId, rtpCapabilities })) return cb({ error: 'cannot consume' })

    const entry = transportMap.get(socket.id)
    const recvTransport = entry?.recvTransport
    if (!recvTransport) return cb({ error: 'NO_RECV_TRANSPORT' })

    const consumer = await recvTransport.consume({
      producerId,
      rtpCapabilities,
      paused: false,
    })

    cb({
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    })
  })

  socket.on('disconnecting', async () => {
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue
      try {
        const room = await Room.findById(roomId)
        if (!room) continue
        if (room.host.toString() === (socket.userId || '')) {
          socket.to(roomId).emit('room-closed', { roomId, message: 'Host disconnected' })
          if (roomRouter.has(roomId)) {
            roomRouter.get(roomId).close()
            roomRouter.delete(roomId)
          }
          await Room.findByIdAndDelete(roomId)
        } else {
          const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            { $pull: { listener: socket.userId, speaker: socket.userId } },
            { new: true }
          ).populate('host', 'username profile_Pic').populate('speaker', 'username profile_Pic').populate('listener', 'username profile_Pic')
          socket.to(roomId).emit('room-data-update', updatedRoom)
        }
      } catch (err) { }
    }
  })

  socket.on('disconnect', () => {
    const entry = transportMap.get(socket.id)
    if (entry) {
      if (entry.sendTransport) entry.sendTransport.close()
      if (entry.recvTransport) entry.recvTransport.close()
      transportMap.delete(socket.id)
    }
  })
}

export default liveRoomLogic
