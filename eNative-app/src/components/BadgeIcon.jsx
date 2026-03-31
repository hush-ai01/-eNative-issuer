export default function BadgeIcon({ type, size = 24 }) {
  const badges = {
    founder: {
      color: '#c084fc',
      bg: 'rgba(192,132,252,0.12)',
      icon: (
        <svg width={size} height={size} viewBox="0 0 58 42" fill="none">
          <rect x="2" y="10" width="22" height="22" rx="5" stroke="#c084fc" strokeWidth="2.5"/>
          <rect x="34" y="10" width="22" height="22" rx="5" stroke="#c084fc" strokeWidth="2.5"/>
          <line x1="24" y1="21" x2="34" y2="21" stroke="#c084fc" strokeWidth="2.5"/>
          <rect x="8" y="16" width="10" height="10" rx="2" fill="#c084fc" opacity=".3"/>
          <rect x="40" y="16" width="10" height="10" rx="2" fill="#c084fc" opacity=".3"/>
        </svg>
      )
    },
    business: {
      color: '#60d8fa',
      bg: 'rgba(96,216,250,0.12)',
      icon: (
        <svg width={size} height={size} viewBox="0 0 44 52" fill="none">
          <circle cx="22" cy="12" r="9" stroke="#60d8fa" strokeWidth="2.5"/>
          <path d="M4 46c0-10 8-16 18-16s18 6 18 16" stroke="#60d8fa" strokeWidth="2.5" strokeLinecap="round"/>
          <rect x="14" y="26" width="16" height="8" rx="2" fill="#60d8fa" opacity=".25"/>
          <line x1="22" y1="21" x2="22" y2="26" stroke="#60d8fa" strokeWidth="2"/>
        </svg>
      )
    },
    verified: {
      color: '#6ee7b7',
      bg: 'rgba(110,231,183,0.12)',
      icon: (
        <svg width={size} height={size} viewBox="0 0 46 52" fill="none">
          <path d="M23 2L4 10v14c0 12 8 22 19 26 11-4 19-14 19-26V10L23 2z" stroke="#6ee7b7" strokeWidth="2.2" strokeLinejoin="round"/>
          <polyline points="14,26 21,33 32,20" stroke="#6ee7b7" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    community: {
      color: '#fcd34d',
      bg: 'rgba(252,211,77,0.12)',
      icon: (
        <svg width={size} height={size} viewBox="0 0 52 46" fill="none">
          <circle cx="26" cy="23" r="6" stroke="#fcd34d" strokeWidth="2.5"/>
          <circle cx="7" cy="8" r="4" stroke="#fcd34d" strokeWidth="2"/>
          <circle cx="45" cy="8" r="4" stroke="#fcd34d" strokeWidth="2"/>
          <circle cx="7" cy="38" r="4" stroke="#fcd34d" strokeWidth="2"/>
          <circle cx="45" cy="38" r="4" stroke="#fcd34d" strokeWidth="2"/>
          <line x1="20" y1="18" x2="11" y2="12" stroke="#fcd34d" strokeWidth="1.8"/>
          <line x1="32" y1="18" x2="41" y2="12" stroke="#fcd34d" strokeWidth="1.8"/>
          <line x1="20" y1="28" x2="11" y2="34" stroke="#fcd34d" strokeWidth="1.8"/>
          <line x1="32" y1="28" x2="41" y2="34" stroke="#fcd34d" strokeWidth="1.8"/>
        </svg>
      )
    }
  }

  const badge = badges[type]
  if (!badge) return null

  return (
    <div title={type} style={{
      width: size + 12,
      height: size + 12,
      borderRadius: '50%',
      background: badge.bg,
      border: `1px solid ${badge.color}40`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {badge.icon}
    </div>
  )
}
