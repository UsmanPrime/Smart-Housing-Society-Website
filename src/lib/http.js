import axios from 'axios'
import { API_BASE } from './api'

// Shared axios instance to ensure all calls hit the correct backend origin
const http = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

// Request interceptor - Add auth token and CSRF token
http.interceptors.request.use((config) => {
  // Add JWT token
  const token = localStorage.getItem('token')
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  // Add CSRF token for state-changing requests
  const csrfToken = sessionStorage.getItem('csrfToken')
  if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase())) {
    config.headers = config.headers || {}
    config.headers['X-CSRF-Token'] = csrfToken
  }

  // Default JSON content type unless sending FormData
  if (!(config.data instanceof FormData) && !config.headers?.['Content-Type']) {
    config.headers = config.headers || {}
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

// Response interceptor - Handle token expiration and refresh
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error.config
    
    // Handle token expiration with refresh
    if (status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${API_BASE}/api/auth/refresh-token`, {
            refreshToken
          })
          
          if (response.data.success && response.data.accessToken) {
            // Store new access token
            localStorage.setItem('token', response.data.accessToken)
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
            return http(originalRequest)
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError)
      }
    }
    
    // Handle general unauthorized errors
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      sessionStorage.removeItem('csrfToken')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default http

