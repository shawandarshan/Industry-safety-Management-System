from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, violations, camera, workers
import models
from database import SessionLocal
from routers.auth import get_password_hash

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SafetyHub API",
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

from utils.ws_manager import manager
from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WS messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Include routers
app.include_router(auth.router)
app.include_router(violations.router)
app.include_router(camera.router)
app.include_router(workers.router)

@app.on_event("startup")
def seed_database():
    db = SessionLocal()
    try:
        # Seed Manager Account
        manager_email = "shawandarshan6002@gmail.com"
        manager = db.query(models.User).filter(models.User.username == manager_email).first()
        if not manager:
            hashed_pw = get_password_hash("shawan6002")
            new_manager = models.User(username=manager_email, hashed_password=hashed_pw, role="manager")
            db.add(new_manager)

        # Seed Mock Workers if none exist
        if db.query(models.Worker).count() == 0:
            workers = [
                models.Worker(name="Alice Smith", department="Assembly", role="Technician", email="alice@example.com", phone="555-0101"),
                models.Worker(name="Bob Johnson", department="Loading Dock", role="Operator", email="bob@example.com", phone="555-0102")
            ]
            db.add_all(workers)

        # Seed Mock Camera if none exists
        if db.query(models.Camera).count() == 0:
            cam1 = models.Camera(location="Assembly Line A", stream_url="mock_url")
            cam2 = models.Camera(location="Loading Dock", stream_url="mock_url")
            db.add_all([cam1, cam2])
            db.commit() # Commit to get camera IDs

            # Seed mock violations using the new cameras
            if db.query(models.Violation).count() == 0:
                v1 = models.Violation(camera_id=cam1.id, missing_ppe="Helmet", image_path="mock_path", status="unresolved")
                v2 = models.Violation(camera_id=cam2.id, missing_ppe="Mask, Gloves", image_path="mock_path", status="resolved")
                db.add_all([v1, v2])

        db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Welcome to the SafetyHub API"}
