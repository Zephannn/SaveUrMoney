/* ==========================================================================
   saveUrMoney — assets/js/calculator.js
   Semua perhitungan keuangan murni (tanpa DOM, tanpa localStorage):
   format Rupiah, rentang minggu berjalan, total, dan status budget.
   ========================================================================== */

(function (global) {
  "use strict";

  // ---------- Formatting ----------

  function formatRupiah(num) {
    num = Math.round(num || 0);
    var neg = num < 0;
    num = Math.abs(num);
    var str = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (neg ? "-Rp" : "Rp") + str;
  }

  function parseAmountInput(str) {
    if (!str) return 0;
    var digits = str.replace(/[^\d]/g, "");
    return digits ? parseInt(digits, 10) : 0;
  }

  function formatAmountThousands(num) {
    if (!num) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function formatDateDisplay(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return dateStr;
    var months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function todayStr() {
    var d = new Date();
    var m = (d.getMonth() + 1).toString().padStart(2, "0");
    var day = d.getDate().toString().padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  // ---------- Rentang minggu berjalan (Senin s.d. Minggu) ----------

  function getWeekRange() {
    var now = new Date();
    var day = now.getDay(); // 0 = Minggu
    var diffToMonday = day === 0 ? -6 : 1 - day;
    var monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() + diffToMonday);
    var sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  }

  function isInWeek(dateStr, range) {
    var d = new Date(dateStr + "T12:00:00");
    return d >= range.start && d <= range.end;
  }

  function formatWeekLabel(range) {
    var months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    var s = range.start, e = range.end;
    if (s.getMonth() === e.getMonth()) {
      return s.getDate() + " - " + e.getDate() + " " + months[e.getMonth()];
    }
    return s.getDate() + " " + months[s.getMonth()] + " - " + e.getDate() + " " + months[e.getMonth()];
  }

  // ---------- Perhitungan keuangan ----------

  function calcTotals(transactions) {
    var income = 0, expense = 0;
    transactions.forEach(function (t) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    });
    return { income: income, expense: expense, balance: income - expense };
  }

  function calcWeeklyExpense(transactions, range) {
    var total = 0;
    transactions.forEach(function (t) {
      if (t.type === "expense" && isInWeek(t.date, range)) total += t.amount;
    });
    return total;
  }

  function calcCategoryBreakdown(transactions, range) {
    var map = {};
    transactions.forEach(function (t) {
      if (t.type === "expense" && isInWeek(t.date, range)) {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    });
    var arr = Object.keys(map).map(function (k) {
      return { category: k, amount: map[k] };
    });
    arr.sort(function (a, b) { return b.amount - a.amount; });
    return arr;
  }

  /**
   * Rumus PRD: Persentase Penggunaan Budget = (Pengeluaran Mingguan / Budget Mingguan) x 100
   * Status dihitung dari PERSENTASE budget, bukan dari nominal pengeluaran absolut.
   *   0–60%   -> Hemat
   *   61–80%  -> Normal
   *   81–100% -> Boros
   *   >100%   -> Melebihi Budget
   */
  function getBudgetStatus(pct) {
    if (pct > 100) return { key: "melebihi", label: "Melebihi Budget", color: "var(--expense)" };
    if (pct > 80) return { key: "boros", label: "Boros", color: "var(--warn)" };
    if (pct > 60) return { key: "normal", label: "Normal", color: "var(--normal)" };
    return { key: "hemat", label: "Hemat", color: "var(--income)" };
  }

  global.SaveUrMoneyCalc = {
    formatRupiah: formatRupiah,
    parseAmountInput: parseAmountInput,
    formatAmountThousands: formatAmountThousands,
    formatDateDisplay: formatDateDisplay,
    todayStr: todayStr,
    getWeekRange: getWeekRange,
    isInWeek: isInWeek,
    formatWeekLabel: formatWeekLabel,
    calcTotals: calcTotals,
    calcWeeklyExpense: calcWeeklyExpense,
    calcCategoryBreakdown: calcCategoryBreakdown,
    getBudgetStatus: getBudgetStatus
  };
})(window);
