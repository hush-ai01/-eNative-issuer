import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';

const S = {
  page: { minHeight:'100vh', background:'#050507', color:'rgba(255,255,255,0.93)', fontFamily:"'Exo 2',sans-serif", display:'flex', flexDirection:'column' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid #111116', background:'#08090d', flexShrink:0 },
  backBtn: { width:'32px', height:'32px', borderRadius:'8px', background:'#0c0d12', border:'1px solid #1a1a24', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,0.7)', fontSize:'16px' },
  headerTitle: { fontFamily:'Share Tech Mono,monospace', fontSize:'10px', letterSpacing:'0.2em', color:'rgba(255,255,255,0.3)' },
  body: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 20px', gap:'24px', overflowY:'auto' },
  tabRow: { display:'flex', gap:'8px', background:'#0c0d12', borderRadius:'10px', padding:'4px', border:'1px solid #1a1a24' },
  tab: (a) => ({ padding:'8px 24px', borderRadius:'8px', background:a?'linear-gradient(135deg,#c084fc,#60d8fa)':'transparent', color:a?'#050507':'rgba(255,255,255,0.4)', fontFamily:'Share Tech Mono,monospace', fontSize:'9px', letterSpacing:'0.15em', cursor:'pointer', border:'none', fontWeight:a?'700':'400', transition:'all 0.2s' }),
  card: { background:'#08090d', border:'1px solid #111116', borderRadius:'16px', padding:'28px', display:'flex', flexDirection:'column', alignItems:'center', gap:'18px', width:'100%', maxWidth:'340px' },
  label: { fontFamily:'Share Tech Mono,monospace', fontSize:'9px', letterSpacing:'0.2em', color:'rgba(255,255,255,0.3)' },
  enumber: { fontFamily:'Share Tech Mono,monospace', fontSize:'20px', letterSpacing:'0.15em', color:'#c084fc' },
  qrWrap: { padding:'16px', background:'#fff', borderRadius:'12px', lineHeight:0 },
  primaryBtn: { background:'linear-gradient(135deg,#c084fc,#60d8fa)', border:'none', borderRadius:'10px', padding:'12px 28px', color:'#050507', fontFamily:'Share Tech Mono,monospace', fontSize:'9px', letterSpacing:'0.15em', fontWeight:'700', cursor:'pointer', width:'100%' },
  ghostBtn: { background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', fontFamily:'Share Tech Mono,monospace', fontSize:'9px', letterSpacing:'0.1em', cursor:'pointer' },
  dangerBtn: { background:'transparent', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'8px', padding:'8px 20px', color:'#f87171', fontFamily:'Share Tech Mono,monospace', fontSize:'9px', letterSpacing:'0.1em', cursor:'pointer' },
  success: { fontFamily:'Share Tech Mono,monospace', fontSize:'11px', color:'#6ee7b7', letterSpacing:'0.1em' },
  errorBox: { fontFamily:'Share Tech Mono,monospace', fontSize:'10px', color:'#f87171', letterSpacing:'0.1em', textAlign:'center', padding:'8px 16px', background:'rgba(248,113,113,0.08)', borderRadius:'8px', border:'1px solid rgba(248,113,113,0.2)', width:'100%', maxWidth:'340px' },
  videoBox: { width:'260px', height:'260px', borderRadius:'12px', overflow:'hidden', position:'relative', background:'#000', border:'1px solid #1a1a24' },
  scanOverlay: { position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' },
  scanFrame: { width:'180px', height:'180px', border:'2px solid rgba(192,132,252,0.6)', borderRadius:'8px', boxShadow:'0 0 0 9999px rgba(0,0,0,0.4)' },
  uploadBtn: { display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', width:'100%', background:'#0c0d12', border:'1px dashed rgba(192,132,252,0.3)', borderRadius:'10px', padding:'14px', color:'rgba(255,255,255,0.4)', fontFamily:'Share Tech Mono,monospace', fontSize:'9px', letterSpacing:'0.15em', cursor:'pointer' },
  contactCard: { background:'#0c0d12', border:'1px solid rgba(192,132,252,0.2)', borderRadius:'12px', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', width:'100%' },
};

function parseQRData(text) {
  try { const d = JSON.parse(text); if (d.enative && d.enumber) return d; } catch {}
  return null;
}

export default function QRConnect() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('show');
  const [scanning, setScanning] = useState(false);
  const [scannedContact, setScannedContact] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [camError, setCamError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (error) throw error;
        setProfile(data);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  useEffect(() => { if (mode !== 'scan') stopCamera(); return () => stopCamera(); }, [mode]);

  const qrValue = profile ? JSON.stringify({ enative:true, enumber:profile.enumber, name:profile.full_name||profile.username||'', badge:profile.badge||'member' }) : '';

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCamError(null); setScannedContact(null); setSaved(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment', width:{ideal:640}, height:{ideal:640} } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        if ('BarcodeDetector' in window) {
          const detector = new window.BarcodeDetector({ formats:['qr_code'] });
          const tick = async () => {
            if (!videoRef.current || !streamRef.current) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes.length > 0) { const p = parseQRData(codes[0].rawValue); if (p) { stopCamera(); setScannedContact(p); return; } }
            } catch {}
            animFrameRef.current = requestAnimationFrame(tick);
          };
          animFrameRef.current = requestAnimationFrame(tick);
        } else {
          setCamError('Auto-detect not supported. Tap CAPTURE when QR is in frame.');
        }
      }
    } catch { setCamError('Camera permission denied. Use photo upload instead.'); }
  }, [stopCamera]);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    if ('BarcodeDetector' in window) {
      try {
        const codes = await new window.BarcodeDetector({ formats:['qr_code'] }).detect(c);
        if (codes.length > 0) { const p = parseQRData(codes[0].rawValue); if (p) { stopCamera(); setScannedContact(p); return; } }
        setCamError('No QR code detected. Adjust position and try again.');
      } catch { setCamError('Detection failed. Try photo upload.'); }
    }
  }, [stopCamera]);

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setCamError(null);
    const img = new Image();
    img.onload = async () => {
      const c = canvasRef.current;
      c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      if ('BarcodeDetector' in window) {
        try {
          const codes = await new window.BarcodeDetector({ formats:['qr_code'] }).detect(c);
          if (codes.length > 0) { const p = parseQRData(codes[0].rawValue); if (p) { setScannedContact(p); return; } }
          setCamError('No eNative QR found in this image.');
        } catch { setCamError('Could not read image. Try another photo.'); }
      } else { setCamError('QR detection not supported on this browser.'); }
    };
    img.onerror = () => setCamError('Could not load image.');
    img.src = URL.createObjectURL(file);
    e.target.value = '';
  }, []);

  const saveContact = useCallback(async () => {
    if (!scannedContact || !profile) return;
    setSaving(true); setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: them, error: pErr } = await supabase.from('profiles').select('id,enumber,full_name,username,badge').eq('enumber', scannedContact.enumber).maybeSingle();
      if (pErr || !them) throw new Error('User not found in eNative network.');
      if (them.id === user.id) throw new Error('You cannot add yourself as a contact.');
      const [r1, r2] = await Promise.all([
        supabase.from('contacts').upsert({ user_id:user.id, contact_id:them.id, contact_enumber:them.enumber, contact_name:them.full_name||them.username }, { onConflict:'user_id,contact_id' }),
        supabase.from('contacts').upsert({ user_id:them.id, contact_id:user.id, contact_enumber:profile.enumber, contact_name:profile.full_name||profile.username }, { onConflict:'user_id,contact_id' }),
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;
      setSaved(true);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }, [scannedContact, profile]);

  const resetScan = useCallback(() => { setScannedContact(null); setSaved(false); setError(null); setCamError(null); }, []);

  if (loading) return (
    <div style={{...S.page, alignItems:'center', justifyContent:'center'}}>
      <span style={S.label}>LOADING...</span>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');
        * { box-sizing:border-box; }
        video { display:block; width:100%; height:100%; object-fit:cover; }
        button:active { opacity:0.75; }
      `}</style>

      <div style={S.header}>
        <div style={S.backBtn} onClick={() => navigate(-1)}>←</div>
        <span style={S.headerTitle}>QR CONNECT</span>
        <div style={{width:'32px'}} />
      </div>

      <div style={S.body}>
        {error && <div style={S.errorBox}>{error}</div>}

        <div style={S.tabRow}>
          {['show','scan'].map(m => (
            <button key={m} style={S.tab(mode===m)} onClick={() => { setMode(m); setError(null); }}>
              {m==='show' ? 'MY QR' : 'SCAN'}
            </button>
          ))}
        </div>

        {/* MY QR */}
        {mode==='show' && profile && (
          <div style={S.card}>
            <span style={S.label}>YOUR eNUMBER</span>
            <span style={S.enumber}>{profile.enumber}</span>
            <div style={S.qrWrap}>
              <QRCodeSVG value={qrValue} size={210} bgColor="#ffffff" fgColor="#050507" level="H" includeMargin={false} />
            </div>
            <span style={{...S.label, textAlign:'center', lineHeight:'1.8'}}>
              SHOW THIS TO ANOTHER eNATIVE USER TO EXCHANGE CONTACT CARDS
            </span>
          </div>
        )}

        {/* SCAN */}
        {mode==='scan' && (
          <>
            {scannedContact ? (
              <div style={S.card}>
                {!saved ? (
                  <>
                    <span style={S.label}>CONTACT FOUND</span>
                    <div style={S.contactCard}>
                      <span style={{fontSize:'16px', fontWeight:'600', color:'rgba(255,255,255,0.85)'}}>{scannedContact.name}</span>
                      <span style={S.enumber}>{scannedContact.enumber}</span>
                      {scannedContact.badge && <span style={{...S.label, color:'#60d8fa'}}>{scannedContact.badge.toUpperCase()}</span>}
                    </div>
                    <button style={{...S.primaryBtn, opacity:saving?0.6:1}} onClick={saveContact} disabled={saving}>
                      {saving ? 'SAVING...' : 'ADD TO CONTACTS'}
                    </button>
                    <button style={S.ghostBtn} onClick={resetScan}>SCAN ANOTHER</button>
                  </>
                ) : (
                  <>
                    <span style={{fontSize:'2rem'}}>✓</span>
                    <span style={S.success}>CONTACT ADDED</span>
                    <span style={{...S.label, textAlign:'center', lineHeight:'1.8'}}>BOTH USERS HAVE BEEN CONNECTED</span>
                    <button style={S.primaryBtn} onClick={() => navigate('/contacts')}>VIEW CONTACTS</button>
                    <button style={S.ghostBtn} onClick={resetScan}>SCAN ANOTHER</button>
                  </>
                )}
              </div>
            ) : (
              <>
                <div style={S.videoBox}>
                  <video ref={videoRef} playsInline muted />
                  <div style={S.scanOverlay}><div style={S.scanFrame} /></div>
                </div>

                {camError && <div style={{...S.errorBox, maxWidth:'280px'}}>{camError}</div>}

                {!scanning ? (
                  <button style={{...S.primaryBtn, maxWidth:'340px'}} onClick={startCamera}>START CAMERA</button>
                ) : (
                  <div style={{display:'flex', gap:'8px', width:'100%', maxWidth:'340px'}}>
                    {camError && <button style={{...S.primaryBtn, flex:1}} onClick={captureFrame}>CAPTURE</button>}
                    <button style={{...S.dangerBtn, flex:1}} onClick={stopCamera}>STOP CAMERA</button>
                  </div>
                )}

                <div style={{display:'flex', alignItems:'center', gap:'12px', width:'100%', maxWidth:'340px'}}>
                  <div style={{flex:1, height:'1px', background:'#111116'}} />
                  <span style={S.label}>OR</span>
                  <div style={{flex:1, height:'1px', background:'#111116'}} />
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFileUpload} />
                <div style={{...S.uploadBtn, maxWidth:'340px'}} onClick={() => fileInputRef.current?.click()}>
                  <span>📷</span>
                  <span>UPLOAD QR FROM PHOTO LIBRARY</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
