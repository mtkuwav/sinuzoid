import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import files, playlists, statistics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('/app/logs/app.log') if os.path.exists('/app/logs') else logging.StreamHandler()
    ]
)

app = FastAPI(title="Sinuzoid API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://frontend:80"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],  # Expose Content-Disposition header to frontend
)

# Include routers
app.include_router(files.router)
app.include_router(playlists.router)
app.include_router(statistics.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Sinuzoid API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
