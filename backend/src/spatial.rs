use crate::models::{Coordinates, Ticket, TicketStatus};

pub const DEDUPLICATION_RADIUS_METERS: f64 = 15.0;

/// Menghitung jarak geodesic antara 2 koordinat (Haversine formula) dalam meter
pub fn calculate_haversine_distance(c1: &Coordinates, c2: &Coordinates) -> f64 {
    const EARTH_RADIUS_METERS: f64 = 6_371_000.0;

    let phi1 = c1.lat.to_radians();
    let phi2 = c2.lat.to_radians();
    let delta_phi = (c2.lat - c1.lat).to_radians();
    let delta_lambda = (c2.lng - c1.lng).to_radians();

    let a = (delta_phi / 2.0).sin().powi(2)
        + phi1.cos() * phi2.cos() * (delta_lambda / 2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());

    EARTH_RADIUS_METERS * c
}

/// Menghasilkan query SQL PostGIS native yang terindeks GiST
pub fn build_postgis_dedup_query() -> &'static str {
    r#"
    SELECT 
        id, title, category, priority, status, opd, location_name, district,
        ST_Y(geom::geometry) as lat,
        ST_X(geom::geometry) as lng,
        ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance_meters
    FROM tickets
    WHERE status != 'SELESAI'
      AND ST_DWithin(
          geom, 
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 
          15.0
      )
    ORDER BY distance_meters ASC
    LIMIT 1;
    "#
}

/// Filter aduan ganda dalam koleksi in-memory (mirip hasil query PostGIS)
/// Hanya mencocokkan tiket yang statusnya BELUM SELESAI
pub fn find_duplicate_ticket<'a>(
    new_coords: &Coordinates,
    existing_tickets: &'a [Ticket],
    radius_meters: f64,
) -> Option<(&'a Ticket, f64)> {
    let mut closest: Option<(&'a Ticket, f64)> = None;

    for ticket in existing_tickets {
        // Tiket yang sudah selesai tidak boleh memblokir aduan baru di masa depan
        if ticket.status == TicketStatus::Selesai {
            continue;
        }

        let dist = calculate_haversine_distance(new_coords, &ticket.coordinates);
        if dist < radius_meters {
            match closest {
                None => closest = Some((ticket, dist)),
                Some((_, current_min)) if dist < current_min => {
                    closest = Some((ticket, dist));
                }
                _ => {}
            }
        }
    }

    closest
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{OPDName, Priority};
    use chrono::Utc;

    fn mock_ticket(id: &str, lat: f64, lng: f64, status: TicketStatus) -> Ticket {
        Ticket {
            id: id.to_string(),
            title: "Aduan Lubang Jalan".to_string(),
            description: "Jalan berlubang cukup parah".to_string(),
            category: "Jalan Berlubang".to_string(),
            priority: Priority::P1,
            status,
            opd: OPDName::DinasPupr,
            location_name: "Jl. Z.A. Pagar Alam".to_string(),
            district: "Kedaton".to_string(),
            coordinates: Coordinates::new(lat, lng),
            citizen_name: "Budi Santoso".to_string(),
            citizen_nik_encrypted: "1871xxxx".to_string(),
            citizen_phone: "0812xxxx".to_string(),
            photo_before_url: "http://photo.jpg".to_string(),
            photo_after_url: None,
            completion_notes: None,
            created_at: Utc::now(),
            resolved_at: None,
            total_sla_seconds: 86400,
            elapsed_seconds: 1200,
            mtta_target_minutes: 30,
            mttr_target_hours: 24,
            is_escalated: false,
            duplicate_count: 0,
            is_duplicate_of: None,
            assigned_team: Some("Tim Reaksi Cepat PUPR".to_string()),
        }
    }

    #[test]
    fn test_haversine_distance_accuracy() {
        // Titik 1: Kampus UTI (-5.3817, 105.2579)
        // Titik 2: Bergeser sekitar 10 meter ke timur
        let p1 = Coordinates::new(-5.3817, 105.2579);
        let p2 = Coordinates::new(-5.3817, 105.25799); // beda 0.00009 deg lng ~= 9.97 meter

        let dist = calculate_haversine_distance(&p1, &p2);
        assert!(dist > 9.0 && dist < 11.0, "Jarak harus sekitar 10 meter, actual: {}", dist);
    }

    #[test]
    fn test_postgis_dedup_under_15_meters() {
        let base_ticket = mock_ticket("TKT-001", -5.3817, 105.2579, TicketStatus::DalamPengerjaan);
        let tickets = vec![base_ticket];

        // Laporan baru berada 8.5 meter dari titik aduan sebelumnya
        let new_report_coords = Coordinates::new(-5.38175, 105.25795);
        let result = find_duplicate_ticket(&new_report_coords, &tickets, DEDUPLICATION_RADIUS_METERS);

        assert!(result.is_some(), "Aduan harus terdeteksi sebagai duplikat");
        let (matched_ticket, dist) = result.unwrap();
        assert_eq!(matched_ticket.id, "TKT-001");
        assert!(dist < 15.0, "Jarak harus < 15m");
    }

    #[test]
    fn test_postgis_dedup_outside_15_meters_not_filtered() {
        let base_ticket = mock_ticket("TKT-001", -5.3817, 105.2579, TicketStatus::DalamPengerjaan);
        let tickets = vec![base_ticket];

        // Laporan baru berada 45 meter dari titik aduan (lokasi lain di jalan yang sama)
        let new_report_coords = Coordinates::new(-5.3821, 105.2579);
        let result = find_duplicate_ticket(&new_report_coords, &tickets, DEDUPLICATION_RADIUS_METERS);

        assert!(result.is_none(), "Aduan di luar radius 15m TIDAK boleh dianggap duplikat");
    }

    #[test]
    fn test_completed_ticket_does_not_block_new_report() {
        // Tiket lama sudah selesai (status SELESAI) di lokasi yang sama persis
        let completed_ticket = mock_ticket("TKT-OLD", -5.3817, 105.2579, TicketStatus::Selesai);
        let tickets = vec![completed_ticket];

        let new_report_coords = Coordinates::new(-5.3817, 105.2579);
        let result = find_duplicate_ticket(&new_report_coords, &tickets, DEDUPLICATION_RADIUS_METERS);

        assert!(result.is_none(), "Tiket SELESAI tidak boleh memblokir aduan baru!");
    }
}

