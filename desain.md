---
name: smart-city-sla-dashboard-design
description: Panduan desain UI/UX untuk dashboard eksekutif SLA Tracker Smart City dengan visual enterprise-government, pemantauan real-time, peta GIS, tiket aduan, kinerja OPD, dan audit.
---

# Skill Desain: Smart City SLA Tracker Dashboard

## 1. Tujuan Skill

Gunakan skill ini saat merancang atau mengembangkan antarmuka dashboard **SLA Tracker Smart City Kota Bandar Lampung** atau produk dashboard operasional pemerintahan dengan karakteristik serupa.

Hasil desain harus terasa:
- Profesional, kredibel, dan cocok untuk lingkungan pemerintahan.
- Informatif dan padat data, tetapi tetap mudah dipindai.
- Berorientasi pada pemantauan operasional dan pengambilan keputusan.
- Modern dengan nuansa command center, tanpa menjadikan seluruh halaman gelap.
- Konsisten antarhalaman dan responsif pada berbagai ukuran layar.

## 2. Karakter Visual

**Arah desain:** Enterprise Government Dashboard + Smart City Command Center.

Gunakan permukaan utama terang untuk kenyamanan membaca, warna navy sebagai jangkar visual dan warna teal sebagai aksen teknologi. Area peta GIS menjadi pengecualian: gunakan kanvas gelap agar layer, batas wilayah, dan marker insiden terlihat jelas.

Hindari:
- Gaya landing page pemasaran atau dashboard SaaS yang terlalu dekoratif.
- Gradien berlebihan, neon berlebihan, dan efek glassmorphism pada semua komponen.
- Terlalu banyak warna aksen yang tidak memiliki arti.
- Kartu dengan bayangan berat atau radius yang terlalu besar.
- Grafik dekoratif yang tidak membantu pemahaman data.

## 3. Sistem Warna

Palet berikut diambil dari token warna pada implementasi referensi. Pertahankan peran warna, bukan sekadar menyalin kode warna secara acak.

| Peran | Warna | Hex |
|---|---|---|
| Primary / Navy | Biru navy sangat gelap | `#002046` |
| Primary container | Navy medium | `#1B365D` |
| Background | Putih kebiruan | `#F8F9FF` |
| Surface | Putih kebiruan | `#F8F9FF` |
| Surface lowest | Putih | `#FFFFFF` |
| Surface low | Biru sangat pucat | `#EFF4FF` |
| Surface container | Biru pucat | `#E5EEFF` |
| Surface high | Biru pucat medium | `#DCE9FF` |
| Surface highest | Biru muda | `#D3E4FE` |
| Secondary / Teal | Teal gelap | `#006A6A` |
| Secondary container | Teal muda | `#90EFEF` |
| Tertiary / Green | Hijau gelap | `#002718` |
| Tertiary accent | Hijau terang | `#4EDEA3` |
| Error | Merah | `#BA1A1A` |
| Error container | Merah muda | `#FFDAD6` |
| Main text | Navy kehitaman | `#0B1C30` |
| Secondary text | Abu-abu gelap | `#44474E` |
| Outline | Abu-abu | `#74777F` |
| Outline variant | Abu-abu muda | `#C4C6CF` |

### Aturan penggunaan warna

- **Navy:** judul utama, navigasi aktif, tombol aksi utama, dan panel teknis.
- **Teal:** status online, indikator sehat, data positif, progress yang memenuhi target, dan aksen interaksi.
- **Hijau:** status selesai, terverifikasi, atau performa sangat baik.
- **Merah:** insiden kritis P0, SLA terlewat, dan tindakan darurat.
- **Amber:** prioritas tinggi P1, peringatan, atau performa yang perlu perhatian.
- **Biru:** prioritas menengah P2 dan informasi netral tertentu.
- **Slate/abu-abu:** prioritas rendah P3, data sekunder, dan status nonaktif.

Jangan mengandalkan warna saja. Sertakan label teks atau ikon agar status tetap terbaca.

## 4. Tipografi

