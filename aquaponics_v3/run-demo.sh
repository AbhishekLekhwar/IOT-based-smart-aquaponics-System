#!/usr/bin/env bash
# 🌱 Aquaponics Demo Runner - Bash Script
# For Linux/macOS systems

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
log() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  $1                                                    ║${NC}" | cut -c1-65
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Header
clear
header "🌱 Aquaponics Complete Demo Runner"

# Check backend
info "Checking backend connectivity..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    log "Backend is running"
else
    error "Backend not accessible at http://localhost:5000. Please start backend first with: cd backend && npm start"
fi

echo ""
echo -e "${YELLOW}⚙️  Demo Configuration:${NC}"
echo "  Backend URL: http://localhost:5000"
echo "  Frontend URL: http://localhost:3000"
echo "  Sensor Demo: 10 readings @ 2-second intervals"
echo "  Camera Demo: 5 images @ 3-second intervals"

echo ""
echo -e "${YELLOW}📺 View Options:${NC}"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Watch sensor cards update in real-time"
echo "  3. Check camera page for generated images"

echo ""
echo -e "${YELLOW}🚀 Starting demos...${NC}"

# Run sensor demo
echo ""
echo -e "${BLUE}📊 Running Sensor Demo${NC}"
echo "═══════════════════════════════════════════════════════════"

node demo_sensor_data.js
if [ $? -ne 0 ]; then
    error "Sensor demo failed"
fi

# Wait before camera demo
echo ""
info "Waiting 2 seconds before camera demo..."
sleep 2

# Run camera demo
echo ""
echo -e "${BLUE}📷 Running Camera Demo${NC}"
echo "═══════════════════════════════════════════════════════════"

if command -v python3 &> /dev/null; then
    python3 demo_camera_data.py
elif command -v python &> /dev/null; then
    python demo_camera_data.py
else
    error "Python not found. Please install Python 3."
fi

if [ $? -ne 0 ]; then
    error "Camera demo failed"
fi

# Success
header "✅ Demo Run Complete!"

echo -e "${GREEN}📊 Sensor Demo Results:${NC}"
echo "  • 10 readings sent successfully"
echo "  • Check dashboard for real-time updates"

echo ""
echo -e "${GREEN}📷 Camera Demo Results:${NC}"
echo "  • 5 images generated and uploaded"
echo "  • Check Camera page to preview"

echo ""
echo -e "${CYAN}🎯 Next Steps:${NC}"
echo "  1. Verify sensor values on dashboard"
echo "  2. Verify camera images on Camera page"
echo "  3. Check alerts page for any triggered alerts"
echo "  4. Review system health status"

echo ""
echo -e "${BLUE}📚 For more information:${NC}"
echo "  • See DEMO_GUIDE.md for detailed instructions"
echo "  • See ESP32_QUICK_START.md for hardware setup"
echo "  • See ARCHITECTURE.md for system overview"
echo ""
