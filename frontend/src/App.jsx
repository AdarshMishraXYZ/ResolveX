import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/citizen/Dashboard'
import CreateComplaint from './pages/citizen/CreateComplaint'
import ComplaintDetail from './pages/citizen/ComplaintDetail'
import StaffDashboard from './pages/staff/StaffDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

const Layout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main>{children}</main>
  </div>
)

function App() {
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
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/complaints/new" element={
              <ProtectedRoute>
                <Layout><CreateComplaint /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/complaints/:id" element={
              <ProtectedRoute>
                <Layout><ComplaintDetail /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/staff" element={
              <ProtectedRoute roles={['STAFF', 'DEPARTMENT_HEAD', 'ADMIN']}>
                <Layout><StaffDashboard /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute roles={['ADMIN']}>
                <Layout><AdminDashboard /></Layout>
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