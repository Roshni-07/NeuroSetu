from pydantic import BaseModel
class ReminderCreate(BaseModel): patient_id: str; title: str; description: str = ''; time: str; repeat_rule: str = 'daily'; enabled: bool = True
class ReminderUpdate(BaseModel): title: str | None = None; description: str | None = None; time: str | None = None; repeat_rule: str | None = None; enabled: bool | None = None
