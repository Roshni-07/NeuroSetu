from fastapi import APIRouter,Depends
from app.schemas.reminders import ReminderCreate,ReminderUpdate
from app.services.reminder_service import *
from app.core.dependencies import current_claims
router=APIRouter(prefix='/api/v1/reminders',tags=['Reminders'])
@router.get('/patient/{patient_id}')
def list_(patient_id,claims=Depends(current_claims)): return {'success':True,'data':list_reminders(patient_id),'error':None}
@router.post('')
def create_(req:ReminderCreate,claims=Depends(current_claims)): return {'success':True,'data':create(req.model_dump()),'error':None}
@router.put('/{reminder_id}')
def update_(reminder_id,req:ReminderUpdate,claims=Depends(current_claims)): return {'success':True,'data':update(reminder_id,req.model_dump(exclude_none=True)),'error':None}
