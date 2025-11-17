// Use relative path to leverage Vite's proxy in development
// In production, this should point to your actual API server
const BASE = import.meta.env.PROD ? 'http://localhost:5000/api' : '/api';

async function api(url, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  try {
    const res = await fetch(BASE + url, {
      headers,
      credentials: 'include',
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      let errorMessage = text || res.statusText;
      try {
        const json = JSON.parse(text);
        errorMessage = json.message || errorMessage;
      } catch (e) {
        // text is not JSON
      }
      throw new Error(errorMessage);
    }
    return res.status === 204 ? null : res.json();
  } catch (error) {
    // Re-throw with more context
    console.error('API call failed:', BASE + url, error);
    throw error;
  }
}

export const bookingsApi = {
  // Facilities endpoints
  listFacilities: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api('/facilities' + (q ? `?${q}` : ''));
  },
  
  getFacility: (id) => api(`/facilities/${id}`),
  
  createFacility: (data) => api('/facilities', { method: 'POST', body: data }),
  
  updateFacility: (id, data) => api(`/facilities/${id}`, { method: 'PUT', body: data }),
  
  deleteFacility: (id, softDelete = false) => 
    api(`/facilities/${id}${softDelete ? '?softDelete=true' : ''}`, { method: 'DELETE' }),

  // Bookings endpoints
  listBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api('/bookings' + (q ? `?${q}` : ''));
  },
  
  getBooking: (id) => api(`/bookings/${id}`),
  
  createBooking: (data) => api('/bookings', { method: 'POST', body: data }),
  
  updateBooking: (id, data) => api(`/bookings/${id}`, { method: 'PUT', body: data }),
  
  deleteBooking: (id) => api(`/bookings/${id}`, { method: 'DELETE' }),
  
  // Approval/Rejection
  approveBooking: (id) => api(`/bookings/${id}/approve`, { method: 'PUT' }),
  
  rejectBooking: (id, rejectionReason) => 
    api(`/bookings/${id}/reject`, { method: 'PUT', body: { rejectionReason } }),
  
  // Calendar data
  getCalendarData: (facilityId, startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate }).toString();
    return api(`/bookings/calendar/${facilityId}?${params}`);
  },
  
  // Conflict checking
  checkConflicts: (facilityId, startTime, endTime, excludeBookingId = null) => {
    const params = new URLSearchParams({
      facilityId,
      startTime,
      endTime,
      ...(excludeBookingId && { excludeBookingId })
    }).toString();
    return api(`/bookings/conflicts/check?${params}`);
  }
};