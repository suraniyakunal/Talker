import { useState } from 'react'
import Chats from '../components/Chats.jsx'
import Aside from './Aside.jsx'
import Navbar from './Navbar.jsx';
import Rooms from './Rooms.jsx';

function MainLayout() {

  return (
    <>
      <div className='min-h-screen min-w-full'>
        <Navbar />
        <div className='flex h-[calc(100vh-72px)] w-full'>
          <div className='flex items-center justify-center'>
            <Aside />
          </div>
          <div className='w-full'>
            {/* <Chats /> */}
            <Rooms />
          </div>
        </div>
      </div>
    </>
  );
}

export default MainLayout
