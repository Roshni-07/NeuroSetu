from fastapi import APIRouter,Depends
from app.schemas.common import TelemetryCreate
from app.services.telemetry_service import save,trends
from app.core.dependencies import current_claims
router=APIRouter(prefix='/api/v1/telemetry',tags=['Telemetry'])
@router.post('')
def create(req:TelemetryCreate,claims=Depends(current_claims)):
    row,triage=save(req.model_dump(exclude_none=True)); return {'success':True,'data':{'telemetry':row,'triage':triage},'error':None}
@router.get('/trends/{patient_id}')
def trend(patient_id,limit:int=100,claims=Depends(current_claims)): return {'success':True,'data':trends(patient_id,limit),'error':None}
