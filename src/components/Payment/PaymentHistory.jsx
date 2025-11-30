import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { getReceiptImageUrl, downloadFile } from "../../lib/fileUtils";

export default function PaymentHistory() {
  const [range, setRange] = useState({ from: "", to: "" });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch payment history
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        let url = "/api/payments/history";
        const params = new URLSearchParams();
        if (range.from) params.append("from", range.from);
        if (range.to) params.append("to", range.to);
        if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await api.get(url);
        if (response.success) {
          setItems(response.payments || []);
        }
      } catch (err) {
        console.error("Error fetching payment history:", err);
        setError(err.message || "Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [range.from, range.to, statusFilter]);

  const withinRange = (d) => {
    const dt = new Date(d);
    const from = range.from ? new Date(range.from) : null;
    const to = range.to ? new Date(range.to) : null;
    if (from && dt < from) return false;
    if (to && dt > to) return false;
    return true;
  };

  const filtered = items.filter(i => withinRange(i.date));

  const downloadReceipt = async (item) => {
    if (item.receiptImageUrl) {
      try {
        const authenticatedUrl = getReceiptImageUrl(item.receiptImageUrl);
        const filename = `receipt-${item._id}.${item.receiptImageUrl.split('.').pop()}`;
        await downloadFile(authenticatedUrl, filename);
      } catch (error) {
        console.error('Failed to download receipt:', error);
        alert('Failed to download receipt. Please try again.');
      }
    }
  };

  const viewReceiptDetails = (item) => {
    if (item.receiptImageUrl) {
      const authenticatedUrl = getReceiptImageUrl(item.receiptImageUrl);
      window.open(authenticatedUrl, "_blank");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "verified") return "px-2 py-1 bg-green-100 text-green-800 rounded text-sm";
    if (status === "rejected") return "px-2 py-1 bg-red-100 text-red-800 rounded text-sm";
    return "px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm";
  };

  return (
    <div className="space-y-4">
      {loading && <div className="text-center text-[#06164a] py-6">Loading payment history...</div>}
      {error && (
        <div className="rounded-md border border-red-400 bg-red-100 text-red-800 px-4 py-3">
          {error}
        </div>
      )}
      {!loading && !error && (
        <>
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
        <div>
          <label className="block text-[#06164a] mb-1">Status</label>
          <select
            className="px-3 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#06164a]/20 overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[#06164a] text-white">
            <tr>
              <th className="text-left px-4 py-3">Charge</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item._id} className="border-t">
                <td className="px-4 py-3">{item.dueTitle || item.chargeTitle || "Payment"}</td>
                <td className="px-4 py-3">PKR {item.amount}</td>
                <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={getStatusBadge(item.status)}>
                    {item.status}
                  </span>
                  {item.status === "rejected" && item.rejectionReason && (
                    <div className="text-xs text-red-600 mt-1">{item.rejectionReason}</div>
                  )}
                </td>
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
                <td colSpan={5} className="px-4 py-6 text-center text-[#06164a]">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  );
}