import cv2
from fastapi import FastAPI, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import base64
import time
import threading
import asyncio

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

# Camera management
cap = None
active_viewers = 0
camera_lock = threading.Lock()
latest_frame = None

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
                offline_queue.pop(0)
            except Exception as e:
                pass
        time.sleep(5)

threading.Thread(target=sync_offline_queue, daemon=True).start()

def camera_loop():
    global cap, latest_frame, current_state, active_viewers
    last_alert_time = 0
    
    while True:
        with camera_lock:
            viewers = active_viewers
            
        if viewers == 0:
            if cap is not None:
                print("[i] No viewers. Releasing camera.")
                cap.release()
                cap = None
            time.sleep(1)
            continue
            
        if cap is None:
            print("[i] Viewer connected. Opening camera.")
            cap = cv2.VideoCapture(0)
            
        success, frame = cap.read()
        if not success:
            time.sleep(0.1)
            continue
            
        results = model(frame, verbose=False)
        person_detected = False
        missing_ppes = ["Helmet", "Vest"]
        
        for result in results:
            for box in result.boxes:
                conf = float(box.conf[0])
                label = model.names[int(box.cls[0])]
                if conf > 0.5 and label == "person":
                    person_detected = True
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 3)
                    cv2.putText(frame, f"MISSING: {', '.join(missing_ppes)}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        risk_score, status = calculate_risk(person_detected, missing_ppes if person_detected else [])
        current_state = {
            "violation": person_detected,
            "risk_score": risk_score,
            "status": status
        }

        if person_detected:
            cv2.putText(frame, f"RISK: {status} ({risk_score})", (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
        else:
            cv2.putText(frame, "STATUS: SAFE", (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 3)

        ret, buffer = cv2.imencode('.jpg', frame)
        if ret:
            latest_frame = buffer.tobytes()
            
        if risk_score >= 40 and (time.time() - last_alert_time > 10):
            last_alert_time = time.time()
            if latest_frame:
                base64_img = base64.b64encode(latest_frame).decode('utf-8')
                offline_queue.append({
                    "timestamp": time.time(),
                    "missing": ", ".join(missing_ppes),
                    "score": risk_score,
                    "image": f"data:image/jpeg;base64,{base64_img}"
                })
                print(f"[EDGE] High risk detected. Queued for upload.")

# Start camera processing thread
threading.Thread(target=camera_loop, daemon=True).start()

async def generate_frames(request: Request):
    global active_viewers, latest_frame
    with camera_lock:
        active_viewers += 1
    
    try:
        while True:
            if await request.is_disconnected():
                break
            if latest_frame:
                yield (b'--frame\r\n Content-Type: image/jpeg\r\n\r\n' + latest_frame + b'\r\n')
            await asyncio.sleep(0.05)
    finally:
        with camera_lock:
            active_viewers -= 1

@app.get("/video_feed")
async def video_feed(request: Request):
    return StreamingResponse(generate_frames(request), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/status")
def get_status():
    return current_state

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
