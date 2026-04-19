"""
Raspberry Pi Camera Service
Captures images/video from Raspberry Pi camera and sends to backend over WiFi
Supports both snapshots and video streaming
"""

import asyncio
import aiohttp
import time
import os
import json
import base64
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Try to import camera libraries - graceful fallback for development
try:
    from picamera2 import Picamera2
    from libcamera import controls
    HAS_PICAMERA = True
except ImportError:
    HAS_PICAMERA = False
    print("⚠️  PiCamera2 not available - using demo mode")

load_dotenv()

# Configuration
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')
CAMERA_INTERVAL = int(os.getenv('CAMERA_INTERVAL', '5'))  # Snapshot every N seconds
CAMERA_RESOLUTION = os.getenv('CAMERA_RESOLUTION', '640x480')
CAMERA_QUALITY = int(os.getenv('CAMERA_QUALITY', '85'))
ENABLE_VIDEO_STREAM = os.getenv('ENABLE_VIDEO_STREAM', 'true').lower() == 'true'
PI_NAME = os.getenv('PI_NAME', 'aquaponics-pi-1')
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'


class CameraService:
    """Manages Raspberry Pi camera and image transmission"""
    
    def __init__(self):
        self.camera = None
        self.last_snapshot_time = 0
        self.running = False
        self.config = self.load_config()
        
    def load_config(self) -> dict:
        """Load camera configuration"""
        width, height = map(int, CAMERA_RESOLUTION.split('x'))
        return {
            'width': width,
            'height': height,
            'quality': CAMERA_QUALITY,
            'interval': CAMERA_INTERVAL,
            'pi_name': PI_NAME,
            'enable_video': ENABLE_VIDEO_STREAM
        }
    
    def initialize_camera(self) -> bool:
        """Initialize Raspberry Pi camera"""
        if not HAS_PICAMERA:
            print("✓ Running in demo mode (no actual camera)")
            return True
            
        try:
            self.camera = Picamera2()
            config = self.camera.create_preview_configuration(
                main={"format": 'RGB888', "size": (self.config['width'], self.config['height'])}
            )
            self.camera.configure(config)
            self.camera.start()
            
            # Set camera controls
            self.camera.set_controls({
                controls.FrameRate: 30,
                controls.Brightness: 0,
                controls.Contrast: 1.0
            })
            
            print(f"✓ Camera initialized: {self.config['width']}x{self.config['height']}")
            return True
            
        except Exception as e:
            print(f"✗ Camera initialization failed: {e}")
            return False
    
    def capture_snapshot(self) -> bytes:
        """Capture a single frame from camera"""
        try:
            if HAS_PICAMERA and self.camera:
                # Capture from actual camera
                array = self.camera.capture_array()
                # Convert to JPEG (simplified - in production use proper JPEG encoding)
                import cv2
                _, buffer = cv2.imencode('.jpg', array, [cv2.IMWRITE_JPEG_QUALITY, self.config['quality']])
                return buffer.tobytes()
            else:
                # Demo mode: generate placeholder image
                return self.generate_demo_image()
                
        except Exception as e:
            print(f"✗ Snapshot capture failed: {e}")
            return None
    
    def generate_demo_image(self) -> bytes:
        """Generate a demo image when camera not available"""
        try:
            import cv2
            import numpy as np
            
            # Create a simple colored image with text
            img = np.zeros((self.config['height'], self.config['width'], 3), dtype=np.uint8)
            
            # Blue background
            img[:] = (100, 150, 200)
            
            # Add timestamp text
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cv2.putText(img, timestamp, (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 
                       1.2, (255, 255, 255), 2)
            cv2.putText(img, f"Demo: {PI_NAME}", (50, 150), cv2.FONT_HERSHEY_SIMPLEX,
                       0.8, (200, 255, 200), 2)
            
            # Encode to JPEG
            _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 95])
            return buffer.tobytes()
            
        except ImportError:
            # Fallback if cv2 not available - return minimal JPEG
            return b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00\x43\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xf6\x00\x01\xff\xd9'
    
    async def send_snapshot_to_backend(self, image_bytes: bytes) -> bool:
        """Send captured image to backend API"""
        if not image_bytes:
            return False
            
        try:
            # Encode image as base64 for JSON transmission
            image_b64 = base64.b64encode(image_bytes).decode('utf-8')
            
            payload = {
                'pi_name': self.config['pi_name'],
                'timestamp': datetime.now().isoformat(),
                'image_data': image_b64,
                'resolution': CAMERA_RESOLUTION,
                'image_type': 'jpeg'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f'{BACKEND_URL}/api/camera/snapshot',
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        if DEBUG:
                            print(f"✓ Snapshot sent: {len(image_bytes)} bytes")
                        return True
                    else:
                        error = await response.text()
                        print(f"✗ Backend error: {response.status} - {error}")
                        return False
                        
        except asyncio.TimeoutError:
            print("✗ Request timeout sending snapshot")
            return False
        except Exception as e:
            print(f"✗ Failed to send snapshot: {e}")
            return False
    
    async def video_stream_generator(self):
        """Generate MJPEG stream for real-time viewing"""
        try:
            if not HAS_PICAMERA:
                # Demo mode: send dummy frames
                while self.running:
                    image = self.generate_demo_image()
                    if image:
                        yield b'--frame\r\nContent-Type: image/jpeg\r\n'
                        yield b'Content-Length: ' + str(len(image)).encode() + b'\r\n\r\n'
                        yield image + b'\r\n'
                    await asyncio.sleep(0.1)
            else:
                while self.running:
                    frame = self.camera.capture_array()
                    import cv2
                    _, buffer = cv2.imencode('.jpg', frame)
                    yield b'--frame\r\nContent-Type: image/jpeg\r\n'
                    yield b'Content-Length: ' + str(len(buffer)).encode() + b'\r\n\r\n'
                    yield bytes(buffer) + b'\r\n'
                    await asyncio.sleep(0.033)  # ~30 FPS
                    
        except Exception as e:
            print(f"✗ Video stream error: {e}")
    
    async def periodic_snapshots(self):
        """Periodically capture and send snapshots"""
        print(f"🎥 Starting periodic snapshots (every {self.config['interval']}s)")
        
        while self.running:
            try:
                current_time = time.time()
                
                # Capture and send snapshot
                if current_time - self.last_snapshot_time >= self.config['interval']:
                    snapshot = self.capture_snapshot()
                    if snapshot:
                        await self.send_snapshot_to_backend(snapshot)
                        self.last_snapshot_time = current_time
                
                await asyncio.sleep(1)
                
            except Exception as e:
                print(f"✗ Snapshot loop error: {e}")
                await asyncio.sleep(5)
    
    async def start(self):
        """Start camera service"""
        print("🎥 Raspberry Pi Camera Service Starting...")
        print(f"   Backend URL: {BACKEND_URL}")
        print(f"   PI Name: {PI_NAME}")
        print(f"   Resolution: {CAMERA_RESOLUTION}")
        print(f"   Config: {json.dumps(self.config, indent=2)}")
        
        if not self.initialize_camera():
            print("✗ Camera initialization failed")
            return False
        
        self.running = True
        
        # Start periodic snapshot task
        try:
            await self.periodic_snapshots()
        except KeyboardInterrupt:
            print("\n🛑 Service stopped by user")
        finally:
            self.stop()
            return True
    
    def stop(self):
        """Stop camera service"""
        self.running = False
        if self.camera and HAS_PICAMERA:
            self.camera.stop()
        print("✓ Camera service stopped")


async def main():
    """Main entry point"""
    service = CameraService()
    await service.start()


if __name__ == '__main__':
    asyncio.run(main())
