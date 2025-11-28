import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import useAuth from '../../hooks/useAuth'

export default function VendorAssignDropdown({ complaintId, category, currentVendor, onAssign }) {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVendor, setSelectedVendor] = useState(currentVendor || '')
  const { user } = useAuth()

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true)
        const token = user?.token || localStorage.getItem('token') || undefined
        const data = await api.get(`/api/vendors?specialization=${encodeURIComponent(category)}`, { token })
        setVendors(data?.data || [])
      } catch (error) {
        console.error('Failed to fetch vendors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVendors()
  }, [category])

  useEffect(() => {
    setSelectedVendor(currentVendor || '')
  }, [currentVendor])

  const handleChange = (e) => {
    const vendorId = e.target.value
    setSelectedVendor(vendorId)
    if (onAssign) {
      onAssign(vendorId || null)
    }
  }

  if (loading) {
    return (
      <select disabled className="bg-gray-100 text-gray-600 text-sm rounded px-3 py-2 border border-gray-300">
        <option>Loading vendors...</option>
      </select>
    )
  }

  return (
    <select
      value={selectedVendor}
      onChange={handleChange}
      className="bg-white text-[#07164a] text-sm rounded px-3 py-2 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#07164a] transition-colors"
      aria-label="Assign vendor"
    >
      <option value="">-- Select Vendor --</option>
      {vendors.map((vendor) => (
        <option key={vendor._id} value={vendor._id}>
          {vendor.name} {vendor.isAvailable === false ? '(Unavailable)' : ''}
        </option>
      ))}
      {vendors.length === 0 && (
        <option disabled>No vendors available for {category}</option>
      )}
    </select>
  )
}