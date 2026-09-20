/* ==========================================================================
   saveUrMoney — data/categories.js
   Daftar kategori transaksi (default) dan ikon yang mewakilinya.
   Diekspos lewat window.SaveUrMoneyData agar bisa dipakai modul lain
   tanpa module bundler (dimuat sebagai <script> biasa, urutan penting).
   ========================================================================== */

(function (global) {
  "use strict";

  var CATEGORIES = {
    expense: [
      "Makan",
      "Jajan",
      "Transportasi",
      "Listrik",
      "Kuliah",
      "Hiburan",
      "Keluarga",
      "Belanja",
      "Kesehatan",
      "Lainnya"
    ],
    income: [
      "Uang Saku",
      "Gaji",
      "Freelance",
      "Hadiah",
      "Lainnya"
    ]
  };

  var CATEGORY_ICONS = {
    "Makan": "🍔",
    "Jajan": "🍪",
    "Transportasi": "🚌",
    "Listrik": "💡",
    "Kuliah": "🎓",
    "Hiburan": "🎮",
    "Keluarga": "👪",
    "Belanja": "🛍️",
    "Kesehatan": "💊",
    "Lainnya": "📦",
    "Uang Saku": "👛",
    "Gaji": "💼",
    "Freelance": "💻",
    "Hadiah": "🎁"
  };

  // Warna bar untuk grafik "Kategori Pengeluaran" (urut dari terbesar)
  var CATEGORY_BAR_COLORS = [
    "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#A78BFA",
    "#F472B6", "#38BDF8", "#FBBF24", "#34D399", "#94A3B8"
  ];

  global.SaveUrMoneyData = {
    CATEGORIES: CATEGORIES,
    CATEGORY_ICONS: CATEGORY_ICONS,
    CATEGORY_BAR_COLORS: CATEGORY_BAR_COLORS
  };
})(window);
