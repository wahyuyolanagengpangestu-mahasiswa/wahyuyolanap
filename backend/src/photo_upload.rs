use crate::models::Coordinates;
use thiserror::Error;

#[derive(Debug, Error, PartialEq)]
pub enum PhotoUploadError {
    #[error("Ukuran file melebihi batas maksimal (10 MB)")]
    FileTooLarge,
    #[error("Format file tidak valid. Hanya format JPEG/PNG yang didukung")]
    InvalidFormat,
    #[error("Metadata EXIF tidak ditemukan pada foto")]
    ExifNotFound,
    #[error("Koordinat GPS tidak ditemukan dalam metadata foto")]
    GpsNotFound,
    #[error("Koordinat berada di luar wilayah hukum Kota Bandar Lampung ({0:?})")]
    OutOfBoundary(Coordinates),
}

const MAX_FILE_SIZE: usize = 10 * 1024 * 1024; // 10MB
const JPEG_MAGIC: &[u8] = &[0xFF, 0xD8, 0xFF];
const PNG_MAGIC: &[u8] = &[0x89, 0x50, 0x4E, 0x47];

/// Verifikasi Magic Byte gambar untuk keamanan upload
pub fn verify_image_bytes(bytes: &[u8]) -> Result<&'static str, PhotoUploadError> {
    if bytes.len() > MAX_FILE_SIZE {
        return Err(PhotoUploadError::FileTooLarge);
    }
    if bytes.len() < 4 {
        return Err(PhotoUploadError::InvalidFormat);
    }

    if bytes.starts_with(JPEG_MAGIC) {
        Ok("image/jpeg")
    } else if bytes.starts_with(PNG_MAGIC) {
        Ok("image/png")
    } else {
        Err(PhotoUploadError::InvalidFormat)
    }
}

/// Struktur representasi data mentah GPS EXIF
#[derive(Debug, Clone, PartialEq)]
pub struct RawExifGps {
    pub lat_deg: f64,
    pub lat_min: f64,
    pub lat_sec: f64,
    pub lat_ref: char, // 'N' atau 'S'
    pub lng_deg: f64,
    pub lng_min: f64,
    pub lng_sec: f64,
    pub lng_ref: char, // 'E' atau 'W'
}

/// Mengonversi format Derajat-Menit-Detik (DMS) menjadi Derajat Desimal (DD)
/// BUG IDENTIFIKASI & FIX:
/// Banyak parser pemula lupa menegasikan derajat jika lat_ref == 'S' (Selatan) atau lng_ref == 'W' (Barat).
/// Di Indonesia (termasuk Bandar Lampung), Latitude berada di Lintang Selatan (S), sehingga bernilai negatif!
pub fn dms_to_decimal(deg: f64, min: f64, sec: f64, ref_char: char) -> f64 {
    let mut dd = deg + (min / 60.0) + (sec / 3600.0);
    if ref_char == 'S' || ref_char == 's' || ref_char == 'W' || ref_char == 'w' {
        dd = -dd;
    }
    dd
}

/// Ekstrak koordinat GPS dari data mentah EXIF
pub fn extract_coordinates_from_exif(raw: &RawExifGps) -> Result<Coordinates, PhotoUploadError> {
    let lat = dms_to_decimal(raw.lat_deg, raw.lat_min, raw.lat_sec, raw.lat_ref);
    let lng = dms_to_decimal(raw.lng_deg, raw.lng_min, raw.lng_sec, raw.lng_ref);

    let coords = Coordinates::new(lat, lng);

    // Verifikasi batas wilayah Bandar Lampung
    if !coords.is_within_bandar_lampung() {
        return Err(PhotoUploadError::OutOfBoundary(coords));
    }

    Ok(coords)
}

/// Simulasi parser EXIF dari byte foto JPEG
pub fn parse_photo_and_extract_gps(bytes: &[u8], mock_gps: Option<RawExifGps>) -> Result<Coordinates, PhotoUploadError> {
    verify_image_bytes(bytes)?;

    let raw_gps = mock_gps.ok_or(PhotoUploadError::GpsNotFound)?;
    extract_coordinates_from_exif(&raw_gps)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_jpeg_magic_bytes() {
        let valid_jpeg = vec![0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10];
        assert_eq!(verify_image_bytes(&valid_jpeg), Ok("image/jpeg"));
    }

    #[test]
    fn test_invalid_magic_bytes_rejected() {
        let fake_exe = vec![0x4D, 0x5A, 0x90, 0x00]; // MZ executable header
        assert_eq!(verify_image_bytes(&fake_exe), Err(PhotoUploadError::InvalidFormat));
    }

    #[test]
    fn test_file_exceeds_max_size() {
        let huge_dummy = vec![0u8; 11 * 1024 * 1024]; // 11MB
        assert_eq!(verify_image_bytes(&huge_dummy), Err(PhotoUploadError::FileTooLarge));
    }

    #[test]
    fn test_exif_gps_extraction_bandar_lampung_kedaton() {
        // Jl. Z.A. Pagar Alam (Kedaton): 5° 22' 54.12" S, 105° 15' 28.44" E (-5.3817, 105.2579)
        let raw = RawExifGps {
            lat_deg: 5.0,
            lat_min: 22.0,
            lat_sec: 54.12,
            lat_ref: 'S',
            lng_deg: 105.0,
            lng_min: 15.0,
            lng_sec: 28.44,
            lng_ref: 'E',
        };

        let coords = extract_coordinates_from_exif(&raw).expect("GPS harus valid");
        assert!((coords.lat - (-5.3817)).abs() < 0.001);
        assert!((coords.lng - 105.2579).abs() < 0.001);
        assert!(coords.is_within_bandar_lampung());
    }

    #[test]
    fn test_hemisphere_negation_bug_prevented() {
        // Menguji bahwa ref 'S' benar-benar menghasilkan koordinat negatif
        let lat = dms_to_decimal(5.0, 30.0, 0.0, 'S');
        assert_eq!(lat, -5.5);

        let lat_north = dms_to_decimal(5.0, 30.0, 0.0, 'N');
        assert_eq!(lat_north, 5.5);
    }

    #[test]
    fn test_coordinates_outside_bandar_lampung_rejected() {
        // Lokasi di Jakarta (-6.2088, 106.8456)
        let raw_jakarta = RawExifGps {
            lat_deg: 6.0,
            lat_min: 12.0,
            lat_sec: 31.68,
            lat_ref: 'S',
            lng_deg: 106.0,
            lng_min: 50.0,
            lng_sec: 44.16,
            lng_ref: 'E',
        };

        let res = extract_coordinates_from_exif(&raw_jakarta);
        assert!(matches!(res, Err(PhotoUploadError::OutOfBoundary(_))));
    }
}

