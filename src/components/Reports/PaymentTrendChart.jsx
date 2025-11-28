import React from "react";
import { formatMoney } from "./reportUtils";

export default function PaymentTrendChart({ trend }) {
  if (!trend) return null;

  const max = Math.max(1, ...trend.map(t => t.amount));

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-lg font-semibold text-[#06164a] mb-4">
        Payment Trends (6 months)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {trend.map((t) => (
          <div
            key={t.month}
            className="flex items-center justify-between px-3 py-2 rounded border"
          >
            <div className="text-sm">
              <div className="font-medium">{t.month}</div>
              <div className="text-gray-600 text-xs">
                Prev: {formatMoney(t.prevAmount)}
              </div>
            </div>
            <div className="text-sm font-semibold text-[#06164a]">
              {formatMoney(t.amount)}
            </div>
          </div>
        ))}
      </div>

      {/* Simple bar visualization */}
      <div className="mt-4 space-y-2">
        {trend.map((t) => {
          const w = Math.round((t.amount / max) * 100);
          return (
            <div key={`bar-${t.month}`}>
              <div className="text-xs text-gray-600 mb-1">{t.month}</div>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 bg-[#0f335b] rounded" style={{ width: `${w}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}