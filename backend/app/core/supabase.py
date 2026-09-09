from supabase import create_client, Client
from app.core.config import settings

_client = None

def get_supabase() -> Client:
    global _client
    if _client is None:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise RuntimeError('Supabase backend credentials are not configured')
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client
