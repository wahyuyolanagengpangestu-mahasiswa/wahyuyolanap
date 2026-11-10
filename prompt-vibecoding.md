# Prompt Vibecoding: Smart City SLA Tracker Kota Bandar Lampung

Dokumen ini berisi master prompt lengkap yang dirancang untuk mengarahkan AI coding assistant (Cursor, Windsurf, Claude Code, Antigravity, v0, Bolt) dalam membangun aplikasi secara komprehensif berdasarkan spesifikasi [PRD](file:///d:/23311017_Wahyu%20yolan%20ageng%20pangestu/23311017_Wahyu%20Yolan Ageng Pangestu_UTS_PPSI/prd.md) dan [Desain UI/UX](file:///d:/23311017_Wahyu%20yolan ageng pangestu/23311017_Wahyu%20Yolan Ageng Pangestu_UTS_PPSI/desain.md).

---

```markdown
# Role & Konteks Kerja
Bertindaklah sebagai Senior Full-Stack Web Architect dan UI/UX Designer spesialis sistem pemerintahan pintar (Smart City Enterprise). Bangun antarmuka dashboard operasional dan command center lengkap untuk platform:
"SLA Tracker Smart City Kota Bandar Lampung - Platform Pemantauan & Penanganan Aduan Fasilitas Umum Terpadu".

Aplikasi ini dikembangkan untuk proyek UTS Pengembangan Sistem Informasi oleh:
- Pengembang: Wahyu Yolan Ageng Pangestu (Informatika, Universitas Teknokrat Indonesia)
- Dosen Pengampu: Dr. Erliyan Redy Susanto, M.Kom
- Mitra: Pemerintah Kota Bandar Lampung

---

## 1. TECH STACK & ARSITEKTUR KODE
Gunakan stack modern yang clean, modular, dan berperforma tinggi:
- Frontend: React / Next.js (TypeScript) dengan Tailwind CSS
- Iconography: Lucide-React atau Material Symbols Outlined
- Tipografi Web Font: Plus Jakarta Sans (Headline & KPI), Inter (UI & Teks isi), JetBrains Mono (Telemetri, Jam, Koordinat, Timer SLA, ID Tiket)
- Simulasi Backend & Database: Simulasikan integrasi backend Rust (Axum + Tokio async) dan PostgreSQL + PostGIS dengan state management reaktif (misalnya React Context / Zustand / Hooks) tanpa hardcoded statis kaku.

---

## 2. DESIGN SYSTEM & DESIGN TOKENS (Sesuai desain.md)

### A. Palet Warna (Wajib Mengikuti Token Hex):
- Primary (Navy Utama): `#002046` (Header, tombol utama, navigasi aktif)
- Primary Container (Navy Medium): `#1B365D`
- Background & Surface: `#F8F9FF` (Latar utama aplikasi)
- Surface Lowest (Card/Panel): `#FFFFFF`
- Surface Low: `#EFF4FF`
- Surface Container: `#E5EEFF`
- Secondary / Tech Accent (Teal): `#006A6A` / Accent Glow: `#90EFEF` (Status online, telemetri, tren positif)
- Tertiary / Green (Verified & Selesai): `#002718` / Accent: `#4EDEA3`
- Error / Emergency (P0 Critical): `#BA1A1A` / Container: `#FFDAD6`
- Warning / High (P1 Amber): `#B45309` / Container: `#FEF3C7`
- Medium (P2 Biru): `#1D4ED8` / Container: `#DBEAFE`
- Low (P3 Slate/Abu): `#475569` / Container: `#F1F5F9`
- Main Text: `#0B1C30` | Secondary Text: `#44474E`
- Canvas Peta Spasial (Dark GIS Command Center): `#0F172A` atau `#1E293B`

### B. Karakter Visual:
- Gaya visual: Enterprise Government Command Center (bukan landing page marketing/SaaS dekoratif).
- Permukaan utama terang dan bersih, kontras tinggi. Area GIS Peta menggunakan kanvas gelap agar polygon kecamatan dan marker insiden menyala tajam.
- Shadow tipis profesional (`shadow-sm` / `shadow-md`), border radius 8px–12px (`rounded-lg` / `rounded-xl`).
- Micro-interactions: Animasi pulse halus hanya untuk marker P0 Emergency dan status live telemetry.

---

## 3. STRUKTUR LAYOUT & NAVIGASI

### A. Fixed Top Header (Tinggi: 80px)
1. Kiri: Co-branding resmi berdampingan:
   `[LOGO PEMKOT BANDAR LAMPUNG] + [LOGO UNIVERSITAS TEKNOKRAT INDONESIA]`
   Nama Platform: "SLA TRACKER SMART CITY" - Kota Bandar Lampung
2. Tengah/Kanan:
   - Status Engine: Badge hijau/teal dengan pulse "Rust Axum Async Engine: ONLINE"
   - Status DB: "PostGIS Spatial Engine: CONNECTED"
   - Jam WIB Real-time (JetBrains Mono): Format `HH:mm:ss WIB | DD MMMM YYYY`
   - Tombol Notifikasi (dengan badge merah jumlah eskalasi)
   - Profil Operator / Dispatcher Dinas

### B. Fixed Sidebar (Lebar: 256px)
Navigasi menu utama (dengan state aktif Navy `#002046` teks putih):
1. 📊 Dashboard Eksekutif (Overview KPI & Command Center)
2. 🗺️ Peta Spasial PostGIS (Peta GIS Interaktif & Inspector Hotspot)
3. ⚡ Stream Tiket & SLA (Live Feed Tiket dengan Timer Hitung Mundur)
4. 🏢 Kinerja OPD & Leaderboard (Evaluasi Kepatuhan SLA Dinas)
5. 🛡️ Laporan & Log Audit (Integritas, Audit Trail, & Ekspor Dokumen)

Bagian Bawah Sidebar:
- Widget "SLA System Health": Progress bar persentase kepatuhan global saat ini (target >= 90%).

### C. Footer Wajib (Mandatory Copyright)
Terpusat di bagian paling bawah setiap halaman:
`Copyright © 2026 by Wahyu Yolan Ageng Pangestu dan Dr. Erliyan Redy Susanto, M.Kom`

---

## 4. SPESIFIKASI MODUL & FITUR RINCI

### MODUL 1: DASHBOARD EKSEKUTIF (Executive View)
1. Top Status Command Strip:
   - Telemetri aktif, jumlah armada lapangan standby, dan tombol aksi darurat: `[+ Buat Aduan Darurat / Manual Dispatch]`.
2. 4 Kartu KPI Utama (Besar, font Plus Jakarta Sans, indikator tren):
   - Total Aduan Masuk (Bulan ini & Hari ini)
   - MTTA (Mean Time to Acknowledge): Target < 30 Menit (Baseline 24 jam)
   - MTTR (Mean Time to Resolve): Rata-rata durasi penyelesaian
   - Persentase Kepatuhan SLA: Target minimal >= 90% (tampilkan status Safe/Warning)
3. Quick Insight:
   - Mini breakdown kategori aduan terbanyak (Jalan Berlubang, PJU Padam, Sampah Liar, Saluran Air).
   - Widget Peringatan Dini: Tiket yang sisa waktunya < 20% (Perlu eskalasi segera).

### MODUL 2: PETA SPASIAL POSTGIS (Command Center GIS)
1. Kanvas Peta Gelap (`#0F172A`):
   - Representasi wilayah Kota Bandar Lampung (Kecamatan: Tanjung Karang Pusat, Teluk Betung, Kedaton, Way Halim, Sukarame, Rajabasa, dsb.).
   - Grid koordinat tipis (JetBrains Mono) dan batas polygon wilayah ber-outline teal/biru.
2. Marker Interaktif sesuai Matriks SLA:
   - P0 Kritis (Merah Berkedip / Glow Pulse): Darurat (PJU padam jalur utama, kabel putus, pohon tumbang).
   - P1 Tinggi (Amber): Jalan berlubang dalam >10 cm, traffic light padam.
   - P2 Sedang (Biru): Sampah liar, trotoar rusak.
   - P3 Rendah (Slate): Marka jalan pudar, rambu miring.
   - Status Selesai: Marker hijau terverifikasi.
3. Fitur PostGIS Deduplication Visualizer:
   - Tampilkan lingkaran radius buffer **15 meter (`ST_DWithin`)** saat titik aduan diklik untuk menunjukkan bagaimana sistem mendeteksi aduan berulang dari warga di lokasi berdekatan.
4. Panel Inspector Spasial (Floating / Side Panel):
   - Menampilkan detail titik yang dipilih: ID Tiket, Koordinat GPS, Alamat, Kategori AI, Sisa Waktu SLA, Foto Bukti, Petugas/Armada terdekat, dan Query log PostGIS simulasi (`ST_DWithin(geom, ST_MakePoint(...), 15)`).

### MODUL 3: STREAM TIKET & LIVE SLA COUNTDOWN (Operational Stream)
1. Filter & Search Bar:
   - Pencarian ID tiket, kata kunci lokasi, filter dropdown OPD (PUPR, Dishub, DLH, Pol PP, TRC), dan filter tingkat urgensi (P0 - P3).
2. Kartu Tiket Berurutan (Border kiri tebal berwarna sesuai prioritas):
   - Badge Urgensi (P0 Emergency / P1 High / P2 Medium / P3 Low)
   - ID Tiket (JetBrains Mono, misal `#TKT-BDL-2026-0842`)
   - Countdown Timer SLA (Live ticking mundur detik per detik menggunakan font JetBrains Mono).
     * Aturan Warna Timer: Hijau/Teal (Normal) -> Kuning (Sisa < 50%) -> Merah Berkedip (Sisa < 20% - Status ESKALASI KADIS).
   - Judul aduan, foto thumbnail, kecamatan/koordinat.
   - OPD Penanggung Jawab & Tim Lapangan yang ditugaskan.
   - Progress bar SLA Elapsed vs Remaining.
   - Tombol Aksi Cepat: `[Detail Tiket]`, `[Eskalasi Cepat]`, `[Disposisi Ulang]`, `[Update Status]`.

### MODUL 4: KINERJA OPD & LEADERBOARD (Performance Evaluation)
1. Leaderboard Table Dinas Teknis Kota Bandar Lampung:
   - Peringkat, Nama OPD (Dinas PUPR, Dinas Perhubungan, Dinas Lingkungan Hidup, BPBD / TRC).
   - Total Tiket Diterima, Tiket Selesai Tepat Waktu, Tiket Overdue / Breach.
   - MTTA Rata-rata & MTTR Rata-rata.
   - Skor CSAT (Kepuasan Warga) dalam bentuk persentase / bintang (Target > 85%).
   - Progress bar persentase kepatuhan SLA dinas.
   - Status: "Sangat Baik", "Memenuhi Target", atau "Perlu Evaluasi".
2. Grafik Analitik Komparasi:
   - Grafik batang perbandingan performa antar-dinas.
   - Grafik donut distribusi aduan berdasarkan kategori.

### MODUL 5: LAPORAN & AUDIT TRAIL (Governance & Integrity)
1. Filter Periode Tanggal, Kategori, dan Format Laporan.
2. Riwayat Log Audit (Immutable Simulation):
   - Timestamp (WIB), ID Transaksi / Hash SHA-256 (JetBrains Mono), Aktor (Sistem AI / Warga / Operator Dispatcher / Tim TRC), Tindakan, dan Status Integritas.
3. Tombol Ekspor Berkas:
   - `[Unduh Laporan PDF Eksekutif]`, `[Ekspor Data CSV/Excel]`, `[JSON Telemetri]`.

### MODUL 6: MODAL INTERAKTIF PELAPORAN BARU (Simulasi Modul Warga)
Buat modal interaktif ketika tombol `[+ Buat Aduan Baru]` diklik:
1. Input Nama Warga & NIK (tersamarkan/enkripsi info).
2. Simulasi Ambil Foto / Upload Gambar fasilitas rusak.
3. Fitur AI Auto-Categorization (Otomatis merekomendasikan kategori saat memilih foto/kondisi).
4. Auto Geolocation Tagging (Mengunci koordinat GPS otomatis di Bandar Lampung).
5. PostGIS Deduplication Checker: Jika lokasi berada dalam radius < 15 m dari aduan aktif lain, tampilkan banner peringatan: *"Aduan serupa terdeteksi di lokasi ini. Laporan Anda akan digabungkan ke Tiket Induk #TKT-BDL-xxxx guna efisiensi penanganan."*

---

## 5. ATURAN MATRIKS SLA (BUSINESS LOGIC PRECISE)
Pastikan logika hitung mundur dan penugasan mengacu pada tabel ini:
- P0 - Emergency: MTTA < 15 Menit | MTTR < 4 Jam | Penanggung Jawab: TRC / BPBD / Tim Cepat Dinas
- P1 - High: MTTA < 30 Menit | MTTR < 24 Jam | Penanggung Jawab: Dinas PUPR / Dinas Perhubungan
- P2 - Medium: MTTA < 2 Jam | MTTR < 48 Jam | Penanggung Jawab: Dinas LH / Dinas PUPR
- P3 - Low: MTTA < 4 Jam | MTTR < 7 Hari Kerja | Penanggung Jawab: Dinas Terkait
- Logika Eskalasi: Jika sisa waktu hitung mundur < 20%, ubah status menjadi `ESCALATED_TO_HEAD` (Peringatan Merah Terikirim ke Kepala Dinas).

---

## 6. KUALITAS IMPLEMENTASI & DATA SEEDING
1. Gunakan data dummy yang sangat realistis untuk Kota Bandar Lampung (Jalan Raden Intan, Jl. Z.A. Pagar Alam dekat Teknokrat, Teluk Betung, Jl. Teuku Umar, Bypass Soekarno-Hatta, dsb.).
2. Jangan menggunakan teks placeholder generik seperti "Lorem Ipsum", "Ticket 1", atau "Dinas ABC".
3. Pastikan layout sepenuhnya responsif: Tampilan Command Center optimal di desktop lebar (12 kolom), adaptif di tablet, dan rapi serta bisa di-scroll di mobile.
4. Setiap tombol interaktif harus memiliki state feedback (modal terbuka, filter berubah, timer berjalan, atau toast notifikasi sukses).
```

