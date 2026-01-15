import { useMemo } from 'react'

export default function useAuth() {
  // Get user data from localStorage
  let raw = localStorage.getItem('user')
  let user = null
  try { user = raw ? JSON.parse(raw) : null } catch { user = null }

  // Get tokens from localStorage (separate storage for security)
  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refreshToken')

  const role = user?.role || 'guest'
  return useMemo(
    () => ({
      user,
      token,
      refreshToken,
      role,
      isAdmin: role === 'admin',
      isVendor: role === 'vendor',
      isResident: role === 'resident',
      isAuthenticated: !!user && !!token,
    }),
    [role, user, token, refreshToken]
  )
}