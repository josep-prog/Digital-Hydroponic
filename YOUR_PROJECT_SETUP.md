# 🚀 YOUR PROJECT SETUP GUIDE
## Digital Hydroponic Temperature System
### Supabase Project: swhtqyopwxzqltclwdqw

---

## ✅ Your Configuration

Your Supabase project is already set up:

```
Project URL: https://swhtqyopwxzqltclwdqw.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aHRxeW9wd3h6cWx0Y2x3ZHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzY1MzksImV4cCI6MjA3OTI1MjUzOX0.8dv0u0yoOFM2K7nK22cTY_X_la9qdz-kQnocyh9nYmw
Project ID: swhtqyopwxzqltclwdqw
```

---

## 📋 NEXT STEPS (4 STEPS ONLY)

### Step 1: Get Your User ID from Supabase

1. Go to: https://swhtqyopwxzqltclwdqw.supabase.co
2. Login with your credentials
3. Go to **Authentication** → **Users**
4. Copy your User ID (UUID format)
5. Replace `your-user-id-here` in `.env.temperature.configured`

### Step 2: Deploy Edge Function

Run in terminal:
```bash
cd /home/joe/Downloads/Digital-Hydroponic
supabase functions deploy record-temperature
```

This deploys your API endpoint that acts as the bridge.

### Step 3: Update Arduino Firmware

Edit `Water-sensor/sensor.ino` and update these lines:

```cpp
const char* ssid = "YOUR_WIFI_SSID";              // Your WiFi network
const char* password = "YOUR_WIFI_PASSWORD";      // Your WiFi password

const char* apiEndpoint = "https://swhtqyopwxzqltclwdqw.supabase.co/functions/v1/record-temperature";
const char* apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aHRxeW9wd3h6cWx0Y2x3ZHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzY1MzksImV4cCI6MjA3OTI1MjUzOX0.8dv0u0yoOFM2K7nK22cTY_X_la9qdz-kQnocyh9nYmw";
const char* userId = "your-user-id-here";         // From step 1
```

Then upload to your ESP32/Arduino board.

### Step 4: Test in Dashboard

1. Add component to your dashboard (if not already there):
```tsx
import TemperatureMonitor from "@/components/TemperatureMonitor";

<TemperatureMonitor />
```

2. Navigate to `/temperature-configuration`
3. Enter your API credentials
4. Click "Test" buttons to validate

---

## 🔌 API ENDPOINT DETAILS

Your API endpoint is ready to use:

```
URL: https://swhtqyopwxzqltclwdqw.supabase.co/functions/v1/record-temperature
Method: POST
Auth: Bearer Token (your Anon Key)
```

### Example Request:
```bash
curl -X POST https://swhtqyopwxzqltclwdqw.supabase.co/functions/v1/record-temperature \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aHRxeW9wd3h6cWx0Y2x3ZHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzY1MzksImV4cCI6MjA3OTI1MjUzOX0.8dv0u0yoOFM2K7nK22cTY_X_la9qdz-kQnocyh9nYmw" \
  -d '{
    "temperature": 25.5,
    "user_id": "your-user-id-here",
    "sensor_id": "ESP32_TEMP_SENSOR_001"
  }'
```

---

## 🧪 TEST YOUR SETUP

### Option 1: Browser Console
```javascript
// In your browser F12 console:
temperatureTestUtils.testTemperatureAPI(
  'https://swhtqyopwxzqltclwdqw.supabase.co/functions/v1/record-temperature',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aHRxeW9wd3h6cWx0Y2x3ZHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzY1MzksImV4cCI6MjA3OTI1MjUzOX0.8dv0u0yoOFM2K7nK22cTY_X_la9qdz-kQnocyh9nYmw',
  25.5,
  'your-user-id-here'
);
```

### Option 2: Configuration Page
Visit: `http://localhost:5173/temperature-configuration`
- Enter API endpoint
- Enter API key
- Enter user ID
- Click "Test" buttons

### Option 3: Node.js Script
```bash
node temperature-test.js test-api --temp 25.5
```

