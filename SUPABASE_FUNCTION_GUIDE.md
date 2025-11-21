# Supabase Function - Temperature Data Handler Guide

## 📋 Overview

This is your **Deno-based Supabase Edge Function** that receives temperature data from your Arduino sensor and stores it in the PostgreSQL database.

---

## 🔄 Complete Request/Response Flow

### 1️⃣ Arduino Sends Data (HTTP POST)

```
Arduino (ESP32)
    ↓
POST /functions/v1/record-temperature
Content-Type: application/json
Authorization: Bearer {ANON_KEY}

{
  "temperature": 25.5,
  "user_id": "68172449-c682-48b0-a36a-b71feb3fc8a2",
  "sensor_id": "ESP32_TEMP_SENSOR_001",
  "timestamp": "2025-11-21T10:35:45Z",
  "location": "Main Greenhouse",
  "ph_level": 6.5,           // Optional: real sensor value
  "ec_level": 1.2,           // Optional: real sensor value
  "co2_level": 400,          // Optional: real sensor value
  "ndvi_value": 0.5          // Optional: real sensor value
}
```

### 2️⃣ Function Receives & Validates

```typescript
Supabase Function receives request
  ↓
1. Check HTTP method (POST only)
2. Parse JSON body
3. Extract and validate fields:
   - temperature (required, number, -50 to 150°C)
   - user_id (required, non-empty string)
   - sensor_id (optional, defaults to "ESP32_DEFAULT")
   - timestamp (optional, uses current time)
   - ph_level, ec_level, co2_level, ndvi_value (optional)
4. Initialize Supabase client
5. Prepare data with defaults for missing values
```

### 3️⃣ Function Inserts into Database

```typescript
const dataToInsert = {
  user_id: "68172449-c682-48b0-a36a-b71feb3fc8a2",
  sensor_id: "ESP32_TEMP_SENSOR_001",
  temperature: 25.50,
  ph_level: 6.50,
  ec_level: 1.20,
  co2_level: 400.00,
  ndvi_value: 0.50,
  recorded_at: "2025-11-21T10:35:45.000Z",
  location: "Main Greenhouse"
}

INSERT INTO farming_data (
  user_id, sensor_id, temperature, 
  ph_level, ec_level, co2_level, ndvi_value, 
  recorded_at, location
) VALUES (...)
RETURNING *;
```

### 4️⃣ Function Returns Success Response

```json
{
  "success": true,
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "temperature": 25.50,
  "ph_level": 6.50,
  "ec_level": 1.20,
  "co2_level": 400.00,
  "ndvi_value": 0.50,
  "recorded_at": "2025-11-21T10:35:45.000Z",
  "sensor_id": "ESP32_TEMP_SENSOR_001",
  "user_id": "68172449-c682-48b0-a36a-b71feb3fc8a2",
  "message": "Temperature recorded successfully",
  "timestamp": "2025-11-21T10:35:45.123Z"
}
```

---

## 📊 Database Table Schema

### Table: `farming_data`

```sql
CREATE TABLE farming_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  sensor_id VARCHAR(255) DEFAULT 'ESP32_DEFAULT',
  temperature NUMERIC(5,2) NOT NULL,
  ph_level NUMERIC(4,2),
  ec_level NUMERIC(5,2),
  co2_level NUMERIC(7,2),
  ndvi_value NUMERIC(4,2),
  location VARCHAR(255) DEFAULT 'Main Greenhouse',
  recorded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_farming_data_user_id ON farming_data(user_id);
CREATE INDEX idx_farming_data_recorded_at ON farming_data(recorded_at DESC);
CREATE INDEX idx_farming_data_sensor_id ON farming_data(sensor_id);
```

---

## 🛡️ Validation Rules

### Temperature Validation
- **Type:** Number (not string)
- **Range:** -50°C to 150°C
- **Required:** YES
- **Error:** Returns 400 if invalid

### User ID Validation
- **Type:** Non-empty string
- **Required:** YES
- **Format:** UUID (recommended)
- **Error:** Returns 400 if missing/invalid

### Sensor ID Validation
- **Type:** String
- **Required:** NO
- **Default:** "ESP32_DEFAULT"
- **Error:** Returns 400 if not string

