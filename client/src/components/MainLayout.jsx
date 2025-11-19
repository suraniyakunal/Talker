import { useState } from 'react'
import Chats from '../components/Chats.jsx'
import Aside from './Aside.jsx'
import Navbar from './Navbar.jsx';
import Rooms from './Rooms.jsx';
import { Outlet } from 'react-router-dom';

function MainLayout() {

  return (
    <>
      <div className='min-h-screen min-w-full'>
        <Navbar />
        <div className='flex h-[calc(100vh-72px)] w-full'>
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default MainLayout
