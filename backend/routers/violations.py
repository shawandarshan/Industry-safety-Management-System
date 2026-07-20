from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, database

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
    
    return {
        "total_violations": total,
        "unresolved_violations": unresolved,
        "resolved_violations": resolved
    }
