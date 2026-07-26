from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
import datetime

from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="supervisor")

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, index=True)
    stream_url = Column(String)
    status = Column(String, default="active")

    violations = relationship("Violation", back_populates="camera")

class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    missing_ppe = Column(String) # Comma separated list e.g., "Helmet,Mask"
    image_path = Column(String) # Path to the snapshot
    status = Column(String, default="unresolved") # unresolved, resolved

    camera = relationship("Camera", back_populates="violations")

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    department = Column(String)
    role = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
