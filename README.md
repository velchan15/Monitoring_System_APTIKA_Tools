# Monitoring System — Dashboard Foundation (Tahap 1)

Dashboard shell untuk sistem monitoring aplikasi APTIKA, Diskominfo Jawa Barat.
Tahap ini **belum** terhubung ke backend — semua data di halaman berasal dari
`lib/dashboard-data.ts` (mock data).

## Penempatan project

Extract/salin isi folder ini ke:

```
D:\App\APTIKA\monitoring_system
```

## Cara menjalankan

Butuh Node.js 18.18+ atau 20+ terpasang.

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` — halaman dashboard akan langsung tampil (tidak
perlu login/API, sesuai scope tahap 1).

## Verifikasi build & lint

Sebelum dipakai, sudah diverifikasi jalan bersih:

```bash
npm run lint   # ✔ No ESLint warnings or errors
npm run build  # ✓ Compiled successfully
```

## Struktur project

```
app/
  layout.tsx          Root layout + metadata
  page.tsx             Komposisi halaman dashboard (state buka/tutup sidebar mobile)
  globals.css          Tailwind base + penghormatan prefers-reduced-motion
components/dashboard/
  MonitoringSidebar.tsx   Sidebar navigasi (Dashboard aktif, item lain placeholder)
  MonitoringHeader.tsx    Header: tanggal/waktu, status auto-refresh, notifikasi, operator
  StatusCard.tsx           Kartu status yang reusable untuk 5 metrik
lib/
  dashboard-data.ts    Mock data (metrik status, nav item, header) — TERPISAH dari UI
  utils.ts             Helper cn() gaya shadcn/ui (clsx + tailwind-merge)
```

## Catatan desain

- **Font**: font-stack didefinisikan langsung di `tailwind.config.ts`
  (`Plus Jakarta Sans` untuk teks UI, `IBM Plex Mono` untuk angka/data — dipakai
  kalau tersedia di sistem, fallback ke font sistem kalau tidak). Sengaja **tidak**
  memakai `next/font/google`, supaya `npm run build` tidak butuh akses internet ke
  Google Fonts — penting kalau build dijalankan di jaringan internal yang dibatasi.
  Kalau mau memakai font itu secara pasti (bukan fallback), tinggal install lewat
  `@font-face` dengan file font lokal, atau install `next/font/google` lagi kalau
  jaringan build-nya punya akses internet.
- **Warna status**: online = hijau, warning = kuning/amber, offline = merah,
  maintenance = ungu — dipertahankan sesuai konvensi umum dashboard monitoring
  supaya gampang dibaca sekilas.
- Tidak ada gambar/referensi desain yang ter-upload di percakapan ini, jadi
  tampilan (warna, tipografi, layout) dirancang dari nol berdasarkan brief teks —
  silakan sesuaikan token warna di `tailwind.config.ts` kalau mentor punya
  panduan visual (brand guideline) APTIKA/Diskominfo yang harus diikuti.

## Responsif

- **Layar lebar (≥ 1024px)**: sidebar persisten di kiri, 5 kartu status dalam satu
  baris.
- **3:4 dan lebih sempit (< 1024px)**: header jadi ringkas, sidebar tersembunyi di
  belakang tombol menu (drawer), kartu status reflow ke 1–2 kolom tanpa scroll
  horizontal.

## Tahap selanjutnya (di luar scope tahap 1 ini)

Chart, status donut, tabel insiden, daftar uptime, ringkasan per Perangkat
Daerah, autentikasi, koneksi API, polling data asli, dan notifikasi fungsional —
lihat dokumen rancangan backend untuk arah integrasinya.
