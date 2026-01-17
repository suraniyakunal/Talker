import React, { useState, useEffect, useRef } from 'react';

const RoomView = () => {
  // --- INTERNAL STATE ---
  const [isMuted, setIsMuted] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'System', text: 'Welcome to the voice room! 🎤', isSystem: true },
  ]);

  // Mock data for UI
  const speakers = [
    { id: 1, name: 'Host Felix', isSpeaking: true, avatar: 'Felix' },
    { id: 2, name: 'Sarah', isSpeaking: false, avatar: 'Sarah' },
    { id: 3, name: 'Developer', isSpeaking: false, avatar: 'Dev' },
  ];

  const audienceCount = 45;
  const chatEndRef = useRef(null);

  // --- AUTO-SCROLL LOGIC ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        id: Date.now(),
        user: 'You',
        text: message,
        isSystem: false,
      },
    ]);
    setMessage('');
  };

  // --- ICON COMPONENTS (INLINE SVGS) ---
  const MicIcon = () => (
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
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );

  const MutedIcon = () => (
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
      <line x1="2" x2="22" y1="2" y2="22" />
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
      <path d="M5 10v2a7 7 0 0 0 12 5" />
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );

  return (
    <div className="flex h-full w-full bg-[#0B0B0B] text-zinc-100 overflow-hidden">
      {/* 1. MAIN AREA */}
      <div className="flex-1 flex flex-col border-r border-zinc-800">
        <header className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold">MERN Voice Room</h1>
          <p className="text-xs text-zinc-500 uppercase tracking-tighter mt-1">
            {speakers.length} Speakers • {audienceCount} Listening
          </p>
        </header>

        {/* Scrollable Stage */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {/* Speakers */}
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
              {speakers.map((s) => (
                <div key={s.id} className="flex flex-col items-center">
                  <div className="relative">
                    {/* Speaking Indicator Pulse */}
                    {s.isSpeaking && (
                      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
                    )}
                    <div
                      className={`w-20 h-20 rounded-full relative z-10 overflow-hidden border-2 transition-all 
                      ${s.isSpeaking ? 'border-green-500 scale-105 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-zinc-700'}`}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.avatar}`}
                        alt="av"
                      />
                    </div>
                  </div>
                  <span className="mt-3 text-sm font-medium">{s.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Audience List (Simple Grid) */}
          <section>
            <h2 className="text-[10px] font-bold text-zinc-600 uppercase mb-4">Audience</h2>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-4 opacity-60">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700"
                ></div>
              ))}
            </div>
          </section>
        </div>

        {/* Bottom Controls */}
        <footer className="p-4 bg-transparent border-t border-zinc-800 flex justify-center items-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-2xl flex items-center gap-2 transition-all 
              ${isMuted ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 hover:bg-zinc-700'}`}
          >
            {isMuted ? <MutedIcon /> : <MicIcon />}
            <span className="text-sm font-bold">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button className="p-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 transition-all flex items-center gap-2">
            {/* <Plus size={20} /> */}
            <span className="text-sm font-semibold">Invite</span>
          </button>

          <button className="px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors">
            Leave Stage
          </button>
        </footer>
      </div>

      {/* 2. CHAT SIDEBAR */}
      <aside className="w-80 flex flex-col bg-zinc-900/20">
        <div className="p-6 border-b border-zinc-800 font-bold text-sm tracking-wider">
          LIVE CHAT
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {chatMessages.map((m) => (
            <div key={m.id} className="animate-in slide-in-from-bottom-1 duration-200">
              <span className={`font-bold mr-2 ${m.isSystem ? 'text-blue-400' : 'text-zinc-400'}`}>
                {m.user}:
              </span>
              <span className="text-zinc-300">{m.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900/50">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Say something..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </form>
      </aside>
    </div>
  );
};

export default RoomView;
