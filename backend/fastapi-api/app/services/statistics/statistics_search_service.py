from sqlalchemy.orm import Session
from typing import List

from app.models.models import Statistics
from app.schemas.schemas import StatisticsSearchParams, StatisticsResponse

class StatisticsSearchService:
    """Service for searching and filtering statistics"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def search_statistics(self, params: StatisticsSearchParams) -> List[StatisticsResponse]:
        """Search statistics with various filters"""
        query = self.db.query(Statistics)
        
        # Apply filters
        if params.user_id:
            query = query.filter(Statistics.user_id == params.user_id)
        
        if params.track_id:
            query = query.filter(Statistics.track_id == params.track_id)
        
        if params.min_play_count:
            query = query.filter(Statistics.play_count >= params.min_play_count)
        
        if params.min_rating:
            query = query.filter(Statistics.user_rating >= params.min_rating)
        
        if params.max_rating:
            query = query.filter(Statistics.user_rating <= params.max_rating)
        
        if params.date_from:
            query = query.filter(Statistics.last_played >= params.date_from)
        
        if params.date_to:
            query = query.filter(Statistics.last_played <= params.date_to)
        
        # Apply pagination
        query = query.offset(params.offset).limit(params.limit)
        
        results = query.all()
        return [StatisticsResponse.model_validate(stat) for stat in results]
