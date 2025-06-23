from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from uuid import UUID

from app.schemas.schemas import PlayEvent, StatisticsResponse
from .statistics_manager import StatisticsManager

class PlayEventService:
    """Service for managing play events and listening statistics"""
    
    def __init__(self, db: Session):
        self.db = db
        self.stats_manager = StatisticsManager(db)
    
    def record_play_event(self, user_id: int, play_event: PlayEvent) -> StatisticsResponse:
        """Record a play event and update statistics"""
        stats = self.stats_manager.get_or_create_statistics(user_id, play_event.track_id)
        
        # Update play count
        stats.play_count += 1
        stats.last_played = datetime.utcnow()
        
        # Add listen time - ensure we handle None and string values properly
        current_listen_time = self.stats_manager.normalize_timedelta(stats.total_listen_time)
        stats.total_listen_time = current_listen_time + play_event.listen_duration
        
        # Update skip count
        if play_event.skipped:
            stats.skip_count += 1
        
        # Update complete plays (if >80% of track was listened to or marked as completed)
        completion_threshold = play_event.track_duration * 0.8
        if play_event.completed or play_event.listen_duration >= completion_threshold:
            stats.complete_plays += 1
        
        self.db.commit()
        self.db.refresh(stats)
        
        return StatisticsResponse.model_validate(stats)
