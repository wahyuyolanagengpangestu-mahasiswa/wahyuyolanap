import { Ticket, OPDPerformanceItem, AuditLog, DistrictPolygon } from '../types';

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TKT-BDL-2026-0842',
    title: 'Pohon Tumbang Menimpa Kabel Listrik Utama',
    description: 'Pohon kedondong hutan tumbang akibat angin kencang, menghalangi lajur kiri dan menarik kabel utilitas hingga percikan api terlihat.',
    category: 'Pohon Tumbang',
    priority: 'P0',
    status: 'DALAM_PENGERJAAN',
    opd: 'BPBD / TRC Kota',
    locationName: 'Jl. Raden Intan No. 45, Enggal',
    district: 'Tanjung Karang Pusat',
    coordinates: { lat: -5.4125, lng: 105.2605 },
    citizenName: 'Bambang Sudarsono',
    citizenNikEncrypted: '187101******0004',
    citizenPhone: '0812-7921-****',
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(), // 38 mins ago
    totalSlaSeconds: 4 * 3600, // 4 hours for P0
    elapsedSeconds: 38 * 60,
    mttaTargetMinutes: 15,
    mttrTargetHours: 4,
    isEscalated: false,
    duplicateCount: 2,
    assignedTeam: 'Regu Charlie TRC BPBD (Unit Chainsaw 02)'
  },
  {
    id: 'TKT-BDL-2026-0841',
    title: 'Jalan Berlubang Dalam (>15cm) Dekat Kampus Teknokrat',
    description: 'Aspal amblas sedalam 18cm tepat di depan gerbang keluar kendaraan, berpotensi memicu kecelakaan pemotor malam hari.',
    category: 'Jalan Berlubang',
    priority: 'P1',
    status: 'DIRESPON',
    opd: 'Dinas PUPR',
    locationName: 'Jl. Z.A. Pagar Alam No. 9-11 (Depan Teknokrat)',
    district: 'Kedaton',
    coordinates: { lat: -5.3817, lng: 105.2579 },
    citizenName: 'Nurul Hidayati, S.Kom',
    citizenNikEncrypted: '187105******0012',
    citizenPhone: '0821-8314-****',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    totalSlaSeconds: 24 * 3600, // 24 hours for P1
    elapsedSeconds: 75 * 60,
    mttaTargetMinutes: 30,
    mttrTargetHours: 24,
    isEscalated: false,
    duplicateCount: 3,
    assignedTeam: 'Tim Reaksi Cepat Jalan PUPR Sektor Utara'
  },
  {
    id: 'TKT-BDL-2026-0839',
    title: 'Traffic Light Simpang Lima Bundaran Hajimena Padam Total',
    description: 'Lampu lalu lintas mati total sejak pukul 14.15 WIB menyebabkan arus macet parah hingga jalur Bypass.',
    category: 'Lampu Lalu Lintas',
    priority: 'P1',
    status: 'ESKALASI_KADIS',
    opd: 'Dinas Perhubungan',
    locationName: 'Bundaran Simpang Hajimena / Rajabasa',
    district: 'Rajabasa',
    coordinates: { lat: -5.3620, lng: 105.2340 },
    citizenName: 'Rian Kurniawan',
    citizenNikEncrypted: '187103******0008',
    citizenPhone: '0853-6621-****',
    photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(), // 20 hours ago
    totalSlaSeconds: 24 * 3600,
    elapsedSeconds: 20 * 3600, // >80% elapsed -> Triggered SLA warning
    mttaTargetMinutes: 30,
    mttrTargetHours: 24,
    isEscalated: true,
    duplicateCount: 7,
    assignedTeam: 'Regu Teknisi Elektrikal Dishub (Unit Crane 01)'
  },
  {
    id: 'TKT-BDL-2026-0838',
    title: 'Penumpukan Sampah Liar dan Bau Menyengat di Bahu Jalan',
    description: 'Tumpukan sampah pasar liar meluber hingga 1 lajur jalan raya, saluran air mulai mampet oleh limbah plastik.',
    category: 'Sampah Liar',
    priority: 'P2',
    status: 'DALAM_PENGERJAAN',
    opd: 'Dinas Lingkungan Hidup',
    locationName: 'Jl. Sultan Agung Jalur 2 Way Halim',
    district: 'Way Halim',
    coordinates: { lat: -5.3890, lng: 105.2720 },
    citizenName: 'Hj. Syarifah Aminah',
    citizenNikEncrypted: '187107******0021',
    citizenPhone: '0813-6902-****',
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    totalSlaSeconds: 48 * 3600,
    elapsedSeconds: 14 * 3600,
    mttaTargetMinutes: 120,
    mttrTargetHours: 48,
    isEscalated: false,
    duplicateCount: 1,
    assignedTeam: 'Armada Dumptruck DLH Wilayah Timur 04'
  },
  {
    id: 'TKT-BDL-2026-0835',
    title: 'Kabel Terputus Menjuntai ke Permukaan Aspal',
    description: 'Kabel utilitas putus akibat tersangkut kontainer tronton, menggantung setinggi 1 meter dari permukaan jalan.',
    category: 'Kabel Terputus',
    priority: 'P0',
    status: 'MENUNGGU_VERIFIKASI',
    opd: 'BPBD / TRC Kota',
    locationName: 'Jl. Soekarno Hatta Bypass Sukarame',
    district: 'Sukarame',
    coordinates: { lat: -5.3950, lng: 105.2950 },
    citizenName: 'Bripka Hendra Irawan',
    citizenNikEncrypted: '187102******0001',
    citizenPhone: '0812-7100-****',
    photoUrl: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    totalSlaSeconds: 4 * 3600,
    elapsedSeconds: 210 * 60,
    mttaTargetMinutes: 15,
    mttrTargetHours: 4,
    isEscalated: true,
    duplicateCount: 4,
    assignedTeam: 'Regu Alpha TRC + Teknisi PLN Rayon Sukarame'
  },
  {
    id: 'TKT-BDL-2026-0830',
    title: 'Lampu PJU Padam 4 Titik Berturut-turut',
    description: 'Lampu penerangan jalan umum padam sepanjang 150 meter menyebabkan kawasan gelap gulita rawan kriminalitas.',
    category: 'PJU Padam',
    priority: 'P1',
    status: 'SELESAI',
    opd: 'Dinas Perhubungan',
    locationName: 'Jl. Teuku Umar, Depan RSUD Abdul Moeloek',
    district: 'Kedaton',
    coordinates: { lat: -5.3920, lng: 105.2580 },
    citizenName: 'dr. Farhan Malik',
    citizenNikEncrypted: '187105******0033',
    citizenPhone: '0822-8001-****',
    photoUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    totalSlaSeconds: 24 * 3600,
    elapsedSeconds: 18 * 3600, // completed in 18 hrs
    mttaTargetMinutes: 30,
    mttrTargetHours: 24,
    isEscalated: false,
    duplicateCount: 5,
    assignedTeam: 'PJU Mobile Repair Dishub Unit 03',
    resolvedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
  },
  {
    id: 'TKT-BDL-2026-0828',
    title: 'Saluran Drainase Tersumbat Lumpur Tebal dan Sampah',
    description: 'Gorong-gorong tersumbat sedimen pasir dan sampah padat, saat hujan air meluap setinggi 30 cm ke pekarangan warga.',
    category: 'Saluran Air Tersumbat',
    priority: 'P2',
    status: 'DALAM_PENGERJAAN',
    opd: 'Dinas PUPR',
    locationName: 'Jl. Ikan Hiu No. 12, Teluk Betung',
    district: 'Teluk Betung Selatan',
    coordinates: { lat: -5.4475, lng: 105.2710 },
    citizenName: 'Ahmad Faisal',
    citizenNikEncrypted: '187108******0019',
    citizenPhone: '0852-6911-****',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    totalSlaSeconds: 48 * 3600,
    elapsedSeconds: 22 * 3600,
    mttaTargetMinutes: 120,
    mttrTargetHours: 48,
    isEscalated: false,
    duplicateCount: 2,
    assignedTeam: 'Regu Drainase PUPR Teluk Betung'
  },
  {
    id: 'TKT-BDL-2026-0822',
    title: 'Marka Penyeberangan Zebra Cross Pudar Total',
    description: 'Cat marka penyeberangan jalan di depan SDN 1 Kemiling sudah tidak terlihat, membahayakan anak sekolah yang menyeberang.',
    category: 'Rambu Miring / Marka Pudar',
    priority: 'P3',
    status: 'TERKIRIM',
    opd: 'Dinas Perhubungan',
    locationName: 'Jl. Imam Bonjol No. 102, Kemiling',
    district: 'Kemiling',
    coordinates: { lat: -5.4050, lng: 105.2300 },
    citizenName: 'Dewi Lestari, S.Pd',
    citizenNikEncrypted: '187104******0015',
    citizenPhone: '0813-7312-****',
    photoUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    totalSlaSeconds: 7 * 24 * 3600, // 7 days
    elapsedSeconds: 8 * 3600,
    mttaTargetMinutes: 240,
    mttrTargetHours: 168,
    isEscalated: false,
    duplicateCount: 0,
    assignedTeam: 'Belum ditugaskan (Antrean Disposisi)'
  }
];

