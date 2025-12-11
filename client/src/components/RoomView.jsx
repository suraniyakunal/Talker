import { useSocket } from "../socket/SocketContext"
import { useEffect, useState, useContext, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AuthContext } from "../auth/AuthContext"
import * as mediasoupClient from 'mediasoup-client'

const RoomView = () => {
  const socket = useSocket()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const { roomId } = useParams()
  const [role, setRole] = useState('')
  const device = useRef(null)
  const sendTransport = useRef(null)
  const recvTransports = useRef(new Map())
  const audioElements = useRef(new Map())
  const localStreamRef = useRef(null)

  useEffect(() => {
    socket.emit('joinRoom', { roomId, userId: user._id });


    socket.once('roomJoined', async ({ rtpCapabilities, role }) => {
      setRole(role);

      // 1. Load device
      device.current = new mediasoupClient.Device();
      await device.current.load({ routerRtpCapabilities: rtpCapabilities });
      console.log('✅ Device loaded');

      if (role === 'speaker') {
        try {
          // 2. WAIT for transport to be ready
          await createSendTransport();
          console.log('✅ Transport ready, getting mic...');

          // 3. NOW safe to get stream
          await getLocalStream();
        } catch (error) {
          console.error('❌ Speaker setup failed:', error);
        }
      }

      // 4. Get producers
      socket.emit('getProducers', { roomId, userId: user._id });
    });

    // Handle incoming producers (new speakers)
    socket.on('signalProducers', (producerIds) => {
      console.log('Producers to consume:', producerIds);
      producerIds.forEach(producerId => createRecvTransport(producerId));
    });

    socket.on('new-producer', ({ producerId }) => {
      console.log('New producer:', producerId);
      createRecvTransport(producerId);
    });

    return () => {
      // Cleanup
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      Object.values(audioElements.current).forEach(audio => audio.pause());
    };
  }, []);



  const createSendTransport = () => {
    return new Promise((resolve, reject) => {
      console.log('🔄 Sending createWebRtcTransport...');
      socket.emit('createWebRtcTransport', { sender: true, roomId }, (response) => {
        console.log('📨 Raw server response:', response);

        // ✅ SAFE CHECK - response might be undefined
        if (!response) {
          reject(new Error('No server response'));
          return;
        }

        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        if (!response.params) {
          reject(new Error('Invalid response format'));
          return;
        }

        console.log('✅ Valid params received:', response.params.id);

        sendTransport.current = device.current.createSendTransport(response.params);

        // Send transport
        sendTransport.current = device.current.createSendTransport({
          ...response.params,
          iceServers: config.iceServers  // ✅ Add STUN
        });

        // Event handlers...
        sendTransport.current.on('connect', ({ dtlsParameters }, callback, errback) => {
          socket.emit('transport-connect', { dtlsParameters, roomId }, callback);
        });

        sendTransport.current.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
          socket.emit('transport-produce', { kind, rtpParameters, roomId, userId: user._id }, (res) => {
            if (res?.id) callback({ id: res.id });
            else callback({ error: 'Produce failed' });
          });
        });

        resolve();
      });
    });
  };



  const getLocalStream = async () => {
    // ✅ GUARD CLAUSE - verify transport exists
    if (!sendTransport.current) {
      throw new Error('Send transport not ready');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        }
      });

      const track = stream.getAudioTracks()[0];
      if (!track) throw new Error('No audio track');

      localStreamRef.current = stream;

      // ✅ NOW SAFE - transport is guaranteed to exist
      const { id } = await sendTransport.current.produce({ track });
      console.log('✅ Audio producing with ID:', id);

    } catch (error) {
      console.error('❌ Mic failed:', error);
      throw error; // Re-throw for caller to handle
    }
  };

  const config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.1.google.com:19302' }
    ]
  };



  const createRecvTransport = async (remoteProducerId) => {
    console.log('🔄 Creating recv transport for:', remoteProducerId);

    // ✅ FIX 1: Existing transport - GET and PASS it
    if (recvTransports.current.has(remoteProducerId)) {
      console.log('✅ Recv transport already exists');
      const existingTransport = recvTransports.current.get(remoteProducerId);
      return consumeRemoteAudio(remoteProducerId, existingTransport);  // ✅ PASS TRANSPORT
    }

    // Create new transport
    socket.emit('createWebRtcTransport', {
      sender: false,
      roomId,
      producerId: remoteProducerId
    }, async (response) => {
      if (!response?.params) {
        console.error('❌ No transport params:', response);
        return;
      }

      const transport = device.current.createRecvTransport({
        ...response.params,  // Server params
        iceServers: [        // ✅ STUN servers
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      recvTransports.current.set(remoteProducerId, transport);  // Store it


      // ✅ FIX 2: Setup connect handler BEFORE consuming
      transport.on('connect', ({ dtlsParameters }, callback, errback) => {
        socket.emit('transport-connect', {
          dtlsParameters,
          roomId,
          producerId: remoteProducerId
        }, callback);
      });

      // ✅ FIX 3: PASS the NEW transport
      await consumeRemoteAudio(remoteProducerId, transport);
    });
  };

  const consumeRemoteAudio = async (remoteProducerId, transport) => {
    try {
      const response = await new Promise((resolve, reject) => {
        socket.emit('consume', {
          remoteProducerId,
          rtpCapabilities: device.current.rtpCapabilities,
          roomId
        }, resolve);
      });
      if (!transport) {
        console.error('❌ No transport');
        return;
      }
      if (response.error) throw new Error(response.error);

      const consumer = await transport.consume(response.params);
      const { track } = consumer;

      const audio = new Audio();
      audio.srcObject = new MediaStream([track]);
      await audio.play();

      audioElements.current.set(remoteProducerId, audio);
      console.log('✅ Playing remote audio:', remoteProducerId);
    } catch (error) {
      console.error('❌ Consume failed:', error);
    }
  };

  const handleLeave = (e) => {
    e.preventDefault()
    socket.emit('leaveRoom', roomId)
    socket.once('leftRoom', (data) => {
      console.log(' Got leftRoom confirmation:', data)
      navigate('/rooms')
    })
  }

  return (
    <> <div className="w-full flex justify-center items-center text-white ">
      <div className="relative text-center w-2/3 border-2 h-full">
        <div className="h-40 grid w-full  p-4 gap-2 grid-cols-5">
          {/* <div className="h-10"> */}
          {/*   <h1>Speakers</h1> */}
          {/* </div> */}
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"><img alt="j" /></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
          <div className="p-4 rounded-full bg-amber-50 h-16 w-16"></div>
        </div>
        <h1>The audience</h1>
        <footer className="absolute bottom-5 left-10 right-10">
          <button type="submit" className='py-3 px-3 m-2 bg-green-500 rounded-full'>mute</button>
          <button onClick={handleLeave} type="submit" className='py-3 px-3 m-2 bg-green-500 rounded-full'>leave</button>
          <button type="submit" className='py-3 px-3 m-2 bg-green-500 rounded-full'>Add</button>

          <button onClick={async () => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              console.log('🎤 Mic test OK:', stream.getAudioTracks());
              stream.getTracks().forEach(track => track.stop());
            } catch (e) {
              console.error('🎤 Mic test FAILED:', e);
            }
          }}>Test Mic</button>
        </footer>
      </div>
      <div className="text-center w-1/3 border-2 h-full">
        <h1>Chats</h1>
      </div>
    </div>

    </>)
}

export default RoomView
