from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List

from app.models.models import Statistics, Track
from app.schemas.schemas import TrackResponse

class StatisticsAnalyticsService:
    """Service for analytics and rankings based on statistics"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_top_tracks_global(self, limit: int = 10) -> List[TrackResponse]:
        """Get globally most played tracks"""
        top_tracks_query = (
            self.db.query(Track)
            .join(Statistics)
            .group_by(Track.id)
            .order_by(desc(func.sum(Statistics.play_count)))
            .limit(limit)
        )
        
        return [TrackResponse.model_validate(track) for track in top_tracks_query.all()]
    
    def get_top_rated_tracks(self, limit: int = 10, min_ratings: int = 5) -> List[TrackResponse]:
        """Get highest rated tracks (with minimum number of ratings)"""
        top_rated_query = (
            self.db.query(Track)
            .join(Statistics)
            .filter(Statistics.user_rating.isnot(None))
            .group_by(Track.id)
            .having(func.count(Statistics.user_rating) >= min_ratings)
            .order_by(desc(func.avg(Statistics.user_rating)))
            .limit(limit)
        )
        
        return [TrackResponse.model_validate(track) for track in top_rated_query.all()]
