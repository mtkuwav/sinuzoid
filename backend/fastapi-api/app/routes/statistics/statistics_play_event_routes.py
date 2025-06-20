from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.services.statistics_service import StatisticsService
from app.schemas.schemas import PlayEvent, StatisticsResponse

class StatisticsPlayEventRoutes:
    """Routes for handling play events"""
    
    @staticmethod
    def get_router() -> APIRouter:
        router = APIRouter()
        
        @router.post("/play-event", response_model=StatisticsResponse)
        async def record_play_event(
            play_event: PlayEvent,
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            """
            Record a play event for a track
            
            This endpoint should be called when:
            - A user starts playing a track
            - A user skips a track
            - A user completes a track
            """
            try:
                stats_service = StatisticsService(db)
                user_id = current_user["id"]
                return stats_service.record_play_event(user_id, play_event)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to record play event: {str(e)}"
                )
        
        return router
