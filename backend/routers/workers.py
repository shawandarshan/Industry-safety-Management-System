from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas, database

router = APIRouter(
    prefix="/workers",
    tags=["Workers"]
)

@router.post("/", response_model=schemas.Worker)
def create_worker(worker: schemas.WorkerCreate, db: Session = Depends(database.get_db)):
    db_worker = db.query(models.Worker).filter(models.Worker.email == worker.email).first()
    if db_worker:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_worker = models.Worker(**worker.dict())
    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)
    return new_worker

@router.get("/", response_model=List[schemas.Worker])
def read_workers(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    workers = db.query(models.Worker).offset(skip).limit(limit).all()
    return workers

@router.delete("/{worker_id}")
def delete_worker(worker_id: int, db: Session = Depends(database.get_db)):
    worker = db.query(models.Worker).filter(models.Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    db.delete(worker)
    db.commit()
    return {"message": "Worker deleted"}
