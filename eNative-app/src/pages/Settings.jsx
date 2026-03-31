import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Sidebar from "../components/Sidebar";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;800&family=Exo+2:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg: #050507; --surface: #08090d; --surface2: #0c0d12; --border: #111116; --border2: #181820; --accent: #c084fc; --accent2: #60d8fa; --accent3: #6ee7b7; --text: rgba(255,255,255,0.93); --mid: rgba(255,255,255,0.52); --dim: rgba(255,255,255,0.26); --red: #ff5f7e; }
  body { background: var(--bg); color: var(--text); font-family: 'Exo 2', sans-serif; margin: 0; }
  .app { display: flex; min-height: 100vh; }
  .main { margin-left: 68px; flex: 1; padding: 28px 32px; max-width: 720px; }
  .page-title { font-family: 'Rajdhani', sans-serif; font-weight: 800; font-size: 24px; margin-bottom: 24px; }
  .section { margin-bottom: 20px; }
  .section-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.28em; color: var(--dim); margin-bottom: 10px; text-transform: uppercase; }
  .card { background: var(--surface); border: 1px solid var(--border2); border-radius: 16px; overflow: hidden; }
  .setting-row { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s; }
  .setting-row:last-child { border-bottom: none; }
  .setting-row:hover { background: rgba(255,255,255,0.02); }
  .s-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .s-info { flex: 1; }
  .s-label { font-size: 14px; font-weight: 500; margin-bottom: 2px; }
  .s-desc { font-size: 11px; color: var(--dim); }
  .s-right { display: flex; align-items: center; gap: 8px; }
  .s-val { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: var(--dim); }
  .s-arrow { color: var(--dim); font-size: 12px; }
  .toggle { width: 42px; height: 24px; border-radius: 12px; border: none; cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0; }
  .toggle.on { background: var(--accent); }
  .toggle.off { background: var(--border2); }
  .toggle-thumb { position: absolute; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: left 0.2s; }
  .toggle.on .toggle-thumb { left: 21px; }
  .toggle.off .toggle-thumb { left: 3px; }
  .danger-row { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s; }
  .danger-row:last-child { border-bottom: none; }
  .danger-row:hover { background: rgba(255,95,126,0.04); }
  .danger-label { font-size: 14px; font-weight: 500; color: var(--red); }
  .danger-desc { font-size: 11px; color: var(--dim); margin-top: 2px; }
  .version-info { text-align: center; padding: 24px 0 8px; font-family: 'Share Tech Mono', monospace; font-size: 10px; color: var(--dim); letter-spacing: 0.12em; line-height: 1.8; }
