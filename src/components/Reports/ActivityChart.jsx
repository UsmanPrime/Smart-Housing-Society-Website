import React, { useMemo, useState } from "react";

export default function ActivityChart({ activity = [] }) {
  const [mode, setMode] = useState("line");

  const maxVal = useMemo(() => {
    const vals = activity.flatMap(a => [a.logins, a.bookings, a.payments]);
    return Math.max(1, ...vals);
  }, [activity]);

  const colors = {
    logins: "#0f335b",
    bookings: "#6b46c1",
    payments: "#c53030",
  };

  // Build polyline points for simple SVG line chart
  const buildPoints = (key) => {
    const n = activity.length;
    const step = 100 / Math.max(1, n - 1);
    return activity
      .map((d, i) => {
        const x = i * step;
        const y = 100 - Math.round((d[key] / maxVal) * 100);
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#06164a]">Activity (14 days)</h3>
        <button
          onClick={() => setMode(m => (m === "line" ? "bar" : "line"))}
          className="px-3 py-1 rounded bg-[#06164a] text-white text-xs"
        >
          Toggle {mode === "line" ? "Bar" : "Line"}
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs mb-3">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ background: colors.logins }} /> Logins
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ background: colors.bookings }} /> Bookings
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ background: colors.payments }} /> Payments
        </span>
      </div>

      {mode === "line" ? (
        <div className="w-full h-64 bg-slate-50 rounded">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            {/* grid lines */}
            {[25, 50, 75].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.3" />
            ))}
            <polyline
              points={buildPoints("logins")}
              fill="none"
              stroke={colors.logins}
              strokeWidth="1.2"
            />
            <polyline
              points={buildPoints("bookings")}
              fill="none"
              stroke={colors.bookings}
              strokeWidth="1.2"
            />
            <polyline
              points={buildPoints("payments")}
              fill="none"
              stroke={colors.payments}
              strokeWidth="1.2"
            />
          </svg>
        </div>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activity.map((d) => {
              const wL = Math.round((d.logins / maxVal) * 100);
              const wB = Math.round((d.bookings / maxVal) * 100);
              const wP = Math.round((d.payments / maxVal) * 100);
              return (
                <div key={d.date} className="p-3 rounded border">
                  <div className="text-xs text-gray-600 mb-2">{d.date}</div>
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded">
                      <div className="h-2 rounded" style={{ width: `${wL}%`, background: colors.logins }} />
                    </div>
                    <div className="h-2 bg-gray-200 rounded">
                      <div className="h-2 rounded" style={{ width: `${wB}%`, background: colors.bookings }} />
                    </div>
                    <div className="h-2 bg-gray-200 rounded">
                      <div className="h-2 rounded" style={{ width: `${wP}%`, background: colors.payments }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}