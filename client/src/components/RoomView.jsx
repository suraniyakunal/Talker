import { useSocket } from "../socket/SocketContext"
import { useEffect, useState, useContext, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AuthContext } from "../auth/AuthContext"
import { connect } from "socket.io-client"

const RoomView = () => {
  const socket = useSocket()
  const { user } = useContext(AuthContext)
  const localStreamRef = useRef()
  const remoteAudioRef = useRef()
  const peerConnectionRef = useRef()
  const navigate = useNavigate()
  const { roomId } = useParams()
  const [role, setRole] = useState('')

  useEffect(() => {
    socket.emit('joinRoom', { roomId }, { userId: user._id })
    socket.once('roomJoined', async ({ room, role }) => {
      setRole(role)

      if (role === 'speaker') {
        await startBroadcasting()
      } else {
        socket.on('broadcaster-ready', ({ broadcasterId }) => {
          console.log('Broadcaster ready, connecting...')
          connectToBroadcaster(broadcasterId)
        })
      }
    })

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])


  const startBroadcasting = async () => {

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    localStreamRef.current = stream

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.1.google.com.19302' }]
    })

    stream.getTracks().forEach(track => {
      peerConnectionRef.current.addTrack(track, stream)
    })

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('voice-ice-candidate', {
          candidate: event.candidate,
          roomId
        })
      }
    }

    socket.on('register-broadcaster', roomId)
  }


  const createListenerPeerConnection = async () => {
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: { urls: 'stun:stun.1.google.com.19302' }
    })

    peerConnectionRef.current.ontrack = (event) => {
      remoteAudioRef.current.srcObject = event.stream[0]
    }

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('voice-ice-candidate', {
          candidate: event.candidate,
          roomId
        })
      }
    }
  }

  const handleLeave = (e) => {
    e.preventDefault()
    socket.emit('leaveRoom', roomId)
    socket.once('leftRoom', (data) => {
      console.log('4. Got leftRoom confirmation:', data)
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
        </footer>
      </div>
      <div className="text-center w-1/3 border-2 h-full">
        <h1>Chats</h1>
      </div>
    </div>

    </>)
}

export default RoomView
