import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
const css = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#050507;--surface:#08090d;--surface2:#0c0d14;
    --border:#13141a;--border2:#1c1d26;
    --accent:#c084fc;--cyan:#60d8fa;--green:#6ee7b7;--gold:#fcd34d;--red:#ff5f7e;
    --text:rgba(255,255,255,0.93);--mid:rgba(255,255,255,0.55);--dim:rgba(255,255,255,0.28)
  }
  html{scroll-behavior:smooth}

  .en-page{background:var(--bg);color:var(--text);font-family:'Exo 2',sans-serif;line-height:1.6;overflow-x:hidden;min-height:100vh}
  .en-page::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    opacity:0.4}
  .en-page::after{content:'';position:fixed;top:-200px;left:50%;transform:translateX(-50%);
    width:900px;height:700px;border-radius:50%;pointer-events:none;z-index:0;
    background:radial-gradient(ellipse,rgba(192,132,252,0.07) 0%,transparent 70%)}

  .glow-br{position:fixed;bottom:-100px;right:-100px;width:500px;height:500px;
    border-radius:50%;pointer-events:none;z-index:0;
    background:radial-gradient(ellipse,rgba(96,216,250,0.04) 0%,transparent 70%)}

  .wrap{max-width:900px;margin:0 auto;padding:0 24px;position:relative;z-index:1}

  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
  @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

  .reveal{opacity:0;transform:translateY(32px);transition:opacity 0.7s ease,transform 0.7s ease}
  .reveal.visible{opacity:1;transform:translateY(0)}
  .reveal-left{opacity:0;transform:translateX(-32px);transition:opacity 0.7s ease,transform 0.7s ease}
  .reveal-left.visible{opacity:1;transform:translateX(0)}
  .reveal-right{opacity:0;transform:translateX(32px);transition:opacity 0.7s ease,transform 0.7s ease}
  .reveal-right.visible{opacity:1;transform:translateX(0)}
  .reveal-scale{opacity:0;transform:scale(0.94);transition:opacity 0.6s ease,transform 0.6s ease}
  .reveal-scale.visible{opacity:1;transform:scale(1)}
  .d1{transition-delay:0.05s}.d2{transition-delay:0.12s}.d3{transition-delay:0.19s}
  .d4{transition-delay:0.26s}.d5{transition-delay:0.33s}.d6{transition-delay:0.40s}

  .carousel-outer{border-top:1px solid var(--border2);border-bottom:1px solid var(--border2);
    padding:18px 0;overflow:hidden;position:relative;z-index:1}
  .carousel-fade-l{position:absolute;left:0;top:0;bottom:0;width:80px;
    background:linear-gradient(90deg,var(--bg),transparent);z-index:2;pointer-events:none}
  .carousel-fade-r{position:absolute;right:0;top:0;bottom:0;width:80px;
    background:linear-gradient(-90deg,var(--bg),transparent);z-index:2;pointer-events:none}
  .carousel-track{display:flex;gap:14px;animation:marquee 30s linear infinite;width:max-content}
  .carousel-track:hover{animation-play-state:paused}
  .city-pill{display:flex;align-items:center;gap:8px;padding:6px 18px;border-radius:30px;
    border:1px solid var(--border2);background:var(--surface);white-space:nowrap;flex-shrink:0;
    font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.14em;color:var(--mid)}

  nav.en-nav{padding:20px 0;display:flex;align-items:center;justify-content:space-between;
    border-bottom:1px solid var(--border2)}
  .nav-logo{display:flex;align-items:center;gap:12px;text-decoration:none}
  .logo-mark{width:40px;height:40px;border-radius:10px;
    background:linear-gradient(135deg,#c084fc,#60d8fa);display:flex;align-items:center;
    justify-content:center;font-family:'Rajdhani',sans-serif;font-weight:800;font-size:16px;
    color:#fff;box-shadow:0 0 24px rgba(192,132,252,0.3);flex-shrink:0}
  .logo-name{font-family:'Rajdhani',sans-serif;font-weight:800;font-size:20px;color:var(--text)}
  .logo-name span{color:var(--accent)}
  .nav-right{display:flex;align-items:center;gap:12px}
  .nav-link{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.2em;
    color:var(--dim);text-decoration:none;padding:8px 14px;border-radius:8px;
    border:1px solid var(--border2);transition:all 0.2s}
  .nav-link:hover{color:var(--text);border-color:rgba(192,132,252,0.3)}

  .btn-primary{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.92rem;
    letter-spacing:0.08em;padding:12px 24px;border-radius:10px;
    background:linear-gradient(135deg,#c084fc,#60d8fa);color:#050507;
    border:none;cursor:pointer;text-decoration:none;display:inline-block;
    transition:all 0.2s;white-space:nowrap;
    box-shadow:0 4px 20px rgba(192,132,252,0.28)}
  .btn-primary:hover{opacity:0.88;transform:translateY(-2px);
    box-shadow:0 8px 32px rgba(192,132,252,0.42)}
  .btn-secondary{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.2em;
    padding:12px 24px;border-radius:10px;background:transparent;color:var(--mid);
    border:1px solid var(--border2);cursor:pointer;text-decoration:none;
    display:inline-block;transition:all 0.2s}
  .btn-secondary:hover{border-color:rgba(192,132,252,0.3);color:var(--text)}

  .hero{padding:92px 0 84px;text-align:center;animation:fadeUp 0.9s ease forwards}
  .eyebrow{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.3em;
    color:var(--dim);margin-bottom:22px;display:flex;align-items:center;
    justify-content:center;gap:10px}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);
    animation:blink 2s infinite;display:inline-block;flex-shrink:0}
  .hero-title{font-family:'Rajdhani',sans-serif;font-weight:800;
    font-size:clamp(38px,7.5vw,74px);line-height:1.04;margin-bottom:22px;letter-spacing:-0.5px}
  .t-purple{color:var(--accent)}
  .t-cyan{color:var(--cyan)}
  .hero-sub{font-size:clamp(14px,2vw,17px);color:var(--mid);
    max-width:580px;margin:0 auto 40px;line-height:1.8}
  .hero-ctas{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:60px}
  .hero-stats{display:flex;justify-content:center;gap:52px;flex-wrap:wrap}
  .stat-val{font-family:'Rajdhani',sans-serif;font-weight:800;font-size:2.3rem;line-height:1}
  .stat-label{font-family:'Share Tech Mono',monospace;font-size:8px;
    letter-spacing:0.18em;color:var(--dim);margin-top:6px}

  .section{padding:72px 0;border-top:1px solid var(--border2)}
  .section-tag{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.25em;
    color:var(--dim);margin-bottom:14px;display:flex;align-items:center;gap:10px}
  .section-tag::after{content:'';flex:1;height:1px;background:var(--border2)}
  .section-title{font-family:'Rajdhani',sans-serif;font-weight:700;
    font-size:clamp(22px,4vw,38px);margin-bottom:28px;line-height:1.15}
  .section-title span{color:var(--accent)}

  .mission-block{background:linear-gradient(135deg,rgba(192,132,252,0.06),rgba(96,216,250,0.03));
    border:1px solid rgba(192,132,252,0.15);border-radius:20px;padding:40px 36px;text-align:center}
  .mission-tag{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.3em;
    color:var(--dim);margin-bottom:16px}
  .mission-title{font-family:'Rajdhani',sans-serif;font-weight:800;
    font-size:clamp(24px,4vw,40px);line-height:1.15;margin-bottom:16px}
  .mission-body{color:var(--mid);font-size:15px;max-width:560px;margin:0 auto;line-height:1.8}

  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .card{background:var(--surface);border:1px solid var(--border2);border-radius:18px;
    padding:26px;position:relative;overflow:hidden;transition:border-color 0.2s,transform 0.2s}
  .card:hover{border-color:rgba(192,132,252,0.22);transform:translateY(-3px)}
  .card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px}
  .card-purple::before{background:linear-gradient(90deg,transparent,rgba(192,132,252,0.5),transparent)}
  .card-cyan::before{background:linear-gradient(90deg,transparent,rgba(96,216,250,0.5),transparent)}
  .card-green::before{background:linear-gradient(90deg,transparent,rgba(110,231,183,0.5),transparent)}
  .card-gold::before{background:linear-gradient(90deg,transparent,rgba(252,211,77,0.5),transparent)}
  .card-title{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:17px;margin-bottom:9px}
  .card-body{font-size:13px;color:var(--mid);line-height:1.75}

  .enc-banner{display:flex;align-items:center;gap:14px;padding:16px 22px;border-radius:12px;
    background:rgba(110,231,183,0.05);border:1px solid rgba(110,231,183,0.2);margin-bottom:20px}
  .enc-label{font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:0.2em;
    color:var(--green);margin-bottom:4px}
  .enc-body{font-size:13px;color:var(--mid);line-height:1.65}

  .quote{border-left:2px solid var(--accent);padding:18px 22px;
    background:rgba(192,132,252,0.04);border-radius:0 12px 12px 0;margin-top:28px}
  .quote-text{font-family:'Rajdhani',sans-serif;font-weight:600;
    font-size:clamp(16px,3vw,22px);line-height:1.4;margin-bottom:8px}
  .quote-attr{font-family:'Share Tech Mono',monospace;font-size:9px;
    letter-spacing:0.14em;color:var(--dim)}

  .badges-row{display:flex;gap:12px;flex-wrap:wrap}
  .badge-pill{display:flex;align-items:center;padding:12px 20px;border-radius:12px;
    border:1px solid;font-family:'Share Tech Mono',monospace;font-size:9px;
    letter-spacing:0.1em;transition:transform 0.2s;cursor:default}
  .badge-pill:hover{transform:translateY(-2px)}

  .waitlist-card{background:linear-gradient(135deg,rgba(192,132,252,0.08),rgba(96,216,250,0.04));
    border:1px solid rgba(192,132,252,0.2);border-radius:24px;padding:56px 40px;
    text-align:center;position:relative;overflow:hidden}
  .waitlist-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,rgba(192,132,252,0.6),transparent)}
  .slots-pill{display:inline-flex;align-items:center;gap:6px;
    background:rgba(192,132,252,0.08);border:1px solid rgba(192,132,252,0.2);
    border-radius:20px;padding:7px 16px;font-family:'Share Tech Mono',monospace;
    font-size:9px;letter-spacing:0.12em;color:var(--accent);margin-bottom:24px}
  .waitlist-title{font-family:'Rajdhani',sans-serif;font-weight:800;
    font-size:clamp(26px,4.5vw,44px);margin-bottom:14px;line-height:1.1}
  .waitlist-sub{font-size:15px;color:var(--mid);margin-bottom:32px;
    max-width:500px;margin-left:auto;margin-right:auto;line-height:1.8}
  .waitlist-form{display:flex;gap:10px;max-width:460px;margin:0 auto 20px;
    flex-wrap:wrap;justify-content:center}
  .waitlist-input{flex:1;min-width:200px;padding:14px 18px;
    background:rgba(255,255,255,0.05);border:1px solid var(--border2);
    border-radius:10px;color:var(--text);font-family:'Exo 2',sans-serif;
    font-size:0.9rem;outline:none;transition:border-color 0.2s}
  .waitlist-input:focus{border-color:rgba(192,132,252,0.4)}
  .waitlist-input::placeholder{color:var(--dim)}
  .waitlist-note{font-family:'Share Tech Mono',monospace;font-size:9px;
    letter-spacing:0.14em;color:var(--dim)}

  footer.en-footer{border-top:1px solid var(--border2);padding:36px 0;
    display:flex;align-items:center;justify-content:space-between;
    flex-wrap:wrap;gap:16px;margin-top:72px}
  .footer-brand{font-family:'Rajdhani',sans-serif;font-weight:700;
    font-size:17px;margin-bottom:4px}
  .footer-brand span{color:var(--accent)}
  .footer-note{font-family:'Share Tech Mono',monospace;font-size:9px;
    letter-spacing:0.14em;color:var(--dim)}

  @media(max-width:640px){
    .two-col{grid-template-columns:1fr}
    .hero-stats{gap:28px}
    .waitlist-card{padding:36px 20px}
    .nav-link{display:none}
    .hero{padding:64px 0 56px}
    .section{padding:52px 0}
    .mission-block{padding:28px 20px}
  }
