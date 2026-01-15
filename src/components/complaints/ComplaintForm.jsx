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
  const [imageFile, setImageFile] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, image: 'Only image files (JPEG, PNG, GIF, WebP) are allowed' })
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 5MB' })
        return
      }
      
      setImageFile(file)
      setFileName(file.name)
      setErrors({ ...errors, image: null })
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setImageFile(null)
      setFileName('No file chosen')
      setPreview(null)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null
    
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/upload/complaint-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        return result.data.filename
      } else {
        throw new Error(result.message || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setErrors({ ...errors, image: error.message })
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const v = validate(data)
    setErrors(v)
    if (Object.keys(v).length) return

    setSuccess('')
    
    // Upload image first if there is one
    let uploadedImageFilename = null
    if (imageFile) {
      uploadedImageFilename = await uploadImage()
      if (!uploadedImageFilename) {
        setErrors({ submit: 'Failed to upload image. Please try again.' })
        return
      }
    }
    
    const complaintData = {
      category: data.get('category'),
      title: data.get('title')?.trim(),
      description: data.get('description')?.trim(),
      priority: data.get('priority') || 'medium',
      location: data.get('location')?.trim() || '',
      ...(uploadedImageFilename && { attachments: [uploadedImageFilename] })
    }

    const result = await addComplaint(complaintData)
    
    if (result.success) {
      setSuccess('Complaint submitted successfully!')
      e.currentTarget.reset()
      setFileName('No file chosen')
      setPreview(null)
      setImageFile(null)
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
        <label className="block text-sm font-medium mb-2">Upload Image (Optional)</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="bg-[#07164a] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#0a1f6b] transition-colors">
              Choose File
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="hidden"
                disabled={loading || uploadingImage}
              />
            </label>
            <span className="text-sm text-gray-400">{fileName}</span>
          </div>
          {errors.image && <div className="text-xs text-rose-500">{errors.image}</div>}
          {preview && (
            <div className="mt-2">
              <img src={preview} alt="Preview" className="max-w-xs max-h-48 rounded-lg border border-gray-600" />
              <button
                type="button"
                onClick={() => {
                  setPreview(null)
                  setImageFile(null)
                  setFileName('No file chosen')
                }}
                className="mt-2 text-sm text-rose-500 hover:text-rose-400"
              >
                Remove Image
              </button>
            </div>
          )}
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