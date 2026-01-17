import { useEffect, useState } from 'react';
import RoomCards from './RoomCards';
import { Link } from 'react-router-dom';
import { useSocket } from '../socket/SocketContext.jsx';
import axiosInstance from '../configs/axios.js';

const Rooms = () => {
  const [currentRoom, setCurrentRoom] = useState('voiceRoom');
  const [getRooms, setGetRooms] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const fetchData = async () => {
      const { data } = await axiosInstance.get('/rooms/getAllRooms');
      if (!data) return <p>No rooms yet</p>;

      setGetRooms(data);
    };

    fetchData();
  }, []);

  // --- MOCK DATA ---
  const [rooms] = useState([
    {
      id: 1,
      title: 'MERN Stack Architecture 2026',
      host: 'Felix Dev',
      category: 'Technology',
      participants: 124,
      speakers: ['Felix', 'Sarah', 'Dev_Mike'],
      isLive: true,
      isPrivate: false,
    },
    {
      id: 2,
      title: 'Late Night Coding & Chill ☕',
      host: 'Sarah_JS',
      category: 'Social',
      participants: 85,
      speakers: ['Sarah', 'John'],
      isLive: true,
      isPrivate: true,
    },
    {
      id: 3,
      title: 'WebRTC vs Mediasoup Deep Dive',
      host: 'Backend_Pro',
      category: 'Engineering',
      participants: 256,
      speakers: ['Pro', 'Alice', 'Bob'],
      isLive: true,
      isPrivate: false,
    },
  ]);

  return (
    <div className="w-full h-full text-white">
      <div className="flex z-20 fixed left-50 right-50 items-center justify-center px-3 space-x-3 py-2">
        <button
          onClick={() => {
            setCurrentRoom('voiceRoom');
          }}
          type="submit"
          className="bg-gray-700 text-white rounded-lg py-1 px-2"
        >
          Voice
        </button>
        <button
          onClick={() => {
            setCurrentRoom('liveRoom');
          }}
          type="submit"
          className="bg-gray-500 text-white rounded-lg py-1 px-2"
        >
          Live
        </button>
      </div>

      <div className="p-4 pt-8 overflow-y-auto h-[calc(100vh-4rem)]">
        {currentRoom === 'voiceRoom' && (
          <div className="w-full h-full bg-[#0B0B0B] p-6 overflow-y-auto">
            {/* 1. HEADER SECTION */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Active Rooms</h2>
                <p className="text-zinc-500 text-sm">Join a conversation or start your own</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                + Start Room
              </button>
            </div>

            {/* 2. ROOMS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms?.map((room) => (
                <RoomCards
                  key={room.id}
                  isLive={room.isLive}
                  roomId={room.id}
                  title={room.title}
                  category={room.category}
                  host={room.host}
                  participants={room.participants}
                  speakers={room.speakers}
                  isPrivate={room.isPrivate}
                />
              ))}
            </div>
          </div>
        )}

        {currentRoom === 'liveRoom' && (
          <div id="liveRoom">
            <h1>This is live room</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;
