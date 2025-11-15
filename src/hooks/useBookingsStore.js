import { useEffect, useState, useCallback } from 'react'
import { bookingsApi } from '../services/bookingsApi'

const LS_FAC = 'facilities_local_v3'
const LS_BK = 'bookings_local'

const DEFAULT_FACILITIES = [
  { id: 'gym', name: 'Gym & Sports Facilities' },
  { id: 'maintenance', name: 'Maintenance & Repair services' },
  { id: 'admin_support', name: '24/7 Administrative Support' },
  { id: 'online_payments', name: 'Online Payments' },
  { id: 'complaints', name: 'Complaint & Service request' },
  { id: 'announcements', name: 'Real-Time Announcement' },
]

const readJSON = (k) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null } catch { return null } }
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

function loadFacilitiesWithMigration() {
  // try latest first
  const v3 = readJSON(LS_FAC)
  if (Array.isArray(v3) && v3.length) return v3
  // legacy keys
  const legacyKeys = ['facilities_local_v2', 'facilities_local']
  for (const k of legacyKeys) {
    const data = readJSON(k)
    if (Array.isArray(data) && data.length) {
      const looksLegacy =
        data.some(d => /clubhouse|tennis|banquet/i.test(d.name || '')) ||
        data.some(d => /^fac-\d+$/.test(d.id || ''))
      return looksLegacy ? DEFAULT_FACILITIES : data
    }
  }
  return DEFAULT_FACILITIES
}

const toISO = (dateStr, timeStr) => new Date(`${dateStr}T${timeStr}:00`).toISOString()
const overlaps = (aStart, aEnd, bStart, bEnd) => (new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd))

export function useBookingsStore() {
  const [facilities, setFacilities] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async (filters = {}) => {
    try {
      setLoading(true); setError(null)
      const [facRes, bkRes] = await Promise.all([
        facilities.length ? Promise.resolve(facilities) : bookingsApi.listFacilities(),
        bookingsApi.listBookings(filters)
      ])
      if (!facilities.length) setFacilities(facRes)
      setBookings(bkRes)
    } catch (e) {
      setError('Failed to load bookings. Ensure API is running on :5000.')
    } finally { setLoading(false) }
  }, [facilities])

  const listFacilities = useCallback(() => facilities, [facilities])
  const listMyBookings = useCallback((userId) => bookings.filter(b => b.createdBy === userId), [bookings])

  const createBooking = useCallback(async (data) => {
    try {
      const created = await bookingsApi.createBooking(data)
      setBookings(prev => [created, ...prev])
      return { ok: true, booking: created }
    } catch (e) {
      try {
        const parsed = JSON.parse(e.message)
        if (parsed?.conflicts) return { ok: false, conflicts: parsed.conflicts }
      } catch {}
      return { ok: false, error: e.message }
    }
  }, [])

  const updateBookingStatus = useCallback(async (id, status, reason, reviewedBy) => {
    const updated = await bookingsApi.updateStatus(id, status, reason, reviewedBy)
    setBookings(prev => prev.map(b => b.id === id ? updated : b))
  }, [])

  // Admin helpers
  const approveBooking = useCallback(async (id, reason, reviewer) => {
    const updated = await bookingsApi.approve(id, reason, reviewer)
    setBookings(prev => prev.map(b => b.id === id ? updated : b))
  }, [])
  const rejectBooking = useCallback(async (id, reason, reviewer) => {
    const updated = await bookingsApi.reject(id, reason, reviewer)
    setBookings(prev => prev.map(b => b.id === id ? updated : b))
  }, [])

  const cancelBooking = useCallback(async (id) => {
    const updated = await bookingsApi.cancel(id)
    setBookings(prev => prev.map(b => b.id === id ? updated : b))
  }, [])

  return {
    facilities, bookings, loading, error,
    refresh, listFacilities, listMyBookings,
    createBooking, updateBookingStatus, cancelBooking,
    approveBooking, rejectBooking,
  }
}