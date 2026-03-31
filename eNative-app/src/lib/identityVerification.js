const NVIDIA_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY;

export async function verifyCallerIdentity(callerInfo) {
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-4-340b-instruct',
      messages: [
        {
          role: 'system',
          content: `You are a digital identity verification AI for a VoIP network. 
          Analyze caller information and return a JSON object with:
          - trustScore: number 0-100
          - verified: boolean
          - riskLevel: "low", "medium", or "high"
          - reason: brief explanation
          Respond with JSON only.`
        },
        {
          role: 'user',
          content: `Verify this caller: ${JSON.stringify(callerInfo)}`
        }
      ],
      temperature: 0.1,
      max_tokens: 200
    })
  });

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  return result;
}
