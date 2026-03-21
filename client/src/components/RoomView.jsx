import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../socket/SocketContext.jsx'
import axiosInstance from '../configs/axios.js'
import { useAuth } from '../auth/AuthContext.jsx'
import * as mediasoupClient from 'mediasoup-client'
import SpeakerRequestPanel from './SpeakerRequestPanel.jsx'

// ─── SVG ICON PRIMITIVES ──────────────────────────────────────────────────────
const Icon = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)
const Mic = ({ size = 20 }) => (
  <Icon size={size}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </Icon>
)
const MicOff = ({ size = 20 }) => (
  <Icon size={size}>
    <line x1="2" x2="22" y1="2" y2="22" />
    <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
    <path d="M5 10v2a7 7 0 0 0 12 5" />
    <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </Icon>
)
const Hand = ({ size = 20 }) => (
  <Icon size={size}>
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </Icon>
)
const LogOut = ({ size = 20 }) => (
  <Icon size={size}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icon>
)
const PhoneOff = ({ size = 20 }) => (
  <Icon size={size}>
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-5.99-5.99 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91" />
    <line x1="23" x2="1" y1="1" y2="23" />
  </Icon>
)
const Send = ({ size = 16 }) => (
  <Icon size={size}>
    <line x1="22" x2="11" y1="2" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Icon>
)

// ─── REMOTE AUDIO PLAYER ──────────────────────────────────────────────────────
const RemoteAudio = ({ stream }) => {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream
      ref.current.play().catch(e => console.error('Playback failed', e))
    }
  }, [stream])
  return <audio ref={ref} autoPlay style={{ display: 'none' }} />
}

// ─── AUDIO LEVEL HOOK ─────────────────────────────────────────────────────────
// Returns a 0–100 audio level from a MediaStream via Web Audio API
function useAudioLevel(stream, active) {
  const [level, setLevel] = useState(0)
  const rafRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const ctxRef = useRef(null)

  useEffect(() => {
    if (!active || !stream) { setLevel(0); return }

    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    const source = ctx.createMediaStreamSource(stream)
    source.connect(analyser)

    ctxRef.current = ctx
    analyserRef.current = analyser
    sourceRef.current = source

    const buf = new Uint8Array(analyser.frequencyBinCount)
    const tick = () => {
      analyser.getByteFrequencyData(buf)
      const avg = buf.reduce((a, b) => a + b, 0) / buf.length
      setLevel(Math.min(100, avg * 2.5)) // scale up to 0-100
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      source.disconnect()
      ctx.close()
    }
  }, [stream, active])

  return level
}

// ─── TOOLTIP ICON BUTTON ──────────────────────────────────────────────────────
const IconBtn = ({ onClick, disabled, tooltip, color, bg, border, size = 46, children, pulse }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      {hovered && tooltip && (
        <div style={{
          position: 'absolute', bottom: size + 10,
          left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(9,9,11,0.95)', border: '1px solid #27272a',
          color: '#e4e4e7', fontSize: 11, fontWeight: 600,
          padding: '4px 10px', borderRadius: 8, whiteSpace: 'nowrap',
          pointerEvents: 'none', zIndex: 30,
        }}>
          {tooltip}
        </div>
      )}
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: size, height: size, borderRadius: '50%',
          border: border || '1.5px solid transparent',
          background: bg || 'rgba(39,39,42,0.8)',
          color: disabled ? '#52525b' : (color || '#a1a1aa'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.18s ease',
          flexShrink: 0,
          transform: hovered && !disabled ? 'scale(1.08)' : 'scale(1)',
          boxShadow: pulse
            ? `0 0 0 4px rgba(168,85,247,0.25), 0 0 0 8px rgba(168,85,247,0.1)`
            : hovered && !disabled ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {children}
      </button>
    </div>
  )
}

