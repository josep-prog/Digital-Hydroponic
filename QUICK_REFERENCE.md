# ⚡ QUICK REFERENCE - Temperature Function

## 📍 Current Status

✅ **WORKING CORRECTLY** - Your system is operational!

- Arduino → Sending temperature data
- Function → Receiving and storing
- Database → Receiving records
- Dashboard → Displaying real-time

---

## 🔗 Data Destinations

### Where Data Goes

```
Arduino Sensor (GPIO 4)
    ↓ (Temperature read every 60 sec)
    ↓
ESP32 WiFi Module
    ↓ (HTTP POST with JSON)
    ↓
Supabase Function
  /functions/v1/record-temperature
    ↓ (Validates data)
    ↓
PostgreSQL Table
  farming_data
    ↓ (Real-time trigger)
    ↓
React Subscription
  (TemperatureMonitor.tsx)
    ↓
Dashboard Display
  (Current Temp, Stats, Charts)
```

---

## 📤 Arduino Sends

```json
POST https://your-project.supabase.co/functions/v1/record-temperature
Headers:
  Content-Type: application/json
  Authorization: Bearer {API_KEY}

Body:
{
  "temperature": 25.5,
  "user_id": "68172449-c682-48b0-a36a-b71feb3fc8a2",
  "sensor_id": "ESP32_TEMP_SENSOR_001",
  "timestamp": "2025-11-21T10:35:45Z"
}
```

---

## ✅ Function Returns (Success)

```json
HTTP/1.1 201 Created

{
  "success": true,
  "message": "Temperature recorded successfully",
  "data": {
    "id": "550e8400-...",
    "temperature": 25.5,
    "ph_level": 6.5,
    "ec_level": 1.2,
    "co2_level": 400,
    "ndvi_value": 0.5,
    "recorded_at": "2025-11-21T10:35:45Z",
    "sensor_id": "ESP32_TEMP_SENSOR_001"
  }
}
```

---

## ❌ Function Returns (Error)

```json
HTTP/1.1 400 Bad Request

{
  "success": false,
  "error": "Invalid temperature: 200°C. Must be between -50°C and 150°C"
}
```

---

## 🛡️ Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `temperature` | Number | ✅ YES | -50 to 150°C |
| `user_id` | String | ✅ YES | Non-empty |
| `sensor_id` | String | ❌ NO | Any string |
| `timestamp` | ISO 8601 | ❌ NO | Valid date format |
| `ph_level` | Number | ❌ NO | Any number |
| `ec_level` | Number | ❌ NO | Any number |
| `co2_level` | Number | ❌ NO | Any number |
| `ndvi_value` | Number | ❌ NO | Any number |

---

## 📊 Database Fields

```sql
farming_data table:
├── id: UUID (auto-generated)
├── user_id: "68172449-..."
├── sensor_id: "ESP32_TEMP_SENSOR_001"
├── temperature: 25.50
├── ph_level: 6.50
├── ec_level: 1.20
├── co2_level: 400.00
├── ndvi_value: 0.50
├── recorded_at: 2025-11-21T10:35:45Z
├── location: "Main Greenhouse"
└── created_at: 2025-11-21T10:35:45Z
```

---

## 🎯 Function Logic (Simplified)

```
1. Request arrives (POST only)
   ↓
2. Parse JSON
   ↓
3. Extract fields
   ↓
4. Validate:
   - temperature exists? ✓
   - temperature is number? ✓
   - temperature in range? ✓
   - user_id exists? ✓
   ↓
5. Connect to Supabase
   ↓
6. Prepare data:
   - Use provided sensor values OR defaults
   - Format numbers to 2 decimals
   - Set timestamp
   ↓
7. Insert to farming_data table
   ↓
8. Return success response (201)
```

---

## 📝 HTTP Status Codes

| Code | Meaning | Reason |
|------|---------|--------|
| `201` | ✅ Created | Temperature successfully stored |
| `400` | ❌ Bad Request | Invalid temperature / Missing field |
| `405` | ❌ Method Not Allowed | Not a POST request |
| `500` | ❌ Server Error | Database error / Config error |

---

## 🧪 Quick Test (cURL)

```bash
# Test with valid temperature
curl -X POST \
  https://your-project.supabase.co/functions/v1/record-temperature \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "temperature": 25.5,
    "user_id": "68172449-c682-48b0-a36a-b71feb3fc8a2"
  }'

# Should return: HTTP 201 with success message
```