export const INITIAL_OPD_PERFORMANCE: OPDPerformanceItem[] = [
  {
    id: 'opd-1',
    name: 'BPBD / TRC Kota',
    code: 'TRC-BPBD',
    totalTickets: 142,
    resolvedOnTime: 139,
    overdueBreach: 3,
    mttaAvgMin: 11.4, // < 15 min target!
    mttrAvgHours: 2.8, // < 4 hour target!
    csatScore: 94.6, // > 85% target
    complianceRate: 97.8,
    status: 'Sangat Baik',
    activeStaff: 36
  },
  {
    id: 'opd-2',
    name: 'Dinas PUPR',
    code: 'PUPR-BDL',
    totalTickets: 384,
    resolvedOnTime: 351,
    overdueBreach: 33,
    mttaAvgMin: 22.8, // < 30 min target
    mttrAvgHours: 21.2, // < 24 hour target
    csatScore: 89.2,
    complianceRate: 91.4,
    status: 'Memenuhi Target',
    activeStaff: 68
  },
  {
    id: 'opd-3',
    name: 'Dinas Perhubungan',
    code: 'DISHUB-BDL',
    totalTickets: 290,
    resolvedOnTime: 263,
    overdueBreach: 27,
    mttaAvgMin: 25.1,
    mttrAvgHours: 19.5,
    csatScore: 88.5,
    complianceRate: 90.7,
    status: 'Memenuhi Target',
    activeStaff: 45
  },
  {
    id: 'opd-4',
    name: 'Dinas Lingkungan Hidup',
    code: 'DLH-BDL',
    totalTickets: 216,
    resolvedOnTime: 188,
    overdueBreach: 28,
    mttaAvgMin: 48.0,
    mttrAvgHours: 36.4,
    csatScore: 86.1,
    complianceRate: 87.0, // Needs slight attention
    status: 'Perlu Perhatian',
    activeStaff: 52
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-109',
    timestamp: '2026-11-10 16:15:22 WIB',
    txHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    actor: 'AutoEscalation::TokioWorker',
    role: 'Sistem AI',
    action: 'ESCALATION_TRIGGER: Tiket #TKT-BDL-2026-0839 tersisa SLA < 20%. Dispatch notifikasi merah ke Kadishub.',
    ticketId: 'TKT-BDL-2026-0839',
    status: 'PERINGATAN'
  },
  {
    id: 'aud-108',
    timestamp: '2026-11-10 15:48:10 WIB',
    txHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    actor: 'PostGIS::DeduplicationEngine',
    role: 'Sistem AI',
    action: 'DEDUPLICATION_MATCH: ST_DWithin(radius=15m) menemukan 3 aduan duplikat di Jl. Z.A. Pagar Alam.',
    ticketId: 'TKT-BDL-2026-0841',
    status: 'OTOMATIS'
  },
  {
    id: 'aud-107',
    timestamp: '2026-11-10 15:32:05 WIB',
    txHash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    actor: 'Dispatcher Hendrawan (NIP: 198804122011011002)',
    role: 'Operator Dispatcher',
    action: 'MANUAL_DISPATCH: Penugasan Unit Chainsaw 02 TRC BPBD untuk Tiket #TKT-BDL-2026-0842.',
    ticketId: 'TKT-BDL-2026-0842',
    status: 'TERVERIFIKASI'
  },
  {
    id: 'aud-106',
    timestamp: '2026-11-10 14:10:44 WIB',
    txHash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
    actor: 'Petugas Lapangan Sutrisno',
    role: 'Tim TRC Lapangan',
    action: 'STATUS_UPDATE: Tiket #TKT-BDL-2026-0830 diselesaikan dengan penggantian modul trafo PJU.',
    ticketId: 'TKT-BDL-2026-0830',
    status: 'TERVERIFIKASI'
  },
  {
    id: 'aud-105',
    timestamp: '2026-11-10 13:22:19 WIB',
    txHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    actor: 'Bambang Sudarsono (NIK: 187101******0004)',
    role: 'Warga (Pelapor)',
    action: 'NEW_REPORT_SUBMISSION: Pengaduan baru melalui Mobile Geo-Reporting dengan foto & GPS tag.',
    ticketId: 'TKT-BDL-2026-0842',
    status: 'TERVERIFIKASI'
  }
];

