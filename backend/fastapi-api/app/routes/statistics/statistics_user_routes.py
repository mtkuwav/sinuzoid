from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.services.statistics_service import StatisticsService
from app.schemas.schemas import StatisticsResponse, UserStatisticsSummary

class StatisticsUserRoutes:
    """Routes for user-specific statistics"""
    
    @staticmethod
    def get_router() -> APIRouter:
        router = APIRouter()
        
        @router.get("/user/track/{track_id}", response_model=StatisticsResponse)
        async def get_user_track_statistics(
            track_id: UUID,
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            """
            Get statistics for a specific user-track combination
            """
            stats_service = StatisticsService(db)
            user_id = current_user["id"]
            stats = stats_service.get_user_statistics(user_id, track_id)
            if not stats:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No statistics found for this user-track combination"
                )
            return stats

        @router.get("/user/summary", response_model=UserStatisticsSummary)
        async def get_user_statistics_summary(
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            """
            Get comprehensive statistics summary for the current user
            
            Includes:
            - Total listening statistics
            - Favorite tracks (most played)
            - Recently played tracks
            - Average rating
            """
            try:
                stats_service = StatisticsService(db)
                user_id = current_user["id"]
                return stats_service.get_user_summary(user_id)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to get user summary: {str(e)}"
                )

        @router.get("/user/all", response_model=List[StatisticsResponse])
        async def get_all_user_statistics(
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            """
            Get all statistics for the current user (all tracks they've listened to)
            """
            try:
                stats_service = StatisticsService(db)
                user_id = current_user["id"]
                stats = stats_service.get_user_statistics(user_id)
                if isinstance(stats, list):
                    return stats
                elif stats:
                    return [stats]
                else:
                    return []
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to get user statistics: {str(e)}"
                )
        
        return router
