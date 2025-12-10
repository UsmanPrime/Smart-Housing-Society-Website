import { useState, useEffect, useCallback, useMemo } from 'react'
import useAuth from './useAuth'

const API_BASE = '/api'

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token')
}

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }

  return data
}

export default function useComplaints() {
  const auth = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch complaints from API
  const fetchComplaints = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.category) queryParams.append('category', filters.category)
      if (filters.priority) queryParams.append('priority', filters.priority)
      if (filters.assignedTo) queryParams.append('assignedTo', filters.assignedTo)
      if (filters.submittedBy) queryParams.append('submittedBy', filters.submittedBy)
      
      const queryString = queryParams.toString()
      const endpoint = `/complaints${queryString ? `?${queryString}` : ''}`
      
      const result = await apiRequest(endpoint)
      setComplaints(result.data || [])
      setLoading(false)
      return result.data || []
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return []
    }
  }, [])

  // Fetch single complaint by ID
  const fetchComplaintById = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiRequest(`/complaints/${id}`)
      setLoading(false)
      return result.data
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return null
    }
  }, [])

  // Filter complaints locally (for quick filtering without API call)
  const filterComplaints = useCallback((tab, filters = {}) => {
    const uid = auth.user?.id;
    return complaints.filter(c => {
      // Tab filtering
      const submittedId = c.submittedBy?._id || c.submittedBy?.id || c.submittedBy;
      const assignedId = c.assignedTo?._id || c.assignedTo?.id || c.assignedTo;
      if (tab === 'my' && submittedId !== uid) return false;
      if (tab === 'assigned' && assignedId !== uid) return false;
      // 'all' tab shows everything (admin view)

      // Additional filters
      if (filters.status && c.status !== filters.status) return false;
      if (filters.priority && c.priority !== filters.priority) return false;
      if (filters.category && c.category !== filters.category) return false;

      return true;
    });
  }, [complaints, auth.user]);

  // Memoized filtered result for performance
  const memoizedFilteredComplaints = useMemo(() => {
    return filterComplaints('all', {});
  }, [filterComplaints]);

  // Refresh complaints (re-fetch from API)
  const refresh = useCallback(() => {
    return fetchComplaints()
  }, [fetchComplaints])

  return {
    complaints: memoizedFilteredComplaints,
    loading,
    error,
    fetchComplaints,
    fetchComplaintById,
    filterComplaints,
    refresh,
    user: auth.user,
    isAuthenticated: auth.isAuthenticated
  }
}