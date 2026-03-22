import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../socket/SocketContext.jsx'
import axiosInstance from '../configs/axios.js'
import { useAuth } from '../auth/AuthContext.jsx'
import * as mediasoupClient from 'mediasoup-client'
import BroadcasterRequestPanel from './BroadcasterRequestPanel.jsx'

// ─── SVG ICONS ──────────────────────────────────────────────────────────────
const Icon = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)
const VideoIcon = () => <Icon><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></Icon>
const VideoOff = () => <Icon><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" /><line x1="1" y1="1" x2="23" y2="23" /></Icon>
const MicIcon = () => <Icon><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></Icon>
const MicOff = () => <Icon><line x1="2" x2="22" y1="2" y2="22" /><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" /><path d="M5 10v2a7 7 0 0 0 12 5" /><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12" /><line x1="12" x2="12" y1="19" y2="22" /></Icon>
const Hand = () => <Icon><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></Icon>
const LogOut = () => <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon>
const PhoneOff = () => <Icon><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-5.99-5.99 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91" /><line x1="23" x2="1" y1="1" y2="23" /></Icon>
const Send = () => <Icon size={16}><line x1="22" x2="11" y1="2" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Icon>

// ─── ICON BUTTON ──────────────────────────────────────────────────────────────
const IconBtn = ({ onClick, disabled, tooltip, color, bg, border, size = 46, children, pulse }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      {hovered && tooltip && (
        <div style={{
          position: 'absolute', bottom: size + 10,
          background: 'rgba(9,9,11,0.95)', border: '1px solid #27272a',
          color: '#e4e4e7', fontSize: 11, fontWeight: 600,
          padding: '4px 10px', borderRadius: 8, whiteSpace: 'nowrap',
          pointerEvents: 'none', zIndex: 30,
        }}>
          {tooltip}
        </div>
      )}
      <button
        onClick={onClick} disabled={disabled}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
          width: size, height: size, borderRadius: '50%',
          border: border || '1.5px solid transparent',
          background: bg || 'rgba(39,39,42,0.8)',
          color: disabled ? '#52525b' : (color || '#a1a1aa'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.18s ease',
          transform: hovered && !disabled ? 'scale(1.08)' : 'scale(1)',
          boxShadow: pulse ? `0 0 0 4px rgba(168,85,247,0.25)` : 'none',
        }}
      >
        {children}
      </button>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const LiveRoomView = () => {
  const { roomId } = useParams()
  const { socket } = useSocket()
  const { user } = useAuth()
  const navigate = useNavigate()

  // ── Mediasoup refs
  const deviceRef = useRef(null)
  const sendTransportRef = useRef(null)
  const recvTransportRef = useRef(null)
  const audioProducerRef = useRef(null)
  const videoProducerRef = useRef(null)
  const joinedRef = useRef(false)
  const chatEndRef = useRef(null)

  // Streams
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState({}) // userId -> MediaStream

  // UI State
  const [roomDetails, setRoomDetails] = useState(null)
  const [joined, setJoined] = useState(false)
  const [isBroadcaster, setIsBroadcaster] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [micMuted, setMicMuted] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [chatMessages, setChatMessages] = useState([{ id: 1, user: 'System', text: 'Welcome to Live Video Room! 🎥', isSystem: true }])
  const [message, setMessage] = useState('')
  const [broadcasterRequests, setBroadcasterRequests] = useState([])
  const [notification, setNotification] = useState(null)

  const showNotification = useCallback((type, text, duration = 3500) => {
    setNotification({ type, text }); setTimeout(() => setNotification(null), duration)
  }, [])

  // Basic Derived Info
  const hostId = roomDetails?.host?._id?.toString() ?? roomDetails?.host?.toString()
  const isHost = !!user && hostId === user._id.toString()
  const broadcastersRaw = roomDetails ? [roomDetails.host, ...(roomDetails.speaker || [])].filter(Boolean) : []
  const broadcasters = Array.from(new Map(broadcastersRaw.map(b => [(b._id || b).toString(), b])).values());

  // 1. Fetch Room Details
  useEffect(() => {
    if (!roomId) return
    axiosInstance.get(`/rooms/${roomId}`).then(({ data }) => setRoomDetails(data))
  }, [roomId])

  // 2. Join Socket
  useEffect(() => {
    if (!socket || !roomId || !user || !roomDetails || joinedRef.current) return
    const amIHost = roomDetails.host?._id?.toString() === user._id.toString()
    const alreadyBroadcaster = roomDetails.speaker?.some(s => s._id.toString() === user._id.toString())
    const joinAsBroadcaster = amIHost || alreadyBroadcaster

    socket.emit('join-room', { roomId, user, asBroadcaster: joinAsBroadcaster }, res => {
      if (res?.ok) {
        setJoined(true); setRoomDetails(res.roomdata); if (joinAsBroadcaster) setIsBroadcaster(true); joinedRef.current = true
      }
    })
  }, [socket, roomId, user, roomDetails])

  // 3. Socket Event Listeners
  useEffect(() => {
    if (!socket) return
    const onNewProducer = async ({ producerId, kind, userId }) => {
      await loadDevice()
      await consumeProducer(producerId, userId)
    }

    socket.on('room-data-update', setRoomDetails)
    socket.on('room-closed', () => { showNotification('info', 'Room closed by host'); navigate('/rooms') })
    socket.on('liveroom:you-are-approved', ({ roomdata }) => { setIsBroadcaster(true); setRoomDetails(roomdata); showNotification('success', 'You are live!') })
    socket.on('liveroom:broadcaster-request', ({ requestingUser, roomId }) => setBroadcasterRequests(p => [...p, { user: requestingUser, roomId }]))
    socket.on('liveroom:new-producer', onNewProducer)
    socket.on('liveroom:chat-message', msg => setChatMessages(p => [...p, msg]))

    return () => socket.off() // Cleanup all
  }, [socket, roomId, navigate])

  // 4. Mediasoup Operations
  const loadDevice = useCallback(async () => {
    if (!socket || deviceRef.current) return
    const rtpCaps = await new Promise(r => socket.emit('liveroom:get-rtp-capabilities', { roomId }, r))
    const device = new mediasoupClient.Device()
    await device.load({ routerRtpCapabilities: rtpCaps })
    deviceRef.current = device

    // Fetch existing producers
    socket.emit('liveroom:get-producers', { roomId }, async (producers) => {
      for (const p of producers) {
        if (p.userId) {
          await consumeProducer(p.producerId, p.userId)
        }
      }
    })
  }, [socket, roomId])

  const createTransports = useCallback(async () => {
    if (!deviceRef.current) await loadDevice()
    const device = deviceRef.current

    // Send Transport (for camera/mic)
    const sendParams = await new Promise(r => socket.emit('liveroom:create-transport', { roomId, direction: 'send' }, r))
    const sTransport = device.createSendTransport(sendParams)
    sTransport.on('connect', ({ dtlsParameters }, cb, eb) => socket.emit('liveroom:connect-transport', { direction: 'send', dtlsParameters }, res => res?.ok ? cb() : eb(new Error())))
    sTransport.on('produce', ({ kind, rtpParameters, appData }, cb, eb) => socket.emit('liveroom:produce', { kind, rtpParameters, roomId, appData }, res => res?.ok ? cb({ id: res.id }) : eb(new Error())))
    sendTransportRef.current = sTransport

    // Recv Transport (for hearing/seeing others)
    const recvParams = await new Promise(r => socket.emit('liveroom:create-transport', { roomId, direction: 'recv' }, r))
    const rTransport = device.createRecvTransport(recvParams)
    rTransport.on('connect', ({ dtlsParameters }, cb, eb) => socket.emit('liveroom:connect-transport', { direction: 'recv', dtlsParameters }, res => res?.ok ? cb() : eb(new Error())))
    recvTransportRef.current = rTransport
  }, [socket, roomId, loadDevice])

  const consumeProducer = useCallback(async (producerId, remoteUserId) => {
    if (!recvTransportRef.current) await createTransports()
    const data = await new Promise(r => socket.emit('liveroom:consume', { roomId, producerId, rtpCapabilities: deviceRef.current.rtpCapabilities }, r))
    if (data?.error) return

    const consumer = await recvTransportRef.current.consume({ id: data.id, producerId, kind: data.kind, rtpParameters: data.rtpParameters })

    setRemoteStreams(prev => {
      const newStreams = { ...prev }
      if (!newStreams[remoteUserId]) newStreams[remoteUserId] = new MediaStream()
      newStreams[remoteUserId].addTrack(consumer.track)
      return newStreams
    })
  }, [socket, roomId, createTransports])

  useEffect(() => { if (joined) loadDevice() }, [joined, loadDevice])

  // 5. User Actions
  const toggleCamera = async () => {
    try {
      if (cameraOn) {
        audioProducerRef.current?.close(); videoProducerRef.current?.close()
        socket.emit('liveroom:close-producer', { roomId })
        localStream?.getTracks().forEach(t => t.stop())
        setLocalStream(null); setCameraOn(false); return
      }

      if (!sendTransportRef.current) await createTransports()
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(stream)

      const audioTrack = stream.getAudioTracks()[0]
      const videoTrack = stream.getVideoTracks()[0]

      if (audioTrack) audioProducerRef.current = await sendTransportRef.current.produce({ track: audioTrack, appData: { userId: user._id } })
      if (videoTrack) videoProducerRef.current = await sendTransportRef.current.produce({ track: videoTrack, appData: { userId: user._id } })

      setCameraOn(true)
      setMicMuted(false)
    } catch (err) { showNotification('error', 'Camera access denied') }
  }

  const toggleMic = async () => {
    if (!audioProducerRef.current) return
    if (micMuted) {
      await audioProducerRef.current.resume()
      setMicMuted(false)
    } else {
      await audioProducerRef.current.pause()
      setMicMuted(true)
    }
  }

  const handleCloseHost = () => { socket.emit('liveroom:close-room', { roomId }); navigate('/rooms') }
  const handleLeave = () => { socket.emit('liveroom:leave-room', { roomId }); navigate('/rooms') }

  // Cleanup
  useEffect(() => {
    return () => { localStream?.getTracks().forEach(t => t.stop()); socket?.emit('liveroom:leave-room', { roomId }) }
  }, [localStream])

  // Video Element Ref helper
  const VideoElement = ({ stream, isMe }) => {
    const ref = useRef()
    useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream }, [stream])
    return (
      <video ref={ref} autoPlay playsInline muted={isMe}
        style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#0B0B0B' }}
      />
    )
  }

  // Calculate layout
  const gridCount = broadcasters.length || 1
  let cols = 1, rows = 1
  if (gridCount === 2) { cols = 2; rows = 1 }
  else if (gridCount > 2 && gridCount <= 4) { cols = 2; rows = 2 }
  else if (gridCount > 4 && gridCount <= 6) { cols = 3; rows = 2 }
  else if (gridCount > 6) { cols = 4; rows = 2 }

  if (!roomDetails) return <div className="h-full w-full bg-[#0B0B0B]" />

  return (
    <div className="flex h-full w-full bg-[#0B0B0B] text-zinc-100 font-sans relative">
      {isHost && <BroadcasterRequestPanel requests={broadcasterRequests} onApprove={u => { socket.emit('liveroom:approve-broadcaster', { roomId, userId: u._id }, res => { if (res.ok) setRoomDetails(res.roomdata); setBroadcasterRequests(p => p.filter(r => r.user._id !== u._id)) }) }} onDeny={u => { socket.emit('liveroom:deny-broadcaster', { roomId, userId: u._id }); setBroadcasterRequests(p => p.filter(r => r.user._id !== u._id)) }} />}

      {/* Main Video Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-5 py-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
          <h1 className="text-lg font-bold truncate">{roomDetails.title}</h1>
          <span className="px-3 py-1 bg-red-500/10 text-red-500 font-bold tracking-widest text-xs uppercase rounded-full border border-red-500/20">LIVE</span>
        </header>

        <div className="flex-1 p-4 flex items-center justify-center overflow-hidden">
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 12, width: '100%', height: '100%' }}>
            {broadcasters.map(b => {
              const uId = b._id || b
              const isMe = uId === user._id
              const stream = isMe ? localStream : remoteStreams[uId]

              return (
                <div key={uId} className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl flex items-center justify-center">
                  {stream ? <VideoElement stream={stream} isMe={isMe} /> : (
                    <div className="flex flex-col items-center">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${b.username}`} className="w-24 h-24 mb-4 rounded-full border-4 border-zinc-800" />
                      <span className="text-zinc-500 font-medium">Camera Off</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold font-mono">
                    {b.username} {isMe && '(You)'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Controls */}
        <footer className="h-20 bg-zinc-950 border-t border-zinc-800 flex items-center justify-center gap-4">
          {(isHost || isBroadcaster) && (
            <>
              <IconBtn onClick={toggleCamera} bg={cameraOn ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'} color={cameraOn ? '#4ade80' : '#f87171'} border={cameraOn ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)'} tooltip={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}>
                {cameraOn ? <VideoIcon /> : <VideoOff />}
              </IconBtn>

              <IconBtn onClick={toggleMic} disabled={!cameraOn} bg={!micMuted && cameraOn ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'} color={!micMuted && cameraOn ? '#4ade80' : '#f87171'} border={!micMuted && cameraOn ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)'} tooltip={micMuted || !cameraOn ? 'Unmute' : 'Mute'}>
                {micMuted || !cameraOn ? <MicOff /> : <MicIcon />}
              </IconBtn>
            </>
          )}

          {!isHost && !isBroadcaster && (
            <IconBtn onClick={() => { socket.emit('liveroom:request-to-speak', { roomId, user }); setRequestSent(true) }} disabled={requestSent} tooltip={requestSent ? 'Pending' : 'Request to Speak'}>
              <Hand />
            </IconBtn>
          )}

          {isHost ? (
            <IconBtn onClick={handleCloseHost} color="#ef4444" bg="rgba(239,68,68,0.1)" tooltip="End Live">
              <LogOut />
            </IconBtn>
          ) : (
            <IconBtn onClick={handleLeave} color="#ef4444" bg="rgba(239,68,68,0.1)" tooltip="Leave Room">
              <PhoneOff />
            </IconBtn>
          )}
        </footer>
      </div>

      {/* Chat Sidebar */}
      <div className="w-80 bg-zinc-950 border-l border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800"><h3 className="font-bold">Live Chat</h3></div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
          {chatMessages.map((m, i) => (
            <div key={i} className={`p-3 rounded-xl text-sm ${m.isSystem ? 'bg-zinc-900 text-zinc-400 text-center italic' : m.user === user.username ? 'bg-blue-600/20 border border-blue-500/20 text-blue-100 self-end ml-4' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 mr-4'}`}>
              {!m.isSystem && m.user !== user.username && <div className="text-xs font-bold text-zinc-500 mb-1">{m.user}</div>}
              {m.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={e => { e.preventDefault(); if (!message) return; const msg = { user: user.username, text: message, isSystem: false }; setChatMessages(p => [...p, msg]); socket.emit('liveroom:chat-message', { roomId, message: msg }); setMessage('') }} className="p-3 border-t border-zinc-800 flex">
          <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          <button type="submit" className="ml-2 w-10 h-10 bg-blue-600 hover:bg-blue-500 flex items-center justify-center rounded-lg text-white"><Send /></button>
        </form>
      </div>

    </div>
  )
}

export default LiveRoomView
