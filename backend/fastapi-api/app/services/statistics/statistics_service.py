from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from app.schemas.schemas import (
    PlayEvent, RatingUpdate, UserStatisticsSummary, TrackStatisticsSummary,
    StatisticsSearchParams, StatisticsResponse, TrackResponse
)

from .statistics_manager import StatisticsManager
from .play_event_service import PlayEventService
from .rating_service import RatingService
from .statistics_summary_service import StatisticsSummaryService
from .statistics_search_service import StatisticsSearchService
from .statistics_analytics_service import StatisticsAnalyticsService

class StatisticsService:
    """Main statistics service that orchestrates all statistics operations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.manager = StatisticsManager(db)
        self.play_event_service = PlayEventService(db)
        self.rating_service = RatingService(db)
        self.summary_service = StatisticsSummaryService(db)
        self.search_service = StatisticsSearchService(db)
        self.analytics_service = StatisticsAnalyticsService(db)
    
    # Basic statistics operations
    def get_or_create_statistics(self, user_id: int, track_id: UUID):
        """Get existing statistics or create new ones for user-track pair"""
        return self.manager.get_or_create_statistics(user_id, track_id)
    
    def get_user_statistics(self, user_id: int, track_id: Optional[UUID] = None):
        """Get statistics for a specific user-track pair"""
        return self.manager.get_user_statistics(user_id, track_id)
    
    # Play events
    def record_play_event(self, user_id: int, play_event: PlayEvent) -> StatisticsResponse:
        """Record a play event and update statistics"""
        return self.play_event_service.record_play_event(user_id, play_event)
    
    # Ratings
    def update_rating(self, user_id: int, rating_update: RatingUpdate) -> StatisticsResponse:
        """Update user rating for a track"""
        return self.rating_service.update_rating(user_id, rating_update)
    
    # Summaries
    def get_user_summary(self, user_id: int) -> UserStatisticsSummary:
        """Get comprehensive statistics summary for a user"""
        return self.summary_service.get_user_summary(user_id)
    
    def get_track_summary(self, track_id: UUID) -> TrackStatisticsSummary:
        """Get comprehensive statistics summary for a track"""
        return self.summary_service.get_track_summary(track_id)
    
    # Search and filtering
    def search_statistics(self, params: StatisticsSearchParams) -> List[StatisticsResponse]:
        """Search statistics with various filters"""
        return self.search_service.search_statistics(params)
    
    # Analytics and rankings
    def get_top_tracks_global(self, limit: int = 10) -> List[TrackResponse]:
        """Get globally most played tracks"""
        return self.analytics_service.get_top_tracks_global(limit)
    
    def get_top_rated_tracks(self, limit: int = 10, min_ratings: int = 5) -> List[TrackResponse]:
        """Get highest rated tracks (with minimum number of ratings)"""
        return self.analytics_service.get_top_rated_tracks(limit, min_ratings)
