#!/bin/bash
# Temperature System Setup Cheat Sheet
# Copy and paste commands to quickly set up the temperature recording system

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Digital Hydroponic - Temperature System Setup               ║"
echo "║  Quick Reference Guide                                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# 1. ENVIRONMENT SETUP
# ============================================================================
echo "📋 STEP 1: Environment Variables"
echo "────────────────────────────────────────────────────────────────"
echo "Copy .env.temperature.example to .env.local and update values:"
echo ""
echo "  cp .env.temperature.example .env.local"
echo ""
echo "Then edit .env.local with your Supabase credentials:"
echo "  • VITE_SUPABASE_URL"
echo "  • VITE_SUPABASE_ANON_KEY"
echo "  • VITE_DEFAULT_USER_ID"
echo ""

# ============================================================================
# 2. DEPLOY EDGE FUNCTION
# ============================================================================
echo "🚀 STEP 2: Deploy Supabase Edge Function"
echo "────────────────────────────────────────────────────────────────"
echo "Install Supabase CLI (if not installed):"
echo "  npm install -g supabase"
echo ""
echo "Deploy the function:"
echo "  supabase functions deploy record-temperature"
echo ""
echo "Get your function URL from Supabase dashboard:"
echo "  Format: https://[PROJECT-ID].supabase.co/functions/v1/record-temperature"
echo ""

# ============================================================================
# 3. ARDUINO SETUP
# ============================================================================
echo "⚙️  STEP 3: Arduino/ESP32 Configuration"
echo "────────────────────────────────────────────────────────────────"
echo "1. Install required libraries in Arduino IDE:"
echo "   • OneWire (Paul Stoffregen)"
echo "   • DallasTemperature (Miles Burton)"
echo "   • ArduinoJson (Benoit Blanchon)"
echo ""
echo "2. Edit Water-sensor/sensor.ino with your settings:"
echo "   • ssid = Your WiFi network"
echo "   • password = Your WiFi password"
echo "   • apiEndpoint = Your Supabase function URL"
echo "   • apiKey = Your Supabase Anon Key"
echo "   • userId = Your Supabase User ID"
echo ""
echo "3. Upload to your ESP32/Arduino board"
echo ""
echo "4. Open Serial Monitor (115200 baud) to verify connection"
echo ""

# ============================================================================
# 4. FRONTEND INTEGRATION
# ============================================================================
echo "🎨 STEP 4: Frontend Integration"
echo "────────────────────────────────────────────────────────────────"
echo "Add component to Dashboard.tsx:"
echo ""
echo "  import TemperatureMonitor from '@/components/TemperatureMonitor';"
echo ""
echo "  export default function Dashboard() {"
echo "    return ("
echo "      <>"
echo "        <TemperatureMonitor />"
echo "        {/* rest of dashboard */}"
echo "      </>"
echo "    );"
echo "  }"
echo ""

# ============================================================================
# 5. TESTING
# ============================================================================
echo "🧪 STEP 5: Testing"
echo "────────────────────────────────────────────────────────────────"
echo "Option A: Use Configuration Page"
echo "  1. Navigate to /temperature-configuration"
echo "  2. Enter your API credentials"
echo "  3. Click 'Test' buttons"
echo ""
echo "Option B: Browser Console Commands"
echo "  temperatureTestUtils.validateConfig({...})"
echo "  temperatureTestUtils.testTemperatureAPI(...)"
echo "  temperatureTestUtils.simulateTemperatureReadings(...)"
echo ""
echo "Option C: cURL Command"
echo "  curl -X POST https://your-project.supabase.co/functions/v1/record-temperature \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"temperature\": 25.5, \"user_id\": \"your-user-id\"}'"
echo ""

# ============================================================================
# 6. TROUBLESHOOTING
# ============================================================================
echo "🔧 TROUBLESHOOTING"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "❌ Arduino won't connect to WiFi:"
echo "   • Check SSID and password"
echo "   • Verify 2.4GHz WiFi (ESP32 limitation)"
echo "   • Check signal strength in Serial Monitor"
echo ""
echo "❌ API returns 400 error:"
echo "   • Verify temperature is a number"
echo "   • Check user_id exists in database"
echo "   • Ensure temperature -50 to 150°C"
echo ""
echo "❌ No real-time updates:"
echo "   • Check WebSocket connection (F12 → Network → WS)"
echo "   • Verify RLS policies on farming_data table"
echo "   • Check Supabase subscription in browser console"
echo ""
echo "❌ Component not showing:"
echo "   • Ensure inside <TooltipProvider>"
echo "   • Check Supabase client is initialized"
echo "   • Verify user is authenticated"
echo ""