export const DISTRICT_POLYGONS: DistrictPolygon[] = [
  {
    name: 'Kedaton (Teknokrat Area)',
    code: 'KDT',
    center: { lat: -5.3850, lng: 105.2580 },
    pathD: 'M 280,180 L 370,160 L 410,230 L 330,270 Z',
    activeIncidents: 4
  },
  {
    name: 'Tanjung Karang Pusat',
    code: 'TKP',
    center: { lat: -5.4125, lng: 105.2605 },
    pathD: 'M 330,270 L 410,230 L 460,310 L 380,360 Z',
    activeIncidents: 3
  },
  {
    name: 'Way Halim',
    code: 'WHL',
    center: { lat: -5.3890, lng: 105.2720 },
    pathD: 'M 410,160 L 510,170 L 520,260 L 410,230 Z',
    activeIncidents: 2
  },
  {
    name: 'Sukarame',
    code: 'SKR',
    center: { lat: -5.3950, lng: 105.2950 },
    pathD: 'M 510,170 L 630,190 L 610,310 L 520,260 Z',
    activeIncidents: 2
  },
  {
    name: 'Rajabasa',
    code: 'RJB',
    center: { lat: -5.3620, lng: 105.2340 },
    pathD: 'M 210,110 L 320,100 L 370,160 L 280,180 Z',
    activeIncidents: 2
  },
  {
    name: 'Teluk Betung Selatan',
    code: 'TBS',
    center: { lat: -5.4475, lng: 105.2710 },
    pathD: 'M 380,360 L 460,310 L 490,420 L 390,460 Z',
    activeIncidents: 3
  },
  {
    name: 'Kemiling',
    code: 'KML',
    center: { lat: -5.4050, lng: 105.2300 },
    pathD: 'M 170,220 L 280,180 L 330,270 L 230,330 Z',
    activeIncidents: 1
  },
  {
    name: 'Panjang (Pelabuhan)',
    code: 'PNJ',
    center: { lat: -5.4600, lng: 105.3200 },
    pathD: 'M 490,420 L 610,310 L 640,430 L 520,480 Z',
    activeIncidents: 1
  }
];

