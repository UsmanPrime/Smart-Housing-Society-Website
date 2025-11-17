import { useEffect, useRef, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import { useComplaintsStore } from '../../hooks/useComplaintsStore'
import useComplaints from '../../hooks/useComplaints'
import VendorAssignDropdown from './VendorAssignDropdown'

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

export default function ComplaintDetailModal({ complaint, onClose, onUpdate }) {
  const { user } = useAuth()
  const { fetchComplaintById } = useComplaints()
  const { updateStatus, addComment, assignVendor, loading } = useComplaintsStore()
  const [details, setDetails] = useState(complaint)
  const [commentText, setCommentText] = useState('')
  const [fetchLoading, setFetchLoading] = useState(false)
  const dialogRef = useRef(null)

  const isAdmin = user?.role === 'admin'
  const isVendor = user?.role === 'vendor'
  const isResident = user?.role === 'resident'
  const vendorAssigned = isVendor && details?.assignedTo?._id === user?.id

  // Fetch full complaint details
  useEffect(() => {
    if (complaint?._id) {
      setFetchLoading(true)
      fetchComplaintById(complaint._id).then((data) => {
        if (data) setDetails(data)
        setFetchLoading(false)
      })
    }
  }, [complaint, fetchComplaintById])

  // Body scroll lock + Esc to close
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const postComment = async () => {
    if (!commentText.trim()) return
    const result = await addComment(details._id, commentText.trim())
    if (result.success) {
      setCommentText('')
      // Refresh complaint details
      const updated = await fetchComplaintById(details._id)
      if (updated) {
        setDetails(updated)
        if (onUpdate) onUpdate()
      }
    }
  }

  const handleStatusChange = async (newStatus) => {
    const result = await updateStatus(details._id, newStatus)
    if (result.success) {
      const updated = await fetchComplaintById(details._id)
      if (updated) {
        setDetails(updated)
        if (onUpdate) onUpdate()
      }
    }
  }

  const handleVendorAssignment = async (vendorId) => {
    const result = await assignVendor(details._id, vendorId)
    if (result.success) {
      const updated = await fetchComplaintById(details._id)
      if (updated) {
        setDetails(updated)
        if (onUpdate) onUpdate()
      }
    }
  }

  const onOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!details) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onMouseDown={onOverlayClick}>
      <div
        ref={dialogRef}
        className="bg-white rounded-xl w-full max-w-3xl overflow-hidden outline-none max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complaint-dialog-title"
      >
        <div className="bg-[#07164a] text-white px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div id="complaint-dialog-title" className="font-semibold">
            Complaint Details
          </div>
          <button onClick={onClose} aria-label="Close" className="hover:opacity-80 text-xl">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          {fetchLoading && (
            <div className="text-center py-8 text-gray-600">Loading details...</div>
          )}

          {!fetchLoading && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xl font-semibold text-[#06164a]">{details.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Category: <span className="font-medium capitalize">{details.category}</span>
                    {details.location && ` • Location: ${details.location}`}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Created {timeAgo(details.createdAt)} by {details.submittedBy?.name || 'Unknown'}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap items-start">
                  <StatusBadge status={details.status} />
                  <PriorityBadge priority={details.priority} />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">Description</div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{details.description}</p>
              </div>

              {details.assignedTo && (
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="text-sm">
                    <span className="font-semibold">Assigned to:</span> {details.assignedTo.name}
                    {details.assignedTo.email && ` (${details.assignedTo.email})`}
                  </div>
                </div>
              )}

              {/* Admin controls */}
              {isAdmin && (
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <div className="text-sm font-semibold mb-2">Update Status</div>
                    <div className="flex flex-wrap gap-2">
                      {['open', 'in-progress', 'resolved', 'closed'].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          disabled={loading}
                          className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                            details.status === s 
                              ? 'bg-[#07164a] text-white border-[#07164a]' 
                              : 'bg-white text-[#07164a] border-gray-300 hover:bg-slate-100'
                          } disabled:opacity-50`}
                        >
                          {s.replace(/-/g, ' ').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold mb-2">Assign Vendor</div>
                    <VendorAssignDropdown
                      complaintId={details._id}
                      category={details.category}
                      currentVendor={details.assignedTo?._id}
                      onAssign={handleVendorAssignment}
                    />
                  </div>
                </div>
              )}

              {/* Vendor controls */}
              {isVendor && vendorAssigned && (
                <div className="border-t pt-4">
                  <div className="text-sm font-semibold mb-2">Update Status</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusChange('in-progress')}
                      disabled={loading || details.status === 'in-progress'}
                      className="text-xs px-3 py-1.5 rounded bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50"
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange('completed')}
                      disabled={loading || details.status === 'completed'}
                      className="text-xs px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Mark Completed
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: Admin will review and mark as resolved
                  </p>
                </div>
              )}

              {/* Comments/Timeline */}
              <div className="border-t pt-4">
                <div className="text-sm font-semibold mb-3">Comments ({details.comments?.length || 0})</div>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
                  {details.comments && details.comments.length > 0 ? (
                    details.comments.map((cm, idx) => (
                      <div key={cm._id || idx} className="bg-slate-50 rounded-lg px-4 py-3 text-sm">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="font-medium text-[#07164a]">{cm.authorName}</div>
                          <div className="text-xs text-gray-500">{timeAgo(cm.createdAt)}</div>
                        </div>
                        <div className="text-gray-700">{cm.text}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">No comments yet</div>
                  )}
                </div>

                {/* Add comment */}
                <div className="flex gap-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && postComment()}
                    placeholder="Add a comment..."
                    className="flex-1 bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#07164a]"
                    aria-label="Comment"
                  />
                  <button
                    onClick={postComment}
                    disabled={!commentText.trim() || loading}
                    className="bg-[#07164a] text-white px-4 py-2 rounded text-sm hover:bg-[#0a1f6b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 flex-shrink-0">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}