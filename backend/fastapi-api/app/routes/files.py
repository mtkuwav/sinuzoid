# Legacy import for backward compatibility
# The file routes have been refactored into multiple specialized handlers
# located in the files/ directory for better maintainability

from app.routes.files.file_routes import router

# Re-export for backward compatibility
__all__ = ["router"]
