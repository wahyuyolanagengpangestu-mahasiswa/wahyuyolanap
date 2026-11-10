export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export type TicketStatus = 
  | 'TERKIRIM' 
  | 'DIRESPON' 
  | 'DALAM_PENGERJAAN' 
  | 'MENUNGGU_VERIFIKASI' 
  | 'SELESAI' 
  | 'ESKALASI_KADIS';

export type OPDName = 
  | 'Dinas PUPR' 
  | 'Dinas Perhubungan' 
  | 'Dinas Lingkungan Hidup' 
  | 'BPBD / TRC Kota' 
  | 'Satpol PP';

export type Category = 
  | 'Jalan Berlubang' 
  | 'PJU Padam' 
  | 'Lampu Lalu Lintas' 
  | 'Pohon Tumbang' 
  | 'Kabel Terputus' 
  | 'Sampah Liar' 
  | 'Saluran Air Tersumbat' 
  | 'Trotoar Rusak' 
  | 'Rambu Miring / Marka Pudar';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: TicketStatus;
  opd: OPDName;
  locationName: string;
  district: string;
  coordinates: Coordinates;
  citizenName: string;
  citizenNikEncrypted: string;
  citizenPhone: string;
  photoUrl: string;
  photoAfterUrl?: string;
  completionNotes?: string;
  createdAt: string; // ISO string
  totalSlaSeconds: number;
  elapsedSeconds: number; // dynamically updated by Tokio async simulation
  mttaTargetMinutes: number;
  mttrTargetHours: number;
  isEscalated: boolean;
  isDuplicateOf?: string;
  duplicateCount?: number;
  assignedTeam?: string;
  resolvedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  txHash: string; // SHA-256
  actor: string;
  role: 'Sistem AI' | 'Warga (Pelapor)' | 'Operator Dispatcher' | 'Tim TRC Lapangan' | 'Kadis / Pimpinan';
  action: string;
  ticketId: string;
  status: 'TERVERIFIKASI' | 'OTOMATIS' | 'PERINGATAN';
}

export interface OPDPerformanceItem {
  id: string;
  name: OPDName;
  code: string;
  totalTickets: number;
  resolvedOnTime: number;
  overdueBreach: number;
  mttaAvgMin: number;
  mttrAvgHours: number;
  csatScore: number; // e.g. 91.5%
  complianceRate: number; // e.g. 94.2%
  status: 'Sangat Baik' | 'Memenuhi Target' | 'Perlu Perhatian';
  activeStaff: number;
}

export interface DistrictPolygon {
  name: string;
  code: string;
  center: Coordinates;
  pathD: string; // SVG path
  activeIncidents: number;
}

