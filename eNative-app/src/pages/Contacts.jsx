import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;800&family=Exo+2:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg: #050507; --surface: #08090d; --surface2: #0c0d12; --border: #111116; --border2: #181820; --accent: #c084fc; --accent2: #60d8fa; --accent3: #6ee7b7; --text: rgba(255,255,255,0.93); --mid: rgba(255,255,255,0.52); --dim: rgba(255,255,255,0.26); --red: #ff5f7e; }
  body { background: var(--bg); color: var(--text); font-family: 'Exo 2', sans-serif; margin: 0; }
  .app { display: flex; min-height: 100vh; }
  .main { margin-left: 68px; flex: 1; display: flex; height: 100vh; overflow: hidden; }
  .contacts-panel { width: 300px; border-right: 1px solid var(--border); display: flex; flex-direction: column; background: var(--surface); flex-shrink: 0; }
  .cp-header { padding: 28px 20px 16px; border-bottom: 1px solid var(--border); }
  .cp-title { font-family: 'Rajdhani', sans-serif; font-weight: 800; font-size: 22px; margin-bottom: 14px; }
  .search-wrap { position: relative; }
  .search-input { width: 100%; background: var(--surface2); border: 1px solid var(--border2); border-radius: 10px; padding: 10px 14px 10px 36px; font-family: 'Exo 2', sans-serif; font-size: 13px; color: var(--text); outline: none; transition: border-color 0.2s; }
  .search-input:focus { border-color: rgba(192,132,252,0.3); }
  .search-input::placeholder { color: var(--dim); }
  .search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--dim); font-size: 13px; }
  .filter-row { display: flex; gap: 6px; padding: 12px 20px; border-bottom: 1px solid var(--border); overflow-x: auto; }
  .filter-btn { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.14em; padding: 5px 12px; border-radius: 20px; cursor: pointer; border: 1px solid var(--border2); background: transparent; color: var(--dim); transition: all 0.18s; white-space: nowrap; }
  .filter-btn.on { color: var(--accent); border-color: rgba(192,132,252,0.25); background: rgba(192,132,252,0.07); }
  .contacts-list { flex: 1; overflow-y: auto; padding: 8px 0; }
  .group-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.25em; color: var(--dim); padding: 12px 20px 6px; }
  .contact-row { display: flex; align-items: center; gap: 12px; padding: 10px 20px; cursor: pointer; transition: background 0.15s; position: relative; }
  .contact-row:hover { background: rgba(255,255,255,0.03); }
  .contact-row.active { background: rgba(192,132,252,0.07); }
  .contact-row.active::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--accent); border-radius: 0 2px 2px 0; }
  .c-av { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 13px; position: relative; }
  .c-online { position: absolute; bottom: 1px; right: 1px; width: 8px; height: 8px; border-radius: 50%; background: var(--accent3); border: 1.5px solid var(--surface); }
  .c-info { flex: 1; min-width: 0; }
  .c-name { font-size: 13px; font-weight: 600; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .c-enum { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: var(--dim); }
  .c-badge { font-family: 'Share Tech Mono', monospace; font-size: 8px; padding: 2px 7px; border-radius: 20px; border: 1px solid; flex-shrink: 0; }
  .detail-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .dp-header { padding: 28px 28px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 18px; background: var(--surface); }
  .dp-av { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 20px; flex-shrink: 0; position: relative; }
  .dp-online { position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--accent3); border: 2px solid var(--surface); }
  .dp-name { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 20px; margin-bottom: 4px; }
  .dp-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .dp-enum { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--accent); }
  .dp-tier { font-family: 'Share Tech Mono', monospace; font-size: 9px; padding: 3px 9px; border-radius: 20px; border: 1px solid rgba(192,132,252,0.2); color: var(--accent); background: rgba(192,132,252,0.07); }
  .dp-status { font-size: 11px; color: var(--accent3); display: flex; align-items: center; gap: 5px; font-family: 'Share Tech Mono', monospace; }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent3); animation: blink 2s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .dp-actions { margin-left: auto; display: flex; gap: 8px; }
  .action-btn { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 15px; cursor: pointer; border: 1px solid var(--border2); background: var(--surface2); transition: all 0.18s; }
  .action-btn:hover { border-color: rgba(192,132,252,0.3); }
  .action-btn.call { background: linear-gradient(135deg, #22c55e, #15803d); border-color: transparent; box-shadow: 0 3px 14px rgba(34,197,94,0.25); }
  .dp-history { flex: 1; overflow-y: auto; padding: 20px 28px; }
  .history-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.25em; color: var(--dim); margin-bottom: 14px; }
  .history-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; margin-bottom: 6px; background: var(--surface); cursor: pointer; transition: all 0.15s; }
  .history-item:hover { background: var(--surface2); }
  .h-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
  .h-info { flex: 1; }
  .h-type { font-size: 12px; font-weight: 500; margin-bottom: 2px; }
  .h-time { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: var(--dim); }
  .h-dur { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--mid); }
