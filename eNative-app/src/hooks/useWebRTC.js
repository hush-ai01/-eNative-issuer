import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SIGNALING_SERVER = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.relay.metered.ca:80' },
    { urls: 'turn:global.relay.metered.ca:80', username: '72081abc38f63bd5a50c044a', credential: 'ZUaCb+DOsWpEM4l4' },
    { urls: 'turn:global.relay.metered.ca:80?transport=tcp', username: '72081abc38f63bd5a50c044a', credential: 'ZUaCb+DOsWpEM4l4' },
    { urls: 'turn:global.relay.metered.ca:443', username: '72081abc38f63bd5a50c044a', credential: 'ZUaCb+DOsWpEM4l4' },
    { urls: 'turns:global.relay.metered.ca:443?transport=tcp', username: '72081abc38f63bd5a50c044a', credential: 'ZUaCb+DOsWpEM4l4' },
  ],
};

const AUDIO_NORMAL = {
  audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 48000 }
};

const AUDIO_LOW_BANDWIDTH = {
  audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 16000, channelCount: 1 }
};

export function useWebRTC(currentUser, lowBandwidth = false) {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');
  const [peerOnline, setPeerOnline] = useState(false);
  const pc = useRef(null);
  const socket = useRef(null);
  const localStream = useRef(null);
  const remoteStream = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!currentUser?.enumber) return;

    socket.current = io(SIGNALING_SERVER, { transports: ['websocket'] });

    socket.current.on('connect', () => {
      console.log('[Socket] Connected to signaling server');
      socket.current.emit('join_room', { enumber: currentUser.enumber });
    });

    socket.current.on('room_joined', ({ enumber, onlineUsers }) => {
      console.log('[Socket] Joined room:', enumber, 'Online:', onlineUsers);
    });

    socket.current.on('incoming_call', ({ callerEnumber, offer }) => {
      console.log('[Socket] Incoming call from:', callerEnumber);
      setIncomingCall({ callerEnumber, offer });
      setCallStatus('incoming');
    });

    socket.current.on('call_answered', ({ calleeEnumber, answer }) => {
      console.log('[Socket] Call answered by:', calleeEnumber);
      handleAnswerReceived(answer);
    });

    socket.current.on('ice_candidate', ({ candidate }) => {
      console.log('[Socket] ICE candidate received');
      if (pc.current && candidate) {
        pc.current.addIceCandidate(candidate).catch(console.error);
      }
    });

    socket.current.on('call_ended', ({ reason }) => {
      console.log('[Socket] Call ended:', reason);
      cleanupCall();
    });

    socket.current.on('error', ({ code, message }) => {
      console.error('[Socket] Error:', code, message);
      setCallStatus('error');
    });

    socket.current.on('user_online', ({ enumber, online }) => {
      setPeerOnline(online);
    });

    socket.current.on('disconnect', () => {
      console.log('[Socket] Disconnected from signaling server');
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [currentUser?.enumber]);

  const getMedia = async () => {
    const constraints = lowBandwidth ? AUDIO_LOW_BANDWIDTH : AUDIO_NORMAL;
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStream.current = stream;
    return stream;
  };

  const forceOpusCodec = (sdp) => {
    // Remove all video codecs to prioritize Opus for audio
    // Keep only Opus in the m=audio line
    let mLine = '';
    const lines = sdp.split('\\r\\n');
    const newLines = lines.map(line => {
      if (line.startsWith('a=rtpmap:109 ') || line.startsWith('a=rtpmap:opus ')) {
        return line; // Keep Opus
      }
      if (line.startsWith('a=rtpmap:') && !line.includes('opus')) {
        return null; // Remove other codecs
      }
      if (line.startsWith('a=fmtp:') && !line.includes('opus')) {
        return null;
      }
      if (line.includes('VP8') || line.includes('VP9') || line.includes('H264')) {
        return null;
      }
      return line;
    }).filter(Boolean);

    return newLines.join('\\r\\n');
  };

  const applyBandwidthLimit = (sdp) => {
    if (!lowBandwidth) return sdp;
    // Cap audio bitrate to 20kbps
    return sdp.replace(/a=mid:audio\\r\\n/g, 'a=mid:audio\\r\\nb=AS:20\\r\\n');
  };

  const remoteAudio = useRef(new Audio());
  
  useEffect(() => {
    remoteAudio.current.autoplay = true;
  }, []);

  const createPeerConnection = (onRemoteStream) => {
    const conn = new RTCPeerConnection(ICE_SERVERS);

    if (localStream.current) {
      localStream.current.getTracks().forEach(t => conn.addTrack(t, localStream.current));
    }

    conn.ontrack = (e) => {
      console.log('[Peer] Remote track received');
      remoteStream.current = e.streams[0];
      remoteAudio.current.srcObject = e.streams[0];
      remoteAudio.current.play().catch(err => {
        console.warn('[Peer] Audio play blocked/failed:', err);
      });
      onRemoteStream && onRemoteStream(e.streams[0]);
    };

    conn.onicecandidate = (e) => {
      if (e.candidate && socket.current && activeCall) {
        socket.current.emit('ice_candidate', {
          callerEnumber: currentUser.enumber,
          calleeEnumber: activeCall.calleeEnumber || activeCall.callerEnumber,
          candidate: e.candidate
        });
      }
    };

    conn.onconnectionstatechange = () => {
      console.log('[Peer] Connection state:', conn.connectionState);
      if (conn.connectionState === 'connected') setCallStatus('active');
      if (conn.connectionState === 'failed' || conn.connectionState === 'disconnected') {
        setCallStatus('error');
      }
    };

    // VAD - Voice Activity Detection for low bandwidth
    if (lowBandwidth && localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        setupVAD(audioTrack);
      }
    }

    return conn;
  };

  const setupVAD = (audioTrack) => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(localStream.current);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let silenceTimer = null;

    const checkVoiceActivity = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      if (avg < 5) {
        if (!silenceTimer) {
          silenceTimer = setTimeout(() => {
            audioTrack.enabled = false;
          }, 300);
        }
      } else {
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = null;
        }
        audioTrack.enabled = true;
      }
      requestAnimationFrame(checkVoiceActivity);
    };
    checkVoiceActivity();
  };

  const handleAnswerReceived = async (answer) => {
    if (pc.current && pc.current.signalingState !== 'stable') {
      await pc.current.setRemoteDescription(answer);
      setCallStatus('active');
    }
  };

  const startCall = async (calleeEnumber, calleeId, onRemoteStream) => {
    try {
      setCallStatus('connecting');
      await getMedia();
      pc.current = createPeerConnection(onRemoteStream);

      const offer = await pc.current.createOffer();
      let sdp = forceOpusCodec(offer.sdp);
      sdp = applyBandwidthLimit(sdp);

      await pc.current.setLocalDescription({ type: offer.type, sdp });

      setActiveCall({ calleeEnumber, calleeId, offer: { type: offer.type, sdp } });

      socket.current.emit('call_user', {
        callerEnumber: currentUser.enumber,
        calleeEnumber,
        offer: { type: offer.type, sdp }
      });

    } catch (err) {
      console.error('[startCall] Error:', err);
      setCallStatus('error');
    }
  };

  const answerCall = async (call, onRemoteStream) => {
    try {
      setCallStatus('connecting');
      await getMedia();
      pc.current = createPeerConnection(onRemoteStream);

      await pc.current.setRemoteDescription(call.offer);
      const answer = await pc.current.createAnswer();
      let sdp = forceOpusCodec(answer.sdp);
      sdp = applyBandwidthLimit(sdp);

      await pc.current.setLocalDescription({ type: answer.type, sdp });

      socket.current.emit('answer_call', {
        callerEnumber: call.callerEnumber,
        calleeEnumber: currentUser.enumber,
        answer: { type: answer.type, sdp }
      });

      setActiveCall({ ...call, answer: { type: answer.type, sdp } });
      setIncomingCall(null);
      setCallStatus('active');

    } catch (err) {
      console.error('[answerCall] Error:', err);
      setCallStatus('error');
    }
  };

  const endCall = useCallback(() => {
    if (socket.current && activeCall) {
      socket.current.emit('end_call', {
        enumber1: currentUser.enumber,
        enumber2: activeCall.calleeEnumber || activeCall.callerEnumber
      });
    }
    cleanupCall();
  }, [activeCall, currentUser]);

  const cleanupCall = () => {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(t => t.stop());
      localStream.current = null;
    }
    remoteStream.current = null;
    setActiveCall(null);
    setIncomingCall(null);
    setCallStatus('idle');
  };

  const rejectCall = async (call) => {
    socket.current.emit('end_call', {
      enumber1: currentUser.enumber,
      enumber2: call.callerEnumber
    });
    setIncomingCall(null);
    setCallStatus('idle');
  };

  return {
    incomingCall,
    activeCall,
    callStatus,
    peerOnline,
    startCall,
    answerCall,
    endCall,
    rejectCall
  };
}