`

const cities = [
  '🇳🇬 LAGOS','🇿🇦 CAPE TOWN','🇿🇦 SOUTH AFRICA','🇬🇧 LONDON','🇺🇸 NEW YORK',
  '🇰🇪 NAIROBI','🇩🇪 BERLIN','🇬🇭 ACCRA','🇦🇪 DUBAI','🇸🇳 DAKAR',
  '🇧🇷 SÃO PAULO','🇷🇼 KIGALI','🇫🇷 PARIS','🇸🇬 SINGAPORE','🇨🇦 TORONTO',
  '🇪🇹 ADDIS ABABA','🇺🇬 KAMPALA'
]

export default function Landing() {
  const pageRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      })
    }, { threshold: 0.12 })

    const els = pageRef.current?.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
    els?.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
const handleWaitlist = async (e) => {
  e.preventDefault()
  const input = e.target.querySelector('input')
  const email = input?.value
  if (email) {
    const { error } = await supabase
      .from('waitlist')
      .insert({ email })
    
    if (error) {
      alert('Something went wrong, please try again.')
      console.error(error)
    } else {
      await supabase.functions.invoke('send-waitlist-email', {
        body: { email }
      })
      alert(`You're on the list! Check your inbox at ${email}`)
      input.value = ''
    }
  }
}
  return (
    <>
      <style>{css}</style>
      <div className="en-page" ref={pageRef}>
        <div className="glow-br" />

        <div className="wrap">
          {/* NAV */}
          <nav className="en-nav">
            <a href="#" className="nav-logo">
              <div className="logo-mark">en</div>
              <div className="logo-name">e<span>Native</span></div>
            </a>
            <div className="nav-right">
              <a href="#features" className="nav-link">FEATURES</a>
              <a href="#badges" className="nav-link">BADGES</a>
              <span className="nav-link" style={{cursor:'pointer',borderColor:'rgba(192,132,252,0.4)',color:'#c084fc'}} onClick={() => navigate('/login')}>LOGIN →</span>
            </div>
          </nav>

          {/* HERO */}
          <div className="hero">
            <div className="eyebrow">
              <span className="live-dot" />
              LIVE BETA &nbsp;·&nbsp; BORN IN AFRICA &nbsp;·&nbsp; BUILT FOR THE WORLD
            </div>
            <h1 className="hero-title">
              One number.<br /><span className="t-purple">Every country.</span><br /><span className="t-cyan">Forever yours.</span>
            </h1>
            <p className="hero-sub">
              eNative gives you a permanent, verified digital phone identity — an eNumber that never gets recycled, never requires a SIM, and works across every border on the planet.
            </p>
            <div className="hero-ctas">
              <span className="btn-primary" style={{cursor:'pointer'}} onClick={() => navigate('/login')}>ENTER APP →</span>
              <a href="#waitlist" className="btn-secondary">JOIN WAITLIST</a>
            </div>
            <div className="hero-stats">
              <div>
                <div className="stat-val" style={{color:'var(--accent)'}}>1,000</div>
                <div className="stat-label">FOUNDER SLOTS</div>
              </div>
              <div>
                <div className="stat-val" style={{color:'var(--cyan)'}}>195+</div>
                <div className="stat-label">COUNTRIES</div>
              </div>
              <div>
                <div className="stat-val" style={{color:'var(--green)'}}>0</div>
                <div className="stat-label">SIM CARDS NEEDED</div>
              </div>
              <div>
                <div className="stat-val" style={{color:'var(--gold)'}}>∞</div>
                <div className="stat-label">YOUR NUMBER LASTS</div>
              </div>
            </div>
          </div>
        </div>

        {/* CITY CAROUSEL — full width */}
        <div className="carousel-outer">
          <div className="carousel-fade-l" />
          <div className="carousel-fade-r" />
          <div className="carousel-track">
            {[...cities, ...cities].map((city, i) => (
              <div key={i} className="city-pill">{city}</div>
            ))}
          </div>
        </div>

        <div className="wrap">

          {/* MISSION */}
          <div className="section">
            <div className="mission-block reveal">
              <div className="mission-tag">OUR MISSION</div>
              <div className="mission-title">
                <span className="t-purple">Born in Africa.</span> <span className="t-cyan">Built for the world.</span>
              </div>
              <p className="mission-body">
                Identity is a global problem. Over 1 billion people worldwide lack a stable, portable phone identity. eNative solves this — starting where the problem is most acute, scaling everywhere it matters.
              </p>
            </div>
          </div>

          {/* PROBLEM */}
          <div className="section">
            <div className="section-tag reveal">THE PROBLEM</div>
            <h2 className="section-title reveal">Phone numbers <span>aren't built for how we live.</span></h2>
            <div className="two-col">
              <div className="card card-purple reveal-left">
                <div className="card-title">The Broken System</div>
                <div className="card-body">Phone numbers are tied to SIM cards that get recycled, expire, or disappear when you move country or switch carriers. Your identity is owned by a telecom — not by you. Students lose professors. Entrepreneurs lose clients. Diaspora families lose each other.</div>
              </div>
              <div className="card card-cyan reveal-right">
                <div className="card-title">The eNative Fix</div>
                <div className="card-body">Your eNumber lives in the cloud — not on a SIM. Permanently assigned, verified, and works on any device with internet anywhere on earth. Move from Lagos to London to Los Angeles. Your eNumber follows you. It never changes. It's yours forever.</div>
              </div>
            </div>
            <div className="quote reveal">
              <div className="quote-text">"Born in Africa. Built for the world."</div>
              <div className="quote-attr">TARYL OGLE · FOUNDER · EONX</div>
            </div>
          </div>

          {/* FEATURES */}
          <div className="section" id="features">
            <div className="section-tag reveal">FEATURES</div>
            <h2 className="section-title reveal">Everything your <span>eNumber can do.</span></h2>
            <div className="two-col">
              <div className="card card-purple reveal-left d1">
                <div className="card-title">📞 Call Anyone, Anywhere</div>
                <div className="card-body">Make and receive crystal-clear calls over WiFi or mobile data. No SIM. No roaming charges. No borders. Works on any device, any OS, any country.</div>
              </div>
              <div className="card card-cyan reveal-right d1">
                <div className="card-title">🛡️ Peer-to-Peer Privacy</div>
                <div className="card-body">Every call is end-to-end encrypted using P2P WebRTC technology. No middleman, no recordings, no interception. Your privacy is baked into the protocol itself.</div>
              </div>
              <div className="card card-green reveal-left d2">
                <div className="card-title">⚡ Low Bandwidth Mode</div>
                <div className="card-body">Adaptive audio quality with Voice Activity Detection. Crystal clear calls at 8kbps. Built for Africa, Southeast Asia, and anywhere connectivity is a challenge.</div>
              </div>
              <div className="card card-gold reveal-right d2">
                <div className="card-title">🔗 QR Connect</div>
                <div className="card-body">Share your eNumber instantly with a QR code. Scan to connect. No typing, no mistakes, no friction. Works offline for sharing, online for calling.</div>
              </div>
            </div>
            <div style={{marginTop:'14px'}}>
              <div className="enc-banner reveal">
                <span style={{fontSize:'22px'}}>🔒</span>
                <div>
                  <div className="enc-label">END-TO-END ENCRYPTED</div>
                  <div className="enc-body">Every call on eNative is end-to-end encrypted using WebRTC DTLS-SRTP. Your conversations are private by default — no eavesdropping, no interception, no exceptions.</div>
                </div>
              </div>
            </div>
          </div>

          {/* BADGES */}
          <div className="section" id="badges">
            <div className="section-tag reveal">IDENTITY BADGES</div>
            <h2 className="section-title reveal">Your eNumber tells the <span>world who you are.</span></h2>
            <p style={{color:'var(--mid)',fontSize:'14px',marginBottom:'24px',lineHeight:'1.8'}} className="reveal">
              eNative badges are verified status markers attached to your eNumber. They signal trust, capability, and credibility — to every person you call.
            </p>
            <div className="badges-row reveal">
              <div className="badge-pill" style={{borderColor:'rgba(110,231,183,0.3)',color:'var(--green)',background:'rgba(110,231,183,0.05)'}}>
                ✓ &nbsp; VERIFIED IDENTITY
              </div>
              <div className="badge-pill" style={{borderColor:'rgba(192,132,252,0.3)',color:'var(--accent)',background:'rgba(192,132,252,0.05)'}}>
                ★ &nbsp; FOUNDER MEMBER
              </div>
              <div className="badge-pill" style={{borderColor:'rgba(96,216,250,0.3)',color:'var(--cyan)',background:'rgba(96,216,250,0.05)'}}>
                🌍 &nbsp; GLOBAL CALLER
              </div>
              <div className="badge-pill" style={{borderColor:'rgba(252,211,77,0.3)',color:'var(--gold)',background:'rgba(252,211,77,0.05)'}}>
                ⚡ &nbsp; EARLY ADOPTER
              </div>
            </div>
          </div>

          {/* WAITLIST */}
          <div className="section" id="waitlist">
            <div className="waitlist-card reveal-scale">
              <div className="slots-pill">
                <span className="live-dot" />
                1,000 FOUNDER SLOTS — LIMITED
              </div>
              <div className="waitlist-title">
                Claim your eNumber.<br /><span className="t-cyan">Before someone else does.</span>
              </div>
              <p className="waitlist-sub">
                Free during beta. Permanent from day one. Your eNumber is waiting — but founder slots are limited to the first 1,000 people.
              </p>
              <form className="waitlist-form" onSubmit={handleWaitlist}>
                <input
                  type="email"
                  className="waitlist-input"
                  placeholder="your@email.com"
                  required
                />
                <button type="submit" className="btn-primary">JOIN WAITLIST →</button>
              </form>
              <div className="waitlist-note">NO SPAM · NO SIM · NO BORDERS · FREE DURING BETA</div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="en-footer">
            <div>
              <div className="footer-brand">e<span>Native</span></div>
              <div className="footer-note">BORN IN AFRICA · BUILT FOR THE WORLD</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div className="footer-note" style={{marginBottom:'4px'}}>FOUNDER · TARYL OGLE · @TARYL_OGLE</div>
              <div className="footer-note">e-native-app.vercel.app</div>
            </div>
          </footer>

        </div>
      </div>
    </>
  )
}
