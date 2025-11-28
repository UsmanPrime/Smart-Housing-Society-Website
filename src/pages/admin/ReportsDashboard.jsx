import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PaymentSummary from "../../components/Reports/PaymentSummary";
import UserStatistics from "../../components/Reports/UserStatistics";
import ActivityChart from "../../components/Reports/ActivityChart";
import PaymentTrendChart from "../../components/Reports/PaymentTrendChart";
import { buildMockReportData } from "../../components/Reports/reportUtils";

export default function ReportsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReportData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(buildMockReportData());
      setLoading(false);
    }, 300);
  };

  const refreshData = () => fetchReportData();

  useEffect(() => {
    fetchReportData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#c3c5ce]">
      <Navbar />
      <main className="flex-grow pt-40 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-4xl font-normal text-[#06164a] mb-8"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Reports Dashboard
          </h1>

          <div className="flex justify-end mb-4">
            <button
              onClick={refreshData}
              className="px-4 py-2 rounded bg-[#06164a] text-white text-sm"
            >
              Refresh
            </button>
          </div>

          {loading && <div className="text-sm">Loading metrics…</div>}
          {!loading && data && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PaymentSummary metrics={data.payments} />
                <UserStatistics metrics={data.users} />
                <ActivityChart activity={data.activity} />
              </div>
              <PaymentTrendChart trend={data.paymentTrend} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}