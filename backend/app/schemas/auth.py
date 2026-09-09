from pydantic import BaseModel, Field
class PatientPinRequest(BaseModel): pin: str = Field(min_length=4, max_length=12)
class AsHALoginRequest(BaseModel): phone: str; password: str
class RefreshRequest(BaseModel): refresh_token: str
