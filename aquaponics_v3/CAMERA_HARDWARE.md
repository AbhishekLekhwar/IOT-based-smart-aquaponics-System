# 🔧 Raspberry Pi Camera Hardware Setup

Complete hardware installation guide for aquaponics camera monitoring.

## 📋 Components You'll Need

### Essential
- ✅ Raspberry Pi 3B+ or 4B (Pi 5 recommended)
- ✅ Official Pi Camera Module 3 (12MP)
- ✅ CSI Camera Cable (included with camera)
- ✅ Micro SD Card 64GB+
- ✅ Power Supply 5V 2.5A+
- ✅ WiFi (built-in or USB adapter)

### Optional but Recommended
- 🎯 Pan-Tilt HAT (for positioning)
- 🌙 Infrared Camera Module (for night vision)
- 📦 Weather-resistant enclosure
- 🔌 UPS (for uninterrupted monitoring)

## 🔌 Wiring Diagram

```
Raspberry Pi 3B+/4B
├─ CSI Camera Port
│  └─ Pi Camera Module 3
│     ├─ CSI Ribbon Cable (included)
│     └─ (No extra power needed)
│
├─ GPIO Header (if using Pan-Tilt)
│  ├─ Pin 4  → 5V Power
│  ├─ Pin 6  → Ground
│  ├─ Pin 17 → Servo 1 (Pan)
│  └─ Pin 27 → Servo 2 (Tilt)
│
└─ USB Ports
   ├─ USB-A → Power Adapter (5V 2.5A+)
   ├─ USB-A → WiFi Adapter (if not built-in)
   └─ USB-A → USB Camera (alternative to CSI)
```

## 📷 Camera Module Installation

### Step 1: Prepare Raspberry Pi

```bash
# Power down and unplug
sudo shutdown -h now
```

**Safety**: Never insert/remove cables with power connected.

### Step 2: Locate CSI Port

On Raspberry Pi 3B+ and 4B, the CSI port is:
- Located between GPIO header and HDMI ports
- Blue plastic connector
- Black ribbon slot on top

### Step 3: Insert Camera Cable

1. **Lift the black clip** on CSI port (it will pop up)
2. **Gently slide ribbon** into slot (shiny side facing HDMI)
3. **Push clip down** until it clicks (cable is secured)

**Proper insertion**:
```
Front view of CSI Port:
┌──────────────┐
│ [Blue Clip]  │  ← Pull UP to open
│ ═════════╪   │  ← Ribbon slides in here
└──────────────┘
    ↓ Should look like:
┌──────────────┐
│ ╭─ Clip      │  ← Pushed down (secured)
│ ║ ═════════╪ │  ← Ribbon inside
└──────────────┘
```

### Step 4: Boot and Enable Camera

```bash
# Power on Raspberry Pi
# SSH or connect keyboard/monitor

# Enable camera interface
sudo raspi-config
```

In raspi-config:
1. Select **"3 Interface Options"**
2. Select **"I1 Camera"**
3. Select **"Yes"** to enable
4. Select **"OK"** and exit
5. **Reboot when prompted**

### Step 5: Test Camera

```bash
# After reboot, test camera
libcamera-hello --duration 3000

# Should show camera preview for 3 seconds
# Press Ctrl+C to exit
```

If successful: **Camera is working!** ✓

## 📦 Physical Mounting

### Tank-Side Installation

**Goal**: Position camera to monitor aquaponics system

```
        Water Surface
            ↓
    ┌──────────┬──────────┐
    │   Tank   │          │
    │ ┌─────┐  │  Camera  │ ← Mount on side
    │ │Fish │  │   (Pi)   │
    │ └─────┘  │          │
    └──────────┴──────────┘
        ↓
    Grow Bed Below
```

### Mount Options

**1. Wall Mount (Recommended)**
```bash
# Pi case with tripod mount
# Position: 60-90cm away, 30-45° downward angle
# Focus: Good view of tank water level and plants
```

**2. Pan-Tilt Mount (Advanced)**
```bash
# Servo-controlled positioning
# Components: Pan-Tilt HAT + 2 servo motors
# Benefit: Adjust view remotely from dashboard
```

**3. Submerged Housing (Advanced)**
```bash
# Waterproof case for underwater monitoring
# Warning: Water exposure requires careful waterproofing
# Recommended: Professional grade housing only
```

## 🌡️ Environmental Considerations

### Temperature Range
- **Operating**: 0°C to 50°C (camera module)
- **Recommended**: 5°C to 35°C
- **Problem**: Condensation above 80% humidity + temperature drop

### Humidity Management

```
Issue: Condensation on lens
Solution: 
  ├─ Use silica gel packs nearby
  ├─ Mount in ventilated enclosure
  ├─ Use hydrophobic lens coating
  └─ Check lens weekly
```

