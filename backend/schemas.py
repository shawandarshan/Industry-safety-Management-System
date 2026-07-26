from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# --- User Schemas ---
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    role: str
    class Config:
        orm_mode = True

# --- Camera Schemas ---
class CameraBase(BaseModel):
    location: str
    stream_url: str

class CameraCreate(CameraBase):
    pass

class Camera(CameraBase):
    id: int
    status: str
    class Config:
        orm_mode = True

# --- Violation Schemas ---
class ViolationBase(BaseModel):
    camera_id: int
    missing_ppe: str
    image_path: str

class ViolationCreate(ViolationBase):
    pass

class Violation(ViolationBase):
    id: int
    timestamp: datetime
    status: str
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Worker Schemas ---
class WorkerBase(BaseModel):
    name: str
    department: str
    role: str
    email: str
    phone: str

class WorkerCreate(WorkerBase):
    pass

class Worker(WorkerBase):
    id: int
    class Config:
        orm_mode = True
