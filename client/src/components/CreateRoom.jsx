import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { useSocket } from '../socket/SocketContext.jsx'
import { AuthContext } from '../auth/AuthContext.jsx'

const CreateRoom = () => {
  const socket = useSocket()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [roomType, setRoom] = useState('')
  const [input, setInput] = useState({
    owner: user,
    type: roomType,
    title: "",
    role: 'admin',
    description: "",
    speakers: [user],
    listeners: []
  })

  const handleCreate = (e) => {
    e.preventDefault()
    socket.emit('createRoom', input)
    socket.once('roomCreated', (data) => {
      navigate(`/rooms/${data}`)
    })
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  return (
    <form onSubmit={handleCreate} className="w-full h-full text-white p-8 flex flex-col justify-center items-center bg-amber-800" >
      <select value={input.type} onChange={handleChange}>
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
