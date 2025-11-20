import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './main.css';
import App from './App.jsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx'
import SignUp from './components/SignUp.jsx';
import NotFound from './components/NotFound.jsx'
import Posts from './components/Posts.jsx'
import Rooms from './components/Rooms.jsx';
import Chats from './components/Chats.jsx'
import ChatOverview from './components/ChatOverview.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path='/' element={<App />}>
          <Route index element={<Navigate to='/chat' replace />} />
          <Route path='chat' element={<ChatOverview />} />
          <Route path='chat/:userId' element={<Chats />} />
          <Route path='post' element={<Posts />} />
          <Route path='room' element={<Rooms />} />
          <Route path='room/:userId' element={<Rooms />} />
        </Route>


        {/* Dynamic route with a parameter */}
        {/* <Route path="/profile/:userId" element={<ProfilePage />} /> */}

        {/* Catch-all route for any undefined paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>


    </BrowserRouter>
  </StrictMode>
);
