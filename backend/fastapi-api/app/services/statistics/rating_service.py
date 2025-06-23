from sqlalchemy.orm import Session
from uuid import UUID

from app.schemas.schemas import RatingUpdate, StatisticsResponse
from .statistics_manager import StatisticsManager

class RatingService:
    """Service for managing user ratings on tracks"""
    
    def __init__(self, db: Session):
        self.db = db
        self.stats_manager = StatisticsManager(db)
    
    def update_rating(self, user_id: int, rating_update: RatingUpdate) -> StatisticsResponse:
        """Update user rating for a track"""
        if not (1 <= rating_update.rating <= 5):
            raise ValueError("Rating must be between 1 and 5")
        
        stats = self.stats_manager.get_or_create_statistics(user_id, rating_update.track_id)
        stats.user_rating = rating_update.rating
        
        self.db.commit()
        self.db.refresh(stats)
        
        return StatisticsResponse.model_validate(stats)
