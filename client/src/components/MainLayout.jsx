import { useState } from 'react'
import { Outlet } from 'react-router-dom';
import Chats from '../components/Chats.jsx'
import Aside from './Aside.jsx'
import Navbar from './Navbar.jsx';

function MainLayout() {

  return (
    <>
      <div className='dark-black min-h-screen min-w-full'>
        <Navbar />
        <div className='flex h-[calc(100vh-72px)] w-full'>
          <div className='items-center justify-center'>
            <Aside />
          </div>
          <div className='w-full'>
            <Chats />
          </div>
        </div>
      </div>
    </>
  );
}

export default MainLayout
