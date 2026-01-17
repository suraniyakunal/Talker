import React, { useState } from 'react';

const Profile = () => {
  // --- INTERNAL STATE ---
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock Profile Data
  const user = {
    name: 'Felix Dev',
    username: '@felix_mern',
    bio: 'Full-stack MERN Developer | Building real-time voice rooms with WebRTC & Mediasoup. Open source enthusiast. 🚀',
    location: 'Meerut, India',
    link: 'github.com/felixdev',
    joined: 'Joined January 2024',
    stats: { posts: 42, followers: '1.2k', following: 850 },
  };

  // --- INLINE SVGS ---
  const MapPin = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );

  const LinkIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );

  return (
    <div className="max-w-2xl mx-auto bg-zinc-950 border-x border-zinc-800 min-h-screen text-zinc-100 font-sans">
      {/* 1. BANNER & AVATAR */}
      <div className="relative">
        <div className="h-40 w-full bg-linear-to-r from-blue-600 to-purple-600"></div>
        <div className="absolute -bottom-16 left-6">
          <div className="w-32 h-32 rounded-full border-4 border-zinc-950 bg-zinc-800 overflow-hidden shadow-2xl">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
        </div>
        <div className="absolute -bottom-14 right-6">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg 
              ${
                isFollowing
                  ? 'bg-zinc-800 text-white border border-zinc-700 hover:bg-red-900/20 hover:text-red-500 hover:border-red-900'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      {/* 2. USER INFO */}
      <div className="mt-20 px-6 space-y-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">{user.name}</h2>
          <span className="text-zinc-500 text-sm">{user.username}</span>
        </div>

        <p className="text-sm leading-relaxed text-zinc-300">{user.bio}</p>

        <div className="flex flex-wrap gap-4 text-xs text-zinc-500 font-medium">
          <div className="flex items-center gap-1">
            <MapPin /> {user.location}
          </div>
          <div className="flex items-center gap-1 text-blue-400 hover:underline cursor-pointer">
            <LinkIcon /> {user.link}
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon /> {user.joined}
          </div>
        </div>

        <div className="flex gap-6 pb-4 border-b border-zinc-900">
          <div className="flex gap-1 items-baseline">
            <span className="font-bold text-sm">{user.stats.following}</span>
            <span className="text-zinc-500 text-xs uppercase tracking-widest">Following</span>
          </div>
          <div className="flex gap-1 items-baseline">
            <span className="font-bold text-sm">{user.stats.followers}</span>
            <span className="text-zinc-500 text-xs uppercase tracking-widest">Followers</span>
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex border-b border-zinc-900">
        {['posts', 'rooms', 'media'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-bold capitalize transition-all relative
              ${activeTab === tab ? 'text-white' : 'text-zinc-500 hover:bg-zinc-900/50'}`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 4. DYNAMIC CONTENT AREA */}
      <div className="p-6">
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl animate-in fade-in slide-in-from-top-4">
              <p className="text-sm text-zinc-400 italic">
                No posts yet. Start sharing your journey!
              </p>
            </div>
          </div>
        )}
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-blue-400">WebRTC Masters</h4>
                <p className="text-xs text-zinc-500">Last active 2 days ago</p>
              </div>
              <button className="text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full uppercase font-bold">
                Rejoin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
