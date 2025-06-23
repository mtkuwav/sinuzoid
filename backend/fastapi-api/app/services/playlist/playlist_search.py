from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from app.models.models import Playlist, Track, playlist_tracks
from typing import List, Tuple
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class PlaylistSearch:
    """Service for playlist search and suggestions"""
    
    @staticmethod
    def search_playlists(
        db: Session, 
        user_id: int, 
        query: str, 
        search_in_tracks: bool = False,
        search_in_description: bool = True,
        limit: int = 50, 
        offset: int = 0
    ) -> Tuple[List[Playlist], int]:
        """Search playlists by name, description and optionally tracks"""
        try:
            base_query = db.query(Playlist).filter(Playlist.user_id == user_id)
            
            # Return all playlists if no query
            if not query or query.strip() == "":
                total = base_query.count()
                playlists = base_query.offset(offset).limit(limit).all()
                return playlists, total
            
            search_term = f"%{query.lower()}%"
            conditions = [
                Playlist.name.ilike(search_term)
            ]
            
            # Add description search if enabled
            if search_in_description:
                conditions.append(Playlist.description.ilike(search_term))
            
            # Add track search if enabled
            if search_in_tracks:
                track_subquery = db.query(playlist_tracks.c.playlist_id).join(
                    Track, playlist_tracks.c.track_id == Track.id
                ).filter(
                    Track.original_filename.ilike(search_term)
                ).distinct()
                
                conditions.append(Playlist.id.in_(track_subquery))
            
            # Execute search
            search_query = base_query.filter(or_(*conditions))
            total = search_query.count()
            playlists = search_query.offset(offset).limit(limit).all()
            
            logger.info(f"Search for '{query}' returned {total} playlists for user {user_id}")
            return playlists, total
            
        except Exception as e:
            logger.error(f"Error searching playlists for user {user_id}: {str(e)}")
            return [], 0

    @staticmethod
    def search_tracks_in_playlist(
        db: Session, 
        playlist_id: UUID, 
        user_id: int, 
        query: str,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Track], int]:
        """Search tracks within a specific playlist"""
        try:
            # Verify playlist ownership
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                return [], 0
            
            # Return all tracks if no query
            if not query or query.strip() == "":
                base_query = db.query(Track).join(
                    playlist_tracks,
                    Track.id == playlist_tracks.c.track_id
                ).filter(
                    playlist_tracks.c.playlist_id == playlist_id
                ).order_by(playlist_tracks.c.position)
                
                total = base_query.count()
                tracks = base_query.offset(offset).limit(limit).all()
                return tracks, total
            
            search_term = f"%{query.lower()}%"
            
            # Search in track filenames within the playlist
            base_query = db.query(Track).join(
                playlist_tracks,
                Track.id == playlist_tracks.c.track_id
            ).filter(
                and_(
                    playlist_tracks.c.playlist_id == playlist_id,
                    Track.original_filename.ilike(search_term)
                )
            ).order_by(playlist_tracks.c.position)
            
            total = base_query.count()
            tracks = base_query.offset(offset).limit(limit).all()
            
            logger.info(f"Search for '{query}' in playlist {playlist_id} returned {total} tracks")
            return tracks, total
            
        except Exception as e:
            logger.error(f"Error searching tracks in playlist {playlist_id}: {str(e)}")
            return [], 0

    @staticmethod
    def get_playlist_suggestions(db: Session, user_id: int, query: str, limit: int = 5) -> List[str]:
        """Get playlist name suggestions based on partial query"""
        try:
            if not query or len(query) < 2:
                return []
            
            search_term = f"{query.lower()}%"
            
            suggestions = db.query(Playlist.name).filter(
                and_(
                    Playlist.user_id == user_id,
                    Playlist.name.ilike(search_term)
                )
            ).distinct().limit(limit).all()
            
            return [suggestion[0] for suggestion in suggestions]
            
        except Exception as e:
            logger.error(f"Error getting playlist suggestions: {str(e)}")
            return []

    @staticmethod
    def get_recent_playlists(db: Session, user_id: int, limit: int = 10) -> List[Playlist]:
        """Get recently created playlists for a user"""
        try:
            return db.query(Playlist).filter(
                Playlist.user_id == user_id
            ).order_by(Playlist.created_at.desc()).limit(limit).all()
            
        except Exception as e:
            logger.error(f"Error getting recent playlists for user {user_id}: {str(e)}")
            return []

    @staticmethod
    def get_popular_playlists(db: Session, user_id: int, limit: int = 10) -> List[Playlist]:
        """Get playlists with most tracks for a user"""
        try:
            # Subquery to count tracks per playlist
            track_counts = db.query(
                playlist_tracks.c.playlist_id,
                func.count(playlist_tracks.c.track_id).label('track_count')
            ).group_by(playlist_tracks.c.playlist_id).subquery()
            
            return db.query(Playlist).join(
                track_counts, Playlist.id == track_counts.c.playlist_id
            ).filter(
                Playlist.user_id == user_id
            ).order_by(track_counts.c.track_count.desc()).limit(limit).all()
            
        except Exception as e:
            logger.error(f"Error getting popular playlists for user {user_id}: {str(e)}")
            return []
