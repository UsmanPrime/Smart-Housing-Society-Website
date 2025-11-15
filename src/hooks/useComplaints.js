import useAuth from './useAuth'
import { useComplaintsStore } from './useComplaintsStore'
import { useMemo } from 'react'

export default function useComplaints() {
  const auth = useAuth()
  const store = useComplaintsStore()

  const filterComplaints = (tab, filters) => {
    const uid = auth.user?.id || 'resident1'
    const vid = auth.user?.id || 'vendor1'
    return store.items.filter(c => {
      if (tab === 'my' && c.createdBy !== uid) return false
      if (tab === 'assigned' && c.assignedTo !== vid) return false
      if (filters?.status && c.status !== filters.status) return false
      if (filters?.priority && c.priority !== filters.priority) return false
      if (filters?.category && c.category !== filters.category) return false
      return true
    })
  }

  return useMemo(() => ({ ...auth, ...store, filterComplaints }), [auth, store])
}