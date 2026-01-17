import { useEffect, useState } from 'react';
import axiosInstance from '../configs/axios';
import { useAuth } from '../auth/AuthContext';
import { useSocket } from '../socket/SocketContext';

const SearchBar = () => {
  const [search, setSearch] = useState('');
  const [result, setResult] = useState([]);
  const { user, loading } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(async () => {
      if (search) {
        try {
          const { data } = await axiosInstance.get(`/users/searchUsers?search=${search}`);
          setResult(data);
        } catch (error) {
          console.log('search Failed', error);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const sendFriendRequest = async (e, targetUser) => {
    e.preventDefault();

    try {
      if (!user || !targetUser) return;

      const { data } = await axiosInstance.post('/users/sendRequest', {
        receiverId: targetUser,
      });
      console.log('requestid is ', data.requestId);

      socket.emit('send_friend_request', {
        sender: user,
        receiverId: targetUser,
        requestId: data.requestId,
      });
      console.log('Request sent successfully!');
    } catch (error) {
      console.log('some error in sending request', error);
    }
  };

  return (
    <div className="p-2 items-center justify-center">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        placeholder="search"
        className="rounded-2xl p-2 m-2 bg-amber-50"
      />
      {result.map((user) => (
        <div key={user._id}>
          <span className="z-50 text-white">
            {user.username}
            <button
              onClick={(e) => sendFriendRequest(e, user._id)}
              className="p-2 bg-violet-800"
              type="submit"
            >
              add
            </button>
          </span>
        </div>
      ))}
    </div>
  );
};

export default SearchBar;
