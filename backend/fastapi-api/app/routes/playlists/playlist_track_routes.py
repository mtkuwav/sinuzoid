from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.services.playlist_service import PlaylistService
from app.dependencies.auth import get_current_user
from app.database import get_db
from typing import List
import logging

from .playlist_validation import PlaylistValidation

logger = logging.getLogger(__name__)

class PlaylistTrackRoutes:
    """Routes for managing tracks within playlists"""
    
    @staticmethod
    def add_track_to_playlist_route():
        """Add a track to a playlist"""
        async def add_track_to_playlist(
            playlist_id: str,
            track_id: str,
            position: int = None,
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            try:
                user_id = current_user["id"]
                playlist_uuid = PlaylistValidation.validate_playlist_id(playlist_id)
                track_uuid = PlaylistValidation.validate_track_id(track_id)
                
                # Validate position if provided
                if position is not None and position < 0:
                    raise HTTPException(status_code=400, detail="Position must be non-negative")
                
                success = PlaylistService.add_track_to_playlist(
                    db, playlist_uuid, track_uuid, user_id, position
                )
                
                if not success:
                    PlaylistValidation.handle_operation_failed(
                        "add track to playlist",
                        "playlist or track not found, or track already in playlist"
                    )
                
                logger.info(f"Track {track_id} added to playlist {playlist_id}")
                return {"message": "Track successfully added to playlist"}
                
            except HTTPException:
                raise
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "adding track to playlist")
        
        return add_track_to_playlist
    
    @staticmethod
    def remove_track_from_playlist_route():
        """Remove a track from a playlist"""
        async def remove_track_from_playlist(
            playlist_id: str,
            track_id: str,
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            try:
                user_id = current_user["id"]
                playlist_uuid = PlaylistValidation.validate_playlist_id(playlist_id)
                track_uuid = PlaylistValidation.validate_track_id(track_id)
                
                success = PlaylistService.remove_track_from_playlist(
                    db, playlist_uuid, track_uuid, user_id
                )
                
                if not success:
                    raise HTTPException(
                        status_code=404, 
                        detail="Playlist not found or track not in playlist"
                    )
                
                logger.info(f"Track {track_id} removed from playlist {playlist_id}")
                return {"message": "Track successfully removed from playlist"}
                
            except HTTPException:
                raise
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "removing track from playlist")
        
        return remove_track_from_playlist
    
    @staticmethod
    def get_playlist_tracks_route():
        """Get all tracks in a playlist"""
        async def get_playlist_tracks(
            playlist_id: str,
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            try:
                user_id = current_user["id"]
                playlist_uuid = PlaylistValidation.validate_playlist_id(playlist_id)
                
                tracks = PlaylistService.get_playlist_tracks(db, playlist_uuid, user_id)
                
                logger.info(f"Retrieved {len(tracks)} tracks for playlist {playlist_id}")
                return {"tracks": tracks, "total": len(tracks)}
                
            except HTTPException:
                raise
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "retrieving playlist tracks")
        
        return get_playlist_tracks
    
    @staticmethod
    def reorder_playlist_tracks_route():
        """Reorder tracks in a playlist"""
        async def reorder_playlist_tracks(
            playlist_id: str,
            track_orders: List[dict],
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            try:
                user_id = current_user["id"]
                playlist_uuid = PlaylistValidation.validate_playlist_id(playlist_id)
                
                # Validate track orders
                validated_orders = PlaylistValidation.validate_track_orders(track_orders)
                
                success = PlaylistService.reorder_playlist_tracks(
                    db, playlist_uuid, user_id, validated_orders
                )
                
                if not success:
                    PlaylistValidation.handle_playlist_not_found(playlist_id)
                
                logger.info(f"Reordered tracks in playlist {playlist_id}")
                return {"message": "Tracks successfully reordered"}
                
            except HTTPException:
                raise
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "reordering playlist tracks")
        
        return reorder_playlist_tracks
    
    @staticmethod
    def search_tracks_in_playlist_route():
        """Search tracks within a specific playlist"""
        async def search_tracks_in_playlist(
            playlist_id: str,
            query: str = Query(..., min_length=1, description="Search query for tracks"),
            limit: int = Query(50, ge=1, le=100),
            offset: int = Query(0, ge=0),
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            try:
                user_id = current_user["id"]
                playlist_uuid = PlaylistValidation.validate_playlist_id(playlist_id)
                
                # Validate search parameters
                query, limit, offset = PlaylistValidation.validate_search_params(query, limit, offset)
                
                tracks, total = PlaylistService.search_tracks_in_playlist(
                    db, playlist_uuid, user_id, query, limit, offset
                )
                
                logger.info(f"Track search in playlist {playlist_id} returned {total} results")
                
                return {
                    "tracks": tracks,
                    "total_results": total,
                    "search_query": query,
                    "playlist_id": playlist_id
                }
                
            except HTTPException:
                raise
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "searching tracks in playlist")
        
        return search_tracks_in_playlist
