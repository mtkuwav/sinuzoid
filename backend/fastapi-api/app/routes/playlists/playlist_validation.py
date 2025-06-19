from fastapi import HTTPException
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class PlaylistValidation:
    """Utilities for playlist validation and error handling"""
    
    @staticmethod
    def validate_uuid(uuid_str: str, entity_name: str = "ID") -> UUID:
        """Validate and convert string to UUID, raise HTTPException if invalid"""
        try:
            return UUID(uuid_str)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid {entity_name} format")
    
    @staticmethod
    def validate_playlist_id(playlist_id: str) -> UUID:
        """Validate playlist ID format"""
        return PlaylistValidation.validate_uuid(playlist_id, "playlist ID")
    
    @staticmethod
    def validate_track_id(track_id: str) -> UUID:
        """Validate track ID format"""
        return PlaylistValidation.validate_uuid(track_id, "track ID")
    
    @staticmethod
    def validate_track_orders(track_orders: list) -> list:
        """Validate and convert track order data"""
        try:
            validated_orders = []
            for track_order in track_orders:
                if not isinstance(track_order, dict):
                    raise ValueError("Track order must be a dictionary")
                
                if "track_id" not in track_order or "position" not in track_order:
                    raise ValueError("Track order must contain 'track_id' and 'position'")
                
                validated_order = track_order.copy()
                validated_order["track_id"] = UUID(track_order["track_id"])
                
                if not isinstance(track_order["position"], int) or track_order["position"] < 0:
                    raise ValueError("Position must be a non-negative integer")
                
                validated_orders.append(validated_order)
            
            return validated_orders
            
        except (ValueError, TypeError) as e:
            raise HTTPException(status_code=400, detail=f"Invalid track order format: {str(e)}")
    
    @staticmethod
    def handle_playlist_not_found(playlist_id: str):
        """Raise standardized playlist not found error"""
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    @staticmethod
    def handle_operation_failed(operation: str, detail: str = None):
        """Raise standardized operation failed error"""
        message = f"Failed to {operation}"
        if detail:
            message += f": {detail}"
        raise HTTPException(status_code=400, detail=message)
    
    @staticmethod
    def log_and_raise_error(error: Exception, operation: str, context: str = ""):
        """Log error and raise appropriate HTTPException"""
        error_msg = f"Error {operation}"
        if context:
            error_msg += f" {context}"
        error_msg += f": {str(error)}"
        
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=f"Error {operation}")
    
    @staticmethod
    def validate_search_params(query: str = None, limit: int = 50, offset: int = 0):
        """Validate search parameters"""
        if query is not None and len(query.strip()) == 0:
            raise HTTPException(status_code=400, detail="Search query cannot be empty")
        
        if limit < 1 or limit > 100:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
        
        if offset < 0:
            raise HTTPException(status_code=400, detail="Offset must be non-negative")
        
        return query, limit, offset
