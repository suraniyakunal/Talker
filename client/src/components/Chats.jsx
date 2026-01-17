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
        console.log('all the messages data', data);

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

      socket.emit('new-message', liveMessage);
    } catch (error) {
      alert('error in sending the message');
      console.error(error);
    }
  };

  const handleConversation = async (e, receiverId) => {
    e.preventDefault();

    try {
      // 1. Create/Find conversation (POST is correct here)
      const createRes = await axiosInstance.post('/chats/createConversations', { receiverId });
      const newConversationId = createRes.data.conversationId;

      if (!newConversationId) return console.error('No ID returned');

      // 2. Navigate
      navigate(`/chats/${newConversationId}`);

      // 3. Update the Sidebar List (GET request is correct now)
      const listRes = await axiosInstance.get('/chats/getConversations');
      setConversations(listRes.data);
      console.log('the coversations', listRes.data);
    } catch (error) {
      console.error('Error starting chat', error);
    }
  };

  return (
    <main className="flex h-full w-full p-2">
      <div className="w-1/3">
        <div className="flex items-center">
          <SearchBar />
          <button
            type="submit"
            className="bg-indigo-600 h-10 w-15"
            onClick={() => setNotificationOn(!notificationOn)}
          >
            Not
          </button>
          {notificationOn && <Notification />}
        </div>
        <div className=" border-x overflow-y-auto">
          <div className="flex flex-col light-black justify-center">
            {friends.map((friend) => (
              <Link
                onClick={(e) => handleConversation(e, friend._id)}
                className="flex normal-text rounded-lg hover:bg-gray-500 hover:z-10 hover:p-8 transition-all p-6 shadow-lg shadow-black text-sm"
                key={friend._id}
              >
                {friend.profile_Pic ? (
                  <img src={friend.profile_Pic} alt="profile" />
                ) : (
                  <div className="w-6 h-6 mx-3 bg-gray-300 rounded-full flex items-center justify-center">
                    👤
                  </div>
                )}
                <strong>{friend.username}</strong>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-3 px-3  relative w-full">
        <div className="text-white  bg-gray-500 py-2 px-3">For the calls and video calls</div>

        {/* Message List Area */}
        <div className="flex flex-col gap-3 pt-3 pb-24 overflow-y-auto px-4">
          {allMessages.map((msg, index) => {
            // Check if the current user sent this message
            const isMe = msg.sender._id === user._id;

            return (
              <div
                key={index} // Ideally use msg._id if available
                className={`flex flex-col max-w-xs md:max-w-md rounded-2xl px-4 py-2 text-white 
          ${isMe ? 'self-end bg-indigo-600' : 'self-start bg-neutral-800'}`}
              >
                {/* Message Content */}
                <span className="text-sm">{msg.content}</span>

                {/* Timestamp / Sender Name */}
                <span
                  className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200 self-end' : 'text-gray-400 self-start'}`}
                >
                  {isMe ? 'You' : msg.sender.username} •{' '}
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            );
          })}

          {/* Helper to show "No messages yet" */}
          {allMessages.length === 0 && (
            <div className="text-center text-gray-500 mt-10">No messages yet. Say hi! 👋</div>
          )}

          {/* for scrolling down automatically */}
          <div ref={messageEndRef} />
        </div>

        {/* Input area fixed at bottom of the main container */}
        <div className="absolute bottom-0 left-0 right-0 normal-text p-4 shadow-lg">
          <form onSubmit={handleSendMessage} className="relative flex gap-3 items-center">
            <input
              type="text"
              name="message"
              placeholder="Type your messages..."
              className="grow rounded-lg 
              shadow-sm shadow-gray-300 
              h-10 focus:outline-none
              px-3 py-2 "
              value={newMessages}
              onChange={(e) => {
                setNewMessages(e.target.value);
              }}
            />
            <button onClick={() => setShowPicker(!showPicker)} type="button">
              😊
            </button>
            {showPicker && (
              <span
                className="
                absolute z-10 bottom-12 right-0
              "
              >
                {
                  <EmojiPicker
                    height={400}
                    width={300}
                    onEmojiClick={onEmojiClick}
                    emojiStyle="apple"
                  />
                }
              </span>
            )}{' '}
            {/* Select your preferred style */}
            <button
              type="submit"
              className="font-semibold shadow-md rounded h-10 w-20 bg-cyan-800 text-white"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Chats;
