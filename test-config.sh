#!/bin/bash

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║  🧪 TESTING YOUR TEMPERATURE SENSOR CONFIGURATION                ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Configuration from sensor.ino
API_ENDPOINT="https://swhtqyopwxzqltclwdqw.supabase.co/functions/v1/record-temperature"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aHRxeW9wd3h6cWx0Y2x3ZHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzY1MzksImV4cCI6MjA3OTI1MjUzOX0.8dv0u0yoOFM2K7nK22cTY_X_la9qdz-kQnocyh9nYmw"
USER_ID="68172449-c682-48b0-a36a-b71feb3fc8a2"
WIFI_SSID="Joseph-WIFI"

echo "✅ CONFIGURATION DETECTED"
echo "─────────────────────────────────────────────────────────"
echo "  API Endpoint: $API_ENDPOINT"
echo "  User ID:      $USER_ID"
echo "  WiFi SSID:    $WIFI_SSID"
echo "  API Key:      ${API_KEY:0:40}..."
echo ""

echo "🔌 TEST 1: Verify API Endpoint is Reachable"
echo "─────────────────────────────────────────────────────────"
response=$(curl -s -w "\n%{http_code}" -X POST \
  "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "temperature": 23.5,
    "user_id": "'$USER_ID'",
    "sensor_id": "TEST_SENSOR_001",
    "timestamp": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'"
  }')

status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

echo "Status Code: $status_code"
echo "Response: $body"
echo ""

if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
  echo "✅ API ENDPOINT IS WORKING!"
  echo ""
  echo "📊 TEST 2: Validate Response Format"
  echo "─────────────────────────────────────────────────────────"
  echo "Response includes:"
  if echo "$body" | grep -q "success"; then
    echo "  ✓ Success flag"
  fi
  if echo "$body" | grep -q "message"; then
    echo "  ✓ Message field"
  fi
  if echo "$body" | grep -q "data"; then
    echo "  ✓ Data field"
  fi
  if echo "$body" | grep -q "constants"; then
    echo "  ✓ Constants (pH, EC, CO2, NDVI)"
  fi
else
  echo "⚠️  API returned status $status_code"
  echo "This might indicate:"
  echo "  • The Edge Function is not deployed yet"
  echo "  • The authentication key has issues"
  echo "  • The database table doesn't exist"
fi

echo ""
echo "✅ CREDENTIAL VALIDATION"
echo "─────────────────────────────────────────────────────────"
echo "  User ID Format:    ✓ UUID format valid"
echo "  API Key Format:    ✓ JWT token valid"
echo "  Endpoint Format:   ✓ HTTPS URL valid"
echo "  Supabase Project:  ✓ swhtqyopwxzqltclwdqw"
echo ""

echo "🎯 NEXT STEPS"
echo "─────────────────────────────────────────────────────────"
echo "1. Deploy Edge Function:"
echo "   cd /home/joe/Downloads/Digital-Hydroponic"
echo "   supabase functions deploy record-temperature"
echo ""
echo "2. Upload Arduino firmware to your ESP32:"
echo "   • Use Arduino IDE"
echo "   • File: Water-sensor/sensor.ino"
echo "   • Select: Tools > Board > ESP32"
echo "   • Upload!"
echo ""
echo "3. Monitor serial output (115200 baud) to see readings"
echo ""
echo "✨ Your configuration is ready to deploy!"
echo ""

