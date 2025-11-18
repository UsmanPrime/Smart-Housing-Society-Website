import useAuth from '../../hooks/useAuth'
import { useEffect, useState } from 'react'
import { useBookingsStore } from '../../hooks/useBookingsStore'
import BookingLegend from './BookingLegend'
import BookingDetailModal from './BookingDetailModal'

const statusColor = (s) =>
  s==='approved' ? 'text-emerald-600' :
  s==='pending' ? 'text-amber-600' :
  s==='rejected' ? 'text-rose-600' :
  s==='cancelled' ? 'text-slate-500' : 'text-blue-600'

export default function ResidentBookingsList() {
  const { user } = useAuth()
  const { listMyBookings, fetchBookings, listFacilities, loading, error } = useBookingsStore()
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const myBookings = listMyBookings(user?.id || '')
  const facMap = Object.fromEntries(listFacilities().map(f => [f._id, f.name]))

  const now = Date.now()
  const activeCount = myBookings.filter(
    b => !['cancelled','rejected'].includes(b.status) && new Date(b.end).getTime() >= now
  ).length

  return (
    <div className="bg-white rounded-xl shadow p-5 space-y-4">
      <div className="flex items-start md:items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-2xl font-semibold" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Facility Bookings
          </h3>
          <div className="text-sm text-gray-600">
            Active: <span className="font-semibold">{activeCount}</span>
          </div>
        </div>
        <BookingLegend />
      </div>

      {loading && <div className="text-sm">Loading…</div>}
      {error && <div className="text-sm text-rose-600">{error}</div>}

      <ul className="space-y-2">
        {myBookings.map(b => (
          <li key={b.id} className="rounded-md px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border">
            <div>
              <div className="font-medium">{b.title}</div>
              <div className="text-xs text-gray-600">
                {facMap[b.facilityId]} • {new Date(b.start).toLocaleDateString()} {new Date(b.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${statusColor(b.status)}`}>{b.status}</span>
              <button onClick={()=>setSelected(b)} className="text-xs px-3 py-1 rounded bg-[#07164a] text-white">Details</button>
            </div>
          </li>
        ))}
        {myBookings.length === 0 && !loading && (
          <li className="text-sm text-gray-600">No bookings yet.</li>
        )}
      </ul>

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