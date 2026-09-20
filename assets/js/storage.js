/* ==========================================================================
   saveUrMoney — assets/js/storage.js
   Satu-satunya modul yang boleh menyentuh localStorage secara langsung.
   Tanggung jawab: baca/tulis transaksi & budget mingguan, tanpa logic bisnis.
   ========================================================================== */

(function (global) {
  "use strict";

  var STORAGE_KEY = "saveurmoney_transactions";
  var BUDGET_KEY = "saveurmoney_weekly_budget";

  function loadTransactions() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Gagal membaca transaksi dari localStorage:", e);
      return [];
    }
  }

  function saveTransactions(transactions) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      return true;
    } catch (e) {
      console.error("Gagal menyimpan transaksi ke localStorage:", e);
      return false;
    }
  }

  function loadBudget() {
    try {
      var raw = localStorage.getItem(BUDGET_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("Gagal membaca budget dari localStorage:", e);
      return null;
    }
  }

  function saveBudget(amount) {
    try {
      localStorage.setItem(BUDGET_KEY, JSON.stringify(amount));
      return true;
    } catch (e) {
      console.error("Gagal menyimpan budget ke localStorage:", e);
      return false;
    }
  }

  function clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BUDGET_KEY);
      return true;
    } catch (e) {
      console.error("Gagal membersihkan data di localStorage:", e);
      return false;
    }
  }

  global.SaveUrMoneyStorage = {
    loadTransactions: loadTransactions,
    saveTransactions: saveTransactions,
    loadBudget: loadBudget,
    saveBudget: saveBudget,
    clearAllData: clearAllData
  };
})(window);
