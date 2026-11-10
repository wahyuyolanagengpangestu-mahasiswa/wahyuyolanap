use crate::models::{AuditLog, Ticket, TicketStatus};
use chrono::Utc;

pub const ESCALATION_THRESHOLD_RATIO: f64 = 0.20; // 20% sisa waktu

#[derive(Debug, Clone, PartialEq)]
pub enum SlaTickOutcome {
    Running {
        remaining_seconds: u32,
        remaining_ratio: f64,
    },
    EscalationTriggered {
        remaining_seconds: u32,
        alert_message: String,
        audit_log: AuditLog,
    },
    Breached {
        overdue_seconds: u32,
    },
    Completed,
}

/// Menghitung sisa durasi SLA berdasarkan target absolut (mencegah akumulasi drift)
pub fn calculate_remaining_sla_seconds(total_seconds: u32, elapsed_seconds: u32) -> (u32, f64) {
    let remaining = total_seconds.saturating_sub(elapsed_seconds);
    let ratio = if total_seconds > 0 {
        remaining as f64 / total_seconds as f64
    } else {
        0.0
    };
    (remaining, ratio)
}

/// Memproses 1 tick pembaruan SLA timer dan memeriksa apakah ambang 20% terlewati
pub fn process_sla_timer_tick(ticket: &mut Ticket, tick_seconds: u32) -> SlaTickOutcome {
    if ticket.status == TicketStatus::Selesai {
        return SlaTickOutcome::Completed;
    }

    ticket.elapsed_seconds += tick_seconds;
    let (remaining, ratio) = calculate_remaining_sla_seconds(ticket.total_sla_seconds, ticket.elapsed_seconds);

    // KASUS 1: SLA Waktu Habis (Breach)
    if remaining == 0 {
        return SlaTickOutcome::Breached {
            overdue_seconds: ticket.elapsed_seconds - ticket.total_sla_seconds,
        };
    }

    // KASUS 2: Ambang Peringatan Kritis <= 20%
    // Proteksi Latch: Hanya trigger SEKALI jika belum pernah dieskalasikan
    if ratio <= ESCALATION_THRESHOLD_RATIO && !ticket.is_escalated && ticket.status != TicketStatus::EskalasiKadis {
        ticket.is_escalated = true;
        ticket.status = TicketStatus::EskalasiKadis;

        let alert_msg = format!(
            "PERINGATAN KRITIS: Sisa waktu SLA tiket #{} tinggal {:.1}% ({} menit). Terdisposisi otomatis ke Kepala {}.",
            ticket.id,
            ratio * 100.0,
            remaining / 60,
            ticket.opd.as_str()
        );

        let audit = AuditLog {
            id: format!("aud-{}", Utc::now().timestamp_millis()),
            timestamp: Utc::now(),
            tx_hash: format!("sha256:{:x}", md5::compute(alert_msg.as_bytes())),
            actor: "TokioAsyncWorker::SlaMonitor".to_string(),
            role: "Sistem AI".to_string(),
            action: alert_msg.clone(),
            ticket_id: ticket.id.clone(),
            status: "PERINGATAN".to_string(),
        };

        return SlaTickOutcome::EscalationTriggered {
            remaining_seconds: remaining,
            alert_message: alert_msg,
            audit_log: audit,
        };
    }

    SlaTickOutcome::Running {
        remaining_seconds: remaining,
        remaining_ratio: ratio,
    }
}

/// Standardisasi UTC: Memproses evaluasi SLA timer langsung terhadap timestamp UTC
/// Menghilangkan offset zona waktu (UTC vs WIB UTC+7) dan drift interval
pub fn process_sla_timer_tick_utc(ticket: &mut Ticket, now_utc: chrono::DateTime<Utc>) -> SlaTickOutcome {
    if ticket.status == TicketStatus::Selesai {
        return SlaTickOutcome::Completed;
    }

    let remaining = ticket.remaining_seconds_utc(now_utc);
    let ratio = ticket.remaining_ratio_utc(now_utc);
    ticket.elapsed_seconds = ticket.total_sla_seconds.saturating_sub(remaining);

    // KASUS 1: SLA Waktu Habis (Breach)
    if remaining == 0 {
        let overdue = (now_utc - ticket.deadline_utc()).num_seconds().max(0) as u32;
        return SlaTickOutcome::Breached {
            overdue_seconds: overdue,
        };
    }

    // KASUS 2: Ambang Peringatan Kritis <= 20%
    if ratio <= ESCALATION_THRESHOLD_RATIO && !ticket.is_escalated && ticket.status != TicketStatus::EskalasiKadis {
        ticket.is_escalated = true;
        ticket.status = TicketStatus::EskalasiKadis;

        let alert_msg = format!(
            "PERINGATAN KRITIS: Sisa waktu SLA tiket #{} tinggal {:.1}% ({} menit). Terdisposisi otomatis ke Kepala {}.",
            ticket.id,
            ratio * 100.0,
            remaining / 60,
            ticket.opd.as_str()
        );

        let audit = AuditLog {
            id: format!("aud-{}", now_utc.timestamp_millis()),
            timestamp: now_utc,
            tx_hash: format!("sha256:{:x}", md5::compute(alert_msg.as_bytes())),
            actor: "TokioAsyncWorker::SlaMonitor".to_string(),
            role: "Sistem AI".to_string(),
            action: alert_msg.clone(),
            ticket_id: ticket.id.clone(),
            status: "PERINGATAN".to_string(),
        };

        return SlaTickOutcome::EscalationTriggered {
            remaining_seconds: remaining,
            alert_message: alert_msg,
            audit_log: audit,
        };
    }

    SlaTickOutcome::Running {
        remaining_seconds: remaining,
        remaining_ratio: ratio,
    }
}

