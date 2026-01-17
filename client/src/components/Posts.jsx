import React, { useState } from 'react';

const Posts = () => {
  // --- INTERNAL STATE ---
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(124);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { id: 1, user: 'Dev_Mike', text: 'This backend architecture is 🔥' },
  ]);

  // Mock Post Data
  const postData = {
    author: 'Felix_Dev',
    time: '2h ago',
    content:
      'Just finished implementing the WebRTC signaling logic for the new voice rooms. MERN stack + Socket.io is a powerful combo! 🚀 #DevLife #MERN',
    avatar: 'Felix',
  };

  // --- HANDLERS ---
  const handleLike = () => {
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments([...comments, { id: Date.now(), user: 'You', text: comment }]);
    setComment('');
  };

  // --- INLINE SVGS ---
  const HeartIcon = ({ filled }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? '#ef4444' : 'none'}
      stroke={filled ? '#ef4444' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );

  const CommentIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );

  const ShareIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );

  return (
    <div className="max-w-xl mx-auto my-6 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl text-zinc-100 font-sans">
      {/* 1. HEADER */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800 overflow-hidden">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${postData.avatar}`}
              alt="av"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-none">{postData.author}</h3>
            <span className="text-[10px] text-zinc-500">{postData.time}</span>
          </div>
        </div>
        <button className="text-zinc-500 hover:text-zinc-300">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>

      {/* 2. CONTENT */}
      <div className="px-4 py-2">
        <p className="text-sm text-zinc-300 leading-relaxed">{postData.content}</p>
      </div>

      {/* 3. INTERACTIONS */}
      <div className="px-4 py-3 mt-2 border-t border-zinc-800/50">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-all active:scale-125 ${liked ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <HeartIcon filled={liked} />
            <span className="text-xs font-bold">{likesCount}</span>
          </button>

          <button className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <CommentIcon />
            <span className="text-xs font-bold">{comments.length}</span>
          </button>

          <button className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <ShareIcon />
          </button>
        </div>
      </div>

      {/* 4. COMMENTS SECTION */}
      <div className="bg-zinc-950/50 px-4 py-4 space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="text-xs flex gap-2">
            <span className="font-bold text-zinc-400">{c.user}</span>
            <span className="text-zinc-300">{c.text}</span>
          </div>
        ))}

        <form onSubmit={handleAddComment} className="mt-4 pt-4 border-t border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800 shrink-0"></div>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent border-none text-xs focus:ring-0 placeholder:text-zinc-600"
            />
            <button
              type="submit"
              className={`text-xs font-bold transition-colors ${comment.trim() ? 'text-blue-500 hover:text-blue-400' : 'text-zinc-700'}`}
              disabled={!comment.trim()}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Posts;