`;

function Toggle({ on, onToggle }) {
  return (
    <button className={`toggle ${on ? "on" : "off"}`} onClick={onToggle}>
      <div className="toggle-thumb" />
    </button>
  );
}

export default function Settings() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const handleSignOut = async () => { await signOut(); navigate("/login") }
  const [toggles, setToggles] = useState({
    aiQuality: true,
    noiseCancel: true,
    notifications: true,
    callVibrate: false,
    darkMode: true,
    analytics: false,
    twoFactor: true,
  });

  const toggle = key => setToggles(t => ({ ...t, [key]: !t[key] }));

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <Sidebar />
        <div className="main">
          <div className="page-title">Settings</div>

          <div className="section">
            <div className="section-label">Account</div>
            <div className="card">
              <div className="setting-row" onClick={() => navigate("/profile")}>
                <div className="s-icon" style={{ background: "rgba(192,132,252,0.1)" }}>👤</div>
                <div className="s-info"><div className="s-label">Profile</div><div className="s-desc">Edit your name, bio and country</div></div>
                <div className="s-right"><span className="s-val">Taryl Ogle</span><span className="s-arrow">›</span></div>
              </div>
              <div className="setting-row">
                <div className="s-icon" style={{ background: "rgba(96,216,250,0.1)" }}>📱</div>
                <div className="s-info"><div className="s-label">eNumber</div><div className="s-desc">Your permanent identity</div></div>
                <div className="s-right"><span className="s-val">E-0001</span><span className="s-arrow">›</span></div>
              </div>
              <div className="setting-row">
                <div className="s-icon" style={{ background: "rgba(110,231,183,0.1)" }}>✅</div>
                <div className="s-info"><div className="s-label">Verification</div><div className="s-desc">KYC status and identity</div></div>
                <div className="s-right"><span className="s-val" style={{ color: "var(--accent3)" }}>VERIFIED</span><span className="s-arrow">›</span></div>
              </div>
              <div className="setting-row">
                <div className="s-icon" style={{ background: "rgba(252,211,77,0.1)" }}>🔐</div>
                <div className="s-info"><div className="s-label">Two-Factor Auth</div><div className="s-desc">Extra security for your account</div></div>
                <div className="s-right"><Toggle on={toggles.twoFactor} onToggle={() => toggle("twoFactor")} /></div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-label">Call Quality</div>
            <div className="card">
              <div className="setting-row">
                <div className="s-icon" style={{ background: "rgba(96,216,250,0.1)" }}>🔇</div>
                <div className="s-info"><div className="s-label">Noise Cancellation</div><div className="s-desc">Remove background noise on calls</div></div>
                <div className="s-right"><Toggle on={toggles.noiseCancel} onToggle={() => toggle("noiseCancel")} /></div>
              </div>
              <div className="setting-row">
                <div className="s-icon" style={{ background: "rgba(110,231,183,0.1)" }}>📶</div>
                <div className="s-info"><div className="s-label">Network</div><div className="s-desc">Connection region and routing</div></div>
                <div className="s-right"><span className="s-val">Auto</span><span className="s-arrow">›</span></div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-label">Notifications</div>
            <div className="card">
              <div className="setting-row">
                <div className="s-icon" style={{ background: "rgba(252,211,77,0.1)" }}>🔔</div>
                <div className="s-info"><div className="s-label">Push Notifications</div><div className="s-desc">Incoming calls and messages</div></div>
                <div className="s-right"><Toggle on={toggles.notifications} onToggle={() => toggle("notifications")} /></div>
              </div>
              <div className="setting-row">
                <div className="s-icon" style={{ background: "rgba(110,231,183,0.1)" }}>📳</div>
                <div className="s-info"><div className="s-label">Vibrate on Call</div><div className="s-desc">Haptic feedback for incoming calls</div></div>
                <div className="s-right"><Toggle on={toggles.callVibrate} onToggle={() => toggle("callVibrate")} /></div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-label">Privacy</div>
            <div className="card">
              <div className="setting-row">
                <div className="s-icon" style={{ background: "rgba(96,216,250,0.1)" }}>📊</div>
                <div className="s-info"><div className="s-label">Usage Analytics</div><div className="s-desc">Help improve eNative</div></div>
                <div className="s-right"><Toggle on={toggles.analytics} onToggle={() => toggle("analytics")} /></div>
              </div>
              <div className="setting-row">
                <div className="s-icon" style={{ background: "rgba(192,132,252,0.1)" }}>🛡️</div>
                <div className="s-info"><div className="s-label">Privacy Policy</div><div className="s-desc">How we handle your data</div></div>
                <div className="s-right"><span className="s-arrow">›</span></div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-label">Danger Zone</div>
            <div className="card">
              <div className="danger-row" onClick={handleSignOut}>
                <div className="s-icon" style={{ background: "rgba(255,95,126,0.1)" }}>🚪</div>
                <div>
                  <div className="danger-label">Sign Out</div>
                  <div className="danger-desc">Sign out of your eNative account</div>
                </div>
              </div>
              <div className="danger-row">
                <div className="s-icon" style={{ background: "rgba(255,95,126,0.1)" }}>🗑️</div>
                <div>
                  <div className="danger-label">Delete Account</div>
                  <div className="danger-desc">Permanently delete your eNative identity</div>
                </div>
              </div>
            </div>
          </div>

          <div className="version-info">
            eNative · Version 0.1.0<br/>
            Born in Africa ❤️ Built for the world.
          </div>
        </div>
      </div>
    </>
  );
}
