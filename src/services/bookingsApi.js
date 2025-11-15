const BASE = 'http://localhost:5000/api'; // keep your 5000 backend

async function api(url, opts = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.status === 204 ? null : res.json()
}

export const bookingsApi = {
  listFacilities: () => api('/facilities'),
  listBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return api('/bookings' + (q ? `?${q}` : ''))
  },
  createBooking: (data) => api('/bookings', { method: 'POST', body: data }),
  updateStatus: (id, status, reason, reviewedBy) =>
    api(`/bookings/${id}`, { method: 'PATCH', body: { status, reason, reviewedBy } }),
  approve: (id, reason, reviewedBy) =>
    api(`/bookings/${id}/approve`, { method: 'POST', body: { reason, reviewedBy } }),
  reject: (id, reason, reviewedBy) =>
    api(`/bookings/${id}/reject`, { method: 'POST', body: { reason, reviewedBy } }),
  cancel: (id) => api(`/bookings/${id}/cancel`, { method: 'POST' }),
}