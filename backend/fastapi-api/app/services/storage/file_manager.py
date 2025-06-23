import uuid
import logging
import re
from pathlib import Path
from typing import Dict, Any, Optional
import aiofiles
from fastapi import UploadFile, HTTPException

logger = logging.getLogger(__name__)

class FileManager:
    """Handles file operations (save, delete, validation)"""
    
    ALLOWED_AUDIO_TYPES = [
        "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
        "audio/flac", "audio/x-flac", "audio/ogg", "audio/aac", 
        "audio/mp4", "audio/x-m4a", "application/ogg"
    ]
    
    ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.ogg', '.aac', '.m4a']
    
    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.audio_path = base_path / "audio"
        self.cover_path = base_path / "cover"
    
    def validate_audio_file(self, file: UploadFile) -> None:
        """Validate audio file type and extension"""
        file_ext = Path(file.filename).suffix.lower()
        
        if (file.content_type not in self.ALLOWED_AUDIO_TYPES and 
            file_ext not in self.ALLOWED_AUDIO_EXTENSIONS):
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported audio file. MIME: {file.content_type}, Extension: {file_ext}"
            )
    
    def validate_image_file(self, file: UploadFile) -> None:
        """Validate image file type"""
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Unsupported image type")
    
    def _generate_filename(self, original_filename: str, user_id: str) -> str:
        """Generate unique filename"""
        file_extension = Path(original_filename).suffix
        unique_id = str(uuid.uuid4())
        return f"{user_id}_{unique_id}{file_extension}"
    
    async def save_audio_file(self, file: UploadFile, user_id: str) -> Dict[str, Any]:
        """Save audio file to storage"""
        filename = self._generate_filename(file.filename, user_id)
        file_path = self.audio_path / filename
        
        content = await file.read()
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        logger.info(f"Saved audio file: {filename} ({len(content)} bytes)")
        
        return {
            "filename": filename,
            "original_filename": file.filename,
            "path": str(file_path),
            "size": len(content),
            "content_type": file.content_type
        }
    
    async def save_image_file(self, file: UploadFile, user_id: str) -> Dict[str, Any]:
        """Save image file to storage"""
        filename = self._generate_filename(file.filename, user_id)
        file_path = self.cover_path / filename
        
        content = await file.read()
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        logger.info(f"Saved image file: {filename} ({len(content)} bytes)")
        
        return {
            "filename": filename,
            "original_filename": file.filename,
            "path": str(file_path),
            "size": len(content),
            "content_type": file.content_type
        }
    
    def delete_file(self, filename: str, file_type: str = "audio", include_thumbnails: bool = True) -> bool:
        """Delete file and optionally related thumbnails"""
        try:
            file_path = self.audio_path / filename if file_type == "audio" else self.cover_path / filename
            
            deleted = False
            if file_path.exists():
                file_path.unlink()
                deleted = True
                logger.info(f"Deleted {file_type} file: {filename}")
            
            # Delete related covers and thumbnails for audio files
            if file_type == "audio" and include_thumbnails and deleted:
                self._delete_related_covers(filename)
            elif file_type == "cover" and include_thumbnails and deleted:
                self._delete_thumbnails_for_cover(filename)
            
            return deleted
            
        except Exception as e:
            logger.error(f"Error deleting {file_type} file {filename}: {str(e)}")
            return False
    
    def _delete_related_covers(self, audio_filename: str) -> None:
        """Delete covers and thumbnails related to an audio file"""
        base_name = Path(audio_filename).stem
        cover_pattern = f"{base_name}_cover.*"
        
        for cover_file in self.cover_path.glob(cover_pattern):
            try:
                cover_file.unlink()
                logger.info(f"Deleted related cover: {cover_file.name}")
                
                # Delete thumbnails
                self._delete_thumbnails_for_cover(cover_file.name)
                        
            except Exception as e:
                logger.error(f"Error deleting related cover {cover_file.name}: {str(e)}")
    
    def _delete_thumbnails_for_cover(self, cover_filename: str) -> None:
        """Delete thumbnails for a cover file"""
        for size in ['small', 'medium', 'large']:
            thumb_name = f"{Path(cover_filename).stem}_thumb_{size}.webp"
            thumb_path = self.cover_path / thumb_name
            if thumb_path.exists():
                try:
                    thumb_path.unlink()
                    logger.info(f"Deleted thumbnail: {thumb_name}")
                except Exception as e:
                    logger.error(f"Error deleting thumbnail {thumb_name}: {str(e)}")
    
    def get_file_path(self, filename: str, file_type: str = "audio") -> Optional[Path]:
        """Get file path if it exists"""
        file_path = self.audio_path / filename if file_type == "audio" else self.cover_path / filename
        return file_path if file_path.exists() else None
    
    def _sanitize_filename_part(self, text: str) -> str:
        """Sanitize a text string for use in filenames"""
        if not text:
            return ""
        
        # Remove/replace problematic characters
        sanitized = re.sub(r'[<>:"/\\|?*]', '_', str(text))
        sanitized = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', sanitized)  # Remove control characters
        sanitized = sanitized.strip('. ')  # Remove leading/trailing dots and spaces
        
        # Limit length
        return sanitized[:100] if len(sanitized) > 100 else sanitized
    
    def generate_download_filename(self, original_filename: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """Generate a formatted filename for download based on metadata"""
        if not metadata:
            return original_filename

        file_extension = Path(original_filename).suffix
        
        artist = metadata.get('artist', '').strip()
        title = metadata.get('title', '').strip()
        album = metadata.get('album', '').strip()
        
        artist = self._sanitize_filename_part(artist)
        title = self._sanitize_filename_part(title)
        album = self._sanitize_filename_part(album)
        
        # Build filename based on available metadata
        filename_parts = []
        
        if artist and title and album:
            # Full format: Artist - Title - Album.ext
            filename_parts = [artist, title, album]
        elif artist and title:
            # Partial format: Artist - Title.ext
            filename_parts = [artist, title]
        elif title:
            # Title only: Title.ext
            filename_parts = [title]
        elif artist:
            # Artist only: Artist.ext
            filename_parts = [artist]
        
        if filename_parts:
            # Join with " - " separator
            formatted_name = " - ".join(filename_parts)
            # Ensure total length doesn't exceed filesystem limits
            max_name_length = 250 - len(file_extension)
            if len(formatted_name) > max_name_length:
                formatted_name = formatted_name[:max_name_length].rstrip(' -')
            
            return f"{formatted_name}{file_extension}"
        else:
            # Fallback to original filename if no usable metadata
            return original_filename
