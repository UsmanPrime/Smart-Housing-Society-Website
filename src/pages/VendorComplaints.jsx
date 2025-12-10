import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import { api } from '../lib/api'
import VendorWorkCard from '../components/vendor/VendorWorkCard'
import ComplaintDetailModal from '../components/complaints/ComplaintDetailModal'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function VendorComplaintsPage() {
  const { user, isVendor } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState({ open: 0, 'in-progress': 0, completed: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!isVendor || !user) return

    const fetchMyWork = async () => {
      try {
        setLoading(true)
        const token = user?.token || localStorage.getItem('token') || undefined
        const data = await api.get('/api/vendors/my-work', { token })
        const payload = data?.data || {}
        setComplaints(payload.complaints || [])
        setStats(payload.stats || { open: 0, 'in-progress': 0, completed: 0, total: 0 })
      } catch (error) {
        console.error('Failed to fetch vendor work:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMyWork()
  }, [isVendor, user])

  const handleComplaintUpdate = () => {
    // Data will refresh when component re-renders or filters change
    // The useEffect will automatically refetch on state changes
  }

  if (!isVendor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-slate-100 py-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-rose-100 border border-rose-300 text-rose-800 px-4 py-3 rounded">
              You need vendor role to access this page.
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-2xl font-semibold mb-6">My Vendor Tasks</h1>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Open</div>
              <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">In Progress</div>
              <div className="text-2xl font-bold text-yellow-600">{stats['in-progress']}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Total Assigned</div>
              <div className="text-2xl font-bold text-[#07164a]">{stats.total}</div>
            </div>
          </div>

          {/* Complaints Grid */}
          {loading && (
            <div className="text-center py-12 text-gray-600">Loading your tasks...</div>
          )}

          {!loading && complaints.length === 0 && (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-gray-500 mb-2">No complaints assigned to you yet.</div>
              <div className="text-sm text-gray-400">You'll see your tasks here once they're assigned.</div>
            </div>
          )}

          {!loading && complaints.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {complaints.map(c => (
                <VendorWorkCard
                  key={c._id}
                  c={c}
                  onSelect={setSelected}
                  onAction={handleComplaintUpdate}
                  canAct={true}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      {selected && (
        <ComplaintDetailModal 
          complaint={selected} 
          onClose={() => setSelected(null)} 
          onUpdate={handleComplaintUpdate}
        />
      )}
    </div>
  )
}