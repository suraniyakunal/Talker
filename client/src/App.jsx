import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import NotFound from './components/NotFound.jsx'
import Posts from './components/Posts.jsx'
import Rooms from './components/Rooms.jsx'
import Chats from './components/Chats.jsx'
import MainLayout from './components/MainLayout.jsx'
import CreateRoom from './components/CreateRoom.jsx'
import Profile from './components/Profile.jsx'
import { useContext, useEffect, useState } from 'react'
import axiosInstance from './configs/axios.js'
import { SocketProvider } from './socket/SocketContext.jsx'
import { AuthContext } from './auth/AuthContext.jsx'

function App() {

  const { user } = useContext(AuthContext)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // console.log(user)
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get('/users/check')
        if (response.status === 200) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch {
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) return <div>Loading...</div>
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path='/' element={<Navigate to='/chats' replace />} />
        <Route path='chats' element={isAuthenticated ? <Chats /> : <Navigate to='/login' />} />
        <Route path='chats/:userId' element={isAuthenticated ? <Chats /> : <Navigate to='/login' />} />
        <Route path='rooms' element={isAuthenticated ? <Rooms /> : <Navigate to='/login' />} />
        <Route path='room/:userId' element={isAuthenticated ? <Rooms /> : <Navigate to='/login' />} />
        <Route path='createRoom' element={isAuthenticated ? <CreateRoom /> : <Navigate to='/login' />} />
        <Route path='posts' element={isAuthenticated ? <Posts /> : <Navigate to='/login' />} />
        <Route path='profile' element={isAuthenticated ? <Profile /> : <Navigate to='/login' />} />
      </Route>

      <Route path='/login' element={!isAuthenticated ? <Login /> : <Navigate to='/chats' />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App;

