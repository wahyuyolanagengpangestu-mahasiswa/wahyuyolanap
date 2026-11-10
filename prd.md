**PRODUCT REQUIREMENT DOCUMENT (PRD)**

*Platform SLA Tracker Pengaduan & Aspirasi Warga Fasilitas Umum (Rust & PostgreSQL Stack)*

**1\. Identitas Proyek & Lembaga Penyelenggara**

Dokumen Product Requirement Document (PRD) ini disusun untuk memenuhi tugas Ujian Tengah Semester (UTS) mata kuliah Proyek Pengembangan Sistem Informasi.

| Parameter Proyek | Detail Spesifikasi |
| :---- | :---- |
| Nama Platform | SLA Tracker Smart City Kota Bandar Lampung |
| Pengembang & Lembaga | Program Studi Informatika, Universitas Teknokrat Indonesia |
| Mitra Pemerintah | Pemerintah Kota Bandar Lampung (Pemda Kota Bandar Lampung) |
| Pengampu Mata Kuliah | Dr. Erliyan Redy Susanto, M.Kom |
| Teknologi Utama Backend | Rust (Axum Web Framework & Tokio Async Runtime) |
| Teknologi Utama Database | PostgreSQL (PostGIS Extension untuk Geospasial) |
| Versi Dokumen | 1.0 \- UTS Edition (2026) |
| Hak Cipta Footer Aplikasi | Copyright © 2026 by Wahyu Yolan Ageng Pangestu dan Dr. Erliyan Redy Susanto, M.Kom |

**2\. Latar Belakang & Pernyataan Masalah**

* **Disparitas Kanal & Aduan Menguap:** Pelaporan aduan fasilitas publik (jalan berlubang, PJU padam, sampah liar) tersebar di berbagai saluran tanpa sistem penomoran tiket terpadu.  
* **Proses Routing Manual:** Proses penyaluran laporan dari warga ke dinas teknis (PUPR, Dishub, DLH) memakan waktu 24-72 jam secara manual.  
* **Ketiadaan Standar SLA Terpublikasi:** Tidak ada tolok ukur transparansi durasi penyelesaian laporan sehingga menimbulkan krisis kepercayaan publik.

| Pernyataan Masalah Utama (Core Problem Statement)*"Masyarakat tidak memiliki akses transparansi terhadap status dan durasi penyelesaian laporan fasilitas publik, sementara Pemerintah Kota Bandar Lampung kesulitan mengukur kinerja dinas teknis secara objektif karena ketiadaan platform terpusat berbasis Service Level Agreement (SLA) yang terukur."* |
| :---- |

**3\. Tujuan Produk & Indikator Keberhasilan (KPI)**

**3.1 Tujuan Utama**

* Memangkas waktu penyaluran tiket aduan dari warga ke dinas teknis dari rata-rata 24 jam menjadi \< 15 menit secara otomatis.  
* Memberikan transparansi status penanganan aduan 100% secara real-time kepada pelapor.  
* Meningkatkan tingkat penyelesaian aduan tepat waktu (sesuai SLA) hingga minimal 90%.

**3.2 Target Indikator Kinerja Utama (KPI)**

| Indikator Kinerja Utama (KPI) | Target Baseline | Target Setelah Implementasi |
| :---- | :---- | :---- |
| Mean Time to Acknowledge (MTTA) | 24 Jam | \< 30 Menit |
| Mean Time to Resolve (MTTR) | 7 \- 14 Hari | Sesuai Matriks SLA (4 Jam – 3 Hari) |
| Tingkat Kepuasan Warga (CSAT) | \< 50% | \> 85% |
| Persentase Tiket Tepat SLA | \< 40% | \>= 90% |
| Redundansi Aduan Terfilter | 0% (Manual) | \> 80% terduplikasi otomatis via PostGIS |

**4\. User Personas & Hak Akses**

| Role Persona | Deskripsi & Kebutuhan Utama | Akses Platform |
| :---- | :---- | :---- |
| Warga (Pelapor) | Membutuhkan pelaporan cepat (\< 1 menit), pengenalan GPS otomatis, dan penelusuran status SLA real-time. | Aplikasi Mobile (Android/iOS) & PWA |
| Petugas Lapangan | Membutuhkan daftar penugasan berbasis lokasi terdekat dan bukti pengerjaan (foto Before-After). | Mobile Field App |
| Dispatcher Dinas | Membutuhkan verifikasi tiket cepat, pengalihan instan, dan kontrol aduan palsu. | Web Dashboard Dispatcher |
| Pimpinan / Wali Kota | Membutuhkan visualisasi heatmap sebaran masalah, alert kelalaian SLA, dan leaderboard kinerja dinas. | Web Executive Dashboard |

**5\. Kebutuhan Fungsional (Functional Requirements)**

**5.1 Modul Warga (Mobile & Web)**

| Req ID | Nama Fitur | Deskripsi Fungsi | Prioritas |
| :---- | :---- | :---- | :---- |
| FR-MOB-01 | Instant Geo-Reporting | Pengambilan foto langsung dari kamera yang otomatis mengunci koordinat GPS, alamat, dan timestamp. | P0 (Must Have) |
| FR-MOB-02 | AI Auto-Categorization | Analisis foto aduan untuk rekomendasi otomatis kategori (misal: Jalan Berlubang atau PJU Padam). | P1 (Should Have) |
| FR-MOB-03 | Live SLA Status Tracker | Timeline transparan status tiket, nama dinas penanggung jawab, dan jam hitung mundur SLA. | P0 (Must Have) |
| FR-MOB-04 | Push Notification System | Notifikasi otomatis via WhatsApp & App Push saat status tiket diperbarui. | P0 (Must Have) |

