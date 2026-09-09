import httpx
from app.core.config import settings

async def bhashini(payload):
    if not settings.bhashini_api_key or not settings.bhashini_user_id:
        return {'configured':False,'message':'Bhashini credentials are not configured'}
    headers={'Authorization':settings.bhashini_api_key,'userID':settings.bhashini_user_id,'Content-Type':'application/json'}
    async with httpx.AsyncClient(timeout=30) as client:
        r=await client.post(settings.bhashini_pipeline_url,json=payload,headers=headers)
        r.raise_for_status(); return r.json()
