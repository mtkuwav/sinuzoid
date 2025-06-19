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
    is_public: bool = False

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