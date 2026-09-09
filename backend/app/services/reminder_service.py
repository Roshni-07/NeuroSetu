from uuid import uuid4
from app.core.supabase import get_supabase

def list_reminders(pid): return get_supabase().table('reminders').select('*').eq('patient_id',pid).eq('enabled',True).order('time').execute().data
def create(data):
    row=dict(data); row['id']=str(uuid4())
    return get_supabase().table('reminders').insert(row).execute().data[0]
def update(rid,data): return get_supabase().table('reminders').update({k:v for k,v in data.items() if v is not None}).eq('id',rid).execute().data[0]
