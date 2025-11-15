import { useState, useMemo } from 'react'
import useAuth from '../hooks/useAuth'
import { useComplaintsStore } from '../hooks/useComplaintsStore'
import VendorWorkCard from '../components/vendor/VendorWorkCard'
import ComplaintDetailModal from '../components/complaints/ComplaintDetailModal'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function VendorComplaintsPage() {
  const { user, isVendor } = useAuth()
  const { items, updateStatus } = useComplaintsStore()
  const [selected, setSelected] = useState(null)
  const vid = user?.id || 'vendor1'
  const mine = useMemo(()=> items.filter(c => c.assignedTo === vid), [items, vid])

  const handleAction = (c, action) => {
    if (action === 'accept' && c.status === 'open') updateStatus(c.id,'accepted')
    else if (action === 'in_progress') updateStatus(c.id,'in_progress')
    else if (action === 'completed') updateStatus(c.id,'completed')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-2xl font-semibold mb-6">Vendor Tasks</h1>
          {!isVendor && <div className="text-sm text-rose-600 mb-4">Not a vendor role.</div>}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mine.map(c => (
              <VendorWorkCard
                key={c.id}
                c={c}
                onSelect={setSelected}
                onAction={handleAction}
                canAct={true}
              />
            ))}
            {mine.length === 0 && <div className="text-sm text-gray-600">No assigned complaints.</div>}
          </div>
        </div>
      </main>
      <Footer />
      {selected && <ComplaintDetailModal complaint={selected} onClose={()=>setSelected(null)} />}
    </div>
  )
}