# ============================================================================
# 7. USEFUL COMMANDS
# ============================================================================
echo "⚡ USEFUL COMMANDS"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "View function logs:"
echo "  supabase functions list"
echo "  supabase functions get-logs record-temperature"
echo ""
echo "View database:"
echo "  supabase db pull  # Download schema"
echo "  supabase db push  # Push local changes"
echo ""
echo "Build and deploy:"
echo "  npm run build"
echo "  vercel --prod"
echo ""

# ============================================================================
# 8. FILE REFERENCE
# ============================================================================
echo "📁 FILE REFERENCE"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "Backend:"
echo "  📄 supabase/functions/record-temperature/index.ts"
echo "     → API endpoint handler"
echo ""
echo "Frontend:"
echo "  📄 src/services/temperatureService.ts"
echo "     → Service layer for temperature operations"
echo "  📄 src/components/TemperatureMonitor.tsx"
echo "     → Display component"
echo "  📄 src/pages/TemperatureConfiguration.tsx"
echo "     → Configuration & testing page"
echo "  📄 src/utils/temperatureTestUtils.ts"
echo "     → Testing utilities"
echo ""
echo "Hardware:"
echo "  📄 Water-sensor/sensor.ino"
echo "     → Arduino/ESP32 firmware"
echo ""
echo "Documentation:"
echo "  📄 TEMPERATURE_SETUP.md"
echo "     → Detailed setup guide"
echo "  📄 TEMPERATURE_IMPLEMENTATION.md"
echo "     → Complete implementation details"
echo "  📄 .env.temperature.example"
echo "     → Environment variables template"
echo ""

# ============================================================================
# 9. DATABASE STRUCTURE
# ============================================================================
echo "🗄️  DATABASE STRUCTURE"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "Table: farming_data"
echo "├── id (UUID) ..................... Record ID"
echo "├── user_id (UUID) ................ User reference"
echo "├── temperature (DECIMAL) ......... From hardware ⭐"
echo "├── ph_level (DECIMAL) ............ Constant value"
echo "├── ec_level (DECIMAL) ............ Constant value"
echo "├── co2_level (DECIMAL) ........... Constant value"
echo "├── ndvi_value (DECIMAL) .......... Constant value"
echo "├── recorded_at (TIMESTAMPTZ) .... Sensor reading time"
echo "└── created_at (TIMESTAMPTZ) .... Database insert time"
echo ""

# ============================================================================
# 10. API QUICK REFERENCE
# ============================================================================
echo "🔌 API QUICK REFERENCE"
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "POST /functions/v1/record-temperature"
echo ""
echo "Request:"
echo "  {"
echo "    \"temperature\": 25.5,"
echo "    \"user_id\": \"your-id\","
echo "    \"sensor_id\": \"sensor_001\","
echo "    \"timestamp\": \"2025-11-21T12:30:00Z\""
echo "  }"
echo ""
echo "Response (201):"
echo "  {"
echo "    \"success\": true,"
echo "    \"message\": \"Temperature recorded successfully\","
echo "    \"data\": { ... }"
echo "  }"
echo ""

# ============================================================================
# 11. MONITORING CHECKLIST
# ============================================================================
echo "✅ MONITORING CHECKLIST"
echo "────────────────────────────────────────────────────────────────"
echo "□ Edge Function deployed"
echo "□ Arduino firmware uploaded"
echo "□ Serial Monitor shows successful connection"
echo "□ TemperatureMonitor component added to dashboard"
echo "□ Real-time updates visible in UI"
echo "□ API test page shows successful connection"
echo "□ Database contains temperature records"
echo "□ RLS policies configured correctly"
echo ""

# ============================================================================
# COMPLETION
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Setup Complete! 🎉                                           ║"
echo "║  Your temperature system is ready to use                      ║"
echo "║  Navigate to /temperature-configuration to test               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
