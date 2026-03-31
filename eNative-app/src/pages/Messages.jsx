import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BadgeIcon from '../components/BadgeIcon'

const MOCK_CONVOS = [
  { id:1, name:'Amara Kone', en:'E-0247', badge:'founder', last:'Sure, sending now 👌', time:'08:25', unread:2, online:true },
  { id:2, name:'Zara Mensah', en:'E-1102', badge:'verified', last:'When are you free to call?', time:'07:14', unread:0, online:true },
  { id:3, name:'Dev Patel', en:'E-2841', badge:'business', last:'The API is ready for testing', time:'Yesterday', unread:1, online:false },
  { id:4, name:'Lena Osei', en:'E-3517', badge:'community', last:'Welcome to eNative! 🎉', time:'Monday', unread:0, online:false },
]

const MOCK_MESSAGES = {
  1: [
    { id:1, from:'them', text:'Hey! Can you send me the documents?', time:'08:00' },
    { id:2, from:'me', text:'Morning! Sure, give me a sec', time:'08:02' },
    { id:3, from:'them', text:'Thanks, no rush 🙏', time:'08:10' },
    { id:4, from:'me', text:'Sure, sending now 👌', time:'08:25' },
  ],
  2: [
    { id:1, from:'them', text:'Hey Taryl! When are you free to call?', time:'07:14' },
  ],
  3: [
    { id:1, from:'them', text:'The API is ready for testing', time:'Yesterday' },
  ],
  4: [
    { id:1, from:'them', text:'Welcome to eNative! 🎉', time:'Monday' },
  ],
}

export default function Messages() {
  const [activeConvo, setActiveConvo] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [user, setUser] = useState(null)
  const bottomRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  useEffect(() => {
    if (activeConvo) {
      setMessages(MOCK_MESSAGES[activeConvo.id] || [])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [activeConvo])

  const sendMessage = () => {
    if (!input.trim()) return
    const newMsg = { id: Date.now(), from: 'me', text: input.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const initials = (name) => name.split(' ').map(n => n[0]).join('')

  return (
    <div style={{minHeight:'100vh',background:'#050507',color:'rgba(255,255,255,0.93)',fontFamily:"'Exo 2',sans-serif",display:'flex',flexDirection:'column'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;800&family=Exo+2:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');
      .msg-input:focus{outline:none;border-color:rgba(192,132,252,0.4)!important;}
      `}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid #111116',background:'#08090d',flexShrink:0}}>
        {activeConvo ? (
          <>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div onClick={() => setActiveConvo(null)} style={{width:'32px',height:'32px',borderRadius:'8px',background:'#0c0d12',border:'1px solid #1a1a24',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'1rem'}}>←</div>
              <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#1a0a30,#0d0520)',border:'1.5px solid rgba(192,132,252,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontWeight:'700',fontSize:'13px',color:'#c084fc'}}>{initials(activeConvo.name)}</div>
              <div>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:'700',fontSize:'0.95rem'}}>{activeConvo.name}</div>
                <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'9px',color: activeConvo.online ? '#6ee7b7' : 'rgba(255,255,255,0.25)',letterSpacing:'0.1em'}}>{activeConvo.online ? '● ONLINE' : '○ OFFLINE'}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <div onClick={() => navigate('/dialler')} style={{width:'36px',height:'36px',borderRadius:'50%',background:'#0c0d12',border:'1px solid #1a1a24',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'1rem'}}>📞</div>
            </div>
          </>
        ) : (
          <>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'linear-gradient(135deg,#c084fc,#60d8fa)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontWeight:'800',fontSize:'13px',color:'#fff'}}>en</div>
              <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:'10px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.3)'}}>MESSAGES</span>
            </div>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#0c0d12',border:'1px solid #1a1a24',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'1.1rem'}}>✏️</div>
          </>
        )}
      </div>

      {!activeConvo ? (
        /* Conversation List */
        <div style={{flex:1,overflowY:'auto',paddingBottom:'80px'}}>
          <div style={{padding:'16px 20px 8px'}}>
            <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'9px',letterSpacing:'0.25em',color:'rgba(255,255,255,0.25)',marginBottom:'12px'}}>{MOCK_CONVOS.length} CONVERSATIONS</div>
            <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
              {MOCK_CONVOS.map(c => (
                <div key={c.id} onClick={() => setActiveConvo(c)} style={{background:'#08090d',border:'1px solid #111116',borderRadius:'14px',padding:'14px 16px',display:'flex',alignItems:'center',gap:'12px',cursor:'pointer'}}>
                  <div style={{position:'relative',flexShrink:0}}>
                    <div style={{width:'46px',height:'46px',borderRadius:'50%',background:'linear-gradient(135deg,#1a0a30,#0d0520)',border:'1.5px solid rgba(192,132,252,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontWeight:'700',fontSize:'15px',color:'#c084fc'}}>
                      {initials(c.name)}
                    </div>
                    {c.online && <div style={{position:'absolute',bottom:'1px',right:'1px',width:'10px',height:'10px',borderRadius:'50%',background:'#6ee7b7',border:'2px solid #08090d'}}/>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'3px'}}>
                      <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:'700',fontSize:'0.95rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.name}</span>
                      <BadgeIcon type={c.badge} size={10}/>
                    </div>
                    <div style={{fontFamily:'Exo 2,sans-serif',fontSize:'0.8rem',color:'rgba(255,255,255,0.35)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.last}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'6px',flexShrink:0}}>
                    <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'8px',color:'rgba(255,255,255,0.25)'}}>{c.time}</div>
                    {c.unread > 0 && <div style={{width:'18px',height:'18px',borderRadius:'50%',background:'#c084fc',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontWeight:'700',fontSize:'10px',color:'#050507'}}>{c.unread}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Chat View */
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:'10px',paddingBottom:'80px'}}>
            {messages.map(m => (
              <div key={m.id} style={{display:'flex',justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start'}}>
                <div style={{maxWidth:'75%'}}>
                  <div style={{padding:'10px 14px',borderRadius: m.from === 'me' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',background: m.from === 'me' ? 'linear-gradient(135deg,rgba(192,132,252,0.2),rgba(96,216,250,0.15))' : '#0c0d12',border: m.from === 'me' ? '1px solid rgba(192,132,252,0.25)' : '1px solid #1a1a24',fontSize:'0.88rem',lineHeight:'1.4'}}>
                    {m.text}
                  </div>
                  <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'8px',color:'rgba(255,255,255,0.2)',marginTop:'4px',textAlign: m.from === 'me' ? 'right' : 'left',paddingLeft: m.from === 'me' ? 0 : '4px',paddingRight: m.from === 'me' ? '4px' : 0}}>{m.time}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{position:'fixed',bottom:'70px',left:0,right:0,padding:'10px 16px',background:'#08090d',borderTop:'1px solid #111116',display:'flex',gap:'10px',alignItems:'center'}}>
            <input
              className="msg-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Message..."
              style={{flex:1,padding:'12px 16px',background:'#0c0d12',border:'1px solid #1a1a24',borderRadius:'24px',color:'rgba(255,255,255,0.93)',fontFamily:"'Exo 2',sans-serif",fontSize:'0.88rem'}}
            />
            <div onClick={sendMessage} style={{width:'42px',height:'42px',borderRadius:'50%',background: input.trim() ? 'linear-gradient(135deg,#c084fc,#60d8fa)' : '#0c0d12',border:`1px solid ${input.trim() ? 'transparent' : '#1a1a24'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'1.1rem',flexShrink:0,transition:'all 0.2s'}}>
              ➤
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
