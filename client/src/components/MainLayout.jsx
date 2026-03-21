import { useState } from 'react';
import Chats from '../components/Chats.jsx';
import Aside from './Aside.jsx';
import Navbar from './Navbar.jsx';
import Rooms from './Rooms.jsx';
import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <>
      <div className="h-screen w-full flex flex-col overflow-hidden bg-[#0B0B0B]">
        <Navbar />
        <div className="flex-1 w-full overflow-hidden bg-[#0B0B0B]">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default MainLayout;
