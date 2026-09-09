from fastapi import APIRouter, Depends
from app.schemas.common import SessionCreate
from app.core.supabase import get_supabase
from app.core.dependencies import current_claims
from datetime import datetime,timezone
router=APIRouter(prefix='/api/v1/sessions',tags=['Sessions'])
@router.post('')
def create(req:SessionCreate,claims=Depends(current_claims)):
    row=req.model_dump(exclude_none=True); row['completed_at']=(req.completed_at or datetime.now(timezone.utc)).isoformat(); row['id']=row.get('id')
    r=get_supabase().table('game_sessions').upsert(row).execute().data[0]
    return {'success':True,'data':r,'error':None}
@router.get('/{session_id}')
def one(session_id,claims=Depends(current_claims)):
    r=get_supabase().table('game_sessions').select('*').eq('id',session_id).limit(1).execute().data
    return {'success':bool(r),'data':r[0] if r else None,'error':None if r else 'Session not found'}
@router.get('/patient/{patient_id}')
def patient_sessions(patient_id,limit:int=100,claims=Depends(current_claims)):
    r=get_supabase().table('game_sessions').select('*').eq('profile_id',patient_id).order('completed_at',desc=True).limit(limit).execute().data
    return {'success':True,'data':r,'error':None}
