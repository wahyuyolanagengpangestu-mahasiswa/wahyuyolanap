//! ============================================================================
//! PENGUJIAN 5 SKENARIO SISTEM SLA TRACKER SMART CITY KOTA BANDAR LAMPUNG
//! Disusun untuk: Proyek Pengembangan Sistem Informasi (UTS 2026)
//! Mahasiswa: Wahyu Yolan Ageng Pangestu (NPM: 23311017)
//! Dosen Pengampu: Dr. Erliyan Redy Susanto, M.Kom
//! ============================================================================

use sla_tracker_backend::models::{
    Coordinates, NewTicketRequest, OPDName, Priority, ResolutionRequest, TicketStatus,
};
use sla_tracker_backend::photo_upload::{
    dms_to_decimal, extract_coordinates_from_exif, verify_image_bytes, RawExifGps,
};
use sla_tracker_backend::resolution::resolve_ticket_by_field_officer;
use sla_tracker_backend::routing::auto_route_ticket;
use sla_tracker_backend::sla_timer::{process_sla_timer_tick, SlaTickOutcome};
use sla_tracker_backend::spatial::{
    calculate_haversine_distance, find_duplicate_ticket, DEDUPLICATION_RADIUS_METERS,
};
use sla_tracker_backend::submit_new_ticket_workflow;

#[test]
fn scenario_1_verify_photo_upload_and_gps_extraction() {
    println!("\n--- SKENARIO 1: VERIFIKASI UPLOAD FOTO & EKSTRAKSI GPS ---");

    // Simulasi byte file JPEG valid (Magic byte FF D8 FF)
    let sample_jpeg = vec![0xFF, 0xD8, 0xFF, 0xE1, 0x00, 0x58, 0x45, 0x78, 0x69, 0x66];
    let mime = verify_image_bytes(&sample_jpeg).expect("Header JPEG harus valid");
    assert_eq!(mime, "image/jpeg");

    // Data EXIF GPS dari kamera smartphone warga di Jl. Raden Intan, Enggal
    // Koordinat: 5° 24' 45.00" S, 105° 15' 37.80" E (-5.4125, 105.2605)
    let raw_gps = RawExifGps {
        lat_deg: 5.0,
        lat_min: 24.0,
        lat_sec: 45.00,
        lat_ref: 'S', // Selatan -> Negatif
        lng_deg: 105.0,
        lng_min: 15.0,
        lng_sec: 37.80,
        lng_ref: 'E', // Timur -> Positif
    };

    let coords = extract_coordinates_from_exif(&raw_gps).expect("Ekstraksi koordinat berhasil");
    assert!((coords.lat - (-5.4125)).abs() < 0.0001);
    assert!((coords.lng - 105.2605).abs() < 0.0001);
    assert!(coords.is_within_bandar_lampung(), "Koordinat harus berada dalam batas Kota Bandar Lampung");

    println!("✓ Skenario 1 LULUS: Foto terverifikasi dan GPS (-5.4125, 105.2605) berhasil diekstraksi.");
}

#[test]
fn scenario_2_postgis_deduplication_radius_under_15m() {
    println!("\n--- SKENARIO 2: FILTERING ADUAN GANDA POSTGIS ST_DWithin < 15 METER ---");

    let mut existing_tickets = vec![];
    let mut audit_logs = vec![];

    // Laporan Pertama: Warga Melaporkan Lubang Jalan di Jl. Z.A. Pagar Alam (-5.3817, 105.2579)
    let req1 = NewTicketRequest {
        title: "Lubang jalan amblas".to_string(),
        description: "Kedalaman 10 cm mengganggu motor".to_string(),
        category: "Jalan Berlubang".to_string(),
        photo_data: vec![0xFF, 0xD8, 0xFF, 0xE0],
        photo_mime: "image/jpeg".to_string(),
        manual_coordinates: Some(Coordinates::new(-5.3817, 105.2579)),
        location_name: "Jl. Z.A. Pagar Alam".to_string(),
        district: "Kedaton".to_string(),
        citizen_name: "Rudi Hartono".to_string(),
        citizen_nik: "1871020304050001".to_string(),
        citizen_phone: "08123456789".to_string(),
    };

    let ticket_1 = submit_new_ticket_workflow(req1, None, &mut existing_tickets, &mut audit_logs)
        .expect("Tiket pertama berhasil dibuat");
    assert_eq!(ticket_1.duplicate_count, 0);

    // Laporan Kedua: Warga Lain Melaporkan di Titik yang sama, bergeser hanya 7.2 meter (-5.38175, 105.25794)
    let p2 = Coordinates::new(-5.38175, 105.25794);
    let dist = calculate_haversine_distance(&ticket_1.coordinates, &p2);
    assert!(dist < 15.0, "Jarak harus berada di bawah 15 meter, aktual: {:.2}m", dist);

    let match_dup = find_duplicate_ticket(&p2, &existing_tickets, DEDUPLICATION_RADIUS_METERS);
    assert!(match_dup.is_some(), "Query ST_DWithin harus menemukan aduan induk");
    let (parent, parent_dist) = match_dup.unwrap();
    assert_eq!(parent.id, ticket_1.id);
    println!("✓ Skenario 2 LULUS: Aduan berjarak {:.2}m berhasil teragregasi ke Tiket Induk #{}.", parent_dist, parent.id);
}

