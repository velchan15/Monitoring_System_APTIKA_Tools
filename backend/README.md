# Backend MVP — Monitoring System APTIKA

Backend ini berdiri terpisah dari frontend Next.js di root repository. Tahap ini menyediakan fondasi Express, schema PostgreSQL melalui Prisma, serta antrean BullMQ yang menggunakan Redis. Belum ada autentikasi, API aplikasi, scheduler, atau HTTP checker.

## Prasyarat lokal

- Node.js 20 atau lebih baru.
- PostgreSQL yang berjalan pada `127.0.0.1:5432`.
- Redis Laragon yang berjalan pada `127.0.0.1:6379`.

Redis sudah tersedia pada instalasi Laragon komputer ini. Mulai server dan verifikasi dengan PowerShell:

```powershell
Start-Process -FilePath 'C:\laragon\bin\redis\redis-x64-5.0.14.1\redis-server.exe' -WindowStyle Hidden
& 'C:\laragon\bin\redis\redis-x64-5.0.14.1\redis-cli.exe' ping
```

Perintah kedua harus menghasilkan `PONG`.

PostgreSQL belum terpasang pada komputer ini. Instal PostgreSQL untuk Windows terlebih dahulu, lalu gunakan `psql.exe` dari folder `bin` instalasi PostgreSQL untuk membuat role dan database. Ganti nilai password contoh sebelum menjalankannya.

```powershell
$pgBin = 'C:\Program Files\PostgreSQL\16\bin'
& "$pgBin\psql.exe" -U postgres -c "CREATE ROLE monitoring WITH LOGIN PASSWORD 'ganti-dengan-password-kuat';"
& "$pgBin\psql.exe" -U postgres -c "CREATE DATABASE monitoring OWNER monitoring;"
```

Jika versi PostgreSQL berbeda, ubah `16` pada `$pgBin` sesuai folder yang terpasang.

## Konfigurasi dan menjalankan API

1. Salin konfigurasi lokal dan ubah password pada `DATABASE_URL` agar sama dengan role PostgreSQL.

   ```powershell
   Copy-Item .env.example .env
   ```

2. Pasang dependency dan hasilkan Prisma Client.

   ```powershell
   npm install
   npm run prisma:generate
   ```

3. Buat seluruh tabel dari schema Prisma.

   ```powershell
   npm run prisma:migrate -- --name init
   ```

4. Jalankan API.

   ```powershell
   npm run dev
   ```

API mendengarkan pada `http://127.0.0.1:3001` secara default.

## Pemeriksaan kesehatan

```powershell
Invoke-RestMethod http://127.0.0.1:3001/api/health/live
Invoke-RestMethod http://127.0.0.1:3001/api/health/ready
```

`/api/health/live` hanya membuktikan proses Express berjalan:

```json
{ "service": "monitoring-api", "status": "ok" }
```

`/api/health/ready` memeriksa PostgreSQL (`SELECT 1`) dan Redis (`PING`) secara nyata. Saat keduanya aktif, responsnya HTTP 200 dengan `database` dan `redis` bernilai `ok`. Jika salah satu belum berjalan, endpoint merespons HTTP 503 serta menandai hanya dependensi yang gagal sebagai `error`.

## Validasi tanpa layanan lokal

```powershell
npm test
npm run prisma:validate
```

Test unit tidak membutuhkan PostgreSQL atau Redis aktif. Migrasi dan `/api/health/ready` baru membutuhkan kedua layanan tersebut.
