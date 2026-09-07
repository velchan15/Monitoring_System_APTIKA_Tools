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

# Rancangan Backend v2 — Sistem Monitoring APTIKA Tools
### Stack: Node.js · Express.js · Prisma ORM · PostgreSQL · BullMQ+Redis · Playwright

---

## 0. Apa yang berubah dari rancangan v1 (Laravel)

Rancangan sebelumnya (`rancangan-backend-monitoring-aptika.md`) dibangun di atas Laravel/PHP/MySQL. Dokumen ini **menggantikan** rancangan itu, mengikuti stack dari dokumen "Rancangan Sistem Monitoring Aplikasi" yang kalian upload:

| | v1 (lama) | v2 (dokumen ini) |
|---|---|---|
| Bahasa/Framework | PHP / Laravel 11 | Node.js / Express.js |
| ORM | Eloquent | Prisma |
| Database | MySQL | PostgreSQL |
| Scheduler | Laravel Scheduler | node-cron (trigger) |
| Queue | Database queue driver | **BullMQ + Redis** |
| Auth | Laravel Sanctum | JWT (access + refresh token) |

Selain migrasi stack, dokumen ini juga menggabungkan **semua fitur baru** dari dokumen upgrade kalian — jadi ini bukan cuma "port", tapi juga upgrade konsep. Bagian yang murni konsep (state machine status, retry, rumus uptime, strategi SSRF) logikanya tetap sama seperti v1, cuma implementasinya dipindah ke Node/Prisma.

**Catatan:** dokumen v1 tetap saya biarkan ada sebagai referensi historis, tapi mulai sekarang **acuan utama adalah dokumen ini**.

---

## 1. Diagram Arsitektur

```mermaid
flowchart TB
    subgraph Client["Sisi Pengguna"]
        FE["Next.js Frontend<br/>(APTIKA Tools Dashboard)"]
    end

    subgraph Backend["Backend Monitoring (Node.js + Express)"]
        API["Express API<br/>(JWT Auth + RBAC per PD)"]
        CRON["node-cron<br/>(trigger tiap 1 menit)"]
        QUEUE["BullMQ<br/>(Redis-backed job queue)"]

        subgraph Workers["BullMQ Workers"]
            WHTTP["HTTP/HTTPS Checker"]
            WSSL["SSL Checker"]
            WDNS["DNS Checker"]
            WNOTIF["Notification Worker"]
        end

        subgraph PWContainer["Container Terpisah"]
            WPW["Playwright Worker<br/>(Node.js + Chromium)"]
        end

        WATCHDOG["Watchdog<br/>(cek scheduler_heartbeat)"]
    end

    DB[(PostgreSQL<br/>via Prisma)]
    CATALOG["Katalog Aplikasi<br/>Pemprov Jabar"]
    NODES["Monitoring Nodes<br/>(≥2 titik cek berbeda lokasi)"]
    TARGETS["Aplikasi yang Dipantau"]
    NOTIFCH["Telegram / Email"]

    FE <-->|"REST API (JSON)"| API
    API <--> DB
    CRON -->|"enqueue job per aplikasi jatuh tempo"| QUEUE
    QUEUE --> WHTTP
    QUEUE --> WSSL
    QUEUE --> WDNS
    QUEUE -->|"job khusus"| WPW
    QUEUE --> WNOTIF

    NODES -.->|"dijalankan dari"| WHTTP
    NODES -.->|"dijalankan dari"| WPW

    WHTTP -->|"cek endpoint"| TARGETS
    WSSL -->|"cek sertifikat"| TARGETS
    WDNS -->|"cek resolusi DNS"| TARGETS
    WPW -->|"cek via browser headless"| TARGETS

    WHTTP --> DB
    WSSL --> DB
    WDNS --> DB
    WPW --> DB
    WNOTIF --> NOTIFCH

    WATCHDOG -->|"heartbeat tiap tick"| DB
    API -->|"sinkronisasi berkala"| CATALOG
```

