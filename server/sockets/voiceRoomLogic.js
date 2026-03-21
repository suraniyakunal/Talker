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

const voiceRoomLogic = async (socket, worker, userSocketMap) => {

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
    return room.speakers.size < 8
  }

  const getOrCreateRouter = async (roomId) => {
    if (roomRouter.has(roomId)) return roomRouter.get(roomId)

    const mediaCodecs = [{
      kind: 'audio',
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2,
    }]

    const router = await worker.createRouter({ mediaCodecs })
    roomRouter.set(roomId, router)
    return router
  }

  // ─── CREATE ROOM (called when host creates) ───────────────────────────────
  socket.on('create-voiceroom', async (roomId) => {
    await getOrCreateRouter(roomId)
  })

  // ─── JOIN ROOM ────────────────────────────────────────────────────────────
  socket.on('join-room', async ({ roomId, user, asSpeaker }, callback) => {
    try {
      if (!roomId || !user) return callback?.({ ok: false, error: 'Missing data' })

      const room = await Room.findById(roomId)
      if (!room) return callback?.({ ok: false, error: 'Room not found' })

      const isHost = room.host.toString() === user._id.toString()

      // Check if already in any role (handle reconnects gracefully)
      const isAlreadySpeaker = room.speaker.some(id => id.toString() === user._id.toString())
      const isAlreadyListener = room.listener.some(id => id.toString() === user._id.toString())

      socket.join(roomId)
      // socket.userId is already set by socketAuth middleware from the JWT

      const state = ensureRoom(roomId)

      let updatedRoom

      if (isHost) {
        // Host: just join the socket room, don't mutate DB arrays
        state.speakers.add(socket.id)
        console.log(`🎙️ Host "${user.username}" joined room ${roomId}`)
        updatedRoom = await getPopulatedRoom(roomId)

      } else if (asSpeaker || isAlreadySpeaker) {
        if (!canBecomeSpeaker(roomId) && !isAlreadySpeaker) {
          return callback?.({ ok: false, error: 'Max speakers reached (8)' })
        }
        state.speakers.add(socket.id)

        // Only add to DB if not already there
        updatedRoom = await Room.findByIdAndUpdate(
          roomId,
          { $addToSet: { speaker: user._id }, $pull: { listener: user._id } },
          { new: true }
        )
          .populate('host', 'username profile_Pic')
          .populate('speaker', 'username profile_Pic')
          .populate('listener', 'username profile_Pic')

        console.log(`🎤 Speaker "${user.username}" joined room ${roomId}`)

      } else {
        // Listener
        state.listeners.add(socket.id)

        updatedRoom = await Room.findByIdAndUpdate(
          roomId,
          { $addToSet: { listener: user._id } },
          { new: true }
        )
          .populate('host', 'username profile_Pic')
          .populate('speaker', 'username profile_Pic')
          .populate('listener', 'username profile_Pic')

        console.log(`👂 Listener "${user.username}" joined room ${roomId}`)
      }

      // Broadcast updated room data to everyone else
      socket.to(roomId).emit('room-data-update', updatedRoom)

      callback?.({ ok: true, roomdata: updatedRoom })

    } catch (error) {
      console.error("join-room error:", error)
      callback?.({ ok: false, error: 'Internal server error' })
    }
  })


  // ─── LEAVE ROOM (non-host) ────────────────────────────────────────────────
  socket.on('voiceroom:leave-room', async ({ roomId }) => {
    try {
      socket.leave(roomId)

      // Clean up mediasoup transports
      const entry = transportMap.get(socket.id)
      if (entry) {
        if (entry.sendTransport) entry.sendTransport.close()
        if (entry.recvTransport) entry.recvTransport.close()
        transportMap.delete(socket.id)
      }

      // Remove from DB
      const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        { $pull: { listener: socket.userId, speaker: socket.userId } },
        { new: true }
      )
        .populate('host', 'username profile_Pic')
        .populate('speaker', 'username profile_Pic')
        .populate('listener', 'username profile_Pic')

      // Notify others
      socket.to(roomId).emit('room-data-update', updatedRoom)

      // Clean up memory state
      const state = roomState.get(roomId)
      if (state) {
        state.speakers.delete(socket.id)
        state.listeners.delete(socket.id)
      }

      console.log(`🚪 User ${socket.userId} left room ${roomId}`)
    } catch (error) {
      console.error("voiceroom:leave-room error:", error)
    }
  })


  // ─── HOST CLOSES ROOM ─────────────────────────────────────────────────────
  socket.on('voiceroom:close-room', async ({ roomId }) => {
    try {
      const room = await Room.findById(roomId)
      if (!room) return

      const isHost = room.host.toString() === (socket.userId || '')
      if (!isHost) return // Only host can close the room

      // Notify ALL participants in the socket room that it's closed
      // This will cause clients to navigate away
      socket.to(roomId).emit('room-closed', { roomId, message: 'The host has ended the room.' })

      // Clean up mediasoup router
      if (roomRouter.has(roomId)) {
        const router = roomRouter.get(roomId)
        router.close()
        roomRouter.delete(roomId)
      }

      // Clean up memory state
      roomState.delete(roomId)

      // Delete from DB
      await Room.findByIdAndDelete(roomId)

      console.log(`🗑️ Room ${roomId} closed by host`)

    } catch (error) {
      console.error("voiceroom:close-room error:", error)
    }
  })


  // ─── REQUEST TO SPEAK (listener → host) ───────────────────────────────────
  socket.on('voiceroom:request-to-speak', async ({ roomId, user }) => {
    try {
      const room = await Room.findById(roomId)
      if (!room) return

      const state = ensureRoom(roomId)

      // Store the pending request
      state.pendingRequests.set(user._id.toString(), {
        user,
        socketId: socket.id,
      })

      // Find the host's socket and notify them
      const hostSocketId = userSocketMap.get(room.host.toString())
      if (hostSocketId) {
        socket.to(hostSocketId).emit('voiceroom:speaker-request', {
          requestingUser: user,
          roomId,
        })
      }

      console.log(`✋ "${user.username}" requested to speak in room ${roomId}`)
    } catch (error) {
      console.error("voiceroom:request-to-speak error:", error)
    }
  })


  // ─── HOST APPROVES SPEAKER REQUEST ────────────────────────────────────────
  socket.on('voiceroom:approve-speaker', async ({ roomId, userId }, callback) => {
    try {
      const room = await Room.findById(roomId)
      if (!room) return callback?.({ ok: false, error: 'Room not found' })

      const isHost = room.host.toString() === (socket.userId || '')
      if (!isHost) return callback?.({ ok: false, error: 'Not authorised' })

      const state = ensureRoom(roomId)
      const request = state.pendingRequests.get(userId.toString())

      if (!request) return callback?.({ ok: false, error: 'No pending request from this user' })

      // Move from listener → speaker in DB
      const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        {
          $addToSet: { speaker: userId },
          $pull: { listener: userId },
        },
        { new: true }
      )
        .populate('host', 'username profile_Pic')
        .populate('speaker', 'username profile_Pic')
        .populate('listener', 'username profile_Pic')

      // Update memory state for the approved user's socket
      if (request.socketId) {
        state.speakers.add(request.socketId)
        state.listeners.delete(request.socketId)
      }

      // Remove from pending
      state.pendingRequests.delete(userId.toString())

      // Tell the approved user they're now a speaker
      if (request.socketId) {
        socket.to(request.socketId).emit('voiceroom:you-are-approved', {
          roomId,
          roomdata: updatedRoom,
        })
      }

      // Broadcast updated room to everyone
      socket.to(roomId).emit('room-data-update', updatedRoom)
      socket.emit('room-data-update', updatedRoom) // also send to host

      console.log(`✅ Host approved ${userId} as speaker in room ${roomId}`)
      callback?.({ ok: true, roomdata: updatedRoom })

    } catch (error) {
      console.error("voiceroom:approve-speaker error:", error)
      callback?.({ ok: false, error: 'Internal server error' })
    }
  })


  // ─── HOST DENIES SPEAKER REQUEST ───────────────────────────────────────────
  socket.on('voiceroom:deny-speaker', async ({ roomId, userId }, callback) => {
    try {
      const state = ensureRoom(roomId)
      const request = state.pendingRequests.get(userId.toString())

      if (request?.socketId) {
        socket.to(request.socketId).emit('voiceroom:you-are-denied', { roomId })
      }

      state.pendingRequests.delete(userId.toString())
      callback?.({ ok: true })
    } catch (error) {
      console.error("voiceroom:deny-speaker error:", error)
    }
  })


  // ─── RTP CAPABILITIES ─────────────────────────────────────────────────────
  socket.on('voiceroom:get-rtp-capabilities', async ({ roomId }, callback) => {
    const router = await getOrCreateRouter(roomId)
    callback(router.rtpCapabilities)
  })


  // ─── CREATE WEBRTC TRANSPORT ──────────────────────────────────────────────
  socket.on('voiceroom:create-transport', async ({ roomId, direction }, callback) => {
    const router = await getOrCreateRouter(roomId)

    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: process.env.PUBLIC_IP || null }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    })

    let entry = transportMap.get(socket.id) || {}
    if (direction === 'send') {
      entry.sendTransport = transport
    } else {
      entry.recvTransport = transport
    }
    transportMap.set(socket.id, entry)

    callback({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    })
  })


  // ─── CONNECT TRANSPORT ────────────────────────────────────────────────────
  socket.on('voiceroom:connect-transport', async ({ direction, dtlsParameters }, callback) => {
    const entry = transportMap.get(socket.id)
    const transport = direction === 'send' ? entry?.sendTransport : entry?.recvTransport

    if (!transport) return callback({ ok: false, error: 'No transport found' })

    await transport.connect({ dtlsParameters })
    callback({ ok: true })
  })


  // ─── PRODUCE (mic) ───────────────────────────────────────────────────────
  socket.on('voiceroom:produce', async ({ kind, rtpParameters, roomId, appData }, callback) => {
    const entry = transportMap.get(socket.id)
    const sendTransport = entry?.sendTransport
    if (!sendTransport) return callback({ ok: false, error: 'No send transport' })

    const producer = await sendTransport.produce({ kind, rtpParameters, appData })

    producer.on('transportclose', () => {
      console.log('Producer transport closed')
      producer.close()
    })

    // Store producer in the entry so we can close it later
    entry.producer = producer
    transportMap.set(socket.id, entry)

    producer.appData = { ...producer.appData, roomId }

    socket.to(roomId).emit('voiceroom:new-producer', {
      producerId: producer.id,
      kind,
    })

    callback({ ok: true, id: producer.id })
  })


  // ─── CLOSE PRODUCER (muted/stepped down) ─────────────────────────────────
  socket.on('voiceroom:close-producer', async ({ roomId }) => {
    const entry = transportMap.get(socket.id)
    const producer = entry?.producer

    if (producer) {
      producer.close()
      socket.to(roomId).emit('voiceroom:producer-closed', {
        producerId: producer.id,
        socketId: socket.id,
      })
      entry.producer = null
      transportMap.set(socket.id, entry)
    }
  })


  // ─── CONSUME ──────────────────────────────────────────────────────────────
  socket.on('voiceroom:consume', async ({ roomId, producerId, rtpCapabilities }, cb) => {
    const router = await getOrCreateRouter(roomId)

    if (!router.canConsume({ producerId, rtpCapabilities })) {
      return cb({ error: 'cannot consume' })
    }

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


  // ─── DISCONNECT (cleanup on abrupt close) ────────────────────────────────
  socket.on('disconnecting', async () => {
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue // skip personal room

      try {
        const room = await Room.findById(roomId)
        if (!room) continue

        const isHost = room.host.toString() === (socket.userId || '')

        if (isHost) {
          // Host disconnected → close the entire room
          socket.to(roomId).emit('room-closed', {
            roomId,
            message: 'The host has left. The room is now closed.',
          })

          // Clean up router
          if (roomRouter.has(roomId)) {
            roomRouter.get(roomId).close()
            roomRouter.delete(roomId)
          }

          roomState.delete(roomId)
          await Room.findByIdAndDelete(roomId)
          console.log(`🗑️ Room ${roomId} auto-closed because host disconnected`)

        } else {
          // Regular user disconnected
          const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            { $pull: { listener: socket.userId, speaker: socket.userId } },
            { new: true }
          )
            .populate('host', 'username profile_Pic')
            .populate('speaker', 'username profile_Pic')
            .populate('listener', 'username profile_Pic')

          socket.to(roomId).emit('room-data-update', updatedRoom)

          const state = roomState.get(roomId)
          if (state) {
            state.speakers.delete(socket.id)
            state.listeners.delete(socket.id)
          }

          console.log(`🧹 User ${socket.userId} disconnected from room ${roomId}`)
        }
      } catch (err) {
        console.error(`disconnecting cleanup error for room ${roomId}:`, err)
      }
    }
  })

  socket.on('disconnect', () => {
    // Clean up transports
    const entry = transportMap.get(socket.id)
    if (entry) {
      if (entry.sendTransport) entry.sendTransport.close()
      if (entry.recvTransport) entry.recvTransport.close()
      transportMap.delete(socket.id)
    }

    // Clean up memory room state
    for (const [, state] of roomState.entries()) {
      state.speakers.delete(socket.id)
      state.listeners.delete(socket.id)
    }
  })
}

export default voiceRoomLogic
