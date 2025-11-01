import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Complaints from './pages/Complaints'
import Facility from './pages/Facility'
import Payments from './pages/Payments'
import Unauthorized from './pages/Unauthorized'
import ProtectedRoute from './components/ProtectedRoute'
import ResidentDashboard from './pages/dashboard/ResidentDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import VendorDashboard from './pages/dashboard/VendorDashboard'
import Announcements from './pages/Announcements'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/complaints" element={<Complaints/>} />
      <Route path="/facility" element={<Facility/>} />
      <Route path="/payments" element={<Payments/>} />
  <Route path="/announcements" element={<Announcements/>} />
  <Route path="/forgot-password" element={<ForgotPassword/>} />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={['resident','vendor','admin']}>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected Dashboard Routes */}
      <Route 
        path="/dashboard/resident" 
        element={
          <ProtectedRoute allowedRoles={['resident']}>
            <ResidentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/vendor" 
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}