**Kenapa BullMQ + Redis, bukan cuma node-cron polos?** Ini persis catatan review di dokumen upgrade kalian: node-cron polos untuk 300+ aplikasi berisiko job saling tumpuk (terutama Playwright yang berat), dan kalau proses schedulernya mati, semua monitoring ikut diam-diam berhenti. Jadi pembagian tugasnya:
- **node-cron** cuma jadi "detak jantung" — tiap 1 menit dia query aplikasi mana yang jatuh tempo dicek, lalu **enqueue** job ke BullMQ. Dia sendiri tidak melakukan pengecekan.
- **BullMQ** yang benar-benar menjalankan job, dengan **concurrency limit** per queue (misal max 20 job HTTP paralel, max 3 job Playwright paralel karena berat) — jadi nggak saling tumpuk.
- **Watchdog** memantau tabel `scheduler_heartbeat`: kalau `last_heartbeat_at` nggak update lebih dari, misalnya, 3 menit, berarti proses cron-nya mati, dan ini yang memicu alert terpisah (bukan lewat jalur notifikasi insiden biasa, karena kalau scheduler mati, jalur itu juga ikut mati).

---

## 2. Pembagian Tanggung Jawab

| Komponen | Tanggung Jawab |
|---|---|
| **Frontend Next.js** | Dashboard, form aplikasi, grafik. Murni consumer API, sama seperti v1. |
| **Express API** | REST endpoint, autentikasi JWT, RBAC berbasis `department_id`, agregasi dashboard. |
| **node-cron** | Trigger periodik, query `applications`/`monitoring_nodes` yang jatuh tempo, enqueue job ke BullMQ. Update `scheduler_heartbeat` di setiap tick. |
| **BullMQ + Redis** | Job queue dengan concurrency limit per tipe checker, retry job level-queue (terpisah dari retry level-aplikasi di bagian 7). |
| **HTTP/SSL/DNS Checker Worker** | Proses job dari queue, jalan sebagai proses Node terpisah dari API (`node worker.js`), bisa di-scale independen. |
| **Playwright Worker** | Container terpisah (image beda, butuh Chromium) — sama seperti v1, alasan pemisahannya sama: SPA/login check itu berat, jangan sampai ganggu checker ringan. |
| **Watchdog** | Proses ringan (bisa jadi bagian dari container `api` atau container sendiri) yang query `scheduler_heartbeat` tiap beberapa menit, kirim alert kalau stale. |
| **PostgreSQL (via Prisma)** | Satu database untuk semua data — aplikasi, log monitoring, insiden, RBAC, retensi. |
| **Monitoring Nodes** | Bukan komponen software baru, tapi **konsep deployment**: worker checker yang sama dijalankan dari ≥2 lokasi/jaringan berbeda (misal on-prem Diskominfo + VPS cloud), masing-masing terdaftar sebagai baris di `monitoring_nodes`. |
| **Notifikasi** | Worker terpisah, kirim ke Telegram (Bot API) dan Email. |

---

## 3. Alur End-to-End

