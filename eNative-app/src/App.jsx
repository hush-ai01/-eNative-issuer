import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Dialler from './pages/Dialler'
import Contacts from './pages/Contacts'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Badges from './pages/Badges'
import ProfileSetup from './pages/ProfileSetup'

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#050507', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.26)' }}>CONNECTING...</div>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, profile, loading } = useAuth()
  const path = window.location.pathname
  
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  
  // Allow access to /setup OR /profile OR /settings OR /badge if profile/enumber is missing
  const isSetupPath = ['/setup', '/profile', '/settings', '/badge'].includes(path)
  
  if (!profile?.enumber && !isSetupPath) {
    return <Navigate to="/setup" replace />
  }
  
  return children
}

function SetupRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.enumber) return <Navigate to="/dashboard" replace />
  return children
}

import MainLayout from './components/MainLayout'
import { WebRTCProvider } from './context/WebRTCContext'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<SetupRoute><ProfileSetup /></SetupRoute>} />
      
      <Route path="/dashboard" element={<PrivateRoute><WebRTCProvider><MainLayout><Dashboard /></MainLayout></WebRTCProvider></PrivateRoute>} />
      <Route path="/dialler" element={<PrivateRoute><WebRTCProvider><MainLayout><Dialler /></MainLayout></WebRTCProvider></PrivateRoute>} />
      <Route path="/contacts" element={<PrivateRoute><WebRTCProvider><MainLayout><Contacts /></MainLayout></WebRTCProvider></PrivateRoute>} />
      <Route path="/messages" element={<PrivateRoute><WebRTCProvider><MainLayout><Messages /></MainLayout></WebRTCProvider></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><WebRTCProvider><MainLayout><Profile /></MainLayout></WebRTCProvider></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><WebRTCProvider><MainLayout><Settings /></MainLayout></WebRTCProvider></PrivateRoute>} />
      <Route path="/badge" element={<PrivateRoute><WebRTCProvider><MainLayout><Badges /></MainLayout></WebRTCProvider></PrivateRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
