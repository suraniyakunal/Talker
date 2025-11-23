
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import SignUp from './components/SignUp.jsx';
import NotFound from './components/NotFound.jsx';
import Posts from './components/Posts.jsx';
import Rooms from './components/Rooms.jsx';
import Chats from './components/Chats.jsx';
import ChatOverview from './components/ChatOverview.jsx';
import { useContext } from 'react'
import { AuthContext } from './auth/AuthContext.jsx'

function App() {

  const { user } = useContext(AuthContext)


  return (
    <Routes>
      {user ? (
        <Route path='/' element={<App />}>
          <Route path='chat' element={<ChatOverview />} />
          <Route path='chat/:userId' element={<Chats />} />
          <Route path='post' element={<Posts />} />
          <Route path='room' element={<Rooms />} />
          <Route path='room/:userId' element={<Rooms />} />
        </Route>

      ) : (
        <Route path='/login' element={<Login />} />
      )}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

