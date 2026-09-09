from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token

bearer = HTTPBearer(auto_error=False)

def current_claims(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Authentication required')
    return decode_token(credentials.credentials)

def require_roles(*roles):
    def dep(claims=Depends(current_claims)):
        if claims.get('role') not in roles:
            raise HTTPException(status_code=403, detail='Insufficient permissions')
        return claims
    return dep