Gunakan tiga keluarga font sesuai fungsi:

| Font | Fungsi |
|---|---|
| **Plus Jakarta Sans** | Headline, judul halaman, angka KPI besar |
| **Inter** | Teks isi, label, navigasi, tabel, tombol |
| **JetBrains Mono** | Telemetri, koordinat, timer, ID tiket, angka teknis, timestamp |

### Skala tipografi acuan

- Headline XL: 36px / line-height 44px / bold.
- Headline LG: 28px / line-height 36px / bold.
- Headline MD: 20px / line-height 28px / semibold.
- Title MD: 16px / line-height 24px / semibold.
- Title SM: 14px / line-height 20px / semibold.
- Body MD: 14px / line-height 20px / regular.
- Body SM: 12px / line-height 16px / regular.
- Label badge: 11px / line-height 14px / semibold.
- Timer: 18px / line-height 24px / semibold, JetBrains Mono.
- Telemetry: 12px / line-height 16px, JetBrains Mono.

Gunakan angka tabular atau font monospace untuk metrik yang berubah secara real-time agar perataan angka stabil.

## 5. Layout dan Grid

### Struktur desktop

- Header global: tinggi sekitar 80px, posisi fixed.
- Sidebar: lebar sekitar 256px, berada di sisi kiri dan dimulai di bawah header.
- Area konten: memiliki offset kiri sesuai lebar sidebar dan padding konsisten.
- Konten utama menggunakan grid 12 kolom pada layar lebar.
- Jarak antarkomponen menggunakan skala 4px, 8px, 12px, 16px, 24px, dan 32px.
- Panel dan kartu umumnya menggunakan radius sekitar 8–12px.
- Gunakan shadow tipis untuk memisahkan layer, bukan sebagai dekorasi utama.

### Struktur responsif

- Desktop lebar: header + sidebar tetap + konten multi-kolom.
- Tablet: sidebar dapat dipadatkan atau diubah menjadi navigasi yang dapat dibuka; grid KPI menjadi dua kolom.
- Mobile: navigasi menjadi drawer atau menu ringkas; seluruh panel ditumpuk satu kolom; tabel diberi horizontal scrolling; kontrol peta tetap mudah dijangkau.
- Jangan memaksakan peta, tabel, atau panel real-time ke lebar desktop pada layar kecil.
- Pastikan tidak ada konten penting yang tertutup header fixed.

## 6. Komponen Global

### 6.1 Header

Header berisi:
- Logo/identitas aplikasi dan nama sistem.
- Identitas instansi/kolaborator bila diperlukan.
- Indikator status backend dan koneksi database.
- Jam lokal/WIB dengan format teknis yang mudah dipindai.
- Notifikasi dengan badge jumlah.
- Tombol preferensi tampilan dan profil pengguna.

Gunakan latar putih semi-transparan dengan blur ringan dan shadow tipis. Pertahankan tinggi dan alignment yang konsisten.

### 6.2 Sidebar

Sidebar memuat navigasi modul utama, misalnya:
- Dashboard Eksekutif.
- Peta Spasial PostGIS.
- Stream Tiket & SLA.
- Kinerja OPD.
- Laporan & Audit.

Item aktif menggunakan latar navy dan teks putih. Item nonaktif menggunakan teks sekunder dan hover surface biru pucat. Sertakan ikon yang mudah dikenali dan label yang jelas.

Di bagian bawah sidebar, tampilkan ringkasan status sistem seperti SLA Health beserta progress bar.

### 6.3 Status strip / Command center

Gunakan strip horizontal di bagian atas konten untuk:
- Status live telemetry.
- Nama konteks halaman.
- Status koneksi database atau GIS engine.
- Tombol aksi utama seperti “Buat Tiket Darurat”.

Status live dapat menggunakan titik teal dengan animasi pulse yang halus. Animasi tidak boleh mengganggu pembacaan.

### 6.4 Kartu KPI

