import { useEffect, useState } from "react"
import RoomCards from "./RoomCards"
import { Link } from "react-router-dom"
import { useSocket } from '../socket/SocketContext.jsx'


const Rooms = () => {

  const [currentRoom, setCurrentRoom] = useState('voiceRoom')
  const [getRooms, setGetRooms] = useState([])
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return
    socket.emit('getAllRooms')

    socket.on('getRooms', (getAllRooms) => {
      setGetRooms(getAllRooms)
    })

    return () => {
      socket.off('getRooms')
    }
  }, [])
  return (
    <div className="min-w-full min-h-full text-white">
      <div className="flex z-20 fixed left-50 right-50 items-center justify-center px-3 space-x-3 py-2">
        <button onClick={() => { setCurrentRoom('voiceRoom') }} type="submit" className="bg-gray-700 text-white rounded-lg py-1 px-2">Voice</button>
        <button onClick={() => { setCurrentRoom('liveRoom') }} type="submit" className="bg-gray-500 text-white rounded-lg py-1 px-2">Live</button>
        <Link to='/createRoom' className="bg-gray-500 text-white rounded-lg py-1 px-2">Create</Link>
      </div>

      <div className="p-4 pt-8 overflow-y-auto h-[calc(100vh-4rem)]">
        {currentRoom === 'voiceRoom' &&
          (<div id="voiceRoom" className=" mt-8 grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 space-x-5">
            {getRooms.map((room) => (<div key={room._id}><RoomCards room={room._id} title={room.title} username={room.owner} /></div>))}
          </div>
          )}

        {currentRoom === 'liveRoom' &&
          (<div id="liveRoom">

            <h1>This is live room</h1>
          </div>
          )}

      </div>
    </div>
  )
}

export default Rooms
