import { useEffect, useMemo, useState } from 'react'
import { useBookingsStore } from '../../hooks/useBookingsStore'
import useAuth from '../../hooks/useAuth'
import BookingLegend from './BookingLegend'

function ReasonDialog({ open, onClose, onConfirm, action }) {
  const [reason, setReason] = useState('')
  useEffect(() => { if (!open) setReason('') }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-md">
        <h4 className="text-lg font-semibold mb-2">{action === 'approve' ? 'Approve booking' : 'Reject booking'}</h4>
        <textarea className="w-full border rounded p-2 mb-3" rows={3} placeholder="Optional reason (visible to resident)" value={reason} onChange={e=>setReason(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
          <button onClick={()=>onConfirm(reason)} className={`px-3 py-2 rounded text-white ${action==='approve'?'bg-emerald-600':'bg-rose-600'}`}>
            {action==='approve'?'Approve':'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

const statusBadge = {
  approved: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  rejected: 'bg-rose-50 text-rose-700',
  cancelled: 'bg-slate-100 text-slate-600'
}

export default function BookingApprovalList() {
  const { user } = useAuth()
  const { facilities, listFacilities, bookings, refresh, loading, error, approveBooking, rejectBooking } = useBookingsStore()
  const [facilityId, setFacilityId] = useState('all')
  const [status, setStatus] = useState('pending')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [dlg, setDlg] = useState({ open: false, id: null, action: 'approve' })

  useEffect(() => {
    refresh({
      status,
      facilityId: facilityId === 'all' ? undefined : facilityId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
  }, [refresh, status, facilityId, dateFrom, dateTo])

  const facs = listFacilities().length ? listFacilities() : facilities
  const facMap = useMemo(() => Object.fromEntries(facs.map(f => [f.id, f.name])), [facs])

  const openDialog = (id, action) => setDlg({ open: true, id, action })
  const closeDialog = () => setDlg({ open: false, id: null, action: 'approve' })

  const onConfirm = async (reason) => {
    if (!dlg.id) return
    if (dlg.action === 'approve') await approveBooking(dlg.id, reason, user?.id || 'admin1')
    else await rejectBooking(dlg.id, reason, user?.id || 'admin1')
    closeDialog()
    // refresh list to reflect status change
    refresh({ status, facilityId: facilityId === 'all' ? undefined : facilityId, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined })
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold" style={{ fontFamily: "'DM Serif Display', serif" }}>Booking Approvals</h3>
        <BookingLegend />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select className="bg-[#07164a] text-white rounded px-3 py-2 text-sm" value={facilityId} onChange={e=>setFacilityId(e.target.value)}>
          <option value="all">All Facilities</option>
          {facs.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select className="bg-[#07164a] text-white rounded px-3 py-2 text-sm" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" className="bg-[#07164a] text-white rounded px-3 py-2 text-sm" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
        <input type="date" className="bg-[#07164a] text-white rounded px-3 py-2 text-sm" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
      </div>

      {loading && <div className="text-sm">Loading…</div>}
      {error && <div className="text-sm text-rose-600">{error}</div>}

      <div className="overflow-x-auto">
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
            {bookings.map(b => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-2">{b.title}</td>
                <td className="px-4 py-2">{facMap[b.facilityId] || b.facilityId}</td>
                <td className="px-4 py-2">{new Date(b.start).toLocaleDateString()} {new Date(b.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(b.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge[b.status] || 'bg-blue-50 text-blue-700'}`}>{b.status}</span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={()=>openDialog(b.id, 'approve')}
                      disabled={b.status!=='pending'}
                      className="text-xs px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-40"
                    >Approve</button>
                    <button
                      onClick={()=>openDialog(b.id, 'reject')}
                      disabled={b.status!=='pending'}
                      className="text-xs px-3 py-1 rounded bg-rose-600 text-white disabled:opacity-40"
                    >Reject</button>
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && !loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No bookings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ReasonDialog
        open={dlg.open}
        action={dlg.action}
        onClose={closeDialog}
        onConfirm={onConfirm}
      />
    </div>
  )
}