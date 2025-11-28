import useAuth from '../../hooks/useAuth'
import { useState } from 'react'
import { useComplaintsStore } from '../../hooks/useComplaintsStore'

export default function ComplaintForm({ onSuccess }) {
  const { user } = useAuth()
  const { addComplaint, loading } = useComplaintsStore()
  const [fileName, setFileName] = useState('No file chosen')
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(null)
  const [success, setSuccess] = useState('')

  // Only residents can create complaints
  if (!user || user.role !== 'resident') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <p className="text-lg text-amber-900 mb-2">
          Complaint Submission is for Residents Only
        </p>
        <p className="text-sm text-amber-700">
          {!user ? 'Please log in as a resident to submit complaints.' : 
           user.role === 'admin' ? 'As an admin, you can view and manage complaints but cannot create them.' :
           'This feature is only available to residents.'}
        </p>
      </div>
    )
  }

  const validate = (data) => {
    const e = {}
    const title = data.get('title')?.trim() || ''
    const desc = data.get('description')?.trim() || ''
    if (title.length < 3) e.title = 'Min 3 characters'
    if (desc.length < 10) e.description = 'Min 10 characters'
    return e
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const v = validate(data)
    setErrors(v)
    if (Object.keys(v).length) return

    setSuccess('')
    
    const complaintData = {
      category: data.get('category'),
      title: data.get('title')?.trim(),
      description: data.get('description')?.trim(),
      priority: data.get('priority') || 'medium',
      location: data.get('location')?.trim() || '',
    }

    const result = await addComplaint(complaintData)
    
    if (result.success) {
      setSuccess('Complaint submitted successfully!')
      e.currentTarget.reset()
      setFileName('No file chosen')
      setPreview(null)
      setErrors({})
      
      // Call parent callback if provided
      if (onSuccess) {
        onSuccess(result.data)
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setErrors({ submit: result.error || 'Failed to submit complaint' })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      {errors.submit && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Complaint Category</label>
        <select name="category" className="w-full bg-[#07164a] text-white rounded-lg h-12 px-4" required disabled={loading}>
          <option value="">Select category</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
          <option value="security">Security</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Priority</label>
        <select name="priority" className="w-full bg-[#07164a] text-white rounded-lg h-12 px-4" defaultValue="medium" disabled={loading}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Complaint Title</label>
        <input 
          name="title" 
          className="w-full bg-[#07164a] text-white rounded-lg h-12 px-4" 
          placeholder="Enter a short title" 
          required 
          disabled={loading}
        />
        {errors.title && <div className="text-xs text-rose-500 mt-1">{errors.title}</div>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Location (Optional)</label>
        <input 
          name="location" 
          className="w-full bg-[#07164a] text-white rounded-lg h-12 px-4" 
          placeholder="e.g., Building A, Floor 3, Apartment 301" 
          disabled={loading}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea 
          name="description" 
          className="w-full bg-[#07164a] text-white rounded-lg p-4 h-36" 
          placeholder="Describe your issue in detail" 
          required 
          disabled={loading}
        />
        {errors.description && <div className="text-xs text-rose-500 mt-1">{errors.description}</div>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-400">Upload Image (Coming Soon)</label>
        <div className="w-full bg-gray-700 text-gray-400 rounded-lg px-4 py-3 opacity-50 cursor-not-allowed">
          <span className="text-sm">Image upload will be available in a future update</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          type="submit" 
          className="bg-[#07164a] text-white px-6 py-2 rounded-md hover:bg-[#0a1f6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
          aria-label="Submit complaint"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Complaint'
          )}
        </button>
      </div>
    </form>
  )
}