```mermaid
sequenceDiagram
    participant Admin as Admin (Frontend)
    participant API as Express API
    participant DB as PostgreSQL
    participant CRON as node-cron
    participant Q as BullMQ
    participant W as Checker Worker (≥2 node)
    participant Target as Aplikasi Target

    Admin->>API: POST /api/applications
    API->>API: Validasi URL (anti-SSRF)
    API->>DB: Simpan applications (Prisma)
    API-->>Admin: 201 Created

    loop Tiap 1 menit
        CRON->>DB: Query applications jatuh tempo
        CRON->>DB: Update scheduler_heartbeat
        CRON->>Q: Enqueue CheckJob per aplikasi × per node aktif
    end

    Q->>W: Ambil job (concurrency limit)
    W->>Target: Cek dari node A
    W->>Target: Cek dari node B
    Target-->>W: Response (2 node)
    W->>DB: Simpan monitoring_logs (per node, dengan node_id)
    W->>W: Hitung confidence_score (agreement antar node)
    W->>DB: Update status aplikasi jika threshold + quorum terpenuhi

    alt Status jadi Offline DAN bukan window maintenance
        W->>DB: Buat incidents (is_suppressed = false)
        W->>Q: Enqueue NotificationJob
        Q->>W: Kirim ke Telegram/Email
    else Status jadi Offline TAPI dalam window maintenance
        W->>DB: Buat incidents (is_suppressed = true) — TANPA notifikasi
    end

    Admin->>API: GET /api/dashboard/summary
    API->>DB: Query (scoped ke department_id user)
    API-->>Admin: JSON ringkasan
```

---

## 4. Skema Database (ERD v2 — 14 tabel)

Ini mengikuti persis 14 tabel dari dokumen upgrade kalian, saya jelaskan lagi fungsinya dan sekalian saya isi bagian yang belum eksplisit (terutama rumus `confidence_score`/`health_score`, yang di dokumen aslinya cuma didefinisikan sebagai kolom tanpa rumus — ini **asumsi saya**, tandai kalau mau diubah).

```mermaid
erDiagram
    DEPARTMENTS ||--o{ APPLICATIONS : "memiliki"
    DEPARTMENTS ||--o{ USERS : "menaungi"
    APPLICATIONS ||--o{ MONITORING_LOGS : "dipantau"
    APPLICATIONS ||--o{ MAINTENANCE_SCHEDULE : "dijadwalkan"
    APPLICATIONS ||--o{ INCIDENTS : "mengalami"
    APPLICATIONS ||--o{ UPTIME_DAILY_SUMMARY : "diringkas"
    MONITORING_NODES ||--o{ MONITORING_LOGS : "mengecek dari"
    MONITORING_LOGS ||--o{ SCREENSHOTS : "melampirkan"
    MAINTENANCE_SCHEDULE ||--o{ INCIDENTS : "meredam"
    INCIDENTS ||--o{ NOTIFICATIONS : "memicu"
    ROLES ||--o{ USERS : "memberi akses"
    USERS ||--o{ AUDIT_LOGS : "tercatat di"
```

