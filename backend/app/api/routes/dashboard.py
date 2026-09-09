from fastapi import APIRouter,Depends,HTTPException
from app.core.dependencies import current_claims
from app.services.patient_service import get_patient
from app.services.content_service import daily_plan
from app.services.telemetry_service import trends
from app.core.supabase import get_supabase
router=APIRouter(prefix='/api/v1/dashboard',tags=['Dashboard'])
@router.get('/patient/{patient_id}')
def summary(patient_id,claims=Depends(current_claims)):
    p=get_patient(patient_id)
    if not p: raise HTTPException(404,'Patient not found')
    sessions=get_supabase().table('game_sessions').select('*').eq('profile_id',patient_id).order('completed_at',desc=True).limit(100).execute().data
    alerts=get_supabase().table('clinical_alerts').select('*').eq('patient_id',patient_id).eq('status','open').execute().data
    return {'success':True,'data':{'patient':p,'daily_plan':daily_plan(p),'sessions':sessions,'telemetry':trends(patient_id,50),'alerts':alerts},'error':None}
@router.get('/patient/{patient_id}/progress')
def progress(patient_id,claims=Depends(current_claims)):
    return {'success':True,'data':trends(patient_id,100),'error':None}
