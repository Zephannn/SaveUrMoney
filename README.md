# SaveUrMoney

> "Know where your money goes."

Website pencatatan keuangan pribadi sederhana. Mencatat uang masuk dan
uang keluar, mengelompokkan pengeluaran berdasarkan kategori, dan
menampilkan kondisi keuangan mingguan terhadap budget yang kamu tentukan
sendiri.

Static web application — tanpa backend, tanpa database. Semua data
tersimpan di **browser localStorage**.

## Fitur

- Catat uang masuk & uang keluar (nominal, kategori, tanggal, keterangan)
- Edit dan hapus transaksi (dengan konfirmasi sebelum hapus)
- Ringkasan saldo, total pemasukan, dan total pengeluaran — real-time
- Budget mingguan dengan progress bar dan status otomatis:
  - 0–60% terpakai → **Hemat**
  - 61–80% → **Normal**
  - 81–100% → **Boros**
  - \>100% → **Melebihi Budget**
- Analisis pengeluaran per kategori untuk minggu berjalan
- Riwayat transaksi dengan filter (Semua / Masuk / Keluar)
- Format Rupiah otomatis, responsive (mobile → tablet → desktop)

## Struktur Proyek

```
saveUrMoney/
├── index.html
├── assets/
│   ├── css/
│   │   ├── style.css        # Warna, tipografi, layout, komponen UI
│   │   └── responsive.css   # Breakpoint tablet & desktop
│   ├── js/
│   │   ├── storage.js       # Baca/tulis localStorage
│   │   ├── calculator.js    # Perhitungan keuangan & formatting
│   │   ├── transaction.js   # Logic tambah/ubah/hapus transaksi
│   │   └── app.js           # Rendering DOM & event handling
│   └── icons/
├── data/
│   └── categories.js        # Daftar kategori & ikon
├── README.md
└── .gitignore
```

Urutan `<script>` di `index.html` penting — setiap modul menaruh dirinya
di `window`, dan modul sesudahnya bergantung pada modul sebelumnya:

```
categories.js → storage.js → calculator.js → transaction.js → app.js
```

## Menjalankan secara lokal

Tidak butuh build step atau `npm install`. Buka langsung dengan live
server apa pun, misalnya:

```bash
npx serve .
# atau
python3 -m http.server 8080
```

Lalu buka `http://localhost:8080` (sesuaikan port).

> Membuka `index.html` langsung lewat `file://` juga bisa, tapi sebagian
> browser membatasi beberapa API saat diakses tanpa server lokal — jadi
> live server lebih disarankan.

## Deploy

Karena murni static site, tinggal push repo ini dan hubungkan ke:

- **GitHub Pages** — Settings → Pages → branch `main`, folder `/root`
- **Vercel** — import repo, tidak perlu konfigurasi build command apa pun

## Struktur Data (localStorage)

```json
[
  {
    "id": 1758262345000,
    "type": "expense",
    "category": "Hiburan",
    "amount": 20000,
    "date": "2026-09-19",
    "description": "Warnet"
  }
]
```

Disimpan di key `saveurmoney_transactions`. Budget mingguan disimpan
terpisah di key `saveurmoney_weekly_budget`.

## Batasan

- Data hanya tersimpan di browser/perangkat yang dipakai. Tidak ada
  sinkronisasi antar perangkat (sesuai scope produk).
- Menghapus data browser (cache/localStorage) akan menghapus seluruh
  riwayat transaksi.

## Pengembangan Selanjutnya

Lihat bagian *Future Development* di PRD: grafik visual, filter
lanjutan, export/import data, dark/light toggle, kategori kustom,
statistik bulanan, dan dukungan PWA/offline.

Made by meh and my Hb(claude)