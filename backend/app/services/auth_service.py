from app.core.security import DEMO_PINS, create_token

def patient_pin_login(pin):
    patient_id = DEMO_PINS.get(pin)
    if not patient_id: return None
    return {'access_token':create_token(patient_id,'patient',patient_id),'token_type':'bearer','patient_id':patient_id,'role':'patient'}
