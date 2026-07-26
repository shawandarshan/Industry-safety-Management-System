import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase App
def init_firebase():
    if not firebase_admin._apps:
        # Check if service account file exists, else try default
        cred_path = os.getenv("FIREBASE_CREDENTIALS", "serviceAccountKey.json")
        if os.path.exists(cred_path):
            print(f"[i] Initializing Firebase with {cred_path}")
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            print("[!] No serviceAccountKey.json found. Trying default credentials.")
            try:
                firebase_admin.initialize_app()
            except Exception as e:
                print(f"[!] Firebase Init Error: {e}")

init_firebase()

try:
    db = firestore.client()
except Exception as e:
    db = None
    print(f"[!] Firestore client could not be initialized: {e}")

def get_firestore_db():
    return db
