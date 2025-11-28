import React from "react";

function downloadBlob(filename, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ExportButton({ logs = [] }) {
  const exportToCSV = () => {
    const header = ["id", "timestamp", "user", "action", "ip", "ref"];
    const rows = logs.map(l => [
      l.id,
      l.ts,
      l.user,
      l.action,
      l.ip,
      l?.meta?.ref || ""
    ]);
    const csv = [header.join(","), ...rows.map(r =>
      r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
    )].join("\n");
    downloadBlob(`audit_logs_${Date.now()}.csv`, "text/csv;charset=utf-8", csv);
  };

  const exportToPDF = () => {
    // Opens a print-friendly HTML table. User can Save as PDF in the dialog.
    const win = window.open("", "_blank");
    if (!win) {
      alert("Pop-up blocked. Please allow pop-ups for this site.");
      return;
    }
    const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Audit Logs</title>
<style>
  body { font-family: Arial, sans-serif; padding: 16px; }
  h1 { font-size: 18px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
  th { background: #f3f4f6; }
</style>
</head>
<body>
  <h1>Audit Logs</h1>
  <table>
    <thead>
      <tr>
        <th>ID</th><th>Timestamp</th><th>User</th><th>Action</th><th>IP</th><th>Ref</th>
      </tr>
    </thead>
    <tbody>
      ${logs.map(l => `
        <tr>
          <td>${escapeHtml(l.id)}</td>
          <td>${escapeHtml(l.ts)}</td>
          <td>${escapeHtml(l.user)}</td>
          <td>${escapeHtml(l.action)}</td>
          <td>${escapeHtml(l.ip)}</td>
          <td>${escapeHtml(l?.meta?.ref || "")}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  <script>
    window.onload = function () { window.print(); };
  </script>
</body>
</html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToCSV}
        className="px-3 py-2 rounded bg-white text-[#06164a] border border-[#06164a] text-xs"
      >
        Export CSV
      </button>
      <button
        onClick={exportToPDF}
        className="px-3 py-2 rounded bg-[#06164a] text-white text-xs"
      >
        Export PDF
      </button>
    </div>
  );
}

function escapeHtml(v) {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}