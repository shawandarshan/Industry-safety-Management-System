#!/bin/bash

echo "Starting Backend Server..."
cd backend
# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

echo "Starting Frontend Server..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Both servers are running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both servers."

# Wait for any process to exit
wait $BACKEND_PID
wait $FRONTEND_PID
