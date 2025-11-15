export default function BookingLegend() {
  const Item = ({ c, label }) => (
    <span className="inline-flex items-center gap-1 text-xs">
      <i className={`w-3 h-3 rounded-full ${c}`} /> {label}
    </span>
  )
  return (
    <div className="flex flex-wrap gap-3 text-gray-700">
      <Item c="bg-emerald-600" label="Approved" />
      <Item c="bg-amber-600" label="Pending" />
      <Item c="bg-rose-600" label="Rejected" />
      <Item c="bg-slate-500" label="Cancelled" />
    </div>
  )
}