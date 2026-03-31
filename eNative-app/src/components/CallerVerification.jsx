import { useState, useEffect } from 'react';

export default function CallerVerification({ caller }) {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!caller) return;
    setLoading(true);
    setVerification(null);

    const verify = async () => {
      try {
        const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
        const prompt = `You are an AI fraud detection system for a VoIP platform in Africa. 
Analyze this caller and return ONLY a JSON object with no extra text:
{
  "verified": true or false,
  "trustScore": number between 0 and 100,
  "riskLevel": "low" or "medium" or "high",
  "reason": "one sentence explanation"
}

Caller name: ${caller.name || 'Unknown'}
Caller number: ${caller.number || 'Unknown'}

Rules:
- Unknown callers get trustScore 20-40 and high risk
- Known names get trustScore 70-95 and low risk  
- Suspicious patterns (no name, strange number) get medium/high risk
Return only the JSON.`;

        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'meta/llama-3.1-8b-instruct',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 200
          })
        });

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';
        const clean = text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(clean);
        setVerification(result);
      } catch (err) {
        // Fallback if API fails
        setVerification({
          verified: false,
          trustScore: 45,
          riskLevel: 'medium',
          reason: 'Unable to verify caller identity at this time.'
        });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [caller?.number]);

  if (loading) {
    return (
      <div style={{ padding: '12px', background: '#1a1a2e', borderRadius: '8px', border: '1px solid #333', textAlign: 'center' }}>
        <div style={{ color: '#c084fc', fontSize: '12px', letterSpacing: '0.1em', fontFamily: 'Share Tech Mono, monospace' }}>
          ◈ NVIDIA RIVA — VERIFYING IDENTITY...
        </div>
      </div>
    );
  }

  if (!verification) return null;

  const color = verification.riskLevel === 'low' ? '#00ff88'
    : verification.riskLevel === 'medium' ? '#ffaa00' : '#ff4444';

  return (
    <div style={{ padding: '12px', background: '#1a1a2e', borderRadius: '8px', border: `1px solid ${color}` }}>
      <div style={{ color, fontWeight: 'bold', fontSize: '14px' }}>
        {verification.verified ? '✓ VERIFIED' : '⚠ UNVERIFIED'} — Trust Score: {verification.trustScore}/100
      </div>
      <div style={{ color: '#aaa', fontSize: '12px', marginTop: '4px' }}>
        {verification.reason}
      </div>
    </div>
  );
}
