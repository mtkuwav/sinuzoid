from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional
from datetime import datetime, timedelta
from uuid import UUID

from app.models.models import Statistics
from app.schemas.schemas import StatisticsResponse

class StatisticsManager:
    """Service for basic statistics management operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_or_create_statistics(self, user_id: int, track_id: UUID) -> Statistics:
        """Get existing statistics or create new ones for user-track pair"""
        stats = self.db.query(Statistics).filter(
            and_(Statistics.user_id == user_id, Statistics.track_id == track_id)
        ).first()
        
        if not stats:
            stats = Statistics(
                user_id=user_id,
                track_id=track_id,
                play_count=0,
                total_listen_time=timedelta(seconds=0),
                skip_count=0,
                complete_plays=0
            )
            self.db.add(stats)
            self.db.commit()
            self.db.refresh(stats)
        
        return stats
    
    def get_user_statistics(self, user_id: int, track_id: Optional[UUID] = None) -> Optional[StatisticsResponse]:
        """Get statistics for a specific user-track pair"""
        query = self.db.query(Statistics).filter(Statistics.user_id == user_id)
        
        if track_id:
            query = query.filter(Statistics.track_id == track_id)
            stats = query.first()
            return StatisticsResponse.model_validate(stats) if stats else None
        
        # Return all user statistics if no track specified
        all_stats = query.all()
        return [StatisticsResponse.model_validate(stat) for stat in all_stats]
    
    @staticmethod
    def parse_timedelta_string(time_str: str) -> timedelta:
        """Parse ISO 8601 duration format string to timedelta"""
        try:
            import re
            # Parse ISO 8601 duration format (PT3M30S -> 3 minutes 30 seconds)
            match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?', time_str)
            if match:
                hours = int(match.group(1) or 0)
                minutes = int(match.group(2) or 0) 
                seconds = float(match.group(3) or 0)
                return timedelta(hours=hours, minutes=minutes, seconds=seconds)
            else:
                return timedelta(seconds=0)
        except:
            return timedelta(seconds=0)
    
    @staticmethod
    def normalize_timedelta(time_value) -> timedelta:
        """Normalize timedelta value handling None and string representations"""
        if time_value is None:
            return timedelta(seconds=0)
        elif isinstance(time_value, str):
            return StatisticsManager.parse_timedelta_string(time_value)
        elif isinstance(time_value, timedelta):
            return time_value
        else:
            return timedelta(seconds=0)
