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
const LiveRoomView = lazy(() => import('./components/LiveRoomView.jsx'));
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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public access only when NOT logged in */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/chats" replace />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/chats" replace />} />

          {/* Protected area - requires user */}
          <Route element={user ? <MainLayout /> : <Navigate to="/login" replace />}>
            <Route path="/" element={<Navigate to="/chats" replace />} />
            <Route path="chats" element={<Chats />} />
            <Route path="chats/:conversationId" element={<Chats />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="rooms/:roomId" element={<RoomView />} />
            <Route path="liverooms/:roomId" element={<LiveRoomView />} />
            <Route path="rooms/createRoom" element={<CreateRoom />} />
            <Route path="posts" element={<Posts />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback for any unknown route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </SocketProvider>
  );
}

export default App;
