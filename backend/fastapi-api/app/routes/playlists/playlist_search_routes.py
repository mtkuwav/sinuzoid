from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.services.playlist_service import PlaylistService
from app.dependencies.auth import get_current_user
from app.database import get_db
from app.schemas.schemas import PlaylistSearchResult
import logging

from .playlist_validation import PlaylistValidation

logger = logging.getLogger(__name__)

class PlaylistSearchRoutes:
    """Routes for playlist search and suggestions"""
    
    @staticmethod
    def search_playlists_route():
        """Search playlists by name, description and optionally track names"""
        async def search_playlists(
            query: str = Query(..., min_length=1, description="Search query"),
            search_in_tracks: bool = Query(False, description="Include track names in search"),
            search_in_description: bool = Query(True, description="Include descriptions in search"),
            limit: int = Query(50, ge=1, le=100, description="Maximum results"),
            offset: int = Query(0, ge=0, description="Results offset"),
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ) -> PlaylistSearchResult:
            try:
                user_id = current_user["id"]
                
                # Validate search parameters
                query, limit, offset = PlaylistValidation.validate_search_params(query, limit, offset)
                
                playlists, total = PlaylistService.search_playlists(
                    db, user_id, query, search_in_tracks, search_in_description, limit, offset
                )
                
                logger.info(f"Search '{query}' returned {total} results for user {user_id}")
                
                return PlaylistSearchResult(
                    playlists=playlists,
                    total_results=total,
                    search_query=query,
                    search_in_tracks=search_in_tracks,
                    search_in_description=search_in_description
                )
                
            except HTTPException:
                raise
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "during playlist search")
        
        return search_playlists
    
    @staticmethod
    def get_playlist_suggestions_route():
        """Get playlist name suggestions for autocomplete"""
        async def get_playlist_suggestions(
            query: str = Query(..., min_length=2, description="Partial playlist name"),
            limit: int = Query(5, ge=1, le=10),
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            try:
                user_id = current_user["id"]
                
                # Validate parameters
                if len(query.strip()) < 2:
                    raise HTTPException(status_code=400, detail="Query must be at least 2 characters long")
                
                if limit < 1 or limit > 10:
                    raise HTTPException(status_code=400, detail="Limit must be between 1 and 10")
                
                suggestions = PlaylistService.get_playlist_suggestions(db, user_id, query, limit)
                
                logger.info(f"Generated {len(suggestions)} suggestions for query '{query}' for user {user_id}")
                return {"suggestions": suggestions}
                
            except HTTPException:
                raise
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "getting playlist suggestions")
        
        return get_playlist_suggestions
    
    @staticmethod
    def get_recent_playlists_route():
        """Get recently created playlists"""
        async def get_recent_playlists(
            limit: int = Query(10, ge=1, le=50, description="Maximum results"),
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            try:
                user_id = current_user["id"]
                
                playlists = PlaylistService.get_recent_playlists(db, user_id, limit)
                
                logger.info(f"Retrieved {len(playlists)} recent playlists for user {user_id}")
                return {"playlists": playlists, "total": len(playlists)}
                
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "getting recent playlists")
        
        return get_recent_playlists
    
    @staticmethod
    def get_popular_playlists_route():
        """Get playlists with most tracks"""
        async def get_popular_playlists(
            limit: int = Query(10, ge=1, le=50, description="Maximum results"),
            current_user: dict = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            try:
                user_id = current_user["id"]
                
                playlists = PlaylistService.get_popular_playlists(db, user_id, limit)
                
                logger.info(f"Retrieved {len(playlists)} popular playlists for user {user_id}")
                return {"playlists": playlists, "total": len(playlists)}
                
            except Exception as e:
                PlaylistValidation.log_and_raise_error(e, "getting popular playlists")
        
        return get_popular_playlists
