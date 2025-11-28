
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import NotFound from './components/NotFound.jsx';
import Posts from './components/Posts.jsx';
import Rooms from './components/Rooms.jsx';
import Chats from './components/Chats.jsx';
import MainLayout from './components/MainLayout.jsx'
import CreateRoom from './components/CreateRoom.jsx';
import Profile from './components/Profile.jsx'


function App() {


  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path='/' element={<Navigate to='/chats' replace />} />
        <Route path='chats' element={<Chats />} />
        <Route path='chats/:userId' element={<Chats />} />
        <Route path='posts' element={<Posts />} />
        <Route path='profile' element={<Profile />} />
        <Route path='rooms' element={<Rooms />} />
        <Route path='createRoom/:roomId' element={<CreateRoom />} />
        <Route path='room/:userId' element={<Rooms />} />
      </Route>

      <Route path='/login' element={<Login />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

