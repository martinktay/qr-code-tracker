import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RegisterBox from './pages/RegisterBox'
import RegisterSack from './pages/RegisterSack'
import ScanAndLog from './pages/ScanAndLog'
import CustomerPortal from './pages/CustomerPortal'
import ParcelTimeline from './pages/ParcelTimeline'
import AdminPanel from './pages/AdminPanel'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import MapTracker from './pages/MapTracker'
import TestFunctionality from './components/TestFunctionality'
import { Toaster } from 'react-hot-toast'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, userRole } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-red-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

const App = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600">Loading...</p>
        </div>
      </div>
    )
  }

    return (
    <>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/portal" element={<CustomerPortal />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/register-box" element={
          <ProtectedRoute allowedRoles={['admin', 'warehouse']}>
            <Layout>
              <RegisterBox />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/register-sack" element={
          <ProtectedRoute allowedRoles={['admin', 'warehouse']}>
            <Layout>
              <RegisterSack />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/scan-and-log" element={
          <ProtectedRoute allowedRoles={['admin', 'warehouse']}>
            <Layout>
              <ScanAndLog />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/map-tracker" element={
          <ProtectedRoute>
            <Layout>
              <MapTracker />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/parcel-timeline/:id" element={
          <ProtectedRoute>
            <Layout>
              <ParcelTimeline />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin-panel" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AdminPanel />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/test" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <TestFunctionality />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster position="top-right" />
    </>
  )
}

const AppWrapper = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
)

export default AppWrapper 