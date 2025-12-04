import { useState, useEffect, useContext } from "react"
import axiosInstance from "../configs/axios.js"
import { useSocket } from '../socket/SocketContext.jsx'
import { AuthContext } from '../auth/AuthContext.jsx'

const CreateRoom = () => {
  const socket = useSocket()
  const { user } = useContext(AuthContext)
  const audience = [{
    id: 1,
    name: 'kunal'
  }, {
    id: 2,
    name: 'suraj'
  }]
  const [input, setInput] = useState({
    owner: user,
    title: "",
    role: 'admin',
    description: "",
    participants: [user._id]
  })

  const handleCreate = async (e) => {
    e.preventDefault()

    // const response = await axiosInstance.post('/rooms/createRoom', { input })
    // if (!response) {
    //   return alert("coudn't create room")
    // }
    // alert("the data is sent")

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
      <input required type="text" value={input.title} onChange={handleChange} name="title" placeholder="topic" className="px-4 py-3 m-2" />
      <input required type="text" value={input.description} onChange={handleChange} name="description" placeholder="desciption" className="px-4 py-3 m-2" />
      <button className="bg-black py-3 px-4 rounded-lg">Create</button>
    </form>
  )
}

export default CreateRoom
