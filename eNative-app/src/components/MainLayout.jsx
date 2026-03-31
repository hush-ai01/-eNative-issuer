import { useWebRTCSignal } from "../context/WebRTCContext";
import Sidebar from "./Sidebar";
import IncomingCall from "./IncomingCall";

export default function MainLayout({ children }) {
  const { incomingCall, answerCall, rejectCall } = useWebRTCSignal();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#050507" }}>
      <Sidebar />
      <IncomingCall 
        call={incomingCall} 
        onAnswer={answerCall} 
        onReject={rejectCall} 
      />
      <main style={{ marginLeft: "68px", flex: 1, position: "relative" }}>
        {children}
      </main>
    </div>
  );
}