Kartu KPI menampilkan:
- Label metrik dalam huruf kapital kecil.
- Nilai utama dengan ukuran besar.
- Perubahan/tren bila datanya tersedia.
- Ikon dalam wadah berwarna lembut.
- Konteks tambahan seperti target, periode, sparkline, atau progress bar.

Contoh metrik yang sesuai:
- Total tiket masuk.
- Rerata waktu respons (MTTA).
- Rerata waktu penyelesaian (MTTR).
- Persentase kepatuhan SLA.
- Jumlah tiket overdue/breach.
- Persentase data bersih atau deduplikasi.

Jangan menampilkan terlalu banyak KPI dalam satu baris. Gunakan empat kartu sebagai pola utama pada desktop, lalu susun ulang pada tablet dan mobile.

## 7. Visualisasi GIS dan Peta Spasial

Peta adalah area visual utama dan harus memiliki karakter command center.

### Kanvas peta

- Gunakan latar navy/slate gelap, misalnya `#0F172A` atau `#1E293B`.
- Tambahkan grid koordinat tipis dengan opacity rendah.
- Tampilkan batas wilayah kecamatan sebagai polygon dengan stroke biru/teal.
- Gunakan label wilayah yang ringkas dan kontras.
- Tambahkan jalan utama, garis pesisir, buffer radius, dan layer lain hanya jika relevan.
- Gunakan SVG atau library peta yang sesuai untuk visualisasi spasial; jangan menganggap ilustrasi polygon statis sebagai peta GIS operasional.

### Marker prioritas

| Prioritas | Warna marker | Makna |
|---|---|---|
| P0 Critical | Merah | Darurat/kritis |
| P1 High | Amber | Prioritas tinggi |
| P2 Medium | Biru | Prioritas menengah |
| P3 Low | Slate | Prioritas rendah |
| Selesai | Hijau | Selesai/terverifikasi |

Marker P0 dapat menggunakan pulse/glow untuk menarik perhatian. Gunakan animasi hanya pada insiden kritis atau status live penting.

### Kontrol dan legenda peta

Sediakan:
- Zoom in/out.
- Recenter atau lokasi pusat.
- Layer selector.
- Filter berdasarkan prioritas/status.
- Legenda warna yang selalu dapat ditemukan.
- Tooltip atau inspector saat marker dipilih/di-hover.

Tooltip harus berisi ringkasan tiket, prioritas, lokasi, sisa SLA, dan OPD penanggung jawab jika datanya tersedia.

### Panel inspector spasial

Untuk halaman peta, gunakan layout peta besar dan panel samping yang lebih kecil. Panel samping dapat berisi:
- Ringkasan hotspot.
- Jumlah insiden per wilayah.
- Armada/petugas terdekat.
- Informasi deduplikasi spasial.
- Ringkasan query atau telemetri PostGIS.

## 8. Stream Tiket dan SLA Timer

Panel stream menampilkan tiket aktif dalam bentuk daftar kartu vertikal.

Setiap kartu tiket dapat memuat:
1. Badge prioritas.
2. Countdown sisa SLA.
3. Judul/uraian singkat aduan.
4. Lokasi dan koordinat bila tersedia.
5. Progress SLA elapsed.
6. Tenggat waktu.
7. OPD penanggung jawab.
8. Status pengerjaan.
9. Tombol aksi seperti Detail Tiket, Eskalasi Cepat, Disposisi Ulang, atau Monitor Armada.

Gunakan border kiri sesuai prioritas untuk memudahkan pemindaian. Countdown dan progress harus memiliki kontras yang cukup.

Sediakan pencarian berdasarkan ID tiket, lokasi, atau OPD. Jika daftar panjang, gunakan scroll internal pada panel dengan tinggi yang tetap terkendali.

## 9. Tabel Kinerja OPD

Tabel digunakan untuk membandingkan kinerja antarorganisasi perangkat daerah.

Kolom yang dapat digunakan:
- Peringkat dan nama OPD.
- Total tiket.
- Persentase respons tepat waktu.
- Jumlah overdue/breach.
- Rerata MTTR.
- Indeks kepuasan warga/CSAT.
- Status performa.
- Aksi untuk membuka detail.

