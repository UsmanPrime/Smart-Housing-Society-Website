import useAuth from '../../hooks/useAuth'
import { useState } from 'react'
import { useComplaintsStore } from '../../hooks/useComplaintsStore'

export default function ComplaintForm() {
  const { user } = useAuth()
  const { addComplaint } = useComplaintsStore()
  const [fileName, setFileName] = useState('No file chosen')
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(null)

  const validate = (data) => {
    const e = {}
    const title = data.get('title')?.trim() || ''
    const desc = data.get('description')?.trim() || ''
    if (title.length < 3) e.title = 'Min 3 characters'
    if (desc.length < 10) e.description = 'Min 10 characters'
    return e
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const v = validate(data)
    setErrors(v)
    if (Object.keys(v).length) return
    addComplaint({
      category: data.get('category') || 'General',
      title: data.get('title'),
      description: data.get('description'),
      preferredAt: data.get('preferredAt') || null,
      priority: data.get('priority') || 'medium',
      imageData: preview,
      createdBy: user?.id || 'resident1',
    })
    e.currentTarget.reset()
    setFileName('No file chosen')
    setPreview(null)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Complaint Category</label>
        <select name="category" className="w-full bg-[#07164a] text-white rounded-lg h-12 px-4" required>
          <option value="">Select category</option>
          <option>Plumbing</option>
          <option>Electrical</option>
          <option>Security</option>
          <option>General</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Priority</label>
        <select name="priority" className="w-full bg-[#07164a] text-white rounded-lg h-12 px-4" defaultValue="medium">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Complaint Title</label>
        <input name="title" className="w-full bg-[#07164a] text-white rounded-lg h-12 px-4" placeholder="Enter a short title" required />
        {errors.title && <div className="text-xs text-rose-500 mt-1">{errors.title}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea name="description" className="w-full bg-[#07164a] text-white rounded-lg p-4 h-36" placeholder="Describe your issue in detail" required />
        {errors.description && <div className="text-xs text-rose-500 mt-1">{errors.description}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Upload Image (Optional)</label>
        <div className="w-full bg-[#07164a] text-white rounded-lg px-4 py-3">
          <label className="bg-transparent border border-white px-4 py-2 rounded-md cursor-pointer inline-block">
            <input
              type="file"
              name="image"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                setFileName(f?.name || 'No file chosen')
                if (f) {
                  const reader = new FileReader()
                  reader.onload = () => setPreview(reader.result)
                  reader.readAsDataURL(f)
                } else setPreview(null)
              }}
            />
            Choose File
          </label>
          <span className="text-sm text-gray-200 ml-4">{fileName}</span>
          {preview && <img src={preview} alt="" className="mt-3 h-24 object-cover rounded" />}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Preferred Date / Time (Optional)</label>
        <input name="preferredAt" type="datetime-local" className="w-full bg-[#07164a] text-white rounded-lg h-12 px-4" />
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" className="bg-[#07164a] text-white px-4 py-2 rounded-md hover:bg-[#0a1f6b] transition-colors" aria-label="Submit complaint">
          Submit A Complaint
        </button>
      </div>
    </form>
  )
}