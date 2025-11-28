import React, { useMemo, useState } from "react";
import PaymentCard from "./PaymentCard";

export default function PaymentDuesTable({ onPayNow }) {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate"); // 'dueDate' | 'amount'
  const dues = useMemo(() => [
    { id: 1, title: "Maintenance - November", amount: 150, dueDate: "2025-12-05", status: "pending" },
    { id: 2, title: "Parking Fee - Q4", amount: 60, dueDate: "2025-12-10", status: "pending" },
    { id: 3, title: "Utility - October", amount: 90, dueDate: "2025-11-15", status: "overdue" },
  ], []);

  const filtered = dues.filter(d => filter === "all" ? true : d.status === filter);
  const sorted = [...filtered].sort((a,b) => {
    if (sortBy === "amount") return b.amount - a.amount;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-[#06164a]">Filter:</label>
        <select
          className="px-3 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>

        <label className="text-[#06164a] ml-4">Sort By:</label>
        <select
          className="px-3 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="dueDate">Due Date</option>
          <option value="amount">Amount</option>
        </select>
      </div>

      {/* Table view for larger screens */}
      <div className="hidden md:block bg-white rounded-xl border border-[#06164a]/20 overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[#06164a] text-white">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Due Date</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(d => (
              <tr key={d.id} className="border-t">
                <td className="px-4 py-3">{d.title}</td>
                <td className="px-4 py-3">${d.amount}</td>
                <td className="px-4 py-3">{d.dueDate}</td>
                <td className="px-4 py-3">
                  <span className={d.status === "pending"
                    ? "px-2 py-1 bg-yellow-100 text-yellow-800 rounded"
                    : "px-2 py-1 bg-red-100 text-red-800 rounded"}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="px-3 py-2 rounded-md bg-[#06164a] text-white hover:bg-[#0f335b]"
                    onClick={() => onPayNow(d)}
                  >
                    Pay Now
                  </button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#06164a]">
                  No dues found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {sorted.map(d => (
          <PaymentCard key={d.id} item={d} onPayNow={() => onPayNow(d)} />
        ))}
        {sorted.length === 0 && (
          <div className="text-center text-[#06164a] py-6">No dues found.</div>
        )}
      </div>
    </div>
  );
}