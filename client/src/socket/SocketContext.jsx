import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client'

const Socket_Url = 'https://talker-bvax.onrender.com'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const newSocket = io(Socket_Url, {
      withCredentials: true
    });

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

