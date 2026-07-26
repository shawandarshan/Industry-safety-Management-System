import cv2
import requests
from fastapi import FastAPI, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import base64
import time
import threading
import asyncio
import numpy as np
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Edge AI Local Queue & State
offline_queue = []
BACKEND_URL = "http://localhost:8000"
model = YOLO("yolo11s.pt")

current_state = {
    "violation": False,
    "risk_score": 0,
    "status": "Safe"
}

# Camera management for multiple RTSP streams
active_streams = {}  # { url: { 'cap': ..., 'viewers': 0, 'latest_frame': ..., 'last_alert': 0 } }
camera_lock = threading.Lock()

class FrameData(BaseModel):
    camera_id: str
    camera_name: str
    image: str
    timestamp: float
    confidence_threshold: float = 0.45

def calculate_risk(person_detected, ppes_missing):
    score = 0
    if person_detected:
        if "Helmet" in ppes_missing: score += 20
        if "Vest" in ppes_missing: score += 15
        if "Mask" in ppes_missing: score += 10
    
    status = "Safe"
    if score >= 40: status = "Medium Risk"
    if score >= 70: status = "High Risk"
    return min(100, score), status

def sync_offline_queue():
    while True:
        if offline_queue:
            item = offline_queue[0]
            try:
                print(f"[SYNC] Uploading queued alert. Score: {item['score']}")
                # Send to backend
                response = requests.post(f"{BACKEND_URL}/violations/ai-event", json=item, timeout=10)
                if response.status_code == 200:
                    print(f"[SYNC] Upload successful: {response.json()}")
                    offline_queue.pop(0)
                else:
                    print(f"[SYNC] Upload failed: {response.status_code} {response.text}")
            except Exception as e:
                print(f"[SYNC] Error during upload: {e}")
        time.sleep(5)

threading.Thread(target=sync_offline_queue, daemon=True).start()

