from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, database
from pydantic import BaseModel
import time
from utils.cloudinary_client import upload_base64_image
from utils.firebase_client import get_firestore_db
import datetime

class AIEventCreate(BaseModel):
    timestamp: float
    missing: str
    score: int
    image: str
    camera_id: str = "Camera-1"
    worker_id: str = "Unknown"
    worker_name: str = "Unknown"

router = APIRouter(
    prefix="/violations",
    tags=["Violations"]
)

@router.post("/", response_model=schemas.Violation)
def create_violation(violation: schemas.ViolationCreate, db: Session = Depends(database.get_db)):
    """
    Endpoint for the AI Module to push a new violation.
    """
    db_violation = models.Violation(**violation.dict())
    db.add(db_violation)
    db.commit()
    db.refresh(db_violation)
    return db_violation

@router.post("/ai-event")
def create_ai_event(event: AIEventCreate):
    """
    Endpoint for the AI Edge module to push a new violation event with an image.
    Uploads to Cloudinary, then saves to Firestore.
    """
    image_url = None
    if event.image:
        image_url = upload_base64_image(event.image)
        
    db = get_firestore_db()
    if not db:
        raise HTTPException(status_code=500, detail="Firestore not initialized")
        
    doc_ref = db.collection("violations").document()
    
    violation_data = {
        "id": doc_ref.id,
        "cameraId": event.camera_id,
        "workerId": event.worker_id,
        "workerName": event.worker_name,
        "violationType": event.missing,
        "confidence": event.score,
        "imageUrl": image_url,
        "status": "unresolved",
        "timestamp": datetime.datetime.fromtimestamp(event.timestamp)
    }
    
    doc_ref.set(violation_data)
    
    return {"message": "Event recorded", "id": doc_ref.id, "url": image_url}

@router.get("/", response_model=List[schemas.Violation])
def read_violations(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    """
    Endpoint for the Dashboard to fetch violation history.
    """
    violations = db.query(models.Violation).order_by(models.Violation.timestamp.desc()).offset(skip).limit(limit).all()
    return violations

@router.put("/{violation_id}", response_model=schemas.Violation)
def resolve_violation(violation_id: int, db: Session = Depends(database.get_db)):
    db_violation = db.query(models.Violation).filter(models.Violation.id == violation_id).first()
    if not db_violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    db_violation.status = "resolved"
    db.commit()
    db.refresh(db_violation)
    return db_violation

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(database.get_db)):
    total = db.query(models.Violation).count()
    unresolved = db.query(models.Violation).filter(models.Violation.status == "unresolved").count()
    resolved = db.query(models.Violation).filter(models.Violation.status == "resolved").count()
    cameras = db.query(models.Camera).count()
    
    return {
        "total_violations": total,
        "unresolved_violations": unresolved,
        "resolved_violations": resolved,
        "total_cameras": cameras
    }
