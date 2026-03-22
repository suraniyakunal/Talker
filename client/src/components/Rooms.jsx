import { useEffect, useState } from 'react';
import RoomCards from './RoomCards';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../socket/SocketContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import axiosInstance from '../configs/axios.js';

const Rooms = () => {
  const [currentRoom, setCurrentRoom] = useState('voiceroom');
  const [getRooms, setGetRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [input, setInput] = useState({ title: '', description: '', type: 'voiceroom' });

  const { socket } = useSocket();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;
    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get('/rooms/getAllRooms');
        if (data) setGetRooms(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchData();
  }, [socket, showCreateModal]); // Refresh rooms after modal closes

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const roomData = {
        host: user._id,
        type: input.type,
        title: input.title,
        description: input.description,
        speakers: [user._id],
      };

      const { data } = await axiosInstance.post('/rooms/createRoom', { roomData });

      if (socket) {
        socket.emit('join-room', { roomId: data.room._id, user, asSpeaker: true });
      }

      setShowCreateModal(false);
      setInput({ title: '', description: '', type: 'voiceroom' });

      // Navigate to the respective room type viewer
      if (data.room.type === 'liveroom') {
        navigate(`/liverooms/${data.room._id}`);
      } else {
        navigate(`/rooms/${data.room._id}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const voiceRooms = getRooms.filter(r => r.type === 'voiceroom');
  const liveRooms = getRooms.filter(r => r.type === 'liveroom');

  return (
    <div className="w-full h-full text-white bg-[#0B0B0B] relative flex flex-col font-sans">

      {/* ─── CREATION MODAL ───────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black mb-1">Create a New Room</h2>
            <p className="text-zinc-500 text-sm mb-6">Start a conversation or a live stream instantly.</p>

            <form onSubmit={handleCreate} className="space-y-4">

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 ml-1">Room Type</label>
                <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setInput(prev => ({ ...prev, type: 'voiceroom' }))}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${input.type === 'voiceroom' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Voice Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput(prev => ({ ...prev, type: 'liveroom' }))}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${input.type === 'liveroom' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Live Room
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 ml-1">Room Title</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={input.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Late Night Coding Discussions"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 ml-1">Description</label>
                <textarea
                  required
                  name="description"
                  value={input.description}
                  onChange={handleInputChange}
                  placeholder="What's this room about?"
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-zinc-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/60 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!input.title || !input.description}
                  className="px-6 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Start Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── HEADER & TYPE SWITCHER ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 pb-2 border-b border-zinc-800/60 gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Active Spaces</h2>
          <p className="text-zinc-500 text-sm">Join a voice channel or a live video broadcast</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-full p-1 shadow-inner">
            <button
              onClick={() => setCurrentRoom('voiceroom')}
              className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all ${currentRoom === 'voiceroom'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              Voice
            </button>
            <button
              onClick={() => setCurrentRoom('liveroom')}
              className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all flex items-center gap-2 ${currentRoom === 'liveroom'
                  ? 'bg-red-500/10 text-red-500 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              Live
              {currentRoom === 'liveroom' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create
          </button>
        </div>
      </div>

      {/* ─── ROOM GROUPS GRID ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {currentRoom === 'voiceroom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {voiceRooms.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-60">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-600 mb-4"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg>
                <h3 className="text-lg font-bold">No active voice rooms</h3>
                <p className="text-zinc-500 text-sm">Create one to start talking.</p>
              </div>
            ) : (
              voiceRooms.map((room) => (
                <RoomCards key={room._id} roomId={room._id} title={room.title} host={room.host} participants={room.participants} speakers={room.speaker} isPrivate={room.isPrivate} type="voiceroom" />
              ))
            )}
          </div>
        )}

        {currentRoom === 'liveroom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {liveRooms.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-60">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-600 mb-4"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
                <h3 className="text-lg font-bold">No active live streams</h3>
                <p className="text-zinc-500 text-sm">Be the first to go live.</p>
              </div>
            ) : (
              liveRooms.map((room) => (
                <RoomCards key={room._id} roomId={room._id} title={room.title} host={room.host} participants={room.participants} speakers={room.speaker} isPrivate={room.isPrivate} type="liveroom" />
              ))
            )}
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(82, 82, 91, 0.5); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(82, 82, 91, 0.8); }
      `}</style>
    </div>
  );
};

export default Rooms;
