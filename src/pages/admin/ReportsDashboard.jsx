import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PaymentSummary from "../../components/Reports/PaymentSummary";
import UserStatistics from "../../components/Reports/UserStatistics";
import ActivityChart from "../../components/Reports/ActivityChart";
import PaymentTrendChart from "../../components/Reports/PaymentTrendChart";
import { api } from "../../lib/api";

export default function ReportsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trendPeriod, setTrendPeriod] = useState("monthly");

  const fetchReportData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all report data in parallel
      const [paymentSummary, activityData, trendData, recentPayments] = await Promise.all([
        api.get("/api/reports/payment-summary"),
        api.get("/api/reports/activity"),
        api.get(`/api/reports/payment-trend?period=${trendPeriod}`),
        api.get("/api/reports/recent-payments")
      ]);

      setData({
        payments: paymentSummary.success ? paymentSummary.data : null,
        users: activityData.success ? {
          totalUsers: activityData.data.totalUsers,
          activeResidents: activityData.data.activeResidents,
          activeVendors: activityData.data.activeVendors,
          pendingApprovals: activityData.data.pendingApprovals,
        } : null,
        activity: activityData.success ? {
          logins7Days: activityData.data.logins7Days,
          actionsToday: activityData.data.actionsToday,
          actionDistribution: activityData.data.actionDistribution || []
        } : null,
        paymentTrend: trendData.success ? trendData.data : null,
        recentPayments: recentPayments.success ? recentPayments.payments : []
      });
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => fetchReportData();

  useEffect(() => {
    fetchReportData();
  }, [trendPeriod]);

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

          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <label className="text-[#06164a] flex items-center gap-2">
                Trend Period:
                <select
                  value={trendPeriod}
                  onChange={(e) => setTrendPeriod(e.target.value)}
                  className="px-3 py-2 rounded bg-white text-[#06164a] border border-[#06164a]"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>
            </div>
            <button
              onClick={refreshData}
              className="px-4 py-2 rounded bg-[#06164a] text-white text-sm hover:bg-[#0f335b]"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="rounded-md border border-red-400 bg-red-100 text-red-800 px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {loading && <div className="text-sm text-[#06164a]">Loading metrics…</div>}
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