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
      setFacilities(data || []);
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
      
      const response = await bookingsApi.listBookings(filters);
      setBookings(response.bookings || []);
      return response;
    } catch (e) {
      console.error('Error fetching bookings:', e);
      // Don't set error if it's just an auth issue or network error
      const errorMsg = e.message || '';
      if (!errorMsg.includes('401') && 
          !errorMsg.includes('token') && 
          !errorMsg.includes('No token') &&
          !errorMsg.includes('Failed to fetch')) {
        setError('Failed to load bookings: ' + errorMsg);
      }
      setBookings([]);
      return { bookings: [], total: 0 };
    } finally {
      setLoading(false);
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
      
      // Update local state
      setBookings(prev => prev.map(b => b._id === id ? result.booking : b));
      
      return { ok: true, booking: result.booking, message: result.message };
    } catch (e) {
      console.error('Error updating booking:', e);
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBooking = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await bookingsApi.deleteBooking(id);
      
      // Remove from local state
      setBookings(prev => prev.filter(b => b._id !== id));
      
      return { ok: true, message: 'Booking cancelled successfully' };
    } catch (e) {
      console.error('Error deleting booking:', e);
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const approveBooking = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingsApi.approveBooking(id);
      
      // Update local state
      setBookings(prev => prev.map(b => b._id === id ? result.booking : b));
      
      return { ok: true, booking: result.booking, message: result.message };
    } catch (e) {
      console.error('Error approving booking:', e);
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectBooking = useCallback(async (id, rejectionReason) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingsApi.rejectBooking(id, rejectionReason);
      
      // Update local state
      setBookings(prev => prev.map(b => b._id === id ? result.booking : b));
      
      return { ok: true, booking: result.booking, message: result.message };
    } catch (e) {
      console.error('Error rejecting booking:', e);
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, []);

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