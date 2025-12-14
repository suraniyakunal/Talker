import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client'
import AuthContext from '../auth/AuthContext.jsx'

const Socket_Url = 'https://talker-bvax.onrender.com'

const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext)
  const [socket, setSocket] = useState(null)
  const newSocket = useRef(null)
  useEffect(() => {
    if (user) {
      newSocket = io(Socket_Url, {
        withCredentials: true
      });

      setSocket(newSocket)
    }
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

