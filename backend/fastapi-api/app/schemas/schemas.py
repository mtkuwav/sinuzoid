from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, timedelta
from uuid import UUID

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    last_login: Optional[datetime] = None
    storage_quota: int
    role: str

class TrackBase(BaseModel):
    original_filename: str
    file_type: str

class TrackCreate(TrackBase):
    file_path: str
    file_size: int
    duration: timedelta
    cover_path: Optional[str] = None
    cover_thumbnail_path: Optional[str] = None

class TrackResponse(TrackBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: int
    file_path: str
    file_size: int
    duration: timedelta
    upload_date: datetime
    last_accessed: Optional[datetime] = None
    cover_path: Optional[str] = None
    cover_thumbnail_path: Optional[str] = None
    updated_at: datetime
    last_accessed: Optional[datetime] = None
    cover_path: Optional[str] = None
    cover_thumbnail_path: Optional[str] = None
    updated_at: datetime

class MetadataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    track_id: UUID
    metadata_json: dict
    created_at: datetime
    updated_at: datetime

class MetadataUpdate(BaseModel):
    """Schema for updating track metadata"""
    title: Optional[str] = None
    artist: Optional[str] = None
    album: Optional[str] = None
    albumartist: Optional[str] = None
    date: Optional[str] = None
    genre: Optional[str] = None
    track: Optional[str] = None
    disc: Optional[str] = None
    comment: Optional[str] = None
    lyrics: Optional[str] = None
    bpm: Optional[float] = None
    key: Optional[str] = None
    remixer: Optional[str] = None
    producer: Optional[str] = None
    label: Optional[str] = None
    catalog_number: Optional[str] = None
    isrc: Optional[str] = None
    barcode: Optional[str] = None

class PlaylistBase(BaseModel):
    name: str
    description: Optional[str] = None

class PlaylistCreate(PlaylistBase):
    pass

class PlaylistResponse(PlaylistBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: int
    created_at: datetime
    updated_at: datetime
    tracks: List[TrackResponse] = []

class StatisticsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    user_id: int
    track_id: UUID
    play_count: int
    last_played: Optional[datetime] = None
    user_rating: Optional[int] = None
    total_listen_time: timedelta
    skip_count: int
    complete_plays: int
    created_at: datetime
    updated_at: datetime

class StatisticsCreate(BaseModel):
    """Schema for creating new statistics entry"""
    user_id: int
    track_id: UUID
    play_count: int = 0
    user_rating: Optional[int] = None
    total_listen_time: timedelta = timedelta(seconds=0)
    skip_count: int = 0
    complete_plays: int = 0

class StatisticsUpdate(BaseModel):
    """Schema for updating existing statistics"""
    play_count: Optional[int] = None
    user_rating: Optional[int] = None
    total_listen_time: Optional[timedelta] = None
    skip_count: Optional[int] = None
    complete_plays: Optional[int] = None
    last_played: Optional[datetime] = None

class PlayEvent(BaseModel):
    """Schema for recording a play event"""
    track_id: UUID
    listen_duration: timedelta  # How long the track was actually listened to
    track_duration: timedelta   # Total duration of the track
    completed: bool = False     # Whether the track was played to completion (>80% listened)
    skipped: bool = False       # Whether the track was skipped

class RatingUpdate(BaseModel):
    """Schema for updating track rating"""
    track_id: UUID
    rating: int  # 1-5 stars

class UserStatisticsSummary(BaseModel):
    """Summary of user's listening statistics"""
    user_id: int
    total_tracks_listened: int
    total_play_count: int
    total_listen_time: timedelta
    total_complete_plays: int
    total_skips: int
    average_rating: Optional[float] = None
    favorite_tracks: List[TrackResponse] = []  # Top 5 most played tracks
    recently_played: List[TrackResponse] = []  # Last 10 played tracks

class TrackStatisticsSummary(BaseModel):
    """Summary of track's listening statistics across all users"""
    track_id: UUID
    total_plays: int
    total_listeners: int
    total_listen_time: timedelta
    total_complete_plays: int
    total_skips: int
    average_rating: Optional[float] = None
    completion_rate: float  # Percentage of plays that were completed

class StatisticsSearchParams(BaseModel):
    """Parameters for statistics search/filtering"""
    user_id: Optional[int] = None
    track_id: Optional[UUID] = None
    min_play_count: Optional[int] = None
    min_rating: Optional[int] = None
    max_rating: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    limit: int = 50
    offset: int = 0

class StatisticsSearchResult(BaseModel):
    """Search result for statistics"""
    statistics: List[StatisticsResponse]
    total_results: int
    filters_applied: dict

class StorageInfoResponse(BaseModel):
    """Response model for storage quota information"""
    quota: int
    used: int
    available: int
    usage_percentage: float
    quota_formatted: str
    used_formatted: str
    available_formatted: str

class QuotaCheckResponse(BaseModel):
    """Response model for quota check operations"""
    allowed: bool
    reason: Optional[str] = None
    message: Optional[str] = None
    storage_info: Optional[StorageInfoResponse] = None

class PlaylistSearchParams(BaseModel):
    """Parameters for playlist search"""
    query: Optional[str] = None
    search_in_tracks: bool = False
    search_in_description: bool = True
    limit: int = 50
    offset: int = 0

class PlaylistSearchResult(BaseModel):
    """Search result for playlists"""
    playlists: List[PlaylistResponse]
    total_results: int
    search_query: str
    search_in_tracks: bool
    search_in_description: bool

class TrackSearchParams(BaseModel):
    """Parameters for track search"""
    query: Optional[str] = None
    search_in_filename: bool = True
    search_in_metadata: bool = True
    file_type: Optional[str] = None
    # min_duration: Optional[int] = None  # in seconds - DISABLED: Duration filtering not implemented
    # max_duration: Optional[int] = None  # in seconds - DISABLED: Duration filtering not implemented
    limit: int = 50
    offset: int = 0

class TrackSearchResult(BaseModel):
    """Search result for tracks"""
    tracks: List[TrackResponse]
    total_results: int
    search_query: Optional[str]
    filters_applied: dict