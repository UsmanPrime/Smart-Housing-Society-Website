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

export default function ComplaintList({ tab = 'my', onOpen }) {
  const { filterComplaints } = useComplaints()
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' })
  const [loading, setLoading] = useState(false)
  const [error] = useState(null)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 250)
    return () => clearTimeout(t)
  }, [tab, filters])

  const list = useMemo(() => filterComplaints(tab, filters), [filterComplaints, tab, filters])

  return (
    <div aria-busy={loading ? 'true' : 'false'}>
      <div className="flex flex-wrap gap-3 mb-4">
        <select className="bg-[#07164a] text-white rounded-md px-3 py-2" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">Status</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="bg-[#07164a] text-white rounded-md px-3 py-2" value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}>
          <option value="">Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select className="bg-[#07164a] text-white rounded-md px-3 py-2" value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
          <option value="">Category</option>
          <option>Plumbing</option>
          <option>Electrical</option>
          <option>Security</option>
          <option>General</option>
        </select>
        <button
          className="px-3 py-2 text-sm rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800"
          onClick={() => setFilters({ status: '', priority: '', category: '' })}
          aria-label="Reset filters"
        >
          Reset
        </button>
      </div>

      {loading && <div className="text-sm text-gray-600">Loading...</div>}
      {error && <div className="text-sm text-rose-600">Error loading complaints</div>}
      {!loading && !error && list.length === 0 && <div className="text-sm text-gray-600">No complaints found.</div>}

      <ul className="divide-y divide-gray-300/40">
        {list.map((c) => (
          <li key={c.id} className="py-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-semibold text-[#06164a] truncate">{c.title}</div>
              <div className="text-xs text-gray-600 mt-1">
                {c.category} • #{c.id} • {timeAgo(c.createdAt)}
              </div>
              <p className="mt-2 text-sm text-gray-700">{truncate(c.description)}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <StatusBadge status={c.status} />
                <PriorityBadge priority={c.priority} />
                {c.assignedTo && <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Vendor</span>}
              </div>
            </div>
            <button
              onClick={() => onOpen(c)}
              className="bg-[#07164a] text-white px-3 py-2 rounded-md hover:bg-[#0a1f6b]"
              aria-label={`Open complaint ${c.id}`}
            >
              View
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 text-xs text-gray-600 space-y-1">
        <div>
          <strong>Legend:</strong> Status and Priority badges indicate progress and urgency.
        </div>
      </div>
    </div>
  )
}