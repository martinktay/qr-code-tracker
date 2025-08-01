import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ScanAndLog from './pages/ScanAndLog'
import RegisterBox from './pages/RegisterBox'
import RegisterSack from './pages/RegisterSack'
import CustomerPortal from './pages/CustomerPortal'
import ParcelTimeline from './pages/ParcelTimeline'
import AdminPanel from './pages/AdminPanel'
import CommunicationCenter from './pages/CommunicationCenter'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import HelpPage from './pages/HelpPage'
import MapTracker from './pages/MapTracker'
import TestFunctionality from './components/TestFunctionality'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/portal" element={<CustomerPortal />} />
          
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
          
          <Route path="/scan-and-log" element={
            <ProtectedRoute allowedRoles={['admin', 'warehouse_staff']}>
              <Layout>
                <ScanAndLog />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/register-box" element={
            <ProtectedRoute allowedRoles={['admin', 'warehouse_staff']}>
              <Layout>
                <RegisterBox />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/register-sack" element={
            <ProtectedRoute allowedRoles={['admin', 'warehouse_staff']}>
              <Layout>
                <RegisterSack />
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
          
          <Route path="/communication-center" element={
            <ProtectedRoute>
              <Layout>
                <CommunicationCenter />
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
          
          <Route path="/track/box/:id" element={
            <ProtectedRoute>
              <Layout>
                <ParcelTimeline />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/track/sack/:id" element={
            <ProtectedRoute>
              <Layout>
                <ParcelTimeline />
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
          
          {/* Catch-all route for undefined paths */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              border: '1px solid #374151',
            },
            success: {
              style: {
                background: '#065f46',
                color: '#d1fae5',
                border: '1px solid #047857',
              },
            },
            error: {
              style: {
                background: '#7f1d1d',
                color: '#fecaca',
                border: '1px solid #dc2626',
              },
            },
          }}
        />
      </AuthProvider>
    </div>
  )
}

export default App 