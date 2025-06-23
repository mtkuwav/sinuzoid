import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from mutagen import File as MutagenFile

logger = logging.getLogger(__name__)

class MetadataExtractor:
    """Specialized metadata extraction from audio files"""
    
    # Standard tags mapping
    STANDARD_TAGS = {
        'title': ['TIT2', 'TITLE', '\xa9nam'],
        'artist': ['TPE1', 'ARTIST', '\xa9ART'],
        'album': ['TALB', 'ALBUM', '\xa9alb'],
        'date': ['TDRC', 'DATE', '\xa9day'],
        'genre': ['TCON', 'GENRE', '\xa9gen'],
        'albumartist': ['TPE2', 'ALBUMARTIST', 'aART'],
        'track': ['TRCK', 'TRACKNUMBER', 'trkn'],
        'disc': ['TPOS', 'DISCNUMBER', 'disk']
    }
    
    # Extended metadata tags
    EXTENDED_TAGS = {
        'bpm': ['TBPM', 'BPM', 'tmpo'],
        'tempo': ['TEMPO', 'TBPM', 'BPM'],
        'key': ['TKEY', 'KEY', 'INITIALKEY', 'INITIAL_KEY'],
        'initial_key': ['TKEY', 'KEY', 'INITIALKEY', 'INITIAL_KEY'],
        'energy': ['ENERGY', 'ENERGYLEVEL'],
        'mood': ['MOOD', 'TMOO'],
        'rating': ['RATING', 'POPM'],
        'cue_points': ['CUEPOINTS', 'CUE'],
        'intro_start': ['INTRO_START', 'INTROSTART'],
        'intro_end': ['INTRO_END', 'INTROEND'],
        'outro_start': ['OUTRO_START', 'OUTROSTART'],
        'outro_end': ['OUTRO_END', 'OUTROEND'],
        'loop_start': ['LOOP_START', 'LOOPSTART'],
        'loop_end': ['LOOP_END', 'LOOPEND'],
        'beatgrid': ['BEATGRID', 'BEAT_GRID'],
        'lyrics': ['USLT', 'LYRICS', '\xa9lyr'],
        'comment': ['COMM', 'COMMENT', '\xa9cmt'],
        'description': ['TIT3', 'DESCRIPTION'],
        'remixer': ['TPE4', 'REMIXER', 'MIXARTIST'],
        'producer': ['PRODUCER', 'TPRO'],
        'label': ['TPUB', 'LABEL', 'PUBLISHER'],
        'catalog_number': ['CATALOGNUMBER', 'CATALOG', 'CATALOGNUM'],
        'isrc': ['TSRC', 'ISRC'],
        'barcode': ['BARCODE', 'UPC'],
        'replay_gain_track': ['REPLAYGAIN_TRACK_GAIN', 'TXXX:REPLAYGAIN_TRACK_GAIN'],
        'replay_gain_album': ['REPLAYGAIN_ALBUM_GAIN', 'TXXX:REPLAYGAIN_ALBUM_GAIN'],
        'loudness_lufs': ['LOUDNESS', 'LUFS'],
        'dynamic_range': ['DYNAMIC_RANGE', 'DR']
    }
    
    # Discogs specific tags
    DISCOGS_TAGS = {
        'release_id': ['DISCOGS_RELEASE_ID', 'TXXX:DISCOGS_RELEASE_ID'],
        'master_id': ['DISCOGS_MASTER_ID', 'TXXX:DISCOGS_MASTER_ID'],
        'artist_id': ['DISCOGS_ARTIST_ID', 'TXXX:DISCOGS_ARTIST_ID'],
        'label_id': ['DISCOGS_LABEL_ID', 'TXXX:DISCOGS_LABEL_ID'],
        'artist_name': ['DISCOGS_ARTIST_NAME', 'TXXX:DISCOGS_ARTIST_NAME'],
        'title': ['DISCOGS_TITLE', 'TXXX:DISCOGS_TITLE'],
        'country': ['DISCOGS_COUNTRY', 'TXXX:DISCOGS_COUNTRY'],
        'year': ['DISCOGS_YEAR', 'TXXX:DISCOGS_YEAR'],
        'format': ['DISCOGS_FORMAT', 'TXXX:DISCOGS_FORMAT'],
        'genre': ['DISCOGS_GENRE', 'TXXX:DISCOGS_GENRE'],
        'style': ['DISCOGS_STYLE', 'TXXX:DISCOGS_STYLE'],
        'notes': ['DISCOGS_NOTES', 'TXXX:DISCOGS_NOTES'],
        'barcode': ['DISCOGS_BARCODE', 'TXXX:DISCOGS_BARCODE'],
        'rating': ['DISCOGS_RATING', 'TXXX:DISCOGS_RATING']
    }
    
    def extract_audio_metadata(self, file_path: Path) -> Dict[str, Any]:
        """Extract comprehensive metadata from audio file"""
        try:
            audio_file = MutagenFile(file_path)
            if not audio_file:
                return {}
            
            metadata = {}
            
            # Extract duration (robust method)
            metadata['duration'] = self._extract_duration(audio_file, file_path)
            
            # Extract standard tags
            metadata.update(self._extract_standard_tags(audio_file))
            
            # Extract extended metadata
            metadata.update(self._extract_extended_tags(audio_file))
            
            # Extract Discogs metadata
            discogs_data = self._extract_discogs_tags(audio_file)
            if discogs_data:
                metadata['discogs'] = discogs_data
            
            # Extract custom tags
            custom_tags = self._extract_custom_tags(audio_file)
            if custom_tags:
                metadata['custom_tags'] = custom_tags
            
            # Extract technical info
            metadata.update(self._extract_technical_info(audio_file, file_path))
            
            logger.info(f"Extracted metadata for {file_path.name}: "
                       f"duration={metadata.get('duration', 'N/A')}s, "
                       f"bpm={metadata.get('bpm', 'N/A')}, "
                       f"key={metadata.get('key', 'N/A')}, "
                       f"discogs_tags={len(metadata.get('discogs', {}))}")
            
            return metadata
            
        except Exception as e:
            logger.error(f"Failed to extract metadata from {file_path}: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {}
    
    def _extract_duration(self, audio_file, file_path: Path) -> float:
        """Extract duration with robust fallback methods"""
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
            return duration
        else:
            logger.warning(f"Could not extract duration from {file_path}")
            return 0
    
    def _extract_tag_value(self, tags: Any, possible_tags: List[str]) -> Optional[str]:
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
    
    def _extract_standard_tags(self, audio_file) -> Dict[str, Any]:
        """Extract standard metadata tags"""
        metadata = {}
        
        if hasattr(audio_file, 'tags') and audio_file.tags:
            for key, possible_tags in self.STANDARD_TAGS.items():
                value = self._extract_tag_value(audio_file.tags, possible_tags)
                if value:
                    metadata[key] = value
        
        return metadata
    
    def _extract_extended_tags(self, audio_file) -> Dict[str, Any]:
        """Extract extended metadata tags"""
        metadata = {}
        
        if hasattr(audio_file, 'tags') and audio_file.tags:
            for key, possible_tags in self.EXTENDED_TAGS.items():
                value = self._extract_tag_value(audio_file.tags, possible_tags)
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
        
        return metadata
    
    def _extract_discogs_tags(self, audio_file) -> Dict[str, Any]:
        """Extract Discogs specific metadata"""
        discogs_data = {}
        
        if hasattr(audio_file, 'tags') and audio_file.tags:
            for key, possible_tags in self.DISCOGS_TAGS.items():
                value = self._extract_tag_value(audio_file.tags, possible_tags)
                if value:
                    discogs_data[key] = value
        
        return discogs_data
    
    def _extract_custom_tags(self, audio_file) -> Dict[str, Any]:
        """Extract custom TXXX and other user-defined tags"""
        custom_tags = {}
        
        if hasattr(audio_file, 'tags') and audio_file.tags:
            for tag_key in audio_file.tags.keys():
                if tag_key.startswith('TXXX:'):
                    try:
                        tag_name = tag_key[5:]  # Remove 'TXXX:' prefix
                        # Skip already processed tags
                        if any(tag_name.upper() in ['REPLAYGAIN', 'DISCOGS']):
                            continue
                            
                        value = audio_file.tags[tag_key]
                        if isinstance(value, list) and len(value) > 0:
                            custom_tags[tag_name.lower()] = str(value[0])
                        elif value:
                            custom_tags[tag_name.lower()] = str(value)
                    except Exception as e:
                        logger.debug(f"Error extracting custom tag {tag_key}: {str(e)}")
                        continue
        
        return custom_tags
    
    def _extract_technical_info(self, audio_file, file_path: Path) -> Dict[str, Any]:
        """Extract technical audio information"""
        metadata = {}
        
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
        
        # File format and size
        metadata['format'] = file_path.suffix.upper().lstrip('.')
        metadata['file_size'] = file_path.stat().st_size
        
        return metadata