def camera_loop(url, camera_id):
    print(f"[i] Starting camera loop for {url}")
    cap = cv2.VideoCapture(url)
    
    while True:
        with camera_lock:
            # Check if viewers <= 0 OR heartbeat is stale (> 3 seconds)
            last_hb = active_streams.get(url, {}).get('last_heartbeat', time.time())
            if url not in active_streams or active_streams[url]['viewers'] <= 0 or (time.time() - last_hb > 3.0):
                print(f"[i] Releasing camera for {url}. (Viewers: {active_streams.get(url, {}).get('viewers', 0)}, Stale HB: {time.time() - last_hb > 3.0})")
                cap.release()
                if url in active_streams:
                    del active_streams[url]
                break
                
        success, frame = cap.read()
        if not success:
            time.sleep(0.1)
            continue
            
        results = model(frame, verbose=False)
        person_detected = False
        highest_conf = 0
        px1, py1, px2, py2 = 0, 0, 0, 0
        
        for result in results:
            for box in result.boxes:
                conf = float(box.conf[0])
                label = model.names[int(box.cls[0])]
                if conf > 0.5 and label == "person":
                    person_detected = True
                    highest_conf = conf
                    px1, py1, px2, py2 = map(int, box.xyxy[0])

        missing_ppes = []
        if person_detected:
            risk_score = 75 # Hardcoded high risk for demo without PPE
            # Simulate missing PPE for demonstration
            missing_ppes = ["Helmet", "Vest", "Gloves", "Shoes"]
            status = "High Risk"
            cv2.rectangle(frame, (px1, py1), (px2, py2), (0, 0, 255), 3)
            
            # Draw missing PPE text in red
            y_offset = py1 - 10 if py1 - 10 > 10 else py1 + 20
            cv2.putText(frame, "Missing: Helmet, Vest, Gloves, Shoes", (px1, y_offset), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        else:
            risk_score, status = calculate_risk(person_detected, [])
        
        if person_detected:
            cv2.putText(frame, f"RISK: {status} ({risk_score})", (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
        else:
            cv2.putText(frame, "STATUS: SAFE", (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 3)

        ret, buffer = cv2.imencode('.jpg', frame)
        
        with camera_lock:
            if ret:
                active_streams[url]['latest_frame'] = buffer.tobytes()
            
            # Update stats for frontend polling
            active_streams[url]['stats'] = {
                "person": person_detected,
                "helmet": not person_detected, # True if no person (safe), False if person (missing)
                "vest": not person_detected,
                "gloves": not person_detected,
                "shoes": not person_detected,
                "confidence": int(highest_conf * 100),
                "risk_score": risk_score,
                "status": status,
                "fps": 30 # placeholder
            }
            last_alert_time = active_streams[url].get('last_alert', 0)
            
        if risk_score >= 40 and (time.time() - last_alert_time > 10):
            with camera_lock:
                active_streams[url]['last_alert'] = time.time()
                
            base64_img = base64.b64encode(buffer.tobytes()).decode('utf-8')
            offline_queue.append({
                "timestamp": time.time(),
                "missing": ", ".join(missing_ppes),
                "score": risk_score,
                "image": f"data:image/jpeg;base64,{base64_img}",
                "camera_id": camera_id,
                "worker_id": "Unknown",
                "worker_name": "Unknown"
            })
            print(f"[EDGE] High risk detected on {url}. Queued for upload.")

        # Cap processing FPS
        time.sleep(0.03)

async def generate_frames(request: Request, url: str):
    try:
        while True:
            if await request.is_disconnected():
                break
            with camera_lock:
                frame = active_streams.get(url, {}).get('latest_frame')
            if frame:
                yield (b'--frame\r\n Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            await asyncio.sleep(0.05)
    finally:
        with camera_lock:
            if url in active_streams:
                active_streams[url]['viewers'] -= 1

@app.get("/video_feed")
async def video_feed(request: Request, url: str = 0, camera_id: str = "Unknown"):
    if str(url) == "0":
        url = int(0)
    
    with camera_lock:
        if url not in active_streams:
            active_streams[url] = {
                'viewers': 1, 
                'latest_frame': None, 
                'last_alert': 0,
                'last_heartbeat': time.time(),
                'stats': {
                    "person": False, "helmet": True, "vest": True, 
                    "gloves": True, "shoes": True,
                    "confidence": 0, "risk_score": 0, "status": "Safe", "fps": 0
                }
            }
            threading.Thread(target=camera_loop, args=(url, camera_id), daemon=True).start()
        else:
            active_streams[url]['viewers'] += 1

    return StreamingResponse(generate_frames(request, url), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/status")
def get_camera_status(url: str = 0):
    if str(url) == "0":
        url = int(0)
    
    with camera_lock:
        if url in active_streams:
            # Update heartbeat
            active_streams[url]['last_heartbeat'] = time.time()
            return active_streams[url].get('stats', {})
    
    return {
        "person": False, "helmet": True, "vest": True, 
        "gloves": True, "shoes": True,
        "confidence": 0, "risk_score": 0, "status": "Offline", "fps": 0
    }

@app.post("/process_frame")
async def process_frame(data: FrameData):
    # Decode base64 image
    img_data = base64.b64decode(data.image.split(',')[1] if ',' in data.image else data.image)
    np_arr = np.frombuffer(img_data, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    
    results = model(frame, verbose=False)
    person_detected = False
    missing_ppes = ["Helmet", "Vest"]
    
    for result in results:
        for box in result.boxes:
            conf = float(box.conf[0])
            label = model.names[int(box.cls[0])]
            if conf > data.confidence_threshold and label == "person":
                person_detected = True

    risk_score, status = calculate_risk(person_detected, missing_ppes if person_detected else [])
    
    if risk_score >= 40:
        # We got a violation
        offline_queue.append({
            "timestamp": data.timestamp,
            "missing": ", ".join(missing_ppes),
            "score": risk_score,
            "image": data.image,
            "camera_id": data.camera_id,
            "worker_id": "Unknown",
            "worker_name": "Unknown"
        })
        return {"status": "violation_logged"}
        
    return {"status": "safe"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
