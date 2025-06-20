from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.services.statistics_service import StatisticsService
from app.schemas.schemas import RatingUpdate, StatisticsResponse

class StatisticsRatingRoutes:
    """Routes for handling track ratings"""
    
    @staticmethod
    def get_router() -> APIRouter:
        router = APIRouter()
        
        @router.post("/rating", response_model=StatisticsResponse)
        async def update_track_rating(
            rating_update: RatingUpdate,
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            """
            Update user rating for a track (1-5 stars)
            """
            try:
                stats_service = StatisticsService(db)
                user_id = current_user["id"]
                return stats_service.update_rating(user_id, rating_update)
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=str(e)
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to update rating: {str(e)}"
                )
        
        return router