// ─── STAGE SLOT ───────────────────────────────────────────────────────────────
const StageSlot = ({ person, isPersonHost, isMe }) => {
  if (!person) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          border: '1.5px dashed rgba(63,63,70,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(24,24,27,0.3)',
        }}>
          {/* Empty person silhouette */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(63,63,70,0.6)"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <span style={{ fontSize: 10, color: '#3f3f46', letterSpacing: '0.04em' }}>Open</span>
      </div>
    )
  }

  const borderColor = isPersonHost ? '#eab308' : isMe ? '#a855f7' : '#3f3f46'
  const glowColor = isPersonHost ? 'rgba(234,179,8,0.25)' : isMe ? 'rgba(168,85,247,0.25)' : 'transparent'
  const nameColor = isPersonHost ? '#fde68a' : isMe ? '#d8b4fe' : '#a1a1aa'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          border: `2px solid ${borderColor}`,
          boxShadow: `0 0 0 3px ${glowColor}`,
          overflow: 'hidden',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}>
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.username ?? person}`}
            alt="avatar"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
        {isPersonHost && (
          <span style={{
            position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
            background: '#eab308', color: '#000',
            fontSize: 7, fontWeight: 800,
            padding: '2px 6px', borderRadius: 9999,
            textTransform: 'uppercase', letterSpacing: '0.04em',
            whiteSpace: 'nowrap', border: '1.5px solid #0B0B0B',
          }}>HOST</span>
        )}
        {isMe && !isPersonHost && (
          <span style={{
            position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
            background: '#a855f7', color: '#fff',
            fontSize: 7, fontWeight: 800,
            padding: '2px 6px', borderRadius: 9999,
            textTransform: 'uppercase', letterSpacing: '0.04em',
            border: '1.5px solid #0B0B0B',
          }}>YOU</span>
        )}
      </div>
      <span style={{
        fontSize: 11, fontWeight: 500, color: nameColor,
        maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', textAlign: 'center',
      }}>
        {person.username ?? person}
      </span>
    </div>
  )
}

// ─── AUDIO LEVEL BAR (small VU meter shown under the mic button) ──────────────
const AudioLevelBar = ({ level }) => (
  <div style={{
    width: 46, height: 3, borderRadius: 2,
    background: 'rgba(39,39,42,0.6)',
    marginTop: 5, overflow: 'hidden',
  }}>
    <div style={{
      width: `${level}%`, height: '100%',
      background: level > 70 ? '#f87171' : level > 35 ? '#c084fc' : '#6ee7b7',
      borderRadius: 2, transition: 'width 0.05s linear, background 0.2s',
    }} />
  </div>
)

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const RoomView = () => {
  const { roomId } = useParams()
  const { socket } = useSocket()
  const { user } = useAuth()
  const navigate = useNavigate()

  // ── Mediasoup refs ──────────────────────────────────────────────────────────
  const deviceRef = useRef(null)
  const sendTransportRef = useRef(null)
  const recvTransportRef = useRef(null)
  const producerRef = useRef(null)
  const joinedRef = useRef(false)
  const chatEndRef = useRef(null)
  const micStreamRef = useRef(null)  // raw stream ref for cleanup
  const [micStream, setMicStream] = useState(null) // reactive copy for AudioContext

  // ── State ───────────────────────────────────────────────────────────────────
  const [roomDetails, setRoomDetails] = useState(null)
  const [joined, setJoined] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [remoteAudios, setRemoteAudios] = useState([])
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'System', text: 'Welcome to the room! 🎤', isSystem: true },
  ])
  const [message, setMessage] = useState('')
  const [speakerRequests, setSpeakerRequests] = useState([])
  const [notification, setNotification] = useState(null)

  // Audio level from the local mic (for VU meter) — micStream is reactive state
  const audioLevel = useAudioLevel(micStream, micOn && !isMuted)

  // ── Derived ─────────────────────────────────────────────────────────────────
  const hostId = roomDetails?.host?._id?.toString() ?? roomDetails?.host?.toString() ?? null
  const isHost = !!user && !!hostId && hostId === user._id.toString()

  const peopleOnStage = roomDetails
    ? [
      roomDetails.host,
      ...(roomDetails.speaker?.filter(s =>
        (s._id ?? s).toString() !== hostId
      ) ?? []),
    ].filter(Boolean)
    : []

  const speakerCount = (roomDetails?.host ? 1 : 0) + (roomDetails?.speaker?.length ?? 0)
  const listenerCount = roomDetails?.listener?.length ?? 0

  // ── Notification ────────────────────────────────────────────────────────────
  const showNotification = useCallback((type, text, duration = 3500) => {
    setNotification({ type, text })
    setTimeout(() => setNotification(null), duration)
  }, [])

  // ─── 1. Fetch room ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return
    axiosInstance.get(`/rooms/${roomId}`)
      .then(({ data }) => setRoomDetails(data))
      .catch(err => console.error('Error fetching room:', err))
  }, [roomId])

  // ─── 2. Join socket room ────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !roomId || !user || !roomDetails || joinedRef.current) return

    const amIHost =
      roomDetails.host?._id?.toString() === user._id.toString() ||
      roomDetails.host?.toString() === user._id.toString()

    const alreadySpeaker = roomDetails.speaker?.some(
      s => (s._id ?? s).toString() === user._id.toString()
    )
    const joinAsSpeaker = amIHost || alreadySpeaker

    socket.emit('join-room', { roomId, user, asSpeaker: joinAsSpeaker }, res => {
      if (res?.ok) {
        setJoined(true)
        setRoomDetails(res.roomdata)
        if (joinAsSpeaker) setIsSpeaker(true)
        joinedRef.current = true
      } else {
        showNotification('error', res?.error || 'Failed to join room')
      }
    })
  }, [socket, roomId, user, roomDetails, showNotification])

  // ─── 3. Socket event listeners ──────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return

    const onRoomUpdate = updated => {
      if (updated && typeof updated === 'object') setRoomDetails(updated)
    }
    const onRoomClosed = ({ message: msg }) => {
      showNotification('info', msg || 'The room has been closed.')
      setTimeout(() => navigate('/rooms'), 2500)
    }
    const onYouAreApproved = ({ roomdata }) => {
      setIsSpeaker(true)
      setRoomDetails(roomdata)
      setRequestSent(false)
      showNotification('success', '🎤 You\'ve been approved as a speaker!')
    }
    const onYouAreDenied = () => {
      setRequestSent(false)
      showNotification('error', 'Your request was declined.')
    }
    const onSpeakerRequest = ({ requestingUser, roomId: rid }) => {
      setSpeakerRequests(prev => {
        if (prev.find(r => r.user._id === requestingUser._id)) return prev
        return [...prev, { user: requestingUser, roomId: rid }]
      })
      showNotification('info', `✋ ${requestingUser.username} wants to speak`)
    }
    const onNewProducer = async ({ producerId, kind }) => {
      if (kind !== 'audio') return
      await loadDevice()
      await consumeProducer(producerId)
    }
    const onProducerClosed = ({ producerId }) => {
      setRemoteAudios(prev => prev.filter(a => a.producerId !== producerId))
    }

    // ── Room chat: receive messages from others ──────────────────────────────
    const onRoomChat = (msg) => {
      setChatMessages(prev => [...prev, msg])
    }

    socket.on('room-data-update', onRoomUpdate)
    socket.on('room-closed', onRoomClosed)
    socket.on('voiceroom:you-are-approved', onYouAreApproved)
    socket.on('voiceroom:you-are-denied', onYouAreDenied)
    socket.on('voiceroom:speaker-request', onSpeakerRequest)
    socket.on('voiceroom:new-producer', onNewProducer)
    socket.on('voiceroom:producer-closed', onProducerClosed)
    socket.on('voiceroom:chat-message', onRoomChat)

    return () => {
      socket.off('room-data-update', onRoomUpdate)
      socket.off('room-closed', onRoomClosed)
      socket.off('voiceroom:you-are-approved', onYouAreApproved)
      socket.off('voiceroom:you-are-denied', onYouAreDenied)
      socket.off('voiceroom:speaker-request', onSpeakerRequest)
      socket.off('voiceroom:new-producer', onNewProducer)
      socket.off('voiceroom:producer-closed', onProducerClosed)
      socket.off('voiceroom:chat-message', onRoomChat)
    }
  }, [socket, navigate, showNotification])

  // ─── 4. Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (joinedRef.current && socket) {
        socket.emit('voiceroom:leave-room', { roomId })
        joinedRef.current = false
      }
      cleanupMedia()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId])

  // ── Mediasoup helpers ───────────────────────────────────────────────────────
  const cleanupMedia = useCallback(() => {
    if (producerRef.current) {
      producerRef.current.track?.stop()
      producerRef.current.close()
      producerRef.current = null
    }
    micStreamRef.current?.getTracks().forEach(t => t.stop())
    micStreamRef.current = null
    setMicStream(null)   // stop the VU meter and release AudioContext
    sendTransportRef.current?.close(); sendTransportRef.current = null
    recvTransportRef.current?.close(); recvTransportRef.current = null
    setRemoteAudios([])
    setMicOn(false)
  }, [])

  const loadDevice = useCallback(async () => {
    if (!socket || deviceRef.current) return
    const rtpCaps = await new Promise(r =>
      socket.emit('voiceroom:get-rtp-capabilities', { roomId }, r)
    )
    const device = new mediasoupClient.Device()
    await device.load({ routerRtpCapabilities: rtpCaps })
    deviceRef.current = device
  }, [socket, roomId])

  const createSendTransport = useCallback(async () => {
    const device = deviceRef.current
    if (!device || !socket) return null
    const params = await new Promise(r =>
      socket.emit('voiceroom:create-transport', { roomId, direction: 'send' }, r)
    )
    const t = device.createSendTransport(params)
    t.on('connect', ({ dtlsParameters }, cb, eb) => {
      socket.emit('voiceroom:connect-transport', { direction: 'send', dtlsParameters }, res => {
        if (!res?.ok) return eb(new Error(res?.error)); cb()
      })
    })
    t.on('produce', ({ kind, rtpParameters, appData }, cb, eb) => {
      socket.emit('voiceroom:produce', { kind, rtpParameters, roomId, appData }, res => {
        if (!res?.ok || !res.id) return eb(new Error(res?.error)); cb({ id: res.id })
      })
    })
    sendTransportRef.current = t
    return t
  }, [socket, roomId])

  const createRecvTransport = useCallback(async () => {
    const device = deviceRef.current
    if (!device || !socket) return null
    const params = await new Promise(r =>
      socket.emit('voiceroom:create-transport', { roomId, direction: 'recv' }, r)
    )
    const t = device.createRecvTransport(params)
    t.on('connect', ({ dtlsParameters }, cb, eb) => {
      socket.emit('voiceroom:connect-transport', { direction: 'recv', dtlsParameters }, res => {
        if (!res?.ok) return eb(new Error(res?.error)); cb()
      })
    })
    recvTransportRef.current = t
    return t
  }, [socket, roomId])

  const consumeProducer = useCallback(async producerId => {
    const device = deviceRef.current
    if (!socket || !device) return
    let rt = recvTransportRef.current
    if (!rt) { rt = await createRecvTransport(); if (!rt) return }
    const data = await new Promise(r =>
      socket.emit('voiceroom:consume', { roomId, producerId, rtpCapabilities: device.rtpCapabilities }, r)
    )
    if (data?.error) return
    const consumer = await rt.consume({
      id: data.id, producerId, kind: data.kind, rtpParameters: data.rtpParameters,
    })
    setRemoteAudios(prev => [...prev, { id: consumer.id, producerId, stream: new MediaStream([consumer.track]) }])
  }, [socket, roomId, createRecvTransport])

  useEffect(() => { if (joined) loadDevice() }, [joined, loadDevice])

  // ── Handlers ────────────────────────────────────────────────────────────────
  const startMic = useCallback(async () => {
    try {
      if (!deviceRef.current) await loadDevice()
      let st = sendTransportRef.current
      if (!st) st = await createSendTransport()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream
      setMicStream(stream) // reactive: triggers the AudioContext hook
      const [track] = stream.getAudioTracks()
      const producer = await st.produce({ track })
      producerRef.current = producer
      setMicOn(true)
      setIsMuted(false)
    } catch {
      showNotification('error', 'Could not start mic. Check permissions.')
    }
  }, [loadDevice, createSendTransport, showNotification])

  const toggleMute = useCallback(async () => {
    if (!producerRef.current) return
    if (isMuted) { await producerRef.current.resume(); setIsMuted(false) }
    else { await producerRef.current.pause(); setIsMuted(true) }
  }, [isMuted])

  const handleRequestToSpeak = useCallback(() => {
    if (!socket || requestSent) return
    socket.emit('voiceroom:request-to-speak', { roomId, user })
    setRequestSent(true)
    showNotification('info', '✋ Request sent to the host!')
  }, [socket, roomId, user, requestSent, showNotification])

  const handleApprove = useCallback(reqUser => {
    if (!socket) return
    socket.emit('voiceroom:approve-speaker', { roomId, userId: reqUser._id }, res => {
      if (res?.ok) {
        setSpeakerRequests(prev => prev.filter(r => r.user._id !== reqUser._id))
        setRoomDetails(res.roomdata)
      }
    })
  }, [socket, roomId])

  const handleDeny = useCallback(reqUser => {
    if (!socket) return
    socket.emit('voiceroom:deny-speaker', { roomId, userId: reqUser._id }, () => {
      setSpeakerRequests(prev => prev.filter(r => r.user._id !== reqUser._id))
    })
  }, [socket, roomId])

  const handleCloseRoom = useCallback(async () => {
    if (!window.confirm('End the room for everyone?')) return
    cleanupMedia()
    socket?.emit('voiceroom:close-room', { roomId })
    try { await axiosInstance.delete(`/rooms/delete/${roomId}`) } catch { /* already gone */ }
    navigate('/rooms')
  }, [socket, roomId, navigate, cleanupMedia])

  const handleLeaveRoom = useCallback(() => {
    cleanupMedia()
    if (socket && joinedRef.current) {
      socket.emit('voiceroom:leave-room', { roomId })
      joinedRef.current = false
    }
    navigate('/rooms')
  }, [socket, roomId, navigate, cleanupMedia])

  // ── Chat: send message via socket so others can see it ──────────────────────
  const handleSendMessage = useCallback(e => {
    e.preventDefault()
    if (!message.trim() || !socket) return

    const msg = {
      id: Date.now(),
      user: user?.username || 'You',
      userId: user?._id,
      text: message.trim(),
      isSystem: false,
    }

    // Add to own chat immediately
    setChatMessages(prev => [...prev, msg])

    // Broadcast to everyone else in the room
    socket.emit('voiceroom:chat-message', { roomId, message: msg })

    setMessage('')
  }, [message, socket, roomId, user])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  // ── Loading state ────────────────────────────────────────────────────────────
  if (!roomDetails) {
    return (
      <div style={{
        display: 'flex', height: '100%', width: '100%',
        alignItems: 'center', justifyContent: 'center',
        background: '#0B0B0B', flexDirection: 'column', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid #1c1c1f', borderTopColor: '#a855f7',
          animation: 'rv-spin 0.8s linear infinite',
        }} />
        <p style={{ fontSize: 13, color: '#52525b', margin: 0, letterSpacing: '0.05em' }}>
          Joining room…
        </p>
        <style>{`@keyframes rv-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const toastPalette = {
    success: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', color: '#86efac' },
    error: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5' },
    info: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', color: '#d8b4fe' },
  }
  const tc = notification ? (toastPalette[notification.type] || toastPalette.info) : null

  return (
    <div style={{
      display: 'flex', height: '100%', width: '100%',
      background: '#0B0B0B', color: '#f4f4f5',
      overflow: 'hidden', position: 'relative',
    }}>

      {/* ── Toast ──────────────────────────────────────────────────────────────── */}
      {notification && tc && (
        <div style={{
          position: 'absolute', top: 14, left: '50%',
          transform: 'translateX(-50%)', zIndex: 9999,
          padding: '8px 20px', borderRadius: 10,
          background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color,
          fontSize: 13, fontWeight: 600, backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          animation: 'rv-toast 0.2s ease', whiteSpace: 'nowrap',
        }}>
          {notification.text}
        </div>
      )}

      {/* ── Speaker Request Panel (host-only floating popup) ──────────────────── */}
      {isHost && (
        <SpeakerRequestPanel
          requests={speakerRequests}
          onApprove={handleApprove}
          onDeny={handleDeny}
        />
      )}

      {/* ════════════════════════ LEFT PANEL ════════════════════════════════════ */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        borderRight: '1px solid #1c1c1f', minWidth: 0,
      }}>

        {/* Header */}
        <header style={{
          padding: '12px 20px', borderBottom: '1px solid #1c1c1f',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: '-0.02em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {roomDetails.title || 'Voice Room'}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {speakerCount} speaking · {listenerCount} listening
            </p>
          </div>
          {/* Role pill */}
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 9999,
            textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0,
            background: isHost ? 'rgba(234,179,8,0.12)' : isSpeaker ? 'rgba(168,85,247,0.12)' : 'rgba(39,39,42,0.6)',
            color: isHost ? '#fde68a' : isSpeaker ? '#d8b4fe' : '#71717a',
            border: `1px solid ${isHost ? 'rgba(234,179,8,0.25)' : isSpeaker ? 'rgba(168,85,247,0.25)' : 'rgba(63,63,70,0.4)'}`,
          }}>
            {isHost ? 'Host' : isSpeaker ? 'Speaker' : 'Listening'}
          </span>
        </header>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>

          {/* ── Stage grid: always 4 columns × 2 rows ─────────────────────── */}
          <section style={{ marginBottom: 24 }}>
            <p style={{
              fontSize: 10, fontWeight: 700, color: '#3f3f46',
              textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 14px',
            }}>On Stage</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 80px)', // FIXED 4 columns
              gridTemplateRows: 'repeat(2, auto)',    // FIXED 2 rows
              gap: '20px 16px',
            }}>
              {Array.from({ length: 8 }).map((_, i) => {
                const person = peopleOnStage[i]
                const isPersonHost = person
                  ? (person._id?.toString() ?? person?.toString()) === hostId
                  : false
                const isMe = person
                  ? (person._id?.toString() ?? person?.toString()) === user?._id?.toString()
                  : false
                return (
                  <StageSlot
                    key={person?._id ?? `empty-${i}`}
                    person={person}
                    isPersonHost={isPersonHost}
                    isMe={isMe}
                  />
                )
              })}
            </div>
          </section>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(39,39,42,0.5)', margin: '0 0 18px' }} />

          {/* Audience */}
          <section>
            <p style={{
              fontSize: 10, fontWeight: 700, color: '#3f3f46',
              textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px',
            }}>
              Audience {listenerCount > 0 ? `· ${listenerCount}` : ''}
            </p>
            {listenerCount === 0 ? (
              <p style={{ fontSize: 12, color: '#3f3f46', margin: 0 }}>No one listening yet</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {roomDetails.listener?.map(u => (
                  <div key={u._id ?? u} title={u.username ?? '…'} style={{
                    width: 38, height: 38, borderRadius: '50%',
                    border: '1.5px solid #27272a', overflow: 'hidden',
                    background: '#18181b', flexShrink: 0,
                  }}>
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username ?? u}`}
                      alt={u.username}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Controls footer ─────────────────────────────────────────────────── */}
        <footer style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12,
          padding: '14px 20px 16px',
          borderTop: '1px solid #1c1c1f',
          background: 'rgba(9,9,11,0.7)',
          backdropFilter: 'blur(16px)',
          flexShrink: 0,
        }}>

          {/* MIC + VU meter wrapper */}
          {(isHost || isSpeaker) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              {!micOn ? (
                <IconBtn
                  onClick={startMic}
                  tooltip="Go Live"
                  color="#c084fc"
                  bg="rgba(168,85,247,0.12)"
                  border="1.5px solid rgba(168,85,247,0.3)"
                >
                  <Mic size={20} />
                </IconBtn>
              ) : (
                <IconBtn
                  onClick={toggleMute}
                  tooltip={isMuted ? 'Unmute' : 'Mute'}
                  color={isMuted ? '#f87171' : '#c084fc'}
                  bg={isMuted ? 'rgba(239,68,68,0.12)' : 'rgba(168,85,247,0.12)'}
                  border={`1.5px solid ${isMuted ? 'rgba(239,68,68,0.3)' : 'rgba(168,85,247,0.3)'}`}
                  pulse={micOn && !isMuted}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </IconBtn>
              )}
              {/* Audio level VU bar — visible only when mic is live */}
              {micOn && <AudioLevelBar level={isMuted ? 0 : audioLevel} />}
            </div>
          )}

          {/* RAISE HAND — listener only */}
          {!isHost && !isSpeaker && (
            <IconBtn
              onClick={handleRequestToSpeak}
              disabled={requestSent}
              tooltip={requestSent ? 'Request Pending…' : 'Request to Speak'}
              color={requestSent ? '#52525b' : '#c084fc'}
              bg={requestSent ? 'rgba(39,39,42,0.3)' : 'rgba(168,85,247,0.12)'}
              border={`1.5px solid ${requestSent ? 'rgba(63,63,70,0.3)' : 'rgba(168,85,247,0.3)'}`}
            >
              <Hand size={20} />
            </IconBtn>
          )}

          <div style={{ width: 1, height: 26, background: '#27272a', alignSelf: 'center', margin: '0 2px' }} />

          {/* LEAVE / END */}
          {!isHost ? (
            <IconBtn
              onClick={handleLeaveRoom}
              tooltip="Leave Room"
              color="#a1a1aa"
              bg="rgba(39,39,42,0.5)"
              border="1.5px solid rgba(63,63,70,0.5)"
            >
              <LogOut size={19} />
            </IconBtn>
          ) : (
            <IconBtn
              onClick={handleCloseRoom}
              tooltip="End Room"
              color="#f87171"
              bg="rgba(239,68,68,0.1)"
              border="1.5px solid rgba(239,68,68,0.25)"
            >
              <PhoneOff size={19} />
            </IconBtn>
          )}

          {/* Hidden remote audio elements */}
          {remoteAudios.map(a => <RemoteAudio key={a.id} stream={a.stream} />)}
        </footer>
      </div>

      {/* ════════════════════════ RIGHT: LIVE CHAT ══════════════════════════════ */}
      <aside style={{
        width: 290, display: 'flex', flexDirection: 'column',
        background: 'rgba(10,10,12,0.8)', flexShrink: 0,
      }}>
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid #1c1c1f',
          fontSize: 10, fontWeight: 800, color: '#3f3f46',
          textTransform: 'uppercase', letterSpacing: '0.14em', flexShrink: 0,
        }}>
          Live Chat
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {chatMessages.map(m => (
            <div key={m.id} style={{
              background: m.isSystem ? 'transparent' : 'rgba(255,255,255,0.025)',
              borderRadius: 8, padding: m.isSystem ? 0 : '6px 10px',
              lineHeight: 1.5,
            }}>
              <span style={{
                fontWeight: 700, marginRight: 5, fontSize: 12,
                color: m.isSystem ? '#60a5fa' : m.userId === user?._id ? '#c084fc' : '#a78bfa',
              }}>
                {m.user}
              </span>
              <span style={{ fontSize: 13, color: m.isSystem ? '#71717a' : '#d4d4d8' }}>
                {m.text}
              </span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} style={{
          padding: '10px 12px', borderTop: '1px solid #1c1c1f',
          display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0,
        }}>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Say something…"
            style={{
              flex: 1, background: '#18181b',
              border: '1px solid #27272a', borderRadius: 10,
              padding: '8px 12px', fontSize: 13, color: '#f4f4f5',
              outline: 'none', minWidth: 0,
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(168,85,247,0.5)' }}
            onBlur={e => { e.target.style.borderColor = '#27272a' }}
          />
          <button type="submit" disabled={!message.trim()} style={{
            width: 34, height: 34, borderRadius: '50%', border: 'none', flexShrink: 0,
            background: message.trim() ? 'rgba(168,85,247,0.2)' : 'rgba(39,39,42,0.4)',
            color: message.trim() ? '#c084fc' : '#3f3f46',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: message.trim() ? 'pointer' : 'default',
            transition: 'all 0.15s',
          }}>
            <Send size={14} />
          </button>
        </form>
      </aside>

      <style>{`
        @keyframes rv-toast {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default RoomView
