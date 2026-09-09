from app.core.supabase import get_supabase

def process(req):
    db=get_supabase(); synced=[]; failed=[]
    for e in req.events:
        try:
            p=dict(e.payload)
            if e.entity=='telemetry': db.table('telemetry_logs').upsert(p, on_conflict='id').execute()
            elif e.entity=='session': db.table('game_sessions').upsert(p, on_conflict='id').execute()
            elif e.entity=='profile': db.table('patient_profiles').upsert(p, on_conflict='id').execute()
            elif e.entity=='family_memory': db.table('family_memories').upsert(p, on_conflict='id').execute()
            elif e.entity=='reminder': db.table('reminders').upsert(p, on_conflict='id').execute()
            synced.append(e.id)
        except Exception as exc: failed.append({'id':e.id,'error':str(exc)})
    return {'batch_id':req.batch_id,'synced_event_ids':synced,'failed':failed}
