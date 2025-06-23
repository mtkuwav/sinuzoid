# Sinuzoid 🎵

Sinuzoid is a modern music management and streaming platform built as a microservices architecture. It allows users to upload, organize, and stream their music collection with advanced features like playlist management and soon, metadata editing and statistics tracking.

## Features

- 🎵 **Audio File Management**: Upload and organize various audio formats (MP3, FLAC, WAV, M4A)
- 📋 **Playlist Management**: Create, edit, and organize custom playlists
- 🔐 **User Authentication**: Secure JWT-based authentication system
- 🎨 **Modern UI**: Responsive React frontend with Tailwind CSS
- 🐳 **Containerized**: Full Docker setup for easy deployment

## Architecture

Sinuzoid follows a microservices architecture with the following components:

- **Frontend**: React + TypeScript application with Vite
- **API Service**: FastAPI backend for music and playlist management
- **Authentication Service**: Symfony-based JWT authentication
- **Database**: PostgreSQL for data persistence
- **Reverse Proxy**: Nginx for routing and load balancing
- **Admin Interface**: PgAdmin for database management

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sinuzoid
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your preferred settings
   ```

3. **Install and start the application**
   ```bash
   # At the project root
   docker compose build && ./start.sh
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:8000/docs
   - Authentication Service: http://localhost:9000
   - Nginx Gateway: http://localhost:8080
   - PgAdmin: http://localhost:8081

### Database Setup

The PostgreSQL database will be automatically created. To access it through PgAdmin:

1. Go to http://localhost:8081
2. Login with the credentials from your `.env` file
3. Add a new server with these settings:
   - **Name**: Sinuzoid DB
   - **Host**: db
   - **Port**: 5432
   - **Maintenance Database**: sinuzoid_db
   - **Username**: postgres
   - **Password**: password (or your configured password)

## Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React application |
| API | 8000 | FastAPI backend |
| Auth Service | 9000 | Symfony authentication |
| Nginx | 8080 | Reverse proxy |
| PgAdmin | 8081 | Database admin interface |
| PostgreSQL | 5432 | Database server |

## Development

### Running Services Individually

Each service can be run independently for development:

- **Frontend**: See `frontend/README.md`
- **FastAPI Backend**: See `backend/fastapi-api/README.md`
- **Symfony Auth**: See `backend/symfony-auth/README.md`

### Testing

Audio test files are available in `/tests/audio/` for development and testing purposes.

### Project Structure

```
sinuzoid/
├── frontend/                 # React frontend application
├── backend/
│   ├── fastapi-api/         # Python FastAPI backend
│   └── symfony-auth/        # PHP Symfony authentication service
├── tests/                   # Test files and audio samples
├── scripts/                 # Utility scripts
├── db_backups/             # Database backup files
├── docker-compose.yml      # Main Docker composition
└── nginx.conf             # Nginx configuration
```

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation

### Backend
- **FastAPI** (Python) for API services
- **Symfony 7.2** (PHP) for authentication
- **SQLAlchemy** for ORM
- **PostgreSQL** for database
- **Nginx** for reverse proxy

### DevOps
- **Docker** & **Docker Compose** for containerization
- **PgAdmin** for database management

## Contributing

This is a first-year development studies project. Please keep implementations straightforward and well-documented.

## License

This project is licensed under GPLv3 license.

## Roadmap

I have a few ideas in mind, as i had to rush the developement a bit. Some of them are :
- Translations
- Personalized playlists covers
- Visualisers and stats page
- Last.fm integration
- Metadata edition

## Contributions

Contributions are welcome ! You can email me for any related subject, such as developement, traductions and testing.

