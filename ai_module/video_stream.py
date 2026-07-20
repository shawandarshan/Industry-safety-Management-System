import cv2
import time
import requests
import os
import argparse
from detector import PPEDetector

# Ensure output directory exists for snapshots
os.makedirs("snapshots", exist_ok=True)

BACKEND_URL = "http://localhost:8000/violations/"
CAMERA_ID = 1

def send_alert(missing_ppe, image_path):
    """
    Sends a POST request to the backend with the violation details.
    """
    payload = {
        "camera_id": CAMERA_ID,
        "missing_ppe": ",".join(missing_ppe),
        "image_path": image_path
    }
    try:
        response = requests.post(BACKEND_URL, json=payload)
        if response.status_code == 200:
            print(f"[!] Violation reported to backend: {payload['missing_ppe']}")
        else:
            print(f"[-] Failed to report to backend: {response.status_code}")
    except Exception as e:
        print(f"[-] Error connecting to backend: {e}")

def main(source):
    cap = cv2.VideoCapture(source)
    detector = PPEDetector("yolov8n.pt") # Ensure ultralytics downloads this or use your custom .pt
    
    # To prevent spamming alerts for the same person, we can implement a cooldown
    last_alert_time = 0
    cooldown_seconds = 10 

    print("[i] Starting video stream...")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[!] End of video stream.")
            break
            
        persons, ppes = detector.detect(frame)
        violations = detector.check_compliance(persons, ppes)
        
        # Draw bounding boxes for persons and PPE
        for person in persons:
            x1, y1, x2, y2 = person["bbox"]
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(frame, "Person", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
            
        # Draw violation alerts on frame
        for violation in violations:
            px1, py1, px2, py2 = violation["person_bbox"]
            missing_str = ", ".join(violation["missing"])
            cv2.rectangle(frame, (px1, py1), (px2, py2), (0, 0, 255), 3) # Red box for violation
            cv2.putText(frame, f"MISSING: {missing_str}", (px1, py1 - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            # Send alert (with cooldown)
            current_time = time.time()
            if current_time - last_alert_time > cooldown_seconds:
                # Save snapshot
                image_name = f"violation_{int(current_time)}.jpg"
                image_path = os.path.join("snapshots", image_name)
                cv2.imwrite(image_path, frame)
                
                send_alert(violation["missing"], image_path)
                last_alert_time = current_time

        cv2.imshow("AI Safety Monitor", frame)
        
        # Press 'q' to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Safety Video Stream")
    parser.add_argument("--source", default=0, help="Video source: 0 for webcam, or path to video file")
    args = parser.parse_args()
    
    source = int(args.source) if str(args.source).isdigit() else args.source
    main(source)
