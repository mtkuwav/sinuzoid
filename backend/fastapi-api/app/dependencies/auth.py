from fastapi import HTTPException, Request
from app.services.auth_service import AuthService

async def get_current_user(request: Request) -> dict:
    """Extract and verify user from Authorization header"""
    authorization = request.headers.get("Authorization")
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, 
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService()
    
    return await auth_service.verify_token(token)