### Timestamp Validation
- **Type:** ISO 8601 format string
- **Required:** NO
- **Default:** Current time
- **Example:** "2025-11-21T10:35:45Z"
- **Error:** Uses current time if invalid

---

## ✅ Success Response (HTTP 201)

```json
{
  "success": true,
  "id": "uuid-of-inserted-record",
  "temperature": 25.50,
  "ph_level": 6.50,
  "ec_level": 1.20,
  "co2_level": 400.00,
  "ndvi_value": 0.50,
  "recorded_at": "2025-11-21T10:35:45.000Z",
  "sensor_id": "ESP32_TEMP_SENSOR_001",
  "user_id": "68172449-c682-48b0-a36a-b71feb3fc8a2",
  "message": "Temperature recorded successfully",
  "timestamp": "2025-11-21T10:35:45.123Z"
}
```

---

## ❌ Error Responses

### 400 Bad Request - Invalid JSON
```json
{
  "success": false,
  "error": "Invalid JSON format. Ensure body is valid JSON",
  "timestamp": "2025-11-21T10:35:45.123Z"
}
```

### 400 Bad Request - Missing Temperature
```json
{
  "success": false,
  "error": "Missing required field: temperature",
  "timestamp": "2025-11-21T10:35:45.123Z"
}
```

### 400 Bad Request - Temperature Out of Range
```json
{
  "success": false,
  "error": "Temperature out of valid range. Must be between -50°C and 150°C. Got: 200°C",
  "timestamp": "2025-11-21T10:35:45.123Z"
}
```

### 400 Bad Request - Missing User ID
```json
{
  "success": false,
  "error": "Missing required field: user_id",
  "timestamp": "2025-11-21T10:35:45.123Z"
}
```

### 405 Method Not Allowed
```json
{
  "success": false,
  "error": "Method not allowed. Only POST requests are supported",
  "timestamp": "2025-11-21T10:35:45.123Z"
}
```

### 500 Server Error - Database Error
```json
{
  "success": false,
  "error": "Database error: duplicate key value violates unique constraint",
  "timestamp": "2025-11-21T10:35:45.123Z"
}
```

### 500 Server Error - Missing Configuration
```json
{
  "success": false,
  "error": "Server configuration error. Check Supabase credentials",
  "timestamp": "2025-11-21T10:35:45.123Z"
}
```

---

## 🧪 Testing with cURL

### Basic Test - Minimal Fields
```bash
curl -X POST https://your-project.supabase.co/functions/v1/record-temperature \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "temperature": 25.5,
    "user_id": "68172449-c682-48b0-a36a-b71feb3fc8a2"
  }'
```

### Advanced Test - All Fields
```bash
curl -X POST https://your-project.supabase.co/functions/v1/record-temperature \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "temperature": 25.5,
    "user_id": "68172449-c682-48b0-a36a-b71feb3fc8a2",
    "sensor_id": "ESP32_TEMP_SENSOR_001",
    "timestamp": "2025-11-21T10:35:45Z",
    "location": "Main Greenhouse",
    "ph_level": 6.5,
    "ec_level": 1.2,
    "co2_level": 400,
    "ndvi_value": 0.5
  }'
```

### Test - Invalid Temperature
```bash
curl -X POST https://your-project.supabase.co/functions/v1/record-temperature \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "temperature": 999,
    "user_id": "68172449-c682-48b0-a36a-b71feb3fc8a2"
  }'
# Expected: 400 error - "Temperature out of valid range"
```

---

## 🔌 Arduino Integration Example

### Updated Arduino Code (sensor.ino)

The Arduino sends data like this:

```cpp
void recordTemperature() {
  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);

  if (temperature == DEVICE_DISCONNECTED_C) {
    Serial.println("[SENSOR] Error: Could not read temperature");
    return;
  }

  Serial.print("[SENSOR] Temperature: ");
  Serial.print(temperature);
  Serial.println("°C");

  if (WiFi.status() == WL_CONNECTED) {
    sendTemperatureToAPI(temperature);
  }
}

void sendTemperatureToAPI(float temperature) {
  HTTPClient http;
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["temperature"] = temperature;
  doc["user_id"] = userId;
  doc["sensor_id"] = "ESP32_TEMP_SENSOR_001";
  doc["timestamp"] = getFormattedTimestamp();

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // Send to Supabase function
  http.begin(apiEndpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + apiKey);

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode == 201) {
    Serial.println("[API] Success: Temperature recorded");
  } else {
    Serial.print("[API] Error: ");
    Serial.println(http.getString());
  }

  http.end();
}
```

