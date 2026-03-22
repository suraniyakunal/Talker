import { useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../socket/SocketContext';
import { useAuth } from '../auth/AuthContext.jsx';
import axiosInstance from '../configs/axios.js';
import SearchBar from './SearchBar.jsx';
import Notification from './Notification.jsx';

const Chats = () => {
  const [newMessages, setNewMessages] = useState('');
  const [allMessages, setGetMessages] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [notificationOn, setNotificationOn] = useState(false);
  const [conversations, setConversations] = useState([]);
  const { conversationId } = useParams();
  const { user } = useAuth();
  const messageEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!socket) return;
        const { data } = await axiosInstance.get('/users/getAllFriends');
        setFriends(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [socket, notificationOn]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!socket || !conversationId) return;

        const { data } = await axiosInstance.get(`/chats/getAllMessages/${conversationId}`);
        if (!data) return;

        setGetMessages(data);
        socket.emit('join-chats', conversationId);
      } catch (error) {
        console.log('error fetching the messages', error);
      }
    };

    fetchData();

    return () => {
      if (socket && conversationId) {
        socket.off('join-chats', conversationId);
        socket.emit('leave-chats', conversationId);
      }
    };
  }, [conversationId, socket]);

  useEffect(() => {
    const handleMessageReceived = (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        setGetMessages((prev) => [...prev, newMessage]);
      }
    };

    if (socket) {
      socket.on('message-received', handleMessageReceived);
    }

    return () => {
      if (socket) {
        socket.off('message-received', handleMessageReceived);
      }
    };
  }, [socket, conversationId]);

  const onEmojiClick = (emojiObject) => {
    setNewMessages((prev) => prev + emojiObject.emoji);
  };

  useEffect(() => {
    const scrollToBottom = () => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    scrollToBottom();
  }, [allMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      if (!newMessages.trim()) return;

      const { data } = await axiosInstance.post('/chats/createMessages', {
        content: newMessages,
        conversationId,
      });

      const liveMessage = {
        ...data,
        sender: {
          _id: user._id,
          username: user.username,
          profile_Pic: user.profile_Pic,
        },
      };

      setGetMessages((prev) => [...prev, data]);
      setNewMessages('');
      setShowPicker(false);

      socket.emit('new-message', liveMessage);
    } catch (error) {
      alert('error in sending the message');
      console.error(error);
    }
  };

  const handleConversation = async (e, receiverId) => {
    e.preventDefault();
    try {
      const createRes = await axiosInstance.post('/chats/createConversations', { receiverId });
      const newConversationId = createRes.data.conversationId;

      if (!newConversationId) return console.error('No ID returned');

      navigate(`/chats/${newConversationId}`);

      const listRes = await axiosInstance.get('/chats/getConversations');
      setConversations(listRes.data);
    } catch (error) {
      console.error('Error starting chat', error);
    }
  };

  return (
    <main className="flex h-full w-full bg-[#0B0B0B] text-zinc-100 font-sans overflow-hidden">
      {/* ─── SIDEBAR ─────────────────────────────────────── */}
      <div className="w-[320px] md:w-[360px] flex flex-col border-r border-zinc-800/60 bg-zinc-950/40 relative shrink-0">

        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-md z-10">
          <h2 className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Messages
          </h2>
          <button
            onClick={() => setNotificationOn(!notificationOn)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors shadow-lg relative"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
          </button>
        </div>

        {/* Notifications Popover */}
        {notificationOn && (
          <div className="absolute top-16 right-4 z-50 w-72">
            <Notification />
          </div>
        )}

        {/* Search */}
        <div className="p-4 pt-5 pb-2">
          <SearchBar />
        </div>

        <div className="px-4 py-2">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-1">Friends</p>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
          {friends.length === 0 ? (
            <p className="text-zinc-500 text-sm italic px-4">No friends found.</p>
          ) : (
            friends.map((friend) => (
              <Link
                key={friend._id}
                onClick={(e) => handleConversation(e, friend._id)}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-zinc-800/50 hover:shadow-lg group"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700/50 overflow-hidden flex shrink-0 shadow-inner group-hover:border-blue-500/50 transition-colors">
                    {friend.profile_Pic ? (
                      <img src={friend.profile_Pic} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`} alt="profile" className="w-full h-full" />
                    )}
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0B0B0B] rounded-full"></div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-sm text-zinc-200 truncate">{friend.username}</h4>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">Click to view chat</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ─── CHAT AREA ───────────────────────────────────── */}
      <div className="flex flex-col flex-1 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#0B0B0B] to-[#0B0B0B]">

        {/* Chat Header */}
        {conversationId ? (
          <div className="h-[73px] border-b border-zinc-800/60 flex items-center px-6 bg-zinc-950/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-100">Active Discussion</h3>
                <p className="text-xs text-zinc-500">End-to-end encrypted</p>
              </div>
            </div>
            <div className="ml-auto flex gap-4">
              <button className="text-zinc-400 hover:text-zinc-200 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </button>
              <button className="text-zinc-400 hover:text-zinc-200 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="h-[73px] border-b border-zinc-800/60 bg-zinc-950/80 shrink-0"></div>
        )}

        {/* Messages List Area */}
        <div className="flex flex-col gap-4 p-6 flex-1 overflow-y-auto custom-scrollbar">
          {!conversationId ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-70">
              <div className="w-24 h-24 mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#blue-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop stopColor="#60a5fa" offset="0%" />
                      <stop stopColor="#a855f7" offset="100%" />
                    </linearGradient>
                  </defs>
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold tracking-tight">Your Messages</h2>
              <p className="text-zinc-500 text-sm mt-2 max-w-sm text-center">Select a friend from the sidebar to start a conversation with end-to-end encryption.</p>
            </div>
          ) : allMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center mx-auto opacity-70">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">👋</div>
              <p className="text-lg font-bold text-zinc-300">No messages yet</p>
              <p className="text-zinc-500 text-sm mt-1">Send a message to break the ice!</p>
            </div>
          ) : (
            allMessages.map((msg, index) => {
              const isMe = msg.sender._id === user._id;

              return (
                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>

                    {!isMe && (
                      <span className="text-xs text-zinc-500 font-bold ml-1 mb-1 tracking-wide">
                        {msg.sender.username}
                      </span>
                    )}

                    <div className={`p-3.5 px-4 rounded-2xl shadow-md ${isMe
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 rounded-tr-sm text-white'
                        : 'bg-zinc-800 border border-zinc-700/50 rounded-tl-sm text-zinc-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    <span className="text-[10px] text-zinc-500 mt-1.5 mx-1 font-medium select-none">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Input Area */}
        {conversationId && (
          <div className="p-4 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800/60 shrink-0 relative">

            {showPicker && (
              <div className="absolute bottom-[100%] right-4 mb-2 shadow-2xl rounded-2xl overflow-hidden border border-zinc-800 animate-in fade-in slide-in-from-bottom-4">
                <EmojiPicker height={400} width={320} onEmojiClick={onEmojiClick} theme="dark" />
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
              <div className="flex-1 flex items-end bg-zinc-900 border border-zinc-700/60 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 rounded-2xl transition-all shadow-inner">
                <textarea
                  name="message"
                  placeholder="Type a message..."
                  className="w-full bg-transparent text-sm text-zinc-200 px-4 py-3 max-h-32 focus:outline-none resize-none hide-scrollbar placeholder:text-zinc-500"
                  rows={1}
                  value={newMessages}
                  onChange={(e) => setNewMessages(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPicker(!showPicker)}
                  className="p-3 text-zinc-400 hover:text-blue-400 transition-colors shrink-0"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                </button>
              </div>

              <button
                type="submit"
                disabled={!newMessages.trim()}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${newMessages.trim()
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)]'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={newMessages.trim() ? 'translate-x-0.5' : ''}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(82, 82, 91, 0.5); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(82, 82, 91, 0.8); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
};

export default Chats;
