import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LogsTable from "../../components/AuditLogs/LogsTable";
import LogFilters from "../../components/AuditLogs/LogFilters";
import ExportButton from "../../components/AuditLogs/ExportButton";
import { api } from "../../lib/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ from: null, to: null, user: "all", action: "all" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 50;

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.user && filters.user !== "all") params.append("userId", filters.user);
      if (filters.action && filters.action !== "all") params.append("action", filters.action);
      if (search.trim()) params.append("search", search.trim());
      params.append("page", page.toString());
      params.append("limit", pageSize.toString());

      const url = `/api/audit/logs?${params.toString()}`;
      const response = await api.get(url);
      
      if (response.success) {
        setLogs(response.logs || []);
        setTotalPages(response.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [filters, search, page]);

  const applyFilters = () => {
    setPage(1);
    fetchAuditLogs();
  };

  const clearFilters = () => {
    setFilters({ from: null, to: null, user: "all", action: "all" });
    setSearch("");
    setPage(1);
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleSearch = (val) => setSearch(val);
  
  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.user && filters.user !== "all") params.append("userId", filters.user);
      if (filters.action && filters.action !== "all") params.append("action", filters.action);
      if (search.trim()) params.append("search", search.trim());

      const url = `/api/audit/export?${params.toString()}`;
      const blob = await api.get(url);
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
      alert(err.message || "Failed to export logs");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#c3c5ce]">
      <Navbar />
      <main className="flex-grow pt-40 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-4xl font-normal text-[#06164a] mb-8"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Audit Logs
          </h1>

            <LogFilters
              filters={filters}
              setFilters={setFilters}
              onApply={applyFilters}
              onClear={clearFilters}
              search={search}
              setSearch={handleSearch}
            />

            {error && (
              <div className="rounded-md border border-red-400 bg-red-100 text-red-800 px-4 py-3 mb-6">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#06164a]">
                {loading
                  ? "Loading logs..."
                  : `Showing ${logs.length} log entr${logs.length === 1 ? "y" : "ies"}`}
              </p>
              <button
                onClick={handleExport}
                className="px-4 py-2 rounded-md bg-[#06164a] text-white hover:bg-[#0f335b]"
              >
                Export CSV
              </button>
            </div>

            <LogsTable
              logs={logs}
              highlight={search}
              page={page}
              totalPages={totalPages}
              setPage={setPage}
            />
        </div>
      </main>
      <Footer />
    </div>
  );
}