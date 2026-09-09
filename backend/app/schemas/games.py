from pydantic import BaseModel, Field
class AdaptiveRequest(BaseModel):
    patient_id: str
    game_type: str
    previous_level: int = Field(1, ge=1, le=10)
    score: float = 0
    max_score: float = 100
    accuracy: float = 0
    error_count: int = 0
    response_time_ms: float = 0
    consecutive_errors: int = 0
    consecutive_successes: int = 0
class GameCatalogItem(BaseModel):
    id: str; name: str; cognitive_domain: str; description: str; levels: int = 10
