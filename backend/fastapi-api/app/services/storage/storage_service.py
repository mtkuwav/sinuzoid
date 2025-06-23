import os
import logging
from pathlib import Path
from fastapi import UploadFile, HTTPException
from typing import Optional, Dict, Any

from .file_manager import FileManager
from .cover_processor import CoverProcessor
from .metadata_extractor import MetadataExtractor

logger = logging.getLogger(__name__)

class StorageService:
    """Main storage service that orchestrates file operations"""
    
    # Legacy constant for backward compatibility
    THUMBNAIL_SIZES = {
        'small': (150, 150),
        'medium': (300, 300),
        'large': (600, 600)
    }
    
    def __init__(self):
        self.base_path = Path(os.getenv("STORAGE_PATH", "/storage"))
        self.audio_path = self.base_path / "audio"
        self.cover_path = self.base_path / "cover"
        
        # Initialize specialized services
        self.file_manager = FileManager(self.base_path)
        self.cover_processor = CoverProcessor(self.cover_path)
        self.metadata_extractor = MetadataExtractor()
        
        # Ensure directories exist
        self.audio_path.mkdir(parents=True, exist_ok=True)
        self.cover_path.mkdir(parents=True, exist_ok=True)
    
    async def save_audio_file(self, file: UploadFile, user_id: str) -> Dict[str, Any]:
        """Save audio file with metadata and cover extraction"""
        try:
            # Validate file type
            self.file_manager.validate_audio_file(file)
            
            # Save audio file
            file_info = await self.file_manager.save_audio_file(file, user_id)
            
            # Extract and process cover
            cover_info = await self.cover_processor.extract_and_process_cover(
                file_info['path'], file_info['filename'], user_id
            )
            
            # Extract metadata
            metadata = self.metadata_extractor.extract_audio_metadata(Path(file_info['path']))
            
            return {
                **file_info,
                "embedded_cover": cover_info,
                "metadata": metadata
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error saving audio file {file.filename} for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error saving audio file: {str(e)}")
    
    async def save_cover_file(self, file: UploadFile, user_id: str) -> Dict[str, Any]:
        """Save cover file with thumbnail generation"""
        try:
            return await self.cover_processor.save_cover_file(file, user_id, self.file_manager)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error saving cover file {file.filename} for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error saving cover file: {str(e)}")
    
    def delete_file(self, filename: str, file_type: str = "audio", include_thumbnails: bool = True) -> bool:
        """Delete file and related assets"""
        return self.file_manager.delete_file(filename, file_type, include_thumbnails)
    
    def get_file_path(self, filename: str, file_type: str = "audio") -> Optional[Path]:
        """Get file path if exists"""
        return self.file_manager.get_file_path(filename, file_type)
    
    def get_thumbnail_path(self, base_filename: str, size: str = "medium") -> Optional[Path]:
        """Get thumbnail path if exists"""
        return self.cover_processor.get_thumbnail_path(base_filename, size)
    
    def get_all_thumbnails(self, base_filename: str) -> Dict[str, Any]:
        """Get all available thumbnails for a base filename"""
        return self.cover_processor.get_all_thumbnails(base_filename)
    
    # Legacy methods for backward compatibility
    def _extract_audio_metadata(self, file_path: Path) -> Dict[str, Any]:
        """Legacy method for backward compatibility"""
        return self.metadata_extractor.extract_audio_metadata(file_path)
    
    def _extract_embedded_cover(self, audio_file_path: Path) -> Optional[bytes]:
        """Legacy method for backward compatibility"""
        return self.cover_processor.extract_embedded_cover(audio_file_path)
    
    def _generate_filename(self, original_filename: str, user_id: str) -> str:
        """Legacy method for backward compatibility"""
        return self.file_manager._generate_filename(original_filename, user_id)
    
    def _generate_thumbnail_filename(self, base_filename: str, size: str) -> str:
        """Legacy method for backward compatibility"""
        return self.cover_processor.thumbnail_generator._generate_thumbnail_filename(base_filename, size)
    
    def _create_thumbnail(self, image_content: bytes, size, quality: int = 85) -> bytes:
        """Legacy method for backward compatibility"""
        return self.cover_processor.thumbnail_generator._create_thumbnail(image_content, size, quality)
