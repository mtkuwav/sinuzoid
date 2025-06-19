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

    def _extract_audio_metadata(self, file_path: Path) -> dict:
        """Extract comprehensive audio metadata from file including extended and Discogs tags"""
        try:
            audio_file = MutagenFile(file_path)
            if not audio_file:
                return {}
            
            metadata = {}
            
            # ===== DURATION EXTRACTION (robust analysis preserved) =====
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
            
            # ===== STANDARD TAGS =====
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
            
            # ===== EXTENDED METADATA TAGS =====
            extended_tag_mapping = {
                # BPM and tempo
                'bpm': ['TBPM', 'BPM', 'tmpo'],
                'tempo': ['TEMPO', 'TBPM', 'BPM'],
                
                # Musical key
                'key': ['TKEY', 'KEY', 'INITIALKEY', 'INITIAL_KEY'],
                'initial_key': ['TKEY', 'KEY', 'INITIALKEY', 'INITIAL_KEY'],
                
                # Energy and mood
                'energy': ['ENERGY', 'ENERGYLEVEL'],
                'mood': ['MOOD', 'TMOO'],
                'rating': ['RATING', 'POPM'],
                
                # DJ and mixing tags
                'cue_points': ['CUEPOINTS', 'CUE'],
                'intro_start': ['INTRO_START', 'INTROSTART'],
                'intro_end': ['INTRO_END', 'INTROEND'],
                'outro_start': ['OUTRO_START', 'OUTROSTART'],
                'outro_end': ['OUTRO_END', 'OUTROEND'],
                'loop_start': ['LOOP_START', 'LOOPSTART'],
                'loop_end': ['LOOP_END', 'LOOPEND'],
                'beatgrid': ['BEATGRID', 'BEAT_GRID'],
                
                # Lyrics and text
                'lyrics': ['USLT', 'LYRICS', '\xa9lyr'],
                'comment': ['COMM', 'COMMENT', '\xa9cmt'],
                'description': ['TIT3', 'DESCRIPTION'],
                
                # Music production
                'remixer': ['TPE4', 'REMIXER', 'MIXARTIST'],
                'producer': ['PRODUCER', 'TPRO'],
                'label': ['TPUB', 'LABEL', 'PUBLISHER'],
                'catalog_number': ['CATALOGNUMBER', 'CATALOG', 'CATALOGNUM'],
                'isrc': ['TSRC', 'ISRC'],
                'barcode': ['BARCODE', 'UPC'],
                
                # Audio analysis
                'replay_gain_track': ['REPLAYGAIN_TRACK_GAIN', 'TXXX:REPLAYGAIN_TRACK_GAIN'],
                'replay_gain_album': ['REPLAYGAIN_ALBUM_GAIN', 'TXXX:REPLAYGAIN_ALBUM_GAIN'],
                'loudness_lufs': ['LOUDNESS', 'LUFS'],
                'dynamic_range': ['DYNAMIC_RANGE', 'DR']
            }
            
            # ===== DISCOGS TAGS =====
            discogs_tag_mapping = {
                'discogs_release_id': ['DISCOGS_RELEASE_ID', 'TXXX:DISCOGS_RELEASE_ID'],
                'discogs_master_id': ['DISCOGS_MASTER_ID', 'TXXX:DISCOGS_MASTER_ID'],
                'discogs_artist_id': ['DISCOGS_ARTIST_ID', 'TXXX:DISCOGS_ARTIST_ID'],
                'discogs_label_id': ['DISCOGS_LABEL_ID', 'TXXX:DISCOGS_LABEL_ID'],
                'discogs_artist_name': ['DISCOGS_ARTIST_NAME', 'TXXX:DISCOGS_ARTIST_NAME'],
                'discogs_title': ['DISCOGS_TITLE', 'TXXX:DISCOGS_TITLE'],
                'discogs_country': ['DISCOGS_COUNTRY', 'TXXX:DISCOGS_COUNTRY'],
                'discogs_year': ['DISCOGS_YEAR', 'TXXX:DISCOGS_YEAR'],
                'discogs_format': ['DISCOGS_FORMAT', 'TXXX:DISCOGS_FORMAT'],
                'discogs_genre': ['DISCOGS_GENRE', 'TXXX:DISCOGS_GENRE'],
                'discogs_style': ['DISCOGS_STYLE', 'TXXX:DISCOGS_STYLE'],
                'discogs_notes': ['DISCOGS_NOTES', 'TXXX:DISCOGS_NOTES'],
                'discogs_barcode': ['DISCOGS_BARCODE', 'TXXX:DISCOGS_BARCODE'],
                'discogs_rating': ['DISCOGS_RATING', 'TXXX:DISCOGS_RATING']
            }
            
            def extract_tag_value(tags, possible_tags):
                """Safely extract tag value from possible tag names"""
                for tag in possible_tags:
                    try:
                        if tag in tags:
                            value = tags[tag]
                            if isinstance(value, list) and len(value) > 0:
                                return str(value[0])
                            elif value:
                                return str(value)
                    except (ValueError, KeyError, TypeError, UnicodeDecodeError) as e:
                        logger.debug(f"Error extracting tag {tag}: {str(e)}")
                        continue
                return None
            
            if hasattr(audio_file, 'tags') and audio_file.tags:
                # Extract standard tags
                for key, possible_tags in tag_mapping.items():
                    value = extract_tag_value(audio_file.tags, possible_tags)
                    if value:
                        metadata[key] = value
                
                # Extract extended metadata
                for key, possible_tags in extended_tag_mapping.items():
                    value = extract_tag_value(audio_file.tags, possible_tags)
                    if value:
                        # Special processing for numeric values
                        if key in ['bpm', 'tempo', 'energy', 'rating']:
                            try:
                                # Extract numeric value, handle formats like "128.00" or "128 BPM"
                                numeric_value = ''.join(c for c in value if c.isdigit() or c == '.')
                                if numeric_value:
                                    metadata[key] = float(numeric_value) if '.' in numeric_value else int(numeric_value)
                            except (ValueError, TypeError):
                                metadata[key] = value
                        else:
                            metadata[key] = value
                
                # Extract Discogs tags
                discogs_data = {}
                for key, possible_tags in discogs_tag_mapping.items():
                    value = extract_tag_value(audio_file.tags, possible_tags)
                    if value:
                        discogs_key = key.replace('discogs_', '')
                        discogs_data[discogs_key] = value
                
                if discogs_data:
                    metadata['discogs'] = discogs_data
                
                # Extract custom TXXX tags (for ID3v2)
                custom_tags = {}
                for tag_key in audio_file.tags.keys():
                    if tag_key.startswith('TXXX:'):
                        try:
                            tag_name = tag_key[5:]  # Remove 'TXXX:' prefix
                            value = audio_file.tags[tag_key]
                            if isinstance(value, list) and len(value) > 0:
                                custom_tags[tag_name.lower()] = str(value[0])
                            elif value:
                                custom_tags[tag_name.lower()] = str(value)
                        except Exception as e:
                            logger.debug(f"Error extracting custom tag {tag_key}: {str(e)}")
                            continue
                
                if custom_tags:
                    metadata['custom_tags'] = custom_tags
            
            # ===== AUDIO FORMAT SPECIFIC INFO =====
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
                if hasattr(info, 'bits_per_sample'):
                    metadata['bits_per_sample'] = info.bits_per_sample
                if hasattr(info, 'encoder_info'):
                    metadata['encoder'] = str(info.encoder_info)
            
            # File format
            metadata['format'] = file_path.suffix.upper().lstrip('.')
            
            # File size
            metadata['file_size'] = file_path.stat().st_size
            
            logger.info(f"Extracted metadata for {file_path.name}: "
                       f"duration={metadata.get('duration', 'N/A')}s, "
                       f"bpm={metadata.get('bpm', 'N/A')}, "
                       f"key={metadata.get('key', 'N/A')}, "
                       f"discogs_tags={len(metadata.get('discogs', {}))}")
            
            return metadata
            
        except Exception as e:
            logger.error(f"Failed to extract metadata from {file_path}: {str(e)}")
            logger.error(f"Exception type: {type(e).__name__}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {}