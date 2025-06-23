from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.services.track_service import TrackService
from app.schemas.schemas import TrackResponse, TrackSearchResult
from typing import List
import logging

logger = logging.getLogger(__name__)

class TrackSearchHandler:
    """Handler for track search and listing operations"""
    
    @staticmethod
    def get_user_tracks(user_id: int, db: Session, skip: int = 0, limit: int = 100) -> List[TrackResponse]:
        """Get all tracks for the current user"""
        try:
            tracks = TrackService.get_user_tracks(db, user_id, skip, limit)
            
            logger.info(f"Retrieved {len(tracks)} tracks for user {user_id}")
            return tracks
            
        except Exception as e:
            logger.error(f"Error retrieving tracks for user: {str(e)}")
            raise HTTPException(status_code=500, detail="Error retrieving tracks")
    
    @staticmethod
    def search_tracks(
        user_id: int,
        db: Session,
        query: str = None,
        search_in_filename: bool = True,
        search_in_metadata: bool = True,
        file_type: str = None,
        offset: int = 0,
        limit: int = 50
    ) -> TrackSearchResult:
        """Search tracks for the current user"""
        try:
            # Validate limit
            if limit > 100:
                limit = 100
            
            # Validate offset
            if offset < 0:
                offset = 0
            
            # Validate file_type if provided
            if file_type:
                allowed_types = ["mp3", "wav", "flac", "ogg", "aac"]
                if file_type.lower() not in allowed_types:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
                    )
            
            # Search tracks
            search_result = TrackService.search_tracks(
                db=db,
                user_id=user_id,
                search_query=query,
                search_in_filename=search_in_filename,
                search_in_metadata=search_in_metadata,
                file_type=file_type,
                offset=offset,
                limit=limit
            )
            
            logger.info(f"Search completed for user {user_id}: query='{query}', results={search_result['total_results']}")
            
            return TrackSearchResult(**search_result)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error searching tracks for user: {str(e)}")
            raise HTTPException(status_code=500, detail="Error searching tracks")
    
    @staticmethod
    def get_track_by_id(user_id: int, track_id: str, db: Session):
        """Get a specific track by ID for the user"""
        try:
            track = TrackService.get_track_by_id(db, track_id, user_id)
            
            if not track:
                raise HTTPException(status_code=404, detail="Track not found")
            
            logger.info(f"Track retrieved: {track_id} for user {user_id}")
            return track
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error retrieving track {track_id} for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error retrieving track")
    
    @staticmethod
    def get_track_statistics(user_id: int, db: Session):
        """Get statistics about user's tracks"""
        try:
            stats = TrackService.get_user_track_statistics(db, user_id)
            
            logger.info(f"Track statistics retrieved for user {user_id}")
            return stats
            
        except Exception as e:
            logger.error(f"Error retrieving track statistics for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error retrieving track statistics")
    
    @staticmethod
    def get_recent_tracks(user_id: int, db: Session, limit: int = 10):
        """Get recently uploaded tracks for the user"""
        try:
            tracks = TrackService.get_recent_tracks(db, user_id, limit)
            
            logger.info(f"Retrieved {len(tracks)} recent tracks for user {user_id}")
            return tracks
            
        except Exception as e:
            logger.error(f"Error retrieving recent tracks for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error retrieving recent tracks")
    
    @staticmethod
    def get_popular_tracks(user_id: int, db: Session, limit: int = 10):
        """Get most accessed tracks for the user"""
        try:
            tracks = TrackService.get_popular_tracks(db, user_id, limit)
            
            logger.info(f"Retrieved {len(tracks)} popular tracks for user {user_id}")
            return tracks
            
        except Exception as e:
            logger.error(f"Error retrieving popular tracks for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error retrieving popular tracks")
