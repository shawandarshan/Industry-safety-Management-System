from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, violations, camera

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Safety Management System API",
    description="REST API for storing and retrieving PPE violations",
    version="1.0.0"
)

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change to the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(violations.router)
app.include_router(camera.router)

@app.get("/")
def root():
    return {"message": "Welcome to the AI Safety Management System API"}
