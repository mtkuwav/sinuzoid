# Legacy import for backward compatibility
# The statistics routes have been refactored into multiple specialized route classes
# located in the statistics/ directory for better maintainability

from app.routes.statistics.statistics_routes import router

# Re-export for backward compatibility
__all__ = ["router"]
