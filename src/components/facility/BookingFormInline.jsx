import { useEffect, useMemo, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import { useBookingsStore } from '../../hooks/useBookingsStore'

export default function BookingFormInline() {
  const { user } = useAuth()
  const { listFacilities, createBooking } = useBookingsStore()
  const facilities = listFacilities()
  const today = useMemo(() => new Date().toISOString().slice(0,10), [])
  const [form, setForm] = useState({
    facilityId: facilities[0]?.id || '',
    title: '',
    date: today,
    startTime: '10:00',
    endTime: '12:00',
    note: ''
  })
  const [errors, setErrors] = useState({})
  const [conflicts, setConflicts] = useState([])
  const [success, setSuccess] = useState('')

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.facilityId) e.facilityId = 'Select a facility'
    if (!form.title || form.title.trim().length < 3) e.title = 'Min 3 characters'
    if (!form.date) e.date = 'Date is required'
    if (!form.startTime) e.startTime = 'Start time required'
    if (!form.endTime) e.endTime = 'End time required'
    if (form.startTime && form.endTime && form.endTime <= form.startTime) e.endTime = 'End must be after start'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = (e) => {
    e.preventDefault()
    setSuccess('')
    setConflicts([])
    if (!validate()) return
    const res = createBooking({
      facilityId: form.facilityId,
      title: form.title,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      note: form.note,
      createdBy: user?.id || 'resident1',
    })
    if (!res.ok) { setConflicts(res.conflicts); return }
    setSuccess('Booking request submitted (pending approval).')
    setForm(prev => ({ ...prev, title: '', note: '' }))
  }

  // if facilities list updates (replaced), keep a valid selection
  useEffect(() => {
    if (!form.facilityId || !facilities.find(f => f.id === form.facilityId)) {
      setForm(prev => ({ ...prev, facilityId: facilities[0]?.id || '' }))
    }
  }, [facilities]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {/* Match Key Features font (DM Serif Display) */}
      <h2
        className="text-4xl md:text-4xl font-normal text-[#06164a] mb-4"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        Create a booking
      </h2>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-base font-semibold mb-2">Facility</label>
          <select
            value={form.facilityId}
            onChange={e=>set('facilityId', e.target.value)}
            className="w-full bg-[#07164a] text-white rounded-lg h-12 px-4"
            required
          >
            {facilities.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {errors.facilityId && <div className="text-xs text-rose-500 mt-1">{errors.facilityId}</div>}
        </div>

        <div>
          <label className="block text-base font-semibold mb-2">Booking Title</label>
          <input
            value={form.title}
            onChange={e=>set('title', e.target.value)}
            className="w-full bg-[#07164a] text-white rounded-lg h-12 px-4"
            placeholder="Enter a short title"
            required
          />
          {errors.title && <div className="text-xs text-rose-500 mt-1">{errors.title}</div>}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-base font-semibold mb-2">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e=>set('date', e.target.value)}
              className="w-full bg-[#07164a] text-white rounded-lg h-12 px-4"
              required
            />
            {errors.date && <div className="text-xs text-rose-500 mt-1">{errors.date}</div>}
          </div>
          <div>
            <label className="block text-base font-semibold mb-2">Start Time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={e=>set('startTime', e.target.value)}
              className="w-full bg-[#07164a] text-white rounded-lg h-12 px-4"
              required
            />
            {errors.startTime && <div className="text-xs text-rose-500 mt-1">{errors.startTime}</div>}
          </div>
          <div>
            <label className="block text-base font-semibold mb-2">End Time</label>
            <input
              type="time"
              value={form.endTime}
              onChange={e=>set('endTime', e.target.value)}
              className="w-full bg-[#07164a] text-white rounded-lg h-12 px-4"
              required
            />
            {errors.endTime && <div className="text-xs text-rose-500 mt-1">{errors.endTime}</div>}
          </div>
        </div>

        <div>
          <label className="block text-base font-semibold mb-2">Note (Optional)</label>
          <textarea
            value={form.note}
            onChange={e=>set('note', e.target.value)}
            rows={3}
            className="w-full bg-[#07164a] text-white rounded-lg p-4"
            placeholder="Any additional details"
          />
        </div>

        {conflicts.length > 0 && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-2">
            Time conflicts with existing bookings:
            <ul className="list-disc ml-4">
              {conflicts.map(c => (
                <li key={c.id}>
                  {new Date(c.start).toLocaleTimeString()} - {new Date(c.end).toLocaleTimeString()} • {c.title} ({c.status})
                </li>
              ))}
            </ul>
          </div>
        )}

        {success && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2">{success}</div>}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="bg-[#07164a] text-white px-4 py-2 rounded-md hover:bg-[#0a1f6b] transition-colors"
            aria-label="Submit booking"
          >
            Submit Booking
          </button>
        </div>
      </form>
    </div>
  )
}