import Navbar from "./Navbar"
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client'
import Footer from "./Aside";

const SOCKET_URL = 'http://localhost:3000';

const ChatBox = () => {

  const socketRef = useRef(null);
  const [message, setMessage] = useState('')

  // useEffect(() => {
  //   if (!socketRef.current) {
  //     socketRef.current = io(SOCKET_URL);
  //
  //     socketRef.current.on('connect', () => {
  //       console.log('Connected successfully!');
  //     });
  //
  //     socketRef.current.on('disconnect', () => {
  //       console.log('Disconnected');
  //     });
  //   }
  //
  //   // ✅ Crucial cleanup function
  //   return () => {
  //     if (socketRef.current) {
  //       socketRef.current.disconnect();
  //       socketRef.current = null; // Clear the ref on unmount
  //     }
  //   };
  // }, []); // Run only once when the component mounts
  return (
    <>


    </>

  )
}

export default ChatBox
