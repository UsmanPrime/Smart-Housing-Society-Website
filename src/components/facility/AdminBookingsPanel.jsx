import { useEffect, useState, useMemo } from 'react'
import { useBookingsStore } from '../../hooks/useBookingsStore'
import BookingLegend from './BookingLegend'
import BookingDetailModal from './BookingDetailModal'

const statusClasses = {
  approved: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  rejected: 'bg-rose-50 text-rose-700',
  cancelled: 'bg-slate-100 text-slate-600'
}

export default function AdminBookingsPanel() {
  const { refresh, bookings, listFacilities, loading, error } = useBookingsStore()
  const [filterStatus, setFilterStatus] = useState('all')
  const [facilityId, setFacilityId] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => { refresh(facilityId === 'all' ? undefined : facilityId) }, [refresh, facilityId])

  const facilities = listFacilities()
  const facMap = useMemo(() => Object.fromEntries(facilities.map(f => [f.id, f.name])), [facilities])

  const filtered = bookings.filter(b =>
    (filterStatus === 'all' || b.status === filterStatus) &&
    (facilityId === 'all' || b.facilityId === facilityId)
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <h3 className="text-2xl font-semibold" style={{ fontFamily: "'DM Serif Display', serif" }}>All Facility Bookings</h3>
        <select value={facilityId} onChange={e=>setFacilityId(e.target.value)} className="bg-[#07164a] text-white rounded px-3 py-2 text-sm">
          <option value="all">All Facilities</option>
          {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="bg-[#07164a] text-white rounded px-3 py-2 text-sm">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="ml-auto"><BookingLegend /></div>
      </div>

      {loading && <div className="text-sm">Loading…</div>}
      {error && <div className="text-sm text-rose-600">{error}</div>}

      <div className="overflow-x-auto bg-white rounded-md shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-slate-50">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Facility</th>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-2">{b.title}</td>
                <td className="px-4 py-2">{facMap[b.facilityId]}</td>
                <td className="px-4 py-2">
                  {new Date(b.start).toLocaleDateString()}<br />
                  {new Date(b.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusClasses[b.status] || 'bg-blue-50 text-blue-700'}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button onClick={()=>setSelected(b)} className="text-xs px-3 py-1 rounded bg-[#07164a] text-white">View</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No bookings</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <BookingDetailModal
          booking={selected}
          facilityName={facMap[selected.facilityId]}
          onClose={()=>setSelected(null)}
        />
      )}
    </div>
  )
}