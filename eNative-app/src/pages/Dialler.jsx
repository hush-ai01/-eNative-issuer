import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWebRTCSignal } from "../context/WebRTCContext";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;800&family=Exo+2:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg: #050507; --surface: #08090d; --surface2: #0c0d12; --border: #111116; --border2: #181820; --accent: #c084fc; --accent2: #60d8fa; --accent3: #6ee7b7; --text: rgba(255,255,255,0.93); --mid: rgba(255,255,255,0.52); --dim: rgba(255,255,255,0.26); --red: #ff5f7e; }
  body { background: var(--bg); color: var(--text); font-family: 'Exo 2', sans-serif; }
  .app { display: flex; min-height: 100vh; background: var(--bg); }
  .main { margin-left: 68px; flex: 1; padding: 24px 20px; overflow-y: auto; }
  .topbar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .page-title { font-family: 'Rajdhani', sans-serif; font-weight: 800; font-size: 20px; }
  .page-sub { font-size: 12px; color: var(--dim); margin-top: 2px; letter-spacing: 0.05em; }
  .pill { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.14em; padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(110,231,183,0.25); color: var(--accent3); background: rgba(110,231,183,0.05); display: flex; align-items: center; gap: 5px; }
  .pill-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent3); animation: blink 2s infinite; display: inline-block; flex-shrink: 0; }
  .tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px; }
  .tab { padding: 10px 8px; border-radius: 12px; border: 1px solid var(--border2); background: var(--surface); cursor: pointer; text-align: center; transition: all 0.18s; }
  .tab.active { border-color: rgba(192,132,252,0.35); background: rgba(192,132,252,0.07); }
  .tab-icon { font-size: 18px; margin-bottom: 4px; }
  .tab-label { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 0.12em; color: var(--dim); }
  .tab.active .tab-label { color: var(--accent); }
  .section { display: none; }
  .section.active { display: block; }

  /* KEYPAD */
  .keypad-display { background: var(--surface2); border: 1px solid var(--border2); border-radius: 14px; padding: 16px 20px; margin-bottom: 16px; text-align: center; }
  .keypad-num { font-family: 'Share Tech Mono', monospace; font-size: 28px; color: var(--text); letter-spacing: 0.15em; min-height: 40px; }
  .keypad-hint { font-size: 11px; color: var(--dim); margin-top: 4px; }
  .keys { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
  .key { background: var(--surface); border: 1px solid var(--border2); border-radius: 12px; padding: 14px; text-align: center; cursor: pointer; transition: all 0.15s; user-select: none; }
  .key:hover { background: var(--surface2); border-color: rgba(192,132,252,0.2); }
  .key:active { transform: scale(0.95); background: rgba(192,132,252,0.08); }
  .key-num { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 22px; color: var(--text); line-height: 1; }
  .key-alpha { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 0.12em; color: var(--dim); margin-top: 2px; }
  .key-special { background: transparent; border-color: transparent; }
  .key-special:hover { background: rgba(255,255,255,0.03); border-color: transparent; }
  .call-btn { width: 100%; height: 56px; border-radius: 16px; border: none; background: linear-gradient(135deg, #22c55e, #00e676); color: #fff; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 16px; letter-spacing: 2px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 20px rgba(34,197,94,0.3); transition: all 0.2s; }
  .call-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(34,197,94,0.4); }
  .end-btn { width: 100%; height: 48px; border-radius: 14px; border: 1px solid rgba(255,95,126,0.3); background: rgba(255,95,126,0.08); color: var(--red); font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }

  /* IN CALL */
  .incall { text-align: center; padding: 16px 0 24px; }
  .incall-av { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #2d1060, #080318); border: 2px solid rgba(192,132,252,0.3); display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px; box-shadow: 0 0 32px rgba(192,132,252,0.15); animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{box-shadow:0 0 32px rgba(192,132,252,0.15)} 50%{box-shadow:0 0 48px rgba(192,132,252,0.3)} }
  .incall-name { font-family: 'Rajdhani', sans-serif; font-weight: 800; font-size: 24px; margin-bottom: 4px; }
  .incall-timer { font-family: 'Share Tech Mono', monospace; font-size: 14px; color: var(--dim); margin-bottom: 4px; }
  .incall-ai { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: var(--accent3); letter-spacing: 0.1em; margin-bottom: 20px; }
  .wave { display: flex; align-items: center; justify-content: center; gap: 3px; margin-bottom: 24px; height: 32px; }
  .wave-bar { width: 3px; border-radius: 2px; background: var(--accent); animation: wave 1s ease-in-out infinite; }
  @keyframes wave { 0%,100%{height:4px;opacity:0.3} 50%{height:24px;opacity:1} }
  .incall-actions { display: flex; gap: 12px; justify-content: center; margin-bottom: 20px; }
  .act-btn { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border2); background: var(--surface2); font-size: 18px; cursor: pointer; transition: all 0.18s; }
  .act-btn:hover { border-color: rgba(192,132,252,0.3); background: rgba(192,132,252,0.08); }

  /* RECENTS */
  .filter-row { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
  .filter-btn { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.12em; padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border2); background: transparent; color: var(--dim); cursor: pointer; transition: all 0.18s; }
  .filter-btn.active { border-color: rgba(192,132,252,0.35); color: var(--accent); background: rgba(192,132,252,0.07); }
  .recent-item { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s; }
  .recent-item:last-child { border-bottom: none; }
  .recent-item:hover { background: rgba(255,255,255,0.02); border-radius: 8px; padding-left: 8px; }
  .recent-av { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #1a0a30, #080318); border: 1px solid rgba(192,132,252,0.2); display: flex; align-items: center; justify-content: center; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 13px; color: var(--accent); flex-shrink: 0; }
  .recent-info { flex: 1; }
  .recent-name { font-size: 14px; font-weight: 500; }
  .recent-detail { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: var(--dim); margin-top: 2px; }
  .recent-meta { text-align: right; }
  .recent-dur { font-family: 'Share Tech Mono', monospace; font-size: 11px; }
  .recent-time { font-size: 10px; color: var(--dim); margin-top: 2px; }
  .missed { color: var(--red) !important; }

  /* CONTACTS */
  .search-box { width: 100%; background: var(--surface2); border: 1px solid var(--border2); border-radius: 12px; padding: 11px 16px; font-family: 'Exo 2', sans-serif; font-size: 13px; color: var(--text); outline: none; margin-bottom: 16px; transition: border-color 0.2s; }
  .search-box:focus { border-color: rgba(192,132,252,0.35); }
  .contact-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .contact-item:last-child { border-bottom: none; }
  .contact-av { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #1a0a30, #080318); border: 1px solid rgba(192,132,252,0.2); display: flex; align-items: center; justify-content: center; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 13px; color: var(--accent); flex-shrink: 0; position: relative; }
  .online-dot { position: absolute; bottom: 1px; right: 1px; width: 9px; height: 9px; border-radius: 50%; background: var(--accent3); border: 1.5px solid var(--bg); }
  .contact-info { flex: 1; }
  .contact-name { font-size: 14px; font-weight: 500; }
  .contact-enum { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: var(--dim); margin-top: 2px; }
  .contact-actions { display: flex; gap: 8px; }
  .c-btn { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border2); background: var(--surface2); cursor: pointer; font-size: 13px; transition: all 0.18s; }
  .c-btn.call { border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.08); }
  .c-btn.msg { border-color: rgba(192,132,252,0.3); background: rgba(192,132,252,0.08); }

  /* MESSAGES */
  .msg-item { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
  .msg-item:last-child { border-bottom: none; }
  .msg-av { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #1a0a30, #080318); border: 1px solid rgba(192,132,252,0.2); display: flex; align-items: center; justify-content: center; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 13px; color: var(--accent); flex-shrink: 0; position: relative; }
  .msg-info { flex: 1; min-width: 0; }
  .msg-name { font-size: 14px; font-weight: 500; }
  .msg-preview { font-size: 12px; color: var(--dim); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .msg-meta { text-align: right; flex-shrink: 0; }
  .msg-time { font-size: 10px; color: var(--dim); margin-bottom: 4px; }
  .msg-badge { width: 18px; height: 18px; border-radius: 50%; background: var(--accent); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-left: auto; }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
`;

const RECENTS = [
  { init: "AK", name: "Amara K.", detail: "↗ Outgoing · E-0247", dur: "4:32", time: "2m ago", missed: false },
  { init: "ZM", name: "Zara M.", detail: "↙ Missed · E-0314", dur: "—", time: "1h ago", missed: true },
  { init: "CO", name: "Chidi O.", detail: "↙ Incoming · E-1889", dur: "12:07", time: "1h ago", missed: false },
  { init: "NM", name: "Naledi M.", detail: "↗ Outgoing · E-0553", dur: "7:15", time: "3h ago", missed: false },
  { init: "KA", name: "Kwame A.", detail: "↙ Missed · E-2381", dur: "—", time: "Yesterday", missed: true },
];

const CONTACTS = [
  { init: "AK", name: "Amara Kone", enum: "E-0247", online: true },
  { init: "ZM", name: "Zara Mensah", enum: "E-0314", online: true },
  { init: "CO", name: "Chidi Okafor", enum: "E-1889", online: false },
  { init: "DP", name: "Dev Patel", enum: "E-0892", online: false },
];

const MESSAGES = [
  { init: "AK", name: "Amara Kone", preview: "Sure, sending now 👌", time: "08:25", unread: 2, online: true },
  { init: "ZM", name: "Zara Mensah", preview: "When are you free to call?", time: "07:14", unread: 0, online: true },
  { init: "DP", name: "Dev Patel", preview: "The API is ready for testing", time: "Yesterday", unread: 1, online: false },
  { init: "LO", name: "Lena Osei", preview: "Welcome to eNative! 🎉", time: "Monday", unread: 0, online: false },
];

export default function Dialler() {
  const navigate = useNavigate();
  const webrtc = useWebRTCSignal();
  
  if (!webrtc) return null; // Safety for early render

  const { incomingCall, answerCall, endCall: webrtcEnd, rejectCall, startCall: webrtcStart, callStatus, profile } = webrtc;
  const [tab, setTab] = useState("keypad");
  const [dialVal, setDialVal] = useState("E-");
  const [callingName, setCallingName] = useState("");
  const [timer, setTimer] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const lowBandwidth = false; // Could be a setting later

  useEffect(() => {
    if (callStatus === 'idle') {
      setTimer(0);
    } else if (callStatus === 'active') {
      const iv = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(iv);
    }
  }, [callStatus]);

  const m = String(Math.floor(timer / 60)).padStart(2, "0");
  const s = String(timer % 60).padStart(2, "0");

  const startCall = (num, name = "") => {
    setDialVal(num);
    setCallingName(name);
    webrtcStart(num, null, (remoteStream) => {
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.play();
    });
  };

  const endCall = () => {
    setCallingName("");
    setDialVal("E-");
    webrtcEnd();
  };

  const dialPress = (k) => { if (dialVal.length < 8) setDialVal(v => v + k); };
  const dialDelete = () => { if (dialVal.length > 2) setDialVal(v => v.slice(0, -1)); };

  const filteredRecents = filter === "ALL" ? RECENTS
    : filter === "MISSED" ? RECENTS.filter(r => r.missed)
    : filter === "INCOMING" ? RECENTS.filter(r => r.detail.includes("Incoming"))
    : RECENTS.filter(r => r.detail.includes("Outgoing"));

  const filteredContacts = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.enum.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: "keypad", icon: "⌨️", label: "KEYPAD" },
    { id: "recents", icon: "🕐", label: "RECENTS" },
    { id: "contacts", icon: "👥", label: "CONTACTS" },
    { id: "messages", icon: "💬", label: "MESSAGES" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="topbar">
            <div>
              <div className="page-title">Dialler</div>
              <div className="page-sub">eNumber to eNumber · P2P Encrypted</div>
            </div>
            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
              <div style={{fontFamily:'Share Tech Mono, monospace', fontSize:'9px', color:'var(--dim)', letterSpacing:'0.1em'}}>
                SIGNAL: <span style={{color:'var(--accent)'}}>{profile?.enumber || 'OFFLINE'}</span>
              </div>
              <div className="pill"><span className="pill-dot" />NETWORK LIVE</div>
            </div>
          </div>

          <div className="tabs">
            {TABS.map(t => (
              <div key={t.id} className={`tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                <div className="tab-icon">{t.icon}</div>
                <div className="tab-label">{t.label}</div>
              </div>
            ))}
          </div>

          {/* KEYPAD */}
          <div className={`section${tab === "keypad" ? " active" : ""}`}>
            {callStatus !== 'idle' ? (
              <div className="incall">
                <div className="incall-av">📞</div>
                <div className="incall-name">{callingName || dialVal}</div>
                <div className="incall-timer">{m}:{s}</div>
                <div className="incall-ai">● {callStatus.toUpperCase()} · {lowBandwidth ? '20kbps OPUS' : 'HD AUDIO'}</div>
                <div className="wave">
                  {Array(20).fill(0).map((_, i) => (
                    <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.05}s`, height: `${Math.random() * 20 + 4}px` }} />
                  ))}
                </div>
                <div className="incall-actions">
                  <div className="act-btn">🔇</div>
                  <div className="act-btn">🔈</div>
                  <div className="act-btn" onClick={() => startCall(dialVal, null, (s) => {
                    const audio = document.createElement('audio');
                    audio.srcObject = s;
                    audio.play();
                  })}>📡</div>
                </div>
                <button className="end-btn" onClick={endCall}>✕ &nbsp; END CALL</button>
              </div>
            ) : (
              <>
                <div className="keypad-display">
                  <div className="keypad-num">{dialVal}</div>
                  <div className="keypad-hint">Enter eNumber to connect</div>
                </div>
                <div className="keys">
                  {["1","2","3","4","5","6","7","8","9"].map(k => (
                    <div key={k} className="key" onClick={() => dialPress(k)}>
                      <div className="key-num">{k}</div>
                      <div className="key-alpha">{["","ABC","DEF","GHI","JKL","MNO","PQRS","TUV","WXYZ"][parseInt(k)-1]}</div>
                    </div>
                  ))}
                  <div className="key key-special" />
                  <div className="key" onClick={() => dialPress("0")}><div className="key-num">0</div><div className="key-alpha">+</div></div>
                  <div className="key key-special" style={{ fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={dialDelete}>⌫</div>
                </div>
                <button className="call-btn" onClick={() => dialVal.length > 2 && startCall(dialVal)}>📞 &nbsp; CALL</button>
              </>
            )}
          </div>

          {/* RECENTS */}
          <div className={`section${tab === "recents" ? " active" : ""}`}>
            <div className="filter-row">
              {["ALL","MISSED","INCOMING","OUTGOING"].map(f => (
                <button key={f} className={`filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            {filteredRecents.map((r, i) => (
              <div key={i} className="recent-item" onClick={() => startCall(r.detail.split("· ")[1], r.name)}>
                <div className="recent-av" style={r.missed ? { borderColor: "rgba(255,95,126,0.3)", color: "var(--red)" } : {}}>{r.init}</div>
                <div className="recent-info">
                  <div className={`recent-name${r.missed ? " missed" : ""}`}>{r.name}</div>
                  <div className={`recent-detail${r.missed ? " missed" : ""}`}>{r.detail}</div>
                </div>
                <div className="recent-meta">
                  <div className={`recent-dur${r.missed ? " missed" : ""}`}>{r.dur}</div>
                  <div className="recent-time">{r.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CONTACTS */}
          <div className={`section${tab === "contacts" ? " active" : ""}`}>
            <input className="search-box" placeholder="Search by name or eNumber..." value={search} onChange={e => setSearch(e.target.value)} />
            {filteredContacts.map((c, i) => (
              <div key={i} className="contact-item">
                <div className="contact-av">
                  {c.init}
                  {c.online && <span className="online-dot" />}
                </div>
                <div className="contact-info">
                  <div className="contact-name">{c.name}</div>
                  <div className="contact-enum">{c.enum} · Verified</div>
                </div>
                <div className="contact-actions">
                  <div className="c-btn call" onClick={() => startCall(c.enum, c.name)}>📞</div>
                  <div className="c-btn msg" onClick={() => navigate("/messages")}>💬</div>
                </div>
              </div>
            ))}
          </div>

          {/* MESSAGES */}
          <div className={`section${tab === "messages" ? " active" : ""}`}>
            {MESSAGES.map((m, i) => (
              <div key={i} className="msg-item" onClick={() => navigate("/messages")}>
                <div className="msg-av">
                  {m.init}
                  {m.online && <span className="online-dot" />}
                </div>
                <div className="msg-info">
                  <div className="msg-name">{m.name}</div>
                  <div className="msg-preview">{m.preview}</div>
                </div>
                <div className="msg-meta">
                  <div className="msg-time">{m.time}</div>
                  {m.unread > 0 && <div className="msg-badge">{m.unread}</div>}
                </div>
              </div>
            ))}
          </div>

    </>
  );
}
