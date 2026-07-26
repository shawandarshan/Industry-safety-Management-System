import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Cloudinary
cloudinary.config(
  cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
  api_key = os.getenv('CLOUDINARY_API_KEY'),
  api_secret = os.getenv('CLOUDINARY_API_SECRET')
)

def upload_base64_image(base64_string):
    try:
        response = cloudinary.uploader.upload(base64_string, folder="safetyhub_violations")
        return response.get('secure_url')
    except Exception as e:
        print(f"[!] Error uploading to Cloudinary: {e}")
        return None
