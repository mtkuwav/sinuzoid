from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from app.services.storage_service import StorageService
import logging
import mimetypes
from pathlib import Path


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/files", tags=["files"])

# TESTING ONLY, STATIC USER ID
TEST_USER_ID = "test_user_123"

@router.post("/upload/audio")
async def upload_audio(file: UploadFile = File(...)):
    """Audio file upload"""
    try:
        logger.info(f"Audio upload started: {file.filename}, size: {file.size}, type: {file.content_type}")
        
        storage = StorageService()
        result = await storage.save_audio_file(file, TEST_USER_ID)
        
        logger.info(f"Audio upload successful: {result['filename']}")
        return {
            "message": "Audio file successfully uploaded",
            "data": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during audio upload {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during audio upload")

@router.post("/upload/cover")
async def upload_cover(file: UploadFile = File(...)):
    """Cover picture upload with automatic thumbnails generation"""
    try:
        logger.info(f"Cover upload started: {file.filename}, size: {file.size}, type: {file.content_type}")
        
        storage = StorageService()
        result = await storage.save_cover_file(file, TEST_USER_ID)
        
        logger.info(f"Cover upload successful: {result['filename']}")
        return {
            "message": "Cover picture successfully uploaded",
            "data": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during cover upload {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during cover upload")

@router.get("/audio/{filename}")
async def get_audio_file(filename: str, request: Request):
    """Downloads or streams an audio file with range support"""
    try:
        storage = StorageService()
        file_path = storage.get_file_path(filename, "audio")
        
        if not file_path:
            logger.warning(f"Audio file not found: {filename}")
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        # Detect proper MIME type
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if not mime_type or not mime_type.startswith('audio'):
            mime_type = 'audio/mpeg'  # Default fallback
        
        # Check for Range header (streaming support)
        range_header = request.headers.get('range')
        
        if range_header:
            # Range request for streaming
            return await _serve_audio_range(file_path, range_header, mime_type)
        else:
            # Full file download
            logger.info(f"Audio file served (full): {filename}")
            return FileResponse(
                path=file_path,
                media_type=mime_type,
                filename=filename,
                headers={
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(file_path.stat().st_size)
                }
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving audio file {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error serving audio file")

async def _serve_audio_range(file_path: Path, range_header: str, mime_type: str):
    """Serves audio file with range support for streaming"""
    try:
        file_size = file_path.stat().st_size
        
        # Parse range header (e.g., "bytes=0-1023")
        range_match = range_header.replace('bytes=', '').split('-')
        start = int(range_match[0]) if range_match[0] else 0
        end = int(range_match[1]) if range_match[1] else file_size - 1
        
        # Ensure valid range
        start = max(0, start)
        end = min(file_size - 1, end)
        content_length = end - start + 1
        
        def file_generator():
            with open(file_path, 'rb') as f:
                f.seek(start)
                remaining = content_length
                while remaining > 0:
                    chunk_size = min(8192, remaining)  # 8KB chunks
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk
        
        logger.info(f"Audio file streamed: {file_path.name} (range: {start}-{end})")
        
        return StreamingResponse(
            file_generator(),
            status_code=206,  # Partial Content
            media_type=mime_type,
            headers={
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(content_length)
            }
        )
        
    except Exception as e:
        logger.error(f"Error streaming audio file {file_path}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error streaming audio file")

@router.get("/cover/{filename}")
async def get_cover_file(filename: str):
    """Downloads a cover picture with proper MIME type detection"""
    try:
        storage = StorageService()
        file_path = storage.get_file_path(filename, "cover")
        
        if not file_path:
            logger.warning(f"Cover file not found: {filename}")
            raise HTTPException(status_code=404, detail="Cover picture not found")
        
        # Detect proper MIME type
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if not mime_type or not mime_type.startswith('image'):
            mime_type = 'image/jpeg'  # Default fallback
        
        logger.info(f"Cover file served: {filename}")
        return FileResponse(
            path=file_path,
            media_type=mime_type,
            filename=filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving cover file {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error serving cover file")

@router.get("/cover/{filename}/thumbnail/{size}")
async def get_thumbnail(filename: str, size: str):
    """Downloads a thumbnail picture"""
    storage = StorageService()
    
    if size not in storage.THUMBNAIL_SIZES:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid size. Available sizes: {list(storage.THUMBNAIL_SIZES.keys())}"
        )
    
    thumbnail_path = storage.get_thumbnail_path(filename, size)
    
    if not thumbnail_path:
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    
    return FileResponse(
        path=thumbnail_path,
        media_type='image/webp',
        filename=thumbnail_path.name
    )

@router.get("/cover/{filename}/thumbnails")
async def get_available_thumbnails(filename: str):
    """Lists all availible thumbnails for a cover"""
    storage = StorageService()
    thumbnails = storage.get_all_thumbnails(filename)
    
    if not thumbnails:
        raise HTTPException(status_code=404, detail="No thumbnail found")
    
    return {
        "base_filename": filename,
        "thumbnails": thumbnails
    }

@router.delete("/audio/{filename}")
async def delete_audio_file(filename: str):
    """Deletes an audio file"""
    try:
        logger.info(f"Audio deletion started: {filename}")
        
        storage = StorageService()
        deleted = storage.delete_file(filename, "audio")
        
        if not deleted:
            logger.warning(f"Audio file not found for deletion: {filename}")
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        logger.info(f"Audio file deleted successfully: {filename}")
        return {"message": "Audio file successfully deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting audio file {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting audio file")

@router.delete("/cover/{filename}")
async def delete_cover_file(filename: str, include_thumbnails: bool = True):
    """Deletes a cover image and its thumbnails"""
    try:
        logger.info(f"Cover deletion started: {filename} (thumbnails: {include_thumbnails})")
        
        storage = StorageService()
        deleted = storage.delete_file(filename, "cover", include_thumbnails)
        
        if not deleted:
            logger.warning(f"Cover file not found for deletion: {filename}")
            raise HTTPException(status_code=404, detail="Cover picture not found")
        
        message = "Cover picture successfully deleted"
        if include_thumbnails:
            message += " (thumbnails included)"
        
        logger.info(f"Cover file deleted successfully: {filename}")
        return {"message": message}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting cover file {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting cover file")
