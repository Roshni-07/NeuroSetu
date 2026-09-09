from fastapi import APIRouter, Depends
from app.schemas.auth import PatientPinRequest, AsHALoginRequest
from app.services.auth_service import patient_pin_login
from app.core.security import create_token
router=APIRouter(prefix='/api/v1/auth',tags=['Auth'])
@router.post('/patient-pin')
def login(req:PatientPinRequest):
    result=patient_pin_login(req.pin)
    if not result: return {'success':False,'data':None,'error':'Invalid PIN'}
    return {'success':True,'data':result,'error':None}
@router.post('/asha-login')
def asha(req:AsHALoginRequest):
    # Replace with Supabase/Auth provider validation when team credentials are connected.
    return {'success':True,'data':{'access_token':create_token(req.phone,'asha'),'token_type':'bearer','role':'asha'},'error':None}
@router.post('/refresh')
def refresh(): return {'success':False,'data':None,'error':'Use the configured identity provider refresh flow'}
