import { Link } from 'react-router-dom';
import Aside from './Aside.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

// Inline logo SVG
const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    <path d="M14 11a2 2 0 0 0-2-2"></path>
    <path d="M14 15a6 6 0 0 0-6-6"></path>
  </svg>
);

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300">

      {/* Brand */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all duration-300 group-hover:scale-105">
          <LogoIcon />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Talker
          </span>
        </div>
      </Link>

      {/* Navigation & Profile */}
      <div className="flex items-center gap-6">
        <Aside />

        {/* User avatar next to nav menu */}
        <Link to="/profile" className="hidden sm:block">
          <div className="w-10 h-10 rounded-full border-2 border-zinc-800/60 overflow-hidden hover:border-blue-500/50 transition-colors shadow-inner bg-zinc-900 group relative">
            {user ? (
              <img src={user.profile_Pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            )}
          </div>
        </Link>
      </div>

    </header>
  );
};

export default Navbar;
