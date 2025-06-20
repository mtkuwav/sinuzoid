from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.services.statistics_service import StatisticsService
from app.schemas.schemas import StatisticsSearchParams, StatisticsSearchResult

class StatisticsSearchRoutes:
    """Routes for searching and filtering statistics"""
    
    @staticmethod
    def get_router() -> APIRouter:
        router = APIRouter()
        
        @router.get("/search", response_model=StatisticsSearchResult)
        async def search_statistics(
            params: StatisticsSearchParams = Depends(),
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            """
            Search statistics with various filters for the current user
            
            Filters available:
            - track_id: Filter by specific track
            - min_play_count: Minimum number of plays
            - min_rating/max_rating: Rating range
            - date_from/date_to: Date range for last_played
            """
            try:
                stats_service = StatisticsService(db)
                # Force search to be for current user only
                params.user_id = current_user["id"]
                results = stats_service.search_statistics(params)
                
                # Count total results for pagination
                total_results = len(results)  # This is simplified; for production, implement proper counting
                
                return StatisticsSearchResult(
                    statistics=results,
                    total_results=total_results,
                    filters_applied={
                        "user_id": params.user_id,
                        "track_id": str(params.track_id) if params.track_id else None,
                        "min_play_count": params.min_play_count,
                        "min_rating": params.min_rating,
                        "max_rating": params.max_rating,
                        "date_from": params.date_from.isoformat() if params.date_from else None,
                        "date_to": params.date_to.isoformat() if params.date_to else None
                    }
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to search statistics: {str(e)}"
                )
        
        return router
