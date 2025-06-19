import logging
from pathlib import Path
from typing import Optional, Dict, Any
import aiofiles
from fastapi import UploadFile, HTTPException
from mutagen import File as MutagenFile
from mutagen.flac import Picture
import base64

from .thumbnail_generator import ThumbnailGenerator

logger = logging.getLogger(__name__)

class CoverProcessor:
    """Handles cover art extraction, processing and thumbnail generation"""
    
    def __init__(self, cover_path: Path):
        self.cover_path = cover_path
        self.thumbnail_generator = ThumbnailGenerator()
    
    def extract_embedded_cover(self, audio_file_path: Path) -> Optional[bytes]:
        """Extract embedded cover art from audio file"""
        try:
            audio_file = MutagenFile(str(audio_file_path))
            if audio_file is None:
                return None
            
            # MP3 (ID3v2 tags)
            if hasattr(audio_file, 'tags') and audio_file.tags:
                for key in audio_file.tags.keys():
                    if key.startswith('APIC:'):
                        return audio_file.tags[key].data
                
                if 'APIC:' in audio_file.tags:
                    return audio_file.tags['APIC:'].data
            
            # FLAC
            if hasattr(audio_file, 'pictures') and audio_file.pictures:
                return audio_file.pictures[0].data
            
            # FLAC with metadata block picture
            if hasattr(audio_file, 'tags') and audio_file.tags and 'METADATA_BLOCK_PICTURE' in audio_file.tags:
                picture_data = base64.b64decode(audio_file.tags['METADATA_BLOCK_PICTURE'][0])
                picture = Picture(picture_data)
                return picture.data
            
            # MP4/M4A/AAC
            if hasattr(audio_file, 'tags') and audio_file.tags and 'covr' in audio_file.tags:
                return bytes(audio_file.tags['covr'][0])
            
            # OGG Vorbis
            if hasattr(audio_file, 'tags') and audio_file.tags:
                for tag_name in ['METADATA_BLOCK_PICTURE', 'COVERART', 'ARTWORK']:
                    if tag_name in audio_file.tags:
                        try:
                            if tag_name == 'METADATA_BLOCK_PICTURE':
                                picture_data = base64.b64decode(audio_file.tags[tag_name][0])
                                picture = Picture(picture_data)
                                return picture.data
                            else:
                                return base64.b64decode(audio_file.tags[tag_name][0])
                        except Exception:
                            continue
                            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting embedded cover from {audio_file_path}: {str(e)}")
            return None
    
    async def extract_and_process_cover(self, audio_file_path: str, audio_filename: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Extract cover from audio file and generate thumbnails"""
        embedded_cover = self.extract_embedded_cover(Path(audio_file_path))
        
        if not embedded_cover:
            return None
        
        try:
            audio_base_name = Path(audio_filename).stem
            cover_filename = f"{audio_base_name}_cover.jpg"
            cover_path = self.cover_path / cover_filename
            
            # Save original cover
            async with aiofiles.open(cover_path, 'wb') as f:
                await f.write(embedded_cover)
            
            # Generate thumbnails
            thumbnails = await self.thumbnail_generator.generate_all_thumbnails(
                embedded_cover, cover_filename, self.cover_path
            )
            
            logger.info(f"Processed cover for {audio_filename}: {len(thumbnails)} thumbnails generated")
            
            return {
                "filename": cover_filename,
                "path": str(cover_path),
                "size": len(embedded_cover),
                "content_type": "image/jpeg",
                "thumbnails": thumbnails
            }
            
        except Exception as e:
            logger.error(f"Error processing cover for {audio_filename}: {str(e)}")
            return None
    
    async def save_cover_file(self, file: UploadFile, user_id: str, file_manager) -> Dict[str, Any]:
        """Save uploaded cover file with thumbnail generation"""
        # Validate and save the image file
        file_manager.validate_image_file(file)
        
        # Read content for thumbnails before saving (as save_image_file will consume the file)
        content = await file.read()
        
        # Reset file pointer and save
        file.file.seek(0)
        file_info = await file_manager.save_image_file(file, user_id)
        
        # Generate thumbnails
        thumbnails = await self.thumbnail_generator.generate_all_thumbnails(
            content, file_info["filename"], self.cover_path
        )
        
        return {
            **file_info,
            "thumbnails": thumbnails
        }
    
    def get_thumbnail_path(self, base_filename: str, size: str = "medium") -> Optional[Path]:
        """Get thumbnail path if it exists"""
        return self.thumbnail_generator.get_thumbnail_path(base_filename, size, self.cover_path)
    
    def get_all_thumbnails(self, base_filename: str) -> Dict[str, Any]:
        """Get all available thumbnails for a base filename"""
        return self.thumbnail_generator.get_all_thumbnails(base_filename, self.cover_path)
