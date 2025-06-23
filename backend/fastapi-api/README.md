# Sinuzoid FastAPI Backend 🎵

The main API service for Sinuzoid, built with FastAPI and Python. This backend handles music file management, metadata processing, playlist operations, and statistics tracking.

## Features

- 🎵 **Audio File Management**: Upload, process, and serve various audio formats
- 📝 **Metadata Processing**: Extract and edit ID3 tags, cover art, and extended metadata
- 📋 **Playlist API**: Full CRUD operations for playlist management
- 📊 **Statistics Service**: Track and analyze listening habits
- 🔍 **Search & Filtering**: Advanced search capabilities across music library
- 🗃️ **Database Integration**: SQLAlchemy ORM with PostgreSQL
- 🔐 **Authentication Integration**: JWT validation with Symfony auth service
- 📁 **File Storage**: Organized storage for audio files and cover art

## Technology Stack

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - Python SQL toolkit and ORM
- **PostgreSQL** - Primary database
- **Mutagen** - Audio metadata manipulation
- **Pillow** - Image processing for cover art
- **Aiofiles** - Async file operations
- **Uvicorn** - ASGI server

## Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL database
- Docker (recommended) or local Python environment

### Development Setup

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file with:
   DATABASE_URL=postgresql://postgres:password@localhost:5432/sinuzoid_db
   AUTH_SERVICE_URL=http://localhost:9000
   STORAGE_PATH=/storage
   ```

3. **Run the application**
   ```bash
   # Development
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   
   # Or with Docker
   docker compose up api
   ```

4. **Access API documentation**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Project Structure

```
fastapi-api/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── Dockerfile             # Container configuration
├── app/
│   ├── database.py        # Database configuration
│   ├── dependencies/      # FastAPI dependencies
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic services
│   └── routes/           # API route handlers
│       ├── files/        # File management routes
│       ├── playlists/    # Playlist management routes
│       └── statistics/   # Statistics routes
├── backups/              # Backup utilities
└── tests/               # Test files and documentation
```

## API Endpoints

### Files Management

- `POST /files/upload` - Upload audio files
- `GET /files` - List all files with filtering
- `GET /files/{file_id}` - Get file details
- `PUT /files/{file_id}/metadata` - Update file metadata
- `DELETE /files/{file_id}` - Delete file
- `GET /files/{file_id}/download` - Download audio file
- `GET /files/{file_id}/stream` - Stream audio file

### Playlists

- `GET /playlists` - List all playlists
- `POST /playlists` - Create new playlist
- `GET /playlists/{playlist_id}` - Get playlist details
- `PUT /playlists/{playlist_id}` - Update playlist
- `DELETE /playlists/{playlist_id}` - Delete playlist
- `POST /playlists/{playlist_id}/tracks` - Add tracks to playlist
- `DELETE /playlists/{playlist_id}/tracks/{track_id}` - Remove track from playlist

### Statistics

- `GET /statistics/overview` - General library statistics
- `GET /statistics/listening-habits` - User listening patterns
- `GET /statistics/top-tracks` - Most played tracks
- `GET /statistics/top-artists` - Most played artists

### Search

- `GET /search` - Search across tracks, artists, albums
- `GET /search/tracks` - Search specific to tracks
- `GET /search/suggest` - Search suggestions

## Database Models

### AudioFile
- Stores audio file information and metadata
- Links to physical file storage
- Tracks play counts and statistics

### Playlist
- User-created playlists
- Supports ordering and metadata

### PlaylistTrack
- Many-to-many relationship between playlists and tracks
- Maintains track order within playlists

### Statistics
- Listening history and analytics
- User behavior tracking

## Services

### Audio Processing Service
```python
# Extract metadata from audio files
# Process cover art
# Validate audio file formats
# Generate waveforms (future feature)
```

### Storage Service
```python
# File upload handling
# Organized storage structure
# Cover art management
# File cleanup and maintenance
```

### Statistics Service
```python
# Track listening events
# Generate analytics
# Calculate trends
# Export statistics
```

### Search Service
```python
# Full-text search
# Metadata-based filtering
# Search suggestions
# Advanced queries
```

## Authentication

The API integrates with the Symfony authentication service:

- JWT token validation
- User context extraction
- Protected route middleware
- Role-based access control

## File Storage

Audio files and cover art are stored in organized directories:

```
/storage/
├── audio/
│   ├── uploads/          # Original uploaded files
│   └── processed/        # Processed audio files
└── cover/
    ├── thumbnails/       # Cover art thumbnails
    └── full/            # Full-size cover art
```

## Configuration

Key environment variables:

```env
DATABASE_URL=postgresql://user:password@host:port/database
AUTH_SERVICE_URL=http://auth-service:port
STORAGE_PATH=/path/to/storage
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## API Documentation

FastAPI automatically generates OpenAPI documentation:

- **Swagger UI**: Interactive API testing at `/docs`
- **ReDoc**: Alternative documentation at `/redoc`
- **OpenAPI JSON**: Machine-readable spec at `/openapi.json`

## Testing

Run tests with:

```bash
# Unit tests
python -m pytest tests/

# Integration tests
python -m pytest tests/integration/

# Load testing
python tests/load_test.py
```

Test audio files are available in `/tests/audio/` for development.

## Performance Considerations

- **Async Operations**: All file I/O operations are asynchronous
- **Database Optimization**: Proper indexing and query optimization
- **Caching**: Response caching for frequently accessed data
- **Streaming**: Efficient audio streaming with range requests
- **Batch Operations**: Bulk upload and processing capabilities

## Error Handling

- Comprehensive error responses with proper HTTP status codes
- Detailed error messages for debugging
- Graceful handling of file system errors
- Database transaction rollback on failures

## Logging

Structured logging with configurable levels:
- Request/response logging
- Error tracking
- Performance metrics
- File operation audit trails

## Security

- Input validation with Pydantic schemas
- SQL injection prevention with SQLAlchemy
- File type validation for uploads
- Path traversal protection
- Rate limiting (future implementation)

## Deployment

### Docker Deployment
```bash
# Build image
docker build -t sinuzoid-api .

# Run with compose
docker compose up api
```

### Production Considerations
- Use production ASGI server (Gunicorn + Uvicorn)
- Configure proper logging
- Set up health checks
- Implement monitoring
- Configure SSL termination at reverse proxy

## Troubleshooting

### Common Issues

1. **Database Connection**: Check DATABASE_URL and PostgreSQL status
2. **File Upload Errors**: Verify storage path permissions
3. **Audio Processing**: Ensure Mutagen can read file format
4. **Memory Issues**: Large file uploads may require streaming
5. **CORS Issues**: Configure CORS_ORIGINS properly

### Debug Mode

Set `LOG_LEVEL=DEBUG` for detailed logging and debugging information.

## Contributing

- Follow PEP 8 style guidelines
- Use type hints for all functions
- Write docstrings for public APIs
- Add tests for new features
- Update API documentation
