-- ============================================================================
-- SLA Tracker Kota Bandar Lampung - PostgreSQL + PostGIS Schema
-- Disusun untuk Proyek Pengembangan Sistem Informasi (UTS 2026)
-- Pengembang: Wahyu Yolan Ageng Pangestu
-- Pembimbing: Dr. Erliyan Redy Susanto, M.Kom
-- ============================================================================

-- 1. Inisialisasi Ekstensi PostGIS untuk Geospasial Native
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enum Tipe Data
DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('P0', 'P1', 'P2', 'P3');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM (
        'TERKIRIM', 
        'DIRESPON', 
        'DALAM_PENGERJAAN', 
        'MENUNGGU_VERIFIKASI', 
        'SELESAI', 
        'ESKALASI_KADIS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tabel Utama: Tickets
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(64) NOT NULL,
    priority ticket_priority NOT NULL DEFAULT 'P2',
    status ticket_status NOT NULL DEFAULT 'TERKIRIM',
    opd VARCHAR(64) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    district VARCHAR(64) NOT NULL,
    
    -- PostGIS Native Geography Point (SRID 4326: WGS84 GPS standard)
    -- Koordinat disimpan sebagai Point(longitude, latitude)
    geom GEOGRAPHY(Point, 4326) NOT NULL,
    
    citizen_name VARCHAR(128) NOT NULL,
    citizen_nik_encrypted VARCHAR(255) NOT NULL,
    citizen_phone VARCHAR(32) NOT NULL,
    citizen_phone_encrypted TEXT,
    photo_before_url TEXT NOT NULL,
    photo_after_url TEXT,
    completion_notes TEXT,
    
    total_sla_seconds INTEGER NOT NULL,
    elapsed_seconds INTEGER NOT NULL DEFAULT 0,
    mtta_target_minutes INTEGER NOT NULL,
    mttr_target_hours INTEGER NOT NULL,
    
    is_escalated BOOLEAN NOT NULL DEFAULT FALSE,
    escalated_at TIMESTAMPTZ,
    escalation_reason TEXT,
    
    duplicate_of VARCHAR(32) REFERENCES tickets(id),
    duplicate_count INTEGER NOT NULL DEFAULT 0,
    assigned_team VARCHAR(128),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- KRUSIAL: PostGIS Spatial Index (GiST)
-- Mengeliminasi 'Spatial Index Delay' & Full Table Scan pada query ST_DWithin
-- ============================================================================
-- 1. GiST Spatial Index pada seluruh data geografi
CREATE INDEX IF NOT EXISTS idx_tickets_geom_gist 
ON tickets USING GIST (geom);

-- 2. Partial GiST Spatial Index khusus untuk tiket yang masih aktif (status != 'SELESAI')
-- Mengoptimalkan query ST_DWithin radius < 15m agar hanya memindai tiket aktif dalam memori cache
CREATE INDEX IF NOT EXISTS idx_tickets_active_geom_gist 
ON tickets USING GIST (geom) 
WHERE status != 'SELESAI';

-- B-Tree Index untuk Filter Status & OPD
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_opd ON tickets(opd);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);

-- 4. Tabel Audit Trail (Append-Only Log)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id VARCHAR(32) NOT NULL REFERENCES tickets(id),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tx_hash VARCHAR(64) NOT NULL,
    actor VARCHAR(128) NOT NULL,
    role VARCHAR(64) NOT NULL,
    action TEXT NOT NULL,
    status VARCHAR(32) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_ticket ON audit_logs(ticket_id);

-- ============================================================================
-- OWASP A01: Row Level Security (RLS) - Database Multi-Tenant Isolation
-- ============================================================================
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;


