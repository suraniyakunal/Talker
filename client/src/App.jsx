import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from './auth/AuthContext.jsx';
import { SocketProvider } from './socket/SocketContext.jsx';

//lazy loading for the components
const Login = lazy(() => import('./components/Login.jsx'));
const Signup = lazy(() => import('./components/SignUp.jsx'));
const Chats = lazy(() => import('./components/Chats.jsx'));
const MainLayout = lazy(() => import('./components/MainLayout.jsx'));
const Rooms = lazy(() => import('./components/Rooms.jsx'));
const RoomView = lazy(() => import('./components/RoomView.jsx'));
const CreateRoom = lazy(() => import('./components/CreateRoom.jsx'));
const Posts = lazy(() => import('./components/Posts.jsx'));
const Profile = lazy(() => import('./components/Profile.jsx'));
const NotFound = lazy(() => import('./components/NotFound.jsx'));

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="spinner">Loading page...</div>
  </div>
);

function App() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <SocketProvider>
      <Suspense fallback={PageLoader()}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/chats" replace />} />
            <Route path="chats" element={user ? <Chats /> : <Navigate to="/login" />} />
            <Route path="chats/:conversationId" element={user ? <Chats /> : <Navigate to="/login" />} />
            <Route path="rooms" element={user ? <Rooms /> : <Navigate to="/login" />} />
            <Route path="rooms" element={user ? <Rooms /> : <Navigate to="/login" />} />
            <Route path="rooms/:roomId" element={user ? <RoomView /> : <Navigate to="/login" />} />
            <Route path="rooms/createRoom" element={user ? <CreateRoom /> : <Navigate to="/login" />} />
            <Route path="posts" element={user ? <Posts /> : <Navigate to="/login" />} />
            <Route path="profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          </Route>

          <Route path="/login" element={!user ? <Login /> : <Navigate to={'/chats'} />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to={'/chats'} />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </SocketProvider>
  );
}

export default App;
