import subprocess
import os
from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/camera",
    tags=["Camera"]
)

# Global reference to hold the subprocess
camera_process = None

@router.post("/start")
def start_camera():
    global camera_process
    
    if camera_process is not None and camera_process.poll() is None:
        return {"message": "Camera is already running", "status": "running"}

    ai_module_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ai_module"))
    
    # Path to the virtual environment python in ai_module
    venv_python = os.path.join(ai_module_dir, "venv", "bin", "python")
    
    if not os.path.exists(venv_python):
        # Fallback to system python if venv not found
        venv_python = "python"
        
    try:
        camera_process = subprocess.Popen(
            [venv_python, "stream_server.py"],
            cwd=ai_module_dir
        )
        return {"message": "Camera started", "status": "running"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start camera: {str(e)}")

@router.post("/stop")
def stop_camera():
    global camera_process
    if camera_process is None or camera_process.poll() is not None:
        return {"message": "Camera is not running", "status": "stopped"}
        
    camera_process.terminate()
    try:
        camera_process.wait(timeout=3)
    except subprocess.TimeoutExpired:
        camera_process.kill()
        
    camera_process = None
    return {"message": "Camera stopped", "status": "stopped"}
