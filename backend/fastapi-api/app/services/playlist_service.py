# Legacy import for backward compatibility
# The PlaylistService has been refactored into multiple specialized services
# located in the playlist/ directory for better maintainability

from app.services.playlist.playlist_service import PlaylistService

# Re-export for backward compatibility
__all__ = ["PlaylistService"]