# Sinuzoid Backend Services 🔧

The backend infrastructure for Sinuzoid consists of two microservices that work together to provide a complete API solution for music management and user authentication.

## Architecture Overview

The backend follows a microservices architecture with two main services:

```
┌─────────────────┐    ┌─────────────────┐
│   Symfony Auth  │    │   FastAPI API   │
│     Service     │    │     Service     │
│                 │    │                 │
│ • User Auth     │    │ • Music Files   │
│ • JWT Tokens    │    │ • Playlists     │
│ • User Profiles │    │ • Statistics    │
│ • Admin Panel   │    │ • Search        │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌─────────────┐
              │ PostgreSQL  │
              │  Database   │
              └─────────────┘
```

## Services

### 1. Symfony Authentication Service (`symfony-auth/`)
**Port: 9000** | **Language: PHP 8.2+** | **Framework: Symfony 7.2**

Handles all user-related operations:
- User registration and login
- JWT token generation and validation
- User profile management
- Administrative functions
- Security and CORS handling

[📖 Full Documentation](symfony-auth/README.md)

### 2. FastAPI Music Service (`fastapi-api/`)
**Port: 8000** | **Language: Python 3.11+** | **Framework: FastAPI**

Manages music and playlist operations:
- Audio file upload and processing
- Metadata extraction and editing
- Playlist CRUD operations
- Music library statistics
- Search and filtering
- File streaming and downloads

[📖 Full Documentation](fastapi-api/README.md)

## Shared Resources

### Database
Both services share a **PostgreSQL database** with separate schemas:
- **Authentication Schema**: Users, profiles, roles
- **Music Schema**: Files, playlists, statistics

### Storage
The FastAPI service manages file storage:
- **Audio Files**: `/storage/audio/`
- **Cover Art**: `/storage/cover/`

### Inter-Service Communication
- **Authentication Flow**: Symfony generates JWT tokens, FastAPI validates them
- **User Context**: FastAPI receives user information from validated JWT tokens
- **CORS**: Both services configured for frontend communication

## Getting Started

### Prerequisites
- Docker and Docker Compose
- PostgreSQL database
- Shared environment configuration

### Quick Start (Docker)
```bash
# Start both backend services
docker compose up auth api

# Or start individual services
docker compose up auth    # Authentication service only
docker compose up api     # Music API service only
```

### Development Setup

1. **Set up shared environment**
   ```bash
   cp .env.example .env
   # Configure shared database and service URLs
   ```

2. **Start PostgreSQL**
   ```bash
   docker compose up db
   ```

3. **Set up Authentication Service**
   ```bash
   cd symfony-auth
   composer install
   php bin/console lexik:jwt:generate-keypair
   php bin/console doctrine:migrations:migrate
   symfony server:start --port=9000
   ```

4. **Set up Music API Service**
   ```bash
   cd fastapi-api
   pip install -r requirements.txt
   uvicorn main:app --reload --port=8000
   ```

## Service Communication

### Authentication Flow
1. **User Login**: Frontend → Symfony Auth Service
2. **JWT Token**: Symfony Auth Service → Frontend
3. **API Requests**: Frontend → FastAPI (with JWT header)
4. **Token Validation**: FastAPI → Symfony Auth Service (validation)

### API Integration
```javascript
// Frontend API calls
const token = localStorage.getItem('jwt_token');

// Music API call with authentication
const response = await fetch('http://localhost:8000/files', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Environment Configuration

### Shared Variables (.env)
```env
# Database (shared)
DATABASE_URL=postgresql://postgres:password@db:5432/sinuzoid_db

# Service URLs (internal communication)
AUTH_SERVICE_URL=http://auth:80
API_SERVICE_URL=http://api:8000

# External access (frontend)
VITE_AUTH_URL=http://localhost:9000
VITE_API_URL=http://localhost:8000
```

### Service-Specific Configuration

**Symfony Auth (`symfony-auth/.env`)**:
```env
APP_ENV=dev
APP_SECRET=your_symfony_secret
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
```

**FastAPI (`fastapi-api/.env`)**:
```env
STORAGE_PATH=/storage
LOG_LEVEL=INFO
```

## Database Schema

### Users & Authentication (Symfony)
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    roles JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- User profiles
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar VARCHAR(255),
    birth_date DATE
);
```

