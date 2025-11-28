import { useEffect, useRef, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import { useComplaintsStore } from '../../hooks/useComplaintsStore'
import useComplaints from '../../hooks/useComplaints'
import VendorAssignDropdown from './VendorAssignDropdown'
import { api } from '../../lib/api'

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
  const [ratingStars, setRatingStars] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const dialogRef = useRef(null)

  const isAdmin = user?.role === 'admin'
  const isVendor = user?.role === 'vendor'
  const isResident = user?.role === 'resident'
  const vendorAssigned = isVendor && details?.assignedTo?._id === user?.id
  const canRate = isResident && details?.assignedTo && ['completed','resolved','closed'].includes(details.status)

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

              {/* Resident rating */}
              {canRate && (
                <div className="border-t pt-4">
                  <div className="text-sm font-semibold mb-2">Rate Vendor Service</div>
                  <div className="flex items-center gap-2 mb-2">
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingStars(star)}
                        className={`w-6 h-6 ${star <= ratingStars ? 'text-yellow-400' : 'text-gray-300'}`}
                        aria-label={`Rate ${star} star`}
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="text-xs text-gray-600">{ratingStars} / 5</span>
                  </div>
                  <textarea
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    rows={2}
                    placeholder="Optional comment"
                    className="w-full border rounded px-3 py-2 text-sm mb-2"
                  />
                  <button
                    disabled={ratingSubmitting || ratingStars === 0}
                    onClick={async () => {
                      if (ratingStars === 0) return;
                      try {
                        setRatingSubmitting(true);
                        const token = localStorage.getItem('token');
                        await api.post(`/api/vendors/${details.assignedTo._id}/rate`, {
                          complaintId: details._id,
                          stars: ratingStars,
                          comment: ratingComment.trim() || undefined
                        }, { token });
                        setRatingComment('');
                        // Prevent multiple ratings
                        setRatingStars(0);
                        alert('Rating submitted successfully');
                      } catch (e) {
                        alert(e?.message || 'Failed to submit rating');
                      } finally {
                        setRatingSubmitting(false);
                      }
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm disabled:opacity-40"
                  >
                    {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">You can rate once the task is completed / resolved.</p>
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