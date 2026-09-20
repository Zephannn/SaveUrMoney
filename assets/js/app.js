/* ==========================================================================
   saveUrMoney — assets/js/app.js
   Entry point aplikasi: menyatukan storage.js, calculator.js, dan
   transaction.js, lalu menangani rendering DOM & event handling.
   Urutan <script> di index.html WAJIB: categories -> storage -> calculator
   -> transaction -> app.
   ========================================================================== */

(function () {
  "use strict";

  var Data = window.SaveUrMoneyData;
  var Storage = window.SaveUrMoneyStorage;
  var Calc = window.SaveUrMoneyCalc;
  var Tx = window.SaveUrMoneyTransaction;

  var state = {
    transactions: [],
    budget: null,
    editingId: null,
    deletingId: null,
    filter: "all"
  };

  // ==========================================================================
  // Rendering
  // ==========================================================================

  function render() {
    renderSummary();
    renderBudget();
    renderCategories();
    renderTransactionList();
  }

  function renderSummary() {
    var totals = Calc.calcTotals(state.transactions);
    var balEl = document.getElementById("balanceValue");
    balEl.textContent = Calc.formatRupiah(totals.balance);
    balEl.classList.toggle("negative", totals.balance < 0);
    document.getElementById("incomeValue").textContent = Calc.formatRupiah(totals.income);
    document.getElementById("expenseValue").textContent = Calc.formatRupiah(totals.expense);
  }

  function renderBudget() {
    var card = document.getElementById("budgetCard");
    var range = Calc.getWeekRange();
    var weekLabel = Calc.formatWeekLabel(range);
    document.getElementById("weekRangeLabel").textContent = weekLabel;

    if (!state.budget || state.budget <= 0) {
      card.innerHTML =
        '<div class="budget-head"><span class="budget-title">Budget Mingguan</span></div>' +
        '<div class="budget-empty">' +
        "<p>Atur budget mingguan untuk memantau pengeluaranmu.</p>" +
        '<button class="btn-set-budget" id="btnSetBudgetInline">Atur Budget</button>' +
        "</div>";
      var b = document.getElementById("btnSetBudgetInline");
      if (b) b.addEventListener("click", openBudgetSheet);
      return;
    }

    var spent = Calc.calcWeeklyExpense(state.transactions, range);
    var pct = state.budget > 0 ? (spent / state.budget) * 100 : 0;
    var status = Calc.getBudgetStatus(pct);
    var fillPct = Math.min(pct, 100);

    card.innerHTML =
      '<div class="budget-head"><span class="budget-title">Budget Mingguan</span>' +
      '<button class="budget-edit" id="btnEditBudget">Ubah</button></div>' +
      '<div class="budget-sub">' + weekLabel + "</div>" +
      '<div class="budget-figures">' +
      '<span class="budget-spent" style="color:' + status.color + '">' + Calc.formatRupiah(spent) + "</span>" +
      '<span class="budget-total">dari ' + Calc.formatRupiah(state.budget) + "</span>" +
      "</div>" +
      '<div class="progress-track"><div class="progress-fill" style="width:' + fillPct + "%; background:" + status.color + '"></div></div>' +
      '<div class="budget-status-row">' +
      '<span class="status-pill ' + status.key + '"><span class="status-dot"></span>' + status.label + "</span>" +
      '<span class="budget-pct">' + pct.toFixed(1).replace(".", ",") + "%</span>" +
      "</div>";

    document.getElementById("btnEditBudget").addEventListener("click", openBudgetSheet);
  }

  function renderCategories() {
    var card = document.getElementById("categoryCard");
    var range = Calc.getWeekRange();
    var breakdown = Calc.calcCategoryBreakdown(state.transactions, range);

    if (breakdown.length === 0) {
      card.innerHTML = '<div class="empty-inline">Belum ada pengeluaran minggu ini.</div>';
      return;
    }

    var max = breakdown[0].amount;
    var html = "";
    breakdown.forEach(function (item, idx) {
      var pct = max > 0 ? (item.amount / max) * 100 : 0;
      var color = Data.CATEGORY_BAR_COLORS[idx % Data.CATEGORY_BAR_COLORS.length];
      html +=
        '<div class="cat-row">' +
        '<div class="cat-info">' +
        '<div class="cat-name-row"><span class="cat-name">' + escapeHtml(item.category) + "</span>" +
        '<span class="cat-amount">' + Calc.formatRupiah(item.amount) + "</span></div>" +
        '<div class="cat-bar-track"><div class="cat-bar-fill" style="width:' + pct + "%; --cat-color:" + color + '"></div></div>' +
        "</div></div>";
    });
    card.innerHTML = html;
  }

  function renderTransactionList() {
    var listEl = document.getElementById("txList");
    var sorted = Tx.filterAndSort(state.transactions, state.filter);

    if (sorted.length === 0) {
      listEl.innerHTML =
        '<div class="empty-inline">' +
        (state.transactions.length === 0
          ? "Belum ada transaksi dicatat. Mulai catat pengeluaranmu hari ini!"
          : "Tidak ada transaksi untuk filter ini.") +
        "</div>";
      return;
    }

    var html = "";
    sorted.forEach(function (t) {
      var icon = Data.CATEGORY_ICONS[t.category] || "📦";
      var sign = t.type === "income" ? "+" : "-";
      var descPart = t.description ? " · " + escapeHtml(t.description) : "";
      html +=
        '<div class="tx-item" data-id="' + t.id + '">' +
        '<div class="tx-icon ' + t.type + '">' + icon + "</div>" +
        '<div class="tx-detail">' +
        '<div class="tx-cat">' + escapeHtml(t.category) + "</div>" +
        '<div class="tx-meta">' + Calc.formatDateDisplay(t.date) + descPart + "</div>" +
        "</div>" +
        '<div class="tx-right">' +
        '<span class="tx-amount ' + t.type + '">' + sign + Calc.formatRupiah(t.amount).replace("-", "") + "</span>" +
        '<button class="tx-menu-btn" data-menu="' + t.id + '" aria-label="Opsi">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg>' +
        "</button>" +
        "</div>" +
        "</div>";
    });
    listEl.innerHTML = html;

    listEl.querySelectorAll(".tx-menu-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleTxMenu(btn);
      });
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  }

  // ==========================================================================
  // Menu konteks transaksi (Edit / Hapus)
  // ==========================================================================

  var openMenuEl = null;

  function toggleTxMenu(btn) {
    closeAnyOpenMenu();
    var id = btn.getAttribute("data-menu");
    var item = btn.closest(".tx-item");
    var popup = document.createElement("div");
    popup.className = "tx-actions-popup";
    popup.innerHTML =
      '<button data-action="edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>Edit</button>' +
      '<button data-action="delete" class="danger"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"/></svg>Hapus</button>';
    item.appendChild(popup);
    openMenuEl = popup;

    popup.querySelector('[data-action="edit"]').addEventListener("click", function (e) {
      e.stopPropagation();
      closeAnyOpenMenu();
      openEditForm(id);
    });
    popup.querySelector('[data-action="delete"]').addEventListener("click", function (e) {
      e.stopPropagation();
      closeAnyOpenMenu();
      openDeleteConfirm(id);
    });
  }

  function closeAnyOpenMenu() {
    if (openMenuEl && openMenuEl.parentNode) openMenuEl.parentNode.removeChild(openMenuEl);
    openMenuEl = null;
  }

  document.addEventListener("click", function () { closeAnyOpenMenu(); });

  // ==========================================================================
  // Toast
  // ==========================================================================

  var toastTimer = null;
  function showToast(msg) {
    var toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  // ==========================================================================
  // Form Tambah / Edit Transaksi
  // ==========================================================================

  var txOverlay = document.getElementById("txOverlay");
  var txForm = document.getElementById("txForm");
  var currentType = "expense";

  function populateCategorySelect() {
    var sel = document.getElementById("txCategory");
    sel.innerHTML = "";
    Data.CATEGORIES[currentType].forEach(function (cat) {
      var opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      sel.appendChild(opt);
    });
  }

  function setFormType(type) {
    currentType = type;
    document.querySelectorAll("#typeToggle button").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-type") === type);
    });
    document.getElementById("txSubmitBtn").classList.toggle("is-expense", type === "expense");
    populateCategorySelect();
  }

  document.querySelectorAll("#typeToggle button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setFormType(btn.getAttribute("data-type"));
    });
  });

  function clearFormErrors() {
    ["Amount", "Category", "Date"].forEach(function (f) {
      document.getElementById("err" + f).classList.remove("show");
      document.getElementById("tx" + f).closest(".field").classList.remove("has-error");
    });
  }

  function showFormErrors(errors) {
    if (errors.amount) {
      document.getElementById("errAmount").classList.add("show");
      document.getElementById("txAmount").closest(".field").classList.add("has-error");
    }
    if (errors.category) {
      document.getElementById("errCategory").classList.add("show");
      document.getElementById("txCategory").closest(".field").classList.add("has-error");
    }
    if (errors.date) {
      document.getElementById("errDate").classList.add("show");
      document.getElementById("txDate").closest(".field").classList.add("has-error");
    }
  }

  function openAddForm() {
    state.editingId = null;
    document.getElementById("txSheetTitle").textContent = "Tambah Transaksi";
    document.getElementById("txSubmitBtn").textContent = "Simpan Transaksi";
    txForm.reset();
    document.getElementById("txId").value = "";
    document.getElementById("txDate").value = Calc.todayStr();
    clearFormErrors();
    setFormType("expense");
    txOverlay.classList.add("open");
  }

  function openEditForm(id) {
    var tx = Tx.findTransaction(state.transactions, id);
    if (!tx) return;
    state.editingId = tx.id;
    document.getElementById("txSheetTitle").textContent = "Edit Transaksi";
    document.getElementById("txSubmitBtn").textContent = "Simpan Perubahan";
    clearFormErrors();
    setFormType(tx.type);
    document.getElementById("txId").value = tx.id;
    document.getElementById("txAmount").value = Calc.formatAmountThousands(tx.amount);
    document.getElementById("txCategory").value = tx.category;
    document.getElementById("txDate").value = tx.date;
    document.getElementById("txDesc").value = tx.description || "";
    txOverlay.classList.add("open");
  }

  function closeTxForm() {
    txOverlay.classList.remove("open");
  }

  document.getElementById("btnAdd").addEventListener("click", openAddForm);
  document.getElementById("txClose").addEventListener("click", closeTxForm);
  txOverlay.addEventListener("click", function (e) { if (e.target === txOverlay) closeTxForm(); });

  document.getElementById("txAmount").addEventListener("input", function () {
    this.value = Calc.formatAmountThousands(Calc.parseAmountInput(this.value));
  });

  txForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearFormErrors();

    var input = {
      type: currentType,
      amount: Calc.parseAmountInput(document.getElementById("txAmount").value),
      category: document.getElementById("txCategory").value,
      date: document.getElementById("txDate").value,
      description: document.getElementById("txDesc").value.trim()
    };

    var result = Tx.validate(input);
    if (!result.valid) {
      showFormErrors(result.errors);
      return;
    }

    if (state.editingId) {
      state.transactions = Tx.updateTransaction(state.transactions, state.editingId, input);
      showToast("Transaksi diperbarui.");
    } else {
      state.transactions = Tx.addTransaction(state.transactions, input);
      showToast(currentType === "income" ? "Uang masuk dicatat." : "Uang keluar dicatat.");
    }

    Storage.saveTransactions(state.transactions);
    closeTxForm();
    render();
  });

  // ==========================================================================
  // Konfirmasi Hapus
  // ==========================================================================

  var deleteOverlay = document.getElementById("deleteOverlay");

  function openDeleteConfirm(id) {
    state.deletingId = id;
    deleteOverlay.classList.add("open");
  }
  function closeDeleteConfirm() {
    deleteOverlay.classList.remove("open");
    state.deletingId = null;
  }

  document.getElementById("cancelDeleteBtn").addEventListener("click", closeDeleteConfirm);
  deleteOverlay.addEventListener("click", function (e) { if (e.target === deleteOverlay) closeDeleteConfirm(); });

  document.getElementById("confirmDeleteBtn").addEventListener("click", function () {
    if (state.deletingId == null) return;
    state.transactions = Tx.deleteTransaction(state.transactions, state.deletingId);
    Storage.saveTransactions(state.transactions);
    closeDeleteConfirm();
    render();
    showToast("Transaksi dihapus.");
  });

  // ==========================================================================
  // Budget Mingguan
  // ==========================================================================

  var budgetOverlay = document.getElementById("budgetOverlay");
  var budgetInput = document.getElementById("budgetInput");

  function openBudgetSheet() {
    budgetInput.value = state.budget ? Calc.formatAmountThousands(state.budget) : "";
    budgetOverlay.classList.add("open");
    setTimeout(function () { budgetInput.focus(); }, 50);
  }
  function closeBudgetSheet() {
    budgetOverlay.classList.remove("open");
  }

  document.getElementById("btnBudgetSettings").addEventListener("click", openBudgetSheet);
  document.getElementById("budgetClose").addEventListener("click", closeBudgetSheet);
  budgetOverlay.addEventListener("click", function (e) { if (e.target === budgetOverlay) closeBudgetSheet(); });

  budgetInput.addEventListener("input", function () {
    this.value = Calc.formatAmountThousands(Calc.parseAmountInput(this.value));
  });

  document.getElementById("budgetForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var val = Calc.parseAmountInput(budgetInput.value);
    if (val > 0) {
      state.budget = val;
      Storage.saveBudget(state.budget);
      render();
      closeBudgetSheet();
      showToast("Budget mingguan disimpan.");
    }
  });

  document.getElementById("btnResetData").addEventListener("click", function () {
    var confirmed = window.confirm("Reset semua data transaksi dan budget? Tindakan ini tidak bisa dibatalkan.");
    if (!confirmed) return;

    var cleared = Storage.clearAllData();
    if (!cleared) {
      showToast("Gagal reset data.");
      return;
    }

    state.transactions = [];
    state.budget = null;
    budgetInput.value = "";
    closeBudgetSheet();
    render();
    showToast("Semua data berhasil direset.");
  });

  // ==========================================================================
  // Filter Riwayat Transaksi
  // ==========================================================================

  document.getElementById("filterBar").addEventListener("click", function (e) {
    var btn = e.target.closest(".filter-chip");
    if (!btn) return;
    document.querySelectorAll(".filter-chip").forEach(function (c) { c.classList.remove("active"); });
    btn.classList.add("active");
    state.filter = btn.getAttribute("data-filter");
    renderTransactionList();
  });

  // ==========================================================================
  // Init
  // ==========================================================================

  function init() {
    state.transactions = Storage.loadTransactions();
    state.budget = Storage.loadBudget();
    populateCategorySelect();
    render();
  }

  init();
})();