**5.2 Modul Admin Dispatcher & Engine AI**

| Req ID | Nama Fitur | Deskripsi Fungsi | Prioritas |
| :---- | :---- | :---- | :---- |
| FR-ENG-01 | Smart Auto-Routing Engine | Memetakan kategori aduan langsung ke dinas teknis penanggung jawab berbasis aturan sistem. | P0 (Must Have) |
| FR-ENG-02 | PostGIS Deduplication Check | Mendeteksi aduan berulang pada radius \< 15 meter menggunakan query PostGIS ST\_DWithin. | P0 (Must Have) |
| FR-ADM-01 | SLA Timer & Auto Escalation | Hitung mundur otomatis. Peringatan merah dikirim ke Kadis jika waktu tersisa \< 20%. | P0 (Must Have) |

**5.3 Modul Executive Dashboard (Pimpinan)**

| Req ID | Nama Fitur | Deskripsi Fungsi | Prioritas |
| :---- | :---- | :---- | :---- |
| FR-EXC-01 | Geospatial Heatmap | Visualisasi peta Kota Bandar Lampung yang menunjukkan konsentrasi titik kerusakan. | P1 (Should Have) |
| FR-EXC-02 | Dinas SLA Leaderboard | Tabel peringkat kinerja dinas teknis berdasarkan % tiket tepat waktu dan rerata durasi pengerjaan. | P0 (Must Have) |

**6\. Matriks Service Level Agreement (SLA) & Eskalasi**

| Tingkat Urgensi | Kriteria Masalah | Target Respon (MTTA) | Target Penyelesaian (MTTR) | Penanggung Jawab |
| :---- | :---- | :---- | :---- | :---- |
| Emergency (P0) | PJU Padam Jalur Utama, Pohon Tumbang, Kabel Terputus | \< 15 Menit | \< 4 Jam | Tim Reaksi Cepat (TRC) Dinas |
| High (P1) | Jalan Berlubang Dalam (\>10 cm), Lampu Lalu Lintas Padam | \< 30 Menit | \< 24 Jam | Dinas PUPR / Dishub |
| Medium (P2) | Penumpukan Sampah Liar, Trotoar Rusak, Saluran Air Tersumbat | \< 2 Jam | \< 48 Jam | Dinas LH / Dinas PUPR |
| Low (P3) | Cat Marka Pudar, Rambu Miring, Fasilitas Taman Rusak | \< 4 Jam | \< 7 Hari Kerja | Dinas Terkait |

**7\. Validasi Teknis Stack: Rust & PostgreSQL (PostGIS)**

Pemilihan stack teknologi Rust dan PostgreSQL didasarkan pada kebutuhan sistem komando kota yang memerlukan latensi sangat rendah, tingkat keamanan tinggi, serta manipulasi data geospasial yang kompleks.

**7.1 Keunggulan Backend: Rust (Axum Framework & Tokio Runtime)**

* **Memory Safety & Zero-Cost Abstractions:** Rust tidak menggunakan Garbage Collector, menjamin penggunaan memori sangat kecil dan stabil tanpa adanya latency spikes saat lonjakan aduan warga.  
* **High Concurrency & Async Performance:** Menggunakan Tokio async runtime yang mampu mengelola ribuan koneksi HTTP dan WebSocket simultan untuk pembaruan hitung mundur SLA timer secara real-time.  
* **Type Safety:** Sistem tipe data Rust yang ketat mencegah kerentanan null pointer dan data race pada tingkat kompilasi kode.

**7.2 Keunggulan Database: PostgreSQL \+ Ekstensi PostGIS**

* **Kapasitas Geospasial Native (PostGIS):** Memungkinkan eksekusi fungsi geospasial native seperti ST\_DWithin untuk filtering aduan ganda dalam radius 15 meter dan ST\_AsGeoJSON untuk rendering heatmap peta.  
* **Jaminan ACID Compliance:** Menjamin konsistensi data transaksi tiket aduan dan riwayat audit perubahan status tanpa risiko korupsi data.  
* **Compile-Time Query Safety (SQLx):** Menggunakan SQLx di Rust untuk pengujian query SQL saat kompilasi (compile-time checked query), mencegah kesalahan syntax dan kerentanan SQL Injection.

**8\. Kebutuhan Non-Fungsional & Keamanan Data**

* **Skalabilitas & Concurrency:** Mampu menangani 5.000 pengguna aktif bersamaan dan 50.000 tiket aduan per hari.  
* **Performansi & Latensi:** Waktu respon API backend \< 100 ms; render dashboard web \< 2 detik.  
* **Keamanan Data (PII Encryption):** Enkripsi data pribadi warga (NIK, No. HP) menggunakan algoritma AES-256-GCM at-rest.  
* **Autentikasi & Otorisasi:** Autentikasi menggunakan OAuth 2.0 / JWT dengan signature ed25519 dan Role-Based Access Control (RBAC).

**9\. Spesifikasi Co-Branding Logo & Footer Aplikasi**

* **Header Top-Left Co-Branding:** Menampilkan Logo Pemda Kota Bandar Lampung di sebelah kiri berdampingan dengan Logo Universitas Teknokrat Indonesia (UTI) dengan simbol pembatas '+'.  
* **Footer Mandatory Copyright:** Setiap halaman aplikasi web dan mobile wajib mencantumkan footer terpusat dengan teks persis: 'Copyright © 2026 by \[Nama Mahasiswa\] dan Dr. Erliyan Redy Susanto, M.Kom'.