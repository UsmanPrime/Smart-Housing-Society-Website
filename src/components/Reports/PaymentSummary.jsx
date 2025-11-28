import React from "react";
import { formatMoney, formatPercent } from "./reportUtils";

export default function PaymentSummary({ metrics }) {
  if (!metrics) return null;
  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col">
      <h3 className="text-lg font-semibold text-[#06164a] mb-4">Payment Summary</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Total Collected</span>
          <span className="font-medium">{formatMoney(metrics.totalCollected)}</span>
        </div>
        <div className="flex justify-between">
          <span>Pending Payments</span>
          <span className="font-medium">{metrics.pendingCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Overdue Payments</span>
          <span className="font-medium">{metrics.overdueCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Success Rate</span>
          <span className="font-medium">{formatPercent(metrics.successRate)}</span>
        </div>
      </div>
    </div>
  );
}