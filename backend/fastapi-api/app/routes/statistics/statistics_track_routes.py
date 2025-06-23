from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.services.statistics_service import StatisticsService
from app.schemas.schemas import TrackStatisticsSummary

class StatisticsTrackRoutes:
    """Routes for track-specific statistics"""
    
    @staticmethod
    def get_router() -> APIRouter:
        router = APIRouter()
        
        @router.get("/track/{track_id}/summary", response_model=TrackStatisticsSummary)
        async def get_track_statistics_summary(
            track_id: UUID,
            db: Session = Depends(get_db)
        ):
            """
            Get comprehensive statistics summary for a track across all users
            
            Includes:
            - Total plays and listeners
            - Completion rate
            - Average rating
            - Total listening time
            """
            try:
                stats_service = StatisticsService(db)
                return stats_service.get_track_summary(track_id)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to get track summary: {str(e)}"
                )
        
        return router
