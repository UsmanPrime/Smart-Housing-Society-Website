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
  const { deleteBooking, approveBooking, rejectBooking } = useBookingsStore()
  const ref = useRef(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey) }
  }, [onClose])

  const canCancel = (isAdmin || user?.id === (booking.userId?._id || booking.userId)) && booking.status !== 'cancelled'

  const handleApprove = async () => {
    await approveBooking(booking._id || booking.id)
    onClose()
  }

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:')
    if (reason) {
      await rejectBooking(booking._id || booking.id, reason)
      onClose()
    }
  }

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await deleteBooking(booking._id || booking.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4" onMouseDown={(e)=>e.target===e.currentTarget && onClose()}>
      <div ref={ref} className="bg-white rounded-xl w-full max-w-md overflow-hidden">
        <div className="bg-[#07164a] text-white px-5 py-3 flex items-center justify-between">
          <div className="font-semibold">Booking Details</div>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="p-5 space-y-3">
          <div className="text-lg font-semibold">{booking.purpose || 'Booking'}</div>
          <div className="text-sm text-gray-700">{facilityName || booking.facilityId?.name}</div>
          <div className="text-sm text-gray-700">
            {new Date(booking.startTime || booking.start).toLocaleString()} - {new Date(booking.endTime || booking.end).toLocaleTimeString()}
          </div>
          <div className="text-sm">
            Status: <span className={`text-white text-xs px-2 py-0.5 rounded ${statusCls(booking.status)}`}>{booking.status}</span>
          </div>
          {booking.notes && <div className="text-sm text-gray-700">Notes: {booking.notes}</div>}
          {booking.attendees && <div className="text-sm text-gray-700">Attendees: {booking.attendees}</div>}
          {booking.rejectionReason && <div className="text-sm text-rose-600">Rejection Reason: {booking.rejectionReason}</div>}

          {isAdmin && booking.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <button onClick={handleApprove} className="text-xs px-3 py-1 rounded bg-emerald-600 text-white">Approve</button>
              <button onClick={handleReject} className="text-xs px-3 py-1 rounded bg-rose-600 text-white">Reject</button>
            </div>
          )}

          {canCancel && (
            <button onClick={handleCancel} className="text-xs px-3 py-1 rounded border text-rose-700 border-rose-300">
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