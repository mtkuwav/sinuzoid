import logging
import os
from fastapi import FastAPI
from app.routes import files

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

# Include routers
app.include_router(files.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Sinuzoid API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
