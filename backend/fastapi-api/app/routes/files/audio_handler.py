from fastapi import HTTPException, UploadFile, Request
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from app.services.storage import StorageService
from app.services.track_service import TrackService
from app.services.storage_quota_service import StorageQuotaService
from app.schemas.schemas import TrackCreate, TrackResponse
from datetime import timedelta
from pathlib import Path
import logging
import mimetypes

logger = logging.getLogger(__name__)

class AudioHandler:
    """Handler for audio file operations (upload, download, streaming, deletion)"""
    
    @staticmethod
    async def upload_audio(
        file: UploadFile,
        user_id: int,
        db: Session
    ) -> TrackResponse:
        """Audio file upload with automatic database recording"""
        try:
            logger.info(f"Audio upload started by user {user_id}: {file.filename}, size: {file.size}, type: {file.content_type}")
            
            # Step 0: Check storage quota before processing
            file_size = file.size or 0
            quota_check = StorageQuotaService.check_upload_allowed(db, user_id, file_size)
            
            if not quota_check["allowed"]:
                reason = quota_check.get("reason", "unknown")
                message = quota_check.get("message", "Upload not allowed")
                
                if reason == "insufficient_space":
                    storage_info = quota_check.get("storage_info", {})
                    available = storage_info.get("available", 0)
                    available_formatted = StorageQuotaService.format_bytes(available)
                    file_size_formatted = StorageQuotaService.format_bytes(file_size)
                    
                    logger.warning(f"Upload denied for user {user_id}: insufficient space. File: {file_size_formatted}, Available: {available_formatted}")
                    raise HTTPException(
                        status_code=413, 
                        detail=f"Insufficient storage space. File size: {file_size_formatted}, Available: {available_formatted}"
                    )
                else:
                    logger.error(f"Upload denied for user {user_id}: {message}")
                    raise HTTPException(status_code=400, detail=message)
            
            logger.info(f"Quota check passed for user {user_id}. File size: {StorageQuotaService.format_bytes(file_size)}")
            
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
    
    @staticmethod
    async def get_audio_file(
        filename: str,
        request: Request,
        user_id: int,
        db: Session,
        track=None
    ):
        """Downloads or streams an audio file with range support"""
        try:
            # Update last accessed timestamp if track provided
            if track:
                TrackService.update_last_accessed(db, track.id)
            
            storage = StorageService()
            file_path = storage.get_file_path(filename, "audio")
            
            if not file_path:
                logger.warning(f"Audio file not found: {filename}")
                raise HTTPException(status_code=404, detail="Audio file not found")
            
            # Generate formatted filename for download
            download_filename = filename  # Default fallback
            if track:
                try:
                    metadata = {}
                    if track.track_metadata and len(track.track_metadata) > 0:
                        metadata = track.track_metadata[0].metadata_json or {}
                    
                    logger.info(f"Track metadata for {filename}: {metadata}")
                    logger.info(f"Original filename: {track.original_filename}")
                    
                    download_filename = storage.file_manager.generate_download_filename(
                        track.original_filename, metadata
                    )
                    logger.info(f"Generated download filename: {download_filename} for file: {filename}")
                except Exception as e:
                    logger.warning(f"Error generating download filename for {filename}: {str(e)}, using original")
                    download_filename = track.original_filename if track.original_filename else filename
            else:
                logger.warning(f"No track found for filename: {filename}, using filename as-is")
            
            # Detect proper MIME type
            mime_type, _ = mimetypes.guess_type(str(file_path))
            if not mime_type or not mime_type.startswith('audio'):
                mime_type = 'audio/mpeg'  # Default fallback
            
            # Check for Range header (streaming support)
            range_header = request.headers.get('range')
            
            if range_header:
                # Range request for streaming (use original filename for streaming)
                return await AudioHandler._serve_audio_range(file_path, range_header, mime_type, filename)
            else:
                # Full file download with formatted filename
                logger.info(f"Audio file served (full): {filename} as {download_filename}")
                return FileResponse(
                    path=file_path,
                    media_type=mime_type,
                    filename=download_filename,
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
    
    @staticmethod
    async def _serve_audio_range(file_path: Path, range_header: str, mime_type: str, filename: str):
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
    
    @staticmethod
    def delete_audio_file(filename: str, user_id: int, db: Session, track=None):
        """Deletes an audio file and its database record"""
        try:
            logger.info(f"Audio deletion started by user {user_id}: {filename}")
            
            # Use provided track or get it from database
            if not track:
                track = TrackService.get_track_by_filename(db, filename, user_id)
                if not track:
                    logger.warning(f"Track record not found in database for file: {filename}")
                    raise HTTPException(status_code=404, detail="Track not found")
            
            # Step 1: Delete physical file
            storage = StorageService()
            deleted = storage.delete_file(filename, "audio")
            
            if not deleted:
                logger.warning(f"Audio file not found for deletion: {filename}")
                raise HTTPException(status_code=404, detail="Audio file not found")
            
            # Step 2: Delete database record (this will cascade to metadata)
            TrackService.delete_track(db, track.id, user_id)
            
            logger.info(f"Audio file and database record deleted successfully: {filename}")
            return {"message": "Audio file and database record successfully deleted"}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting audio file {filename}: {str(e)}")
            raise HTTPException(status_code=500, detail="Error deleting audio file")
    
    @staticmethod
    def delete_all_user_tracks(user_id: int, db: Session):
        """Delete all tracks for the current user (both database records and files)"""
        try:
            logger.info(f"Started deleting all tracks for user {user_id}")
            
            tracks = TrackService.get_user_tracks(db, user_id, skip=0, limit=10000)  # Get all tracks
            
            if not tracks:
                logger.info(f"No tracks found for user {user_id}")
                return {"message": "No tracks found to delete", "deleted_count": 0}
            
            storage = StorageService()
            failed_deletions = []
            successful_deletions = 0
            
            for track in tracks:
                try:
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
            
            # Delete all database records (will cascade to metadata and statistics)
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
