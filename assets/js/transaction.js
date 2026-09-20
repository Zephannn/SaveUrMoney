/* ==========================================================================
   saveUrMoney — assets/js/transaction.js
   Logic tambah / ubah / hapus transaksi (CRUD murni, tanpa DOM).
   Validasi mengikuti aturan PRD 6.2 (Add Transaction — Validation Rules).
   ========================================================================== */

(function (global) {
  "use strict";

  /**
   * Validasi input transaksi.
   * @returns {Object} { valid: boolean, errors: { amount, category, date } }
   */
  function validate(input) {
    var errors = {};

    if (!input.amount || input.amount <= 0) {
      errors.amount = "Nominal harus lebih besar dari 0.";
    }
    if (!input.category) {
      errors.category = "Kategori wajib dipilih.";
    }
    if (!input.date) {
      errors.date = "Tanggal wajib diisi.";
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors: errors
    };
  }

  /**
   * Menambahkan transaksi baru ke array transactions (immutable-friendly: mengembalikan array baru).
   */
  function addTransaction(transactions, input) {
    var newTx = {
      id: Date.now(),
      type: input.type,
      category: input.category,
      amount: input.amount,
      date: input.date,
      description: input.description || ""
    };
    return transactions.concat([newTx]);
  }

  /**
   * Memperbarui transaksi yang sudah ada berdasarkan id.
   */
  function updateTransaction(transactions, id, input) {
    return transactions.map(function (t) {
      if (t.id !== id) return t;
      return {
        id: t.id,
        type: input.type,
        category: input.category,
        amount: input.amount,
        date: input.date,
        description: input.description || ""
      };
    });
  }

  /**
   * Menghapus transaksi berdasarkan id.
   */
  function deleteTransaction(transactions, id) {
    return transactions.filter(function (t) { return t.id != id; });
  }

  function findTransaction(transactions, id) {
    return transactions.find(function (t) { return t.id == id; });
  }

  /**
   * Mengurutkan & memfilter transaksi untuk ditampilkan di riwayat.
   * filter: "all" | "income" | "expense"
   */
  function filterAndSort(transactions, filter) {
    var filtered = transactions.filter(function (t) {
      if (filter === "all") return true;
      return t.type === filter;
    });
    return filtered.slice().sort(function (a, b) {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.id - a.id;
    });
  }

  global.SaveUrMoneyTransaction = {
    validate: validate,
    addTransaction: addTransaction,
    updateTransaction: updateTransaction,
    deleteTransaction: deleteTransaction,
    findTransaction: findTransaction,
    filterAndSort: filterAndSort
  };
})(window);
