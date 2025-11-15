import { useMemo } from 'react'

export default function useAuth() {
  // Expecting localStorage 'user' like: { id, name, role: 'resident'|'admin'|'vendor', token }
  let raw = localStorage.getItem('user')
  let user = null
  try { user = raw ? JSON.parse(raw) : null } catch { user = null }

  const role = user?.role || 'guest'
  return useMemo(
    () => ({
      user,
      token: user?.token,
      role,
      isAdmin: role === 'admin',
      isVendor: role === 'vendor',
      isResident: role === 'resident',
    }),
    [role, user]
  )
}