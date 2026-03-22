import React, { useState, useEffect } from 'react';
import axiosInstance from '../configs/axios.js';
import { useAuth } from '../auth/AuthContext.jsx';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await axiosInstance.get('/posts/getAllPosts');
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    try {
      const { data } = await axiosInstance.post('/posts/create', { content: newPostContent });
      setPosts([data, ...posts]);
      setNewPostContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await axiosInstance.post(`/posts/like/${postId}`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const toggleComments = (postId) => {
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    try {
      const { data } = await axiosInstance.post(`/posts/comment/${postId}`, { text: commentText });
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: data } : p));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // --- INLINE SVGS ---
  const HeartIcon = ({ filled }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );

  const CommentIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );

  return (
    <div className="flex-1 w-full bg-[#0B0B0B] text-zinc-100 font-sans overflow-y-auto custom-scrollbar relative">
      <div className="max-w-xl mx-auto py-8 px-4 space-y-6">

        {/* CREATE POST INPUT */}
        <div className="bg-zinc-950/60 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-4 shadow-lg sticky top-6 z-10 transition-all focus-within:border-blue-500/50 focus-within:shadow-[0_4px_30px_rgba(59,130,246,0.1)]">
          <form onSubmit={handleCreatePost} className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full border border-zinc-700/50 overflow-hidden shrink-0 mt-1 shadow-inner bg-zinc-800">
              <img src={user?.profile_Pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's happening in your dev world? 🚀"
                className="w-full bg-transparent text-sm text-zinc-200 resize-none outline-none min-h-[50px] placeholder:text-zinc-600 custom-scrollbar-thin"
                rows={newPostContent ? 3 : 1}
              />
              <div className="flex justify-between items-center border-t border-zinc-800/60 pt-3">
                <button type="button" className="text-blue-500/80 hover:text-blue-400 p-2 rounded-full hover:bg-blue-500/10 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </button>
                <button
                  type="submit"
                  disabled={!newPostContent.trim()}
                  className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all shadow-md ${newPostContent.trim()
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-transparent'
                    }`}
                >
                  Post
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* FEED */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <h3 className="text-xl font-bold text-zinc-300">No posts available.</h3>
            <p className="text-zinc-500 text-sm mt-2">Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => {
            const isLiked = post.likes.includes(user?._id);
            const isCommentsOpen = openComments[post._id];

            return (
              <div key={post._id} className="bg-zinc-900 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-lg hover:border-zinc-700/60 transition-colors">
                {/* HEAD */}
                <div className="p-5 pb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full border border-zinc-700/50 overflow-hidden shadow-inner bg-zinc-800 shrink-0">
                      <img src={post.author?.profile_Pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username}`} alt="author" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight text-zinc-100 hover:underline cursor-pointer">
                        {post.author?.username || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-zinc-500 font-medium tracking-wide">
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BODY */}
                <div className="px-5 py-2">
                  <p className="text-[15px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* INTERACTIONS */}
                <div className="px-5 py-3 mt-2 border-t border-zinc-800/50 bg-zinc-950/20 flex gap-6">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group ${isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-red-400'}`}
                  >
                    <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-500/10' : 'group-hover:bg-red-500/10'}`}>
                      <HeartIcon filled={isLiked} />
                    </div>
                    <span className="text-sm font-bold">{post.likes.length}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post._id)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-blue-400 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <div className="p-2 rounded-full transition-colors group-hover:bg-blue-500/10">
                      <CommentIcon />
                    </div>
                    <span className="text-sm font-bold">{post.comments.length}</span>
                  </button>
                </div>

                {/* COMMENTS SECTION */}
                {isCommentsOpen && (
                  <div className="bg-zinc-950/50 px-5 pb-5 pt-1 space-y-4 animate-in fade-in slide-in-from-top-2 border-t border-zinc-800/30">

                    {/* Add Comment Input */}
                    <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex items-center gap-3 pt-3">
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-700/50 shrink-0 bg-zinc-800">
                        <img src={user?.profile_Pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 flex items-center shadow-inner focus-within:border-blue-500/30 transition-colors">
                        <input
                          type="text"
                          value={commentInputs[post._id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                          placeholder="Reply to this post..."
                          className="flex-1 bg-transparent border-none text-[13px] text-zinc-200 focus:outline-none placeholder:text-zinc-600"
                        />
                        <button type="submit" disabled={!commentInputs[post._id]?.trim()} className="text-blue-500 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed">
                          Post
                        </button>
                      </div>
                    </form>

                    {/* Comment List */}
                    <div className="space-y-3 pt-2">
                      {post.comments.map((c) => (
                        <div key={c._id} className="flex gap-3 text-sm">
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-800 shrink-0 bg-zinc-800 shadow-sm mt-0.5">
                            <img src={c.user?.profile_Pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user?.username}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="bg-zinc-800/40 px-3.5 py-2 rounded-2xl rounded-tl-sm border border-zinc-800/60 max-w-[85%]">
                            <p className="font-bold text-[12px] text-zinc-300 mb-0.5 tracking-wide">{c.user?.username || 'User'}</p>
                            <p className="text-zinc-300 text-[13px] leading-snug">{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(82, 82, 91, 0.4); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(82, 82, 91, 0.6); }
        .custom-scrollbar-thin::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Posts;