| Tabel | Kolom utama | Fungsi |
|---|---|---|
| **departments** | `id`, `code` (UK), `name` | Perangkat Daerah — dasar pengelompokan & RBAC. |
| **applications** | `id`, `department_id` FK, `name`, `url`, `monitoring_type` (enum: http/spa/api/graphql), `keyword`, `priority`, `interval_seconds`, `is_active`, `show_on_status_page` | Entitas inti aplikasi yang dipantau. `monitoring_type` menentukan apakah Playwright dipicu (khusus `spa`) — sesuai poin 7 catatan review. |
| **monitoring_nodes** *(baru)* | `id`, `name`, `region`, `is_active` | Titik/lokasi pengecekan. Worker checker daftar diri sebagai satu baris di sini saat start. |
| **monitoring_logs** | `id`, `application_id` FK, `node_id` FK, `checked_at`, `http_status`, `response_time_ms`, `ssl_days`, `dns_status`, `redirect_url`, `confidence_score`, `health_score`, `message` | Log mentah tiap cek, per node. **Ini tabel yang paling cepat besar** — retensinya diatur lewat `data_retention_policy`, bukan hardcode. |
| **screenshots** | `id`, `monitoring_log_id` FK, `file_path` | Hanya diisi saat status tidak normal (hasil dari Playwright), bukan tiap cek — biar storage nggak boros. |
| **uptime_daily_summary** *(baru)* | `id`, `application_id` FK, `summary_date`, `total_checks`, `total_up`, `total_down`, `excluded_maintenance_minutes`, `uptime_percentage` | Agregat harian permanen (retensi log mentah pendek, tapi ringkasan ini disimpan terus). `excluded_maintenance_minutes` menjawab pertanyaan "downtime saat maintenance dihitung atau nggak" — **dikecualikan**, dicatat terpisah biar tetap transparan. |
| **maintenance_schedule** | `id`, `application_id` FK, `start_time`, `end_time`, `description` | Jadwal maintenance terencana. |
| **incidents** | `id`, `application_id` FK, `monitoring_log_id` FK, `maintenance_schedule_id` FK, `title`, `status`, `is_suppressed`, `opened_at`, `resolved_at`, `duration_minutes` | Episode gangguan. `is_suppressed = true` kalau `opened_at` jatuh di dalam window `maintenance_schedule` terkait — tetap dicatat untuk histori, tapi tidak memicu notifikasi. |
| **notifications** | `id`, `incident_id` FK, `channel` (enum: telegram/email), `recipient`, `message`, `sent_at`, `status` | Log pengiriman notifikasi. |
| **roles** | `id`, `name` (UK), `description` | Definisi peran (`admin`, `operator_pd`, `pimpinan`, dst). |
| **users** | `id`, `role_id` FK, `department_id` FK, `name`, `email` (UK), `username` (UK), `password` | `department_id` di sini yang jadi dasar RBAC — operator PD cuma lihat aplikasi `department_id` miliknya, `pimpinan`/`admin` lihat semua (lihat bagian 12). |
| **audit_logs** | `id`, `user_id` FK, `action`, `table_name`, `old_value`, `new_value` | Jejak audit tiap perubahan data penting. |
| **scheduler_heartbeat** *(baru)* | `id`, `worker_name`, `last_heartbeat_at`, `status` | Watchdog data — lihat bagian 1. |
| **data_retention_policy** *(baru)* | `id`, `table_name`, `retention_days` | Konfigurasi retensi per tabel, dibaca oleh job pruning, bisa diubah dari dashboard tanpa deploy ulang kode. |

### Asumsi saya soal `confidence_score` & `health_score` (belum dirumuskan di dokumen aslinya)

- **`health_score`** (0–100, per baris `monitoring_logs`): skor komposit dari satu kali cek — kombinasi bobot dari (a) status code sesuai ekspektasi, (b) response time relatif terhadap ambang batas aplikasi, (c) keyword validation lolos/tidak, (d) SSL masih valid. Dipakai untuk bedain "online tapi lambat" vs "online sehat" di Dashboard Pimpinan — bukan buat nentuin online/offline (itu tetap dari `consecutive_failures`, lihat bagian 7).
- **`confidence_score`** (0–1, per window cek): rasio berapa persen `monitoring_nodes` aktif yang sepakat aplikasi ini down, dalam window cek yang sama. Dipakai khusus untuk **finalisasi status Offline** — supaya kalau cuma 1 dari 2 node bilang down, sistem nggak buru-buru menyatakan aplikasi itu benar-benar offline (bisa jadi cuma gangguan jaringan di sisi node itu, bukan di aplikasi target). Lihat bagian 7 untuk detail quorum-nya.

Kalau kalian sudah punya rumus sendiri dari sumber dokumen itu (mungkin ada di bagian yang nggak ke-capture waktu saya ekstrak teksnya), kasih tau — saya sesuaikan.

### Contoh model Prisma (satu tabel, sebagai referensi sintaks)

