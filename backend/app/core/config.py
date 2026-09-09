from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = 'NeuroSetu API'
    environment: str = 'development'
    api_prefix: str = '/api/v1'
    supabase_url: str = ''
    supabase_service_role_key: str = ''
    jwt_secret_key: str = 'CHANGE_ME_IN_ENV'
    jwt_algorithm: str = 'HS256'
    access_token_expire_minutes: int = 60 * 24
    cors_origins: str = 'http://localhost:5173,http://localhost:4173'
    bhashini_api_key: str = ''
    bhashini_user_id: str = ''
    bhashini_pipeline_url: str = 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline'
    tts_provider: str = 'bhashini'
    tts_api_key: str = ''
    tts_voice_id: str = ''
    tts_region: str = ''
    frontend_url: str = 'http://localhost:5173'
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')
    @property
    def cors_list(self):
        return [x.strip() for x in self.cors_origins.split(',') if x.strip()]

@lru_cache
def get_settings():
    return Settings()
settings = get_settings()