`;

const CONTACTS = [
  { name: "Amara Kone",     en: "E-0247", country: "🇨🇮", tier: "Founder",  color: "#c084fc", bg: "rgba(192,132,252,0.12)", online: true,  badge: "purple" },
  { name: "Chidi Okafor",   en: "E-1089", country: "🇳🇬", tier: "Verified", color: "#6ee7b7", bg: "rgba(110,231,183,0.12)", online: true,  badge: "green"  },
  { name: "Naledi Mokoena", en: "E-0553", country: "🇿🇦", tier: "Founder",  color: "#c084fc", bg: "rgba(192,132,252,0.12)", online: false, badge: "purple" },
  { name: "Kwame Asante",   en: "E-2341", country: "🇬🇭", tier: "Community",color: "#fcd34d", bg: "rgba(252,211,77,0.12)",  online: true,  badge: "gold"   },
  { name: "Fatima Diallo",  en: "E-0871", country: "🇸🇳", tier: "Verified", color: "#6ee7b7", bg: "rgba(110,231,183,0.12)", online: false, badge: "green"  },
  { name: "Emeka Eze",      en: "E-1432", country: "🇳🇬", tier: "Business", color: "#60d8fa", bg: "rgba(96,216,250,0.12)",  online: true,  badge: "blue"   },
];

const BADGE_COLORS = {
  purple: { color: "#c084fc", border: "rgba(192,132,252,0.2)", bg: "rgba(192,132,252,0.07)" },
  green:  { color: "#6ee7b7", border: "rgba(110,231,183,0.2)", bg: "rgba(110,231,183,0.07)" },
  blue:   { color: "#60d8fa", border: "rgba(96,216,250,0.2)",  bg: "rgba(96,216,250,0.07)"  },
  gold:   { color: "#fcd34d", border: "rgba(252,211,77,0.2)",  bg: "rgba(252,211,77,0.07)"  },
};

const HISTORY = [
  { type: "Outgoing", dur: "12:07", time: "Today, 2:14 PM",     icon: "↗", color: "#6ee7b7", bg: "rgba(110,231,183,0.08)" },
  { type: "Incoming", dur: "4:32",  time: "Today, 10:48 AM",    icon: "↙", color: "#60d8fa", bg: "rgba(96,216,250,0.08)"  },
  { type: "Missed",   dur: "—",     time: "Yesterday, 6:20 PM", icon: "✕", color: "#ff5f7e", bg: "rgba(255,95,126,0.08)"  },
  { type: "Outgoing", dur: "28:14", time: "Monday, 9:05 AM",    icon: "↗", color: "#6ee7b7", bg: "rgba(110,231,183,0.08)" },
];

export default function Contacts() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const contact = CONTACTS[selected];
  const bc = BADGE_COLORS[contact.badge];

  const filtered = CONTACTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.en.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" ? true : filter === "Online" ? c.online : c.tier === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <Sidebar />
        <div className="main">
          <div className="contacts-panel">
            <div className="cp-header">
              <div className="cp-title">Contacts</div>
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input className="search-input" placeholder="Search by name or eNumber..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="filter-row">
              {["All","Online","Founder","Business"].map(f => (
                <button key={f} className={`filter-btn${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="contacts-list">
              <div className="group-label">{filtered.length} CONTACTS</div>
              {filtered.map((c, i) => {
                const bc2 = BADGE_COLORS[c.badge];
                const idx = CONTACTS.indexOf(c);
                return (
                  <div key={i} className={`contact-row${selected === idx ? " active" : ""}`} onClick={() => setSelected(idx)}>
                    <div className="c-av" style={{ background: c.bg, color: c.color }}>
                      {c.name.split(" ").map(n => n[0]).join("")}
                      {c.online && <div className="c-online" />}
                    </div>
                    <div className="c-info">
                      <div className="c-name">{c.country} {c.name}</div>
                      <div className="c-enum">{c.en}</div>
                    </div>
                    <div className="c-badge" style={{ color: bc2.color, borderColor: bc2.border, background: bc2.bg }}>{c.tier}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="detail-panel">
            <div className="dp-header">
              <div className="dp-av" style={{ background: contact.bg, color: contact.color }}>
                {contact.name.split(" ").map(n => n[0]).join("")}
                {contact.online && <div className="dp-online" />}
              </div>
              <div>
                <div className="dp-name">{contact.name}</div>
                <div className="dp-meta">
                  <span className="dp-enum">{contact.en}</span>
                  <span className="dp-tier" style={{ color: bc.color, borderColor: bc.border, background: bc.bg }}>{contact.tier}</span>
                  {contact.online && <span className="dp-status"><span className="status-dot" /> Online</span>}
                </div>
              </div>
              <div className="dp-actions">
                <div className="action-btn">💬</div>
                <div className="action-btn">🎥</div>
                <div className="action-btn call" onClick={() => navigate("/dialler")}>📞</div>
              </div>
            </div>
            <div className="dp-history">
              <div className="history-label">CALL HISTORY</div>
              {HISTORY.map((h, i) => (
                <div key={i} className="history-item">
                  <div className="h-icon" style={{ background: h.bg, color: h.color }}>{h.icon}</div>
                  <div className="h-info"><div className="h-type" style={{ color: h.color }}>{h.type}</div><div className="h-time">{h.time}</div></div>
                  <div className="h-dur">{h.dur}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
