export const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

// Get auth token from localStorage
function getAuthToken() {
  try {
    const token = localStorage.getItem('token')
    return token
  } catch (error) {
    console.error('Error retrieving auth token:', error)
    return null
  }
}

// Enhanced request function with interceptors
async function request(path, { method = 'GET', body, token, headers, skipAuth = false } = {}) {
  // Request interceptor: Add auth token automatically if not skipped
  const authToken = skipAuth ? token : (token || getAuthToken())
  
  const requestHeaders = {
    ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...headers,
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: requestHeaders,
      body: body
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
      credentials: 'include',
    })

    // Response interceptor: Handle different status codes
    if (!res.ok) {
      let err
      try {
        err = await res.json()
      } catch {
        err = { message: res.statusText }
      }

      // Handle 401 Unauthorized - redirect to login
      if (res.status === 401) {
        console.error('Unauthorized access - redirecting to login')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }

      // Handle 403 Forbidden
      if (res.status === 403) {
        console.error('Forbidden access:', err.message)
      }

      // Create enhanced error object
      const error = new Error(err.message || 'Request failed')
      error.status = res.status
      error.data = err
      throw error
    }

    // Parse response
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      return res.json()
    } else if (ct.includes('text/csv')) {
      return res.blob()
    } else {
      return res.text()
    }
  } catch (error) {
    // Network error handling
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error('Network error - server may be offline')
      throw new Error('Unable to connect to server. Please check your connection.')
    }
    throw error
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}