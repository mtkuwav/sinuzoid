# Legacy import for backward compatibility
# The playlist routes have been refactored into multiple specialized route classes
# located in the playlists/ directory for better maintainability

from app.routes.playlists.playlist_routes import router

# Re-export for backward compatibility
__all__ = ["router"]