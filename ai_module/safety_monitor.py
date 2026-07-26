import cv2
from ultralytics import YOLO

# Load YOLO model
model = YOLO("yolo11s.pt")

# Open laptop camera
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Camera not detected")
    exit()

while True:
    ret, frame = cap.read()

    if not ret:
        break

    # AI Detection
    results = model(frame)

    person_detected = False

    for result in results:
        boxes = result.boxes

        for box in boxes:
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            label = model.names[class_id]

            if confidence > 0.5:
                x1, y1, x2, y2 = map(int, box.xyxy[0])

                # Person detection
                if label == "person":
                    person_detected = True

                    cv2.rectangle(
                        frame,
                        (x1, y1),
                        (x2, y2),
                        (255, 0, 0),
                        2
                    )

                    cv2.putText(
                        frame,
                        f"Worker {confidence:.2f}",
                        (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (255, 0, 0),
                        2
                    )

    # Safety Alert
    if person_detected:
        cv2.putText(
            frame,
            "SAFETY CHECK: PPE REQUIRED",
            (30, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            3
        )

    # Show camera
    cv2.imshow(
        "AI Industry Safety Monitor",
        frame
    )

    # Exit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
