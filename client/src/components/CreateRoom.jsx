import { useState, useEffect, useContext } from "react"
import axiosInstance from "../configs/axios.js"
import { AuthContext } from '../auth/AuthContext.jsx'

const CreateRoom = () => {
  const { user } = useContext(AuthContext)
  const [input, setInput] = useState({
    owner: user._id,
    title: "",
    role: 'admin',
    description: "",
    participants: ''
  })

  useEffect(() => {
    // console.log('the user details are', user)
  }, [])
  const handleCreate = async (e) => {
    e.preventDefault()

    const response = await axiosInstance.post('/rooms/createRoom', { input })
    if (!response) {
      return alert("coudn't create room")
    }
    alert("the data is sent")

  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  return (
    <form className="w-full h-full text-white p-8 flex flex-col justify-center items-center bg-amber-800" >
      <input type="text" value={input.title} onChange={handleChange} name="title" placeholder="topic" className="px-4 py-3 m-2" />
      <input type="text" value={input.description} onChange={handleChange} name="description" placeholder="desciption" className="px-4 py-3 m-2" />
      <button onClick={handleCreate} className="bg-black py-3 px-4 rounded-lg">Create</button>
    </form>
  )
}

export default CreateRoom
