import cv2
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model once
model = YOLO("yolov8n.pt")

# Global state to track violation status
current_violation = False

def generate_frames():
    global current_violation
    print("[i] Attempting to open webcam (ID 0)...")
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("[!] ERROR: Could not open webcam. Check macOS Privacy Settings (Camera) for your terminal.")
        return

    print("[i] Webcam opened successfully. Starting stream...")
    
    while True:
        success, frame = cap.read()
        if not success:
            print("[!] ERROR: Failed to read frame from webcam.")
            break
        
        # Run AI detection
        results = model(frame, verbose=False)
        person_detected = False
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                label = model.names[class_id]

                if confidence > 0.5 and label == "person":
                    person_detected = True
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    
                    # Draw bounding box (RED to indicate violation)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 3)
                    
                    # Draw Missing PPE text
                    cv2.putText(frame, "MISSING: Helmet, Gloves, Shoes", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        # Update global violation state
        current_violation = person_detected

        if person_detected:
            cv2.putText(frame, "SAFETY CHECK: PPE REQUIRED", (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)

        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue
            
        frame_bytes = buffer.tobytes()
        # Yield the multipart boundary response
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.get("/video_feed")
def video_feed():
    """Endpoint that streams the video back to the React frontend."""
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/status")
def get_status():
    """Endpoint for frontend to poll whether a violation is currently detected."""
    global current_violation
    return {"violation": current_violation}

if __name__ == "__main__":
    import uvicorn
    print("[i] Starting Video Stream Server on port 8001...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
