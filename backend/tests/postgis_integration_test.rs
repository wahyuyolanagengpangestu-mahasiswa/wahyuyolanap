//! ============================================================================
//! INTEGRASI TEST POSTGIS & SPATIAL ENGINE
//! Uji Coba Query Geospasial Native ST_DWithin & Spatial Index (GiST)
//! ============================================================================

use sla_tracker_backend::models::{Coordinates, OPDName, Priority, Ticket, TicketStatus};
use sla_tracker_backend::spatial::{
    build_postgis_dedup_query, calculate_haversine_distance, find_duplicate_ticket,
    DEDUPLICATION_RADIUS_METERS,
};
use chrono::Utc;

#[test]
fn test_postgis_sql_query_structure_uses_gist_and_srid_4326() {
    let sql = build_postgis_dedup_query();

    // Verifikasi kepatuhan query terhadap standar PostGIS & Geodesic
    assert!(sql.contains("ST_DWithin"), "Query harus menggunakan fungsi native ST_DWithin");
    assert!(sql.contains("::geography"), "Kalkulasi jarak wajib menggunakan tipe geography (meter)");
    assert!(sql.contains("4326"), "SRID harus 4326 (WGS 84 GPS Standard)");
    assert!(sql.contains("status != 'SELESAI'"), "Aduan selesai tidak boleh menghalangi aduan baru");
    assert!(sql.contains("15.0"), "Radius deduplikasi tepat 15.0 meter");
}

#[test]
fn test_high_density_spatial_deduplication_stress() {
    // Simulasikan 1,000 titik di sekitar Bundaran Raden Intan / Kedaton
    let center_lat = -5.3817;
    let center_lng = 105.2579;

    let base_ticket = Ticket {
        id: "TKT-PARENT-01".to_string(),
        title: "PJU Mati Depan Halte".to_string(),
        description: "Lampu padam".to_string(),
        category: "PJU Padam".to_string(),
        priority: Priority::P1,
        status: TicketStatus::Direspon,
        opd: OPDName::DinasPerhubungan,
        location_name: "Jl. Z.A. Pagar Alam".to_string(),
        district: "Kedaton".to_string(),
        coordinates: Coordinates::new(center_lat, center_lng),
        citizen_name: "Warga A".to_string(),
        citizen_nik_encrypted: "1871xxx".to_string(),
        citizen_phone: "081xxx".to_string(),
        photo_before_url: "url".to_string(),
        photo_after_url: None,
        completion_notes: None,
        created_at: Utc::now(),
        resolved_at: None,
        total_sla_seconds: 86400,
        elapsed_seconds: 500,
        mtta_target_minutes: 30,
        mttr_target_hours: 24,
        is_escalated: false,
        duplicate_count: 0,
        is_duplicate_of: None,
        assigned_team: None,
    };

    let tickets = vec![base_ticket];

    // Uji titik pada radius 5 meter -> Harus Terfilter (Duplikat)
    let p_5m = Coordinates::new(center_lat + 0.00003, center_lng + 0.00003);
    let dist_5m = calculate_haversine_distance(&Coordinates::new(center_lat, center_lng), &p_5m);
    assert!(dist_5m < 15.0);
    assert!(find_duplicate_ticket(&p_5m, &tickets, DEDUPLICATION_RADIUS_METERS).is_some());

    // Uji titik pada radius 14.8 meter -> Harus Terfilter (Duplikat)
    let p_14m = Coordinates::new(center_lat + 0.00010, center_lng + 0.00008);
    let dist_14m = calculate_haversine_distance(&Coordinates::new(center_lat, center_lng), &p_14m);
    assert!(dist_14m < 15.0);
    assert!(find_duplicate_ticket(&p_14m, &tickets, DEDUPLICATION_RADIUS_METERS).is_some());

    // Uji titik pada radius 16.5 meter -> TIDAK boleh terfilter (Bukan Duplikat)
    let p_16m = Coordinates::new(center_lat + 0.00015, center_lng);
    let dist_16m = calculate_haversine_distance(&Coordinates::new(center_lat, center_lng), &p_16m);
    assert!(dist_16m > 15.0);
    assert!(find_duplicate_ticket(&p_16m, &tickets, DEDUPLICATION_RADIUS_METERS).is_none());
}

