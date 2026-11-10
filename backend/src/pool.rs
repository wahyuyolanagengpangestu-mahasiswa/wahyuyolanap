use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;
use thiserror::Error;

#[derive(Debug, Error, PartialEq)]
pub enum PoolError {
    #[error("Koneksi pool habis (PoolTimedOut: waktu tunggu akuisisi melebihi batas {0:?})")]
    PoolExhausted(Duration),
    #[error("Koneksi ditutup tidak wajar atau idle timeout terlampaui")]
    ConnectionClosed,
    #[error("Timeout saat akuisisi koneksi: task dibatalkan untuk mencegah connection leak")]
    AcquireTimeout,
}

/// Konfigurasi Standar Produksi SQLx Connection Pool untuk Axum & PostGIS
/// Disusun untuk mencegah kebocoran koneksi (Connection Pool Leakage)
#[derive(Debug, Clone)]
pub struct SqlxPoolConfig {
    pub max_connections: u32,
    pub min_connections: u32,
    pub acquire_timeout: Duration,
    pub idle_timeout: Duration,
    pub max_lifetime: Duration,
}

impl Default for SqlxPoolConfig {
    fn default() -> Self {
        Self {
            // Batas maksimal koneksi bersamaan ke PostgreSQL
            max_connections: 25,
            // Batas minimal koneksi standby agar query awal instan
            min_connections: 5,
            // Strict acquire timeout: 3 detik (mencegah thread hanging tanpa batas)
            acquire_timeout: Duration::from_secs(3),
            // Idle timeout: 10 menit (koneksi idle otomatis di-reap)
            idle_timeout: Duration::from_secs(600),
            // Max lifetime: 30 menit (koneksi di-refresh untuk menghindari memory bloat di Postgres)
            max_lifetime: Duration::from_secs(1800),
        }
    }
}

/// Simulasi Connection Pool PostgreSQL/SQLx dengan Proteksi Kebocoran Koneksi
#[derive(Debug, Clone)]
pub struct MockPostgresPool {
    pub config: SqlxPoolConfig,
    active_connections: Arc<AtomicUsize>,
    total_acquired: Arc<AtomicUsize>,
    total_released: Arc<AtomicUsize>,
    timeout_failures: Arc<AtomicUsize>,
}

impl MockPostgresPool {
    pub fn new(max_connections: usize, acquire_timeout: Duration) -> Self {
        let mut config = SqlxPoolConfig::default();
        config.max_connections = max_connections as u32;
        config.acquire_timeout = acquire_timeout;

        Self {
            config,
            active_connections: Arc::new(AtomicUsize::new(0)),
            total_acquired: Arc::new(AtomicUsize::new(0)),
            total_released: Arc::new(AtomicUsize::new(0)),
            timeout_failures: Arc::new(AtomicUsize::new(0)),
        }
    }

    pub fn with_config(config: SqlxPoolConfig) -> Self {
        Self {
            config,
            active_connections: Arc::new(AtomicUsize::new(0)),
            total_acquired: Arc::new(AtomicUsize::new(0)),
            total_released: Arc::new(AtomicUsize::new(0)),
            timeout_failures: Arc::new(AtomicUsize::new(0)),
        }
    }

    /// Akuisisi koneksi mentah (Raw acquire)
    pub fn acquire_raw(&self) -> Result<usize, PoolError> {
        let current = self.active_connections.load(Ordering::SeqCst);
        if current >= self.config.max_connections as usize {
            self.timeout_failures.fetch_add(1, Ordering::SeqCst);
            return Err(PoolError::PoolExhausted(self.config.acquire_timeout));
        }
        self.active_connections.fetch_add(1, Ordering::SeqCst);
        self.total_acquired.fetch_add(1, Ordering::SeqCst);
        Ok(self.active_connections.load(Ordering::SeqCst))
    }

    /// Pelepasan manual koneksi kembali ke pool
    pub fn release_raw(&self) {
        if self.active_connections.load(Ordering::SeqCst) > 0 {
            self.active_connections.fetch_sub(1, Ordering::SeqCst);
            self.total_released.fetch_add(1, Ordering::SeqCst);
        }
    }

    /// SOLUSI BUG CONNECTION LEAK: Akuisisi dengan RAII Guard
    /// Koneksi SELALU dikembalikan ke pool saat Guard keluar dari scope (Drop).
    pub fn acquire_guarded(&self) -> Result<PooledConnectionGuard, PoolError> {
        self.acquire_raw()?;
        Ok(PooledConnectionGuard {
            pool: self.clone(),
            is_active: true,
        })
    }

    pub fn active_count(&self) -> usize {
        self.active_connections.load(Ordering::SeqCst)
    }

    pub fn available_count(&self) -> usize {
        (self.config.max_connections as usize).saturating_sub(self.active_count())
    }

    pub fn timeout_failure_count(&self) -> usize {
        self.timeout_failures.load(Ordering::SeqCst)
    }
}

/// RAII Guard: Memastikan koneksi SQLx selalu di-release kembali ke pool secara otomatis
pub struct PooledConnectionGuard {
    pool: MockPostgresPool,
    is_active: bool,
}

impl Drop for PooledConnectionGuard {
    fn drop(&mut self) {
        if self.is_active {
            self.pool.release_raw();
            self.is_active = false;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_optimized_pool_config_defaults() {
        let config = SqlxPoolConfig::default();
        assert_eq!(config.max_connections, 25);
        assert_eq!(config.min_connections, 5);
        assert_eq!(config.acquire_timeout, Duration::from_secs(3));
        assert_eq!(config.idle_timeout, Duration::from_secs(600));
        assert_eq!(config.max_lifetime, Duration::from_secs(1800));
    }

    #[test]
    fn test_strict_acquire_timeout_prevents_indefinite_hang() {
        let pool = MockPostgresPool::new(2, Duration::from_millis(50));

        // Ambil 2 koneksi yang tersedia
        let _c1 = pool.acquire_raw().expect("Koneksi 1 sukses");
        let _c2 = pool.acquire_raw().expect("Koneksi 2 sukses");

        // Request ke-3 harus gagal dengan timeout tanpa membuat server hang
        let req3 = pool.acquire_raw();
        assert_eq!(req3, Err(PoolError::PoolExhausted(Duration::from_millis(50))));
        assert_eq!(pool.timeout_failure_count(), 1);
    }

    #[test]
    fn test_raii_guard_prevents_connection_leak_on_early_return() {
        let pool = MockPostgresPool::new(5, Duration::from_secs(3));

        fn query_handler_with_early_return(pool: &MockPostgresPool, should_fail: bool) -> Result<(), &'static str> {
            let _conn = pool.acquire_guarded().map_err(|_| "pool timeout")?;
            if should_fail {
                return Err("Simulasi unhandled error / early return ?");
            }
            Ok(())
        }

        // Jalankan 15 eksekusi dengan berbagai kegagalan
        for i in 0..15 {
            let _ = query_handler_with_early_return(&pool, i % 2 == 0);
        }

        // Karena menggunakan RAII Guard, active connections harus tetap 0
        assert_eq!(pool.active_count(), 0, "Terdeteksi kebocoran koneksi!");
        assert_eq!(pool.available_count(), 5);
    }
}
