import { useState } from 'react'

export default function VendorAssignDropdown({ value, onAssign }) {
  const [vendor, setVendor] = useState(value || '')
  return (
    <div className="flex gap-2">
      <input
        value={vendor}
        onChange={(e) => setVendor(e.target.value)}
        placeholder="Vendor ID or email"
        className="bg-[#07164a] text-white rounded-md px-3 py-2 w-56"
      />
      <button
        type="button"
        onClick={() => vendor && onAssign(vendor)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md"
      >
        Assign
      </button>
    </div>
  )
}