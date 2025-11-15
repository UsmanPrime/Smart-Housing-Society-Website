import { useState } from 'react'
import useAuth from '../../hooks/useAuth'
import { useBookingsStore } from '../../hooks/useBookingsStore'

export default function BookingForm({ facilityId, date, onClose }) {
  const { user } = useAuth()
  const { createBooking } = useBookingsStore()
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('12:00')
  const [error, setError] = useState('')
  const [conflicts, setConflicts] = useState([])

  const submit = (e) => {
    e.preventDefault()
    setError('')
    setConflicts([])
    if (title.trim().length < 3) return setError('Title min 3 chars')
    if (endTime <= startTime) return setError('End time must be after start time')
    const res = createBooking({
      facilityId,
      title: title.trim(),
      date: date.toISOString().slice(0,10),
      startTime, endTime, note,
      createdBy: user?.id || 'resident1',
    })
    if (!res.ok) { setConflicts(res.conflicts); return }
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-3" aria-label="Create booking form">
      <div className="text-sm">New booking for <strong>{date.toDateString()}</strong></div>
      <div>
        <label className="block text-sm">Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-[#07164a] text-white rounded px-3 py-2" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Start</label>
          <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full bg-[#07164a] text-white rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm">End</label>
          <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} className="w-full bg-[#07164a] text-white rounded px-3 py-2" required />
        </div>
      </div>
      <div>
        <label className="block text-sm">Note (optional)</label>
        <input value={note} onChange={e=>setNote(e.target.value)} className="w-full bg-[#07164a] text-white rounded px-3 py-2" />
      </div>
      {error && <div className="text-xs text-rose-600">{error}</div>}
      {conflicts.length > 0 && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-2">
          Conflicts with:
          <ul className="list-disc ml-4">
            {conflicts.map(c => (
              <li key={c.id}>{c.title} • {new Date(c.start).toLocaleTimeString()} - {new Date(c.end).toLocaleTimeString()} ({c.status})</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded border">Cancel</button>
        <button type="submit" className="px-3 py-2 text-sm rounded bg-[#07164a] text-white">Create</button>
      </div>
    </form>
  )
}