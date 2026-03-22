import { useEffect, useState, useRef } from 'react';
import axiosInstance from '../configs/axios';
import { useAuth } from '../auth/AuthContext';
import { useSocket } from '../socket/SocketContext';

// --- INLINE SVGS ---
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
)

const AddUserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const Spinner = () => (
  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6"></line>
    <line x1="12" y1="18" x2="12" y2="22"></line>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
    <line x1="2" y1="12" x2="6" y2="12"></line>
    <line x1="18" y1="12" x2="22" y2="12"></line>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
)

const SearchBar = () => {
  const [search, setSearch] = useState('');
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState(new Set());
  const { user } = useAuth();
  const { socket } = useSocket();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    if (!search.trim()) {
      setResult([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await axiosInstance.get(`/users/searchUsers?search=${search}`);
        setResult(data || []);
      } catch (error) {
        console.error('Search Failed', error);
        setResult([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, user]);

  const sendFriendRequest = async (e, targetUser) => {
    e.preventDefault();
    try {
      if (!user || !targetUser) return;

      // Optimistically update UI
      setSentRequests(prev => new Set(prev).add(targetUser));

      const { data } = await axiosInstance.post('/users/sendRequest', { receiverId: targetUser });

      if (socket && data.requestId) {
        socket.emit('send_friend_request', {
          sender: user,
          receiverId: targetUser,
          requestId: data.requestId,
        });
      }
    } catch (error) {
      console.error('Error sending request', error);
      // Revert UI on failure
      setSentRequests(prev => {
        const next = new Set(prev);
        next.delete(targetUser);
        return next;
      });
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !search) {
        setResult([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [search]);

  return (
    <div className="relative w-full z-40" ref={dropdownRef}>

      {/* Search Input Bubble */}
      <div className={`relative flex items-center bg-zinc-900 border transition-all duration-300 ${search.trim() ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50' : 'border-zinc-800 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700'} rounded-2xl overflow-hidden`}>
        <div className={`pl-4 pr-2 ${search.trim() ? 'text-blue-500' : 'text-zinc-500'}`}>
          {loading ? <Spinner /> : <SearchIcon />}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find people..."
          className="w-full bg-transparent text-zinc-200 placeholder-zinc-600 text-sm font-medium focus:outline-none py-3 pr-4"
        />
        {search && (
          <button
            onClick={() => { setSearch(''); setResult([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
      </div>

      {/* Floating Dropdown Results */}
      {search.trim() && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

          <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/40">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
              {loading ? 'Searching...' : `Results (${result.length})`}
            </span>
          </div>

          <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
            {!loading && result.length === 0 && (
              <div className="py-8 flex flex-col items-center justify-center opacity-70">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-600 mb-3"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>
                <span className="text-sm font-medium text-zinc-400">No users found</span>
              </div>
            )}

            {result.map((targetUser) => {
              const isSent = sentRequests.has(targetUser._id);

              return (
                <div key={targetUser._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/60 transition-colors group">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-950 overflow-hidden shrink-0 shadow-inner group-hover:border-zinc-500 transition-colors">
                    {targetUser.profile_Pic ? (
                      <img src={targetUser.profile_Pic} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.username}`} alt="avatar" className="w-full h-full" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 overflow-hidden pr-2">
                    <h4 className="font-bold text-sm text-zinc-100 truncate">{targetUser.username}</h4>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={(e) => sendFriendRequest(e, targetUser._id)}
                    disabled={isSent}
                    className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all ${isSent
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95'
                      }`}
                    title={isSent ? 'Request Sent' : 'Add Friend'}
                  >
                    {isSent ? <CheckIcon /> : <AddUserIcon />}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(82, 82, 91, 0.4); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(82, 82, 91, 0.7); }
      `}</style>
    </div>
  );
};

export default SearchBar;
