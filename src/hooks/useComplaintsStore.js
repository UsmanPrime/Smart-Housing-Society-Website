import { useCallback, useState } from 'react'

import { API_BASE } from '../lib/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token')
  return token
}

// Helper function to make authenticated API requests
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

export function useComplaintsStore() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addComplaint = useCallback(async (complaintData) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiRequest('/complaints', {
        method: 'POST',
        body: JSON.stringify(complaintData),
      })
      setLoading(false)
      return { success: true, data: result.data }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return { success: false, error: err.message }
    }
  }, [])

  const updateComplaint = useCallback(async (id, updateData) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiRequest(`/complaints/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      setLoading(false)
      return { success: true, data: result.data }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return { success: false, error: err.message }
    }
  }, [])

  const addComment = useCallback(async (id, text) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiRequest(`/complaints/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
      setLoading(false)
      return { success: true, data: result.data }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return { success: false, error: err.message }
    }
  }, [])

  const updateStatus = useCallback(async (id, status) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiRequest(`/complaints/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      setLoading(false)
      return { success: true, data: result.data }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return { success: false, error: err.message }
    }
  }, [])

  const assignVendor = useCallback(async (id, vendorId) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiRequest(`/complaints/${id}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ vendorId }),
      })
      setLoading(false)
      return { success: true, data: result.data }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return { success: false, error: err.message }
    }
  }, [])

  const deleteComplaint = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiRequest(`/complaints/${id}`, {
        method: 'DELETE',
      })
      setLoading(false)
      return { success: true, data: result }
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return { success: false, error: err.message }
    }
  }, [])

  return { 
    addComplaint, 
    updateComplaint, 
    addComment, 
    updateStatus, 
    assignVendor,
    deleteComplaint,
    loading, 
    error 
  }
}