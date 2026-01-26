import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../socket/SocketContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import axiosInstance from '../configs/axios.js';

const CreateRoom = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roomType, setRoom] = useState('');
  const [input, setInput] = useState({
    host: user._id,
    type: 'voiceroom',
    title: '',
    role: 'host',
    description: '',
    speakers: [user],
    listeners: [],
  });

  const handleCreate = async (e) => {
    e.preventDefault();

    const { data } = await axiosInstance.post('/rooms/createRoom', { roomData: input })

    socket.emit('join-room', { roomId: data.room._id })
    navigate(`/rooms/${data.room._id}`)
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <form
      onSubmit={handleCreate}
      className="w-full h-full text-white p-8 flex flex-col justify-center items-center bg-amber-800"
    >
      {/* <select value={input.type} onChange={handleChange}> */}
      {/*   <option value="voiceroom">VoiceRoom</option> */}
      {/*   <option value="liveroom">LiveRoom</option> */}
      {/* </select> */}
      <input
        required
        type="text"
        value={input.title}
        onChange={handleChange}
        name="title"
        placeholder="title"
        className="px-4 py-3 m-2"
      />
      <input
        required
        type="text"
        value={input.description}
        onChange={handleChange}
        name="description"
        placeholder="desciption"
        className="px-4 py-3 m-2"
      />
      <button className="bg-black py-3 px-4 rounded-lg">Create</button>
    </form>
  );
};

export default CreateRoom;