Pedoman:
- Header tabel menggunakan surface low dan label uppercase kecil.
- Angka dan metrik teknis menggunakan JetBrains Mono.
- Gunakan progress bar untuk persentase.
- Gunakan badge status yang konsisten.
- Highlight baris secara halus saat hover.
- Gunakan horizontal scrolling pada layar kecil, bukan mengecilkan teks sampai sulit dibaca.
- Sediakan filter periode dan aksi ekspor bila memang didukung.

## 10. Halaman Kinerja OPD

Halaman kinerja dapat menggabungkan:
- Header konteks dan filter periode.
- Empat KPI utama.
- Perbandingan performa OPD.
- Grafik distribusi kategori aduan.
- Matriks peringatan atau pelanggaran SLA.
- Insight atau catatan evaluasi.
- Tabel leaderboard/evaluasi terperinci.

Gunakan grafik batang untuk perbandingan, donut untuk komposisi kategori, dan tabel untuk angka rinci. Beri judul, satuan, label, serta periode pada setiap visualisasi.

## 11. Halaman Laporan dan Audit

Gunakan tampilan yang lebih formal dan berorientasi dokumentasi.

Komponen yang sesuai:
- Filter tanggal/periode, OPD, kategori, dan status.
- Ringkasan audit.
- Log audit dengan timestamp, aktor, aktivitas, dan referensi.
- Status integritas atau verifikasi.
- Kartu unduhan laporan (PDF/CSV/XLSX/JSON) sesuai format yang benar-benar tersedia.
- Informasi checksum atau SHA-256 bila proses tersebut benar-benar diterapkan.
- Notifikasi hasil verifikasi atau pembuatan laporan.

Jangan menyatakan bahwa log immutable, tanda tangan digital, QR kriptografis, atau checksum sudah aman/valid hanya berdasarkan tampilan UI. Klaim tersebut harus sesuai implementasi backend yang nyata.

## 12. Ikon, Badge, dan Tombol

### Ikon
Implementasi referensi menggunakan **Material Symbols Outlined**. Gunakan ikon yang sederhana dan konsisten, misalnya dashboard, map, timer, corporate, verified, notifications, search, database, emergency, download, dan location.

### Badge
- Bentuk pill atau rounded kecil.
- Teks pendek dan mudah dibaca.
- Warna mengikuti status/prioritas.
- Hindari badge untuk informasi yang tidak membutuhkan penekanan.

### Tombol
- Primary: navy dengan teks putih.
- Secondary: surface biru muda dengan teks navy.
- Danger: merah untuk aksi berisiko atau eskalasi kritis.
- Ghost/tertiary: transparan dengan hover surface.
- Gunakan label aksi yang eksplisit, bukan hanya ikon, untuk tindakan penting.

Berikan state hover, focus, disabled, dan loading. Aksi destruktif atau eskalasi perlu konfirmasi sesuai tingkat risikonya.

## 13. Motion dan Microinteraction

Gunakan animasi secara hemat:
- Pulse untuk status live dan marker P0.
- Hover transition singkat pada kartu dan navigasi.
- Progress bar untuk SLA.
- Spinner untuk proses pembuatan laporan.
- Toast/banner untuk hasil aksi atau verifikasi.

Hindari animasi terus-menerus pada semua elemen. Hormati preferensi `prefers-reduced-motion` dan pastikan informasi tetap tersedia tanpa animasi.

## 14. Aksesibilitas dan Usability

- Pastikan kontras teks memenuhi standar aksesibilitas yang wajar.
- Jangan menyampaikan prioritas hanya melalui warna.
- Gunakan ukuran target klik yang memadai.
- Pastikan navigasi keyboard dan focus ring terlihat.
- Berikan label yang jelas pada input dan tombol ikon.
- Format waktu secara konsisten menggunakan WIB bila konteksnya Bandar Lampung.
- Tampilkan satuan metrik secara eksplisit: menit, jam, hari, persen, dan jumlah tiket.
- Hindari kepadatan informasi tanpa hirarki visual.

