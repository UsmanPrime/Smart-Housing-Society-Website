import React from "react";
import { USERS, ACTIONS } from "./logUtils";

const toIsoStart = (d) => (d ? new Date(`${d}T00:00:00`).toISOString() : null);
const toIsoEnd = (d) => (d ? new Date(`${d}T23:59:59.999`).toISOString() : null);

export default function LogFilters({
  filters,
  setFilters,
  onApply,
  onClear,
  search,
  setSearch,
}) {
  const fromValue = filters.from ? filters.from.slice(0, 10) : "";
  const toValue = filters.to ? filters.to.slice(0, 10) : "";

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-xs font-medium mb-1 text-[#06164a]">From</label>
          <input
            type="date"
            value={fromValue}
            onChange={(e) =>
              setFilters((f) => ({ ...f, from: toIsoStart(e.target.value) }))
            }
            className="w-full px-3 py-2 rounded border text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-[#06164a]">To</label>
          <input
            type="date"
            value={toValue}
            onChange={(e) =>
              setFilters((f) => ({ ...f, to: toIsoEnd(e.target.value) }))
            }
            className="w-full px-3 py-2 rounded border text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-[#06164a]">User</label>
          <select
            value={filters.user}
            onChange={(e) => setFilters((f) => ({ ...f, user: e.target.value }))}
            className="w-full px-3 py-2 rounded border text-sm"
          >
            <option value="all">All</option>
            {USERS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-[#06164a]">Action</label>
          <select
            value={filters.action}
            onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
            className="w-full px-3 py-2 rounded border text-sm"
          >
            <option value="all">All</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-[#06164a]">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Term"
            className="w-full px-3 py-2 rounded border text-sm"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={onApply}
          className="px-4 py-2 rounded bg-[#06164a] text-white text-sm"
        >
          Apply Filters
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2 rounded bg-white text-[#06164a] border border-[#06164a] text-sm"
        >
          Clear
        </button>
      </div>
    </div>
  );
}