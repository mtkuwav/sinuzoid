import logging
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import aiofiles
from PIL import Image
import io

logger = logging.getLogger(__name__)

class ThumbnailGenerator:
    """Handles thumbnail generation for images"""
    
    THUMBNAIL_SIZES = {
        'small': (150, 150),
        'medium': (300, 300),
        'large': (600, 600)
    }
    
    def _generate_thumbnail_filename(self, base_filename: str, size: str) -> str:
        """Generate thumbnail filename from base filename"""
        name_without_ext = Path(base_filename).stem
        return f"{name_without_ext}_thumb_{size}.webp"
    
    def _create_thumbnail(self, image_content: bytes, size: Tuple[int, int], quality: int = 85) -> bytes:
        """Create a thumbnail from image content"""
        try:
            with Image.open(io.BytesIO(image_content)) as img:
                # Handle transparency and color modes
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Create thumbnail with proper sizing
                img.thumbnail(size, Image.Resampling.LANCZOS)
                
                if img.size != size:
                    background = Image.new('RGB', size, (255, 255, 255))
                    offset = ((size[0] - img.size[0]) // 2, (size[1] - img.size[1]) // 2)
                    background.paste(img, offset)
                    img = background
                
                # Save as WebP
                output = io.BytesIO()
                img.save(output, format='WEBP', quality=quality, optimize=True)
                return output.getvalue()
                
        except Exception as e:
            logger.error(f"Error creating thumbnail {size}: {str(e)}")
            raise
    
    async def generate_all_thumbnails(self, image_content: bytes, base_filename: str, output_path: Path) -> Dict[str, Any]:
        """Generate all thumbnail sizes for an image"""
        thumbnails = {}
        
        for size_name, dimensions in self.THUMBNAIL_SIZES.items():
            try:
                thumbnail_content = self._create_thumbnail(image_content, dimensions)
                thumbnail_filename = self._generate_thumbnail_filename(base_filename, size_name)
                thumbnail_path = output_path / thumbnail_filename
                
                async with aiofiles.open(thumbnail_path, 'wb') as f:
                    await f.write(thumbnail_content)
                
                thumbnails[size_name] = {
                    "filename": thumbnail_filename,
                    "path": str(thumbnail_path),
                    "size": len(thumbnail_content),
                    "dimensions": dimensions
                }
                
                logger.debug(f"Generated {size_name} thumbnail: {thumbnail_filename}")
                
            except Exception as e:
                logger.warning(f"Failed to generate {size_name} thumbnail for {base_filename}: {str(e)}")
                continue
        
        return thumbnails
    
    def get_thumbnail_path(self, base_filename: str, size: str, cover_path: Path) -> Optional[Path]:
        """Get thumbnail path if it exists"""
        if size not in self.THUMBNAIL_SIZES:
            return None
            
        thumbnail_filename = self._generate_thumbnail_filename(base_filename, size)
        thumbnail_path = cover_path / thumbnail_filename
        
        return thumbnail_path if thumbnail_path.exists() else None
    
    def get_all_thumbnails(self, base_filename: str, cover_path: Path) -> Dict[str, Any]:
        """Get all available thumbnails for a base filename"""
        thumbnails = {}
        for size_name in self.THUMBNAIL_SIZES.keys():
            thumbnail_path = self.get_thumbnail_path(base_filename, size_name, cover_path)
            if thumbnail_path:
                thumbnails[size_name] = {
                    "filename": thumbnail_path.name,
                    "path": str(thumbnail_path),
                    "dimensions": self.THUMBNAIL_SIZES[size_name]
                }
        return thumbnails
