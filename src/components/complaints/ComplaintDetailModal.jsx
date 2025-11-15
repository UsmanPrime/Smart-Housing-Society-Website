import { useEffect, useMemo, useRef, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import { useComplaintsStore } from '../../hooks/useComplaintsStore'

const vendorList = [
  { id: 'vendor1', name: 'Vendor One' },
  { id: 'vendor2', name: 'Vendor Two' },
  { id: 'vendor3', name: 'Vendor Three' },
]

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

export default function ComplaintDetailModal({ complaint, onClose }) {
  const { isAdmin, isVendor, user } = useAuth()
  const { items, updateStatus, addComment, assignVendor, addVendorNote } = useComplaintsStore()
  const [commentText, setCommentText] = useState('')
  const [vendorNote, setVendorNote] = useState('')
  const item = useMemo(() => items.find((c) => c.id === complaint.id) || complaint, [items, complaint])
  const dialogRef = useRef(null)

  // Body scroll lock + focus trap + Esc to close
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          last.focus()
          e.preventDefault()
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus()
          e.preventDefault()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    setTimeout(() => {
      dialogRef.current?.querySelector('button, [href], input, select, textarea')?.focus()
    }, 0)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const userVendorId = isVendor ? (user?.id || 'vendor1') : null
  const vendorAssigned = isVendor && item.assignedTo === userVendorId

  const postComment = () => {
    if (!commentText.trim()) return
    addComment(item.id, commentText.trim(), user?.name || 'User')
    setCommentText('')
  }

  const handleVendorStatus = (action) => {
    if (!vendorAssigned) return
    if (action === 'accept' && item.status === 'open') updateStatus(item.id, 'accepted')
    else if (action === 'in_progress' && ['accepted', 'pending', 'open'].includes(item.status)) updateStatus(item.id, 'in_progress')
    else if (action === 'completed' && ['in_progress', 'accepted'].includes(item.status)) updateStatus(item.id, 'completed')
  }

  const postVendorNote = () => {
    if (!vendorAssigned || !vendorNote.trim()) return
    addVendorNote(item.id, vendorNote.trim(), user?.name || 'Vendor')
    setVendorNote('')
  }

  const onOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onMouseDown={onOverlayClick}>
      <div
        ref={dialogRef}
        className="bg-white rounded-xl w-full max-w-2xl overflow-hidden outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complaint-dialog-title"
      >
        <div className="bg-[#07164a] text-white px-5 py-3 flex items-center justify-between">
          <div id="complaint-dialog-title" className="font-semibold">
            Complaint #{item.id}
          </div>
          <button onClick={onClose} aria-label="Close" className="hover:opacity-80">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xl font-semibold text-[#06164a]">{item.title}</div>
              <div className="text-sm text-gray-600">
                {item.category} • created {timeAgo(item.createdAt)}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <StatusBadge status={item.status} />
              <PriorityBadge priority={item.priority} />
              {item.assignedTo && <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Assigned</span>}
            </div>
          </div>

          {item.imageData && <img src={item.imageData} alt="" className="h-40 rounded object-cover" />}

          <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.description}</p>

          {/* Admin controls: full status + assignment */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              {['open', 'accepted', 'pending', 'in_progress', 'completed', 'rejected'].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(item.id, s)}
                  className={`text-xs px-2 py-1 rounded border ${
                    item.status === s ? 'bg-[#07164a] text-white' : 'bg-white text-[#07164a] hover:bg-slate-100'
                  }`}
                  aria-label={`Set status ${s.replace(/_/g, ' ')}`}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
              <div className="flex items-center gap-2 ml-auto">
                <label className="text-sm font-medium">Assign Vendor:</label>
                <select
                  value={item.assignedTo || ''}
                  className="bg-[#07164a] text-white text-xs rounded px-2 py-1"
                  onChange={(e) => assignVendor(item.id, e.target.value || undefined)}
                  aria-label="Assign vendor"
                >
                  <option value="">None</option>
                  {vendorList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Vendor controls: restricted actions, only if assigned */}
          {isVendor && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Vendor Actions:</span>
              <button
                disabled={!vendorAssigned || item.status !== 'open'}
                onClick={() => handleVendorStatus('accept')}
                className="text-xs px-2 py-1 rounded border disabled:opacity-40"
              >
                Accept
              </button>
              <button
                disabled={!vendorAssigned || !['open', 'pending', 'accepted'].includes(item.status)}
                onClick={() => handleVendorStatus('in_progress')}
                className="text-xs px-2 py-1 rounded border disabled:opacity-40"
              >
                In Progress
              </button>
              <button
                disabled={!vendorAssigned || !['in_progress', 'accepted'].includes(item.status)}
                onClick={() => handleVendorStatus('completed')}
                className="text-xs px-2 py-1 rounded border disabled:opacity-40"
              >
                Completed
              </button>
            </div>
          )}

          {/* Vendor note (timeline entry) */}
          {isVendor && vendorAssigned && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Note (visible in timeline)</label>
              <div className="flex gap-2">
                <input
                  value={vendorNote}
                  onChange={(e) => setVendorNote(e.target.value)}
                  className="flex-1 bg-[#07164a] text-white rounded px-3 py-2 text-sm"
                  placeholder="Progress note"
                />
                <button
                  onClick={postVendorNote}
                  disabled={!vendorNote.trim()}
                  className="bg-[#07164a] text-white px-4 py-2 rounded text-sm disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Timeline / Comments */}
          <div>
            <div className="font-semibold mb-2">Timeline</div>
            <ul className="space-y-2 max-h-48 overflow-auto pr-1">
              {item.comments.map((cm) => (
                <li key={cm.id} className="bg-slate-100 rounded px-3 py-2 text-sm">
                  <div className="text-xs text-gray-500">
                    {cm.authorName} • {timeAgo(cm.createdAt)} {cm._pending && '(…)'} {cm.type === 'vendor_note' && '• note'}
                  </div>
                  <div>{cm.text}</div>
                </li>
              ))}
              {item.comments.length === 0 && <li className="text-xs text-gray-500">No timeline entries yet</li>}
            </ul>
            <div className="mt-3 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add comment"
                className="flex-1 bg-[#07164a] text-white rounded px-3 py-2 text-sm"
                aria-label="Comment"
              />
              <button
                onClick={postComment}
                disabled={!commentText.trim()}
                className="bg-[#07164a] text-white px-4 py-2 rounded text-sm disabled:opacity-40"
              >
                Post
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={onClose} className="text-xs px-3 py-1 rounded border">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}