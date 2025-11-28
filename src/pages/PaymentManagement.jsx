import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useAuth from "../hooks/useAuth";
import PaymentDuesTable from "../components/Payment/PaymentDuesTable";
import ReceiptUpload from "../components/Payment/ReceiptUpload";
import PaymentHistory from "../components/Payment/PaymentHistory";

export default function PaymentManagement() {
  const { isResident } = useAuth();
  const [tab, setTab] = useState("dues"); // 'dues' | 'upload' | 'history'

  if (!isResident) return (
    <div className="min-h-screen">
      <Navbar />
      <main className="bg-[#c3c5ce] min-h-[60vh]" />
      <Footer />
    </div>
  );

  const tabBtn = (id, label) => (
    <button
      onClick={() => setTab(id)}
      className={
        tab === id
          ? "px-4 py-2 rounded-md bg-[#06164a] text-white"
          : "px-4 py-2 rounded-md bg-white text-[#06164a] border border-[#06164a]"
      }
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="bg-[#c3c5ce]">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <h2
            className="text-4xl md:text-5xl font-normal mb-6 text-[#06164a] text-center"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Payment Management
          </h2>

          <div className="flex gap-3 justify-center mb-10">
            {tabBtn("dues", "Pending Dues")}
            {tabBtn("upload", "Upload Receipt")}
            {tabBtn("history", "Payment History")}
          </div>

          {tab === "dues" && <PaymentDuesTable />}
          {tab === "upload" && <ReceiptUpload />}
          {tab === "history" && <PaymentHistory />}
        </section>
      </main>
      <Footer />
    </div>
  );
}