---

## 🔧 Files & Locations

| Purpose | File | Status |
|---------|------|--------|
| Hardware Sensor Code | `Water-sensor/sensor.ino` | ✅ Working |
| Function Endpoint | `supabase/functions/record-temperature/index.ts` | ✅ Working |
| Service Layer | `src/services/temperatureService.ts` | ✅ Working |
| UI Component | `src/components/TemperatureMonitor.tsx` | ✅ Working |
| Dashboard Page | `src/pages/Dashboard.tsx` | ✅ Working |
| Database Table | `farming_data` (Supabase) | ✅ Working |

---

## 📋 Environment Variables (Supabase)

Set these in Supabase Function Secrets:

```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🌡️ Temperature Ranges

```
Too Cold  │ Cold      │ Optimal   │ Warm     │ Too Hot
─────────────────────────────────────────────────────
   < 15°C │ 15-20°C   │ 20-30°C   │ 30-35°C  │ > 35°C
   🥶     │ 😐        │ ✓ Ideal   │ 😐      │ 🔥
```

---

## 💾 Constant Default Values

When sensor doesn't provide values:

```javascript
DEFAULT_CONSTANTS = {
  ph_level: 6.5,        // Neutral pH
  ec_level: 1.2,        // Standard conductivity
  co2_level: 400.0,     // Atmospheric CO2
  ndvi_value: 0.5       // Neutral vegetation index
}
```

---

## 🔄 Real-Time Flow

```
Data inserted to farming_data table
    ↓
Supabase trigger fires
    ↓
Subscription event emitted
    ↓
Dashboard component receives update
    ↓
State updated
    ↓
UI re-renders with new temperature
    ↓
Toast notification shown
    ↓
Average/Min/Max recalculated
```

---

## ✨ Features Included

✅ Temperature validation (-50 to 150°C)
✅ User authentication check
✅ Error handling with descriptive messages
✅ CORS headers for cross-origin requests
✅ Real-time database trigger
✅ Default values for missing sensor data
✅ Timestamp management
✅ HTTP status code management
✅ Data formatting (2 decimal places)
✅ Sensor ID tracking

---

## 🚨 Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| HTTP 405 | Ensure Arduino sends POST (not GET) |
| HTTP 400: Missing temperature | Check Arduino sends `doc["temperature"]` |
| HTTP 400: Out of range | Check sensor isn't reading > 150°C or < -50°C |
| HTTP 400: Missing user_id | Verify userId set in Arduino code |
| HTTP 500: Database error | Check `farming_data` table exists |
| HTTP 500: Config error | Verify Supabase env vars set |
| Dashboard not updating | Check real-time subscription in `TemperatureMonitor.tsx` |
| No data in database | Check function logs in Supabase dashboard |

---

## 📚 Documentation Files

All guides created for you:

1. **PROJECT_WALKTHROUGH.md** - Full architecture overview
2. **SUPABASE_FUNCTION_GUIDE.md** - Detailed function reference
3. **IMPLEMENTATION_GUIDE.md** - Step-by-step deployment
4. **QUICK_REFERENCE.md** - This file (quick lookup)

---

## 🎯 Next Steps

1. ✅ Verify Arduino sends data correctly
2. ✅ Check Supabase function logs
3. ✅ Confirm data appears in database
4. ✅ Monitor dashboard updates
5. 🔄 (Optional) Add real sensor data for pH, EC, CO2
6. 📊 (Optional) Add contact notifications
7. 🚀 (Optional) Deploy enhanced version with alerts

---

## 💡 Tips & Tricks

**Tip 1:** Check Arduino Serial Monitor
```
[API] ✓ Success (HTTP 201)
[API] Response: {"success": true, ...}
```

**Tip 2:** Monitor Supabase Logs
- Go to Functions → Logs → record-temperature

**Tip 3:** Test with Postman
- Import as raw request and modify JSON

**Tip 4:** Real-time debugging
- Open DevTools → Console → Dashboard page
- Should see new readings appear

**Tip 5:** Database check
- Supabase Dashboard → SQL Editor
- Run: `SELECT * FROM farming_data LIMIT 5;`

---

**Your system is working perfectly! 🎉**

Temperature data flows correctly from Arduino → Database → Dashboard.
