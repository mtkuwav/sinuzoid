from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.playlist_service import PlaylistService
from app.dependencies.auth import get_current_user
from app.database import get_db
from app.schemas.schemas import PlaylistCreate, PlaylistResponse
from typing import List
import logging

from .playlist_validation import PlaylistValidation

logger = logging.getLogger(__name__)

class PlaylistCrudRoutes:
    """Routes for playlist CRUD operations"""
    
    @staticmethod
    def create_playlist_route():
        """Create a new playlist"""
        async def create_playlist(
            playlist_data: PlaylistCreate,
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ) -> PlaylistResponse:
            try:
                user_id = current_user["id"]
                
                playlist = PlaylistService.create_playlist(db, playlist_data, user_id)
                logger.info(f"Playlist created: {playlist.id} for user {user_id}")
                
                return playlist
                
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "creating playlist")
        
        return create_playlist
    
    @staticmethod
    def get_user_playlists_route():
        """Get all playlists for the current user"""
        async def get_user_playlists(
            skip: int = 0,
            limit: int = 100,
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ) -> List[PlaylistResponse]:
            try:
                user_id = current_user["id"]
                
                # Validate pagination parameters
                if skip < 0:
                    raise HTTPException(status_code=400, detail="Skip must be non-negative")
                if limit < 1 or limit > 100:
                    raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
                
                playlists = PlaylistService.get_user_playlists(db, user_id, skip, limit)
                logger.info(f"Retrieved {len(playlists)} playlists for user {user_id}")
                
                return playlists
                
            except HTTPException:
                raise
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "retrieving playlists")
        
        return get_user_playlists
    
    @staticmethod
    def get_playlist_route():
        """Get a specific playlist by ID"""
        async def get_playlist(
            playlist_id: str,
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ) -> PlaylistResponse:
            try:
                user_id = current_user["id"]
                playlist_uuid = PlaylistValidation.validate_playlist_id(playlist_id)
                
                playlist = PlaylistService.get_playlist_by_id(db, playlist_uuid, user_id)
                
                if not playlist:
                    PlaylistValidation.handle_playlist_not_found(playlist_id)
                
                return playlist
                
            except HTTPException:
                raise
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "retrieving playlist", playlist_id)
        
        return get_playlist
    
    @staticmethod
    def update_playlist_route():
        """Update a playlist"""
        async def update_playlist(
            playlist_id: str,
            playlist_data: PlaylistCreate,
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ) -> PlaylistResponse:
            try:
                user_id = current_user["id"]
                playlist_uuid = PlaylistValidation.validate_playlist_id(playlist_id)
                
                playlist = PlaylistService.update_playlist(db, playlist_uuid, playlist_data, user_id)
                
                if not playlist:
                    PlaylistValidation.handle_playlist_not_found(playlist_id)
                
                logger.info(f"Playlist updated: {playlist_id}")
                return playlist
                
            except HTTPException:
                raise
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "updating playlist", playlist_id)
        
        return update_playlist
    
    @staticmethod
    def delete_playlist_route():
        """Delete a playlist"""
        async def delete_playlist(
            playlist_id: str,
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            try:
                user_id = current_user["id"]
                playlist_uuid = PlaylistValidation.validate_playlist_id(playlist_id)
                
                deleted = PlaylistService.delete_playlist(db, playlist_uuid, user_id)
                
                if not deleted:
                    PlaylistValidation.handle_playlist_not_found(playlist_id)
                
                logger.info(f"Playlist deleted: {playlist_id}")
                return {"message": "Playlist successfully deleted"}
                
            except HTTPException:
                raise
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "deleting playlist", playlist_id)
        
        return delete_playlist
