from fastapi import APIRouter,Depends
from app.schemas.common import SyncRequest
from app.services.sync_service import process
from app.core.dependencies import current_claims
router=APIRouter(prefix='/api/v1/sync',tags=['Offline Sync'])
@router.post('/delta')
def delta(req:SyncRequest,claims=Depends(current_claims)): return {'success':True,'data':process(req),'error':None}
