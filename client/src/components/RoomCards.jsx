import { useEffect, useState } from 'react';
import avatar from '../assets/images.jpg';
import RoomPage from './RoomView';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../socket/SocketContext';

const RoomCards = ({
  isLive,
  roomId,
  title,
  category,
  host,
  participants,
  speakers,
  isPrivate,
}) => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [showParticularRoom, setShowParticularRoom] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    navigate(`${room.id}`);
  };
  // --- INLINE SVGS ---
  const UsersIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const MicIcon = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );

  const LockIcon = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  return (
    <div
      key={roomId}
      className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-0 right-0 p-3">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
      )}

      {/* Room Info */}
      <div className="mb-4">
        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">
          {category}
        </span>
        <h3 className="text-lg font-bold text-white mt-2 leading-tight group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
      </div>

      {/* Speaker Avatars */}
      <div className="flex items-center mb-6">
        <div className="flex -space-x-3">
          {speakers.map((speaker, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 overflow-hidden ring-1 ring-zinc-800"
            >
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${speaker}`} alt="av" />
            </div>
          ))}
        </div>
        <div className="ml-4 flex flex-col">
          <span className="text-xs font-bold text-zinc-300">{speakers.join(', ')}</span>
          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
            <MicIcon /> Speakers
          </span>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-zinc-400 text-xs font-medium">
            <UsersIcon /> {participants}
          </div>
          {isPrivate && (
            <div className="text-zinc-500">
              <LockIcon />
            </div>
          )}
        </div>
        <button className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">
          Join Room →
        </button>
      </div>
    </div>
  );
};

export default RoomCards;
