# Temperature Recording System - Setup Guide

## Overview

This system provides a complete bridge between your hardware temperature sensors (Arduino/ESP32) and the cloud database. Temperature data is recorded while keeping pH, EC level, CO2 level, and NDVI value constant.

## Architecture

```
Hardware Sensor (DS18B20)
         ↓
   ESP32/Arduino
         ↓
   WiFi Connection
         ↓
Supabase Edge Function (/api/data)
         ↓
Supabase PostgreSQL Database
         ↓
React Frontend (Real-time Display)
```

## Components

### 1. Backend API Endpoint
**File:** `supabase/functions/record-temperature/index.ts`

Supabase Edge Function that receives temperature data and stores it in the database with constant values for other parameters.

**Endpoint:** `https://your-project.supabase.co/functions/v1/record-temperature`

**Method:** POST

**Request Body:**
```json
{
  "temperature": 25.5,
  "user_id": "your-user-id",
  "sensor_id": "sensor_001",
  "timestamp": "2025-11-21T12:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Temperature recorded successfully",
  "data": {
    "id": "uuid",
    "user_id": "your-user-id",
    "temperature": 25.5,
    "ph_level": 6.5,
    "ec_level": 1.2,
    "co2_level": 400.0,
    "ndvi_value": 0.5,
    "recorded_at": "2025-11-21T12:30:00Z",
    "created_at": "2025-11-21T12:30:00Z"
  }
}
```

### 2. Temperature Service (Bridge)
**File:** `src/services/temperatureService.ts`

TypeScript service that provides:
- `recordTemperature()` - Record temperature locally
- `sendTemperatureToAPI()` - Send to API endpoint
- `getLatestTemperatures()` - Fetch recent readings
- `getTemperatureStats()` - Get statistics for a period
- `subscribeToTemperatureChanges()` - Real-time updates via WebSocket

### 3. Arduino/ESP32 Firmware
**File:** `Water-sensor/sensor.ino`

Updated firmware that:
- Reads temperature from DS18B20 sensor
- Connects to WiFi
- Sends data to the API endpoint
- Handles reconnection and error cases

### 4. Frontend Component
**File:** `src/components/TemperatureMonitor.tsx`

React component that displays:
- Current temperature with color coding
- Today's statistics (avg, min, max)
- Sensor status
- Recent readings (last 10)

## Setup Instructions

### Step 1: Update Arduino Firmware

Edit `Water-sensor/sensor.ino` and update:

```cpp
// WiFi Configuration
const char* ssid = "YOUR_SSID";           
const char* password = "YOUR_PASSWORD";   

// API Configuration
const char* apiEndpoint = "https://your-project.supabase.co/functions/v1/record-temperature";
const char* apiKey = "YOUR_SUPABASE_ANON_KEY";
const char* userId = "YOUR_USER_ID";
```

**How to get these values:**

1. **SSID & Password:** Your WiFi network credentials
2. **apiEndpoint:** From Supabase project settings (Project URL)
3. **apiKey:** From Supabase settings → API
4. **userId:** From Supabase auth users or create a default system user

### Step 2: Deploy Supabase Edge Function

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Deploy the function
supabase functions deploy record-temperature

# Test the function
curl -X POST https://your-project.supabase.co/functions/v1/record-temperature \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 25.5,
    "user_id": "your-user-id",
    "sensor_id": "test_sensor"
  }'
```

### Step 3: Set Environment Variables (Optional)

In Supabase dashboard, set function secrets:

```
DEFAULT_USER_ID = "your-default-user-id"
```

### Step 4: Integrate TemperatureMonitor Component

In your dashboard or page:

```tsx
import TemperatureMonitor from "@/components/TemperatureMonitor";

