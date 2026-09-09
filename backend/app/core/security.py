from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import HTTPException, status
from app.core.config import settings

DEMO_PINS = {'100100':'preset-1','200200':'preset-2','300300':'preset-3','400400':'default'}

def create_token(subject: str, role: str, patient_id: str | None = None):
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({'sub': subject, 'role': role, 'patient_id': patient_id, 'exp': exp}, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

def decode_token(token: str):
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or expired token') from exc