```prisma
model MonitoringLog {
  id              BigInt   @id @default(autoincrement())
  applicationId   BigInt   @map("application_id")
  nodeId          BigInt   @map("node_id")
  checkedAt       DateTime @map("checked_at")
  httpStatus      Int?     @map("http_status")
  responseTimeMs  Int?     @map("response_time_ms")
  sslDays         Int?     @map("ssl_days")
  dnsStatus       DnsStatus @map("dns_status")
  redirectUrl     String?  @map("redirect_url") @db.VarChar(500)
  confidenceScore Decimal? @map("confidence_score") @db.Decimal(4, 3)
  healthScore     Decimal? @map("health_score") @db.Decimal(5, 2)
  message         String?
  createdAt       DateTime @default(now()) @map("created_at")

  application Application @relation(fields: [applicationId], references: [id])
  node        MonitoringNode @relation(fields: [nodeId], references: [id])
  screenshots Screenshot[]

  @@index([applicationId, checkedAt])
  @@map("monitoring_logs")
}
```

---

## 5. Daftar API Endpoint

| Method | Path | Tujuan | Akses |
|---|---|---|---|
| POST | `/api/auth/login` | Login, terbitkan access + refresh token (JWT) | Publik |
| POST | `/api/auth/refresh` | Refresh access token | Autentikasi (refresh token) |
| GET | `/api/applications` | Daftar aplikasi + status terkini | Scoped `department_id`, kecuali `admin`/`pimpinan` |
| POST | `/api/applications` | Daftarkan aplikasi baru | `admin` |
| GET | `/api/applications/:id/history` | Riwayat uptime (`range=24h/7d/30d`) | Scoped |
| GET | `/api/applications/:id/incidents` | Insiden aplikasi tsb | Scoped |
| GET | `/api/incidents` | Semua insiden (filter `status`, `is_suppressed`) | Scoped |
| GET | `/api/dashboard/summary` | Ringkasan dashboard utama | Scoped |
| GET | `/api/dashboard/departments` | Rekap per Perangkat Daerah | `admin`/`pimpinan` (semua PD); operator PD cuma lihat baris PD-nya |
| GET | `/api/dashboard/leadership` | **Baru** — data Dashboard Pimpinan: % online, tren gangguan, top 10 aplikasi paling sering gangguan, PD dengan gangguan terbanyak | `pimpinan`/`admin` saja |
| GET | `/api/status-page` | **Baru** — data status publik (hanya aplikasi `show_on_status_page = true`) | Publik, tanpa auth |
| GET | `/api/nodes` | Daftar monitoring node + status aktif | `admin` |
| GET | `/api/system/heartbeat` | Status kesehatan scheduler (untuk watchdog eksternal) | `admin`, atau token khusus monitoring internal |
| GET | `/api/retention-policies` | Lihat/atur retensi per tabel | `admin` |
| POST | `/api/sync/catalog` | Trigger sinkronisasi Katalog Aplikasi | `admin` |
| POST | `/api/maintenance-schedules` | Jadwalkan maintenance window | `admin`/`operator_pd` (scoped) |

---

## 6–9. Status, Retry, Uptime, Retensi

Logikanya **tetap sama seperti v1** (state machine online/warning/offline/maintenance, `consecutive_failures`/`consecutive_successes`, rumus uptime = checks sukses / total checks), cuma dua hal yang berubah:

1. **Finalisasi Offline sekarang butuh quorum antar node**, bukan cuma 1 hasil cek:
   ```js
   // pseudocode, jalan di checker worker setelah semua node selesai cek di window yang sama
   const nodeResults = await getResultsForWindow(applicationId, checkedAt);
   const downCount = nodeResults.filter(r => !r.isSuccess).length;
   const confidenceScore = downCount / nodeResults.length;

   if (confidenceScore >= 0.5) {
     // mayoritas node sepakat down → lanjut ke logic consecutive_failures seperti biasa
   } else {
     // minoritas node bilang down → kemungkinan gangguan lokal node itu, jangan naikkan consecutive_failures
     await logNodeDisagreement(applicationId, nodeResults);
   }
   ```
   Ini cuma jalan kalau `monitoring_nodes` aktif ≥ 2. Kalau baru ada 1 node (tahap awal), sistem fallback ke logika v1 biasa (1 hasil cek = langsung dipakai).

