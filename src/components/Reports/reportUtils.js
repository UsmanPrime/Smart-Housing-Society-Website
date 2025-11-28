// No external imports

const fmtDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" });
const fmtMonth = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });
const moneyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function subDays(date, days) {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}

function formatDay(d) {
  return fmtDay.format(d);
}

function formatMonthYear(d) {
  return fmtMonth.format(d);
}

export function buildMockReportData() {
  const payments = {
    totalCollected: 7820.5,
    pendingCount: 5,
    overdueCount: 2,
    successRate: 93.4, // percent value
  };

  const users = {
    totalUsers: 148,
    activeUsers: 121,
    newRegistrations: 9,
    activityRate: (121 / 148) * 100, // percent value
  };

  const activity = Array.from({ length: 14 }).map((_, i) => {
    const d = subDays(new Date(), 13 - i);
    return {
      date: formatDay(d),
      logins: Math.floor(Math.random() * 40) + 10,
      bookings: Math.floor(Math.random() * 12),
      payments: Math.floor(Math.random() * 18),
    };
  });

  const paymentTrend = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: formatMonthYear(d),
      amount: Math.round((Math.random() * 3000 + 1500) * 100) / 100,
      prevAmount: Math.round((Math.random() * 3000 + 1500) * 100) / 100,
    };
  });

  return { payments, users, activity, paymentTrend };
}

export function formatMoney(v) {
  return moneyFmt.format(Number(v || 0));
}

export function formatPercent(v) {
  const n = Number(v || 0);
  const pct = n > 1 ? n : n * 100;
  return `${pct.toFixed(2)}%`;
}