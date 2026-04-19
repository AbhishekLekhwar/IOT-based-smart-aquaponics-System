# 📱 Twilio SMS Alert Setup Guide

Complete guide to configure SMS alerts for your Aquaponics system using Twilio.

---

## 🎯 Overview

Your aquaponics system will automatically send SMS messages to your phone when:
- **Water temperature** goes out of range
- **pH level** becomes too acidic or alkaline  
- **Water level** drops critically low
- **Humidity** is too high or too low

---

## 📋 Prerequisites

1. **Twilio Account** (free trial available with $15 credit)
2. **Phone Number** to receive alerts
3. **Backend Running** on port 5000
4. **Access to Dashboard** at http://localhost:3000

---

## 🚀 Step 1: Create Twilio Account

### 1.1 Sign Up
1. Go to [Twilio Console](https://www.twilio.com/console)
2. Click "Sign Up"
3. Provide your details and verify email
4. Accept Terms of Service

### 1.2 Get Trial Credentials
1. After signup, you'll see the **Dashboard**
2. Find these values:
   - **Account SID** - Located under "Account Info"
   - **Auth Token** - Located under "Account Info" 
   - **Twilio Phone Number** - Displayed on dashboard (e.g., +1-XXXXXXXXXX)

✅ **Note**: Free trial includes $15 credit (enough for ~50-100 SMS)

---

## 🔑 Step 2: Get Your Credentials

### 2.1 From Twilio Console:

```
Account SID:    ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token:     your_auth_token_here
Phone Number:   +1xxxxxxxxxx
```

### 2.2 Your Phone Number (To Receive Alerts)

Format: `+1` + country code + area code + number

Examples:
- US: `+12125551234`
- UK: `+442071838750`
- India: `+919876543210`
- Canada: `+14165551234`

---

## ⚙️ Step 3: Configure Backend

### 3.1 Update `.env` File

Edit `backend/.env` and add your credentials:

```env
# 📱 Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# SMS Alert Settings
SMS_ALERTS_ENABLED=false  # Will be enabled in next step
DEFAULT_ALERT_PHONE=+your_phone_number_here
ALERT_COOLDOWN_MINUTES=15
DAILY_ALERT_LIMIT=50
```

### 3.2 Restart Backend

```bash
# Stop backend if running (Ctrl+C)

# Restart with new config
cd backend
npm start
```

Expected output:
```
✅ MongoDB Connected: localhost
🌱 AquaMonitor Server → http://localhost:5000
🔌 WebSocket Server ready on /ws
```

---

## 🎬 Step 4: Enable SMS Alerts via Dashboard

### 4.1 Open Dashboard
```
http://localhost:3000
```

### 4.2 Login
- Email: `admin@aquamonitor.local`
- Password: `aqua1234`

### 4.3 Go to Settings → Alert Configuration

**Path**: Dashboard → Settings → Alert Settings

### 4.4 Configure SMS Alerts

#### Option A: Via Dashboard UI (When ready)
1. Click "Enable SMS Alerts"
2. Enter your phone number
3. Set alert preferences:
   - ✅ Critical alerts
   - ✅ Warning alerts
   - ⚠️ Daily limit: 50 SMS
   - ⏱️ Cooldown: 15 minutes between same alert type

#### Option B: Via API (Immediate)

**Enable SMS with phone number:**
```bash
curl -X POST http://localhost:5000/api/alerts/enable-sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "phoneNumber": "+your_phone_number_here",
    "enabled": true
  }'
```

---

## 🧪 Step 5: Test SMS Alerts

### 5.1 Send Test SMS

Via API:
```bash
curl -X POST http://localhost:5000/api/alerts/test-sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "phoneNumber": "+your_phone_number_here"
  }'
```

**Expected**: You should receive SMS within 30 seconds:
```
✅ Aquaponics System SMS Alert Test - Connection successful!
```

### 5.2 Check Phone

If you don't receive SMS:
1. Check phone number format (+1234567890)
2. Verify Twilio credentials in `.env`
3. Check backend logs for errors
4. Verify internet connection

---

## 🌡️ Step 6: Test with Real Data

### 6.1 Generate Demo Sensor Data

```bash
cd aquaponics_v3
node demo_sensor_data.js
```

### 6.2 Trigger Alerts

To generate warning/critical alerts, modify sensor values in `demo_sensor_data.js`:

```javascript
// Change these ranges to trigger alerts:
waterTemperature: 10  // Below 18 = Alert!
waterTemperature: 35  // Above 28 = Alert!
pH: 5.5               // Below 6.0 = Alert!
waterLevel: 15        // Below 20 = Alert!
```

### 6.3 Watch SMS Arrive

You should receive SMS like:
```
⚠️ AQUAPONICS ALERT

Type: waterTemperature
Severity: WARNING
Message: Water temp too low: 10°C

Time: 4/17/2026 3:45:22 PM

Current Status:
• Water Temp: 10°C
• pH: 6.85
• Water Level: 72.1%
• Humidity: 58.3%
```

---

## 📞 API Reference

### Available Alert Endpoints

#### 1. Get Alert Settings
```bash
GET /api/alerts/settings
```

#### 2. Update Alert Settings
```bash
PUT /api/alerts/settings
```

#### 3. Set Phone Number
```bash
POST /api/alerts/phone-number
X-Headers: Authorization, Content-Type: application/json
Body: { "phoneNumber": "+your_number" }
```

#### 4. Enable SMS Alerts
```bash
POST /api/alerts/enable-sms
Body: { 
  "phoneNumber": "+your_number",
  "enabled": true 
}
```

#### 5. Add Additional Recipient
```bash
POST /api/alerts/add-recipient
Body: {
  "name": "Family Member",
  "phoneNumber": "+another_number",
  "alertTypes": ["critical", "warning"]
}
```

#### 6. Remove Recipient
```bash
DELETE /api/alerts/recipient/+phone_number_to_remove
```

#### 7. Get All Recipients
```bash
GET /api/alerts/recipients
```

#### 8. Send Test SMS
```bash
POST /api/alerts/test-sms
Body: { "phoneNumber": "+your_number" }
```

---

## ⚙️ Advanced Configuration

### Alert Cooldown

Prevents alert spam by limiting how often the same alert can be sent:

```bash
PUT /api/alerts/settings
{
  "cooldownMinutes": 30  # Wait 30 mins before sending same alert again
}
```

### Daily Alert Limit

Prevents excessive SMS charges:

```bash
PUT /api/alerts/settings
{
  "dailyAlertLimit": 100  # Maximum 100 SMS per day
}
```

### Alert Filters

Choose which alerts to receive:

```bash
PUT /api/alerts/settings
{
  "alertFilters": {
    "critical": { "enabled": true },   # 🚨 Always get critical
    "warning": { "enabled": true },    # ⚠️ Get warnings
    "info": { "enabled": false }       # Don't get info
  }
}
```

### Multiple Recipients

Add family members or team to receive alerts:

```bash
POST /api/alerts/add-recipient
{
  "name": "Mom",
  "phoneNumber": "+13105551234",
  "alertTypes": ["critical"]  # Only critical alerts
}

POST /api/alerts/add-recipient
{
  "name": "Farm Manager",
  "phoneNumber": "+12015552345",
  "alertTypes": ["critical", "warning"]  # All alerts
}
```

---

## 🚨 Alert Types & Thresholds

### Water Temperature
- **Min**: 18°C (warning if lower)
- **Max**: 28°C (critical if higher)
- **Optimal**: 22-26°C

### pH Level
- **Min**: 6.0 (warning if lower)
- **Max**: 8.0 (warning if higher)
- **Optimal**: 6.8-7.0

### Water Level
- **Min**: 20% (critical if lower)
- **Optimal**: 50-80%

### Humidity
- **Min**: 40% (warning if lower)
- **Max**: 80% (warning if higher)
- **Optimal**: 55-75%

### Room Temperature
- **Min**: 15°C (warning)
- **Max**: 35°C (critical)
- **Optimal**: 20-25°C

---

## 💰 Twilio Pricing

| Item | Cost |
|------|------|
| Outbound SMS (US) | $0.0075 per SMS |
| Outbound SMS (Intl) | $0.01-0.20 per SMS |
| Free Trial Credit | $15 |
| Estimated for 50 SMS | ~$0.38 |

**Example**: $15 credit ≈ 1,000-2,000 SMS!

---

## 🔒 Security Best Practices

1. **Never commit credentials**:
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Rotate Auth Tokens**:
   - Access Twilio Console regularly
   - Generate new tokens every 90 days

3. **Use Environment Variables**:
   - Never hardcode credentials
   - Use `.env` file only locally

4. **Limit Recipients**:
   - Only add trusted phone numbers
   - Review recipients monthly

5. **Monitor SMS Usage**:
   - Check Twilio console for unusual activity
   - Set up billing alerts

---

## 🐛 Troubleshooting

### "Missing pi_name or image_data" Error
- Restart backend: `npm start`
- Check SMS endpoints are registered

### SMS Not Received
**Check:**
1. Phone number format: Must be `+country_code` + number
2. Twilio credentials correct in `.env`
3. SMS alerts enabled via API or dashboard
4. Check alert cooldown (default 15 minutes)
5. Check daily alert limit not exceeded

**Debug:**
```bash
# Test Twilio connection
curl -X POST http://localhost:5000/api/alerts/test-sms \
  -H "Authorization: Bearer TOKEN" \
  -d '{"phoneNumber": "+your_number"}'
```

### Backend Not Starting
```bash
# Check for errors
npm start

# If Twilio errors:
# 1. Verify TWILIO_ACCOUNT_SID format (starts with AC)
# 2. Verify TWILIO_AUTH_TOKEN (64 character string)
# 3. Verify TWILIO_PHONE_NUMBER format (+1234567890)
```

### Too Many Alerts
**Solution:** Increase cooldown or daily limit:
```bash
PUT /api/alerts/settings
{
  "cooldownMinutes": 60,
  "dailyAlertLimit": 20
}
```

---

## ✅ Verification Checklist

- [ ] Twilio account created
- [ ] Account SID copied to `.env`
- [ ] Auth Token copied to `.env`
- [ ] Twilio phone number copied to `.env`
- [ ] Backend restarted
- [ ] Dashboard login working
- [ ] Test SMS received successfully
- [ ] SMS alerts enabled
- [ ] Demo data generates alerts
- [ ] SMS received for warning conditions
- [ ] SMS received for critical conditions

---

## 📚 Additional Resources

- **Twilio Docs**: https://www.twilio.com/docs/sms
- **API Reference**: https://www.twilio.com/docs/sms/send-messages#send-an-sms-message
- **Aquaponics Dashboard**: http://localhost:3000
- **Backend Health**: http://localhost:5000/api/health

---

## 🎉 You're All Set!

Your aquaponics system will now:
- ✅ Monitor sensor data in real-time
- ✅ Send SMS alerts for warning conditions
- ✅ Send critical SMS for serious issues
- ✅ Support multiple recipients
- ✅ Prevent alert spam with cooldowns

**Happy monitoring! 🌱**

---

**Questions or issues?**
1. Check backend logs with `npm start`
2. Verify `.env` file credentials
3. Test SMS endpoint with curl
4. Review troubleshooting section above

