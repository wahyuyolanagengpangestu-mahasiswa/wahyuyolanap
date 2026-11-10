// ============================================================================
// Modul Kriptografi SLA Tracker - Kota Bandar Lampung
// Pengembang: Wahyu Yolan Ageng Pangestu (NPM: 23311017)
// Pembimbing: Dr. Erliyan Redy Susanto, M.Kom
//
// Implementasi:
// 1. Enkripsi AES-256-GCM (Authenticated Encryption with Associated Data)
//    - Proteksi Data PII Warga (NIK 16 Digit & Nomor HP/WhatsApp)
//    - Memenuhi UU PDP No. 27 Tahun 2022 & OWASP A02:2021 Cryptographic Failures
// 2. Tanda Tangan Digital Ed25519 (Edwards-curve Digital Signature Algorithm)
//    - Mencegah Pemalsuan JWT & Algoritma Downgrade Attack (EdDSA vs HS256)
// ============================================================================

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use rand::RngCore;
use std::env;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CryptoError {
    #[error("Kunci enkripsi tidak valid: {0}")]
    InvalidKeyLength(String),
    #[error("Enkripsi gagal: {0}")]
    EncryptionFailed(String),
    #[error("Dekripsi gagal atau otentikasi data terkorupsi (Tag Mismatch): {0}")]
    DecryptionFailed(String),
    #[error("Format payload terenkripsi tidak valid")]
    InvalidPayloadFormat,
    #[error("Format Base64 tidak valid: {0}")]
    Base64Error(String),
    #[error("Tanda tangan Ed25519 tidak valid: {0}")]
    InvalidSignature(String),
}

/// Standar Default Master Key (Dev/Test) - Dalam mode produksi diambil dari variabel lingkungan `AES_KEY`
pub const DEFAULT_DEV_AES_KEY: [u8; 32] = [
    0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6,
    0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c,
    0x76, 0x2e, 0x71, 0x60, 0xf3, 0x8b, 0x4d, 0xa5,
    0x6a, 0x78, 0x4d, 0x90, 0x45, 0x19, 0x0c, 0xfe,
];

/// Helper untuk mendapatkan 32-byte AES-256 Secret Key
pub fn get_aes_master_key() -> [u8; 32] {
    if let Ok(key_str) = env::var("AES_KEY") {
        if let Ok(decoded) = BASE64.decode(key_str.trim()) {
            if decoded.len() == 32 {
                let mut key = [0u8; 32];
                key.copy_from_slice(&decoded);
                return key;
            }
        }
    }
    DEFAULT_DEV_AES_KEY
}

/// Enkripsi data PII (NIK / Nomor HP) menggunakan AES-256-GCM
/// Menghasilkan format: `aes256gcm:<base64(12_byte_nonce + ciphertext_with_auth_tag)>`
pub fn encrypt_aes_256_gcm(plaintext: &str, key: &[u8; 32]) -> Result<String, CryptoError> {
    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|e| CryptoError::InvalidKeyLength(e.to_string()))?;

    // Generate 96-bit (12 bytes) Cryptographically Secure Random Nonce (IV)
    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    // Enkripsi terotentikasi (Ciphertext + 16-byte Poly1305 Tag)
    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| CryptoError::EncryptionFailed(e.to_string()))?;

    // Gabungkan Nonce (12B) + Ciphertext + Tag
    let mut combined = Vec::with_capacity(12 + ciphertext.len());
    combined.extend_from_slice(&nonce_bytes);
    combined.extend_from_slice(&ciphertext);

    let b64 = BASE64.encode(combined);
    Ok(format!("aes256gcm:{}", b64))
}

/// Dekripsi data PII terenkripsi AES-256-GCM
/// Memvalidasi integritas ciphertext dan tag otentikasi
pub fn decrypt_aes_256_gcm(encrypted_payload: &str, key: &[u8; 32]) -> Result<String, CryptoError> {
    let payload = if let Some(stripped) = encrypted_payload.strip_prefix("aes256gcm:") {
        stripped
    } else {
        return Err(CryptoError::InvalidPayloadFormat);
    };

    let combined = BASE64
        .decode(payload)
        .map_err(|e| CryptoError::Base64Error(e.to_string()))?;

    if combined.len() < 12 + 16 {
        return Err(CryptoError::InvalidPayloadFormat);
    }

    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);

    let cipher = Aes256Gcm::new_from_slice(key)
        .map_err(|e| CryptoError::InvalidKeyLength(e.to_string()))?;

    let decrypted = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| CryptoError::DecryptionFailed(e.to_string()))?;

    String::from_utf8(decrypted).map_err(|e| CryptoError::DecryptionFailed(e.to_string()))
}

/// Masking NIK untuk kebutuhan audit non-privileged (16 Digit: 6 digit awal, 6 bintang, 4 digit akhir)
pub fn mask_nik(nik: &str) -> String {
    let clean = nik.trim();
    if clean.len() >= 16 {
        format!("{}******{}", &clean[..6], &clean[12..])
    } else if clean.len() >= 8 {
        format!("{}****{}", &clean[..4], &clean[clean.len() - 4..])
    } else {
        "****************".to_string()
    }
}

/// Masking Nomor HP untuk kebutuhan tampilan publik/operator
pub fn mask_phone(phone: &str) -> String {
    let clean = phone.trim();
    if clean.len() >= 10 {
        format!("{}-****-{}", &clean[..4], &clean[clean.len() - 4..])
    } else {
        "08**-****-****".to_string()
    }
}

/// Validasi Tanda Tangan Digital Ed25519 untuk Autentikasi JWT / Token Petugas
pub struct Ed25519Verifier {
    public_key: VerifyingKey,
}

impl Ed25519Verifier {
    pub fn new(public_key_bytes: &[u8; 32]) -> Result<Self, CryptoError> {
        let public_key = VerifyingKey::from_bytes(public_key_bytes)
            .map_err(|e| CryptoError::InvalidSignature(e.to_string()))?;
        Ok(Self { public_key })
    }

    /// Verifikasi tanda tangan digital Ed25519 atas pesan (Payload JWT)
    pub fn verify_signature(&self, message: &[u8], signature_bytes: &[u8; 64]) -> bool {
        let signature = Signature::from_bytes(signature_bytes);
        self.public_key.verify(message, &signature).is_ok()
    }
}

/// Helper untuk signing token petugas lapangan menggunakan Ed25519 Private Key
pub fn sign_ed25519_token(message: &[u8], signing_key_bytes: &[u8; 32]) -> [u8; 64] {
    let signing_key = SigningKey::from_bytes(signing_key_bytes);
    let signature = signing_key.sign(message);
    signature.to_bytes()
}

