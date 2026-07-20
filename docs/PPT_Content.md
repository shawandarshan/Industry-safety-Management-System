# Slide 1: Title Slide
**Title:** AI-Based Industry Safety Management System
**Subtitle:** Industry 4.0 & 5.0 - Ensuring Workplace Safety via Computer Vision
**Presenter:** [Your Name]
**Date:** [Date]

---

# Slide 2: Problem Statement
- High incidence of workplace accidents due to lack of Personal Protective Equipment (PPE).
- Manual monitoring by supervisors is inefficient, prone to errors, and impossible to scale across large manufacturing floors.
- **The Need:** An automated, 24/7 system that detects safety violations in real-time.

---

# Slide 3: Objectives
- Develop an AI-powered system for real-time PPE detection.
- Monitor Helmets, Safety Vests, Face Masks, Gloves, and Safety Shoes.
- Instantly capture violations and log them into a secure database.
- Provide a responsive Web Dashboard for supervisors to view live alerts and analytics.

---

# Slide 4: Technology Stack
- **Frontend:** React.js, TailwindCSS
- **Backend:** FastAPI (Python)
- **AI/Computer Vision:** YOLOv8/YOLOv11, OpenCV, PyTorch
- **Database:** PostgreSQL/SQLite
- **Visualization:** Chart.js / Recharts

---

# Slide 5: System Architecture
*(Insert System Architecture Diagram Here)*
- Cameras feed live video to the AI Detection Module.
- YOLO model analyzes frames for humans and PPE.
- Violations are sent via REST APIs to the FastAPI backend.
- Backend saves to the database and streams to the React dashboard.

---

# Slide 6: The AI Detection Module
- Built using **YOLO (You Only Look Once)** - state-of-the-art real-time object detection.
- **Classes detected:** Person, Helmet, Vest, Mask, Gloves, Shoes.
- **Logic:**
  1. Detect Person.
  2. Detect PPE within the person's bounding box.
  3. If required PPE is missing = Violation Alert!

---

# Slide 7: Web Dashboard Features
- **Live Monitoring:** View active camera feeds with bounding boxes.
- **Violation History:** A logged grid of all violations with timestamps and snapshots.
- **Analytics:** Daily and weekly compliance charts.
- **User Management:** Secure login for Admins and Supervisors.

---

# Slide 8: Future Scope
- Integration with Facial Recognition to identify specific workers.
- Deployment on Edge Devices (NVIDIA Jetson) for lower latency.
- Predictive Analytics to determine high-risk zones or times.

---

# Slide 9: Conclusion
- This AI-Based Industry Safety Management System bridges the gap between manual supervision and automated safety enforcement.
- It is a highly scalable, robust solution aligned with Industry 4.0 standards, actively working to save lives and reduce industrial hazards.

---

# Slide 10: Questions?
**Thank You!**
- *Open for Q&A*