### Waterproofing (if needed)

**Option 1: Protective Case**
```bash
# Use transparent acrylic box
# Ensures: Dust protection + some water resistance
# Air circulation: Via ventilation holes with mesh
```

**Option 2: Professional Housing**
```bash
# Rated IP67 or higher
# Includes: Lens port, cable gland, gaskets
# Cost: $50-150
```

## 🔋 Power Management

### Standard Setup (Powered)
```
┌─────────────────┐
│  5V Power       │
│  Supply         │
│  2.5A+          │
└────────┬────────┘
         │ Micro-USB
         ↓
    ┌─────────┐
    │   Pi    │ ← Always on
    │ Camera  │
    └─────────┘
```

### Battery Backup (Optional)

```bash
# If you want Pi to keep recording on power outage:

# UPS HAT Solution:
#  ├─ PowerBoost 1000C Hat
#  ├─ Lithium battery (hot-swap capable)
#  └─ Auto-switch on AC loss
#
# Battery duration: ~8-12 hours at full service
```

## 📡 Network Setup

### WiFi Connection

```bash
# Edit WiFi config
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf

# Add network
network={
    ssid="YourWiFiName"
    psk="YourPassword"
    key_mgmt=WPA-PSK
}

# Save and reboot
sudo reboot
```

### Network Performance

**For best results:**
- WiFi signal strength: > -60 dBm
- Bandwidth: 5 Mbps minimum (at default settings)
- Latency: < 50ms to backend

**Check connection:**
```bash
iwconfig wlan0
# Look for: Signal level=-30 dBm (strong)
```

## 🌙 Night Vision Setup (Optional)

### Infrared Camera Module

```bash
# Install Pi NoIR (infrared-sensitive) camera
# Same installation as regular camera

# Add infrared illuminator:
#  ├─ 850nm or 940nm LEDs
#  ├─ Mount around camera
#  └─ Connect to GPIO pin with resistor
```

### GPIO Control Script

```python
# Enable IR LED when dark
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT)  # Pin 17 for IR LED

while True:
    # Check light level
    light_level = analogRead(pin)  # (requires ADC)
    
    if light_level < 30:  # Dark
        GPIO.output(17, GPIO.HIGH)   # IR on
    else:
        GPIO.output(17, GPIO.LOW)    # IR off
    
    time.sleep(5)
```

## ✅ Verification Checklist

- [ ] CSI cable properly inserted (no gaps)
- [ ] Camera module sits flush against CSI port
- [ ] Pi boots without errors, no rainbow screen
- [ ] `libcamera-hello` shows preview
- [ ] WiFi connected and ping backend
- [ ] No water/moisture on lens
- [ ] Temperature in range (5-35°C)
- [ ] Power supply adequate (5V, 2.5A+)
- [ ] Camera service Python runs without errors
- [ ] Images appearing in dashboard

## 🔧 Troubleshooting Hardware

### Camera Not Detected

```bash
# Check if camera is recognized
vcgencmd get_camera
# Should output: supported=1 detected=1

# If detected=0:
# ├─ Reseat ribbon cable
# ├─ Try different CSI cable
# └─ Check for damage on Pi board
```

### "Cannot open /dev/video0"

```bash
# Check camera device exists
ls -l /dev/video0

# If missing:
# ├─ Camera may not be enabled in raspi-config
# ├─ Or CSI port issue
# └─ Reboot required after enabling
```

### Blurry Images

```bash
# Focus adjustment
libcamera-jpeg -o test.jpg --focus manual --lens-position 0.5

# Try different focus positions (0.0 to 1.0)
# 0.0 = infinity focus
# 1.0 = macro (close-up)
# Adjust in camera_service.py:

# Add to camera init:
# camera.set_controls({
#     controls.AutoFocus: 0,
#     controls.LensPosition: 0.5
# })
```

### Overheating (Camera Too Hot)

```bash
# Check temperature
vcgencmd measure_temp

# If > 80°C (under 50% load):
# ├─ Reduce resolution
# ├─ Increase capture interval (5s → 10s)
# ├─ Add heatsink to SoC
# └─ Improve ventilation
```

## 📚 Additional Resources

- [Official Pi Camera Guide](https://www.raspberrypi.com/documentation/accessories/camera.html)
- [libcamera Documentation](https://libcamera.org/)
- [Raspberry Pi Hardware](https://www.raspberrypi.com/products/)
- [Pi NoIR for Night Vision](https://www.raspberrypi.com/products/pi-noir-camera-v2/)

## 🎓 Next Steps

1. ✅ Install camera hardware
2. ✅ Enable camera interface
3. ✅ Verify with `libcamera-hello`
4. ✅ Set up WiFi connection
5. → **Install and run camera service**: [CAMERA_QUICK_START.md](./CAMERA_QUICK_START.md)
