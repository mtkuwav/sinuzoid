from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.playlist_service import PlaylistService
from app.dependencies.auth import get_current_user
from app.database import get_db
from app.schemas.schemas import PlaylistCreate, PlaylistResponse
from typing import List
from uuid import UUID
import logging


logger = logging.getLogger(__name__)


router = APIRouter(prefix="/playlists", tags=["playlists"])


@router.post("/", response_model=PlaylistResponse)
async def create_playlist(
    playlist_data: PlaylistCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new playlist"""
    try:
        user_id = current_user["id"]
        
        playlist = PlaylistService.create_playlist(db, playlist_data, user_id)
        logger.info(f"Playlist created: {playlist.id} for user {user_id}")
        
        return playlist
        
    except Exception as e:
        logger.error(f"Error creating playlist: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating playlist")


@router.get("/", response_model=List[PlaylistResponse])
async def get_user_playlists(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all playlists for the current user"""
    try:
        user_id = current_user["id"]
        
        playlists = PlaylistService.get_user_playlists(db, user_id, skip, limit)
        logger.info(f"Retrieved {len(playlists)} playlists for user {user_id}")
        
        return playlists
        
    except Exception as e:
        logger.error(f"Error retrieving playlists: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving playlists")


@router.get("/{playlist_id}", response_model=PlaylistResponse)
async def get_playlist(
    playlist_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific playlist by ID"""
    try:
        user_id = current_user["id"]
        playlist_uuid = UUID(playlist_id)
        
        playlist = PlaylistService.get_playlist_by_id(db, playlist_uuid, user_id)
        
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        
        return playlist
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid playlist ID format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving playlist {playlist_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving playlist")


@router.put("/{playlist_id}", response_model=PlaylistResponse)
async def update_playlist(
    playlist_id: str,
    playlist_data: PlaylistCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a playlist"""
    try:
        user_id = current_user["id"]
        playlist_uuid = UUID(playlist_id)
        
        playlist = PlaylistService.update_playlist(db, playlist_uuid, playlist_data, user_id)
        
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        
        logger.info(f"Playlist updated: {playlist_id}")
        return playlist
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid playlist ID format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating playlist {playlist_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating playlist")


@router.delete("/{playlist_id}")
async def delete_playlist(
    playlist_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a playlist"""
    try:
        user_id = current_user["id"]
        playlist_uuid = UUID(playlist_id)
        
        deleted = PlaylistService.delete_playlist(db, playlist_uuid, user_id)
        
        if not deleted:
            raise HTTPException(status_code=404, detail="Playlist not found")
        
        logger.info(f"Playlist deleted: {playlist_id}")
        return {"message": "Playlist successfully deleted"}
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid playlist ID format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting playlist {playlist_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting playlist")


@router.post("/{playlist_id}/tracks/{track_id}")
async def add_track_to_playlist(
    playlist_id: str,
    track_id: str,
    position: int = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a track to a playlist"""
    try:
        user_id = current_user["id"]
        playlist_uuid = UUID(playlist_id)
        track_uuid = UUID(track_id)
        
        success = PlaylistService.add_track_to_playlist(
            db, playlist_uuid, track_uuid, user_id, position
        )
        
        if not success:
            raise HTTPException(
                status_code=400, 
                detail="Failed to add track to playlist (playlist or track not found, or track already in playlist)"
            )
        
        logger.info(f"Track {track_id} added to playlist {playlist_id}")
        return {"message": "Track successfully added to playlist"}
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding track to playlist: {str(e)}")
        raise HTTPException(status_code=500, detail="Error adding track to playlist")


@router.delete("/{playlist_id}/tracks/{track_id}")
async def remove_track_from_playlist(
    playlist_id: str,
    track_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a track from a playlist"""
    try:
        user_id = current_user["id"]
        playlist_uuid = UUID(playlist_id)
        track_uuid = UUID(track_id)
        
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
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing track from playlist: {str(e)}")
        raise HTTPException(status_code=500, detail="Error removing track from playlist")


@router.get("/{playlist_id}/tracks")
async def get_playlist_tracks(
    playlist_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tracks in a playlist"""
    try:
        user_id = current_user["id"]
        playlist_uuid = UUID(playlist_id)
        
        tracks = PlaylistService.get_playlist_tracks(db, playlist_uuid, user_id)
        
        logger.info(f"Retrieved {len(tracks)} tracks for playlist {playlist_id}")
        return {"tracks": tracks}
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid playlist ID format")
    except Exception as e:
        logger.error(f"Error retrieving playlist tracks: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving playlist tracks")


@router.put("/{playlist_id}/tracks/reorder")
async def reorder_playlist_tracks(
    playlist_id: str,
    track_orders: List[dict],
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reorder tracks in a playlist"""
    try:
        user_id = current_user["id"]
        playlist_uuid = UUID(playlist_id)
        
        for track_order in track_orders:
            track_order["track_id"] = UUID(track_order["track_id"])
        
        success = PlaylistService.reorder_playlist_tracks(
            db, playlist_uuid, user_id, track_orders
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Playlist not found")
        
        logger.info(f"Reordered tracks in playlist {playlist_id}")
        return {"message": "Tracks successfully reordered"}
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reordering playlist tracks: {str(e)}")
        raise HTTPException(status_code=500, detail="Error reordering playlist tracks")