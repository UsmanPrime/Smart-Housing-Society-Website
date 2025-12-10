import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Home from './pages/Home'
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Complaints = lazy(() => import('./pages/Complaints'))
const Earnings = lazy(() => import('./pages/Earnings'))
const Facility = lazy(() => import('./pages/Facility'))
const Payments = lazy(() => import('./pages/Payments'))
const Unauthorized = lazy(() => import('./pages/Unauthorized'))
const ResidentDashboard = lazy(() => import('./pages/dashboard/ResidentDashboard'))
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'))
const VendorDashboard = lazy(() => import('./pages/dashboard/VendorDashboard'))
const Announcements = lazy(() => import('./pages/Announcements'))
const Profile = lazy(() => import('./pages/Profile'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const VendorComplaintsPage = lazy(() => import('./pages/VendorComplaints'))
const FacilityPage = lazy(() => import('./pages/Facility'))
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'))
const ReportsDashboard = lazy(() => import('./pages/admin/ReportsDashboard'))
const CreateCharge = lazy(() => import('./pages/admin/CreateCharge'))
const PaymentVerification = lazy(() => import('./pages/admin/PaymentVerification'))
const PaymentManagement = lazy(() => import('./pages/PaymentManagement'))
import ProtectedRoute from './components/ProtectedRoute'

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#07164a]"></div>
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />
      <Route path="/signup" element={<Suspense fallback={<LoadingFallback />}><Register /></Suspense>} />
      <Route path="/complaints" element={<Suspense fallback={<LoadingFallback />}><Complaints/></Suspense>} />
      <Route path="/facility" element={<Suspense fallback={<LoadingFallback />}><Facility/></Suspense>} />
      <Route path="/payments" element={<Suspense fallback={<LoadingFallback />}><Payments/></Suspense>} />
      <Route path="/earnings" element={<Suspense fallback={<LoadingFallback />}><Earnings/></Suspense>} />
      <Route path="/announcements" element={<Suspense fallback={<LoadingFallback />}><Announcements/></Suspense>} />
      <Route path="/forgot-password" element={<Suspense fallback={<LoadingFallback />}><ForgotPassword/></Suspense>} />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={['resident','vendor','admin']}>
            <Suspense fallback={<LoadingFallback />}><Profile /></Suspense>
          </ProtectedRoute>
        } 
      />
      <Route path="/unauthorized" element={<Suspense fallback={<LoadingFallback />}><Unauthorized /></Suspense>} />
      
      {/* Protected Dashboard Routes */}
      <Route 
        path="/dashboard/resident" 
        element={
          <ProtectedRoute allowedRoles={['resident']}>
            <Suspense fallback={<LoadingFallback />}><ResidentDashboard /></Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/vendor" 
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <Suspense fallback={<LoadingFallback />}><VendorDashboard /></Suspense>
          </ProtectedRoute>
        } 
      />
      <Route path="/vendor/complaints" element={<Suspense fallback={<LoadingFallback />}><VendorComplaintsPage /></Suspense>} />
      <Route path="/facilities" element={<Suspense fallback={<LoadingFallback />}><FacilityPage /></Suspense>} />
      <Route path="/payment-management" element={
        <ProtectedRoute allowedRoles={['resident']}>
          <Suspense fallback={<LoadingFallback />}><PaymentManagement /></Suspense>
        </ProtectedRoute>
      } />
      <Route path="/admin/audit-logs" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Suspense fallback={<LoadingFallback />}><AuditLogs /></Suspense>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Suspense fallback={<LoadingFallback />}><ReportsDashboard /></Suspense>
        </ProtectedRoute>
      } />
      <Route path="/admin/create-charge" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Suspense fallback={<LoadingFallback />}><CreateCharge /></Suspense>
        </ProtectedRoute>
      } />
      <Route path="/admin/payment-verification" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Suspense fallback={<LoadingFallback />}><PaymentVerification /></Suspense>
        </ProtectedRoute>
      } />
    </Routes>
  )
}
