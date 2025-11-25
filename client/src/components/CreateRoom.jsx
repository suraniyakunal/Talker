import { useState, useEffect } from "react"
import axios from "axios"

const CreateRoom = () => {
  const [input, setInput] = useState({
    title: "",
    description: ""
  })

  const handleCreate = async (e) => {
    e.preventDefault()

    const response = await axios.post('http://localhost:3000/api/rooms/createRoom', input, { withCredentials: true })
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
    <form className="text-white p-8" >
      <input type="text" value={input.title} onChange={handleChange} name="title" placeholder="topic" />
      <input type="text" value={input.description} onChange={handleChange} name="description" placeholder="desciption" />
      <button onClick={handleCreate}>Create</button>
    </form>
  )
}

export default CreateRoom
