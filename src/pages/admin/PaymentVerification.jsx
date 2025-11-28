import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";
import PaymentVerificationCard from "../../components/Admin/PaymentVerificationCard";
import ReceiptPreviewModal from "../../components/Admin/ReceiptPreviewModal";

const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "";

export default function PaymentVerification() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [preview, setPreview] = useState({ open: false, fileUrl: "", filename: "" });

  const fetchPendingPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/admin/payments/pending`);
      setRequests(res.data || []);
    } catch (e) {
      setError("Failed to load pending payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  const approvePayment = async (id, remarks = "") => {
    try {
      await axios.post(`${API_BASE}/admin/payments/${id}/approve`, { remarks });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert("Approve failed. Please try again.");
    }
  };

  const rejectPayment = async (id, remarks = "") => {
    try {
      await axios.post(`${API_BASE}/admin/payments/${id}/reject`, { remarks });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert("Reject failed. Please try again.");
    }
  };

  const viewReceiptModal = (fileUrl, filename = "receipt") => {
    setPreview({ open: true, fileUrl, filename });
  };

  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="bg-[#c3c5ce]">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h2
            className="text-center text-4xl md:text-5xl font-normal mb-8 text-[#06164a]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Payment Verification
          </h2>

          <div className="flex items-center justify-between mb-6">
            <p className="text-[#06164a]">
              {loading
                ? "Loading pending requests…"
                : `${requests.length} pending verification request(s)`}
            </p>
            <button
              className="px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"
              onClick={fetchPendingPayments}
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="rounded-md border border-red-400 bg-red-100 text-red-800 px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {!loading && requests.length === 0 && !error && (
            <div className="rounded-md border border-green-400 bg-green-100 text-green-800 px-4 py-3">
              No pending payments to verify.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((req) => (
              <PaymentVerificationCard
                key={req.id}
                item={req}
                onApprove={approvePayment}
                onReject={rejectPayment}
                onViewReceipt={viewReceiptModal}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />

      <ReceiptPreviewModal
        isOpen={preview.open}
        fileUrl={preview.fileUrl}
        filename={preview.filename}
        onClose={() => setPreview({ open: false, fileUrl: "", filename: "" })}
      />
    </div>
  );
}