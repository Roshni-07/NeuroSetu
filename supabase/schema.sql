-- ==============================================================================
-- NeuroSetu Supabase Schema Migration (Prototype Tier)
-- Matches syncManager.js and indexedDb.js telemetry and session structures
-- ==============================================================================

-- 1. Patient Profiles Table
CREATE TABLE IF NOT EXISTS patient_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'as', -- 'as' (Assamese), 'mni' (Manipuri), etc.
    age INTEGER,
    clinical_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying profiles by creation
CREATE INDEX IF NOT EXISTS idx_patient_profiles_created ON patient_profiles(created_at DESC);


-- 2. Game Sessions Table
CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    game_type TEXT NOT NULL, -- 'memory_recall' | 'pattern_matching' | 'sequencing'
    difficulty_tier INTEGER NOT NULL DEFAULT 1,
    score INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for querying sessions
CREATE INDEX IF NOT EXISTS idx_game_sessions_profile ON game_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_completed ON game_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_type ON game_sessions(game_type);


-- 3. Telemetry & Digital Biomarkers Table
-- Matches payload emitted by syncManager.js
CREATE TABLE IF NOT EXISTS telemetry_logs (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    session_id TEXT,
    task_type TEXT NOT NULL, -- e.g. 'bihu_instrument_recall', 'puan_textile_match'
    latency_ms INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    prosody_score DOUBLE PRECISION,
    dda_adjustment TEXT NOT NULL DEFAULT 'none', -- 'decreased' | 'increased' | 'maintained' | 'none'
    alert_flag BOOLEAN NOT NULL DEFAULT FALSE, -- Latency >= 15s or consecutive errors >= 2
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance and Triage Indexes
CREATE INDEX IF NOT EXISTS idx_telemetry_profile ON telemetry_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_created ON telemetry_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_alerts ON telemetry_logs(alert_flag) WHERE alert_flag = TRUE;
CREATE INDEX IF NOT EXISTS idx_telemetry_task ON telemetry_logs(task_type);


-- ==============================================================================
-- Row Level Security (RLS) Policies (Prototype Tier)
-- Allows anonymous frontend client to push telemetry and read dashboard aggregates
-- ==============================================================================

ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon read & write for prototype tier
CREATE POLICY "Allow anon insert and select on telemetry_logs" 
    ON telemetry_logs FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Allow anon insert and select on game_sessions" 
    ON game_sessions FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Allow anon insert and select on patient_profiles" 
    ON patient_profiles FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);
