#!/bin/bash
# 🌡️ TEMPERATURE SYSTEM - SETUP CHECKLIST
# Digital Hydroponic Project
# Last Updated: November 21, 2025

echo "
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║  🌡️  DIGITAL HYDROPONIC - TEMPERATURE SYSTEM SETUP              ║
║                                                                   ║
║  Complete Implementation Checklist                               ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
"

# Colors
GREEN='✅'
RED='❌'
BLUE='📍'
ARROW='→'

# ═══════════════════════════════════════════════════════════════════
echo "
$BLUE PHASE 1: PREPARATION & READING
$ARROW [ ] Read TEMPERATURE_README.md (overview)
$ARROW [ ] Read TEMPERATURE_SETUP.md (detailed guide)
$ARROW [ ] Read FILES_MANIFEST.md (what was created)
$ARROW [ ] Check all files exist in workspace
"

# ═══════════════════════════════════════════════════════════════════
echo "
$BLUE PHASE 2: ENVIRONMENT SETUP
$ARROW [ ] Copy .env.temperature.example to .env.local
$ARROW [ ] Get Supabase project URL (Project Settings)
$ARROW [ ] Get Supabase Anon Key (Project Settings → API)
$ARROW [ ] Get or create a default User ID
$ARROW [ ] Update .env.local with all values
$ARROW [ ] Verify VITE_TEMPERATURE_API_KEY matches Supabase key
"

# ═══════════════════════════════════════════════════════════════════
echo "
$BLUE PHASE 3: CLOUD DEPLOYMENT
$ARROW [ ] Install Supabase CLI: npm install -g supabase
$ARROW [ ] Deploy Edge Function:
          supabase functions deploy record-temperature
$ARROW [ ] Verify function deployed (check Supabase dashboard)
$ARROW [ ] Get function URL from Supabase dashboard
$ARROW [ ] Update VITE_TEMPERATURE_API_ENDPOINT in .env.local
$ARROW [ ] Test function endpoint (curl or browser)
"

# ═══════════════════════════════════════════════════════════════════
echo "
$BLUE PHASE 4: ARDUINO/ESP32 SETUP
$ARROW [ ] Install Arduino IDE (if not already installed)
$ARROW [ ] Install required libraries:
          - OneWire (Paul Stoffregen)
          - DallasTemperature (Miles Burton)
          - ArduinoJson (Benoit Blanchon)
$ARROW [ ] Open Water-sensor/sensor.ino
$ARROW [ ] Update WiFi SSID: const char* ssid = \"YOUR_SSID\"
$ARROW [ ] Update WiFi Password: const char* password = \"YOUR_PASSWORD\"
$ARROW [ ] Update API Endpoint: const char* apiEndpoint = \"https://...\"
$ARROW [ ] Update API Key: const char* apiKey = \"YOUR_KEY\"
$ARROW [ ] Update User ID: const char* userId = \"YOUR_USER_ID\"
$ARROW [ ] Verify DS18B20 sensor is connected to Pin 4
$ARROW [ ] Select ESP32 board in Arduino IDE
$ARROW [ ] Select correct COM port
$ARROW [ ] Upload firmware to device
$ARROW [ ] Open Serial Monitor (115200 baud)
$ARROW [ ] Verify WiFi connection message appears
$ARROW [ ] Verify temperature readings appear
$ARROW [ ] Verify API success messages appear (HTTP 201)
"

# ═══════════════════════════════════════════════════════════════════
echo "
$BLUE PHASE 5: FRONTEND INTEGRATION
$ARROW [ ] Open src/pages/Dashboard.tsx
$ARROW [ ] Add import: import TemperatureMonitor from '@/components/TemperatureMonitor';
$ARROW [ ] Add component to render: <TemperatureMonitor />
$ARROW [ ] Make sure it's inside <TooltipProvider>
$ARROW [ ] Run development server: npm run dev
$ARROW [ ] Verify no console errors
$ARROW [ ] Verify TemperatureMonitor component loads
"

# ═══════════════════════════════════════════════════════════════════
echo "
$BLUE PHASE 6: TESTING & VALIDATION
$ARROW [ ] Navigate to /temperature-configuration in dashboard
$ARROW [ ] Validate Configuration (check for errors)
$ARROW [ ] Test GET Endpoint (should return API info)
$ARROW [ ] Record single temperature (should return 201)
$ARROW [ ] Simulate 5 readings (check all succeed)
$ARROW [ ] Check database for new records (Supabase dashboard)
$ARROW [ ] Verify TemperatureMonitor shows current temp
$ARROW [ ] Verify real-time updates working (WebSocket)
$ARROW [ ] Check Statistics display correct values
$ARROW [ ] Test browser console utilities:
          temperatureTestUtils.validateConfig(...)
          temperatureTestUtils.testTemperatureAPI(...)
