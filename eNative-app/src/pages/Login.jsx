import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { user, profile } = useAuth()

  useEffect(() => {
    if (user && profile?.enumber) {
      navigate('/dashboard')
    }
  }, [user, profile, navigate])

  const routeAuthenticatedUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('enumber')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      throw profileError
    }

    navigate(profile?.enumber ? '/dashboard' : '/setup')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.session) {
          await routeAuthenticatedUser()
        } else {
          setMessage('Check your email to confirm your account!')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        await routeAuthenticatedUser()
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const handleGithub = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'github' })
  }

  return (
    <div style={{
      minHeight:'100vh',
      background:'#050507',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      fontFamily:"'Exo 2', sans-serif",
      padding:'24px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;800&family=Exo+2:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');
        * { box-sizing: border-box; }
        .login-card {
          width: 100%;
          max-width: 400px;
          background: #08090d;
          border: 1px solid #111116;
          border-radius: 20px;
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        .login-logo {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #c084fc, #60d8fa);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 800; font-size: 20px; color: #fff;
          margin-bottom: 24px;
          box-shadow: 0 0 32px rgba(192,132,252,0.25);
        }
        .login-title {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 800; font-size: 1.6rem;
          color: rgba(255,255,255,0.93);
          margin-bottom: 6px; letter-spacing: -0.3px;
          text-align: center;
        }
        .login-sub {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.65rem; letter-spacing: 0.2em;
          color: rgba(255,255,255,0.28);
          margin-bottom: 36px; text-align: center;
        }
        .social-btn {
          width: 100%; padding: 13px 20px;
          border-radius: 12px;
          border: 1px solid #1a1a24;
          background: #0c0d12;
          color: rgba(255,255,255,0.75);
          font-family: 'Exo 2', sans-serif;
          font-size: 0.88rem; font-weight: 500;
          cursor: pointer;
          display: flex; align-items: center;
          justify-content: center; gap: 12px;
          transition: all 0.18s;
          margin-bottom: 10px;
        }
        .social-btn:hover {
          border-color: rgba(192,132,252,0.25);
          background: rgba(192,132,252,0.05);
          color: rgba(255,255,255,0.93);
        }
        .divider {
          width: 100%; display: flex;
          align-items: center; gap: 12px;
          margin: 20px 0;
        }
        .divider-line {
          flex: 1; height: 1px;
          background: #111116;
        }
        .divider-text {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.6rem; letter-spacing: 0.2em;
          color: rgba(255,255,255,0.2);
        }
        .input-field {
          width: 100%; padding: 13px 16px;
          background: #0c0d12;
          border: 1px solid #1a1a24;
          border-radius: 12px;
          color: rgba(255,255,255,0.93);
          font-family: 'Exo 2', sans-serif;
          font-size: 0.88rem; outline: none;
          margin-bottom: 10px;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: rgba(192,132,252,0.35); }
        .input-field::placeholder { color: rgba(255,255,255,0.2); }
        .submit-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #c084fc, #60d8fa);
          border: none; border-radius: 12px;
          color: #050507; font-family: 'Rajdhani', sans-serif;
          font-weight: 700; font-size: 1rem;
          letter-spacing: 0.08em; cursor: pointer;
          margin-top: 6px;
          transition: opacity 0.2s, transform 0.2s;
        }
        .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.5; cursor: default; }
        .toggle-text {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.3);
          margin-top: 20px; text-align: center;
        }
        .toggle-link {
          color: #c084fc; cursor: pointer;
          margin-left: 5px;
        }
        .toggle-link:hover { text-decoration: underline; }
        .error-msg { color: #ff5f7e; font-size: 0.78rem; text-align: center; margin-bottom: 8px; width: 100%; }
        .success-msg { color: #6ee7b7; font-size: 0.78rem; text-align: center; margin-bottom: 8px; width: 100%; }
        .terms {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.58rem; letter-spacing: 0.05em;
          color: rgba(255,255,255,0.18);
          text-align: center; margin-top: 20px;
          line-height: 1.6;
        }
        .terms a { color: rgba(192,132,252,0.5); text-decoration: none; }
      `}</style>

      <div className="login-card">
        <div className="login-logo">en</div>
        <div className="login-title">
          {isSignUp ? 'Create your eNative ID' : 'Welcome back'}
        </div>
        <div className="login-sub">
          {isSignUp ? 'JOIN THE NATIVE NETWORK' : 'SIGN IN TO YOUR NATIVE WORKSPACE'}
        </div>

        <button className="social-btn" onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <button className="social-btn" onClick={handleGithub}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          Continue with GitHub
        </button>

        <div className="divider">
          <div className="divider-line"></div>
          <span className="divider-text">OR</span>
          <div className="divider-line"></div>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {message && <div className="success-msg">{message}</div>}

        <input className="input-field" type="email" placeholder="Email address"
          value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input-field" type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)} />

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
        </button>

        <div className="toggle-text">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <span className="toggle-link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </div>

        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <div style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.25)',
            textAlign: 'center',
            marginBottom: '12px'
          }}>
            POC TEST MODE — ENTER YOUR eNUMBER
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <span style={{
              padding: '12px 14px',
              background: '#0c0d12',
              border: '1px solid rgba(192,132,252,0.2)',
              borderRadius: '12px 0 0 12px',
              color: '#c084fc',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center'
            }}>E-</span>
            <input
              id="mock-enumber-input"
              type="text"
              placeholder="1001"
              maxLength={4}
              style={{
                flex: 1,
                padding: '12px 14px',
                background: '#0c0d12',
                border: '1px solid rgba(192,132,252,0.2)',
                borderLeft: 'none',
                borderRadius: '0 12px 12px 0',
                color: 'rgba(255,255,255,0.93)',
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '1.1rem',
                letterSpacing: '0.2em',
                outline: 'none'
              }}
            />
          </div>
          <button
            onClick={() => {
              const input = document.getElementById('mock-enumber-input');
              const val = input?.value?.trim();
              if (!val || val.length < 1) {
                alert('Enter a number like 1001 or 1002');
                return;
              }
              localStorage.clear();
              localStorage.setItem('mock_enumber', val);
              window.location.href = '/dashboard';
            }}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, rgba(192,132,252,0.15), rgba(96,216,250,0.08))',
              border: '1px solid rgba(192,132,252,0.3)',
              borderRadius: '12px',
              color: '#c084fc',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            LAUNCH AS E-{'{number}'} →
          </button>
          <div style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.55rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.18)',
            textAlign: 'center',
            marginTop: '10px',
            lineHeight: '1.8'
          }}>
            DEVICE A → E-1001 &nbsp;·&nbsp; DEVICE B → E-1002<br/>
            DIAL THE OTHER DEVICE'S NUMBER TO CONNECT
          </div>
        </div>

        <div className="terms">
          By continuing, you agree to eNative's<br/>
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </div>
      </div>
    </div>
  )
}
