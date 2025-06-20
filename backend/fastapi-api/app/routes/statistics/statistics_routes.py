from fastapi import APIRouter

from .statistics_play_event_routes import StatisticsPlayEventRoutes
from .statistics_rating_routes import StatisticsRatingRoutes
from .statistics_user_routes import StatisticsUserRoutes
from .statistics_track_routes import StatisticsTrackRoutes
from .statistics_search_routes import StatisticsSearchRoutes
from .statistics_analytics_routes import StatisticsAnalyticsRoutes

# Create main statistics router
router = APIRouter(prefix="/statistics", tags=["statistics"])

# Include all specialized routers
router.include_router(StatisticsPlayEventRoutes.get_router())
router.include_router(StatisticsRatingRoutes.get_router())
router.include_router(StatisticsUserRoutes.get_router())
router.include_router(StatisticsTrackRoutes.get_router())
router.include_router(StatisticsSearchRoutes.get_router())
router.include_router(StatisticsAnalyticsRoutes.get_router())
