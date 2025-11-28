import React from "react";
import { formatPercent } from "./reportUtils";

export default function UserStatistics({ metrics }) {
  if (!metrics) return null;
  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col">
      <h3 className="text-lg font-semibold text-[#06164a] mb-4">User Statistics</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Total Users</span>
          <span className="font-medium">{metrics.totalUsers}</span>
        </div>
        <div className="flex justify-between">
          <span>Active Users</span>
          <span className="font-medium">{metrics.activeUsers}</span>
        </div>
        <div className="flex justify-between">
          <span>New Registrations</span>
          <span className="font-medium">{metrics.newRegistrations}</span>
        </div>
        <div className="flex justify-between">
          <span>Activity Rate</span>
          <span className="font-medium">
            {formatPercent(metrics.activityRate)}
          </span>
        </div>
      </div>
    </div>
  );
}