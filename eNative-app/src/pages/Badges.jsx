import { useNavigate } from 'react-router-dom'

const BADGES = [
  {
    type: 'founder',
    tier: 'Tier I · Founder',
    name: 'Founder eNative',
    tagline: 'First wave. Only 1,000 exist in the world. The origin story starts here.',
    color: '#c084fc',
    glow: 'rgba(192,132,252,0.25)',
    border: 'rgba(192,132,252,0.3)',
    perks: ['Permanent ID', '20 Invites', 'Priority Access'],
    slots: '1 – 1,000',
    status: 'Exclusive',
    icon: (
      <svg width="52" height="38" viewBox="0 0 58 42" fill="none">
        <rect x="2" y="10" width="22" height="22" rx="5" stroke="#c084fc" strokeWidth="2.5"/>
        <rect x="34" y="10" width="22" height="22" rx="5" stroke="#c084fc" strokeWidth="2.5"/>
        <line x1="24" y1="21" x2="34" y2="21" stroke="#c084fc" strokeWidth="2.5"/>
        <rect x="8" y="16" width="10" height="10" rx="2" fill="#c084fc" opacity=".3"/>
        <rect x="40" y="16" width="10" height="10" rx="2" fill="#c084fc" opacity=".3"/>
      </svg>
    ),
  },
  {
    type: 'business',
    tier: 'Cross-Tier · Business',
    name: 'Business eNative',
    tagline: 'For builders and operators shaping the digital economy.',
    color: '#60d8fa',
    glow: 'rgba(96,216,250,0.25)',
    border: 'rgba(96,216,250,0.3)',
    perks: ['Verified Entity', 'API Access', 'Monetisation'],
    slots: 'SMME / Pro',
    status: 'Cross-Tier',
    icon: (
      <svg width="40" height="48" viewBox="0 0 44 52" fill="none">
        <circle cx="22" cy="12" r="9" stroke="#60d8fa" strokeWidth="2.5"/>
        <path d="M4 46c0-10 8-16 18-16s18 6 18 16" stroke="#60d8fa" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="14" y="26" width="16" height="8" rx="2" fill="#60d8fa" opacity=".25"/>
        <line x1="22" y1="21" x2="22" y2="26" stroke="#60d8fa" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    type: 'verified',
    tier: 'Tier II · Verified',
    name: 'Verified eNative',
    tagline: 'KYC-confirmed. Identity recognised across the full network.',
    color: '#6ee7b7',
    glow: 'rgba(110,231,183,0.25)',
    border: 'rgba(110,231,183,0.3)',
    perks: ['Permanent ID', '10 Invites', 'Cloud Identity'],
    slots: '1,001 – 3,000',
    status: 'Verified',
    icon: (
      <svg width="42" height="48" viewBox="0 0 46 52" fill="none">
        <path d="M23 2L4 10v14c0 12 8 22 19 26 11-4 19-14 19-26V10L23 2z" stroke="#6ee7b7" strokeWidth="2.2" strokeLinejoin="round"/>
        <polyline points="14,26 21,33 32,20" stroke="#6ee7b7" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    type: 'community',
    tier: 'Tier III · Community',
    name: 'Community Verified',
    tagline: 'Endorsed by the network. Recognised everywhere.',
    color: '#fcd34d',
    glow: 'rgba(252,211,77,0.25)',
    border: 'rgba(252,211,77,0.3)',
    perks: ['Permanent ID', 'Beta Access', 'Network Status'],
    slots: '3,001 – 5,000',
    status: 'Community',
    icon: (
      <svg width="48" height="42" viewBox="0 0 52 46" fill="none">
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
    ),
  },
]

export default function Badges() {
  const navigate = useNavigate()

  return (
    <div style={{minHeight:'100vh',background:'#050507',color:'rgba(255,255,255,0.93)',fontFamily:"'Exo 2',sans-serif",paddingBottom:'90px'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;800&family=Exo+2:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');
        @keyframes halo { 0%,100%{opacity:0.2;transform:scale(0.97)} 50%{opacity:0.5;transform:scale(1.04)} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
      `}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid #111116',background:'#08090d'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'linear-gradient(135deg,#c084fc,#60d8fa)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontWeight:'800',fontSize:'13px',color:'#fff'}}>en</div>
          <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:'10px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.3)'}}>BADGE SYSTEM</span>
        </div>
        <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'9px',letterSpacing:'0.15em',color:'rgba(255,255,255,0.2)'}}>4 TIERS</div>
      </div>

      <div style={{maxWidth:'480px',margin:'0 auto',padding:'20px 16px'}}>

        {/* Intro */}
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'9px',letterSpacing:'0.3em',color:'rgba(255,255,255,0.25)',marginBottom:'8px'}}>PERMANENT · VERIFIED · TRUSTED</div>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:'700',fontSize:'1.3rem',color:'rgba(255,255,255,0.9)'}}>Your badge signals who you are<br/>to the entire <span style={{color:'#c084fc'}}>eNative</span> network</div>
        </div>

        {/* Badge Cards */}
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          {BADGES.map(b => (
            <div key={b.type} style={{background:'#08090d',borderRadius:'20px',padding:'24px 20px',border:`1px solid ${b.border}`,position:'relative',overflow:'hidden'}}>

              {/* Glow */}
              <div style={{position:'absolute',top:'-40px',left:'50%',transform:'translateX(-50%)',width:'200px',height:'200px',borderRadius:'50%',background:`radial-gradient(circle, ${b.glow} 0%, transparent 70%)`,pointerEvents:'none',animation:'halo 3.5s ease-in-out infinite'}}/>

              {/* Tier label */}
              <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'8px',letterSpacing:'0.2em',color:b.color,opacity:0.6,marginBottom:'16px'}}>{b.tier.toUpperCase()}</div>

              {/* Icon + Name row */}
              <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'14px'}}>
                <div style={{width:'72px',height:'72px',borderRadius:'50%',background:`radial-gradient(circle, ${b.glow} 0%, #08090d 70%)`,border:`1.5px solid ${b.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,animation:'float 5s ease-in-out infinite'}}>
                  {b.icon}
                </div>
                <div>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:'700',fontSize:'1.15rem',color:'rgba(255,255,255,0.93)',marginBottom:'4px'}}>{b.name}</div>
                  <div style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.4)',lineHeight:'1.4'}}>{b.tagline}</div>
                </div>
              </div>

              {/* Perks */}
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'16px'}}>
                {b.perks.map(p => (
                  <span key={p} style={{fontFamily:'Share Tech Mono,monospace',fontSize:'8px',letterSpacing:'0.1em',padding:'4px 10px',borderRadius:'20px',border:`1px solid ${b.border}`,color:b.color,background:`${b.glow}`}}>{p}</span>
                ))}
              </div>

              {/* Footer */}
              <div style={{display:'flex',justifyContent:'space-between',borderTop:`1px solid ${b.border}`,paddingTop:'12px'}}>
                <div>
                  <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'8px',color:'rgba(255,255,255,0.25)',marginBottom:'3px'}}>SLOTS</div>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:'600',fontSize:'0.85rem',color:'rgba(255,255,255,0.7)'}}>{b.slots}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'8px',color:'rgba(255,255,255,0.25)',marginBottom:'3px'}}>STATUS</div>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:'600',fontSize:'0.85rem',color:b.color}}>{b.status}</div>
                </div>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:b.color,alignSelf:'center',boxShadow:`0 0 8px ${b.color}`,animation:'halo 2s ease-in-out infinite'}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#08090d',borderTop:'1px solid #111116',display:'flex',justifyContent:'space-around',padding:'12px 0 20px'}}>
        {[
          {icon:'⊞',label:'Home',path:'/dashboard'},
          {icon:'📞',label:'Dialler',path:'/dialler'},
          {icon:'👥',label:'Contacts',path:'/contacts'},
          {icon:'💬',label:'Messages',path:'/messages'},
          {icon:'👤',label:'Profile',path:'/profile'},
        ].map(n => (
          <div key={n.label} onClick={() => navigate(n.path)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',cursor:'pointer',opacity:0.4}}>
            <span style={{fontSize:'1.1rem'}}>{n.icon}</span>
            <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:'7px',letterSpacing:'0.1em',color:'rgba(255,255,255,0.5)'}}>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
