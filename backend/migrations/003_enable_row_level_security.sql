-- ============================================================================
-- SLA Tracker Kota Bandar Lampung - Database Security Hardening
-- Migrasi 003: Row Level Security (RLS) & Multi-Tenant OPD Isolation
-- Disusun untuk Proyek Pengembangan Sistem Informasi (PPSI) - UTS 2026
-- Pengembang: Wahyu Yolan Ageng Pangestu (NPM: 23311017)
-- Pembimbing: Dr. Erliyan Redy Susanto, M.Kom
--
-- Kepatuhan OWASP Top 10 (A01:2021 - Broken Access Control)
-- Mencegah akses data lintas dinas dan kebocoran data warga privat
-- ============================================================================

-- 1. Mengaktifkan Row Level Security (RLS) pada Tabel Utama
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets FORCE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- 2. Bersihkan Kebijakan Lama (Idempotent)
DROP POLICY IF EXISTS p_tickets_insert_public ON tickets;
DROP POLICY IF EXISTS p_tickets_citizen_select ON tickets;
DROP POLICY IF EXISTS p_tickets_opd_isolation ON tickets;
DROP POLICY IF EXISTS p_tickets_opd_update ON tickets;
DROP POLICY IF EXISTS p_tickets_superadmin_full ON tickets;
DROP POLICY IF EXISTS p_audit_logs_insert_append ON audit_logs;
DROP POLICY IF EXISTS p_audit_logs_select_authorized ON audit_logs;

-- ============================================================================
-- KEBIJAKAN ROW LEVEL SECURITY (RLS) - TABEL TICKETS
-- ============================================================================

-- A. Warga / Pelapor Publik:
-- Diizinkan membuat (INSERT) aduan baru ke sistem
CREATE POLICY p_tickets_insert_public 
ON tickets 
FOR INSERT 
TO PUBLIC 
WITH CHECK (true);

-- B. Warga: Hanya dapat membaca (SELECT) tiket yang dilaporkan oleh dirinya sendiri
-- Berdasarkan session variable identitas warga: current_setting('app.current_citizen_nik_hash')
CREATE POLICY p_tickets_citizen_select 
ON tickets 
FOR SELECT 
TO PUBLIC 
USING (
    citizen_nik_encrypted = current_setting('app.current_citizen_nik_hash', true)
    OR current_setting('app.current_role', true) = 'sla_kadis_admin'
);

-- C. Petugas OPD Lapangan (PUPR, Dishub, DLH, BPBD):
-- Hanya dapat melihat tiket yang menjadi tupoksi dinas masing-masing
-- current_setting('app.current_opd') diisi saat autentikasi JWT berhasil
CREATE POLICY p_tickets_opd_isolation 
ON tickets 
FOR SELECT 
TO PUBLIC 
USING (
    opd = current_setting('app.current_opd', true)
    OR current_setting('app.current_role', true) = 'sla_kadis_admin'
);

-- D. Petugas OPD Lapangan:
-- Hanya dapat memperbarui status tiket dalam wilayah wewenang dinasnya
CREATE POLICY p_tickets_opd_update 
ON tickets 
FOR UPDATE 
TO PUBLIC 
USING (
    opd = current_setting('app.current_opd', true)
    OR current_setting('app.current_role', true) = 'sla_kadis_admin'
)
WITH CHECK (
    opd = current_setting('app.current_opd', true)
    OR current_setting('app.current_role', true) = 'sla_kadis_admin'
);

-- ============================================================================
-- KEBIJAKAN ROW LEVEL SECURITY (RLS) - TABEL AUDIT LOGS (APPEND-ONLY)
-- ============================================================================

-- E. Audit Log: Append-Only (Hanya INSERT diizinkan)
CREATE POLICY p_audit_logs_insert_append 
ON audit_logs 
FOR INSERT 
TO PUBLIC 
WITH CHECK (true);

-- F. Audit Log: Hanya role tertentu (Kadis, Inspektorat, Auditor) yang dapat membaca
CREATE POLICY p_audit_logs_select_authorized 
ON audit_logs 
FOR SELECT 
TO PUBLIC 
USING (
    current_setting('app.current_role', true) IN ('sla_kadis_admin', 'sla_auditor', 'sla_opd_officer')
);

-- PERHATIKAN: TIDAK ADA POLICY UNTUK UPDATE ATAU DELETE PADA audit_logs!
-- PostgreSQL RLS secara otomatis menolak seluruh operasi UPDATE dan DELETE,
-- menjamin integritas forensik log (Immutable Audit Trail) tanpa celah manipulasi.

