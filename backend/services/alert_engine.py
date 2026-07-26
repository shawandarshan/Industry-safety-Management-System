from datetime import datetime
from utils.firebase_client import get_firestore_db
from utils.ws_manager import manager

class AlertEngine:
    def __init__(self):
        self.db = get_firestore_db()
        self.recent_alerts = []
    
    async def trigger_alert(self, worker_id: str, alert_type: str, description: str, score: int):
        """
        Triggers an alert when predictive conditions are met.
        """
        alert_data = {
            "worker_id": worker_id,
            "type": alert_type,
            "description": description,
            "score": score,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "active"
        }
        
        # 1. Save to Firebase
        if self.db:
            try:
                self.db.collection("Alerts").add(alert_data)
            except Exception as e:
                print(f"[!] Error saving alert to Firestore: {e}")
                
        # 2. Broadcast via WebSocket
        await manager.broadcast_json({
            "event": "NEW_ALERT",
            "data": alert_data
        })
        
        print(f"[ALERT] {alert_type}: {description} (Score: {score})")
        return alert_data

alert_engine = AlertEngine()
