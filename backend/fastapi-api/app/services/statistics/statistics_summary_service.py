from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import timedelta
from uuid import UUID

from app.models.models import Statistics, Track
from app.schemas.schemas import UserStatisticsSummary, TrackStatisticsSummary, TrackResponse
from .statistics_manager import StatisticsManager

class StatisticsSummaryService:
    """Service for generating comprehensive statistics summaries"""
    
    def __init__(self, db: Session):
        self.db = db
        self.stats_manager = StatisticsManager(db)
    
    def get_user_summary(self, user_id: int) -> UserStatisticsSummary:
        """Get comprehensive statistics summary for a user"""
        # Get all user statistics and calculate totals in Python
        user_stats = self.db.query(Statistics).filter(Statistics.user_id == user_id).all()
        
        # Calculate totals
        total_tracks = len(user_stats)
        total_plays = sum(stat.play_count for stat in user_stats)
        total_complete_plays = sum(stat.complete_plays for stat in user_stats)
        total_skips = sum(stat.skip_count for stat in user_stats)
        
        # Calculate total listen time by summing all individual times
        total_listen_time = timedelta(seconds=0)
        for stat in user_stats:
            if stat.total_listen_time:
                normalized_time = self.stats_manager.normalize_timedelta(stat.total_listen_time)
                total_listen_time += normalized_time
        
        # Calculate average rating
        ratings = [stat.user_rating for stat in user_stats if stat.user_rating is not None]
        average_rating = sum(ratings) / len(ratings) if ratings else None
        
        # Get favorite tracks (top 5 most played)
        favorite_tracks_query = (
            self.db.query(Track)
            .join(Statistics)
            .filter(Statistics.user_id == user_id)
            .order_by(desc(Statistics.play_count))
            .limit(5)
        )
        favorite_tracks = [TrackResponse.model_validate(track) for track in favorite_tracks_query.all()]
        
        # Get recently played tracks (last 10)
        recently_played_query = (
            self.db.query(Track)
            .join(Statistics)
            .filter(Statistics.user_id == user_id)
            .filter(Statistics.last_played.isnot(None))
            .order_by(desc(Statistics.last_played))
            .limit(10)
        )
        recently_played = [TrackResponse.model_validate(track) for track in recently_played_query.all()]
        
        return UserStatisticsSummary(
            user_id=user_id,
            total_tracks_listened=total_tracks,
            total_play_count=total_plays,
            total_listen_time=total_listen_time,
            total_complete_plays=total_complete_plays,
            total_skips=total_skips,
            average_rating=average_rating,
            favorite_tracks=favorite_tracks,
            recently_played=recently_played
        )
    
    def get_track_summary(self, track_id: UUID) -> TrackStatisticsSummary:
        """Get comprehensive statistics summary for a track"""
        # Get all statistics for this track and calculate totals in Python
        track_stats = self.db.query(Statistics).filter(Statistics.track_id == track_id).all()
        
        # Calculate totals
        total_plays = sum(stat.play_count for stat in track_stats)
        total_listeners = len(set(stat.user_id for stat in track_stats))
        total_complete_plays = sum(stat.complete_plays for stat in track_stats)
        total_skips = sum(stat.skip_count for stat in track_stats)
        
        # Calculate total listen time
        total_listen_time = timedelta(seconds=0)
        for stat in track_stats:
            if stat.total_listen_time:
                normalized_time = self.stats_manager.normalize_timedelta(stat.total_listen_time)
                total_listen_time += normalized_time
        
        # Calculate average rating
        ratings = [stat.user_rating for stat in track_stats if stat.user_rating is not None]
        average_rating = sum(ratings) / len(ratings) if ratings else None
        
        # Calculate completion rate
        completion_rate = (total_complete_plays / total_plays * 100) if total_plays > 0 else 0.0
        
        return TrackStatisticsSummary(
            track_id=track_id,
            total_plays=total_plays,
            total_listeners=total_listeners,
            total_listen_time=total_listen_time,
            total_complete_plays=total_complete_plays,
            total_skips=total_skips,
            average_rating=average_rating,
            completion_rate=completion_rate
        )
