import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import NotFound from './components/NotFound.jsx'
import Posts from './components/Posts.jsx'
import Rooms from './components/Rooms.jsx'
import Chats from './components/Chats.jsx'
import MainLayout from './components/MainLayout.jsx'
import CreateRoom from './components/CreateRoom.jsx'
import Profile from './components/Profile.jsx'
import RoomView from './components/RoomView.jsx'
import { useContext, useEffect, useState } from 'react'
import axiosInstance from './configs/axios.js'
import { AuthContext } from './auth/AuthContext.jsx'

function App() {

  const { user, loading } = useContext(AuthContext)
  const isAuthenticated = Boolean(user)

  if (loading) return <div className='text-red-600'>Loading...</div>
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path='/' element={<Navigate to='/chats' replace />} />
        <Route path='chats' element={isAuthenticated ? <Chats /> : <Navigate to='/login' />} />
        <Route path='chats/:userId' element={isAuthenticated ? <Chats /> : <Navigate to='/login' />} />
        <Route path='rooms' element={isAuthenticated ? <Rooms /> : <Navigate to='/login' />} />
        <Route path='room-view/:roomId' element={isAuthenticated ? <RoomView /> : <Navigate to='/login' />} />
        <Route path='room/:userId' element={isAuthenticated ? <Rooms /> : <Navigate to='/login' />} />
        <Route path='createRoom' element={isAuthenticated ? <CreateRoom /> : <Navigate to='/login' />} />
        <Route path='posts' element={isAuthenticated ? <Posts /> : <Navigate to='/login' />} />
        <Route path='profile' element={isAuthenticated ? <Profile /> : <Navigate to='/login' />} />
      </Route>

      <Route path='/login' element={<Login />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App;

