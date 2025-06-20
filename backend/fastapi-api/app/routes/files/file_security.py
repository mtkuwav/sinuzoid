from sqlalchemy.orm import Session
from app.services.track_service import TrackService
import logging

logger = logging.getLogger(__name__)

class FileSecurity:
    """Service for file security and ownership verification"""
    
    @staticmethod
    def verify_file_ownership(filename: str, user_id: int, db: Session = None) -> bool:
        """Verify that a file belongs to the specified user"""
        try:
            if db is None:
                return False
            
            # Check if the track exists for this user (for audio files)
            track = TrackService.get_track_by_filename(db, filename, user_id)
            if track is not None:
                return True
            
            # Check if this is a cover file by looking at cover_path and cover_thumbnail_path
            from app.models.models import Track
            from sqlalchemy import and_, or_
            
            cover_track = db.query(Track).filter(
                and_(
                    Track.user_id == user_id,
                    or_(
                        Track.cover_path.contains(filename),
                        Track.cover_thumbnail_path.contains(filename)
                    )
                )
            ).first()
            
            return cover_track is not None
            
        except Exception as e:
            logger.error(f"Error verifying file ownership: {str(e)}")
            return False
    
    @staticmethod
    def verify_track_ownership(track_id: str, user_id: int, db: Session) -> bool:
        """Verify that a track belongs to the specified user"""
        try:
            track = TrackService.get_track_by_id(db, track_id, user_id)
            return track is not None
        except Exception as e:
            logger.error(f"Error verifying track ownership: {str(e)}")
            return False
    
    @staticmethod
    def get_user_track_by_filename(filename: str, user_id: int, db: Session):
        """Get track by filename for a specific user"""
        try:
            return TrackService.get_track_by_filename(db, filename, user_id)
        except Exception as e:
            logger.error(f"Error getting track by filename: {str(e)}")
            return None
