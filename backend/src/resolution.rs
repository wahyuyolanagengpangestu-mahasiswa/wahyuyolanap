use crate::models::{AuditLog, Coordinates, ResolutionRequest, Ticket, TicketStatus};
use crate::photo_upload::verify_image_bytes;
use crate::spatial::calculate_haversine_distance;
use chrono::Utc;
use thiserror::Error;

#[derive(Debug, Error, PartialEq)]
pub enum ResolutionError {
    #[error("Foto bukti penyelesaian (After) wajib diunggah")]
    MissingPhotoAfter,
    #[error("Format foto After tidak valid: {0}")]
    InvalidPhotoFormat(String),
    #[error("Catatan penyelesaian pekerjaan wajib diisi")]
    MissingCompletionNotes,
    #[error("Tiket sudah dalam status SELESAI sebelumnya")]
    AlreadyResolved,
    #[error("Petugas lapangan berada di luar radius penugasan ({0:.1} m dari lokasi insiden)")]
    GeofenceBreach(f64),
}

#[derive(Debug, Clone, PartialEq)]
pub struct ResolutionResult {
    pub ticket_id: String,
    pub is_on_time: bool,
    pub final_duration_minutes: u32,
    pub photo_after_url: String,
    pub audit_log: AuditLog,
}

/// Menangani penyelesaian tiket oleh petugas lapangan
pub fn resolve_ticket_by_field_officer(
    ticket: &mut Ticket,
    req: &ResolutionRequest,
    stored_photo_after_url: String,
) -> Result<ResolutionResult, ResolutionError> {
    if ticket.status == TicketStatus::Selesai {
        return Err(ResolutionError::AlreadyResolved);
    }

    // 1. Verifikasi Keberadaan Foto Bukti After
    if req.photo_after_data.is_empty() {
        return Err(ResolutionError::MissingPhotoAfter);
    }
    verify_image_bytes(&req.photo_after_data)
        .map_err(|e| ResolutionError::InvalidPhotoFormat(e.to_string()))?;

    // 2. Verifikasi Catatan Hasil Pekerjaan
    if req.completion_notes.trim().is_empty() {
        return Err(ResolutionError::MissingCompletionNotes);
    }

    // 3. Verifikasi Geofence Lapangan (Jika koordinat GPS petugas disertakan)
    if let Some(officer_coords) = &req.officer_coordinates {
        let dist = calculate_haversine_distance(&ticket.coordinates, officer_coords);
        const MAX_GEOFENCE_RADIUS_METERS: f64 = 150.0;
        if dist > MAX_GEOFENCE_RADIUS_METERS {
            return Err(ResolutionError::GeofenceBreach(dist));
        }
    }

    // 4. Update Status Tiket & Catat Waktu Selesai
    let now = Utc::now();
    ticket.status = TicketStatus::Selesai;
    ticket.resolved_at = Some(now);
    ticket.photo_after_url = Some(stored_photo_after_url.clone());
    ticket.completion_notes = Some(req.completion_notes.clone());

    let final_duration_minutes = ticket.elapsed_seconds / 60;
    let is_on_time = ticket.elapsed_seconds <= ticket.total_sla_seconds;

    // 5. Terbitkan Audit Log
    let audit_msg = format!(
        "RESOLUTION_VERIFIED: Petugas {} (NIP: {}) menyelesaikan tiket #{}. Bukti foto After terunggah. Durasi: {} mnt (SLA Target: {} Jam). Kepatuhan: {}",
        req.field_officer_name,
        req.field_officer_nip,
        ticket.id,
        final_duration_minutes,
        ticket.mttr_target_hours,
        if is_on_time { "TEPAT WAKTU" } else { "TERLAMBAT" }
    );

    let audit_log = AuditLog {
        id: format!("aud-{}", now.timestamp_millis()),
        timestamp: now,
        tx_hash: format!("sha256:res_{}", ticket.id),
        actor: format!("{} (NIP: {})", req.field_officer_name, req.field_officer_nip),
        role: "Tim TRC Lapangan".to_string(),
        action: audit_msg,
        ticket_id: ticket.id.clone(),
        status: "TERVERIFIKASI".to_string(),
    };

    Ok(ResolutionResult {
        ticket_id: ticket.id.clone(),
        is_on_time,
        final_duration_minutes,
        photo_after_url: stored_photo_after_url,
        audit_log,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{Coordinates, OPDName, Priority};

    fn create_open_ticket() -> Ticket {
        Ticket {
            id: "TKT-BDL-2026-0840".to_string(),
            title: "Jalan Amblas di Jl. Kartini".to_string(),
            description: "Aspal ambrol sedalam 20cm".to_string(),
            category: "Jalan Berlubang".to_string(),
            priority: Priority::P0,
            status: TicketStatus::DalamPengerjaan,
            opd: OPDName::DinasPupr,
            location_name: "Jl. Kartini No. 45".to_string(),
            district: "Tanjung Karang Pusat".to_string(),
            coordinates: Coordinates::new(-5.4125, 105.2605),
            citizen_name: "Maya Indah".to_string(),
            citizen_nik_encrypted: "1871xxxx".to_string(),
            citizen_phone: "0813xxxx".to_string(),
            photo_before_url: "https://photos/before.jpg".to_string(),
            photo_after_url: None,
            completion_notes: None,
            created_at: Utc::now(),
            resolved_at: None,
            total_sla_seconds: 14400, // 4 jam MTTR
            elapsed_seconds: 7200,    // 2 jam pengerjaan (tepat waktu)
            mtta_target_minutes: 15,
            mttr_target_hours: 4,
            is_escalated: false,
            duplicate_count: 0,
            is_duplicate_of: None,
            assigned_team: Some("Tim Aspal PUPR".to_string()),
        }
    }

    #[test]
    fn test_reject_resolution_without_photo_after() {
        let mut ticket = create_open_ticket();
        let req = ResolutionRequest {
            ticket_id: ticket.id.clone(),
            field_officer_name: "Suryono".to_string(),
            field_officer_nip: "197805142005011003".to_string(),
            photo_after_data: vec![], // KOSONG -> Harus ditolak
            photo_after_mime: "image/jpeg".to_string(),
            completion_notes: "Aspal sudah ditambal".to_string(),
            officer_coordinates: None,
        };

        let result = resolve_ticket_by_field_officer(&mut ticket, &req, "url".to_string());
        assert_eq!(result, Err(ResolutionError::MissingPhotoAfter));
        assert_ne!(ticket.status, TicketStatus::Selesai);
    }

    #[test]
    fn test_reject_resolution_without_completion_notes() {
        let mut ticket = create_open_ticket();
        let valid_jpeg = vec![0xFF, 0xD8, 0xFF, 0xE0, 0x01, 0x02];
        let req = ResolutionRequest {
            ticket_id: ticket.id.clone(),
            field_officer_name: "Suryono".to_string(),
            field_officer_nip: "197805142005011003".to_string(),
            photo_after_data: valid_jpeg,
            photo_after_mime: "image/jpeg".to_string(),
            completion_notes: "   ".to_string(), // Catatan kosong -> Ditolak
            officer_coordinates: None,
        };

        let result = resolve_ticket_by_field_officer(&mut ticket, &req, "url".to_string());
        assert_eq!(result, Err(ResolutionError::MissingCompletionNotes));
    }

    #[test]
    fn test_reject_when_officer_outside_geofence() {
        let mut ticket = create_open_ticket();
        let valid_jpeg = vec![0xFF, 0xD8, 0xFF, 0xE0, 0x01, 0x02];
        // Petugas mencoba menyelesaikan tiket dari lokasi yang jauh (500 meter lebih)
        let far_away_coords = Coordinates::new(-5.4200, 105.2605);

        let req = ResolutionRequest {
            ticket_id: ticket.id.clone(),
            field_officer_name: "Suryono".to_string(),
            field_officer_nip: "197805142005011003".to_string(),
            photo_after_data: valid_jpeg,
            photo_after_mime: "image/jpeg".to_string(),
            completion_notes: "Pekerjaan selesai".to_string(),
            officer_coordinates: Some(far_away_coords),
        };

        let result = resolve_ticket_by_field_officer(&mut ticket, &req, "url".to_string());
        assert!(matches!(result, Err(ResolutionError::GeofenceBreach(_))));
    }

    #[test]
    fn test_successful_resolution_with_photo_after() {
        let mut ticket = create_open_ticket();
        let valid_jpeg = vec![0xFF, 0xD8, 0xFF, 0xE0, 0x01, 0x02];
        let nearby_coords = Coordinates::new(-5.41252, 105.26051); // 2 meter dari lokasi

        let req = ResolutionRequest {
            ticket_id: ticket.id.clone(),
            field_officer_name: "Suryono".to_string(),
            field_officer_nip: "197805142005011003".to_string(),
            photo_after_data: valid_jpeg,
            photo_after_mime: "image/jpeg".to_string(),
            completion_notes: "Penambalan cold-mix 2 lapis dan pemadatan selesai dilakukan.".to_string(),
            officer_coordinates: Some(nearby_coords),
        };

        let result = resolve_ticket_by_field_officer(
            &mut ticket,
            &req,
            "https://cdn.bandarlampung.go.id/after_0840.jpg".to_string(),
        ).expect("Penyelesaian harus berhasil");

        assert_eq!(ticket.status, TicketStatus::Selesai);
        assert!(result.is_on_time);
        assert_eq!(result.final_duration_minutes, 120);
        assert_eq!(ticket.photo_after_url, Some("https://cdn.bandarlampung.go.id/after_0840.jpg".to_string()));
        assert_eq!(result.audit_log.role, "Tim TRC Lapangan");
        assert!(result.audit_log.action.contains("RESOLUTION_VERIFIED"));
    }
}

