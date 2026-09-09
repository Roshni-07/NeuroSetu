from datetime import datetime, timedelta, timezone
from app.core.supabase import get_supabase
from app.services.triage_service import evaluate

def save(t):
    row=dict(t); row.setdefault('id',None); row['created_at']=datetime.now(timezone.utc).isoformat()
    result=get_supabase().table('telemetry_logs').insert(row).execute().data[0]
    triage=evaluate(row.get('latency_ms') or 0,row.get('error_count') or 0,row.get('consecutive_errors') or 0)
    return result,triage

def trends(pid,limit=100):
    return get_supabase().table('telemetry_logs').select('*').eq('profile_id',pid).order('created_at',desc=True).limit(limit).execute().data
