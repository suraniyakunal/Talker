import { Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../configs/axios';
import { useAuth } from '../auth/AuthContext.jsx';

// --- INLINE SVGS ---
const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const PostIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
);
const RoomIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);

const NavItem = ({ to, currentPath, icon: Icon, label }) => {
  // exact match or starts with for chats
  const isActive = currentPath === to || (to !== '/' && currentPath.startsWith(to));

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full font-bold transition-all duration-200 active:scale-95 group relative overflow-hidden
        ${isActive
          ? 'bg-zinc-800 text-zinc-100 shadow-inner'
          : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
        }`}
    >
      <div className={`transition-transform duration-300 ${isActive ? 'scale-110 text-blue-400' : 'group-hover:scale-110'}`}>
        <Icon />
      </div>
      <span className="text-[13px] tracking-wide mt-0.5">{label}</span>
      {isActive && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-blue-500 rounded-t-full shadow-[0_0_8px_rgba(59,130,246,0.8)] opacity-80" />
      )}
    </Link>
  );
};

const Aside = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogOut = async () => {
    try {
      const response = await axiosInstance.post('/users/logout', { request: 'yes' });
      if (response.status === 200) {
        setUser(null);
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <NavItem to="/chats" currentPath={currentPath} icon={ChatIcon} label="Chats" />
      <NavItem to="/posts" currentPath={currentPath} icon={PostIcon} label="Posts" />
      <NavItem to="/rooms" currentPath={currentPath} icon={RoomIcon} label="Rooms" />
      <NavItem to="/profile" currentPath={currentPath} icon={ProfileIcon} label="Profile" />

      <div className="w-[1px] h-6 bg-zinc-800 mx-1"></div>

      <button
        onClick={handleLogOut}
        title="Logout"
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full font-bold text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 active:scale-95 group"
      >
        <div className="transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5">
          <LogoutIcon />
        </div>
      </button>
    </div>
  );
};

export default Aside;