## 15. Prinsip Konten dan Data

- Gunakan Bahasa Indonesia yang formal, ringkas, dan operasional.
- Gunakan istilah secara konsisten: tiket, aduan, SLA, MTTA, MTTR, OPD, overdue, dan status.
- Angka contoh pada mockup harus diberi konteks sebagai data simulasi bila bukan data produksi.
- Jangan mengarang data real-time, status backend, lokasi, koordinat, atau klaim legalitas.
- Selalu tampilkan periode/filter yang menjadi dasar angka KPI.
- Berikan empty state, loading state, error state, dan stale-data indicator untuk data live.

## 16. Panduan Implementasi Frontend

Implementasi referensi menggunakan:
- HTML semantik.
- Tailwind CSS melalui CDN.
- Konfigurasi token warna, font, ukuran teks, dan spacing khusus.
- Material Symbols Outlined.
- SVG untuk ilustrasi peta, marker, grid, dan grafik ringan.
- JavaScript sederhana untuk interaksi demo.

Saat menerapkan gaya ini pada proyek baru:
1. Definisikan design tokens terlebih dahulu.
2. Buat shell layout header, sidebar, dan main content.
3. Bangun komponen reusable untuk KPI, badge, progress, ticket card, table, dan filter.
4. Pisahkan data dari markup agar konten mudah diperbarui.
5. Implementasikan layout responsif dengan breakpoint yang konsisten.
6. Pastikan setiap tombol memiliki aksi nyata atau diberi status nonaktif yang jelas.
7. Jangan menampilkan simulasi sebagai integrasi backend yang sesungguhnya.

Jika menggunakan React, Vue, atau framework lain, pertahankan sistem visual dan komponen yang sama; jangan terpaku pada struktur HTML awal.

## 17. Checklist Kualitas Desain

Sebelum menyerahkan desain, pastikan:

- [ ] Identitas sistem dan hierarki navigasi jelas.
- [ ] Navy, teal, surface terang, dan warna status digunakan konsisten.
- [ ] Tipografi memakai Plus Jakarta Sans, Inter, dan JetBrains Mono sesuai peran.
- [ ] KPI mudah dipindai dan memiliki konteks periode/satuan.
- [ ] Peta memiliki layer, marker, legenda, dan tooltip yang terbaca.
- [ ] Prioritas P0–P3 dan status selesai dapat dibedakan.
- [ ] Countdown dan progress SLA terlihat jelas.
- [ ] Stream tiket memiliki pencarian dan aksi yang relevan.
- [ ] Tabel OPD mudah dibandingkan dan tetap usable di mobile.
- [ ] Halaman audit terasa formal dan informatif.
- [ ] Loading, empty, error, disabled, dan success states tersedia.
- [ ] Layout responsif pada desktop, tablet, dan mobile.
- [ ] Tidak ada klaim keamanan/backend yang hanya bersifat dekoratif.
- [ ] Animasi digunakan seperlunya dan tidak mengganggu aksesibilitas.

## 18. Prompt Ringkas Penggunaan Skill

> Rancang antarmuka dashboard mengikuti skill Smart City SLA Tracker: gunakan gaya enterprise-government command center dengan latar utama putih kebiruan, navy sebagai warna primer, teal sebagai aksen teknologi, dan warna status merah/amber/biru/slate/hijau untuk prioritas tiket. Gunakan Plus Jakarta Sans untuk headline, Inter untuk UI, dan JetBrains Mono untuk angka telemetri. Terapkan header fixed, sidebar navigasi, kartu KPI, panel peta GIS gelap dengan marker prioritas, stream tiket dengan countdown SLA, tabel kinerja OPD, serta halaman laporan dan audit. Jaga hirarki visual, kepadatan data yang terkontrol, konsistensi komponen, aksesibilitas, dan responsivitas. Jangan mengarang integrasi backend atau data real-time; tandai data simulasi secara jelas.
