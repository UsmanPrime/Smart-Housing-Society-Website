export default function StatusBadge({ status }) {
  const map = {
    open: 'bg-emerald-600',
    accepted: 'bg-cyan-600',
    pending: 'bg-amber-600',
    'in-progress': 'bg-blue-600',
    in_progress: 'bg-blue-600',
    completed: 'bg-purple-600',
    resolved: 'bg-green-600',
    rejected: 'bg-rose-600',
    closed: 'bg-slate-600',
  }
  const label = (status || 'open').replace(/_/g, ' ').replace(/-/g, ' ')
  return (
    <span className={`inline-block px-2 py-1 text-xs rounded text-white ${map[status] || 'bg-gray-600'}`}>
      {label}
    </span>
  )
}