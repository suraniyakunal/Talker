import { useEffect, useState } from 'react';
import { useSocket } from '../socket/SocketContext';
import axiosInstance from '../configs/axios';
const Notification = () => {
  const { socket } = useSocket();
  const [allRequests, setAllRequests] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleNewRequest = (data) => {
      if (!data) return console.log('data didnot come');
      console.log(data);

      setAllRequests((prevRequests) => {
        // Normalizing data to match DB structure
        const newReq = {
          _id: data.requestId,
          sender: data.sender, // Assuming this is { username: "..." }
          status: 'pending',
        };

        // Check for duplicates
        if (prevRequests.find((r) => r._id === newReq._id)) return prevRequests;

        return [...prevRequests, newReq];
      });
    };

    socket.on('new-request', handleNewRequest);

    const handleRequests = async () => {
      try {
        const { data } = await axiosInstance.get('/users/getAllFriendRequests');

        if (!data) return console.log('There is no friend requests');
        console.log('Loaded Requests:', data);
        setAllRequests(data);
      } catch (error) {
        console.error('Failed to retrieve requests:', error.message);
      }
    };

    handleRequests();

    return () => {
      socket.off('new-request', handleNewRequest);
    };
  }, [socket]);

  const accepetRequest = async (requestId) => {
    try {
      const { data } = await axiosInstance.post('/users/updateRequests', { requestId });
      console.log('the data is ', data);

      setAllRequests((prevRequests) => prevRequests.filter((req) => req._id !== requestId));
    } catch (error) {
      console.error('Failed to accept', error);
      alert('could not accept the request');
    }
  };

  return (
    <div className="h-80 w-60 bg-amber-50 z-10 top-15 absolute rounded-lg shadow-xl p-2 overflow-y-auto">
      <h3 className="font-bold text-gray-700 mb-2 border-b">Notifications</h3>

      {allRequests.length === 0 ? (
        <p className="text-gray-500 text-center text-sm mt-10">No new requests</p>
      ) : (
        allRequests
          .filter((req) => req.status === 'pending')
          .map((req) => (
            <div key={req._id} className="mb-2 p-2 bg-white rounded shadow border border-gray-100">
              {/* Safe Access */}
              <p className="text-sm font-semibold text-gray-800">
                {req.sender?.username || 'Unknown User'}
              </p>
              <p className="text-xs text-gray-500 mb-1">Sent a friend request</p>

              <button
                onClick={() => accepetRequest(req._id)}
                className="bg-violet-600
                hover:bg-violet-700
                text-white px-3 py-1 rounded 
                text-xs transition"
              >
                Accept
              </button>
            </div>
          ))
      )}
    </div>
  );
};

export default Notification;
