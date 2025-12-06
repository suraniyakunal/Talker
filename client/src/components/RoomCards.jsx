import { useEffect, useState } from 'react'
import avatar from '../assets/images.jpg'
import RoomPage from './RoomView'
import { Link, useNavigate } from 'react-router-dom'
import { useSocket } from '../socket/SocketContext'


const RoomCards = ({ title, username, room }) => {
  const socket = useSocket()
  const navigate = useNavigate()
  const [showParticularRoom, setShowParticularRoom] = useState(false)


  const handleClick = async (e) => {
    e.preventDefault()
    navigate(` / room - view / ${room}`)
    socket.on('joinRoom', (room))
  }
  return (
    <div className="border rounded-lg text-white px-4 py-4 m-4 bg-gray-500/20 overflow-hidden shadow-md ">
      <div className="sticky m-1">
        <h5 className='font-bold m-1'>{title}</h5>
      </div>
      <div className='p-1 m-1'>
        <img src={avatar} className="rounded-full size-10 object-cover" />
        <h3 className='font-semibold'>{username}</h3>
      </div>

      <footer className='flex items-center justify-between space-x-3 m-1'>
        <div className='flex gap-1'>
          <div>
            Joined
          </div>

          <div>
            audience
          </div>

        </div>
        {/* <Link to={`/ room - view / ${room}`} className="bg-cyan-500/40 hover:bg-cyan-500/80 rounded-lg px-3 py-2">Join</Link> */}
        <button onClick={handleClick} className="bg-cyan-500/40 hover:bg-cyan-500/80 rounded-lg px-3 py-2">Join</button>
      </footer>
    </div>
  )
}

export default RoomCards
