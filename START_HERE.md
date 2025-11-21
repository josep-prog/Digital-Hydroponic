# ⚡ IMMEDIATE ACTION ITEMS FOR YOUR SUPABASE PROJECT

## Your Supabase URL
```
https://swhtqyopwxzqltclwdqw.supabase.co
```

---

## 🎯 DO THESE 3 THINGS RIGHT NOW

### 1️⃣ GET YOUR USER ID (5 minutes)

**Location**: https://swhtqyopwxzqltclwdqw.supabase.co/auth/users

Steps:
- Go to the link above
- Login if needed
- Find your user in the table
- Copy the **UUID** (looks like: `550e8400-e29b-41d4-a716-446655440000`)
- Save it somewhere safe

**Where you'll use it:**
- Arduino firmware: `const char* userId = "YOUR_USER_ID_HERE";`
- Configuration page: User ID field
- Environment: `VITE_DEFAULT_USER_ID=YOUR_USER_ID_HERE`

---

### 2️⃣ DEPLOY EDGE FUNCTION (3 minutes)

**Command:**
```bash
cd /home/joe/Downloads/Digital-Hydroponic
supabase functions deploy record-temperature
```

**What this does:**
- Creates your API endpoint
- Makes it accessible at: `https://swhtqyopwxzqltclwdqw.supabase.co/functions/v1/record-temperature`
- Enables the bridge to receive temperature data

**Verify:**
- Go to: https://swhtqyopwxzqltclwdqw.supabase.co
- Click: **Functions** (left sidebar)
- Should see: `record-temperature` listed ✅

---

### 3️⃣ UPDATE ARDUINO FIRMWARE (10 minutes)

**File to edit:** `Water-sensor/sensor.ino`

**Find these lines (around line 15-20):**
```cpp
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* apiEndpoint = "...";
const char* apiKey = "...";
const char* userId = "...";
```

**Replace with YOUR values:**
```cpp
// Your WiFi network (2.4GHz only!)
const char* ssid = "Your_WiFi_Name";                    // CHANGE THIS
const char* password = "Your_WiFi_Password";            // CHANGE THIS

// Your API endpoint
const char* apiEndpoint = "https://swhtqyopwxzqltclwdqw.supabase.co/functions/v1/record-temperature";

// Your API key
const char* apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aHRxeW9wd3h6cWx0Y2x3ZHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzY1MzksImV4cCI6MjA3OTI1MjUzOX0.8dv0u0yoOFM2K7nK22cTY_X_la9qdz-kQnocyh9nYmw";

// Your User ID (from step 1)
const char* userId = "YOUR_USER_ID_HERE";              // CHANGE THIS - from step 1
```

**Then:**
1. Connect ESP32 to computer via USB
2. Open Arduino IDE
3. Select Board: **ESP32 Dev Module**
4. Select Port: (your COM port)
5. Click: **Upload**
6. Wait for: "Upload complete"
7. Open Serial Monitor (9600 baud)
8. Should see WiFi connection logs

---

## 🧪 THEN TEST (5 minutes)

### Test Option 1: Configuration Page
```
URL: http://localhost:5173/temperature-configuration

Steps:
1. Enter API endpoint: https://swhtqyopwxzqltclwdqw.supabase.co/functions/v1/record-temperature
2. Enter API key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aHRxeW9wd3h6cWx0Y2x3ZHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzY1MzksImV4cCI6MjA3OTI1MjUzOX0.8dv0u0yoOFM2K7nK22cTY_X_la9qdz-kQnocyh9nYmw
3. Enter User ID: (from step 1)
4. Click: "Validate Configuration"
5. Should see: ✅ All Valid
6. Click: "Record Temperature"
7. Should see: ✅ Success
```

### Test Option 2: Browser Console
Press `F12` in browser, go to Console, paste:
```javascript
temperatureTestUtils.testTemperatureAPI(
  'https://swhtqyopwxzqltclwdqw.supabase.co/functions/v1/record-temperature',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aHRxeW9wd3h6cWx0Y2x3ZHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzY1MzksImV4cCI6MjA3OTI1MjUzOX0.8dv0u0yoOFM2K7nK22cTY_X_la9qdz-kQnocyh9nYmw',
  25.5,
  'YOUR_USER_ID_HERE'
);
```

---

## ✅ VERIFY IT WORKED

### Check 1: Database Records
1. Go to: https://swhtqyopwxzqltclwdqw.supabase.co
2. Click: **Database** → **farming_data**
3. Should see new records with:
   - temperature: (your value)
   - ph_level: 6.5
   - ec_level: 1.2
   - co2_level: 400.0
   - ndvi_value: 0.5

### Check 2: Arduino Serial Monitor
After uploading firmware:
```
[SENSOR] Temperature: 25.5°C
[API] Sending to: https://...
[API] ✓ Success (HTTP 201)
```

### Check 3: Dashboard
Should display real-time temperature in TemperatureMonitor component

---

## 📋 YOUR CREDENTIALS SUMMARY

**Save these for reference:**

```
Project URL:  https://swhtqyopwxzqltclwdqw.supabase.co
API Endpoint: https://swhtqyopwxzqltclwdqw.supabase.co/functions/v1/record-temperature
API Key:      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aHRxeW9wd3h6cWx0Y2x3ZHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzY1MzksImV4cCI6MjA3OTI1MjUzOX0.8dv0u0yoOFM2K7nK22cTY_X_la9qdz-kQnocyh9nYmw
User ID:      (Get from https://swhtqyopwxzqltclwdqw.supabase.co/auth/users)
WiFi SSID:    (Your network name)
WiFi Pass:    (Your password)
```

---

## ⏱️ TIME ESTIMATE

- Get User ID: 5 min
- Deploy Function: 3 min
- Update Arduino: 10 min
- Test: 5 min
- **Total: 23 minutes** ✅

---

## 🆘 COMMON ISSUES

| Issue | Solution |
|-------|----------|
| "Can't find User ID" | Go to https://swhtqyopwxzqltclwdqw.supabase.co/auth/users |
| "Deploy fails" | Check WiFi connection, run: `supabase login` first |
| "Arduino won't connect" | Use 2.4GHz WiFi (not 5GHz), check password |
| "API returns 400" | Verify User ID is correct format (UUID) |
| "No data in database" | Check Arduino serial monitor for errors |

---

## 📞 NEED HELP?

Read in order:
1. **QUICK_SETUP_CARD.txt** (overview)
2. **YOUR_PROJECT_SETUP.md** (detailed steps)
3. **TEMPERATURE_SETUP.md** (complete guide)
4. **TEMPERATURE_QUICKSTART.sh** (quick reference)

---

## ✨ YOU'RE READY!

Everything is set up. Just:
1. Get your User ID
2. Deploy the function
3. Update and upload Arduino
4. Test!

**Start now!** 🚀

---

Last Updated: November 21, 2025
Your Project: swhtqyopwxzqltclwdqw
