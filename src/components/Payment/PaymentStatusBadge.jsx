import React from "react";

export const getStatusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "approved":
      return { bg: "bg-green-100", text: "text-green-800", ring: "ring-green-200" };
    case "rejected":
      return { bg: "bg-red-100", text: "text-red-800", ring: "ring-red-200" };
    case "pending":
      return { bg: "bg-yellow-100", text: "text-yellow-800", ring: "ring-yellow-200" };
    case "flagged":
      return { bg: "bg-orange-100", text: "text-orange-800", ring: "ring-orange-200" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", ring: "ring-gray-200" };
  }
};

export const getStatusIcon = (status) => {
  switch ((status || "").toLowerCase()) {
    case "approved": return "✔";
    case "rejected": return "✖";
    case "pending": return "•";
    case "flagged": return "!";
    default: return "•";
  }
};

export default function PaymentStatusBadge({ status = "pending", className = "" }) {
  const c = getStatusColor(status);
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded ${c.bg} ${c.text} ring-1 ${c.ring} ${className}`} title={status}>
      <span>{getStatusIcon(status)}</span>
      <span className="capitalize text-sm">{status}</span>
    </span>
  );
}