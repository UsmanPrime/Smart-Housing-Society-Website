import React, { useMemo, useState } from "react";

export default function PaymentHistory() {
  const [range, setRange] = useState({ from: "", to: "" });
  const items = useMemo(() => [
    { id: 11, title: "Maintenance - Oct", amount: 150, date: "2025-10-08", receiptUrl: "/receipts/11.png" },
    { id: 12, title: "Utility - Sep", amount: 85, date: "2025-09-30", receiptUrl: "/receipts/12.png" },
  ], []);

  const withinRange = (d) => {
    const dt = new Date(d);
    const from = range.from ? new Date(range.from) : null;
    const to = range.to ? new Date(range.to) : null;
    if (from && dt < from) return false;
    if (to && dt > to) return false;
    return true;
  };

  const filtered = items.filter(i => withinRange(i.date));

  const downloadReceipt = (item) => {
    // Stub: trigger browser download of receiptUrl
    const a = document.createElement("a");
    a.href = item.receiptUrl;
    a.download = `${item.title}.png`;
    a.click();
  };

  const viewReceiptDetails = (item) => {
    window.open(item.receiptUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-[#06164a] mb-1">From</label>
          <input
            type="date"
            className="px-3 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"
            value={range.from}
            onChange={(e) => setRange(r => ({ ...r, from: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-[#06164a] mb-1">To</label>
          <input
            type="date"
            className="px-3 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"
            value={range.to}
            onChange={(e) => setRange(r => ({ ...r, to: e.target.value }))}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#06164a]/20 overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[#06164a] text-white">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">{item.title}</td>
                <td className="px-4 py-3">${item.amount}</td>
                <td className="px-4 py-3">{item.date}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    className="px-3 py-2 rounded-md bg-[#06164a] text-white hover:bg-[#0f335b]"
                    onClick={() => viewReceiptDetails(item)}
                  >
                    View
                  </button>
                  <button
                    className="px-3 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"
                    onClick={() => downloadReceipt(item)}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[#06164a]">
                  No payments found in selected range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}