from pydantic import BaseModel
class SpeechTextRequest(BaseModel): text: str; language: str = 'en'; gender: str = 'female'; domain: str = 'generic'
