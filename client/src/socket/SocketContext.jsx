import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// 👇 Use the NAMED export from your AuthContext file
import { AuthContext } from '../auth/AuthContext.jsx'

const Socket_Url = 'https://talker-bvax.onrender.com';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  // 👇 Access user AND loading from your AuthContext
  const { user, loading } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketInstance = null;

    // 👇 CRITICAL FIX: Only run logic when loading is done AND check user status
    if (!loading) {
      if (user) {
        console.log("User found, connecting socket...");

        socketInstance = io(Socket_Url, {
          withCredentials: true,
          transports: ['websocket', 'polling']
          // Optionally add query: { userId: user._id } here if needed by backend
        });

        setSocket(socketInstance);

        // Optional: Add listeners
        socketInstance.on('connect', () => console.log('Socket connected successfully'));
        socketInstance.on('disconnect', () => console.log('Socket disconnected'));

      } else {
        // User is logged out (loading is done, no user object)
        console.log("No authenticated user found, ensuring socket is disconnected.");
        // We don't call setSocket(null) here because the return cleanup will handle the old instance
      }
    }

    // 👇 CRITICAL FIX: The cleanup function relies on the local variable 'socketInstance' 
    //    captured within this specific effect run's scope.
    return () => {
      if (socketInstance) {
        console.log("Cleaning up socket connection...");
        socketInstance.disconnect();
      }
    };

    // 👇 CRITICAL FIX: Depend on 'user' and 'loading'
  }, [user, loading]);

  return (
    // You were passing the 'socket' state directly as the value
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

