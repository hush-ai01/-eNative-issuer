import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BadgeIcon from '../components/BadgeIcon'
import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const { user: authUser, profile: authProfile, signOut: authSignOut } = useAuth()
  const [user, setUser] = useState(authUser)
  const [profile, setProfile] = useState(authProfile)
  const [avatar, setAvatar] = useState(authProfile?.avatar_url || null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(authProfile?.full_name || '')
  const [msg, setMsg] = useState('')
  const fileRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    if (authUser) {
      setUser(authUser)
      setProfile(authProfile)
      setName(authProfile?.full_name || '')
      setAvatar(authProfile?.avatar_url || null)
    }
  }, [authUser, authProfile])

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    setMsg('')
    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const filePath = `${user.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage
        .from('Avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type })
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage
        .from('Avatars')
        .getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl + '?t=' + Date.now()
      const { error: dbErr } = await supabase.from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id)
      if (dbErr) throw dbErr
      setAvatar(publicUrl)
      setMsg('✓ Photo saved!')
    } catch (err) {
      setMsg('✗ Failed: ' + err.message)
    }
    setUploading(false)
  }

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    setMsg('')
    const { error } = await supabase.from('profiles')
      .update({ full_name: name })
      .eq('user_id', user.id)
    setSaving(false)
    setMsg(error ? '✗ ' + error.message : '✓ Profile saved!')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = name?.substring(0,2).toUpperCase() || 'EN'

  return (
    <div style={{minHeight:'100vh',background:'#050507',color:'rgba(255,255,255,0.93)',fontFamily:"'Exo 2',sans-serif",paddingBottom:'90px'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;800&family=Exo+2:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');`}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid #111116',background:'#08090d'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'linear-gradient(135deg,#c084fc,#60d8fa)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',fontWeight:'800',fontSize:'13px',color:'#fff'}}>en</div>
          <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:'10px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.3)'}}>MY PROFILE</span>
        </div>
      </div>

      <div style={{maxWidth:'420px',margin:'0 auto',padding:'24px 20px'}}>

        {/* Avatar */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'28px'}}>
          <div style={{position:'relative',marginBottom:'12px'}}>
            <div style={{width:'96px',height:'96px',borderRadius:'50%',background:'linear-gradient(135deg,#1a0a30,#0d0520)',border:'2px solid rgba(192,132,252,0.3)',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 32px rgba(192,132,252,0.15)'}}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:'700',fontSize:'2rem',color:'#c084fc'}}>{initials}</span>
              }
            </div>
            <div onClick={() => fileRef.current?.click()} style={{position:'absolute',bottom:0,right:0,width:'28px',height:'28px',borderRadius:'50%',background:'linear-gradient(135deg,#c084fc,#60d8fa)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'14px',boxShadow:'0 2px 8px rgba(0,0,0,0.4)'}}>
              {uploading ? '⏳' : '📷'}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}}/>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <BadgeIcon type="founder" size={14}/>
            <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:'10px',color:'#c084fc',letterSpacing:'0.1em'}}>{profile?.enumber || 'eN·FOUNDER·001'}</span>
          </div>
          {msg && <div style={{marginTop:'10px',fontFamily:'Share Tech Mono,monospace',fontSize:'10px',color: msg.startsWith('✓') ? '#6ee7b7' : '#ff5f7e',letterSpacing:'0.1em'}}>{msg}</div>}
        </div>

        {/* Name */}
        <div style={{marginBottom:'12px'}}>
          <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'9px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.3)',marginBottom:'8px'}}>DISPLAY NAME</div>
          <input 
            id="display_name"
            name="display_name"
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Your name" 
            style={{width:'100%',padding:'14px 16px',background:'#0c0d12',border:'1px solid #1a1a24',borderRadius:'12px',color:'rgba(255,255,255,0.93)',fontFamily:"'Exo 2',sans-serif",fontSize:'0.9rem',outline:'none',boxSizing:'border-box'}}
          />
        </div>

        {/* Email */}
        <div style={{marginBottom:'24px'}}>
          <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'9px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.3)',marginBottom:'8px'}}>EMAIL</div>
          <div style={{padding:'14px 16px',background:'#08090d',border:'1px solid #111116',borderRadius:'12px',fontFamily:'Share Tech Mono,monospace',fontSize:'11px',color:'rgba(255,255,255,0.4)',letterSpacing:'0.05em'}}>{user?.email}</div>
        </div>

        {/* Badge */}
        <div style={{background:'#08090d',border:'1px solid #111116',borderRadius:'14px',padding:'16px',marginBottom:'20px'}}>
          <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:'9px',letterSpacing:'0.2em',color:'rgba(255,255,255,0.25)',marginBottom:'14px'}}>MY BADGES</div>
          <div style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(192,132,252,0.05)',border:'1px solid rgba(192,132,252,0.15)',borderRadius:'10px',padding:'10px 14px',width:'fit-content'}}>
            <BadgeIcon type="founder" size={16}/>
            <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:'9px',color:'rgba(255,255,255,0.5)',letterSpacing:'0.08em'}}>Founder eNative</span>
          </div>
        </div>

        {/* Save */}
        <button onClick={saveProfile} disabled={saving||uploading} style={{width:'100%',padding:'15px',background:'linear-gradient(135deg,#c084fc,#60d8fa)',border:'none',borderRadius:'12px',color:'#050507',fontFamily:'Rajdhani,sans-serif',fontWeight:'700',fontSize:'1rem',letterSpacing:'0.08em',cursor:'pointer',marginBottom:'10px',opacity:(saving||uploading)?0.6:1}}>
          {saving ? 'SAVING...' : 'SAVE PROFILE'}
        </button>

        <button onClick={signOut} style={{width:'100%',padding:'13px',background:'transparent',border:'1px solid #1a1a24',borderRadius:'12px',color:'rgba(255,255,255,0.3)',fontFamily:'Share Tech Mono,monospace',fontSize:'10px',letterSpacing:'0.2em',cursor:'pointer'}}>
          SIGN OUT
        </button>
      </div>
    </div>
  )
}
