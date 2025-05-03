# filepath: /home/matioku/Documents/Cours/Sinuzoid/sinuzoid/backend/fastapi-api/main.py
from fastapi import FastAPI

app = FastAPI(title="Sinuzoid API")

@app.get("/")
async def root():
    return {"message": "Welcome to Sinuzoid API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}