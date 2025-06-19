from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Depends
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from app.services.storage import StorageService
from app.services.track_service import TrackService
from app.dependencies.auth import get_current_user
from app.database import get_db
from app.schemas.schemas import TrackCreate, TrackResponse
from datetime import timedelta
from typing import List
import logging
import mimetypes
from pathlib import Path
from typing import List


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/files", tags=["files"])

@router.post("/upload/audio", response_model=TrackResponse)
async def upload_audio(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Audio file upload with automatic database recording"""
    try:
        user_id = current_user["id"]
        logger.info(f"Audio upload started by user {user_id}: {file.filename}, size: {file.size}, type: {file.content_type}")
        
        # Step 1: Save physical file
        storage = StorageService()
        file_result = await storage.save_audio_file(file, str(user_id))
        
        # Step 2: Extract metadata, duration and cover info
        file_path = file_result.get('path')
        metadata = file_result.get('metadata', {})
        embedded_cover = file_result.get('embedded_cover')
        
        # Convert duration from seconds to timedelta
        duration_seconds = metadata.get('duration', 0)
        duration = timedelta(seconds=duration_seconds) if duration_seconds else timedelta(0)
        
        # Extract file extension from filename
        file_extension = Path(file.filename).suffix.lower().lstrip('.')
        
        # Extract cover paths if available
        cover_path = None
        cover_thumbnail_path = None
        
        if embedded_cover:
            cover_path = embedded_cover.get('path')
            # Get the first available thumbnail (prefer medium, then large, then small)
            thumbnails = embedded_cover.get('thumbnails', {})
            if 'medium' in thumbnails:
                cover_thumbnail_path = thumbnails['medium']['path']
            elif 'large' in thumbnails:
                cover_thumbnail_path = thumbnails['large']['path']
            elif 'small' in thumbnails:
                cover_thumbnail_path = thumbnails['small']['path']
        
        # Step 3: Create track record in database
        track_data = TrackCreate(
            original_filename=file.filename,
            file_path=file_path,
            file_size=file.size or 0,
            file_type=file_extension,
            duration=duration,
            cover_path=cover_path,
            cover_thumbnail_path=cover_thumbnail_path
        )
        
        # Create track in database
        db_track = TrackService.create_track(
            db=db,
            track_data=track_data,
            user_id=user_id
        )
        
        # Step 4: Save metadata if available
        if metadata:
            TrackService.save_metadata(
                db=db,
                track_id=db_track.id,
                metadata=metadata
            )
        
        logger.info(f"Audio upload and database recording successful for user {user_id}: track {db_track.id}")
        
        return db_track
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during audio upload {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during audio upload")

@router.post("/upload/cover")
async def upload_cover(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Cover picture upload with automatic thumbnails generation"""
    try:
        user_id = str(current_user["id"])
        logger.info(f"Cover upload started by user {user_id}: {file.filename}, size: {file.size}, type: {file.content_type}")
        
        storage = StorageService()
        result = await storage.save_cover_file(file, user_id)
        
        logger.info(f"Cover upload successful for user {user_id}: {result['filename']}")
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
async def get_audio_file(
    filename: str, 
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Downloads or streams an audio file with range support"""
    try:
        user_id = current_user["id"]
        
        # Verify file ownership using database
        if not _verify_file_ownership(filename, str(user_id), db):
            logger.warning(f"User {user_id} attempted to access unauthorized audio file: {filename}")
            raise HTTPException(status_code=403, detail="Access denied: file does not belong to user")
        
        # Update last accessed timestamp
        track = TrackService.get_track_by_filename(db, filename, user_id)
        if track:
            TrackService.update_last_accessed(db, track.id)
        
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
async def get_cover_file(
    filename: str,
    current_user: dict = Depends(get_current_user)
):
    """Downloads a cover picture with proper MIME type detection"""
    try:
        user_id = str(current_user["id"])
        if not _verify_file_ownership(filename, user_id):
            logger.warning(f"User {user_id} attempted to access unauthorized cover file: {filename}")
            raise HTTPException(status_code=403, detail="Access denied: file does not belong to user")
        storage = StorageService()
        file_path = storage.get_file_path(filename, "cover")
        
        if not file_path:
            logger.warning(f"Cover file not found: {filename}")
            raise HTTPException(status_code=404, detail="Cover picture not found")
        
        # Detect proper MIME type
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if not mime_type or not mime_type.startswith('image'):
            mime_type = 'image/jpeg'
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
async def get_thumbnail(
    filename: str, size: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["id"])
    if not _verify_file_ownership(filename, user_id):
        raise HTTPException(status_code=403, detail="Access denied: file does not belong to user")
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
async def get_available_thumbnails(
    filename: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["id"])
    if not _verify_file_ownership(filename, user_id):
        raise HTTPException(status_code=403, detail="Access denied: file does not belong to user")
    storage = StorageService()
    thumbnails = storage.get_all_thumbnails(filename)
    
    if not thumbnails:
        raise HTTPException(status_code=404, detail="No thumbnail found")
    
    return {
        "base_filename": filename,
        "thumbnails": thumbnails
    }

@router.delete("/audio/{filename}")
async def delete_audio_file(
    filename: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes an audio file and its database record"""
    try:
        user_id = current_user["id"]
        
        # Verify file ownership using database
        if not _verify_file_ownership(filename, str(user_id), db):
            logger.warning(f"User {user_id} attempted to delete unauthorized audio file: {filename}")
            raise HTTPException(status_code=403, detail="Access denied: file does not belong to user")
        
        logger.info(f"Audio deletion started by user {user_id}: {filename}")
        
        # Step 1: Get track record from database
        track = TrackService.get_track_by_filename(db, filename, user_id)
        if not track:
            logger.warning(f"Track record not found in database for file: {filename}")
            raise HTTPException(status_code=404, detail="Track not found")
        
        # Step 2: Delete physical file
        storage = StorageService()
        deleted = storage.delete_file(filename, "audio")
        
        if not deleted:
            logger.warning(f"Audio file not found for deletion: {filename}")
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        # Step 3: Delete database record (this will cascade to metadata)
        TrackService.delete_track(db, track.id, user_id)
        
        logger.info(f"Audio file and database record deleted successfully: {filename}")
        return {"message": "Audio file and database record successfully deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting audio file {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting audio file")

@router.delete("/tracks/all")
async def delete_all_user_tracks(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete all tracks for the current user (both database records and files)"""
    try:
        user_id = current_user["id"]
        logger.info(f"Started deleting all tracks for user {user_id}")
        
        # Step 1: Get all tracks for the user
        tracks = TrackService.get_user_tracks(db, user_id, skip=0, limit=10000)  # Get all tracks
        
        if not tracks:
            logger.info(f"No tracks found for user {user_id}")
            return {"message": "No tracks found to delete", "deleted_count": 0}
        
        storage = StorageService()
        failed_deletions = []
        successful_deletions = 0
        
        # Step 2: Delete physical files for each track
        for track in tracks:
            try:
                # Extract filename from file_path
                filename = Path(track.file_path).name
                
                # Delete the audio file and related covers/thumbnails
                file_deleted = storage.delete_file(filename, "audio", include_thumbnails=True)
                
                if file_deleted:
                    successful_deletions += 1
                    logger.info(f"Successfully deleted file: {filename}")
                else:
                    failed_deletions.append(filename)
                    logger.warning(f"Failed to delete file: {filename}")
                    
            except Exception as e:
                failed_deletions.append(f"{track.file_path} (error: {str(e)})")
                logger.error(f"Error deleting file {track.file_path}: {str(e)}")
        
        # Step 3: Delete all database records (this will cascade to metadata and statistics)
        deleted_db_count = TrackService.delete_all_user_tracks(db, user_id)
        
        message = f"Successfully deleted {deleted_db_count} track records from database"
        if successful_deletions > 0:
            message += f" and {successful_deletions} files from storage"
        
        if failed_deletions:
            message += f". Failed to delete {len(failed_deletions)} files: {', '.join(failed_deletions)}"
            logger.warning(f"Some files could not be deleted for user {user_id}: {failed_deletions}")
        
        logger.info(f"Completed deletion process for user {user_id}: {deleted_db_count} DB records, {successful_deletions} files")
        
        return {
            "message": message,
            "deleted_count": deleted_db_count,
            "files_deleted": successful_deletions,
            "files_failed": len(failed_deletions),
            "failed_files": failed_deletions if failed_deletions else []
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting all tracks for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting all tracks")

@router.delete("/cover/{filename}")
async def delete_cover_file(
    filename: str, 
    include_thumbnails: bool = True,
    current_user: dict = Depends(get_current_user)
):
    """Deletes a cover image and its thumbnails"""
    try:
        user_id = str(current_user["id"])
        if not _verify_file_ownership(filename, user_id):
            logger.warning(f"User {user_id} attempted to delete unauthorized cover file: {filename}")
            raise HTTPException(status_code=403, detail="Access denied: file does not belong to user")
        logger.info(f"Cover deletion started by user {user_id}: {filename} (thumbnails: {include_thumbnails})")
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

@router.get("/tracks", response_model=List[TrackResponse])
async def get_user_tracks(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tracks for the current user"""
    try:
        user_id = current_user["id"]
        tracks = TrackService.get_user_tracks(db, user_id, skip, limit)
        
        logger.info(f"Retrieved {len(tracks)} tracks for user {user_id}")
        return tracks
        
    except Exception as e:
        logger.error(f"Error retrieving tracks for user: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving tracks")

@router.get("/tracks/{track_id}", response_model=TrackResponse)
async def get_track_by_id(
    track_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific track by ID"""
    try:
        user_id = current_user["id"]
        
        # Convert string ID to UUID
        from uuid import UUID
        track_uuid = UUID(track_id)
        
        track = TrackService.get_track_by_id(db, track_uuid, user_id)
        
        if not track:
            raise HTTPException(status_code=404, detail="Track not found")
        
        logger.info(f"Retrieved track {track_id} for user {user_id}")
        return track
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid track ID format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving track {track_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving track")

@router.get("/tracks/{track_id}/cover")
async def get_track_cover(
    track_id: str,
    size: str = "original",  # original, small, medium, large
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get cover image for a track"""
    try:
        user_id = current_user["id"]
        
        # Convert string ID to UUID
        from uuid import UUID
        track_uuid = UUID(track_id)
        
        track = TrackService.get_track_by_id(db, track_uuid, user_id)
        
        if not track:
            raise HTTPException(status_code=404, detail="Track not found")
        
        # Determine which cover path to use
        cover_path = None
        if size == "original" and track.cover_path:
            cover_path = Path(track.cover_path)
        elif size != "original" and track.cover_thumbnail_path:
            # Use the stored thumbnail path directly or construct it based on size
            if size == "medium" and "medium" in track.cover_thumbnail_path:
                cover_path = Path(track.cover_thumbnail_path)
            else:
                # Construct path for other sizes
                base_path = Path(track.cover_thumbnail_path)
                cover_dir = base_path.parent
                filename_parts = base_path.stem.split('_')
                # Replace the size part
                new_filename = f"{'_'.join(filename_parts[:-1])}_{size}.webp"
                cover_path = cover_dir / new_filename
        
        if not cover_path or not cover_path.exists():
            raise HTTPException(status_code=404, detail="Cover image not found")
        
        # Determine MIME type
        if size == "original":
            mime_type = "image/jpeg"
        else:
            mime_type = "image/webp"
        
        return FileResponse(
            path=cover_path,
            media_type=mime_type,
            filename=cover_path.name
        )
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid track ID format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving cover for track {track_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving cover")

def _verify_file_ownership(filename: str, user_id: str, db: Session = None) -> bool:
    """Check if the file belongs to the current user using database if available, fallback to filename"""
    if db is not None:
        try:
            track = TrackService.get_track_by_filename(db, filename, int(user_id))
            return track is not None
        except Exception:
            pass
    
    # Fallback to filename-based check for compatibility (covers, etc.)
    return filename.startswith(f"{user_id}_") or f"_{user_id}_" in filename
