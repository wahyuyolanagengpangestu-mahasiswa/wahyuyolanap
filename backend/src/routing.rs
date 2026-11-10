use crate::models::{OPDName, Priority};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RoutingDecision {
    pub opd: OPDName,
    pub priority: Priority,
    pub mtta_target_minutes: u32,
    pub mttr_target_hours: u32,
    pub total_sla_seconds: u32,
    pub initial_team: String,
}

/// Menentukan dinas teknis (PUPR, Dishub, DLH, BPBD) dan matriks SLA berdasarkan kategori & teks aduan
pub fn auto_route_ticket(category: &str, title_and_desc: &str) -> RoutingDecision {
    let lower_cat = category.to_lowercase();
    let lower_text = title_and_desc.to_lowercase();

    // 1. Klasifikasi Dinas Teknis
    let (opd, priority, team) = if lower_cat.contains("pohon tumbang")
        || lower_cat.contains("kabel terputus")
        || lower_text.contains("pohon roboh")
        || lower_text.contains("menimpa jalan")
        || lower_text.contains("kabel tegangan tinggi")
    {
        (
            OPDName::BpbdTrc,
            Priority::P0, // Emergency: Respon cepat TRC
            "Tim Reaksi Cepat BPBD Kota".to_string(),
        )
    } else if lower_cat.contains("jalan")
        || lower_cat.contains("aspal")
        || lower_cat.contains("trotoar")
        || lower_cat.contains("saluran air")
        || lower_cat.contains("jembatan")
        || lower_text.contains("jalan amblas")
        || lower_text.contains("lubang parah")
    {
        let prio = if lower_text.contains("amblas") || lower_text.contains("dalam > 15 cm") {
            Priority::P0
        } else if lower_cat.contains("saluran") || lower_cat.contains("trotoar") {
            Priority::P2
        } else {
            Priority::P1
        };
        (
            OPDName::DinasPupr,
            prio,
            "Unit Pemeliharaan Jalan Dinas PUPR".to_string(),
        )
    } else if lower_cat.contains("pju")
        || lower_cat.contains("lampu")
        || lower_cat.contains("rambu")
        || lower_cat.contains("marka")
        || lower_text.contains("traffic light")
        || lower_text.contains("lampu merah padam")
    {
        let prio = if lower_text.contains("protokol") || lower_text.contains("jalur utama") || lower_text.contains("traffic light") {
            Priority::P0
        } else if lower_cat.contains("rambu") || lower_cat.contains("marka") {
            Priority::P3
        } else {
            Priority::P1
        };
        (
            OPDName::DinasPerhubungan,
            prio,
            "Tim Pengendalian Operasional Dishub".to_string(),
        )
    } else if lower_cat.contains("sampah")
        || lower_cat.contains("limbah")
        || lower_text.contains("tps liar")
        || lower_text.contains("bau menyengat")
    {
        (
            OPDName::DinasLingkunganHidup,
            Priority::P2,
            "Satuan Tugas Kebersihan DLH".to_string(),
        )
    } else {
        // Fallback default
        (
            OPDName::DinasPupr,
            Priority::P3,
            "Divisi Umum Penanganan Fasum".to_string(),
        )
    };

    // 2. Tentukan Matriks SLA berdasarkan Ketetapan PRD
    let (mtta, mttr, total_secs) = match priority {
        Priority::P0 => (15, 4, 4 * 3600),          // < 15 mnt MTTA, < 4 jam MTTR
        Priority::P1 => (30, 24, 24 * 3600),        // < 30 mnt MTTA, < 24 jam MTTR
        Priority::P2 => (120, 48, 48 * 3600),       // < 2 jam MTTA, < 48 jam MTTR
        Priority::P3 => (240, 168, 7 * 24 * 3600),  // < 4 jam MTTA, < 7 hari MTTR
    };

    RoutingDecision {
        opd,
        priority,
        mtta_target_minutes: mtta,
        mttr_target_hours: mttr,
        total_sla_seconds: total_secs,
        initial_team: team,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_auto_route_pupr_jalan_berlubang() {
        let decision = auto_route_ticket(
            "Jalan Berlubang",
            "Aspal berlubang di depan kampus Teknokrat, Jl ZA Pagar Alam",
        );
        assert_eq!(decision.opd, OPDName::DinasPupr);
        assert_eq!(decision.priority, Priority::P1);
        assert_eq!(decision.mtta_target_minutes, 30);
        assert_eq!(decision.mttr_target_hours, 24);
        assert_eq!(decision.total_sla_seconds, 86400);
    }

    #[test]
    fn test_auto_route_dishub_pju_padam_jalur_utama() {
        let decision = auto_route_ticket(
            "PJU Padam",
            "Lampu jalan padam total sepanjang jalur utama protokol Jl. Raden Intan",
        );
        assert_eq!(decision.opd, OPDName::DinasPerhubungan);
        assert_eq!(decision.priority, Priority::P0); // Terdeteksi jalur utama / protokol -> P0 Emergency
        assert_eq!(decision.mtta_target_minutes, 15);
        assert_eq!(decision.mttr_target_hours, 4);
    }

    #[test]
    fn test_auto_route_dlh_sampah_liar() {
        let decision = auto_route_ticket(
            "Sampah Liar",
            "Tumpukan sampah basah di pinggir jalan Sultan Agung Way Halim",
        );
        assert_eq!(decision.opd, OPDName::DinasLingkunganHidup);
        assert_eq!(decision.priority, Priority::P2);
        assert_eq!(decision.mtta_target_minutes, 120);
        assert_eq!(decision.mttr_target_hours, 48);
    }

    #[test]
    fn test_auto_route_bpbd_pohon_tumbang_emergency() {
        let decision = auto_route_ticket(
            "Pohon Tumbang",
            "Pohon beringin roboh menimpa badan jalan di Bundaran Hajimena",
        );
        assert_eq!(decision.opd, OPDName::BpbdTrc);
        assert_eq!(decision.priority, Priority::P0);
        assert_eq!(decision.mttr_target_hours, 4);
    }
}

