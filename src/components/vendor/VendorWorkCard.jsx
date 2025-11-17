import StatusBadge from '../complaints/StatusBadge'
import PriorityBadge from '../complaints/PriorityBadge'

export default function VendorWorkCard({ c, onSelect, onAction, canAct }) {
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

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[#06164a] truncate">{c.title}</h4>
          <div className="text-xs text-gray-600 mt-1">
            {c.category} • {c.location || 'No location'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Created {timeAgo(c.createdAt)}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap flex-shrink-0">
          <StatusBadge status={c.status}/>
          <PriorityBadge priority={c.priority}/>
        </div>
      </div>

      <p className="text-sm text-gray-700 line-clamp-2">{c.description}</p>

      {c.submittedBy && (
        <div className="text-xs text-gray-600">
          Submitted by: <span className="font-medium">{c.submittedBy.name}</span>
        </div>
      )}

      <div className="pt-2 border-t">
        <button 
          onClick={() => onSelect(c)} 
          className="w-full text-sm px-3 py-2 rounded bg-[#07164a] text-white hover:bg-[#0a1f6b] transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  )
}