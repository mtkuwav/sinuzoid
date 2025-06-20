from .statistics_routes import router
from .statistics_play_event_routes import StatisticsPlayEventRoutes
from .statistics_rating_routes import StatisticsRatingRoutes
from .statistics_user_routes import StatisticsUserRoutes
from .statistics_track_routes import StatisticsTrackRoutes
from .statistics_search_routes import StatisticsSearchRoutes
from .statistics_analytics_routes import StatisticsAnalyticsRoutes

__all__ = [
    "router",
    "StatisticsPlayEventRoutes",
    "StatisticsRatingRoutes", 
    "StatisticsUserRoutes",
    "StatisticsTrackRoutes",
    "StatisticsSearchRoutes",
    "StatisticsAnalyticsRoutes"
]
