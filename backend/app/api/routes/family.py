from fastapi import APIRouter,Depends
from app.schemas.family import FamilyMemberCreate,FamilyMemoryCreate,FamilyScheduleCreate
from app.services.family_service import *
from app.core.dependencies import current_claims
from app.core.supabase import get_supabase
router=APIRouter(prefix='/api/v1/family',tags=['Family'])
@router.get('/{patient_id}/members')
def get_members(patient_id,claims=Depends(current_claims)): return {'success':True,'data':members(patient_id),'error':None}
@router.post('/{patient_id}/members')
def post_member(patient_id,req:FamilyMemberCreate,claims=Depends(current_claims)): return {'success':True,'data':add_member(patient_id,req.model_dump()),'error':None}
@router.get('/{patient_id}/memories')
def get_memories(patient_id,claims=Depends(current_claims)): return {'success':True,'data':memories(patient_id),'error':None}
@router.post('/memories')
def post_memory(req:FamilyMemoryCreate,claims=Depends(current_claims)): return {'success':True,'data':add_memory(req.model_dump()),'error':None}
@router.get('/{patient_id}/schedule')
def schedule(patient_id,claims=Depends(current_claims)): return {'success':True,'data':get_supabase().table('family_game_schedules').select('*').eq('patient_id',patient_id).execute().data,'error':None}
@router.post('/schedule')
def set_schedule(req:FamilyScheduleCreate,claims=Depends(current_claims)):
    return {'success':True,'data':get_supabase().table('family_game_schedules').upsert(req.model_dump()).execute().data[0],'error':None}
