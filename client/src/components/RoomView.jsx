import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../socket/SocketContext.jsx'
import axiosInstance from '../configs/axios.js'
import { useAuth } from '../auth/AuthContext.jsx'
import * as mediasoupClient from 'mediasoup-client'

const RoomView = () => {
  const { roomId } = useParams()
  const { socket } = useSocket()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Voice States
  const deviceRef = useRef(null)
  const sendTransportRef = useRef(null)
  const recvTransportRef = useRef(null)
  const chatEndRef = useRef(null)
  const producerRef = useRef(null)
  const joinedRef = useRef(false)

  const [remoteAudios, setRemoteAudios] = useState([])
  const [joined, setJoined] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [micOn, setMicOn] = useState(false) // Added missing state
  const [message, setMessage] = useState('')
  const [roomDetails, setRoomDetails] = useState({})
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'System', text: 'Welcome to the voice room! 🎤', isSystem: true },
  ])

  // 1. Get current user status
  const hostId = roomDetails?.host?._id || roomDetails?.host;
  const speakerIds = roomDetails?.speaker?.filter(s => {
    const sId = s._id || s;
    return sId !== hostId;
  }) || []

  const asSpeaker = hostId === user?._id || speakerIds.includes(user?._id);
  const isHost = hostId === user?._id;
  const isListerner = roomDetails.listener

  // 2. Create the "On Stage" list for the 8-slot grid
  // We put the host first, then add the other speakers
  const peopleOnStage = [
    roomDetails?.host,
    ...speakerIds
  ].filter(Boolean);


  const toggleMute = useCallback(async () => {
    if (!producerRef.current) return

    if (isMuted) {
      await producerRef.current.resume()
      setIsMuted(false)
    } else {
      await producerRef.current.pause()
      setIsMuted(true)
    }
  }, [isMuted, roomId, socket])


  // --- API & SOCKET EFFECTS ---
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await axiosInstance.get(`/rooms/${roomId}`)
        setRoomDetails(data)
        // console.log(data)
      } catch (err) { console.error("Error fetching room:", err) }
    }
    if (roomId) fetchRoom()
  }, [roomId])


  useEffect(() => {
    if (!roomId || !socket || !user || joinedRef.current) return

    socket.emit('join-room', { roomId, user, asSpeaker }, (res) => {
      if (res?.ok)
        setJoined(true)
      joinedRef.current = true
    })

    socket.on('room-data-update', (updatedRoom) => setRoomDetails(updatedRoom))

    return () => {
      if (joinedRef.current) {
        socket.emit('voiceroom:leave-room', { roomId })
        joinedRef.current = false
      }
      socket.off('room-data-update')
    };
  }, [socket, roomId, user, asSpeaker, joined])


  useEffect(() => {
    if (!socket) return;

    const handleProducerClosed = ({ producerId }) => {
      console.log("Remote producer closed:", producerId);

      // Remove the audio stream from state
      setRemoteAudios((prev) => prev.filter((audio) => audio.producerId !== producerId));
    };

    socket.on('voiceroom:producer-closed', handleProducerClosed);

    return () => {
      socket.off('voiceroom:producer-closed', handleProducerClosed);
    };
  }, [socket]);

  // 2) Load mediasoup Device (once)
  const loadDevice = useCallback(async () => {
    if (!socket || deviceRef.current) return;

    const rtpCapabilities = await new Promise((resolve) => {
      socket.emit('voiceroom:get-rtp-capabilities', { roomId }, resolve);
    });

    const device = new mediasoupClient.Device(); // [web:31]
    await device.load({ routerRtpCapabilities: rtpCapabilities });
    deviceRef.current = device;


  }, [socket, roomId]);

  // 3) Create send transport (for mic)
  const createSendTransport = useCallback(async () => {
    const device = deviceRef.current;
    if (!device || !socket) return null;

    const params = await new Promise((resolve) => {
      socket.emit(
        'voiceroom:create-transport',
        { roomId, direction: 'send' },
        resolve
      );
    });

    const transport = device.createSendTransport(params); // [web:31][web:54]

    transport.on(
      'connect',
      ({ dtlsParameters }, callback, errback) => {
        socket.emit(
          'voiceroom:connect-transport',
          { direction: 'send', dtlsParameters },
          (res) => {
            if (!res?.ok) {
              return errback(new Error(res?.error || 'connect failed'));
            }
            callback();
          }
        );
      }
    );

    transport.on(
      'produce',
      ({ kind, rtpParameters, appData }, callback, errback) => {
        socket.emit(
          'voiceroom:produce',
          { kind, rtpParameters, roomId, appData },
          (res) => {
            if (!res?.ok || !res.id) {
              return errback(new Error(res?.error || 'produce failed'));
            }
            callback({ id: res.id });
          }
        );
      }
    );

    sendTransportRef.current = transport;
    return transport;
  }, [socket, roomId]);

  // 4) Create recv transport (for listening)
  const createRecvTransport = useCallback(async () => {
    const device = deviceRef.current;
    if (!device || !socket) return null;

    const params = await new Promise((resolve) => {
      socket.emit(
        'voiceroom:create-transport',
        { roomId, direction: 'recv' },
        resolve
      );
    });

    const transport = device.createRecvTransport(params); // [web:31]

    transport.on(
      'connect',
      ({ dtlsParameters }, callback, errback) => {
        socket.emit(
          'voiceroom:connect-transport',
          { direction: 'recv', dtlsParameters },
          (res) => {
            if (!res?.ok) {
              return errback(new Error(res?.error || 'connect recv failed'));
            }
            callback();
          }
        );
      }
    );

    recvTransportRef.current = transport;
    return transport;
  }, [socket, roomId]);



  // 5) Start microphone for speakers

  const startMic = useCallback(async () => {
    try {
      const device = deviceRef.current;
      if (!socket || !device) return;

      let sendTransport = sendTransportRef.current;
      if (!sendTransport) {
        sendTransport = await createSendTransport();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const [track] = stream.getAudioTracks();

      // The state only changes if this line succeeds
      const producer = await sendTransport.produce({ track });
      producerRef.current = producer;

      setMicOn(true); // Now the button will change to "Mute/Unmute"
      setIsMuted(false);
    } catch (err) {
      console.error("Go Live Failed:", err);
      alert("Could not start microphone. Check permissions.");
    }
  }, [socket, createSendTransport]);


  // 6) Consume new producer
  const consumeProducer = useCallback(
    async (producerId) => {
      const device = deviceRef.current;
      if (!socket || !device) return;

      let recvTransport = recvTransportRef.current;
      if (!recvTransport) {
        recvTransport = await createRecvTransport();
        if (!recvTransport) return;
      }

      const data = await new Promise((resolve) => {
        socket.emit(
          'voiceroom:consume',
          {
            roomId,
            producerId,
            rtpCapabilities: device.rtpCapabilities,
          },
          resolve
        );
      });

      if (data?.error) {
        console.error('consume error', data.error);
        return;
      }

      const { id, kind, rtpParameters } = data;

      const consumer = await recvTransport.consume({
        id,
        producerId,
        kind,
        rtpParameters,
      }); // [web:31]

      const stream = new MediaStream([consumer.track]);
      setRemoteAudios((prev) => [...prev, { id: consumer.id, producerId: producerId, stream: stream }]);
    },
    [socket, roomId, createRecvTransport]
  );

  // 7) Listen to server 'voice:new-producer'
  useEffect(() => {
    if (!socket || !joined) return;

    const handler = async ({ producerId, kind }) => {
      if (kind !== 'audio') return;
      await loadDevice();
      await consumeProducer(producerId);
    };

    socket.on('voiceroom:new-producer', handler);
    return () => {
      socket.off('voiceroom:new-producer', handler);
    };
  }, [socket, joined, loadDevice, consumeProducer]);

  // Auto-load device when joined
  useEffect(() => {
    if (joined) {
      loadDevice();
    }
  }, [joined, loadDevice]);


  // --- HANDLERS ---
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setChatMessages(prev => [...prev, { id: Date.now(), user: 'You', text: message, isSystem: false }])
    setMessage('')
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])


  const handleLeaveRoom = useCallback(async () => {

    const confirmClose = window.confirm("Are you sure? This will end the room for everyone.");
    if (!confirmClose) return;

    if (producerRef.current) {
      producerRef.current.track?.stop();
      producerRef.current.close(); // Close producer before transport
    }

    // 2. Clear remote audio consumers
    setRemoteAudios([]);

    // 3. Close transports last
    if (sendTransportRef.current) {
      sendTransportRef.current.close();
      sendTransportRef.current = null;
    }
    if (recvTransportRef.current) {
      recvTransportRef.current.close();
      recvTransportRef.current = null;
    }

    try {
      socket.emit('leave-room', roomId)
      await axiosInstance.delete(`/rooms/delete/${roomId}`)
      navigate(`/rooms`)
    } catch (err) {
      console.error("Cleanup error:", err)
    }

  }, [roomId, socket, navigate])

  useEffect(() => {
    if (!socket) return;

    socket.on('voiceroom:producer-closed', ({ producerId }) => {
      setRemoteAudios(prev => prev.filter(a => a.producerId !== producerId));
    });

    return () => socket.off('voiceroom:producer-closed');
  }, [socket])



  // if (joined === false) return <p className='text-zinc-100'>Connecting...</p>
  return (
    <div className="flex h-full w-full bg-[#0B0B0B] text-zinc-100 overflow-hidden">
      <div className="flex-1 flex flex-col border-r border-zinc-800">
        <header className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold">{roomDetails.title || 'MERN Voice Room'}</h1>
          <p className="text-xs text-zinc-500 uppercase tracking-tighter mt-1">
            {(roomDetails.host ? 1 : 0) + (roomDetails.speaker?.length || 0)} Speakers • {roomDetails.listener?.length || 0} Listening </p>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-12">

          <section>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => {
                const person = peopleOnStage[i];
                const isPersonHost = person?._id === hostId || person === hostId;
                return (
                  <div key={person?._id || `empty-${i}`} className="flex flex-col items-center">
                    {!person ? (
                      /* EMPTY SLOT */
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center">
                        <span className="text-[10px] text-zinc-700">Open</span>
                        {/* <div className={isPersonOnline ? "opacity-100" : "opacity-50"}>...</div> */}
                      </div>
                    ) : (
                      /* OCCUPIED SLOT */
                      <div className="relative">
                        <div className={`w-20 h-20 rounded-full border-2 transition-all
              ${isPersonHost ? 'border-yellow-500 shadow-lg' : 'border-zinc-700'} 
              ${person.isSpeaking ? 'border-green-500 scale-105' : ''}`}>
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.username || person}`}
                            alt="avatar"
                          />
                        </div>
                        {isPersonHost && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                            Host
                          </span>

                        )}
                      </div>
                    )}
                    <span className={`mt-2 text-xs font-medium ${isPersonHost ? 'text-yellow-500' : 'text-zinc-400'}`}>
                      {person?.username || (person ? "Loading..." : "Invite")}
                    </span>
                  </div>
                );
              })}
            </div>

          </section>


          <section className="mt-12">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase mb-4">
              Audience — {roomDetails.listener?.length || 0}
            </h2>
            <div className="flex flex-wrap gap-4">
              {roomDetails.listener?.map((u) => (
                <div key={u._id} className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="listener" />
                </div>
              ))}
            </div>
          </section>
        </div>


        <footer className="p-4 bg-transparent border-t border-zinc-800 flex justify-center items-center gap-4">
          {/* Show Join button if not on stage, or Mute if already on stage */}
          {asSpeaker ? (
            /* SPEAKER VIEW: Mute/Unmute toggle */
            <button
              onClick={micOn ? toggleMute : startMic}
              className={`p-4 rounded-2xl flex items-center gap-2 transition-all ${isMuted ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 hover:bg-zinc-700'}`}
            >
              {isMuted || !micOn ? <MutedIcon /> : <MicIcon />}
              <span className="text-sm font-bold">
                {!micOn ? 'Go Live' : (isMuted ? 'Unmute' : 'Mute')}
              </span>
            </button>
          ) : (
            /* LISTENER VIEW: Raise Hand request */
            <button
              onClick={handleRequestToSpeak}
              className="p-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 flex items-center gap-2 transition-all"
            >
              <HandIcon />
              <span className="text-sm font-bold">Request</span>
            </button>
          )}

          {isHost && (
            <button onClick={handleLeaveRoom} className="px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors">
              Close
            </button>
          )}

          {isListerner && (
            <button type="button">leave</button>
          )}

          {remoteAudios.map((audio) => (
            <RemoteAudio key={audio.id} stream={audio.stream} />
          ))}

        </footer>

      </div>
      <aside className="w-80 flex flex-col bg-zinc-900/20">
        <div className="p-6 border-b border-zinc-800 font-bold text-sm tracking-wider">LIVE CHAT</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {chatMessages.map((m) => (
            <div key={m.id}>
              <span className={`font-bold mr-2 ${m.isSystem ? 'text-blue-400' : 'text-zinc-400'}`}>{m.user}:</span>
              <span className="text-zinc-300">{m.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900/50">
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Say something..." className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
        </form>
      </aside>
    </div>
  )
}

// --- ICON COMPONENTS ---
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
)

const MutedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="2" y2="22" /><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" /><path d="M5 10v2a7 7 0 0 0 12 5" /><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
)


function RemoteAudio({ stream }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
      // Force play to handle browser autoplay policies
      ref.current.play().catch(e => console.error("Playback failed", e));
    }
  }, [stream]);

  return <audio ref={ref} autoPlay style={{ display: 'none' }} />;
}

// 1. Handlers for Requests
const handleRequestToSpeak = () => {
  // Emit an event that the Host can see
  socket.emit('voiceroom:request-to-speak', { roomId, user });
  alert("Request sent to host! ✋");
};

// 2. Icon for the Raise Hand button
const HandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);
export default RoomView

