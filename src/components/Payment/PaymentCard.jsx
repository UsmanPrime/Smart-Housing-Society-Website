import React from "react";

export default function PaymentCard({ item, onPayNow }) {
  return (
    <div className="rounded-lg border border-[#06164a]/20 bg-white p-4 flex justify-between items-start">
      <div>
        <div className="text-[#06164a] font-semibold">{item.title}</div>
        <div className="text-[#06164a]">Amount: ${item.amount}</div>
        <div className="text-[#06164a]">Due: {item.dueDate}</div>
        <div className="mt-1">
          <span className={item.status === "pending"
            ? "px-2 py-1 bg-yellow-100 text-yellow-800 rounded"
            : "px-2 py-1 bg-red-100 text-red-800 rounded"}>
            {item.status}
          </span>
        </div>
      </div>
      <button
        className="px-3 py-2 rounded-md bg-[#06164a] text-white hover:bg-[#0f335b]"
        onClick={onPayNow}
      >
        Pay Now
      </button>
    </div>
  );
}