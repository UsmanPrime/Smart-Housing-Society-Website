import { useCallback, useEffect, useState } from 'react'

const LS_KEY = 'complaints_local'

const readLS = () => {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

const writeLS = (items) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)) } catch {}
}

export function useComplaintsStore() {
  const [items, setItems] = useState(readLS())

  useEffect(() => { writeLS(items) }, [items])

  const addComplaint = useCallback((c) => {
    const newItem = {
      ...c,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'open',
      comments: [],
      _local: true,
    }
    setItems(prev => [newItem, ...prev])
  }, [])

  const updateComplaint = useCallback((id, patch) => {
    setItems(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const addComment = useCallback((id, text, authorName) => {
    const cm = { id: Date.now(), text, authorName, createdAt: new Date().toISOString(), _pending: true }
    setItems(prev => prev.map(c => (c.id === id ? { ...c, comments: [...c.comments, cm] } : c)))
    // simulate pending clear
    setTimeout(() => {
      setItems(prev => prev.map(c => (c.id === id
        ? { ...c, comments: c.comments.map(x => x.id === cm.id ? { ...x, _pending: false } : x) }
        : c)))
    }, 300)
  }, [])

  const updateStatus = useCallback((id, status) => {
    // optimistic with pending state
    setItems(prev => prev.map(c => (c.id === id ? { ...c, _pendingStatus: true } : c)))
    setItems(prev => prev.map(c => (c.id === id ? { ...c, status } : c)))
    setTimeout(() => setItems(prev => prev.map(c => (c.id === id ? { ...c, _pendingStatus: false } : c))), 300)
  }, [])

  const assignVendor = useCallback((id, vendorId) => {
    setItems(prev => prev.map(c => (c.id === id ? { ...c, assignedTo: vendorId || undefined } : c)))
  }, [])

  const addVendorNote = useCallback((id, text, authorName) => {
    const cm = { id: Date.now(), text, authorName, createdAt: new Date().toISOString(), type: 'vendor_note', _pending: true }
    setItems(prev => prev.map(c => c.id === id ? { ...c, comments: [...c.comments, cm] } : c))
    setTimeout(() => {
      setItems(prev => prev.map(c => c.id === id ? {
        ...c,
        comments: c.comments.map(x => x.id === cm.id ? { ...x, _pending: false } : x)
      } : c))
    }, 300)
  }, [])

  return { items, addComplaint, updateComplaint, addComment, updateStatus, assignVendor, addVendorNote }
}