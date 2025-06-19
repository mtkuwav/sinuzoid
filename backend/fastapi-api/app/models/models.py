from sqlalchemy import Column, Integer, String, BigInteger, Boolean, DateTime, Text, SmallInteger, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID, JSONB, INTERVAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid

# Table d'association pour les playlists-tracks
playlist_tracks = Table(
    'playlist_tracks',
    Base.metadata,
    Column('playlist_id', UUID(as_uuid=True), ForeignKey('playlists.id', ondelete='CASCADE'), primary_key=True),
    Column('track_id', UUID(as_uuid=True), ForeignKey('tracks.id', ondelete='CASCADE'), primary_key=True),
    Column('position', Integer),
    Column('added_at', DateTime(timezone=False), server_default=func.current_timestamp(), nullable=False)
)

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=False), server_default=func.current_timestamp(), nullable=False)
    last_login = Column(DateTime(timezone=False))
    storage_quota = Column(BigInteger, default=1073741824, nullable=False)  # 1GB par défaut
    role = Column(String(20), default='user', nullable=False)
    updated_at = Column(DateTime(timezone=False), server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)
    
    # Relations
    tracks = relationship("Track", back_populates="user", cascade="all, delete-orphan")
    playlists = relationship("Playlist", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")
    statistics = relationship("Statistics", back_populates="user", cascade="all, delete-orphan")

class Track(Base):
    __tablename__ = 'tracks'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False, unique=True)
    file_size = Column(BigInteger, nullable=False)
    file_type = Column(String(10), nullable=False)
    duration = Column(INTERVAL, nullable=False)
    upload_date = Column(DateTime(timezone=False), server_default=func.current_timestamp(), nullable=False)
    last_accessed = Column(DateTime(timezone=False))
    is_public = Column(Boolean, default=False, nullable=False)
    cover_path = Column(String(512))
    cover_thumbnail_path = Column(String(512))
    updated_at = Column(DateTime(timezone=False), server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)
    
    # Relations
    user = relationship("User", back_populates="tracks")
    track_metadata = relationship("Metadata", back_populates="track", cascade="all, delete-orphan")
    statistics = relationship("Statistics", back_populates="track", cascade="all, delete-orphan")
    playlists = relationship("Playlist", secondary=playlist_tracks, back_populates="tracks")

class Metadata(Base):
    __tablename__ = 'metadata'
    
    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(UUID(as_uuid=True), ForeignKey('tracks.id', ondelete='CASCADE'), nullable=False)
    metadata_json = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=False), server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(DateTime(timezone=False), server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)
    
    # Relations
    track = relationship("Track", back_populates="track_metadata")

class Playlist(Base):
    __tablename__ = 'playlists'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=False), server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(DateTime(timezone=False), server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)
    
    # Relations
    user = relationship("User", back_populates="playlists")
    tracks = relationship("Track", secondary=playlist_tracks, back_populates="playlists")

class Statistics(Base):
    __tablename__ = 'statistics'
    
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    track_id = Column(UUID(as_uuid=True), ForeignKey('tracks.id', ondelete='CASCADE'), primary_key=True)
    play_count = Column(Integer, default=0, nullable=False)
    last_played = Column(DateTime(timezone=False))
    user_rating = Column(SmallInteger)  # 1-5
    total_listen_time = Column(INTERVAL, default='0 seconds', nullable=False)
    skip_count = Column(Integer, default=0, nullable=False)
    complete_plays = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=False), server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(DateTime(timezone=False), server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)
    
    # Relations
    user = relationship("User", back_populates="statistics")
    track = relationship("Track", back_populates="statistics")

class RefreshToken(Base):
    __tablename__ = 'refresh_tokens'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=False), nullable=False)
    created_at = Column(DateTime(timezone=False), nullable=False)
    used_at = Column(DateTime(timezone=False))
    is_revoked = Column(Boolean, nullable=False)
    
    # Relations
    user = relationship("User", back_populates="refresh_tokens")

class PasswordResetToken(Base):
    __tablename__ = 'password_reset_tokens'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=False), nullable=False)
    created_at = Column(DateTime(timezone=False), nullable=False)
    used_at = Column(DateTime(timezone=False))
    is_used = Column(Boolean, nullable=False)
    
    # Relations
    user = relationship("User", back_populates="password_reset_tokens")