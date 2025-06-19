from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.models.models import Track, Metadata, Statistics
from app.schemas.schemas import TrackCreate, TrackResponse
from typing import List, Optional
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class TrackService:
    
    @staticmethod
    def create_track(db: Session, track_data: TrackCreate, user_id: int) -> Track:
        """Create a new track record"""
        try:
            db_track = Track(
                user_id=user_id,
                **track_data.model_dump()
            )
            db.add(db_track)
            db.commit()
            db.refresh(db_track)
            
            logger.info(f"Track created in database: {db_track.id} for user {user_id}")
            return db_track
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating track in database: {str(e)}")
            raise

    @staticmethod
    def get_user_tracks(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Track]:
        """Get all tracks for a user"""
        return db.query(Track).filter(Track.user_id == user_id).offset(skip).limit(limit).all()

    @staticmethod
    def get_track_by_filename(db: Session, filename: str, user_id: int) -> Optional[Track]:
        """Get track by filename for a specific user"""
        return db.query(Track).filter(
            and_(
                Track.file_path.contains(filename),
                Track.user_id == user_id
            )
        ).first()

    @staticmethod
    def get_track_by_id(db: Session, track_id: UUID, user_id: int) -> Optional[Track]:
        """Get track by ID for a specific user"""
        return db.query(Track).filter(
            and_(
                Track.id == track_id,
                Track.user_id == user_id
            )
        ).first()

    @staticmethod
    def delete_track(db: Session, track_id: UUID, user_id: int) -> bool:
        """Delete a track"""
        try:
            track = db.query(Track).filter(
                and_(
                    Track.id == track_id,
                    Track.user_id == user_id
                )
            ).first()
            
            if not track:
                return False
                
            db.delete(track)
            db.commit()
            logger.info(f"Track deleted from database: {track_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting track {track_id}: {str(e)}")
            raise

    @staticmethod
    def delete_all_user_tracks(db: Session, user_id: int) -> int:
        """Delete all tracks for a user and return the number of deleted tracks"""
        try:
            # Get all tracks for the user
            tracks = db.query(Track).filter(Track.user_id == user_id).all()
            track_count = len(tracks)
            
            if track_count == 0:
                logger.info(f"No tracks found for user {user_id}")
                return 0
            
            # Delete all tracks (this will cascade to metadata and statistics)
            deleted_count = db.query(Track).filter(Track.user_id == user_id).delete()
            db.commit()
            
            logger.info(f"All tracks deleted from database for user {user_id}: {deleted_count} tracks")
            return deleted_count
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting all tracks for user {user_id}: {str(e)}")
            raise

    @staticmethod
    def save_metadata(db: Session, track_id: UUID, metadata: dict) -> None:
        """Save track metadata"""
        try:
            # Check if metadata already exists
            existing_metadata = db.query(Metadata).filter(Metadata.track_id == track_id).first()
            
            if existing_metadata:
                existing_metadata.metadata_json = metadata
            else:
                db_metadata = Metadata(
                    track_id=track_id,
                    metadata_json=metadata
                )
                db.add(db_metadata)
            
            db.commit()
            logger.info(f"Metadata saved for track: {track_id}")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error saving metadata for track {track_id}: {str(e)}")
            raise

    @staticmethod
    def update_last_accessed(db: Session, track_id: UUID) -> None:
        """Update track last accessed timestamp"""
        try:
            track = db.query(Track).filter(Track.id == track_id).first()
            if track:
                track.last_accessed = func.now()
                db.commit()
                
        except Exception as e:
            logger.error(f"Error updating last accessed for track {track_id}: {str(e)}")

    @staticmethod
    def get_user_total_storage(db: Session, user_id: int) -> int:
        """Get total storage used by a user in bytes"""
        try:
            total_size = db.query(func.sum(Track.file_size)).filter(Track.user_id == user_id).scalar()
            return total_size or 0
            
        except Exception as e:
            logger.error(f"Error calculating total storage for user {user_id}: {str(e)}")
            return 0