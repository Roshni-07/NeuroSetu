from fastapi import APIRouter,Depends
from app.schemas.games import AdaptiveRequest
from app.services.adaptive_service import calculate_next_level,calculate_mastery
from app.core.dependencies import current_claims
router=APIRouter(prefix='/api/v1/adaptive',tags=['Adaptive AI'])
@router.post('/difficulty')
def difficulty(req:AdaptiveRequest,claims=Depends(current_claims)):
    level,adj=calculate_next_level(req.previous_level,req.accuracy,req.error_count,req.response_time_ms,req.consecutive_errors,req.consecutive_successes)
    mastery=calculate_mastery(0,req.accuracy,req.error_count,req.response_time_ms)
    return {'success':True,'data':{'previous_level':req.previous_level,'next_level':level,'adjustment':adj,'mastery_estimate':mastery,'reason':'performance-based rule engine'},'error':None}
