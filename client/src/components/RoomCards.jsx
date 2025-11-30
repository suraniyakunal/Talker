import { useState } from 'react'
import avatar from '../assets/images.jpg'
import RoomPage from './RoomView'
import { Link } from 'react-router-dom'


const RoomCards = ({ room }) => {

  const [showParticularRoom, setShowParticularRoom] = useState(false)

  return (
    <div className="border rounded-lg text-white px-4 py-4 m-4 bg-gray-500/20 overflow-hidden shadow-md ">
      <div className="sticky m-1">
        <h5 className='font-bold m-1'>Title</h5>
      </div>
      <div className='p-1 m-1'>
        <img src={avatar} className="rounded-full size-10 object-cover" />
        <h3 className='font-semibold'>kunal</h3>
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
        <Link to={`/room-view/${room.id}`} className="bg-cyan-500/40 hover:bg-cyan-500/80 rounded-lg px-3 py-2">Join</Link>
      </footer>
    </div>
  )
}

export default RoomCards