---

## 📝 Complete Function Code (Current)

Your `supabase/functions/record-temperature/index.ts` is **already implemented correctly**. 

Key features:
- ✅ Validates all required fields
- ✅ Checks temperature range (-50 to 150°C)
- ✅ Inserts into correct table (farming_data)
- ✅ Handles errors gracefully
- ✅ Returns proper HTTP status codes
- ✅ Uses Supabase client correctly

The function **IS working**. If you're getting errors, check:

1. **Database table exists** with correct schema
2. **Supabase credentials** are correct (SUPABASE_URL, SUPABASE_ANON_KEY)
3. **Firewall/Network** allows outbound to Supabase
4. **JSON payload format** matches expected schema

---

## 🚀 Enhanced Version Features

An **enhanced version** (`index-enhanced.ts`) includes:

✨ **Additional Features:**
- Temperature warning thresholds (< 15°C or > 35°C)
- Alert system in response
- Better logging for debugging
- Support for real sensor values (pH, EC, CO2, NDVI)
- Location field support
- More detailed error messages
- Helper functions for cleaner code

**Use the enhanced version if you want:**
- Temperature alerts
- Better error messages
- Real sensor data support
- Detailed logging

---

## 🔧 Deployment Steps

### 1. Update Function Code
```bash
# From project root
cp supabase/functions/record-temperature/index-enhanced.ts \
   supabase/functions/record-temperature/index.ts
```

### 2. Deploy to Supabase
```bash
supabase functions deploy record-temperature
```

### 3. Verify Deployment
```bash
curl https://your-project.supabase.co/functions/v1/record-temperature \
  -X OPTIONS \
  -H "Access-Control-Request-Method: POST"
```

### 4. Test with Arduino Data
Check Arduino serial monitor for:
- `[API] ✓ Success (HTTP 201)`
- `[API] Response: {"success": true, ...}`

---

## 📍 Common Issues & Solutions

### Issue: "Method not allowed"
**Cause:** Sending GET/PUT/DELETE instead of POST
**Solution:** Ensure Arduino sends POST request

### Issue: "Missing required field: temperature"
**Cause:** JSON payload missing temperature key
**Solution:** Check Arduino code sends `doc["temperature"] = temperature`

### Issue: "Temperature out of valid range"
**Cause:** Sensor reading > 150°C or < -50°C
**Solution:** Check sensor is working correctly

### Issue: "Missing required field: user_id"
**Cause:** Arduino code missing user_id
**Solution:** Verify userId is set in Arduino code

### Issue: Database error - "relation farming_data does not exist"
**Cause:** Table not created in Supabase
**Solution:** Create table using schema.sql from repo

### Issue: "Server configuration error"
**Cause:** Supabase environment variables not set
**Solution:** Check Function secrets in Supabase dashboard

---

## ✅ Verification Checklist

- [ ] Database table `farming_data` exists
- [ ] Supabase function `record-temperature` deployed
- [ ] Arduino WiFi connected
- [ ] API endpoint correct in Arduino code
- [ ] User ID matches your Supabase user ID
- [ ] Testing with cURL returns 201 status
- [ ] Data appears in farming_data table
- [ ] Dashboard real-time subscription works

---

## 📚 Related Files

- **Arduino Code:** `Water-sensor/sensor.ino`
- **Service Layer:** `src/services/temperatureService.ts`
- **Dashboard Component:** `src/components/TemperatureMonitor.tsx`
- **Data Visualization:** `src/pages/DataVisualization.tsx`
- **Deno Config:** `supabase/functions/record-temperature/deno.json`

---

## 🎯 Summary

Your Supabase function is correctly implemented to:

1. ✅ **Receive** temperature data from Arduino via HTTP POST
2. ✅ **Validate** all fields (temperature range, user_id, etc.)
3. ✅ **Transform** data (add constants, format values)
4. ✅ **Store** data in `farming_data` table
5. ✅ **Return** success/error responses
6. ✅ **Trigger** real-time subscriptions on dashboard

The data flows correctly from Arduino → Supabase → Database → Dashboard → Real-time Display.