#[test]
fn scenario_3_auto_routing_to_technical_departments() {
    println!("\n--- SKENARIO 3: AUTO-ROUTING KE DINAS TEKNIS (PUPR / DISHUB / DLH / BPBD) ---");

    // Kasus A: Jalan Berlubang -> Dinas PUPR (Prioritas P1 / 24 Jam)
    let route_pupr = auto_route_ticket("Jalan Berlubang", "Aspal retak dan berlubang di Jalan Teuku Umar");
    assert_eq!(route_pupr.opd, OPDName::DinasPupr);
    assert_eq!(route_pupr.priority, Priority::P1);
    assert_eq!(route_pupr.mttr_target_hours, 24);

    // Kasus B: Lampu Lalu Lintas / PJU Padam -> Dinas Perhubungan (P1 / P0 jika jalur utama)
    let route_dishub = auto_route_ticket("Lampu Lalu Lintas", "Traffic light padam di persimpangan jalan protokol");
    assert_eq!(route_dishub.opd, OPDName::DinasPerhubungan);
    assert_eq!(route_dishub.priority, Priority::P0);
    assert_eq!(route_dishub.mttr_target_hours, 4);

    // Kasus C: Sampah Liar -> Dinas Lingkungan Hidup (Prioritas P2 / 48 Jam)
    let route_dlh = auto_route_ticket("Sampah Liar", "Tumpukan sampah plastik di selokan Way Halim");
    assert_eq!(route_dlh.opd, OPDName::DinasLingkunganHidup);
    assert_eq!(route_dlh.priority, Priority::P2);
    assert_eq!(route_dlh.mttr_target_hours, 48);

    // Kasus D: Pohon Roboh Menimpa Jalan -> BPBD TRC (Emergency P0 / 4 Jam)
    let route_bpbd = auto_route_ticket("Pohon Tumbang", "Pohon tumbang menutup seluruh badan jalan");
    assert_eq!(route_bpbd.opd, OPDName::BpbdTrc);
    assert_eq!(route_bpbd.priority, Priority::P0);
    assert_eq!(route_bpbd.mttr_target_hours, 4);

    println!("✓ Skenario 3 LULUS: Seluruh aduan berhasil dipetakan ke Dinas PUPR, Dishub, DLH, dan BPBD sesuai matriks SLA.");
}

#[test]
fn scenario_4_sla_timer_countdown_and_20_percent_alert() {
    println!("\n--- SKENARIO 4: PEMBARUAN SLA TIMER & TRIGGER ALERT SISA 20% ---");

    let mut existing = vec![];
    let mut audit = vec![];
    let req = NewTicketRequest {
        title: "Traffic light mati".to_string(),
        description: "Simpang jalan protokol macet total".to_string(),
        category: "Lampu Lalu Lintas".to_string(),
        photo_data: vec![0xFF, 0xD8, 0xFF, 0xE0],
        photo_mime: "image/jpeg".to_string(),
        manual_coordinates: Some(Coordinates::new(-5.4125, 105.2605)),
        location_name: "Simpang Raden Intan".to_string(),
        district: "Tanjung Karang Pusat".to_string(),
        citizen_name: "Ilham Ramadhan".to_string(),
        citizen_nik: "1871xxxx".to_string(),
        citizen_phone: "0812xxxx".to_string(),
    };

    let mut ticket = submit_new_ticket_workflow(req, None, &mut existing, &mut audit).unwrap();
    // P0 total durasi = 4 jam = 14,400 detik
    assert_eq!(ticket.total_sla_seconds, 14400);

    // Simulasikan waktu berjalan hingga sisa 25% (elapsed: 10,800 detik, remaining: 3,600 detik)
    ticket.elapsed_seconds = 10800;
    let outcome1 = process_sla_timer_tick(&mut ticket, 1);
    assert!(matches!(outcome1, SlaTickOutcome::Running { .. }));
    assert!(!ticket.is_escalated, "Belum mencapai ambang 20%, tidak boleh eskalasi");

    // Simulasikan waktu berjalan hingga sisa tepat 20% (elapsed: 11,520 detik, remaining: 2,880 detik)
    ticket.elapsed_seconds = 11519;
    let outcome2 = process_sla_timer_tick(&mut ticket, 1); // tick ke 11,520
    match outcome2 {
        SlaTickOutcome::EscalationTriggered { remaining_seconds, alert_message, audit_log } => {
            assert_eq!(remaining_seconds, 2880);
            assert!(ticket.is_escalated);
            assert_eq!(ticket.status, TicketStatus::EskalasiKadis);
            assert!(alert_message.contains("PERINGATAN KRITIS"));
            assert_eq!(audit_log.status, "PERINGATAN");
            println!("✓ Skenario 4 LULUS: Alert 20% terpicu tepat waktu (Sisa {} menit). Notifikasi otomatis dikirim ke Kadis.", remaining_seconds / 60);
        }
        _ => panic!("Gagal memicu trigger alert saat sisa waktu 20%!"),
    }
}

