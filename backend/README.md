# NeuroSetu Backend — SIH MVP

FastAPI backend aligned to NeuroSetu: 15-game catalog, adaptive difficulty/mastery, patient/caregiver/ASHA data APIs, offline delta sync, telemetry/triage, family memories/schedules, reminders, dashboard aggregation, content settings, and Bhashini speech proxy.

## Setup
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```
Swagger: http://127.0.0.1:8000/docs

Run `database/schema.sql` in Supabase SQL Editor. Put only server-side credentials in `.env`.

## Fill these values
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or current server-side secret key), JWT_SECRET_KEY, CORS_ORIGINS, BHASHINI_API_KEY, BHASHINI_USER_ID. Fill BHASHINI_PIPELINE_URL only if different. Fill TTS_* only for a non-Bhashini TTS provider.

## Important
The 15 game UIs remain in the frontend because gameplay is designed to run offline in the browser. This backend contains their canonical catalog and APIs for session results, telemetry, adaptive decisions and analytics; it does not duplicate React game rendering.

15 games: Care for Your Companion; Daily Routine Recall; Day in My Village; Festival Memory Match; Find the Difference; Finish Grandma's Weave; Grandma's Shopping List; Memory Map Home; Pack Village Basket; Remember the Story; Shell Memory Trail; Tea Garden Detective; What Belongs Here; Whose Emotion; Whose Morning Is It.

## API groups
/health; /api/v1/auth/*; /patients/*; /games/*; /sessions/*; /adaptive/*; /telemetry/*; /sync/delta; /dashboard/*; /alerts/*; /family/*; /reminders/*; /speech/*; /content/*.

## Prototype security note
The four demo patient PINs are retained for SIH compatibility. Replace them with real authentication before production. Add audited RLS/caseload authorization before handling real patient data.
