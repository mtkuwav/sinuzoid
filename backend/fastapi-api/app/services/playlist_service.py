from sqlalchemy.orm import Session
from sqlalchemy import and_, func, or_, text
from app.models.models import Playlist, Track, playlist_tracks
from app.schemas.schemas import PlaylistCreate
from typing import List, Optional
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class PlaylistService:
    
    @staticmethod
    def create_playlist(db: Session, playlist_data: PlaylistCreate, user_id: int) -> Playlist:
        """Create a new playlist"""
        try:
            db_playlist = Playlist(
                user_id=user_id,
                **playlist_data.model_dump()
            )
            db.add(db_playlist)
            db.commit()
            db.refresh(db_playlist)
            
            logger.info(f"Playlist created: {db_playlist.id} for user {user_id}")
            return db_playlist
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating playlist: {str(e)}")
            raise

    @staticmethod
    def get_user_playlists(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Playlist]:
        """Get all playlists for a user"""
        return db.query(Playlist).filter(Playlist.user_id == user_id).offset(skip).limit(limit).all()

    @staticmethod
    def get_playlist_by_id(db: Session, playlist_id: UUID, user_id: int) -> Optional[Playlist]:
        """Get playlist by ID for a specific user"""
        return db.query(Playlist).filter(
            and_(
                Playlist.id == playlist_id,
                Playlist.user_id == user_id
            )
        ).first()

    @staticmethod
    def update_playlist(db: Session, playlist_id: UUID, playlist_data: PlaylistCreate, user_id: int) -> Optional[Playlist]:
        """Update a playlist"""
        try:
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                return None
            
            for field, value in playlist_data.model_dump().items():
                setattr(playlist, field, value)
            
            db.commit()
            db.refresh(playlist)
            
            logger.info(f"Playlist updated: {playlist_id}")
            return playlist
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating playlist {playlist_id}: {str(e)}")
            raise

    @staticmethod
    def delete_playlist(db: Session, playlist_id: UUID, user_id: int) -> bool:
        """Delete a playlist"""
        try:
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                return False
                
            db.delete(playlist)
            db.commit()
            logger.info(f"Playlist deleted: {playlist_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting playlist {playlist_id}: {str(e)}")
            raise

    @staticmethod
    def add_track_to_playlist(db: Session, playlist_id: UUID, track_id: UUID, user_id: int, position: Optional[int] = None) -> bool:
        """Add a track to a playlist"""
        try:
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                logger.warning(f"Playlist {playlist_id} not found for user {user_id}")
                return False
            
            track = db.query(Track).filter(
                and_(
                    Track.id == track_id,
                    Track.user_id == user_id
                )
            ).first()
            
            if not track:
                logger.warning(f"Track {track_id} not found for user {user_id}")
                return False
            
            existing = db.execute(
                playlist_tracks.select().where(
                    and_(
                        playlist_tracks.c.playlist_id == playlist_id,
                        playlist_tracks.c.track_id == track_id
                    )
                )
            ).first()
            
            if existing:
                logger.warning(f"Track {track_id} already in playlist {playlist_id}")
                return False
            
            if position is None:
                max_position = db.execute(
                    func.max(playlist_tracks.c.position).select().where(
                        playlist_tracks.c.playlist_id == playlist_id
                    )
                ).scalar() or 0
                position = max_position + 1
            
            db.execute(
                playlist_tracks.insert().values(
                    playlist_id=playlist_id,
                    track_id=track_id,
                    position=position
                )
            )
            
            db.commit()
            logger.info(f"Track {track_id} added to playlist {playlist_id} at position {position}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error adding track {track_id} to playlist {playlist_id}: {str(e)}")
            raise

    @staticmethod
    def remove_track_from_playlist(db: Session, playlist_id: UUID, track_id: UUID, user_id: int) -> bool:
        """Remove a track from a playlist"""
        try:
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                return False
            
            result = db.execute(
                playlist_tracks.delete().where(
                    and_(
                        playlist_tracks.c.playlist_id == playlist_id,
                        playlist_tracks.c.track_id == track_id
                    )
                )
            )
            
            db.commit()
            
            if result.rowcount > 0:
                logger.info(f"Track {track_id} removed from playlist {playlist_id}")
                return True
            else:
                logger.warning(f"Track {track_id} not found in playlist {playlist_id}")
                return False
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error removing track {track_id} from playlist {playlist_id}: {str(e)}")
            raise

    @staticmethod
    def reorder_playlist_tracks(db: Session, playlist_id: UUID, user_id: int, track_orders: List[dict]) -> bool:
        """Reorder tracks in a playlist
        
        Args:
            track_orders: List of {"track_id": UUID, "position": int}
        """
        try:
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                return False
            
            for track_order in track_orders:
                track_id = track_order["track_id"]
                position = track_order["position"]
                
                db.execute(
                    playlist_tracks.update().where(
                        and_(
                            playlist_tracks.c.playlist_id == playlist_id,
                            playlist_tracks.c.track_id == track_id
                        )
                    ).values(position=position)
                )
            
            db.commit()
            logger.info(f"Reordered tracks in playlist {playlist_id}")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error reordering playlist {playlist_id}: {str(e)}")
            raise

    @staticmethod
    def get_playlist_tracks(db: Session, playlist_id: UUID, user_id: int) -> List[Track]:
        """Get all tracks in a playlist ordered by position"""
        try:
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                return []
            
            tracks = db.query(Track).join(
                playlist_tracks,
                Track.id == playlist_tracks.c.track_id
            ).filter(
                playlist_tracks.c.playlist_id == playlist_id
            ).order_by(playlist_tracks.c.position).all()
            
            return tracks
            
        except Exception as e:
            logger.error(f"Error getting tracks for playlist {playlist_id}: {str(e)}")
            return []

    @staticmethod
    def search_playlists(
        db: Session, 
        user_id: int, 
        query: str, 
        search_in_tracks: bool = False,
        search_in_description: bool = True,
        limit: int = 50, 
        offset: int = 0
    ) -> tuple[List[Playlist], int]:
        """Search playlists by name, description and optionally tracks"""
        try:
            base_query = db.query(Playlist).filter(Playlist.user_id == user_id)
            
            if not query or query.strip() == "":
                total = base_query.count()
                playlists = base_query.offset(offset).limit(limit).all()
                return playlists, total
            
            search_term = f"%{query.lower()}%"
            conditions = [
                Playlist.name.ilike(search_term)
            ]
            
            if search_in_description:
                conditions.append(Playlist.description.ilike(search_term))
            
            if search_in_tracks:
                # Search in track names within playlists
                track_subquery = db.query(playlist_tracks.c.playlist_id).join(
                    Track, playlist_tracks.c.track_id == Track.id
                ).filter(
                    Track.original_filename.ilike(search_term)
                ).distinct()
                
                conditions.append(Playlist.id.in_(track_subquery))
            
            search_query = base_query.filter(or_(*conditions))
            total = search_query.count()
            playlists = search_query.offset(offset).limit(limit).all()
            
            logger.info(f"Search for '{query}' returned {total} playlists for user {user_id}")
            return playlists, total
            
        except Exception as e:
            logger.error(f"Error searching playlists for user {user_id}: {str(e)}")
            return [], 0

    @staticmethod
    def search_tracks_in_playlist(
        db: Session, 
        playlist_id: UUID, 
        user_id: int, 
        query: str,
        limit: int = 50,
        offset: int = 0
    ) -> tuple[List[Track], int]:
        """Search tracks within a specific playlist"""
        try:
            # Verify playlist ownership
            playlist = db.query(Playlist).filter(
                and_(
                    Playlist.id == playlist_id,
                    Playlist.user_id == user_id
                )
            ).first()
            
            if not playlist:
                return [], 0
            
            if not query or query.strip() == "":
                tracks = PlaylistService.get_playlist_tracks(db, playlist_id, user_id)
                return tracks[offset:offset+limit], len(tracks)
            
            search_term = f"%{query.lower()}%"
            
            # Search in track filenames within the playlist
            base_query = db.query(Track).join(
                playlist_tracks,
                Track.id == playlist_tracks.c.track_id
            ).filter(
                and_(
                    playlist_tracks.c.playlist_id == playlist_id,
                    Track.original_filename.ilike(search_term)
                )
            ).order_by(playlist_tracks.c.position)
            
            total = base_query.count()
            tracks = base_query.offset(offset).limit(limit).all()
            
            logger.info(f"Search for '{query}' in playlist {playlist_id} returned {total} tracks")
            return tracks, total
            
        except Exception as e:
            logger.error(f"Error searching tracks in playlist {playlist_id}: {str(e)}")
            return [], 0

    @staticmethod
    def get_playlist_suggestions(db: Session, user_id: int, query: str, limit: int = 5) -> List[str]:
        """Get playlist name suggestions based on partial query"""
        try:
            if not query or len(query) < 2:
                return []
            
            search_term = f"{query.lower()}%"
            
            suggestions = db.query(Playlist.name).filter(
                and_(
                    Playlist.user_id == user_id,
                    Playlist.name.ilike(search_term)
                )
            ).distinct().limit(limit).all()
            
            return [suggestion[0] for suggestion in suggestions]
            
        except Exception as e:
            logger.error(f"Error getting playlist suggestions: {str(e)}")
            return []