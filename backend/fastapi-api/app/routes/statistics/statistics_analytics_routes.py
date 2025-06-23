from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services.statistics_service import StatisticsService
from app.schemas.schemas import TrackResponse

class StatisticsAnalyticsRoutes:
    """Routes for analytics and rankings"""
    
    @staticmethod
    def get_router() -> APIRouter:
        router = APIRouter()
        
        @router.get("/top-tracks/global", response_model=List[TrackResponse])
        async def get_top_tracks_global(
            limit: int = 10,
            db: Session = Depends(get_db)
        ):
            """
            Get globally most played tracks across all users
            """
            try:
                stats_service = StatisticsService(db)
                return stats_service.get_top_tracks_global(limit)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to get top tracks: {str(e)}"
                )

        @router.get("/top-tracks/rated", response_model=List[TrackResponse])
        async def get_top_rated_tracks(
            limit: int = 10,
            min_ratings: int = 5,
            db: Session = Depends(get_db)
        ):
            """
            Get highest rated tracks (requires minimum number of ratings)
            """
            try:
                stats_service = StatisticsService(db)
                return stats_service.get_top_rated_tracks(limit, min_ratings)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to get top rated tracks: {str(e)}"
                )
        
        return router
