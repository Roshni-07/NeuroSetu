from fastapi import APIRouter, Depends, HTTPException
from app.schemas.common import PatientCreate, PatientUpdate
from app.services.patient_service import list_patients,get_patient,upsert_patient
from app.services.content_service import daily_plan
from app.core.dependencies import current_claims
router=APIRouter(prefix='/api/v1/patients',tags=['Patients'])
@router.get('')
def get_all(active_only=True,claims=Depends(current_claims)): return {'success':True,'data':list_patients(active_only),'error':None}
@router.post('')
def create(req:PatientCreate,claims=Depends(current_claims)): return {'success':True,'data':upsert_patient(req.model_dump(exclude_none=True)),'error':None}
@router.get('/{patient_id}')
def get_one(patient_id,claims=Depends(current_claims)):
    p=get_patient(patient_id)
    if not p: raise HTTPException(404,'Patient not found')
    return {'success':True,'data':p,'error':None}
@router.put('/{patient_id}')
def update(patient_id,req:PatientUpdate,claims=Depends(current_claims)):
    if not get_patient(patient_id): raise HTTPException(404,'Patient not found')
    data=req.model_dump(exclude_none=True); data['id']=patient_id
    return {'success':True,'data':upsert_patient(data),'error':None}
@router.post('/{patient_id}/archive')
def archive(patient_id,archive_reason:str,claims=Depends(current_claims)):
    if len(archive_reason.strip())<10: raise HTTPException(422,'archive_reason must contain at least 10 characters')
    return {'success':True,'data':upsert_patient({'id':patient_id,'is_active':False,'archive_reason':archive_reason}),'error':None}
@router.post('/{patient_id}/unarchive')
def unarchive(patient_id,claims=Depends(current_claims)): return {'success':True,'data':upsert_patient({'id':patient_id,'is_active':True}),'error':None}
@router.get('/{patient_id}/daily-plan')
def plan(patient_id,claims=Depends(current_claims)):
    p=get_patient(patient_id)
    if not p: raise HTTPException(404,'Patient not found')
    return {'success':True,'data':daily_plan(p),'error':None}
