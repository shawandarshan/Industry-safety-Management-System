# AI-Based Industry Safety Management System

![Dashboard Preview](https://via.placeholder.com/800x400.png?text=Dashboard+Preview)

A comprehensive, AI-powered workplace safety monitoring system aligned with Industry 4.0 & 5.0. It utilizes real-time Computer Vision (YOLO) to ensure workers are wearing appropriate Personal Protective Equipment (PPE), logging violations automatically to a centralized dashboard.

## Features
- **Real-time AI Detection:** Detects Persons, Helmets, Safety Vests, Masks, Gloves, and Shoes.
- **Automated Compliance:** Automatically flags workers missing required PPE.
- **RESTful API Backend:** High-performance FastAPI server.
- **Interactive Dashboard:** React.js frontend for live monitoring, alerts, and analytics.
- **Comprehensive Logging:** SQLite/PostgreSQL database to store violations and snapshot evidence.

## Directory Structure
```
.
├── ai_module/       # YOLO detection scripts, video processing
├── backend/         # FastAPI server, database models, routers
├── frontend/        # React.js web dashboard
└── docs/            # Project reports, PPT content, Viva questions
```

## Prerequisites
- Python 3.9+
- Node.js 18+
- (Optional) PostgreSQL

## Installation & Setup

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*The API will run at http://localhost:8000*

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
*The Dashboard will run at http://localhost:5173*

### 3. AI Module
```bash
cd ai_module
pip install -r requirements.txt
# Run the detection script (using webcam 0 as default)
python detector.py --source 0
```

## API Documentation
Once the backend is running, visit `http://localhost:8000/docs` to view the automatic interactive Swagger API documentation.

## Deployment Guidelines
- **Backend & Database:** Can be containerized using Docker and deployed on Render, Railway, or AWS EC2.
- **Frontend:** Can be built using `npm run build` and deployed on Vercel or Netlify.
- **AI Module:** Should run locally on a server with GPU acceleration or an Edge computing device (NVIDIA Jetson) connected to the local CCTV network.

## License
MIT License
