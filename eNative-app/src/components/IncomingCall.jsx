const css = `
  .incoming-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
  .incoming-card { background: #08090d; border: 1px solid rgba(192,132,252,0.2); border-radius: 24px; padding: 40px 32px; text-align: center; width: 300px; box-shadow: 0 0 60px rgba(192,132,252,0.1); }
  .incoming-pulse { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #2d1060, #080318); border: 2px solid rgba(192,132,252,0.3); display: flex; align-items: center; justify-content: center; font-family: 'Rajdhani', sans-serif; font-weight: 800; font-size: 28px; color: #c084fc; margin: 0 auto 20px; animation: pulse 1.5s ease-in-out infinite; box-shadow: 0 0 0 0 rgba(192,132,252,0.4); }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(192,132,252,0.4); } 70% { box-shadow: 0 0 0 20px rgba(192,132,252,0); } 100% { box-shadow: 0 0 0 0 rgba(192,132,252,0); } }
  .incoming-label { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(255,255,255,0.3); margin-bottom: 8px; }
  .incoming-name { font-family: 'Rajdhani', sans-serif; font-weight: 800; font-size: 26px; color: rgba(255,255,255,0.93); margin-bottom: 4px; }
  .incoming-enum { font-family: 'Share Tech Mono', monospace; font-size: 13px; color: #c084fc; margin-bottom: 32px; }
  .incoming-actions { display: flex; gap: 20px; justify-content: center; }
  .reject-btn { width: 64px; height: 64px; border-radius: 50%; background: rgba(255,95,126,0.1); border: 1px solid rgba(255,95,126,0.3); color: #ff5f7e; font-size: 24px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .reject-btn:hover { background: rgba(255,95,126,0.2); transform: scale(1.05); }
  .answer-btn { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #00c853, #00e676); border: none; color: #fff; font-size: 24px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,200,83,0.3); }
  .answer-btn:hover { transform: scale(1.05); box-shadow: 0 6px 28px rgba(0,200,83,0.4); }
`;

export default function IncomingCall({ call, onAnswer, onReject }) {
  if (!call) return null;
  const initials = (call.caller_enumber || 'EN').slice(0, 2).toUpperCase();

  return (
    <>
      <style>{css}</style>
      <div className="incoming-overlay">
        <div className="incoming-card">
          <div className="incoming-pulse">{initials}</div>
          <div className="incoming-label">INCOMING ENATIVE CALL</div>
          <div className="incoming-name">{call.caller_enumber || 'Unknown'}</div>
          <div className="incoming-enum">eNative Network</div>
          <div className="incoming-actions">
            <button className="reject-btn" onClick={() => onReject(call)}>✕</button>
            <button className="answer-btn" onClick={() => onAnswer(call)}>📞</button>
          </div>
        </div>
      </div>
    </>
  );
}
