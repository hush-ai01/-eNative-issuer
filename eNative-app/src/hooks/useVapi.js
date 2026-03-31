import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';

const vapi = new Vapi(import.meta.env.VITE_VAPI_API_KEY);

export function useVapi() {
  const [callActive, setCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    vapi.on('call-start', () => {
      setCallActive(true);
      setCallStatus('active');
    });
    vapi.on('call-end', () => {
      setCallActive(false);
      setCallStatus('idle');
      setIsMuted(false);
    });
    vapi.on('error', (e) => {
      console.error('Vapi error:', e);
      setCallStatus('error');
      setCallActive(false);
    });
    return () => vapi.removeAllListeners();
  }, []);

  const startCall = async (assistantConfig) => {
    try {
      setCallStatus('connecting');
      await vapi.start(assistantConfig);
    } catch (err) {
      console.error('Call failed:', err);
      setCallStatus('error');
    }
  };

  const endCall = () => {
    vapi.stop();
    setCallActive(false);
    setCallStatus('idle');
  };

  const toggleMute = () => {
    vapi.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  return { callActive, callStatus, isMuted, startCall, endCall, toggleMute };
}
