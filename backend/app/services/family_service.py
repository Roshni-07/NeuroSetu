from uuid import uuid4
from app.core.supabase import get_supabase

def members(pid): return get_supabase().table('family_members').select('*').eq('patient_id',pid).execute().data
def add_member(pid,data):
    row=dict(data); row['id']=str(uuid4()); row['patient_id']=pid
    return get_supabase().table('family_members').insert(row).execute().data[0]
def memories(pid): return get_supabase().table('family_memories').select('*').eq('patient_id',pid).order('created_at',desc=True).execute().data
def add_memory(data):
    row=dict(data); row['id']=str(uuid4())
    return get_supabase().table('family_memories').insert(row).execute().data[0]
