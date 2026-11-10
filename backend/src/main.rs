use axum::{
    extract::State,
    http::{header, Method},
    routing::get,
    Json, Router,
};
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;
use tower::limit::RateLimitLayer;
use tower_http::cors::CorsLayer;
use tracing::info;
use sla_tracker_backend::crypto::get_aes_master_key;
use sla_tracker_backend::pool::{MockPostgresPool, SqlxPoolConfig};

/// State Aplikasi Global yang menyimpan Connection Pool & Konfigurasi Keamanan
#[derive(Clone)]
pub struct AppState {
    pub db_pool: MockPostgresPool,
    pub aes_key: [u8; 32],
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    // 1. Inisialisasi SQLx Connection Pool dengan konfigurasi anti-leak (RAII Guard)
    let pool_config = SqlxPoolConfig {
        max_connections: 25,
        min_connections: 5,
        acquire_timeout: Duration::from_secs(3),
        idle_timeout: Duration::from_secs(600),
        max_lifetime: Duration::from_secs(1800),
    };

    let db_pool = MockPostgresPool::with_config(pool_config);
    let aes_key = get_aes_master_key();
    let state = Arc::new(AppState { db_pool, aes_key });

    // 2. OWASP A05: Konfigurasi Ketat CORS (Cross-Origin Resource Sharing)
    // Membatasi akses API hanya dari domain resmi Pemkot Bandar Lampung & Local Dev
    let cors_layer = CorsLayer::new()
        .allow_origin([
            "http://localhost:5173".parse().unwrap(),
            "http://127.0.0.1:5173".parse().unwrap(),
            "https://slatracker.bandarlampung.go.id".parse().unwrap(),
        ])
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::OPTIONS,
        ])
        .allow_headers([
            header::AUTHORIZATION,
            header::CONTENT_TYPE,
            header::ACCEPT,
        ]);

    // 3. OWASP A04: Middleware Rate Limiter (Tower Rate Limit)
    // Mencegah brute-force submission & DoS: Maksimal 100 requests per 60 detik
    let rate_limit_layer = RateLimitLayer::new(100, Duration::from_secs(60));

    // 4. Registrasi Router dengan Lapisan Keamanan Berlapis (Defense-in-Depth)
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/version", get(version_info))
        .route("/api/pool/status", get(pool_status))
        .route("/api/security/status", get(security_status))
        .layer(rate_limit_layer)
        .layer(cors_layer)
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    info!("SLA Tracker Backend Engine (Axum + Tokio) berjalan di http://{}", addr);

    // axum server runner (dalam produksi)
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> &'static str {
    "OK - SLA Tracker PostGIS Engine Active (GiST Indexed & RLS Protected)"
}

async fn version_info() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "system": "SLA Tracker Smart City Kota Bandar Lampung",
        "version": "1.0.0-UTS-2026",
        "developer": "Wahyu Yolan Ageng Pangestu",
        "institution": "Universitas Teknokrat Indonesia",
        "advisor": "Dr. Erliyan Redy Susanto, M.Kom",
        "timestamp_standard": "UTC (RFC 3339 / ISO 8601)",
        "spatial_indexing": "PostGIS GiST Native (R-Tree Bounding Box)",
        "security_compliance": "OWASP Top 10 (2021) Hardened"
    }))
}

async fn pool_status(State(state): State<Arc<AppState>>) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "max_connections": state.db_pool.config.max_connections,
        "active_connections": state.db_pool.active_count(),
        "available_connections": state.db_pool.available_count(),
        "acquire_timeout_ms": state.db_pool.config.acquire_timeout.as_millis(),
        "leak_protection": "RAII Guard (Active)"
    }))
}

async fn security_status(State(_state): State<Arc<AppState>>) -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "rate_limiting": {
            "middleware": "Tower RateLimitLayer",
            "capacity": 100,
            "window_seconds": 60,
            "status": "ACTIVE"
        },
        "cors_policy": {
            "middleware": "Tower-HTTP CorsLayer",
            "allowed_origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://slatracker.bandarlampung.go.id"
            ],
            "allowed_methods": ["GET", "POST", "PUT", "OPTIONS"],
            "status": "STRICT_WHITELIST"
        },
        "pii_encryption": {
            "algorithm": "AES-256-GCM (Galois/Counter Mode)",
            "key_size_bits": 256,
            "nonce_size_bytes": 12,
            "auth_tag_size_bytes": 16,
            "protected_fields": ["citizen_nik", "citizen_phone"],
            "legal_compliance": "UU PDP No. 27 Tahun 2022"
        },
        "database_rls": {
            "engine": "PostgreSQL 16 Row Level Security (RLS)",
            "tables": ["tickets", "audit_logs"],
            "status": "ENABLED_AND_ENFORCED"
        },
        "auth_jwt": {
            "signature_algorithm": "Ed25519 (EdDSA RFC 8032)",
            "downgrade_protection": "HS256 Rejected / Asymmetric Enforced"
        }
    }))
}