// Minimal helper md5 for hashing in simulation
mod md5 {
    pub fn compute(data: &[u8]) -> u128 {
        let mut hash = 0x67452301efcdab8998badcfe10325476u128;
        for &byte in data {
            hash = hash.rotate_left(5) ^ (byte as u128);
        }
        hash
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{Coordinates, OPDName, Priority};

    fn create_test_ticket(total_seconds: u32, elapsed_seconds: u32) -> Ticket {
        Ticket {
            id: "TKT-TEST-001".to_string(),
            title: "PJU Padam Sukarame".to_string(),
            description: "Lampu padam".to_string(),
            category: "PJU Padam".to_string(),
            priority: Priority::P1,
            status: TicketStatus::Direspon,
            opd: OPDName::DinasPerhubungan,
            location_name: "Jl. Ryacudu".to_string(),
            district: "Sukarame".to_string(),
            coordinates: Coordinates::new(-5.38, 105.29),
            citizen_name: "Ahmad".to_string(),
            citizen_nik_encrypted: "1871xxxx".to_string(),
            citizen_phone: "0812xxxx".to_string(),
            photo_before_url: "http://photo.jpg".to_string(),
            photo_after_url: None,
            completion_notes: None,
            created_at: Utc::now(),
            resolved_at: None,
            total_sla_seconds: total_seconds,
            elapsed_seconds,
            mtta_target_minutes: 30,
            mttr_target_hours: 24,
            is_escalated: false,
            duplicate_count: 0,
            is_duplicate_of: None,
            assigned_team: Some("Tim Dishub".to_string()),
        }
    }

    #[test]
    fn test_running_when_above_20_percent() {
        // Total 1000s, elapsed 700s => sisa 300s (30%)
        let mut ticket = create_test_ticket(1000, 700);
        let outcome = process_sla_timer_tick(&mut ticket, 1);

        match outcome {
            SlaTickOutcome::Running { remaining_seconds, remaining_ratio } => {
                assert_eq!(remaining_seconds, 299);
                assert!((remaining_ratio - 0.299).abs() < 0.001);
                assert!(!ticket.is_escalated);
            }
            _ => panic!("Harus berstatus Running"),
        }
    }

    #[test]
    fn test_escalation_triggered_at_exact_20_percent() {
        // Total 1000s, elapsed 799s => tick 1s => elapsed 800s => sisa 200s (20.0%)
        let mut ticket = create_test_ticket(1000, 799);
        let outcome = process_sla_timer_tick(&mut ticket, 1);

        match outcome {
            SlaTickOutcome::EscalationTriggered { remaining_seconds, alert_message, .. } => {
                assert_eq!(remaining_seconds, 200);
                assert!(ticket.is_escalated, "Flag eskalasi harus true");
                assert_eq!(ticket.status, TicketStatus::EskalasiKadis);
                assert!(alert_message.contains("PERINGATAN KRITIS"));
            }
            _ => panic!("Harus memicu EscalationTriggered pada 20%"),
        }
    }

    #[test]
    fn test_no_duplicate_escalation_spam_on_subsequent_ticks() {
        // Tiket sudah berada di bawah 20% dan SUDAH dieskalasikan
        let mut ticket = create_test_ticket(1000, 800);
        ticket.is_escalated = true;
        ticket.status = TicketStatus::EskalasiKadis;

        // Tick berikutnya pada sisa 199s (19.9%)
        let outcome = process_sla_timer_tick(&mut ticket, 1);

        // Tidak boleh trigger EscalationTriggered kedua kalinya (latch check)
        match outcome {
            SlaTickOutcome::Running { remaining_seconds, .. } => {
                assert_eq!(remaining_seconds, 199);
            }
            _ => panic!("Tidak boleh memicu eskalasi berulang kali!"),
        }
    }
}