#[test]
fn scenario_5_ticket_resolution_by_field_officer() {
    println!("\n--- SKENARIO 5: PENYELESAIAN TIKET OLEH PETUGAS (UPLOAD FOTO AFTER) ---");

    let mut existing = vec![];
    let mut audit = vec![];
    let req = NewTicketRequest {
        title: "Perbaikan Aspal".to_string(),
        description: "Tambal sulam".to_string(),
        category: "Jalan Berlubang".to_string(),
        photo_data: vec![0xFF, 0xD8, 0xFF, 0xE0],
        photo_mime: "image/jpeg".to_string(),
        manual_coordinates: Some(Coordinates::new(-5.3817, 105.2579)),
        location_name: "Jl. Z.A. Pagar Alam".to_string(),
        district: "Kedaton".to_string(),
        citizen_name: "Warga".to_string(),
        citizen_nik: "1871xxxx".to_string(),
        citizen_phone: "0812xxxx".to_string(),
    };

    let mut ticket = submit_new_ticket_workflow(req, None, &mut existing, &mut audit).unwrap();
    ticket.status = TicketStatus::DalamPengerjaan;
    ticket.elapsed_seconds = 3600; // Pengerjaan selama 1 jam

    // 1. Validasi Negatif: Petugas lupa mengunggah foto After
    let invalid_res = ResolutionRequest {
        ticket_id: ticket.id.clone(),
        field_officer_name: "Aiptu Hendro".to_string(),
        field_officer_nip: "198203112006041001".to_string(),
        photo_after_data: vec![], // KOSONG!
        photo_after_mime: "image/jpeg".to_string(),
        completion_notes: "Selesai".to_string(),
        officer_coordinates: None,
    };
    let fail_res = resolve_ticket_by_field_officer(&mut ticket, &invalid_res, "url".to_string());
    assert!(fail_res.is_err(), "Harus menolak penyelesaian jika foto after tidak disertakan!");

    // 2. Validasi Positif: Petugas mengunggah foto After valid & catatan pengerjaan lengkap
    let valid_after_photo = vec![0xFF, 0xD8, 0xFF, 0xE0, 0x11, 0x22];
    let valid_res = ResolutionRequest {
        ticket_id: ticket.id.clone(),
        field_officer_name: "Aiptu Hendro".to_string(),
        field_officer_nip: "198203112006041001".to_string(),
        photo_after_data: valid_after_photo,
        photo_after_mime: "image/jpeg".to_string(),
        completion_notes: "Pengaspalan hotmix setebal 4 cm selesai dilakukan. Arus lalu lintas lancar kembali.".to_string(),
        officer_coordinates: Some(Coordinates::new(-5.38172, 105.25791)), // 3 meter dari lokasi
    };

    let success = resolve_ticket_by_field_officer(
        &mut ticket,
        &valid_res,
        "https://cdn.bandarlampung.go.id/after/after_0850.jpg".to_string(),
    ).expect("Penyelesaian harus berhasil diverifikasi");

    assert_eq!(ticket.status, TicketStatus::Selesai);
    assert!(success.is_on_time);
    assert_eq!(ticket.photo_after_url, Some("https://cdn.bandarlampung.go.id/after/after_0850.jpg".to_string()));
    assert_eq!(success.audit_log.role, "Tim TRC Lapangan");

    println!("✓ Skenario 5 LULUS: Tiket #{:?} selesai diverifikasi dengan Foto Bukti After.", ticket.id);
}