### Music & Playlists (FastAPI)
```sql
-- Audio files
CREATE TABLE audio_files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    filename VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    artist VARCHAR(255),
    album VARCHAR(255),
    duration INTEGER,
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Playlists
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints Overview

### Authentication Service (Port 9000)
```
POST   /api/register           # User registration
POST   /api/login_check        # User login
GET    /api/user/profile       # Get user profile
PUT    /api/user/profile       # Update profile
POST   /api/user/change-password  # Change password
```

### Music API Service (Port 8000)
```
POST   /files/upload           # Upload audio files
GET    /files                  # List user's files
GET    /files/{id}/stream      # Stream audio file
GET    /playlists              # List user's playlists
POST   /playlists              # Create playlist
GET    /statistics/overview    # Library statistics
```

## Testing

### Integration Testing
Test the complete flow between services:

```bash
# Test authentication + API access
curl -X POST http://localhost:9000/api/login_check \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"password"}'

# Use returned token for API calls
curl -X GET http://localhost:8000/files \
  -H "Authorization: Bearer <jwt_token>"
```

### Load Testing
```bash
# Test both services under load
cd tests/
./run_load_tests.sh
```

## Monitoring & Logging

### Health Checks
Both services provide health check endpoints:
- **Auth Service**: `GET /health`
- **API Service**: `GET /health`

### Logging
Centralized logging configuration:
- **Symfony**: Uses Monolog for structured logging
- **FastAPI**: Python logging with JSON formatting
- **Docker**: Logs available via `docker compose logs`

## Security Considerations

### JWT Security
- Short-lived tokens (1 hour TTL)
- Secure token storage
- Token refresh mechanism
- Automatic token cleanup

### API Security
- CORS properly configured
- Input validation on all endpoints
- SQL injection prevention
- File upload restrictions

### Network Security
- Services communicate over internal Docker network
- Only necessary ports exposed
- Environment variable encryption

## Performance Optimization

### Database Optimization
- Connection pooling
- Proper indexing
- Query optimization
- Database migrations

### Caching Strategy
- JWT token caching
- Metadata caching
- Response caching for statistics

### File Handling
- Streaming for large files
- Async file operations
- Efficient storage organization

## Deployment

### Production Deployment
```bash
# Build all services
docker compose -f docker-compose.prod.yml build

# Deploy with proper configuration
docker compose -f docker-compose.prod.yml up -d
```

### Scaling Considerations
- **Horizontal Scaling**: Both services are stateless
- **Load Balancing**: Use Nginx for load distribution
- **Database**: Consider read replicas for heavy loads

## Troubleshooting

### Common Issues

1. **Service Communication Errors**
   - Check Docker network configuration
   - Verify service URLs in environment

2. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL configuration

3. **JWT Token Issues**
   - Verify JWT keys are generated (Symfony)
   - Check token expiration settings

4. **File Upload Problems**
   - Check storage path permissions
   - Verify Docker volume mounts

### Debug Commands
```bash
# Check service health
docker compose ps
docker compose logs auth
docker compose logs api

# Database connection test
docker compose exec db psql -U postgres -d sinuzoid_db -c "\dt"

# Service communication test
docker compose exec api curl http://auth:80/health
```

## Contributing

When working with the backend services:

1. **Follow Service Boundaries**: Keep authentication logic in Symfony, music logic in FastAPI
2. **Database Changes**: Create migrations in the appropriate service
3. **API Changes**: Update OpenAPI documentation
4. **Testing**: Add tests for both unit and integration scenarios
5. **Documentation**: Update service-specific READMEs

## Future Enhancements

- **Message Queue**: Add Redis/RabbitMQ for async processing
- **Caching Layer**: Implement Redis for performance
- **Monitoring**: Add Prometheus/Grafana for metrics
- **API Gateway**: Consider Kong/Traefik for unified API access
