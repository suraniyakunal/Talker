import { useState, useEffect, useContext } from "react"
import { useSocket } from '../socket/SocketContext.jsx'
import { AuthContext } from '../auth/AuthContext.jsx'

const CreateRoom = () => {
  const socket = useSocket()
  const { user } = useContext(AuthContext)
  const [room, setRoom] = useState('')
  const [input, setInput] = useState({
    owner: user,
    type: room,
    title: "",
    role: 'admin',
    description: "",
    participants: [user]
  })

  const handleCreate = async (e) => {
    e.preventDefault()
    socket.emit('createRoom', input)
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  return (
    <form onSubmit={handleCreate} className="w-full h-full text-white p-8 flex flex-col justify-center items-center bg-amber-800" >
      <select value={room} onChange={e => setRoom(e.target.value)}>
        <option value='voiceroom'>VoiceRoom</option>
        <option value='liveroom'>LiveRoom</option>
      </select>
      <input required type="text" value={input.title} onChange={handleChange} name="title" placeholder="topic" className="px-4 py-3 m-2" />
      <input required type="text" value={input.description} onChange={handleChange} name="description" placeholder="desciption" className="px-4 py-3 m-2" />
      <button className="bg-black py-3 px-4 rounded-lg">Create</button>
    </form>
  )
}

export default CreateRoom
