from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.models.models import Playlist, Track, playlist_tracks
from typing import List, Optional
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class PlaylistTrackManager:
    """Service for managing tracks within playlists"""
    
    @staticmethod
    def add_track_to_playlist(db: Session, playlist_id: UUID, track_id: UUID, user_id: int, position: Optional[int] = None) -> bool:
        """Add a track to a playlist"""
        try:
            # Verify playlist ownership
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                logger.warning(f"Playlist {playlist_id} not found for user {user_id}")
                return False
            
            # Verify track ownership
            track = db.query(Track).filter(
                and_(
                    Track.id == track_id,
                    Track.user_id == user_id
                )
            ).first()
            
            if not track:
                logger.warning(f"Track {track_id} not found for user {user_id}")
                return False
            
            # Check if track already exists in playlist
            existing = db.execute(
                playlist_tracks.select().where(
                    and_(
                        playlist_tracks.c.playlist_id == playlist_id,
                        playlist_tracks.c.track_id == track_id
                    )
                )
            ).first()
            
            if existing:
                logger.warning(f"Track {track_id} already in playlist {playlist_id}")
                return False
            
            # Determine position if not provided
            if position is None:
                max_position = db.execute(
                    func.max(playlist_tracks.c.position).select().where(
                        playlist_tracks.c.playlist_id == playlist_id
                    )
                ).scalar() or 0
                position = max_position + 1
            
            # Add track to playlist
            db.execute(
                playlist_tracks.insert().values(
                    playlist_id=playlist_id,
                    track_id=track_id,
                    position=position
                )
            )
            
            db.commit()
            logger.info(f"Track {track_id} added to playlist {playlist_id} at position {position}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error adding track {track_id} to playlist {playlist_id}: {str(e)}")
            raise

    @staticmethod
    def remove_track_from_playlist(db: Session, playlist_id: UUID, track_id: UUID, user_id: int) -> bool:
        """Remove a track from a playlist"""
        try:
            # Verify playlist ownership
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                return False
            
            # Remove track from playlist
            result = db.execute(
                playlist_tracks.delete().where(
                    and_(
                        playlist_tracks.c.playlist_id == playlist_id,
                        playlist_tracks.c.track_id == track_id
                    )
                )
            )
            
            db.commit()
            
            if result.rowcount > 0:
                logger.info(f"Track {track_id} removed from playlist {playlist_id}")
                return True
            else:
                logger.warning(f"Track {track_id} not found in playlist {playlist_id}")
                return False
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error removing track {track_id} from playlist {playlist_id}: {str(e)}")
            raise

    @staticmethod
    def reorder_playlist_tracks(db: Session, playlist_id: UUID, user_id: int, track_orders: List[dict]) -> bool:
        """Reorder tracks in a playlist
        
        Args:
            track_orders: List of {"track_id": UUID, "position": int}
        """
        try:
            # Verify playlist ownership
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                return False
            
            # Update positions
            for track_order in track_orders:
                track_id = track_order["track_id"]
                position = track_order["position"]
                
                db.execute(
                    playlist_tracks.update().where(
                        and_(
                            playlist_tracks.c.playlist_id == playlist_id,
                            playlist_tracks.c.track_id == track_id
                        )
                    ).values(position=position)
                )
            
            db.commit()
            logger.info(f"Reordered tracks in playlist {playlist_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error reordering playlist {playlist_id}: {str(e)}")
            raise

    @staticmethod
    def get_playlist_tracks(db: Session, playlist_id: UUID, user_id: int) -> List[Track]:
        """Get all tracks in a playlist ordered by position"""
        try:
            # Verify playlist ownership
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                return []
            
            # Get tracks ordered by position
            tracks = db.query(Track).join(
                playlist_tracks,
                Track.id == playlist_tracks.c.track_id
            ).filter(
                playlist_tracks.c.playlist_id == playlist_id
            ).order_by(playlist_tracks.c.position).all()
            
            return tracks
            
        except Exception as e:
            logger.error(f"Error getting tracks for playlist {playlist_id}: {str(e)}")
            return []

    @staticmethod
    def get_track_position_in_playlist(db: Session, playlist_id: UUID, track_id: UUID) -> Optional[int]:
        """Get the position of a track in a playlist"""
        try:
            result = db.execute(
                playlist_tracks.select().where(
                    and_(
                        playlist_tracks.c.playlist_id == playlist_id,
                        playlist_tracks.c.track_id == track_id
                    )
                )
            ).first()
            
            return result.position if result else None
            
        except Exception as e:
            logger.error(f"Error getting track position: {str(e)}")
            return None
