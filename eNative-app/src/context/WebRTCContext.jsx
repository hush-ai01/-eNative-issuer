import { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWebRTC } from '../hooks/useWebRTC';

const WebRTCContext = createContext();

export function WebRTCProvider({ children }) {
  const { profile } = useAuth();
  const webrtc = useWebRTC(profile);

  return (
    <WebRTCContext.Provider value={{ ...webrtc, profile }}>
      {children}
    </WebRTCContext.Provider>
  );
}

export const useWebRTCSignal = () => useContext(WebRTCContext);
