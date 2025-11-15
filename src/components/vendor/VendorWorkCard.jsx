import StatusBadge from '../complaints/StatusBadge'
import PriorityBadge from '../complaints/PriorityBadge'

export default function VendorWorkCard({ c, onSelect, onAction, canAct }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-[#06164a]">{c.title}</h4>
          <div className="text-xs text-gray-600">{c.category} • #{c.id}</div>
        </div>
        <div className="flex gap-1 flex-wrap">
          <StatusBadge status={c.status}/>
          <PriorityBadge priority={c.priority}/>
        </div>
      </div>
      <p className="text-xs text-gray-700 line-clamp-3">{c.description}</p>
      <div className="flex gap-2 flex-wrap">
        <button onClick={()=>onSelect(c)} className="text-xs px-2 py-1 rounded border">View</button>
        <button
          disabled={!canAct || c.status!=='open'}
          onClick={()=>onAction(c,'accept')}
          className="text-xs px-2 py-1 rounded border disabled:opacity-40"
        >Accept</button>
        <button
          disabled={!canAct || !['open','pending','accepted'].includes(c.status)}
          onClick={()=>onAction(c,'in_progress')}
          className="text-xs px-2 py-1 rounded border disabled:opacity-40"
        >In Progress</button>
        <button
          disabled={!canAct || !['in_progress','accepted'].includes(c.status)}
          onClick={()=>onAction(c,'completed')}
          className="text-xs px-2 py-1 rounded border disabled:opacity-40"
        >Complete</button>
      </div>
    </div>
  )
}