"

# ═══════════════════════════════════════════════════════════════════
echo "
$BLUE PHASE 7: VERIFICATION
$ARROW [ ] Arduino shows temperature readings in Serial Monitor
$ARROW [ ] Arduino shows successful API responses (HTTP 201)
$ARROW [ ] Dashboard shows current temperature
$ARROW [ ] Dashboard shows today's statistics
$ARROW [ ] Database contains temperature records (ph_level = 6.5)
$ARROW [ ] Real-time updates visible (new readings appear instantly)
$ARROW [ ] Configuration page accessible and functional
$ARROW [ ] No errors in browser console (F12)
$ARROW [ ] No errors in Arduino Serial Monitor
"

# ═══════════════════════════════════════════════════════════════════
echo "
$BLUE PHASE 8: PRODUCTION READY
$ARROW [ ] All tests passing
$ARROW [ ] Documentation reviewed
$ARROW [ ] Error handling tested
$ARROW [ ] Security settings verified
$ARROW [ ] Environment variables set correctly
$ARROW [ ] Database RLS policies configured
$ARROW [ ] API keys secure in .env.local
$ARROW [ ] Ready to deploy to production
"

# ═══════════════════════════════════════════════════════════════════
echo "
╔═══════════════════════════════════════════════════════════════════╗
║ TROUBLESHOOTING QUICK REFERENCE                                 ║
╚═══════════════════════════════════════════════════════════════════╝

Problem: Arduino won't connect to WiFi
  Solution: Check SSID/password, verify 2.4GHz, check signal strength

Problem: API returns 400 error
  Solution: Check temperature is a number, verify user_id, check range

Problem: No data in database
  Solution: Check API endpoint URL, verify RLS policies, check API key

Problem: Dashboard not updating
  Solution: Check WebSocket (F12 Network), verify RLS, check auth

Problem: Edge Function not deploying
  Solution: Check Supabase CLI installed, verify credentials, check syntax

Problem: Component not showing
  Solution: Check import is correct, verify it's in TooltipProvider

For more help, see: TEMPERATURE_SETUP.md → Troubleshooting section
"

# ═══════════════════════════════════════════════════════════════════
echo "
╔═══════════════════════════════════════════════════════════════════╗
║ USEFUL COMMANDS REFERENCE                                        ║
╚═══════════════════════════════════════════════════════════════════╝

Deploy Edge Function:
  supabase functions deploy record-temperature

View function logs:
  supabase functions list
  supabase functions get-logs record-temperature

Test API with curl:
  curl -X POST https://your-project.supabase.co/functions/v1/record-temperature \\
    -H 'Content-Type: application/json' \\
    -d '{\"temperature\": 25.5, \"user_id\": \"your-id\"}'

Test with Node.js:
  node temperature-test.js test-api
  node temperature-test.js simulate --count 5

Run development server:
  npm run dev

Build for production:
  npm run build

Run tests:
  npm test

Check linting:
  npm run lint
"

# ═══════════════════════════════════════════════════════════════════
echo "
╔═══════════════════════════════════════════════════════════════════╗
║ FILES CREATED (Reference)                                        ║
╚═══════════════════════════════════════════════════════════════════╝

Backend:
  📄 supabase/functions/record-temperature/index.ts

Frontend:
  📄 src/services/temperatureService.ts
  📄 src/components/TemperatureMonitor.tsx
  📄 src/pages/TemperatureConfiguration.tsx
  📄 src/utils/temperatureTestUtils.ts

Hardware:
  📄 Water-sensor/sensor.ino (UPDATED)

Documentation:
  📄 TEMPERATURE_README.md
  📄 TEMPERATURE_SETUP.md
  📄 TEMPERATURE_IMPLEMENTATION.md
  📄 TEMPERATURE_VISUAL_GUIDE.md
  📄 IMPLEMENTATION_COMPLETE.md
  📄 FILES_MANIFEST.md

Configuration:
  📄 .env.temperature.example
  📄 temperature-test.js
  📄 TEMPERATURE_QUICKSTART.sh
  📄 SUMMARY.txt
"

# ═══════════════════════════════════════════════════════════════════
echo "
╔═══════════════════════════════════════════════════════════════════╗
║ ✅ SETUP CHECKLIST COMPLETE                                      ║
║                                                                   ║
║ Your Temperature Recording System is ready!                      ║
║                                                                   ║
║ Next Step: Deploy Edge Function                                  ║
║   supabase functions deploy record-temperature                   ║
║                                                                   ║
║ Questions? See: TEMPERATURE_README.md                            ║
╚═══════════════════════════════════════════════════════════════════╝
"
