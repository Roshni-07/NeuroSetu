from fastapi import APIRouter,Depends
from app.core.dependencies import current_claims
from app.services.content_service import update_settings
router=APIRouter(prefix='/api/v1/content',tags=['Content'])
@router.put('/patients/{patient_id}/settings')
def settings(patient_id,region_pack:str|None=None,active_cognitive_domains:str|None=None,claims=Depends(current_claims)):
    data={}
    if region_pack is not None: data['region_pack']=region_pack
    if active_cognitive_domains is not None: data['active_cognitive_domains']=[x.strip() for x in active_cognitive_domains.split(',') if x.strip()]
    return {'success':True,'data':update_settings(patient_id,data),'error':None}
