from fastapi import APIRouter,Depends
from app.core.supabase import get_supabase
from app.core.dependencies import current_claims
router=APIRouter(prefix='/api/v1/alerts',tags=['Clinical Alerts'])
@router.get('/patient/{patient_id}')
def list_alerts(patient_id,claims=Depends(current_claims)):
    r=get_supabase().table('clinical_alerts').select('*').eq('patient_id',patient_id).order('created_at',desc=True).execute().data
    return {'success':True,'data':r,'error':None}
@router.post('/{alert_id}/acknowledge')
def ack(alert_id,visit_notes:str='',claims=Depends(current_claims)):
    r=get_supabase().table('clinical_alerts').update({'status':'acknowledged','visit_notes':visit_notes}).eq('id',alert_id).execute().data
    return {'success':True,'data':r[0] if r else None,'error':None}
