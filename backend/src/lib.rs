pub mod crypto;
pub mod models;
pub mod photo_upload;
pub mod pool;
pub mod resolution;
pub mod routing;
pub mod sla_timer;
pub mod spatial;

use chrono::Utc;
use crypto::{encrypt_aes_256_gcm, get_aes_master_key, mask_phone};
use models::{AuditLog, Coordinates, NewTicketRequest, Priority, Ticket, TicketStatus};
use photo_upload::{parse_photo_and_extract_gps, RawExifGps};
use routing::auto_route_ticket;
use spatial::{find_duplicate_ticket, DEDUPLICATION_RADIUS_METERS};

/// Orkestrator Pembuatan Tiket Baru (End-to-End Workflow)
pub fn submit_new_ticket_workflow(
    req: NewTicketRequest,
    mock_gps: Option<RawExifGps>,
    existing_tickets: &mut Vec<Ticket>,
    audit_logs: &mut Vec<AuditLog>,
) -> Result<Ticket, String> {
    // 1. Ekstraksi Koordinat GPS dari Foto atau Manual Fallback
    let coordinates = if let Some(raw) = mock_gps {
        parse_photo_and_extract_gps(&req.photo_data, Some(raw))
            .map_err(|e| format!("Validasi foto gagal: {}", e))?
    } else if let Some(manual) = req.manual_coordinates {
        if !manual.is_within_bandar_lampung() {
            return Err("Koordinat manual di luar Kota Bandar Lampung".to_string());
        }
        manual
    } else {
        return Err("Koordinat lokasi wajib disertakan via GPS foto atau input manual".to_string());
    };

    // 2. Spatial Deduplication Check (PostGIS ST_DWithin < 15m)
    let duplicate_match = find_duplicate_ticket(&coordinates, existing_tickets, DEDUPLICATION_RADIUS_METERS);

    // 3. Auto-Routing ke Dinas Teknis & Matriks SLA
    let full_text = format!("{} {}", req.title, req.description);
    let routing = auto_route_ticket(&req.category, &full_text);

    let ticket_id = format!("TKT-BDL-2026-{:04}", 850 + existing_tickets.len());
    let now = Utc::now();

    let (is_dup_of, dup_count) = if let Some((parent_ticket, _dist)) = duplicate_match {
        (Some(parent_ticket.id.clone()), 1)
    } else {
        (None, 0)
    };

    // Enkripsi PII Warga (NIK 16 digit & No HP) dengan AES-256-GCM
    let master_key = get_aes_master_key();
    let nik_encrypted = encrypt_aes_256_gcm(&req.citizen_nik, &master_key)
        .map_err(|e| format!("Gagal enkripsi NIK: {}", e))?;
    let phone_encrypted = encrypt_aes_256_gcm(&req.citizen_phone, &master_key)
        .map_err(|e| format!("Gagal enkripsi No HP: {}", e))?;
    let phone_masked = mask_phone(&req.citizen_phone);

    let new_ticket = Ticket {
        id: ticket_id.clone(),
        title: req.title,
        description: req.description,
        category: req.category,
        priority: routing.priority,
        status: TicketStatus::Terkirim,
        opd: routing.opd,
        location_name: req.location_name,
        district: req.district,
        coordinates,
        citizen_name: req.citizen_name.clone(),
        citizen_nik_encrypted: nik_encrypted,
        citizen_phone: phone_masked,
        citizen_phone_encrypted: phone_encrypted,
        photo_before_url: "https://cdn.bandarlampung.go.id/uploads/before_001.jpg".to_string(),
        photo_after_url: None,
        completion_notes: None,
        created_at: now,
        resolved_at: None,
        total_sla_seconds: routing.total_sla_seconds,
        elapsed_seconds: 0,
        mtta_target_minutes: routing.mtta_target_minutes,
        mttr_target_hours: routing.mttr_target_hours,
        is_escalated: false,
        duplicate_count: dup_count,
        is_duplicate_of: is_dup_of,
        assigned_team: Some(routing.initial_team),
    };

    // 4. Catat Audit Trail
    let audit_entry = AuditLog {
        id: format!("aud-{}", now.timestamp_millis()),
        timestamp: now,
        tx_hash: format!("sha256:create_{}", ticket_id),
        actor: req.citizen_name,
        role: "Warga (Pelapor)".to_string(),
        action: format!("NEW_TICKET: Aduan berhasil diinput dan diarahkan ke {:?}.", new_ticket.opd),
        ticket_id: ticket_id.clone(),
        status: "TERVERIFIKASI".to_string(),
    };

    existing_tickets.push(new_ticket.clone());
    audit_logs.push(audit_entry);

    Ok(new_ticket)
}

