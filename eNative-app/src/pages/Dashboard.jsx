import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;800&family=Exo+2:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg: #050507; --surface: #08090d; --surface2: #0c0d12; --border: #111116; --border2: #181820; --accent: #c084fc; --accent2: #60d8fa; --accent3: #6ee7b7; --gold: #fcd34d; --text: rgba(255,255,255,0.93); --mid: rgba(255,255,255,0.52); --dim: rgba(255,255,255,0.26); --red: #ff5f7e; }
  body { background: var(--bg); color: var(--text); font-family: 'Exo 2', sans-serif; }
  .app { display: flex; min-height: 100vh; background: var(--bg); }
  .main { margin-left: 68px; flex: 1; padding: 24px 20px; overflow-y: auto; }
  .topbar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 10px; }
  .greeting { font-family: 'Rajdhani', sans-serif; font-weight: 800; font-size: 22px; }
  .greeting span { color: var(--accent); }
  .sub { font-size: 12px; color: var(--dim); margin-top: 2px; letter-spacing: 0.05em; }
  .topbar-right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .pill { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.14em; padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(110,231,183,0.25); color: var(--accent3); background: rgba(110,231,183,0.05); display: flex; align-items: center; gap: 5px; }
  .pill-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent3); animation: blink 2s infinite; display: inline-block; flex-shrink: 0; }
  .pill-badge { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.14em; padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(192,132,252,0.25); color: var(--accent); background: rgba(192,132,252,0.05); }
  .hero-call { background: var(--surface); border: 1px solid var(--border2); border-radius: 20px; padding: 28px; margin-bottom: 14px; position: relative; overflow: hidden; }
  .hero-call::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 80% 50%, rgba(192,132,252,0.05) 0%, transparent 60%); pointer-events: none; }
  .hero-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.2em; color: var(--dim); margin-bottom: 14px; }
  .dial-row { display: flex; align-items: center; gap: 12px; }
  .dial-input { flex: 1; background: var(--surface2); border: 1px solid var(--border2); border-radius: 12px; padding: 13px 16px; font-family: 'Share Tech Mono', monospace; font-size: 15px; color: var(--text); outline: none; letter-spacing: 0.1em; transition: border-color 0.2s; }
  .dial-input:focus { border-color: rgba(192,132,252,0.35); }
  .call-fab { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #00c853, #00e676); border: none; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 20px rgba(0,200,83,0.35); transition: all 0.2s; }
  .call-fab:hover { transform: scale(1.05); }
  .ai-tag { display: inline-flex; align-items: center; gap: 5px; margin-top: 12px; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.1em; color: var(--accent3); }
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 14px; }
  .stat { background: var(--surface); border: 1px solid var(--border2); border-radius: 14px; padding: 16px; position: relative; overflow: hidden; }
  .stat-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; opacity: 0.8; }
  .stat-label { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 0.18em; color: var(--dim); margin-bottom: 6px; }
  .stat-val { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 20px; line-height: 1; margin-bottom: 2px; }
  .stat-sub { font-size: 10px; color: var(--dim); }
  .activity { background: var(--surface); border: 1px solid var(--border2); border-radius: 20px; padding: 20px; }
  .section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-title { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 15px; }
  .section-action { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.1em; color: var(--accent); cursor: pointer; }
  .activity-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .activity-item:last-child { border-bottom: none; }
  .act-av { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #1a0a30, #080318); border: 1px solid rgba(192,132,252,0.2); display: flex; align-items: center; justify-content: center; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 12px; color: var(--accent); flex-shrink: 0; }
  .act-info { flex: 1; min-width: 0; }
  .act-name { font-size: 13px; font-weight: 500; }
  .act-detail { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: var(--dim); margin-top: 2px; }
  .act-meta { text-align: right; flex-shrink: 0; }
  .act-dur { font-family: 'Share Tech Mono', monospace; font-size: 11px; }
  .act-time { font-size: 10px; color: var(--dim); }
  .missed { color: var(--red) !important; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
`;

const STATS = [
  { label: "TOTAL CALLS", val: "1,284", sub: "All time", c: "#c084fc" },
  { label: "MINS THIS WEEK", val: "348", sub: "+12% vs last week", c: "#fcd34d" },
  { label: "CONTACTS", val: "47", sub: "Verified eNumbers", c: "#6ee7b7" },
  { label: "CALL QUALITY", val: "98.6%", sub: "AI-optimised", c: "#60d8fa" },
];

const ACTIVITY = [
  { init: "AK", name: "Amara K.", detail: "↗ Outgoing · E-0247", dur: "4:32", time: "2m ago", missed: false },
  { init: "ZM", name: "Zara M.", detail: "↙ Missed · E-0314", dur: "—", time: "1h ago", missed: true },
  { init: "CO", name: "Chidi O.", detail: "↙ Incoming · E-1889", dur: "12:07", time: "1h ago", missed: false },
  { init: "NM", name: "Naledi M.", detail: "↗ Outgoing · E-0553", dur: "7:15", time: "3h ago", missed: false },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const name = profile?.full_name || user?.email?.split("@")[0] || "Taryl";
  const firstName = name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <Sidebar />
        <div className="main">
          <div className="topbar">
            <div>
              <div className="greeting">{greeting}, <span>{firstName}</span> 👋</div>
              <div className="sub">Pan-African Network</div>
            </div>
            <div className="topbar-right">
              <div className="pill"><span className="pill-dot" />NETWORK LIVE</div>
              <div className="pill-badge">{profile?.enumber || 'E-XXXX'} · {profile?.tier || 'MEMBER'}</div>
            </div>
          </div>

          <div className="hero-call">
            <div className="hero-label">QUICK CALL</div>
            <div className="dial-row">
              <input className="dial-input" placeholder="Enter eNumber — E-XXXX" />
              <button className="call-fab" onClick={() => navigate("/dialler")}>📞</button>
            </div>
            <div className="ai-tag"><span className="pill-dot" />SECURE P2P CHANNEL · ACTIVE</div>
          </div>

          <div className="stats-row">
            {STATS.map((s, i) => (
              <div key={i} className="stat">
                <div className="stat-bar" style={{ background: s.c }} />
                <div className="stat-label">{s.label}</div>
                <div className="stat-val" style={{ color: s.c }}>{s.val}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="activity">
            <div className="section-head">
              <div className="section-title">Recent Activity</div>
              <div className="section-action" onClick={() => navigate("/dialler")}>VIEW ALL →</div>
            </div>
            {ACTIVITY.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="act-av" style={a.missed ? { borderColor: "rgba(255,95,126,0.3)" } : {}}>{a.init}</div>
                <div className="act-info">
                  <div className={`act-name${a.missed ? " missed" : ""}`}>{a.name}</div>
                  <div className={`act-detail${a.missed ? " missed" : ""}`}>{a.detail}</div>
                </div>
                <div className="act-meta">
                  <div className={`act-dur${a.missed ? " missed" : ""}`}>{a.dur}</div>
                  <div className="act-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
