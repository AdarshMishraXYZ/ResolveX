import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import DemoMode from './components/DemoMode'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/citizen/Dashboard'
import CreateComplaint from './pages/citizen/CreateComplaint'
import ComplaintDetail from './pages/citizen/ComplaintDetail'
import StaffDashboard from './pages/staff/StaffDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

const Layout = ({ children, isImpersonating, onReturnToAdmin }) => (
  <div className="min-h-screen bg-gray-50">
    {isImpersonating && <div className="h-9" />}
    <Navbar />
    <main>{children}</main>
    <DemoMode isImpersonating={isImpersonating} onReturnToAdmin={onReturnToAdmin} />
  </div>
)

function App() {
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [originalAdminData, setOriginalAdminData] = useState(null)

  const handleImpersonate = (token, user) => {
    if (!originalAdminData) {
      setOriginalAdminData({ token: localStorage.getItem("token"), user: JSON.parse(localStorage.getItem("user") || "{}") })
    }
    setIsImpersonating(true)
  }

  const handleReturnToAdmin = () => {
    if (originalAdminData) {
      localStorage.setItem("token", originalAdminData.token)
      setIsImpersonating(false)
      setOriginalAdminData(null)
      window.location.href = "/admin"
    }
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['CITIZEN', 'ADMIN']}>
                <Layout isImpersonating={isImpersonating} onReturnToAdmin={handleReturnToAdmin}><Dashboard /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/complaints/new" element={
              <ProtectedRoute>
                <Layout isImpersonating={isImpersonating} onReturnToAdmin={handleReturnToAdmin}><CreateComplaint /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/complaints/:id" element={
              <ProtectedRoute>
                <Layout isImpersonating={isImpersonating} onReturnToAdmin={handleReturnToAdmin}><ComplaintDetail /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/staff" element={
              <ProtectedRoute roles={['STAFF', 'DEPARTMENT_HEAD', 'ADMIN']}>
                <Layout isImpersonating={isImpersonating} onReturnToAdmin={handleReturnToAdmin}><StaffDashboard /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute roles={['ADMIN']}>
                <Layout isImpersonating={isImpersonating} onReturnToAdmin={handleReturnToAdmin}><AdminDashboard /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/unauthorized" element={
              <div className="flex items-center justify-center h-screen text-gray-500">
                Access Denied
              </div>
            } />

            <Route path="*" element={<Navigate to=" /" />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App