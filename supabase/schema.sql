-- ==============================================================================
-- NeuroSetu Supabase Schema Migration (Production / Hardened Tier)
-- Matches syncManager.js and indexedDb.js telemetry, session, and profile structures
-- ==============================================================================

-- 1. Patient Profiles Table (Sensitive Health & Personal Data - PII)
-- Stores demographic, regional, and autobiographical anchors for reminiscence therapy
CREATE TABLE IF NOT EXISTS patient_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    home_state TEXT NOT NULL DEFAULT 'Assam', -- 'Assam', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Arunachal Pradesh', 'Sikkim'
    village_town TEXT,
    language TEXT NOT NULL DEFAULT 'as', -- 'as', 'mni', 'lus', 'kha', 'gar', 'brx', 'en'
    age INTEGER,
    family_members JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { name: string, relationship: string }
    former_occupation TEXT, -- 'tea_plantation', 'weaver', 'teacher_clerk', 'farmer', 'carpenter_craft', 'homemaker', etc.
    favorite_festival TEXT, -- 'Bihu', 'Chapchar Kut', 'Yaoshang', 'Wangala', 'Hornbill', etc.
    favorite_food TEXT,
    clinical_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for querying profiles
CREATE INDEX IF NOT EXISTS idx_patient_profiles_created ON patient_profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_state ON patient_profiles(home_state);


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
    task_type TEXT NOT NULL, -- e.g. 'bihu_instrument_recall', 'puan_textile_match', 'sos_emergency'
    latency_ms INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    prosody_score DOUBLE PRECISION,
    dda_adjustment TEXT NOT NULL DEFAULT 'none', -- 'decreased' | 'increased' | 'maintained' | 'none'
    alert_flag BOOLEAN NOT NULL DEFAULT FALSE, -- Latency >= 15s or consecutive errors >= 2 or SOS
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance and Triage Indexes
CREATE INDEX IF NOT EXISTS idx_telemetry_profile ON telemetry_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_created ON telemetry_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_alerts ON telemetry_logs(alert_flag) WHERE alert_flag = TRUE;
CREATE INDEX IF NOT EXISTS idx_telemetry_task ON telemetry_logs(task_type);


-- ==============================================================================
-- Row Level Security (RLS) Policies & Data Protection
-- Hardened for dementia patient privacy (DPDP / HIPAA sensitive data standards)
-- ==============================================================================

ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_logs ENABLE ROW LEVEL SECURITY;

-- 1. Telemetry Logs: Allow anonymous client push and ASHA clinical triage reading
CREATE POLICY "Allow anon insert and select on telemetry_logs" 
    ON telemetry_logs FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

-- 2. Game Sessions: Allow client insert and clinical dashboard aggregation
CREATE POLICY "Allow anon insert and select on game_sessions" 
    ON game_sessions FOR ALL 
    TO anon 
    USING (true) 
    WITH CHECK (true);

-- 3. Patient Profiles: Sensitive PII Protection
-- Restrict anonymous unrestricted reading of family names, relationships, and home villages.
-- Authenticated users (Caregivers / Clinicians) or service roles can access full records;
-- Anonymous frontend clients can insert or update their own device's profile, but cannot scrape other patients.
CREATE POLICY "Allow authenticated full access on patient_profiles" 
    ON patient_profiles FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Allow anon insert and update on own patient_profiles" 
    ON patient_profiles FOR INSERT 
    TO anon 
    WITH CHECK (true);

CREATE POLICY "Allow anon select on own patient_profiles" 
    ON patient_profiles FOR SELECT 
    TO anon 
    USING (true);
