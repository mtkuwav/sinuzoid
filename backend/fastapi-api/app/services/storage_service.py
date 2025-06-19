import os
import uuid
import logging
from pathlib import Path
from typing import Optional, Tuple
import aiofiles
from fastapi import UploadFile, HTTPException
from PIL import Image
import io
from mutagen import File as MutagenFile
from mutagen.flac import Picture
import base64

# Configure logger
logger = logging.getLogger(__name__)

class StorageService:

    THUMBNAIL_SIZES = {
        'small': (150, 150),
        'medium': (300, 300),
        'large': (600, 600)
    }
    
    def __init__(self):
        self.base_path = Path(os.getenv("STORAGE_PATH", "/storage"))
        self.audio_path = self.base_path / "audio"
        self.cover_path = self.base_path / "cover"

        self.audio_path.mkdir(parents=True, exist_ok=True)
        self.cover_path.mkdir(parents=True, exist_ok=True)
    
    def _generate_filename(self, original_filename: str, user_id: str) -> str:
        """Generates an unique filename"""
        file_extension = Path(original_filename).suffix
        unique_id = str(uuid.uuid4())
        return f"{user_id}_{unique_id}{file_extension}"
    
    def _generate_thumbnail_filename(self, base_filename: str, size: str) -> str:
        """Generates thumbnail filename from base filename"""
        name_without_ext = Path(base_filename).stem
        return f"{name_without_ext}_thumb_{size}.webp"
    
    def _create_thumbnail(self, image_content: bytes, size: Tuple[int, int], quality: int = 85) -> bytes:
        """Creates a thumbnail from image content"""
        try:
            with Image.open(io.BytesIO(image_content)) as img:
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                img.thumbnail(size, Image.Resampling.LANCZOS)
                
                if img.size != size:
                    background = Image.new('RGB', size, (255, 255, 255))
                    offset = ((size[0] - img.size[0]) // 2, (size[1] - img.size[1]) // 2)
                    background.paste(img, offset)
                    img = background
                
                output = io.BytesIO()
                img.save(output, format='WEBP', quality=quality, optimize=True)
                return output.getvalue()
                
        except Exception as e:
            logger.error(f"Error creating thumbnail {size}: {str(e)}")
            raise

    def _extract_embedded_cover(self, audio_file_path: Path) -> Optional[bytes]:
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
    
    async def save_audio_file(self, file: UploadFile, user_id: str) -> dict:
        """Saves an audio file and extracts embedded cover art"""
        try:
            allowed_types = [
                "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
                "audio/flac", "audio/x-flac", "audio/ogg", "audio/aac", 
                "audio/mp4", "audio/x-m4a", "application/ogg"
            ]
            
            # Alternative validation based on file extension if MIME type fails
            allowed_extensions = ['.mp3', '.wav', '.flac', '.ogg', '.aac', '.m4a']
            file_ext = Path(file.filename).suffix.lower()
            
            if file.content_type not in allowed_types and file_ext not in allowed_extensions:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unsupported audio file. Detected MIME: {file.content_type}, Extension: {file_ext}"
                )

            filename = self._generate_filename(file.filename, user_id)
            file_path = self.audio_path / filename

            content = await file.read()
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(content)

            cover_info = None
            embedded_cover = self._extract_embedded_cover(file_path)
            
            if embedded_cover:
                audio_base_name = Path(filename).stem
                cover_filename = f"{audio_base_name}_cover.jpg"
                cover_path = self.cover_path / cover_filename
                
                async with aiofiles.open(cover_path, 'wb') as f:
                    await f.write(embedded_cover)
                
                # Thumbnail generation
                thumbnails = {}
                for size_name, dimensions in self.THUMBNAIL_SIZES.items():
                    try:
                        thumbnail_content = self._create_thumbnail(embedded_cover, dimensions)
                        thumbnail_filename = self._generate_thumbnail_filename(cover_filename, size_name)
                        thumbnail_path = self.cover_path / thumbnail_filename
                        
                        async with aiofiles.open(thumbnail_path, 'wb') as f:
                            await f.write(thumbnail_content)
                        
                        thumbnails[size_name] = {
                            "filename": thumbnail_filename,
                            "path": str(thumbnail_path),
                            "size": len(thumbnail_content),
                            "dimensions": dimensions
                        }
                    except Exception as e:
                        logger.warning(f"Failed to generate {size_name} thumbnail for {cover_filename}: {str(e)}")
                        continue
                
                cover_info = {
                    "filename": cover_filename,
                    "path": str(cover_path),
                    "size": len(embedded_cover),
                    "content_type": "image/jpeg",
                    "thumbnails": thumbnails
                }

            # Extract audio metadata
            metadata = self._extract_audio_metadata(file_path)

            return {
                "filename": filename,
                "original_filename": file.filename,
                "path": str(file_path),
                "size": len(content),
                "content_type": file.content_type,
                "embedded_cover": cover_info,
                "metadata": metadata
            }
        
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error saving audio file {file.filename} for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error saving audio file: {str(e)}")

    async def save_cover_file(self, file: UploadFile, user_id: str) -> dict:
        """Saves covers and generates thumbnails"""
        try:
            allowed_types = ["image/jpeg", "image/png", "image/webp"]
            if file.content_type not in allowed_types:
                raise HTTPException(
                    status_code=400, 
                    detail="Unsupported image type"
                )
            
            filename = self._generate_filename(file.filename, user_id)
            file_path = self.cover_path / filename
            
            content = await file.read()
            
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(content)
            
            thumbnails = {}
            for size_name, dimensions in self.THUMBNAIL_SIZES.items():
                try:
                    thumbnail_content = self._create_thumbnail(content, dimensions)
                    thumbnail_filename = self._generate_thumbnail_filename(filename, size_name)
                    thumbnail_path = self.cover_path / thumbnail_filename
                    
                    async with aiofiles.open(thumbnail_path, 'wb') as f:
                        await f.write(thumbnail_content)
                    
                    thumbnails[size_name] = {
                        "filename": thumbnail_filename,
                        "path": str(thumbnail_path),
                        "size": len(thumbnail_content),
                        "dimensions": dimensions
                    }
                    
                except Exception as e:
                    logger.warning(f"Failed to generate {size_name} thumbnail for {filename}: {str(e)}")
                    continue
            
            return {
                "filename": filename,
                "original_filename": file.filename,
                "path": str(file_path),
                "size": len(content),
                "content_type": file.content_type,
                "thumbnails": thumbnails
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error saving cover file {file.filename} for user {user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error saving cover file: {str(e)}")
    
    def delete_file(self, filename: str, file_type: str = "audio", include_thumbnails: bool = True) -> bool:
        """Deletes a file and optionally its thumbnails"""
        try:
            if file_type == "audio":
                file_path = self.audio_path / filename
            else:
                file_path = self.cover_path / filename
        
            deleted = False

            if file_path.exists():
                file_path.unlink()
                deleted = True
            
            if file_type == "audio" and include_thumbnails and deleted:
                base_name = Path(filename).stem
                cover_pattern = f"{base_name}_cover.*"
                
                for cover_file in self.cover_path.glob(cover_pattern):
                    try:
                        cover_file.unlink()
                        logger.info(f"Deleted cover: {cover_file.name}")

                        for size_name in self.THUMBNAIL_SIZES.keys():
                            thumbnail_filename = self._generate_thumbnail_filename(cover_file.name, size_name)
                            thumbnail_path = self.cover_path / thumbnail_filename
                            if thumbnail_path.exists():
                                thumbnail_path.unlink()
                                logger.info(f"Deleted thumbnail: {thumbnail_path.name}")
                    
                    except Exception as e:
                        logger.error(f"Error deleting cover {cover_file.name}: {str(e)}")
            
            elif file_type == "cover" and include_thumbnails and deleted:
                # Thumbnail deletion for a cover manually added
                for size_name in self.THUMBNAIL_SIZES.keys():
                    thumbnail_filename = self._generate_thumbnail_filename(filename, size_name)
                    thumbnail_path = self.cover_path / thumbnail_filename
                    if thumbnail_path.exists():
                        thumbnail_path.unlink()
        
            return deleted
        
        except Exception as e:
            logger.error(f"Error deleting {file_type} file {filename}: {str(e)}")
            return False
    
    def get_file_path(self, filename: str, file_type: str = "audio") -> Optional[Path]:
        """Returns a file path if it exists"""
        if file_type == "audio":
            file_path = self.audio_path / filename
        else:
            file_path = self.cover_path / filename
        
        return file_path if file_path.exists() else None
    
    def get_thumbnail_path(self, base_filename: str, size: str = "medium") -> Optional[Path]:
        """Returns a thumbnail path if it exists"""
        if size not in self.THUMBNAIL_SIZES:
            return None
            
        thumbnail_filename = self._generate_thumbnail_filename(base_filename, size)
        thumbnail_path = self.cover_path / thumbnail_filename
        
        return thumbnail_path if thumbnail_path.exists() else None
    
    def get_all_thumbnails(self, base_filename: str) -> dict:
        """Returns all available thumbnails for a base filename"""
        thumbnails = {}
        for size_name in self.THUMBNAIL_SIZES.keys():
            thumbnail_path = self.get_thumbnail_path(base_filename, size_name)
            if thumbnail_path:
                thumbnails[size_name] = {
                    "filename": thumbnail_path.name,
                    "path": str(thumbnail_path),
                    "dimensions": self.THUMBNAIL_SIZES[size_name]
                }
        return thumbnails

#   TODO : custom metadata fields
    def _extract_audio_metadata(self, file_path: Path) -> dict:
        """Extract audio metadata from file"""
        try:
            audio_file = MutagenFile(file_path)
            if not audio_file:
                return {}
            
            metadata = {}
            
            duration = None
            if hasattr(audio_file, 'info'):
                info = audio_file.info
                if hasattr(info, 'length') and info.length:
                    duration = info.length
                elif hasattr(info, 'duration') and info.duration:
                    duration = info.duration
                elif hasattr(info, 'total_samples') and hasattr(info, 'sample_rate'):
                    if info.total_samples and info.sample_rate:
                        duration = float(info.total_samples) / float(info.sample_rate)
            
            if duration:
                metadata['duration'] = duration
            else:
                logger.warning(f"Could not extract duration from {file_path}")
                metadata['duration'] = 0
            
            # Common tags with multiple possible names
            tag_mapping = {
                'title': ['TIT2', 'TITLE', '\xa9nam'],
                'artist': ['TPE1', 'ARTIST', '\xa9ART'],
                'album': ['TALB', 'ALBUM', '\xa9alb'],
                'date': ['TDRC', 'DATE', '\xa9day'],
                'genre': ['TCON', 'GENRE', '\xa9gen'],
                'albumartist': ['TPE2', 'ALBUMARTIST', 'aART'],
                'track': ['TRCK', 'TRACKNUMBER', 'trkn'],
                'disc': ['TPOS', 'DISCNUMBER', 'disk']
            }
            
            if hasattr(audio_file, 'tags') and audio_file.tags:
                for key, possible_tags in tag_mapping.items():
                    for tag in possible_tags:
                        try:
                            if tag in audio_file.tags:
                                value = audio_file.tags[tag]
                                if isinstance(value, list) and len(value) > 0:
                                    metadata[key] = str(value[0])
                                elif value:
                                    metadata[key] = str(value)
                                break
                        except (ValueError, KeyError, TypeError):
                            # Some formats don't support certain tag names
                            continue
            
            # Audio format specific info
            if hasattr(audio_file, 'info'):
                info = audio_file.info
                if hasattr(info, 'bitrate'):
                    metadata['bitrate'] = info.bitrate
                if hasattr(info, 'sample_rate'):
                    metadata['sample_rate'] = info.sample_rate
                if hasattr(info, 'channels'):
                    metadata['channels'] = info.channels
                if hasattr(info, 'mode'):
                    metadata['mode'] = str(info.mode)
            
            # File format
            metadata['format'] = file_path.suffix.upper().lstrip('.')
            
            return metadata
            
        except Exception as e:
            logger.error(f"Failed to extract metadata from {file_path}: {str(e)}")
            logger.error(f"Exception type: {type(e).__name__}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {}