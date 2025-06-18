import httpx
import os
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.auth_service_url = os.getenv("AUTH_SERVICE_URL", "http://auth:80")
    
    async def verify_token(self, token: str) -> dict:
        """Verify token with Symfony auth service"""
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
                logger.debug(f"Verifying token with auth service: {self.auth_service_url}")
                
                response = await client.get(
                    f"{self.auth_service_url}/api/me",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code == 200:
                    response_data = response.json()
                    user_data = response_data.get('user', response_data)  # Handle both formats
                    
                    # Validate required fields
                    if not user_data.get('id') or not user_data.get('email'):
                        logger.error(f"Invalid user data received from auth service: {user_data}")
                        raise HTTPException(
                            status_code=401,
                            detail="Invalid user data from authentication service"
                        )
                    
                    logger.info(f"Token verified successfully for user: {user_data.get('email')} (ID: {user_data.get('id')})")
                    return user_data
                    
                elif response.status_code == 401:
                    logger.warning("Authentication failed: Invalid or expired token")
                    raise HTTPException(
                        status_code=401,
                        detail="Invalid or expired token"
                    )
                    
                elif response.status_code == 403:
                    logger.warning("Authentication failed: Access forbidden")
                    raise HTTPException(
                        status_code=403,
                        detail="Access forbidden"
                    )
                    
                else:
                    logger.error(f"Auth service returned unexpected status {response.status_code}: {response.text}")
                    raise HTTPException(
                        status_code=503,
                        detail="Authentication service error"
                    )
                    
        except HTTPException:
            # Re-raise HTTP exceptions (comme dans storage_service)
            raise
            
        except httpx.TimeoutException:
            logger.error("Authentication request timeout")
            raise HTTPException(
                status_code=503,
                detail="Authentication service timeout"
            )
            
        except httpx.RequestError as e:
            logger.error(f"Auth service connection error: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail="Authentication service unavailable"
            )
            
        except Exception as e:
            logger.error(f"Unexpected error during token verification: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Internal authentication error"
            )