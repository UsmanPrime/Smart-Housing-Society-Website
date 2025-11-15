import { useEffect, useRef } from 'react'
import useAuth from '../../hooks/useAuth'
import { useBookingsStore } from '../../hooks/useBookingsStore'

const statusCls = (s) =>
  s==='approved' ? 'bg-emerald-600' :
  s==='pending' ? 'bg-amber-600' :
  s==='rejected' ? 'bg-rose-600' :
  s==='cancelled' ? 'bg-slate-500' : 'bg-blue-600'

export default function BookingDetailModal({ booking, onClose, facilityName }) {
  const { isAdmin, user } = useAuth()
  const { updateBookingStatus, cancelBooking } = useBookingsStore()
  const ref = useRef(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey) }
  }, [onClose])

  const canCancel = (isAdmin || user?.id === booking.createdBy) && booking.status !== 'cancelled'

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4" onMouseDown={(e)=>e.target===e.currentTarget && onClose()}>
      <div ref={ref} className="bg-white rounded-xl w-full max-w-md overflow-hidden">
        <div className="bg-[#07164a] text-white px-5 py-3 flex items-center justify-between">
          <div className="font-semibold">Booking Details</div>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="p-5 space-y-3">
          <div className="text-lg font-semibold">{booking.title}</div>
          <div className="text-sm text-gray-700">{facilityName}</div>
          <div className="text-sm text-gray-700">
            {new Date(booking.start).toLocaleString()} - {new Date(booking.end).toLocaleTimeString()}
          </div>
          <div className="text-sm">
            Status: <span className={`text-white text-xs px-2 py-0.5 rounded ${statusCls(booking.status)}`}>{booking.status}</span>
          </div>
          {booking.note && <div className="text-sm text-gray-700">Note: {booking.note}</div>}

          {isAdmin && (
            <div className="flex gap-2 pt-2">
              <button onClick={()=>updateBookingStatus(booking.id,'approved')} className="text-xs px-2 py-1 rounded border">Approve</button>
              <button onClick={()=>updateBookingStatus(booking.id,'rejected')} className="text-xs px-2 py-1 rounded border">Reject</button>
            </div>
          )}

          {canCancel && (
            <button onClick={()=>{ cancelBooking(booking.id); onClose() }} className="text-xs px-3 py-1 rounded border text-rose-700 border-rose-300">
              Cancel Booking
            </button>
          )}

          <div className="flex justify-end pt-2">
            <button onClick={onClose} className="text-xs px-3 py-1 rounded border">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}