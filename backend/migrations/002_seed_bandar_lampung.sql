-- ============================================================================
-- SLA Tracker Kota Bandar Lampung - Initial Realistic Seed Data
-- Mata Kuliah: Proyek Pengembangan Sistem Informasi (PPSI) - UTS 2026
-- Pengembang: Wahyu Yolan Ageng Pangestu (NPM: 23311017)
-- Pembimbing: Dr. Erliyan Redy Susanto, M.Kom
-- ============================================================================

-- Inisialisasi Data Awal Tiket Aduan Realistis Kota Bandar Lampung
INSERT INTO tickets (
    id, title, description, category, priority, status, opd,
    location_name, district, geom, citizen_name, citizen_nik_encrypted,
    citizen_phone, photo_before_url, total_sla_seconds, elapsed_seconds,
    mtta_target_minutes, mttr_target_hours, is_escalated, assigned_team
) VALUES 
(
    'TKT-BDL-2026-0839',
    'Lampu Pengatur Lalu Lintas Padam Total Jalur Utama',
    'Traffic light di persimpangan Bundaran Hajimena padam menyebabkan antrean kendaraan dari arah Natar menuju Rajabasa.',
    'Lampu Lalu Lintas',
    'P0',
    'ESKALASI_KADIS',
    'Dinas Perhubungan',
    'Bundaran Simpang Hajimena, Rajabasa',
    'Rajabasa',
    ST_SetSRID(ST_MakePoint(105.2340, -5.3620), 4326)::geography,
    'Ilham Ramadhan',
    'AES256:187102******9001',
    '0812-7788-****',
    'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
    14400,
    11900,
    15,
    4,
    TRUE,
    'Tim Pengendalian Operasional Dishub'
),
(
    'TKT-BDL-2026-0840',
    'Jalan Amblas dan Aspal Retak Sedalam 15 cm',
    'Kerusakan aspal badan jalan cukup lebar dekat halte bus trans, membahayakan pengendara sepeda motor malam hari.',
    'Jalan Berlubang',
    'P1',
    'DALAM_PENGERJAAN',
    'Dinas PUPR',
    'Jl. Z.A. Pagar Alam No. 15 (Dekat Kampus Teknokrat)',
    'Kedaton',
    ST_SetSRID(ST_MakePoint(105.2579, -5.3817), 4326)::geography,
    'Rizky Pratama',
    'AES256:187105******0003',
    '0852-6901-****',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    86400,
    28800,
    30,
    24,
    FALSE,
    'Unit Pemeliharaan Jalan Dinas PUPR'
),
(
    'TKT-BDL-2026-0841',
    'Penumpukan Sampah Liar di Pinggir Drainase Pasar',
    'Sampah basah dan plastik menumpuk sepanjang 20 meter di tepi jalan pasar, menimbulkan bau menyengat.',
    'Sampah Liar',
    'P2',
    'DIRESPON',
    'Dinas Lingkungan Hidup',
    'Jl. Sultan Agung, Kompleks Pasar Way Halim',
    'Way Halim',
    ST_SetSRID(ST_MakePoint(105.2720, -5.3890), 4326)::geography,
    'Siti Rahmawati',
    'AES256:187103******5502',
    '0813-8899-****',
    'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    172800,
    32400,
    120,
    48,
    FALSE,
    'Satuan Tugas Kebersihan DLH'
),
(
    'TKT-BDL-2026-0842',
    'Pohon Beringin Roboh Menutup Akses Jalan Protokol',
    'Hujan lebat disertai angin kencang menumbangkan pohon beringin tua melintasi kedua ruas jalan protokol Enggal.',
    'Pohon Tumbang',
    'P0',
    'SELESAI',
    'BPBD / TRC Kota',
    'Jl. Raden Intan, Enggal',
    'Tanjung Karang Pusat',
    ST_SetSRID(ST_MakePoint(105.2605, -5.4125), 4326)::geography,
    'Maya Indah Lestari',
    'AES256:187101******8804',
    '0821-3344-****',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    14400,
    9600,
    15,
    4,
    FALSE,
    'Tim Reaksi Cepat BPBD Kota'
)
ON CONFLICT (id) DO NOTHING;

-- Update data tiket selesai dengan foto after & catatan berita acara
UPDATE tickets 
SET photo_after_url = 'https://images.unsplash.com/photo-1578961952402-f8432a5d83bb?auto=format&fit=crop&w=600&q=80',
    completion_notes = 'Pohon tumbang berhasil dievakuasi menggunakan gergaji mesin dan ranting telah diangkut ke TPA. Arus lalu lintas lancar terkendali.',
    resolved_at = CURRENT_TIMESTAMP
WHERE id = 'TKT-BDL-2026-0842';