2. **Retensi baca dari `data_retention_policy`**, bukan angka hardcode:
   ```js
   const policy = await prisma.dataRetentionPolicy.findUnique({
     where: { tableName: 'monitoring_logs' },
   });
   const cutoff = subDays(new Date(), policy?.retentionDays ?? 30);
   await prisma.monitoringLog.deleteMany({ where: { checkedAt: { lt: cutoff } } });
   ```

3. **Maintenance suppression** — sebelum bikin `incidents`, cek dulu:
   ```js
   const activeMaintenance = await prisma.maintenanceSchedule.findFirst({
     where: {
       applicationId,
       startTime: { lte: now },
       endTime: { gte: now },
     },
   });

   await prisma.incident.create({
     data: {
       applicationId,
       isSuppressed: !!activeMaintenance,
       maintenanceScheduleId: activeMaintenance?.id ?? null,
       // ...
     },
   });

   if (!activeMaintenance) {
     await notificationQueue.add('send-incident-alert', { incidentId });
   }
   ```

---

## 10. Integrasi Katalog Aplikasi

Sama seperti v1 secara konsep (pola adapter, sinkronisasi tidak menghapus otomatis) — bedanya cuma implementasi:

```
src/services/catalog-sync/
├── catalog-source.interface.js
├── aptika-api-catalog-source.js
└── manual-catalog-source.js
```

---

## 11. Docker Compose

```yaml
services:
  api:
    build: ./docker/node
    command: ["node", "src/server.js"]
    volumes: ["./backend:/app"]
    depends_on: [postgres, redis]
    ports: ["3001:3001"]

  scheduler:
    build: ./docker/node
    command: ["node", "src/scheduler.js"]
    volumes: ["./backend:/app"]
    depends_on: [postgres, redis]

  worker-checks:
    build: ./docker/node
    command: ["node", "src/workers/checks-worker.js"]
    volumes: ["./backend:/app"]
    depends_on: [postgres, redis]
    deploy:
      replicas: 2

  worker-playwright:
    build: ./docker/playwright
    volumes: ["./playwright-worker:/app"]
    depends_on: [postgres, redis]
    command: ["node", "worker.js"]

  watchdog:
    build: ./docker/node
    command: ["node", "src/watchdog.js"]
    depends_on: [postgres]

  nginx:
    image: nginx:alpine
    ports: ["8080:80"]
    volumes: ["./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf"]
    depends_on: [api]

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=monitoring
    volumes: ["pg_data:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine

volumes:
  pg_data:
```

---

## 12. Keamanan

**Anti-SSRF** — logikanya identik dengan v1 (blokir skema selain http/https, resolve+cek IP privat sebelum request, validasi ulang di worker karena DNS bisa berubah, batasi redirect, timeout ketat), cuma library-nya beda: di Node pakai kombinasi `dns.lookup()` manual + custom `axios` interceptor untuk cek IP sebelum request jalan (karena `axios` sendiri tidak otomatis mencegah ini).

**Auth (JWT)** — access token umur pendek (15 menit), refresh token umur panjang (7 hari) disimpan sebagai httpOnly cookie. Middleware Express memverifikasi token dan melampirkan `req.user` (termasuk `role` dan `department_id`).

**RBAC per Perangkat Daerah** — middleware tambahan setelah auth:
```js
function scopeToDepartment(req, res, next) {
  if (['admin', 'pimpinan'].includes(req.user.role)) return next(); // lihat semua
  req.query.department_id = req.user.department_id; // paksa scope
  next();
}
```
Diterapkan di semua route yang mengembalikan data aplikasi/insiden.

---

## 13. Strategi Testing

