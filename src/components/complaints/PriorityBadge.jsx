export default function PriorityBadge({ priority }) {
  const map = {
    low: 'bg-teal-600',
    medium: 'bg-indigo-600',
    high: 'bg-orange-600',
    critical: 'bg-red-600',
  }
  const label = (priority || 'medium').toLowerCase()
  return (
    <span className={`inline-block px-2 py-1 text-xs rounded text-white ${map[label] || 'bg-indigo-600'}`}>
      {label}
    </span>
  )
}