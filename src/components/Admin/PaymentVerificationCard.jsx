import React, { useState } from "react";
import PaymentStatusBadge, { getStatusColor } from "../Payment/PaymentStatusBadge";

export default function PaymentVerificationCard({
  item,
  onApprove,
  onReject,
  onViewReceipt,
}) {
  const [remarks, setRemarks] = useState("");

  // Expected item shape (example):
  // {
  //   id, userName, flat: "A-302", charge, amount, paidAt: "2025-11-27T10:22:00Z",
  //   receiptUrl, status: "pending"
  // }

  const prettyDate = (iso) =>
    iso ? new Date(iso).toLocaleString() : "—";

  const isImage = (url = "") =>
    /\.(png|jpe?g|webp|gif)$/i.test(url);

  return (
    <div className="rounded-xl border border-[#06164a]/20 bg-white p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-[#06164a]">
            {item.userName || "Resident"} • {item.flat || ""}
          </div>
          <div className="text-[#06164a]/80 text-sm">
            Charge: <span className="font-medium">{item.charge}</span>
          </div>
          <div className="text-[#06164a]/80 text-sm">
            Amount: <span className="font-medium">${item.amount}</span>
          </div>
          <div className="text-[#06164a]/80 text-sm">
            Paid At: <span className="font-medium">{prettyDate(item.paidAt)}</span>
          </div>
        </div>
        <PaymentStatusBadge status={item.status || "pending"} />
      </div>

      <button
        type="button"
        onClick={() => onViewReceipt(item.receiptUrl, `receipt-${item.id}`)}
        className="group rounded-lg overflow-hidden border border-[#06164a]/20"
        title="View receipt"
      >
        <div className="h-40 w-full bg-[#f5f6fa] flex items-center justify-center">
          {isImage(item.receiptUrl) ? (
            <img
              src={item.receiptUrl}
              alt="Receipt preview"
              className="max-h-40 object-contain"
              loading="lazy"
            />
          ) : (
            <div className="text-[#06164a]">
              <div className="text-sm">PDF Receipt</div>
              <div className="text-xs opacity-70">Click to preview</div>
            </div>
          )}
        </div>
      </button>

      <div>
        <label className="block text-sm text-[#06164a] mb-2">
          Remarks (optional)
        </label>
        <textarea
          className="w-full px-3 py-2 rounded-md border border-[#06164a]/30 focus:outline-none focus:ring-2 focus:ring-[#06164a]/50"
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add a note for the resident…"
        />
      </div>

      <div className="flex gap-3">
        <button
          className="px-4 py-2 rounded-md bg-[#06164a] text-white hover:bg-[#0f335b]"
          onClick={() => onApprove(item.id, remarks)}
        >
          Approve
        </button>
        <button
          className="px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a] hover:bg-[#06164a]/5"
          onClick={() => onReject(item.id, remarks)}
        >
          Reject
        </button>
      </div>
    </div>
  );
}