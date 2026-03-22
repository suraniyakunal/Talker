import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../configs/axios.js';
import { useAuth } from '../auth/AuthContext.jsx';

// ── Icons ─────────────────────────────────────────────────────────────────
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const MapPin = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
const LinkIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
const CalendarIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></svg>;
const Sparkles = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><path d="M12 2v20"></path><path d="M2 12h20"></path><path d="M4.93 4.93l14.14 14.14"></path><path d="M4.93 19.07L19.07 4.93"></path></svg>;

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const profileId = id || currentUser?._id;

  const [activeTab, setActiveTab] = useState('overview');
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (profileId) fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/users/${profileId}`);
      setProfileUser(data);
      setFollowersCount(data.followers?.length || 0);

      const followingList = data.followers?.some(
        follower => follower._id === currentUser?._id || follower === currentUser?._id
      );
      setIsFollowing(followingList);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    try {
      const { data } = await axiosInstance.post(`/users/toggle-follow/${profileId}`);
      setIsFollowing(data.isFollowing);
      setFollowersCount(data.followersCount);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full bg-[#0B0B0B] text-zinc-100 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex-1 w-full bg-[#0B0B0B] text-zinc-100 flex flex-col justify-center items-center gap-4">
        <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center rotate-12">
          <span className="text-4xl">👻</span>
        </div>
        <h2 className="text-2xl font-black text-zinc-300 tracking-tight">User Not Found</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-zinc-800 rounded-full font-bold hover:bg-zinc-700 transition">Go Back</button>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === profileId;
  const joinedDate = new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="flex-1 w-full h-full bg-[#0B0B0B] text-zinc-100 font-sans overflow-y-auto custom-scrollbar p-4 md:p-8">

      <div className="max-w-5xl mx-auto space-y-6">

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Hero Widget */}
          <div className="lg:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[2rem] p-6 lg:p-10 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[300px] group">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 group-hover:bg-purple-500/10 transition-colors duration-1000"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
              {/* Massive Avatar */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] rotate-3 overflow-hidden border-4 border-zinc-800 shadow-xl group-hover:rotate-0 transition-all duration-500 bg-zinc-800">
                  <img src={profileUser.profile_Pic || `https://api.dicebear.com/7.x/shapes/svg?seed=${profileUser.username}`} alt="avatar" className="w-full h-full object-cover" />
                </div>
                {profileUser.role === 'Admin' && (
                  <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl shadow-lg rotate-12">
                    <Sparkles />
                  </div>
                )}
              </div>

              {/* Identity */}
              <div className="flex-1">
                <div className="flex flex-wrap items-end gap-3 mb-2">
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400">
                    {profileUser.username}
                  </h1>
                </div>
                <p className="text-zinc-400 font-medium tracking-wide mb-6">{profileUser.email}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {profileUser.location && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 tracking-wide">
                      <MapPin /> {profileUser.location}
                    </span>
                  )}
                  {profileUser.link && (
                    <a href={profileUser.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-400 tracking-wide hover:bg-blue-500/20 transition-colors">
                      <LinkIcon /> Website
                    </a>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 tracking-wide">
                    <CalendarIcon /> Joined {joinedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="relative z-10 mt-8 pt-6 border-t border-zinc-800/80 flex justify-between items-center">
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-2xl font-black">{followersCount}</span>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Followers</span>
                </div>
                <div className="w-px h-10 bg-zinc-800"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black">{profileUser.following?.length || 0}</span>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Following</span>
                </div>
              </div>

              {!isOwnProfile ? (
                <button
                  onClick={handleToggleFollow}
                  className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95
                    ${isFollowing
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 border border-transparent'
                      : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow User'}
                </button>
              ) : (
                <button className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 active:scale-95">
                  <EditIcon /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Side Bio Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 flex flex-col justify-center gap-4 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-[12rem] opacity-[0.03] rotate-12 pointer-events-none font-serif">“</div>
            <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-2">About Me</h3>
            <p className="text-lg text-zinc-300 leading-relaxed font-medium">
              {profileUser.bio || "This user prefers to keep an air of mystery about them... 🎭"}
            </p>
          </div>
        </div>

        {/* CONTENT TABS */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-[2rem] overflow-hidden min-h-[400px]">
          <div className="flex border-b border-zinc-800/80 p-2 gap-2 bg-zinc-900">
            {['overview', 'posts', 'rooms'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-bold capitalize transition-all rounded-xl
                  ${activeTab === tab ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-70">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-400 text-2xl">🏆</div>
                  <p className="font-bold text-lg mb-1">Top Listener</p>
                  <p className="text-zinc-500 text-sm">Spent 50+ hours in Voice Rooms</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-70">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 text-purple-400 text-2xl">✍️</div>
                  <p className="font-bold text-lg mb-1">Prolific Writer</p>
                  <p className="text-zinc-500 text-sm">Created over 100+ engaging posts</p>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="flex flex-col items-center justify-center py-16 opacity-60">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="font-black text-xl mb-1">No Posts Yet</h3>
                <p className="text-zinc-400 text-sm">When {profileUser.username} creates posts, they will appear here.</p>
              </div>
            )}

            {activeTab === 'rooms' && (
              <div className="flex flex-col items-center justify-center py-16 opacity-60">
                <div className="text-4xl mb-4">🎙️</div>
                <h3 className="font-black text-xl mb-1">No Active Rooms</h3>
                <p className="text-zinc-400 text-sm">This user hasn't hosted any rooms recently.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(82, 82, 91, 0.5); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(82, 82, 91, 0.8); }
      `}</style>
    </div>
  );
};

export default Profile;
