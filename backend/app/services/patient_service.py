from uuid import uuid4
from datetime import datetime, timezone
from app.core.supabase import get_supabase

def normalize_patient(p):
    p=dict(p)
    p.setdefault('id', str(uuid4()))
    p.setdefault('is_active', True)
    p['updated_at']=datetime.now(timezone.utc).isoformat()
    return p

def list_patients(active_only=True):
    q=get_supabase().table('patient_profiles').select('*')
    if active_only: q=q.eq('is_active',True)
    return q.execute().data

def get_patient(pid):
    r=get_supabase().table('patient_profiles').select('*').eq('id',pid).limit(1).execute().data
    return r[0] if r else None

def upsert_patient(data):
    return get_supabase().table('patient_profiles').upsert(normalize_patient(data)).execute().data[0]
