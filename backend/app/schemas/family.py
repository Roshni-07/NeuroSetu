from pydantic import BaseModel, Field
class FamilyMemberCreate(BaseModel): name: str; relationship: str; phone: str | None = None; language: str | None = None
class FamilyMemoryCreate(BaseModel): patient_id: str; title: str; memory_type: str = 'story'; content: dict = Field(default_factory=dict); media_url: str | None = None
class FamilyScheduleCreate(BaseModel): patient_id: str; pair: str; weekday: int = Field(0, ge=0, le=6); enabled: bool = True
