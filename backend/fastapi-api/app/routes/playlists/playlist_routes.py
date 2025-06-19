from fastapi import APIRouter
from app.schemas.schemas import PlaylistResponse, PlaylistSearchResult
from typing import List
import logging

from .playlist_crud_routes import PlaylistCrudRoutes
from .playlist_search_routes import PlaylistSearchRoutes
from .playlist_track_routes import PlaylistTrackRoutes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/playlists", tags=["playlists"])

# Playlist CRUD operations
router.add_api_route(
    "/", 
    PlaylistCrudRoutes.create_playlist_route(), 
    methods=["POST"], 
    response_model=PlaylistResponse,
    summary="Create a new playlist"
)

router.add_api_route(
    "/", 
    PlaylistCrudRoutes.get_user_playlists_route(), 
    methods=["GET"], 
    response_model=List[PlaylistResponse],
    summary="Get all playlists for the current user"
)

router.add_api_route(
    "/{playlist_id}", 
    PlaylistCrudRoutes.get_playlist_route(), 
    methods=["GET"], 
    response_model=PlaylistResponse,
    summary="Get a specific playlist by ID"
)

router.add_api_route(
    "/{playlist_id}", 
    PlaylistCrudRoutes.update_playlist_route(), 
    methods=["PUT"], 
    response_model=PlaylistResponse,
    summary="Update a playlist"
)

router.add_api_route(
    "/{playlist_id}", 
    PlaylistCrudRoutes.delete_playlist_route(), 
    methods=["DELETE"],
    summary="Delete a playlist"
)

# Search and suggestions
router.add_api_route(
    "/search", 
    PlaylistSearchRoutes.search_playlists_route(), 
    methods=["GET"], 
    response_model=PlaylistSearchResult,
    summary="Search playlists by name, description and optionally track names"
)

router.add_api_route(
    "/suggestions", 
    PlaylistSearchRoutes.get_playlist_suggestions_route(), 
    methods=["GET"],
    summary="Get playlist name suggestions for autocomplete"
)

router.add_api_route(
    "/recent", 
    PlaylistSearchRoutes.get_recent_playlists_route(), 
    methods=["GET"],
    summary="Get recently created playlists"
)

router.add_api_route(
    "/popular", 
    PlaylistSearchRoutes.get_popular_playlists_route(), 
    methods=["GET"],
    summary="Get playlists with most tracks"
)

# Track management in playlists
router.add_api_route(
    "/{playlist_id}/tracks/{track_id}", 
    PlaylistTrackRoutes.add_track_to_playlist_route(), 
    methods=["POST"],
    summary="Add a track to a playlist"
)

router.add_api_route(
    "/{playlist_id}/tracks/{track_id}", 
    PlaylistTrackRoutes.remove_track_from_playlist_route(), 
    methods=["DELETE"],
    summary="Remove a track from a playlist"
)

router.add_api_route(
    "/{playlist_id}/tracks", 
    PlaylistTrackRoutes.get_playlist_tracks_route(), 
    methods=["GET"],
    summary="Get all tracks in a playlist"
)

router.add_api_route(
    "/{playlist_id}/tracks/reorder", 
    PlaylistTrackRoutes.reorder_playlist_tracks_route(), 
    methods=["PUT"],
    summary="Reorder tracks in a playlist"
)

router.add_api_route(
    "/{playlist_id}/tracks/search", 
    PlaylistTrackRoutes.search_tracks_in_playlist_route(), 
    methods=["GET"],
    summary="Search tracks within a specific playlist"
)
