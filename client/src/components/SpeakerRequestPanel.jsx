// SpeakerRequestPanel — floating panel for host to approve/deny raise-hand requests

// ── Icons ──────────────────────────────────────────────────────────────────
const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)
const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)
const HandIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
)

/**
 * SpeakerRequestPanel
 * Props:
 *   requests  – Array<{ user: { _id, username }, roomId }>
 *   onApprove – (user) => void
 *   onDeny    – (user) => void
 */
const SpeakerRequestPanel = ({ requests = [], onApprove, onDeny }) => {
    // Don't render if no requests
    if (requests.length === 0) return null

    return (
        <div style={{
            position: 'absolute',
            bottom: 80,           // sits just above the footer bar
            right: 316,          // aligns left of the chat sidebar (300px + 16px gap)
            width: 260,
            zIndex: 100,
            borderRadius: 16,
            border: '1px solid rgba(168,85,247,0.25)',
            background: 'rgba(15,15,18,0.92)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.1)',
            overflow: 'hidden',
            animation: 'slideUp 0.2s ease',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                borderBottom: '1px solid rgba(168,85,247,0.15)',
                background: 'rgba(168,85,247,0.08)',
            }}>
                <span style={{ color: '#a855f7' }}><HandIcon /></span>
                <span style={{
                    fontSize: 11, fontWeight: 700, color: '#c084fc',
                    textTransform: 'uppercase', letterSpacing: '0.1em'
                }}>
                    Stage Requests
                </span>
                <span style={{
                    marginLeft: 'auto',
                    minWidth: 18, height: 18,
                    background: '#a855f7', color: '#fff',
                    borderRadius: 9999, fontSize: 10, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 5px',
                }}>
                    {requests.length}
                </span>
            </div>

            {/* Request list */}
            <div style={{
                maxHeight: 240,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: '6px 0',
            }}>
                {requests.map(({ user: reqUser }) => (
                    <div key={reqUser._id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '7px 14px',
                        transition: 'background 0.15s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.07)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {/* Avatar */}
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            overflow: 'hidden', flexShrink: 0,
                            border: '1.5px solid rgba(168,85,247,0.3)',
                            background: '#18181b',
                        }}>
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${reqUser.username}`}
                                alt={reqUser.username}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>

                        {/* Name */}
                        <span style={{
                            flex: 1, fontSize: 13, fontWeight: 600, color: '#e4e4e7',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {reqUser.username}
                        </span>

                        {/* Approve */}
                        <button
                            onClick={() => onApprove(reqUser)}
                            title="Approve"
                            style={{
                                width: 28, height: 28, borderRadius: 8, border: 'none',
                                background: 'rgba(34,197,94,0.12)', color: '#4ade80',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', flexShrink: 0,
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.25)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.12)'}
                        >
                            <CheckIcon />
                        </button>

                        {/* Deny */}
                        <button
                            onClick={() => onDeny(reqUser)}
                            title="Deny"
                            style={{
                                width: 28, height: 28, borderRadius: 8, border: 'none',
                                background: 'rgba(239,68,68,0.08)', color: '#f87171',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', flexShrink: 0,
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                        >
                            <XIcon />
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    )
}

export default SpeakerRequestPanel
