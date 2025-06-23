# Legacy import for backward compatibility
# The StatisticsService has been refactored into multiple specialized services
# located in the statistics/ directory for better maintainability

from app.services.statistics.statistics_service import StatisticsService

# Re-export for backward compatibility
__all__ = ["StatisticsService"]
