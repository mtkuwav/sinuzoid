from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.models import Playlist
from app.schemas.schemas import PlaylistCreate
from typing import List, Optional
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class PlaylistManager:
    """Service for managing playlist CRUD operations"""
    
    @staticmethod
    def create_playlist(db: Session, playlist_data: PlaylistCreate, user_id: int) -> Playlist:
        """Create a new playlist"""
        try:
            db_playlist = Playlist(
                user_id=user_id,
                **playlist_data.model_dump()
            )
            db.add(db_playlist)
            db.commit()
            db.refresh(db_playlist)
            
            logger.info(f"Playlist created: {db_playlist.id} for user {user_id}")
            return db_playlist
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating playlist: {str(e)}")
            raise

    @staticmethod
    def get_user_playlists(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Playlist]:
        """Get all playlists for a user"""
        return db.query(Playlist).filter(Playlist.user_id == user_id).offset(skip).limit(limit).all()

    @staticmethod
    def get_playlist_by_id(db: Session, playlist_id: UUID, user_id: int) -> Optional[Playlist]:
        """Get playlist by ID for a specific user"""
        return db.query(Playlist).filter(
            and_(
                Playlist.id == playlist_id,
                Playlist.user_id == user_id
            )
        ).first()

    @staticmethod
    def update_playlist(db: Session, playlist_id: UUID, playlist_data: PlaylistCreate, user_id: int) -> Optional[Playlist]:
        """Update a playlist"""
        try:
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                return None
            
            for field, value in playlist_data.model_dump().items():
                setattr(playlist, field, value)
            
            db.commit()
            db.refresh(playlist)
            
            logger.info(f"Playlist updated: {playlist_id}")
            return playlist
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating playlist {playlist_id}: {str(e)}")
            raise

    @staticmethod
    def delete_playlist(db: Session, playlist_id: UUID, user_id: int) -> bool:
        """Delete a playlist"""
        try:
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                return False
                
            db.delete(playlist)
            db.commit()
            logger.info(f"Playlist deleted: {playlist_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting playlist {playlist_id}: {str(e)}")
            raise

    @staticmethod
    def verify_playlist_ownership(db: Session, playlist_id: UUID, user_id: int) -> bool:
        """Verify that a playlist belongs to a user"""
        playlist = db.query(Playlist).filter(
            and_(
                Playlist.id == playlist_id,
                Playlist.user_id == user_id
            )
        ).first()
        return playlist is not None
