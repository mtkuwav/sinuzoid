from sqlalchemy.orm import Session
from app.models.models import Track, Metadata
from app.schemas.schemas import MetadataUpdate
from typing import Optional, Dict, Any
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class MetadataEditService:
    """Service for editing track metadata"""
    
    @staticmethod
    def update_track_metadata(db: Session, track_id: UUID, user_id: int, metadata_update: MetadataUpdate) -> Optional[Dict[str, Any]]:
        """Update track metadata for a specific user's track"""
        try:
            # Verify track ownership
            track = db.query(Track).filter(
                Track.id == track_id,
                Track.user_id == user_id
            ).first()
            
            if not track:
                logger.warning(f"Track {track_id} not found or does not belong to user {user_id}")
                return None
            
            # Get existing metadata
            existing_metadata = db.query(Metadata).filter(Metadata.track_id == track_id).first()
            
            if existing_metadata:
                # Update existing metadata
                current_metadata = existing_metadata.metadata_json.copy()
                
                # Update only the provided fields
                update_data = metadata_update.model_dump(exclude_unset=True)
                current_metadata.update(update_data)
                
                existing_metadata.metadata_json = current_metadata
                logger.info(f"Updated existing metadata for track {track_id}")
            else:
                # Create new metadata record
                update_data = metadata_update.model_dump(exclude_unset=True)
                new_metadata = Metadata(
                    track_id=track_id,
                    metadata_json=update_data
                )
                db.add(new_metadata)
                current_metadata = update_data
                logger.info(f"Created new metadata for track {track_id}")
            
            db.commit()
            return current_metadata
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating metadata for track {track_id}: {str(e)}")
            raise
    
    @staticmethod
    def get_track_metadata(db: Session, track_id: UUID, user_id: int) -> Optional[Dict[str, Any]]:
        """Get track metadata for a specific user's track"""
        try:
            # Verify track ownership
            track = db.query(Track).filter(
                Track.id == track_id,
                Track.user_id == user_id
            ).first()
            
            if not track:
                return None
            
            metadata = db.query(Metadata).filter(Metadata.track_id == track_id).first()
            
            if metadata:
                return metadata.metadata_json
            return {}
            
        except Exception as e:
            logger.error(f"Error getting metadata for track {track_id}: {str(e)}")
            return None
    
    @staticmethod
    def validate_metadata_fields(metadata_update: MetadataUpdate) -> Dict[str, str]:
        """Validate metadata fields and return any validation errors"""
        errors = {}
        
        # Validate BPM if provided
        if metadata_update.bpm is not None:
            if metadata_update.bpm < 0 or metadata_update.bpm > 300:
                errors['bpm'] = "BPM must be between 0 and 300"
        
        # Validate track number format if provided
        if metadata_update.track is not None:
            try:
                # Accept formats like "1", "1/12", "01"
                track_parts = metadata_update.track.split('/')
                track_num = int(track_parts[0])
                if track_num < 1:
                    errors['track'] = "Track number must be positive"
            except ValueError:
                errors['track'] = "Invalid track number format"
        
        # Validate disc number format if provided
        if metadata_update.disc is not None:
            try:
                # Accept formats like "1", "1/2", "01"
                disc_parts = metadata_update.disc.split('/')
                disc_num = int(disc_parts[0])
                if disc_num < 1:
                    errors['disc'] = "Disc number must be positive"
            except ValueError:
                errors['disc'] = "Invalid disc number format"
        
        # Validate date format if provided (basic validation)
        if metadata_update.date is not None:
            if len(metadata_update.date) > 10:
                errors['date'] = "Date should be in YYYY or YYYY-MM-DD format"
        
        return errors