| Lapisan | Pendekatan |
|---|---|
| Checker | Jest + mock `axios` (`axios-mock-adapter`) |
| State machine + quorum | Jest murni, seed berbagai kombinasi hasil multi-node |
| API | Jest + Supertest, termasuk test RBAC (user PD A tidak boleh lihat data PD B) |
| Prisma queries | Test terhadap PostgreSQL test database (via `docker-compose.test.yml`), bukan mock — supaya query kompleks (agregasi uptime) benar-benar tervalidasi |
| Watchdog | Simulasikan `scheduler_heartbeat` stale, pastikan alert terpicu |

---

## 14. Roadmap

**MVP**
- `departments`, `applications`, `monitoring_nodes` (boleh mulai dari 1 node dulu), `monitoring_logs`, `incidents`
- Checker HTTP saja, node-cron + BullMQ dasar (tanpa multi-node quorum dulu)
- State machine online/offline, retry dasar
- Auth JWT + RBAC dasar (`department_id` scoping)
- Notifikasi Telegram

**Tahap Kedua**
- SSL & DNS checker
- `uptime_daily_summary` + `data_retention_policy` + job pruning
- `scheduler_heartbeat` + watchdog
- Maintenance suppression (`is_suppressed`)
- Dashboard per Perangkat Daerah

**Fitur Lanjutan**
- Playwright worker + `monitoring_type = spa`
- Multi-vantage-point quorum (node ke-2 aktif)
- Dashboard Pimpinan
- Status page publik (`show_on_status_page`)
- `health_score`/`confidence_score` lengkap dengan pembobotan final

---

## 15. Struktur Folder

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── server.js                 # entry point Express API
│   ├── scheduler.js               # entry point node-cron
│   ├── watchdog.js
│   ├── routes/
│   │   ├── applications.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── incidents.routes.js
│   │   ├── status-page.routes.js
│   │   └── auth.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── scope-department.middleware.js
│   ├── workers/
│   │   ├── checks-worker.js
│   │   └── notification-worker.js
│   ├── services/
│   │   ├── monitoring/
│   │   │   ├── checkers/
│   │   │   │   ├── http-checker.js
│   │   │   │   ├── ssl-checker.js
│   │   │   │   └── dns-checker.js
│   │   │   ├── status-evaluator.js
│   │   │   └── url-safety-validator.js
│   │   └── catalog-sync/
│   └── queues/
│       └── bullmq.config.js
└── package.json

playwright-worker/
├── worker.js
└── package.json
```

---

## 16. Checklist Implementasi

1. [ ] Setup project Node.js + Express + Prisma, `docker-compose.yml` dasar (api, postgres, redis)
2. [ ] `schema.prisma` untuk 14 tabel, `npx prisma migrate dev`
3. [ ] `url-safety-validator.js` (anti-SSRF) + test — sebelum endpoint pendaftaran dibuka
4. [ ] Auth JWT + middleware RBAC (`department_id` scoping)
5. [ ] Endpoint CRUD `applications`
6. [ ] `http-checker.js` + BullMQ worker dasar (1 node dulu)
7. [ ] `status-evaluator.js` (consecutive failures/successes)
8. [ ] `scheduler.js` (node-cron) + `scheduler_heartbeat`
9. [ ] Logic `incidents` + maintenance suppression
10. [ ] Notifikasi Telegram/Email
11. [ ] `dashboard/summary` endpoint → **integrasi ke frontend Next.js yang sudah ada**
12. [ ] SSL & DNS checker
13. [ ] `uptime_daily_summary` + `data_retention_policy` + job pruning terjadwal
14. [ ] Watchdog terpisah + alert kalau heartbeat stale
15. [ ] Playwright worker + trigger `monitoring_type = spa`
16. [ ] Node kedua aktif + logic quorum `confidence_score`
17. [ ] Dashboard Pimpinan + status page publik

---

## Backend MVP lokal

Implementasi fondasi backend berada di [backend/README.md](backend/README.md). Backend menggunakan Express, Prisma dengan PostgreSQL, serta BullMQ dengan Redis Laragon. Belum ada Docker Compose karena lingkungan pengembangan ini menjalankan layanan secara lokal.
