import { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../auth/AuthContext.jsx'; // Verify path

const Socket_Url = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 1. If still loading auth, do nothing yet
    if (loading) return;

    let socketInstance = null;

    if (user) {
      console.log('User found, connecting socket...');

      socketInstance = io(Socket_Url, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        query: { userId: user._id }, // Helpful for backend mapping
      });

      setSocket(socketInstance);

      socketInstance.on('connect', () => console.log('Socket connected:', socketInstance.id));
      socketInstance.on('connect_error', (err) => console.error('Socket error:', err));
    }

    return () => {
      // Cleanup: Close connection if user logs out or component unmounts
      if (socketInstance) {
        console.log('Cleaning up socket connection...');
        socketInstance.disconnect();
        setSocket(null); // Ensure state is cleared
      }
    };
  }, [user, loading]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  return useContext(SocketContext);
};
