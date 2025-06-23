from sqlalchemy.orm import Session
from app.schemas.schemas import PlaylistCreate
from typing import List, Optional, Tuple
from uuid import UUID
import logging

from .playlist_manager import PlaylistManager
from .playlist_track_manager import PlaylistTrackManager
from .playlist_search import PlaylistSearch

logger = logging.getLogger(__name__)

class PlaylistService:
    """Main playlist service that orchestrates playlist operations"""
    
    def __init__(self):
        self.manager = PlaylistManager()
        self.track_manager = PlaylistTrackManager()
        self.search = PlaylistSearch()
    
    # Playlist CRUD operations
    @staticmethod
    def create_playlist(db: Session, playlist_data: PlaylistCreate, user_id: int):
        """Create a new playlist"""
        return PlaylistManager.create_playlist(db, playlist_data, user_id)
    
    @staticmethod
    def get_user_playlists(db: Session, user_id: int, skip: int = 0, limit: int = 100):
        """Get all playlists for a user"""
        return PlaylistManager.get_user_playlists(db, user_id, skip, limit)
    
    @staticmethod
    def get_playlist_by_id(db: Session, playlist_id: UUID, user_id: int):
        """Get playlist by ID for a specific user"""
        return PlaylistManager.get_playlist_by_id(db, playlist_id, user_id)
    
    @staticmethod
    def update_playlist(db: Session, playlist_id: UUID, playlist_data: PlaylistCreate, user_id: int):
        """Update a playlist"""
        return PlaylistManager.update_playlist(db, playlist_id, playlist_data, user_id)
    
    @staticmethod
    def delete_playlist(db: Session, playlist_id: UUID, user_id: int):
        """Delete a playlist"""
        return PlaylistManager.delete_playlist(db, playlist_id, user_id)
    
    # Track management operations
    @staticmethod
    def add_track_to_playlist(db: Session, playlist_id: UUID, track_id: UUID, user_id: int, position: Optional[int] = None):
        """Add a track to a playlist"""
        return PlaylistTrackManager.add_track_to_playlist(db, playlist_id, track_id, user_id, position)
    
    @staticmethod
    def remove_track_from_playlist(db: Session, playlist_id: UUID, track_id: UUID, user_id: int):
        """Remove a track from a playlist"""
        return PlaylistTrackManager.remove_track_from_playlist(db, playlist_id, track_id, user_id)
    
    @staticmethod
    def reorder_playlist_tracks(db: Session, playlist_id: UUID, user_id: int, track_orders: List[dict]):
        """Reorder tracks in a playlist"""
        return PlaylistTrackManager.reorder_playlist_tracks(db, playlist_id, user_id, track_orders)
    
    @staticmethod
    def get_playlist_tracks(db: Session, playlist_id: UUID, user_id: int):
        """Get all tracks in a playlist ordered by position"""
        return PlaylistTrackManager.get_playlist_tracks(db, playlist_id, user_id)
    
    # Search operations
    @staticmethod
    def search_playlists(
        db: Session, 
        user_id: int, 
        query: str, 
        search_in_tracks: bool = False,
        search_in_description: bool = True,
        limit: int = 50, 
        offset: int = 0
    ):
        """Search playlists by name, description and optionally tracks"""
        return PlaylistSearch.search_playlists(
            db, user_id, query, search_in_tracks, search_in_description, limit, offset
        )
    
    @staticmethod
    def search_tracks_in_playlist(
        db: Session, 
        playlist_id: UUID, 
        user_id: int, 
        query: str,
        limit: int = 50,
        offset: int = 0
    ):
        """Search tracks within a specific playlist"""
        return PlaylistSearch.search_tracks_in_playlist(db, playlist_id, user_id, query, limit, offset)
    
    @staticmethod
    def get_playlist_suggestions(db: Session, user_id: int, query: str, limit: int = 5):
        """Get playlist name suggestions based on partial query"""
        return PlaylistSearch.get_playlist_suggestions(db, user_id, query, limit)
    
    # Additional utility methods
    @staticmethod
    def get_recent_playlists(db: Session, user_id: int, limit: int = 10):
        """Get recently created playlists for a user"""
        return PlaylistSearch.get_recent_playlists(db, user_id, limit)
    
    @staticmethod
    def get_popular_playlists(db: Session, user_id: int, limit: int = 10):
        """Get playlists with most tracks for a user"""
        return PlaylistSearch.get_popular_playlists(db, user_id, limit)
