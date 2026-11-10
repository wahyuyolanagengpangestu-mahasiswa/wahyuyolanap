use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Priority {
    P0, // Emergency: MTTA < 15m, MTTR < 4h
    P1, // High: MTTA < 30m, MTTR < 24h
    P2, // Medium: MTTA < 2h, MTTR < 48h
    P3, // Low: MTTA < 4h, MTTR < 7d
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TicketStatus {
    Terkirim,
    Direspon,
    DalamPengerjaan,
    MenungguVerifikasi,
    Selesai,
    EskalasiKadis,
}

impl TicketStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            TicketStatus::Terkirim => "TERKIRIM",
            TicketStatus::Direspon => "DIRESPON",
            TicketStatus::DalamPengerjaan => "DALAM_PENGERJAAN",
            TicketStatus::MenungguVerifikasi => "MENUNGGU_VERIFIKASI",
            TicketStatus::Selesai => "SELESAI",
            TicketStatus::EskalasiKadis => "ESKALASI_KADIS",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum OPDName {
    DinasPupr,
    DinasPerhubungan,
    DinasLingkunganHidup,
    BpbdTrc,
    SatpolPp,
}

impl OPDName {
    pub fn as_str(&self) -> &'static str {
        match self {
            OPDName::DinasPupr => "Dinas PUPR",
            OPDName::DinasPerhubungan => "Dinas Perhubungan",
            OPDName::DinasLingkunganHidup => "Dinas Lingkungan Hidup",
            OPDName::BpbdTrc => "BPBD / TRC Kota",
            OPDName::SatpolPp => "Satpol PP",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Coordinates {
    pub lat: f64,
    pub lng: f64,
}

impl Coordinates {
    pub fn new(lat: f64, lng: f64) -> Self {
        Self { lat, lng }
    }

    /// Validasi batas wilayah Kota Bandar Lampung
    /// Lat: -5.55 s/d -5.30 | Lng: 105.15 s/d 105.40
    pub fn is_within_bandar_lampung(&self) -> bool {
        self.lat >= -5.55 && self.lat <= -5.30 && self.lng >= 105.15 && self.lng <= 105.40
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ticket {
    pub id: String,
    pub title: String,
    pub description: String,
    pub category: String,
    pub priority: Priority,
    pub status: TicketStatus,
    pub opd: OPDName,
    pub location_name: String,
    pub district: String,
    pub coordinates: Coordinates,
    pub citizen_name: String,
    pub citizen_nik_encrypted: String,
    pub citizen_phone: String,
    pub citizen_phone_encrypted: String,
    pub photo_before_url: String,
    pub photo_after_url: Option<String>,
    pub completion_notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub total_sla_seconds: u32,
    pub elapsed_seconds: u32,
    pub mtta_target_minutes: u32,
    pub mttr_target_hours: u32,
    pub is_escalated: bool,
    pub duplicate_count: u32,
    pub is_duplicate_of: Option<String>,
    pub assigned_team: Option<String>,
}

impl Ticket {
    /// Menghitung tenggat waktu SLA absolut dalam standar UTC
    pub fn deadline_utc(&self) -> DateTime<Utc> {
        self.created_at + chrono::Duration::seconds(self.total_sla_seconds as i64)
    }

    /// Menghitung sisa durasi SLA aktual dalam detik berdasarkan waktu UTC saat ini.
    /// Menghilangkan offset zona waktu (UTC vs WIB / client local time).
    pub fn remaining_seconds_utc(&self, now_utc: DateTime<Utc>) -> u32 {
        let diff = self.deadline_utc() - now_utc;
        if diff.num_seconds() <= 0 {
            0
        } else {
            diff.num_seconds() as u32
        }
    }

    /// Menghitung rasio sisa durasi SLA (0.0 s/d 1.0) bebas offset
    pub fn remaining_ratio_utc(&self, now_utc: DateTime<Utc>) -> f64 {
        if self.total_sla_seconds == 0 {
            return 0.0;
        }
        let rem = self.remaining_seconds_utc(now_utc);
        rem as f64 / self.total_sla_seconds as f64
    }

    /// Menghitung durasi berjalan aktual (elapsed) dalam detik dari UTC
    pub fn elapsed_seconds_utc(&self, now_utc: DateTime<Utc>) -> u32 {
        let diff = now_utc - self.created_at;
        if diff.num_seconds() <= 0 {
            0
        } else {
            diff.num_seconds() as u32
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLog {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub tx_hash: String,
    pub actor: String,
    pub role: String,
    pub action: String,
    pub ticket_id: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewTicketRequest {
    pub title: String,
    pub description: String,
    pub category: String,
    pub photo_data: Vec<u8>,
    pub photo_mime: String,
    pub manual_coordinates: Option<Coordinates>,
    pub location_name: String,
    pub district: String,
    pub citizen_name: String,
    pub citizen_nik: String,
    pub citizen_phone: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResolutionRequest {
    pub ticket_id: String,
    pub field_officer_name: String,
    pub field_officer_nip: String,
    pub photo_after_data: Vec<u8>,
    pub photo_after_mime: String,
    pub completion_notes: String,
    pub officer_coordinates: Option<Coordinates>,
}

