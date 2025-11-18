import { useMemo, useState, useEffect } from 'react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import useComplaints from '../../hooks/useComplaints'

const timeAgo = (iso) => {
  if (!iso) return ''
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

const truncate = (str, n = 110) => (str?.length > n ? str.slice(0, n - 1) + '…' : str || '')

export default function ComplaintList({ tab = 'my', onOpen, refreshTrigger, statusFilter }) {
  const { filterComplaints, loading, error, refresh, fetchComplaints } = useComplaints()
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' })

  // Force fetch complaints from API on mount and tab change
  useEffect(() => {
    fetchComplaints();
  }, [tab, refreshTrigger]);

  // Auto-refresh every 10 seconds for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchComplaints();
    }, 10000);
    return () => clearInterval(interval);
  }, [tab]);

  const baseList = useMemo(() => filterComplaints(tab, filters), [filterComplaints, tab, filters])

  // Apply external statusFilter for multi-status shortcuts (vendor quick actions)
  const list = useMemo(() => {
    if (!statusFilter) return baseList;
    // Map special filters
    if (statusFilter === 'completed') {
      const set = new Set(['completed','resolved','closed']);
      return baseList.filter(c => set.has(c.status));
    }
    if (statusFilter === 'open') {
      const set = new Set(['open','in-progress']);
      return baseList.filter(c => set.has(c.status));
    }
    // Fallback single status
    return baseList.filter(c => c.status === statusFilter);
  }, [statusFilter, baseList])

  return (
    <div aria-busy={loading ? 'true' : 'false'}>
      <div className="flex flex-wrap gap-3 mb-4">
        <select className="bg-[#07164a] text-white rounded-md px-3 py-2" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select className="bg-[#07164a] text-white rounded-md px-3 py-2" value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select className="bg-[#07164a] text-white rounded-md px-3 py-2" value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
          <option value="">All Categories</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
          <option value="security">Security</option>
          <option value="other">Other</option>
        </select>
        <button
          className="px-3 py-2 text-sm rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800"
          onClick={() => setFilters({ status: '', priority: '', category: '' })}
          aria-label="Reset filters"
        >
          Reset
        </button>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse py-4 border-b border-gray-300/40">
              <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {!loading && !error && list.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">No complaints found</p>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or create a new complaint</p>
        </div>
      )}

      {!loading && !error && list.length > 0 && (
        <ul className="divide-y divide-gray-300/40">
          {list.map((c) => (
            <li key={c._id || c.id} className="py-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[#06164a] truncate">{c.title}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {c.category} • {c.location ? `${c.location} • ` : ''}{timeAgo(c.createdAt)}
                </div>
                <p className="mt-2 text-sm text-gray-700">{truncate(c.description)}</p>
                <div className="mt-2 flex gap-2 flex-wrap items-center">
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                  {c.assignedTo && (
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                      Assigned: {c.assignedTo.name || 'Vendor'}
                    </span>
                  )}
                  {c.comments && c.comments.length > 0 && (
                    <span className="text-xs text-gray-600">
                      💬 {c.comments.length}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onOpen(c)}
                className="bg-[#07164a] text-white px-4 py-2 rounded-md hover:bg-[#0a1f6b] transition-colors flex-shrink-0"
                aria-label={`Open complaint ${c._id || c.id}`}
              >
                View
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 text-xs text-gray-600 space-y-1">
        <div>
          <strong>Legend:</strong> Status and Priority badges indicate progress and urgency.
        </div>
      </div>
    </div>
  )
}