import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import LogsTable from "../../components/AuditLogs/LogsTable";
import LogFilters from "../../components/AuditLogs/LogFilters";
import ExportButton from "../../components/AuditLogs/ExportButton";
import { generateMockLogs, filterLogs, searchInLogs } from "../../components/AuditLogs/logUtils";

const STORAGE_KEY = "admin_audit_logs";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: null, to: null, user: "all", action: "all" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const fetchAuditLogs = useCallback(() => {
    setLoading(true);
    let stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const seed = generateMockLogs(120);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      stored = JSON.stringify(seed);
    }
    const parsed = JSON.parse(stored) || [];
    setLogs(parsed);
    setLoading(false);
  }, []);

  const applyFilters = useCallback(() => {
    let next = filterLogs(logs, filters);
    if (search.trim()) next = searchInLogs(next, search.trim());
    setFiltered(next);
    setPage(1);
  }, [logs, filters, search]);

  const clearFilters = () => {
    setFilters({ from: null, to: null, user: "all", action: "all" });
    setSearch("");
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const pageLogs = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  const handleSearch = (val) => setSearch(val);

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

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#06164a]">
                {loading
                  ? "Loading logs..."
                  : `Showing ${filtered.length} log entr${filtered.length === 1 ? "y" : "ies"}`}
              </p>
              <ExportButton logs={filtered} />
            </div>

            <LogsTable
              logs={pageLogs}
              highlight={search}
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              sortCallback={(sorted) => {
                setFiltered(sorted);
                setPage(1);
              }}
            />
        </div>
      </main>
      <Footer />
    </div>
  );
}