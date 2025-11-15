import { useMemo } from 'react'

const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function sameDate(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate() }
function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0) }

export default function FacilityCalendar({ month, bookings, onSelectDay, onSelectBooking }) {
  const today = new Date()
  const first = startOfMonth(month)
  const last = endOfMonth(month)
  const start = new Date(first); start.setDate(first.getDate() - first.getDay())
  const cells = useMemo(() => {
    const arr = []
    const dt = new Date(start)
    for (let i=0; i<42; i++){
      const date = new Date(dt)
      const dayBookings = bookings.filter(b => new Date(b.start).toDateString() === date.toDateString())
      // mark conflict if any overlaps exist
      const conflict = (() => {
        for (let i=0;i<dayBookings.length;i++){
          for (let j=i+1;j<dayBookings.length;j++){
            const a=dayBookings[i], b=dayBookings[j]
            if (!['rejected','cancelled'].includes(a.status) && !['rejected','cancelled'].includes(b.status)){
              if (new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end)) return true
            }
          }
        }
        return false
      })()
      arr.push({ date, dayBookings, conflict })
      dt.setDate(dt.getDate()+1)
    }
    return arr
  }, [start, bookings])

  const statusColor = (s) => s==='approved' ? 'bg-emerald-600' : s==='pending' ? 'bg-amber-600' : s==='rejected' ? 'bg-rose-600' : s==='cancelled' ? 'bg-slate-400' : 'bg-blue-600'

  return (
    <div>
      <div className="grid grid-cols-7 text-xs font-medium text-gray-600 mb-1">
        {dayNames.map(d => <div key={d} className="px-2 py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-300 rounded-md overflow-hidden" role="grid" aria-label="Facility calendar">
        {cells.map((cell, idx) => {
          const inMonth = cell.date.getMonth() === month.getMonth()
          const isToday = sameDate(cell.date, today)
          return (
            <div
              key={idx}
              role="gridcell"
              className={`min-h-[110px] bg-white ${inMonth ? '' : 'bg-gray-50'} relative`}
            >
              <button
                onClick={() => onSelectDay(cell.date)}
                className={`absolute top-1 right-1 text-xs px-2 py-0.5 rounded ${isToday ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800'}`}
                aria-label={`Select ${cell.date.toDateString()}`}
              >
                {cell.date.getDate()}
              </button>

              {cell.conflict && <div className="absolute left-2 top-2 text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">conflict</div>}

              <div className="mt-7 px-2 space-y-1">
                {cell.dayBookings.slice(0,3).map(b => (
                  <button
                    key={b.id}
                    onClick={() => onSelectBooking(b)}
                    className="w-full flex items-center justify-between gap-2 text-left text-[11px] bg-slate-100 hover:bg-slate-200 rounded px-2 py-1"
                    aria-label={`Open booking ${b.title}`}
                  >
                    <span className="truncate">{b.title}</span>
                    <span className={`w-2 h-2 rounded-full ${statusColor(b.status)}`} />
                  </button>
                ))}
                {cell.dayBookings.length > 3 && (
                  <div className="text-[11px] text-gray-500">+{cell.dayBookings.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}