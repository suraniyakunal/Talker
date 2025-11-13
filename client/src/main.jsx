import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './main.css';
import App from './App.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout.jsx';
import Login from './components/Login.jsx'
import SignUp from './components/SignUp.jsx';
import ChatBox from './components/ChatBox.jsx';
import NotFound from './components/NotFound.jsx'
import Posts from './components/Posts.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>

        <Route path='/' element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<MainLayout />}>
          <Route path='/chat' element={<ChatBox />} >
            <Route path='/chat/posts' element={<Posts />} />
          </Route>
        </Route>


        {/* Dynamic route with a parameter */}
        {/* <Route path="/profile/:userId" element={<ProfilePage />} /> */}

        {/* Catch-all route for any undefined paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>


    </BrowserRouter>
  </StrictMode>
);
