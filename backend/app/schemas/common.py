from datetime import datetime
from typing import Any, Literal
from pydantic import BaseModel, Field

class ApiResponse(BaseModel):
    success: bool = True
    data: Any = None
    error: Any = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PatientCreate(BaseModel):
    id: str | None = None
    name: str
    home_state: str = 'Assam'
    village_town: str = ''
    language: str = 'en'
    age: int | None = None
    family_members: list[dict] = Field(default_factory=list)
    former_occupation: str = ''
    favorite_festival: str = ''
    favorite_food: str = ''
    clinical_notes: str = ''
    dementia_stage: str = 'mild'
    daily_routine: dict = Field(default_factory=dict)
    starting_difficulty_tier: int = Field(3, ge=1, le=10)
    mastery_score: float = Field(0, ge=0, le=100)
    game_mastery_scores: dict[str, float] = Field(default_factory=dict)
    region_pack: str = 'assam'
    active_cognitive_domains: list[str] = Field(default_factory=lambda: ['attention','memory','executive'])
    daily_cap: int = Field(3, ge=1, le=5)
    pin: str | None = None
    is_active: bool = True

class PatientUpdate(PatientCreate):
    name: str | None = None

class SessionCreate(BaseModel):
    id: str | None = None
    profile_id: str
    game_type: str
    cognitive_domain: str | None = None
    difficulty_tier: int = Field(1, ge=1, le=10)
    starting_level: int | None = None
    ending_level: int | None = None
    score: float = 0
    max_score: float = 100
    accuracy: float | None = None
    duration_seconds: float = 0
    error_count: int = 0
    response_time_ms: float | None = None
    mastery_before: float | None = None
    mastery_after: float | None = None
    dda_adjustment: int = 0
    metadata: dict = Field(default_factory=dict)
    completed_at: datetime | None = None

class TelemetryCreate(BaseModel):
    id: str | None = None
    profile_id: str
    session_id: str | None = None
    task_type: str
    latency_ms: float | None = None
    error_count: int = 0
    prosody_score: float | None = None
    dda_adjustment: int = 0
    alert_flag: bool = False
    consecutive_errors: int = 0
    metadata: dict = Field(default_factory=dict)

class SyncEvent(BaseModel):
    id: str
    entity: Literal['telemetry','session','profile','family_memory','reminder']
    payload: dict

class SyncRequest(BaseModel):
    batch_id: str
    events: list[SyncEvent] = Field(max_length=100)
