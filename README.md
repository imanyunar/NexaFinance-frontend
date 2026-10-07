# NexaFinance Frontend (React + Vite + TypeScript)

Aplikasi klien frontend terpisah untuk **NexaFinance Institutional Treasury**, dibangun menggunakan React 19, Vite, TypeScript, dan Lucide Icons dengan arsitektur SPA super ringan.

## 🚀 Fitur Utama
- **Ultra-Ringan & Cepat:** Build time < 2 detik, ukuran bundle ~95 KB gzipped.
- **Morgan Stanley Luxury Aesthetic:** Palet warna navy & blue corporate institutional.
- **Real-time Synchronization:** Terhubung langsung ke backend Next.js & Neon Cloud PostgreSQL (`https://nexafinance-alpha.vercel.app`).
- **Fitur Lengkap:**
  - 📊 **Dashboard Treasury:** 4 KPI Cards, Saldo Real-time, dan status WhatsApp bot.
  - 💳 **Rekening & Kas:** Manajemen multi-rekening (BCA, Kas Tunai, RDPU, SPAY).
  - 📜 **Buku Transaksi:** Pencarian, filter tipe (Pengeluaran, Pemasukan, Transfer), dan hapus data.
  - 🎯 **Batas Anggaran:** Indikator progress bar spending bulanan.
  - 🤖 **AI Advisor & RAG:** Chat konsultasi finansial cerdas.

---

## 📦 Push ke GitHub (Repository Terpisah)

1. Buat repository baru di GitHub dengan nama: `NexaFinance-frontend`
2. Jalankan perintah berikut di folder `frontend/`:
```bash
git remote add origin git@github.com:imanyunar/NexaFinance-frontend.git
git push -u origin main
```

---

## ⚡ Deploy ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **Add New...** ➔ **Project**
3. Import repository GitHub `NexaFinance-frontend`
4. Konfigurasi:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Tambahkan Environment Variable:
   - `VITE_API_BASE_URL` = `https://nexafinance-alpha.vercel.app`
6. Klik **Deploy**!
