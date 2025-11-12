import { Routes, Route } from 'react-router-dom'
import Login from './components/Login.jsx'
import MainLayout from './components/MainLayout.jsx';
import NotFound from './components/NotFound.jsx'

function App() {

  return (
    <>
      <Routes>

        <Route path='/' element={<MainLayout />} >
          <Route path="/login" element={<Login />} />
          <Route path="/posts" element={<Login />} />
          <Route path="/rooms" element={<Login />} />
          <Route path="/profile" element={<Login />} />
        </Route>

        {/* Dynamic route with a parameter */}
        {/* <Route path="/profile/:userId" element={<ProfilePage />} /> */}

        {/* Catch-all route for any undefined paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App