export default function Dashboard() {
  return (
    <div>
      <h1>Farm Dashboard</h1>
      <TemperatureMonitor />
    </div>
  );
}
```

### Step 5: Upload Firmware to ESP32/Arduino

1. Install required libraries in Arduino IDE:
   - OneWire
   - DallasTemperature
   - ArduinoJson (for JSON handling)

2. Select board and COM port
3. Upload the sketch
4. Open Serial Monitor to verify connection

## Constant Values

The following values are kept constant for all readings:

```typescript
ph_level: 6.5         // Neutral pH (adjustable)
ec_level: 1.2         // Standard EC level (adjustable)
co2_level: 400.0      // Atmospheric CO2 (adjustable)
ndvi_value: 0.5       // Neutral NDVI (adjustable)
```

To change these, edit `src/services/temperatureService.ts`:

```typescript
const DEFAULT_CONSTANTS = {
  ph_level: 6.5,
  ec_level: 1.2,
  co2_level: 400.0,
  ndvi_value: 0.5,
};
```

## API Endpoints

### Record Temperature
**POST** `/api/data` (via Supabase Edge Function)

### Get Temperature History
**GET** `/farming_data?order=recorded_at.desc&limit=100`

(Use Supabase REST API directly or the service functions)

### Real-time Subscriptions

Subscribe to changes:

```typescript
import { subscribeToTemperatureChanges } from "@/services/temperatureService";

const unsubscribe = subscribeToTemperatureChanges((data) => {
  console.log("New temperature:", data.temperature);
});

// Cleanup
unsubscribe();
```

## Testing

### Manual API Test

```bash
curl -X POST https://your-project.supabase.co/functions/v1/record-temperature \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 23.5,
    "user_id": "test-user-id",
    "sensor_id": "test-sensor"
  }'
```

### Arduino Serial Monitor

After uploading firmware, you should see:

```
========== Hydroponic Temperature Sensor ==========
DS18B20 Temperature Sensor + WiFi Integration
====================================================

[SENSOR] Temperature sensor initialized
[WiFi] Connecting to SSID: YOUR_SSID
.....
[WiFi] ✓ Connected!
[WiFi] IP Address: 192.168.1.100
[WiFi] Signal Strength: -45 dBm

[SENSOR] Temperature: 25.5°C
[API] Sending to: https://your-project.supabase.co/functions/v1/record-temperature
[API] Payload: {"temperature":25.5,"user_id":"...","sensor_id":"ESP32_TEMP_SENSOR_001"}
[API] ✓ Success (HTTP 201)
```

## Troubleshooting

### Arduino won't connect to WiFi
- Check SSID and password
- Verify WiFi router is broadcasting (2.4GHz)
- Check signal strength (RSSI)

### API returns 400 error
- Verify temperature is a valid number
- Check user_id is correct
- Ensure temperature is in valid range (-50 to 150°C)

### No data showing in dashboard
- Check Supabase RLS policies allow data insertion
- Verify user_id exists in profiles table
- Check browser console for errors

### Real-time updates not working
- Verify WebSocket connection in Supabase
- Check RLS policies on farming_data table
- Ensure subscription filter is correct

## Database Schema

The data is stored in the `farming_data` table:

```sql
CREATE TABLE public.farming_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  temperature DECIMAL(5,2),
  ph_level DECIMAL(4,2),
  ec_level DECIMAL(6,2),
  co2_level DECIMAL(6,2),
  ndvi_value DECIMAL(4,3),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Production Deployment

### On Vercel (Frontend)

```bash
npm run build
vercel --prod
```

### Supabase Functions

```bash
supabase functions deploy record-temperature --project-ref your-project-ref
```

## Security Considerations

1. **API Key:** Keep your API key secure. Use environment variables.
2. **RLS Policies:** Set up Row Level Security to prevent unauthorized data access
3. **Rate Limiting:** Consider implementing rate limiting for API endpoint
4. **Authentication:** Require valid Bearer token for API calls

## Next Steps

- [ ] Deploy Edge Function to production
- [ ] Upload firmware to ESP32
- [ ] Configure WiFi and API credentials
- [ ] Add TemperatureMonitor component to dashboard
- [ ] Test end-to-end data flow
- [ ] Set up alerts for temperature thresholds
- [ ] Add data export functionality
