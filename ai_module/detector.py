from ultralytics import YOLO
import cv2

class PPEDetector:
    def __init__(self, model_path="yolov8n.pt"): # Using a base model for demonstration
        # In a real scenario, this would be a YOLO model trained on a PPE dataset
        # with classes like: 0: Person, 1: Helmet, 2: Vest, 3: Mask, 4: Gloves, 5: Shoes
        self.model = YOLO(model_path)
        
        # Mapping generic COCO classes for mock demonstration
        # 0: person in COCO
        self.person_class_id = 0
        
        # MOCK SETUP: In a real custom PPE model, these would be the specific class IDs
        # Here we pretend class 1, 2, 3 are our PPE items if we had a custom model
        self.ppe_classes = {
            1: "Helmet",
            2: "Vest",
            3: "Mask",
            4: "Gloves",
            5: "Shoes"
        }
        
    def detect(self, frame):
        """
        Runs YOLO inference on a frame and returns detections.
        """
        results = self.model(frame, verbose=False)[0]
        
        persons = []
        ppes = []
        
        for box in results.boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            
            if cls_id == self.person_class_id:
                persons.append({
                    "bbox": (x1, y1, x2, y2),
                    "conf": conf
                })
            elif cls_id in self.ppe_classes:
                ppes.append({
                    "bbox": (x1, y1, x2, y2),
                    "conf": conf,
                    "type": self.ppe_classes[cls_id]
                })
                
        return persons, ppes

    def check_compliance(self, persons, ppes):
        """
        Checks which persons are missing which PPE.
        """
        # A simple IoU (Intersection over Union) or bounding box containment check
        # can be done here. For simplicity in this demo, we assume if PPE is detected
        # inside the person's bounding box, they are wearing it.
        
        violations = []
        required_ppe = ["Helmet", "Vest", "Mask"] # Define what is mandatory
        
        for person in persons:
            px1, py1, px2, py2 = person["bbox"]
            worn_ppe = set()
            
            for ppe in ppes:
                ex1, ey1, ex2, ey2 = ppe["bbox"]
                # Check if PPE box is roughly inside the Person box
                if ex1 >= px1 and ey1 >= py1 and ex2 <= px2 and ey2 <= py2:
                    worn_ppe.add(ppe["type"])
                    
            missing = [item for item in required_ppe if item not in worn_ppe]
            
            if missing:
                violations.append({
                    "person_bbox": person["bbox"],
                    "missing": missing
                })
                
        return violations
