import { useEffect, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ChatOverview = () => {
  const [message, setMessage] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [users, setUsers] = useState([]);

  const onEmojiClick = (emojiObject, e) => {
    e.preventDefault();
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://jsonplaceholder.typicode.com/users');
        setUsers(response.data);
      } catch (error) {
        console.log('error', error);
      }
    };

    fetchData();
  }, []);
  return (
    <main className="flex h-full w-full p-2">
      <div className="w-1/3 border-x overflow-y-auto">
        <div className="flex flex-col light-black justify-center">
          {users.map((user) => (
            <Link
              to={`/chats/:${user.id}`}
              className="normal-text rounded-lg hover:bg-gray-500 hover:z-10 hover:p-8 transition-all p-6 shadow-lg shadow-black text-sm"
              key={user.id}
            >
              <strong>{user.name}</strong>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-col flex-1 gap-3 px-3  relative w-full">
        <div className="text-white  bg-gray-500 py-2 px-3">For the calls and video calls</div>

        {/* Message List Area - this area scrolls */}
        <div className="text-3xl text flex items-center justify-center white">
          {' '}
          {/* Added pb-24 for space above the input form */}
          <h1 className="text-white">no chats yet</h1>
        </div>

        {/* Input area fixed at bottom of the main container */}
        <div className="absolute bottom-0 left-0 right-0 normal-text p-4 shadow-lg medium-black">
          <form onSubmit={handleSendMessage} className="relative flex gap-3 items-center">
            <input
              type="text"
              name="message"
              placeholder="Type your messages..."
              className="grow rounded-lg 
              shadow-sm shadow-gray-300 
              h-10 focus:outline-none
              px-3 py-2 "
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
            <button onClick={() => setShowPicker(!showPicker)}>😊</button>
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

export default ChatOverview;
