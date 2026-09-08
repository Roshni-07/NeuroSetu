# NeuroSetu Backend API

Production backend service for the **NeuroSetu** cognitive stimulation and dementia care platform across North-Eastern India (NER).

Built with **FastAPI**, **PostgreSQL**, and **Redis**, designed for offline-first delta synchronization, passive biomarker telemetry ingestion, ASHA caseload triage management, and secure Bhashini speech proxying.

---

## Architecture & System Overview

For the complete architectural design, database DDL, API contracts, offline sync protocol, and DPDP/ABDM compliance specifications, refer to the design specification:
- **Architecture Specification**: [Backend Architecture Specification](file:///C:/Users/ROSHNI/.gemini/antigravity/brain/7ed841c5-d027-4d67-a6c7-b7dcd67227ec/backend_architecture_specification.md)

### Key Responsibilities
1. **ASHA Caseload Management**: Full CRUD for patient profiles, demographic capture (8 NER states, languages, family members), and soft-archiving with $\ge 10$ characters clinical justification.
2. **Offline-First Delta Sync**: Idempotent batch ingestion (`POST /api/v1/sync/delta`) of accumulated IndexedDB telemetry and session events from low-connectivity rural households.
3. **Biomarker Analytics & Triage Engine**: Real-time evaluation of response latencies ($>15$s alerts), DDA level adjustments, error streaks, and automatic triage status classification (`critical`, `attention`, `stable`).
4. **Bhashini Speech Gateway**: Server-side proxy for government Bhashini ULCA ASR/TTS/NMT APIs, keeping credentials secure and caching common regional audio clips in Redis.
5. **Data Protection & Compliance**: Adherence to India's DPDP Act 2023, data localization within Indian borders, and ABDM ABHA integration readiness.

---

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entry point & middleware
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── health.py        # /health probe
│   │       ├── auth.py          # /api/v1/auth (PIN & ASHA OTP)
│   │       ├── patients.py      # /api/v1/patients (ASHA caseload CRUD & archive)
│   │       ├── sync.py          # /api/v1/sync/delta (offline queue ingestion)
│   │       ├── telemetry.py     # /api/v1/telemetry (biomarkers & trends)
│   │       └── speech.py        # /api/v1/speech (Bhashini proxy)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Environment settings (Pydantic BaseSettings)
│   │   ├── database.py          # SQLAlchemy / asyncpg engine & sessionmaker
│   │   └── security.py          # JWT, Argon2id hashing, PIN verification
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── patient.py
│   │   ├── session.py
│   │   ├── telemetry.py
│   │   └── alert.py
│   ├── schemas/                 # Pydantic v2 request/response schemas
│   │   ├── patient.py
│   │   ├── sync.py
│   │   └── telemetry.py
│   └── services/                # Business logic & external clients
│       ├── triage_service.py    # Rule-based biomarker evaluation
│       ├── sync_service.py      # Idempotent delta processor
│       └── bhashini_service.py  # Bhashini ULCA REST client
├── requirements.txt             # Python dependencies
├── .env.example                 # Example configuration environment variables
└── README.md                    # This document
```

---

## Getting Started (Local Development)

### 1. Prerequisites
- Python 3.11+
- PostgreSQL 16
- Redis 7

### 2. Environment Configuration
Copy the example environment file and configure secrets:
```bash
cp .env.example .env
```

Key environment variables:
```ini
DATABASE_URL=postgresql+asyncpg://neuro_user:secret@localhost:5432/neurosetu_db
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=change_this_to_a_secure_random_string_in_production
BHASHINI_API_KEY=your_bhashini_ulca_api_key
BHASHINI_USER_ID=your_bhashini_user_id
```

### 3. Install Dependencies
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Run the Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Documentation (Swagger UI): `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

---

## Core API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Liveness & readiness probe | No |
| `POST` | `/api/v1/auth/patient-pin` | 4-digit PIN verification for patient kiosk | No |
| `POST` | `/api/v1/auth/asha-login` | ASHA mobile OTP verification | No |
| `GET` | `/api/v1/patients` | Fetch assigned ASHA patient caseload (filtered by state/status) | ASHA / Clinician |
| `POST` | `/api/v1/patients` | Register new patient (name, age, state, village, language, family) | ASHA / Clinician |
| `PUT` | `/api/v1/patients/{id}` | Update existing patient profile | ASHA / Clinician |
| `POST` | `/api/v1/patients/{id}/archive` | Soft-archive patient (requires $\ge 10$ chars reason) | ASHA / Clinician |
| `POST` | `/api/v1/patients/{id}/unarchive` | Restore archived patient to active caseload | ASHA / Clinician |
| `POST` | `/api/v1/sync/delta` | Batch delta push from offline client IndexedDB | Patient / ASHA |
| `GET` | `/api/v1/telemetry/trends/{patient_id}` | Fetch biomarker latency trend & alert history | Caregiver / ASHA |
| `POST` | `/api/v1/speech/asr` | Transcode & forward audio to Bhashini ASR | Patient |
| `POST` | `/api/v1/speech/tts` | Synthesize & cache regional voice audio | Patient |
