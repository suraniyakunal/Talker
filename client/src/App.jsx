
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import NotFound from './components/NotFound.jsx';
import Posts from './components/Posts.jsx';
import Rooms from './components/Rooms.jsx';
import Chats from './components/Chats.jsx';
import ChatOverview from './components/ChatOverview.jsx';
import MainLayout from './components/MainLayout.jsx'
import CreateRoom from './components/CreateRoom.jsx';


function App() {


  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path='/' element={<Navigate to='/chat' replace />} />
        <Route path='chat' element={<ChatOverview />} />
        <Route path='chat/:user' element={<Chats />} />
        <Route path='post' element={<Posts />} />
        <Route path='rooms' element={<Rooms />} />
        <Route path='/createRoom' element={<CreateRoom />} />
        <Route path='room/:userId' element={<Rooms />} />
      </Route>

      <Route path='/login' element={<Login />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

