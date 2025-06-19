from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import User, Track
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class StorageQuotaService:
    """Service for managing user storage quotas and usage"""
    
    @staticmethod
    def get_user_storage_info(db: Session, user_id: int) -> Dict[str, int]:
        """Get complete storage information for a user"""
        try:
            # Get user with quota
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError(f"User {user_id} not found")
            
            # Calculate used storage - convert to int to avoid Decimal issues
            used_storage_raw = db.query(func.sum(Track.file_size)).filter(Track.user_id == user_id).scalar()
            used_storage = int(used_storage_raw) if used_storage_raw is not None else 0
            
            quota = int(user.storage_quota)
            available = quota - used_storage
            usage_percentage = round((used_storage / quota) * 100, 2) if quota > 0 else 0.0
            
            return {
                "quota": quota,
                "used": used_storage,
                "available": available,
                "usage_percentage": usage_percentage
            }
            
        except Exception as e:
            logger.error(f"Error getting storage info for user {user_id}: {str(e)}")
            raise

    @staticmethod
    def get_used_storage(db: Session, user_id: int) -> int:
        """Get the total storage used by a user in bytes"""
        try:
            used_storage_raw = db.query(func.sum(Track.file_size)).filter(Track.user_id == user_id).scalar()
            return int(used_storage_raw) if used_storage_raw is not None else 0
            
        except Exception as e:
            logger.error(f"Error calculating used storage for user {user_id}: {str(e)}")
            return 0

    @staticmethod
    def get_user_quota(db: Session, user_id: int) -> int:
        """Get the storage quota for a user in bytes"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            return int(user.storage_quota) if user else 0
            
        except Exception as e:
            logger.error(f"Error getting quota for user {user_id}: {str(e)}")
            return 0

    @staticmethod
    def check_upload_allowed(db: Session, user_id: int, file_size: int) -> Dict[str, any]:
        """Check if a user can upload a file of given size"""
        try:
            storage_info = StorageQuotaService.get_user_storage_info(db, user_id)
            
            quota = storage_info["quota"]
            used = storage_info["used"]
            available = storage_info["available"]
            
            if file_size > available:
                return {
                    "allowed": False,
                    "reason": "insufficient_space",
                    "message": f"File size ({file_size} bytes) exceeds available space ({available} bytes)",
                    "storage_info": storage_info,
                    "required_space": file_size
                }
            
            # Calculate what the usage would be after upload
            new_used = used + file_size
            new_usage_percentage = round((new_used / quota) * 100, 2) if quota > 0 else 0.0
            
            return {
                "allowed": True,
                "storage_info": storage_info,
                "after_upload": {
                    "used": new_used,
                    "available": available - file_size,
                    "usage_percentage": new_usage_percentage
                }
            }
            
        except Exception as e:
            logger.error(f"Error checking upload permission for user {user_id}: {str(e)}")
            return {
                "allowed": False,
                "reason": "error",
                "message": f"Error checking storage quota: {str(e)}"
            }

    @staticmethod
    def format_bytes(bytes_value: int) -> str:
        """Format bytes to human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_value < 1024.0:
                return f"{bytes_value:.1f} {unit}"
            bytes_value /= 1024.0
        return f"{bytes_value:.1f} PB"

    @staticmethod
    def update_user_quota(db: Session, user_id: int, new_quota: int) -> bool:
        """Update a user's storage quota (admin function)"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return False
            
            user.storage_quota = new_quota
            db.commit()
            
            logger.info(f"Updated storage quota for user {user_id} to {new_quota} bytes")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating quota for user {user_id}: {str(e)}")
            raise