---

## 📊 YOUR DATABASE

Your data will be stored in the `farming_data` table:

```
farming_data
├─ temperature: 25.5 (from your sensor)
├─ ph_level: 6.5 (constant)
├─ ec_level: 1.2 (constant)
├─ co2_level: 400.0 (constant)
├─ ndvi_value: 0.5 (constant)
├─ recorded_at: 2025-11-21T12:30:00Z
└─ user_id: your-user-id-here
```

View in Supabase:
1. Go to: https://swhtqyopwxzqltclwdqw.supabase.co
2. Click **Database** → **farming_data**
3. See your temperature records

---

## 📁 YOUR PROJECT STRUCTURE

```
Digital-Hydroponic/
├── .env ← Your existing config (already has Supabase URL!)
├── .env.temperature.configured ← NEW (for reference)
│
├── supabase/functions/record-temperature/
│   └── index.ts ← API Bridge (ready to deploy)
│
├── src/
│   ├── services/temperatureService.ts ← Service layer
│   ├── components/TemperatureMonitor.tsx ← Dashboard display
│   ├── pages/TemperatureConfiguration.tsx ← Setup page
│   └── utils/temperatureTestUtils.ts ← Testing tools
│
├── Water-sensor/
│   └── sensor.ino ← Hardware (needs WiFi credentials)
│
└── Documentation/
    ├── TEMPERATURE_README.md
    ├── TEMPERATURE_SETUP.md
    ├── TEMPERATURE_IMPLEMENTATION.md
    └── TEMPERATURE_VISUAL_GUIDE.md
```

---

## 🎯 YOUR NEXT ACTIONS

### Immediate (Today):
- [ ] Get your User ID from Supabase
- [ ] Deploy Edge Function: `supabase functions deploy record-temperature`
- [ ] Update Arduino firmware with WiFi + API credentials
- [ ] Upload to ESP32/Arduino

### Short Term (This Week):
- [ ] Test API using configuration page
- [ ] Monitor real-time temperature in dashboard
- [ ] Verify data in Supabase database

### Longer Term:
- [ ] Deploy to production
- [ ] Set up monitoring/alerts
- [ ] Create data analysis dashboards

---

## 🆘 TROUBLESHOOTING

### "API returns 400 error"
→ Check that user_id matches a real user in Supabase

### "Temperature not appearing in dashboard"
→ Verify component is added to Dashboard.tsx
→ Check browser console (F12) for errors
→ Verify WebSocket connection is active

### "Arduino won't connect"
→ Check WiFi SSID/password spelling
→ Verify WiFi is 2.4GHz (ESP32 limitation)
→ Check signal strength

### "How do I find my User ID?"
→ Go to: https://swhtqyopwxzqltclwdqw.supabase.co/auth/users
→ Copy your User ID from the list

---

## 📞 QUICK REFERENCE

| Item | Value |
|------|-------|
| **Project URL** | https://swhtqyopwxzqltclwdqw.supabase.co |
| **API Endpoint** | https://swhtqyopwxzqltclwdqw.supabase.co/functions/v1/record-temperature |
| **Project ID** | swhtqyopwxzqltclwdqw |
| **User ID** | *Get from Supabase* |
| **Setup Page** | http://localhost:5173/temperature-configuration |

---

## 📚 DOCUMENTATION

Need more details? Check:
- **TEMPERATURE_README.md** - Overview
- **TEMPERATURE_SETUP.md** - Complete setup guide
- **TEMPERATURE_IMPLEMENTATION.md** - Technical details
- **TEMPERATURE_VISUAL_GUIDE.md** - Visual diagrams

---

## ✅ READY TO GO!

Your Supabase project is all set up. Now just:
1. Get your User ID
2. Deploy Edge Function
3. Update Arduino
4. Test!

You're just a few steps away from having a fully functioning temperature recording system! 🌡️🚀

---

**Date**: November 21, 2025  
**Status**: ✅ Ready for Configuration  
**Next Step**: Get User ID from Supabase
