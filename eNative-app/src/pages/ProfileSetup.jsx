import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;800&family=Exo+2:wght@300;400;500;600&family=Share+Tech+Mono&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #050507; }
  .setup-wrap { min-height: 100vh; background: #050507; display: flex; align-items: center; justify-content: center; padding: 24px; font-family: 'Exo 2', sans-serif; }
  .setup-card { width: 100%; max-width: 440px; background: #08090d; border: 1px solid #181820; border-radius: 24px; padding: 40px 32px; position: relative; overflow: hidden; }
  .setup-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, rgba(192,132,252,0.07) 0%, transparent 60%); pointer-events: none; }
  .setup-logo { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, #c084fc, #60d8fa); display: flex; align-items: center; justify-content: center; font-family: 'Rajdhani', sans-serif; font-weight: 800; font-size: 20px; color: #fff; margin: 0 auto 24px; }
  .setup-step { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.2em; color: rgba(255,255,255,0.26); text-align: center; margin-bottom: 8px; }
  .setup-title { font-family: 'Rajdhani', sans-serif; font-weight: 800; font-size: 26px; color: rgba(255,255,255,0.93); text-align: center; margin-bottom: 6px; }
  .setup-title span { color: #c084fc; }
  .setup-sub { font-size: 13px; color: rgba(255,255,255,0.4); text-align: center; margin-bottom: 32px; line-height: 1.5; }
  .enumber-display { background: #0c0d12; border: 1px solid rgba(192,132,252,0.2); border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px; position: relative; overflow: hidden; }
  .enumber-display::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(192,132,252,0.05) 0%, transparent 70%); pointer-events: none; }
  .enumber-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.2em; color: rgba(255,255,255,0.26); margin-bottom: 10px; }
  .enumber-val { font-family: 'Share Tech Mono', monospace; font-size: 36px; color: #c084fc; letter-spacing: 0.1em; font-weight: 700; }
  .enumber-badge { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.12em; padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(110,231,183,0.25); color: #6ee7b7; background: rgba(110,231,183,0.05); }
  .enumber-dot { width: 5px; height: 5px; border-radius: 50%; background: #6ee7b7; animation: blink 2s infinite; }
  .field-group { margin-bottom: 16px; }
  .field-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.16em; color: rgba(255,255,255,0.26); margin-bottom: 8px; display: block; }
  .field-input { width: 100%; background: #0c0d12; border: 1px solid #181820; border-radius: 12px; padding: 13px 16px; font-family: 'Exo 2', sans-serif; font-size: 14px; color: rgba(255,255,255,0.93); outline: none; transition: border-color 0.2s; }
  .field-input:focus { border-color: rgba(192,132,252,0.4); }
  .field-select { width: 100%; background: #0c0d12; border: 1px solid #181820; border-radius: 12px; padding: 13px 16px; font-family: 'Exo 2', sans-serif; font-size: 14px; color: rgba(255,255,255,0.93); outline: none; cursor: pointer; appearance: none; }
  .claim-btn { width: 100%; height: 52px; border-radius: 14px; border: none; background: linear-gradient(135deg, #c084fc, #9333ea); color: #fff; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 16px; letter-spacing: 2px; cursor: pointer; margin-top: 8px; transition: all 0.2s; box-shadow: 0 4px 20px rgba(192,132,252,0.3); }
  .claim-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(192,132,252,0.4); }
  .claim-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .error-msg { font-size: 12px; color: #ff5f7e; text-align: center; margin-top: 12px; }
  .perma-note { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.1em; color: rgba(255,255,255,0.26); text-align: center; margin-top: 16px; line-height: 1.6; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
`

const AFRICAN_COUNTRIES = [
  'South Africa','Nigeria','Kenya','Ghana','Ethiopia','Tanzania','Uganda','Rwanda',
  'Zimbabwe','Zambia','Mozambique','Angola','Cameroon','Ivory Coast','Senegal',
  'Mali','Burkina Faso','Niger','Chad','Sudan','Egypt','Morocco','Tunisia','Algeria',
  'Libya','Botswana','Namibia','Malawi','Madagascar','Mauritius',
  'Afghanistan','Albania','Algeria','Andorra','Antigua and Barbuda',
  'Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain',
  'Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia',
  'Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso',
  'Cambodia','Canada','Central African Republic','Chad','Chile','China','Colombia',
  'Comoros','Congo','Congo DRC','Costa Rica','Cote d Ivoire','Croatia','Cuba',
  'Cyprus','Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic',
  'Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia',
  'Eswatini','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia',
  'Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau',
  'Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran',
  'Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan',
  'Kiribati','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia',
  'Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia',
  'Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico',
  'Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique',
  'Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua',
  'Niger','Nigeria','Norway','Oman','Pakistan','Palau','Panama',
  'Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar',
  'Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia',
  'Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe',
  'Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore',
  'Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Sudan',
  'Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan',
  'Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga',
  'Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda',
  'Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay',
  'Uzbekistan','Vanuatu','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe','Other'
]
function generateENumber() {
  const num = Math.floor(Math.random() * 9000) + 1000
  return `E-${num}`
}

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { user, refreshProfile, loading: authLoading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enumber] = useState(generateENumber())

  const handleClaim = async () => {
    if (!user?.id) return setError('Please sign in to claim your eNumber')
    if (!fullName.trim()) return setError('Please enter your full name')
    if (!country) return setError('Please select your country')
    setLoading(true)
    setError('')

    try {
      const { error: err } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName.trim(),
          country,
          enumber
        }, { onConflict: 'user_id' })
      if (err) throw err
      await refreshProfile()
      navigate('/dashboard')
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="setup-wrap">
        <style>{css}</style>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.26)' }}>
          CONNECTING...
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{css}</style>
      <div className="setup-wrap">
        <div className="setup-card">
          <div className="setup-logo">en</div>
          <div className="setup-step">STEP 1 OF 1 · CLAIM YOUR IDENTITY</div>
          <div className="setup-title">Your <span>eNumber</span> awaits</div>
          <div className="setup-sub">One identity. Every country. Yours forever.</div>
          <div className="enumber-display">
            <div className="enumber-label">YOUR ENUMBER</div>
            <div className="enumber-val">{enumber}</div>
            <div className="enumber-badge">
              <span className="enumber-dot" />
              PERMANENT · VERIFIED · YOURS FOREVER
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">FULL NAME</label>
            <input
              className="field-input"
              placeholder="Your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label className="field-label">COUNTRY</label>
            <select
              className="field-select"
              value={country}
              onChange={e => setCountry(e.target.value)}
            >
              <option value="">Select your country</option>
              {AFRICAN_COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button className="claim-btn" onClick={handleClaim} disabled={loading}>
            {loading ? 'CLAIMING...' : `⚡ CLAIM ${enumber}`}
          </button>

          {error && <div className="error-msg">{error}</div>}

          <div className="perma-note">
            🔒 Your eNumber is permanently assigned at claim.<br />
            It will never be reassigned to another person.
          </div>
        </div>
      </div>
    </>
  )
}
