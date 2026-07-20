# Viva Questions: AI-Based Industry Safety Management System

**1. What is the main objective of this project?**
**Answer:** The main objective is to automate the monitoring of industrial workers to ensure they are wearing appropriate Personal Protective Equipment (PPE) such as helmets, vests, and masks using AI and Computer Vision.

**2. Which algorithm is used for Object Detection in this project and why?**
**Answer:** We used the YOLO (You Only Look Once) model (specifically YOLOv8/v11). It is chosen because it offers an excellent balance between high accuracy and real-time inference speed, which is crucial for processing live video feeds.

**3. What is the difference between Image Classification and Object Detection?**
**Answer:** Image Classification assigns a single label to an entire image (e.g., "Helmet"). Object Detection not only classifies multiple objects within the image but also provides their location using bounding boxes (e.g., drawing a box around the helmet and the person).

**4. How does the system handle multiple cameras?**
**Answer:** The AI module is designed to process streams simultaneously (or in a multi-threaded manner). Each camera is registered in the database with a unique ID, and any violation detected is logged against that specific camera ID.

**5. What is FastAPI and why was it used instead of Flask or Django?**
**Answer:** FastAPI is a modern, fast web framework for building APIs with Python. It is used because of its extremely high performance (built on Starlette), native support for asynchronous programming (`asyncio`), and automatic API documentation generation (Swagger UI).

**6. How do you integrate the Python AI model with the React Frontend?**
**Answer:** The Python AI model communicates with the FastAPI backend via HTTP POST requests to send violation data. The React frontend then communicates with the FastAPI backend via REST API (HTTP GET requests) to fetch and display this data.

**7. What database did you use and how is the schema structured?**
**Answer:** We used SQLite/PostgreSQL. The core tables include `Users` (for dashboard access), `Cameras`, and `Violations` (which stores the timestamp, camera_id, list of missing PPE, and the path to the snapshot image).

**8. What is 'Intersection over Union' (IoU) in the context of object detection?**
**Answer:** IoU is an evaluation metric used to measure the accuracy of an object detector on a particular dataset. It calculates the overlap between the predicted bounding box and the ground truth bounding box.

**9. How do you handle false positives (e.g., the system thinks a worker is missing a helmet, but they actually have one)?**
**Answer:** False positives can be reduced by setting a higher confidence threshold for the YOLO predictions, augmenting the training dataset with diverse lighting and angles, and fine-tuning the model on specific factory environments.

**10. How would you scale this system for a factory with 1000+ cameras?**
**Answer:** To scale, we would deploy the AI inference module on edge devices (like NVIDIA Jetson) near the cameras to process video locally. Only the violation metadata and snapshots would be sent to a central cloud server, minimizing bandwidth and central processing load. The backend could be scaled using Kubernetes and load balancers.
