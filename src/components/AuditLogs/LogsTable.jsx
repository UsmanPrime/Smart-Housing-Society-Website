import React, { useState } from "react";
import { formatTs, sortLogs } from "./logUtils";

export default function LogsTable({
  logs,
  highlight,
  page,
  totalPages,
  setPage,
  sortCallback
}) {
  const [sortState, setSortState] = useState({ column: "ts", dir: "desc" });

  const toggleSort = (col) => {
    setSortState(s => {
      const dir = s.column === col && s.dir === "asc" ? "desc" : "asc";
      const sorted = sortLogs(logs, col, dir);
      sortCallback(sorted);
      return { column: col, dir };
    });
  };

  const highlightText = (text) => {
    if (!highlight) return text;
    const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200">{text.slice(idx, idx + highlight.length)}</mark>
        {text.slice(idx + highlight.length)}
      </>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-slate-50">
              {["id", "ts", "user", "action", "ip", "ref"].map(col => (
                <th
                  key={col}
                  className="px-3 py-2 cursor-pointer select-none"
                  onClick={() => toggleSort(col === "ref" ? "meta" : col)}
                >
                  {col.toUpperCase()}
                  {sortState.column === col && (
                    <span className="ml-1 text-xs">{sortState.dir === "asc" ? "▲" : "▼"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className="border-t">
                <td className="px-3 py-2">{highlightText(l.id)}</td>
                <td className="px-3 py-2">{formatTs(l.ts)}</td>
                <td className="px-3 py-2">{highlightText(l.user)}</td>
                <td className="px-3 py-2">{highlightText(l.action)}</td>
                <td className="px-3 py-2">{highlightText(l.ip)}</td>
                <td className="px-3 py-2">{highlightText(l.meta.ref)}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  No logs match filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-gray-600">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 text-xs rounded bg-white border disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2 py-1 text-xs rounded bg-white border disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}