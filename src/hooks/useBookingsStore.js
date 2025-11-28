import { useEffect, useState, useCallback } from 'react';
import { bookingsApi } from '../services/bookingsApi';

export function useBookingsStore() {
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFacilities = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching facilities from API... (attempt', retryCount + 1, ')');
      const data = await bookingsApi.listFacilities();
      console.log('Facilities loaded:', data?.length || 0);
      
      // Normalize facility data to have consistent 'id' field
      const normalizedFacilities = (data || []).map(facility => ({
        ...facility,
        id: facility._id || facility.id
      }));
      
      setFacilities(normalizedFacilities);
      setLoading(false);
    } catch (e) {
      console.error('Error fetching facilities:', e);
      
      // Retry once if it's a network error
      if (retryCount === 0 && e.message.includes('fetch')) {
        console.log('Retrying facilities fetch...');
        setTimeout(() => fetchFacilities(1), 1000);
        return;
      }
      
      setError('Failed to load facilities: ' + e.message);
      setFacilities([]); // Set empty array on error
      setLoading(false);
    }
  }, []);

  // Fetch facilities on mount
  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const fetchBookings = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No auth token found - user may not be logged in');
        setBookings([]);
        setLoading(false);
        return { bookings: [], total: 0 };
      }
      
      console.log('Fetching bookings with filters:', filters);
      const response = await bookingsApi.listBookings(filters);
      console.log('Bookings API response:', response);
      
      // Normalize booking data structure for consistent usage across components
      const normalizedBookings = (response.bookings || []).map(booking => ({
        ...booking,
        id: booking._id || booking.id,
        start: booking.startTime || booking.start,
        end: booking.endTime || booking.end,
        facilityId: booking.facilityId?._id || booking.facilityId,
        facilityName: booking.facilityId?.name,
        userId: booking.userId?._id || booking.userId,
        userName: booking.userId?.name,
      }));
      
      console.log('Normalized bookings:', normalizedBookings.length, 'bookings');
      setBookings(normalizedBookings);
      setLoading(false);
      return { ...response, bookings: normalizedBookings };
    } catch (e) {
      console.error('Error fetching bookings:', e);
      console.error('Error details:', e.message);
      
      // Always set the error to be visible
      setError('Failed to load bookings: ' + (e.message || 'Unknown error'));
      setBookings([]);
      setLoading(false);
      return { bookings: [], total: 0 };
    }
  }, []);

  const createBooking = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingsApi.createBooking(data);
      
      // Refresh bookings after creation
      await fetchBookings();
      
      return { ok: true, booking: result.booking, message: result.message };
    } catch (e) {
      console.error('Error creating booking:', e);
      
      // Try to parse error for conflicts
      try {
        const errorData = JSON.parse(e.message);
        if (errorData.conflicts) {
          return { ok: false, conflicts: errorData.conflicts, message: errorData.message };
        }
        if (errorData.errors) {
          return { ok: false, error: errorData.errors.join(', '), message: errorData.message };
        }
      } catch (parseError) {
        // Not JSON, use plain error message
      }
      
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, [fetchBookings]);

  const updateBooking = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingsApi.updateBooking(id, data);
      
      // Refresh bookings to ensure normalized state
      await fetchBookings();
      
      return { ok: true, booking: result.booking, message: result.message };
    } catch (e) {
      console.error('Error updating booking:', e);
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, [fetchBookings]);

  const deleteBooking = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await bookingsApi.deleteBooking(id);
      
      // Refresh bookings
      await fetchBookings();
      
      return { ok: true, message: 'Booking cancelled successfully' };
    } catch (e) {
      console.error('Error deleting booking:', e);
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, [fetchBookings]);

  const approveBooking = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingsApi.approveBooking(id);
      
      // Refresh bookings to reflect changes
      await fetchBookings();
      
      return { ok: true, booking: result.booking, message: result.message };
    } catch (e) {
      console.error('Error approving booking:', e);
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, [fetchBookings]);

  const rejectBooking = useCallback(async (id, rejectionReason) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingsApi.rejectBooking(id, rejectionReason);
      
      // Refresh bookings to reflect changes
      await fetchBookings();
      
      return { ok: true, booking: result.booking, message: result.message };
    } catch (e) {
      console.error('Error rejecting booking:', e);
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, [fetchBookings]);

  const getCalendarData = useCallback(async (facilityId, startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingsApi.getCalendarData(facilityId, startDate, endDate);
      return data;
    } catch (e) {
      console.error('Error fetching calendar data:', e);
      setError(e.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const checkConflicts = useCallback(async (facilityId, startTime, endTime, excludeBookingId = null) => {
    try {
      const result = await bookingsApi.checkConflicts(facilityId, startTime, endTime, excludeBookingId);
      return result;
    } catch (e) {
      console.error('Error checking conflicts:', e);
      return { hasConflicts: false, conflicts: [] };
    }
  }, []);

  const listFacilities = useCallback(() => facilities, [facilities]);
  
  const listMyBookings = useCallback((userId) => {
    return bookings.filter(b => b.userId?._id === userId || b.userId === userId);
  }, [bookings]);

  return {
    facilities,
    bookings,
    loading,
    error,
    fetchFacilities,
    fetchBookings,
    refresh: fetchBookings, // alias for AdminDashboard compatibility
    listFacilities,
    listMyBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    approveBooking,
    rejectBooking,
    getCalendarData,
    checkConflicts,
  };
}