const users = ["john.doe", "sara.khan", "lee.wong", "admin", "vendor.x"];
const actions = [
  "LOGIN",
  "LOGOUT",
  "PAYMENT_SUBMIT",
  "PAYMENT_APPROVE",
  "PAYMENT_REJECT",
  "USER_CREATE",
  "USER_VERIFY",
  "FACILITY_BOOK",
  "FACILITY_CANCEL",
];

function subDays(date, days) {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}

export function generateMockLogs(count = 100) {
  const base = new Date();
  return Array.from({ length: count }).map((_, i) => {
    const d = subDays(base, Math.floor(Math.random() * 30));
    return {
      id: `log-${i + 1}`,
      ts: d.toISOString(),
      user: users[Math.floor(Math.random() * users.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      meta: { ref: Math.random().toString(36).slice(2, 10) },
    };
  });
}

export function filterLogs(logs, { from, to, user, action }) {
  return logs.filter((l) => {
    const t = new Date(l.ts);
    if (from && t < new Date(from)) return false;
    if (to && t > new Date(to)) return false;
    if (user !== "all" && l.user !== user) return false;
    if (action !== "all" && l.action !== action) return false;
    return true;
  });
}

export function searchInLogs(logs, term) {
  const lc = term.toLowerCase();
  return logs.filter(
    (l) =>
      l.user.toLowerCase().includes(lc) ||
      l.action.toLowerCase().includes(lc) ||
      l.ip.toLowerCase().includes(lc) ||
      (l.meta?.ref || "").toLowerCase().includes(lc)
  );
}

export function sortLogs(logs, column, dir = "asc") {
  const next = [...logs].sort((a, b) => {
    let av, bv;
    if (column === "ts") {
      av = new Date(a.ts).getTime();
      bv = new Date(b.ts).getTime();
    } else if (column === "meta" || column === "ref") {
      av = a?.meta?.ref || "";
      bv = b?.meta?.ref || "";
    } else {
      av = String(a[column] ?? "");
      bv = String(b[column] ?? "");
    }
    if (av > bv) return 1;
    if (av < bv) return -1;
    return 0;
  });
  return dir === "desc" ? next.reverse() : next;
}

export function formatTs(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const USERS = users;
export const ACTIONS = actions;