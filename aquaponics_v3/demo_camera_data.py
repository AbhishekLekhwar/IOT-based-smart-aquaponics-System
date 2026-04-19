#!/usr/bin/env python3

"""
🌱 Aquaponics Demo Image Generator

Generates demo images and posts them to the backend camera API
Usage: python demo_camera_data.py
"""

import requests
import base64
import io
from datetime import datetime
import time
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("❌ PIL not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont

BACKEND_URL = 'http://localhost:5000/api'
PI_NAME = 'demo-pi-camera-01'

def generate_demo_image(iteration=0):
    """Generate a realistic-looking demo aquaponics image"""
    
    # Create image with gradient background
    width, height = 640, 480
    image = Image.new('RGB', (width, height), color=(20, 60, 100))  # Dark blue
    draw = ImageDraw.Draw(image)
    
    # Draw some "water" effect
    for i in range(0, height, 40):
        opacity = 30 + (i % 80)
        draw.line([(0, i), (width, i + 10)], fill=(30, 100, 150), width=2)
    
    # Add some "fish" or tank elements
    draw.ellipse([(50 + iteration*5, 100), (100 + iteration*5, 150)], fill=(255, 150, 0))  # Fish
    draw.ellipse([(400, 350), (450, 380)], fill=(100, 200, 50))  # Plant
    
    # Add camera info overlay
    info_text = f"""
🎥 Aquaponics Tank #{(iteration % 3) + 1}
Time: {datetime.now().strftime('%H:%M:%S')}
Frame: {iteration}
Temperature: {24 + iteration * 0.1:.1f}°C
pH: {6.8 + (iteration % 10) * 0.05:.2f}
Water Level: {65 + (iteration % 20)}%
    """.strip()
    
    # Draw text
    try:
        # Try to use a better font
        font = ImageFont.truetype("arial.ttf", 14)
    except:
        font = ImageFont.load_default()
    
    # Text background
    draw.rectangle([(10, 10), (300, 180)], fill=(0, 0, 0, 200))
    
    # Draw text
    draw.multiline_text((20, 20), info_text, fill=(0, 255, 0), font=font)
    
    # Add timestamp
    draw.text((width - 200, height - 40), f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 
              fill=(200, 200, 200), font=font)
    
    return image

def image_to_base64(image):
    """Convert PIL image to base64 string"""
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG", quality=85)
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return img_str

def send_camera_image(image_data):
    """POST image to backend camera endpoint"""
    
    payload = {
        'pi_name': PI_NAME,
        'image_data': image_data,
        'resolution': '640x480',
        'image_type': 'jpeg',
        'timestamp': datetime.now().isoformat()
    }
    
    try:
        response = requests.post(
            f'{BACKEND_URL}/camera/snapshot',
            json=payload,
            timeout=10,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code in [200, 201]:
            return True, response.json()
        else:
            return False, f"Status {response.status_code}: {response.text}"
    except Exception as e:
        return False, str(e)

def run_demo():
    """Generate and send 5 demo images"""
    
    print("""
╔════════════════════════════════════════════════════════════╗
║      🌱 Aquaponics Demo Camera Image Generator v1.0       ║
╚════════════════════════════════════════════════════════════╝

Generating 5 demo images...
Target: http://localhost:5000/api/camera/snapshot
    """)
    
    success_count = 0
    fail_count = 0
    
    for i in range(5):
        try:
            print(f"\n📸 Generating image #{i + 1}...")
            
            # Generate image
            image = generate_demo_image(i)
            image_b64 = image_to_base64(image)
            
            # Send to backend
            print(f"  Uploading to backend...")
            success, response = send_camera_image(image_b64)
            
            if success:
                print(f"  ✓ Uploaded successfully")
                print(f"  Image ID: {response.get('data', {}).get('_id', 'N/A')}")
                print(f"  Size: {len(image_b64) / 1024:.1f} KB")
                success_count += 1
            else:
                print(f"  ✗ Failed: {response}")
                fail_count += 1
            
            # Wait 3 seconds between uploads
            if i < 4:
                time.sleep(3)
                
        except Exception as e:
            print(f"  ✗ Error: {e}")
            fail_count += 1
    
    print(f"""
╔════════════════════════════════════════════════════════════╗
║                      Results                              ║
╚════════════════════════════════════════════════════════════╝
✓ Success: {success_count}
✗ Failed:  {fail_count}

📷 Check your dashboard at: http://localhost:3000/camera
   Camera images should appear in real-time
    """)

if __name__ == '__main__':
    try:
        run_demo()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)
