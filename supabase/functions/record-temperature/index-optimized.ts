/**
 * ============================================================================
 * SUPABASE EDGE FUNCTION: Temperature Data Handler
 * ============================================================================
 * 
 * Purpose:
 * - Receives temperature readings from Arduino/ESP32 sensors
 * - Validates sensor data against acceptable ranges
 * - Stores readings in PostgreSQL farming_data table
 * - Provides real-time data to React dashboard
 * 
 * Endpoint: POST /functions/v1/record-temperature
 * 
 * ============================================================================
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Temperature validation thresholds
const TEMP_VALIDATION = {
  MIN: -50,  // Minimum valid temperature (°C)
  MAX: 150,  // Maximum valid temperature (°C)
};

// Temperature warning thresholds (for alerts)
const TEMP_WARNING = {
  LOW: 15,   // Alert if below 15°C
  HIGH: 35,  // Alert if above 35°C
};

// Default values when sensors don't provide real data
const DEFAULT_SENSOR_VALUES = {
  ph_level: 6.5,
  ec_level: 1.2,
  co2_level: 400.0,
  ndvi_value: 0.5,
};

// ============================================================================
// MAIN REQUEST HANDLER
// ============================================================================

serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    // Only accept POST requests
    if (req.method !== "POST") {
      return createErrorResponse(
        "Method not allowed. Only POST requests are supported.",
        405
      );
    }

    // ========================================================================
    // STEP 1: PARSE REQUEST BODY
    // ========================================================================

    let requestBody: Record<string, unknown>;
    try {
      requestBody = await req.json();
    } catch {
      return createErrorResponse(
        "Invalid JSON format in request body",
        400
      );
    }

    console.log("[REQUEST] Received payload:", JSON.stringify(requestBody));

    // ========================================================================
    // STEP 2: EXTRACT FIELDS
    // ========================================================================

    const {
      temperature,
      user_id,
      sensor_id = "ESP32_DEFAULT",
      timestamp,
      location = "Main Greenhouse",
      // Optional: real sensor values
      ph_level,
      ec_level,
      co2_level,
      ndvi_value,
    } = requestBody;

    // ========================================================================
    // STEP 3: VALIDATE REQUIRED FIELDS
    // ========================================================================

    // Validate temperature
    if (temperature === undefined || temperature === null) {
      return createErrorResponse(
        "Required field missing: 'temperature'",
        400
      );
    }

    if (typeof temperature !== "number") {
      return createErrorResponse(
        `Invalid temperature type: expected 'number', got '${typeof temperature}'`,
        400
      );
    }

    if (isNaN(temperature)) {
      return createErrorResponse(
        "Temperature value is NaN (not a valid number)",
        400
      );
    }

    if (temperature < TEMP_VALIDATION.MIN || temperature > TEMP_VALIDATION.MAX) {
      return createErrorResponse(
        `Invalid temperature: ${temperature}°C. Must be between ${TEMP_VALIDATION.MIN}°C and ${TEMP_VALIDATION.MAX}°C`,
        400
      );
    }

    // Validate user_id
    if (!user_id) {
      return createErrorResponse(
        "Required field missing: 'user_id'",
        400
      );
    }

    if (typeof user_id !== "string" || user_id.trim().length === 0) {
      return createErrorResponse(
        "Invalid user_id: must be a non-empty string",
        400
      );
    }

    // ========================================================================
    // STEP 4: INITIALIZE SUPABASE CLIENT
    // ========================================================================

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[CONFIG] Missing Supabase environment variables");
      return createErrorResponse(
        "Server configuration error",
        500
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // ========================================================================
    // STEP 5: PREPARE DATA FOR INSERTION
    // ========================================================================

    // Handle timestamp
    let recordedAt = new Date().toISOString();
    if (timestamp && typeof timestamp === "string") {
      try {
        const parsedTime = new Date(timestamp as string);
        if (!isNaN(parsedTime.getTime())) {
          recordedAt = parsedTime.toISOString();
        }
      } catch {
        console.warn("[WARNING] Invalid timestamp format, using current time");
      }
    }

    // Prepare sensor data with defaults
    const finalData = {
      user_id: user_id.trim(),
      sensor_id: typeof sensor_id === "string" ? sensor_id : "ESP32_DEFAULT",
      temperature: Number(temperature.toFixed(2)),
      ph_level: typeof ph_level === "number" 
        ? Number(ph_level.toFixed(2)) 
        : DEFAULT_SENSOR_VALUES.ph_level,
      ec_level: typeof ec_level === "number" 
        ? Number(ec_level.toFixed(2)) 
        : DEFAULT_SENSOR_VALUES.ec_level,
      co2_level: typeof co2_level === "number" 
        ? Number(co2_level.toFixed(2)) 
        : DEFAULT_SENSOR_VALUES.co2_level,
      ndvi_value: typeof ndvi_value === "number" 
        ? Number(ndvi_value.toFixed(2)) 
        : DEFAULT_SENSOR_VALUES.ndvi_value,
      recorded_at: recordedAt,
      location: typeof location === "string" ? location : "Main Greenhouse",
    };

    console.log("[PREPARED] Data ready for insertion:", JSON.stringify(finalData));

    // ========================================================================
    // STEP 6: INSERT INTO DATABASE
    // ========================================================================

    const { data: insertedRecords, error: dbError } = await supabase
      .from("farming_data")
      .insert([finalData])
      .select();

    if (dbError) {
      console.error("[DATABASE_ERROR]", dbError);
      return createErrorResponse(
        `Database error: ${dbError.message}`,
        500
      );
    }

    if (!insertedRecords || insertedRecords.length === 0) {
      console.error("[DATABASE_ERROR] No data returned after insertion");
      return createErrorResponse(
        "Database insertion failed",
        500
      );
    }

    const insertedRecord = insertedRecords[0];

    // ========================================================================
    // STEP 7: GENERATE ALERTS (if applicable)
    // ========================================================================

    const alerts: Array<{ level: string; message: string }> = [];

    if (temperature < TEMP_WARNING.LOW) {
      alerts.push({
        level: "warning",
        message: `Temperature is LOW: ${temperature}°C (below ${TEMP_WARNING.LOW}°C threshold)`,
      });
    }

    if (temperature > TEMP_WARNING.HIGH) {
      alerts.push({
        level: "warning",
        message: `Temperature is HIGH: ${temperature}°C (above ${TEMP_WARNING.HIGH}°C threshold)`,
      });
    }

    // ========================================================================
    // STEP 8: CREATE SUCCESS RESPONSE
    // ========================================================================

    console.log("[SUCCESS] Temperature record created:", insertedRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Temperature recorded successfully",
        data: {
          id: insertedRecord.id,
          temperature: insertedRecord.temperature,
          ph_level: insertedRecord.ph_level,
          ec_level: insertedRecord.ec_level,
          co2_level: insertedRecord.co2_level,
          ndvi_value: insertedRecord.ndvi_value,
          recorded_at: insertedRecord.recorded_at,
          sensor_id: insertedRecord.sensor_id,
          user_id: insertedRecord.user_id,
          location: insertedRecord.location,
        },
        alerts: alerts.length > 0 ? alerts : null,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 201,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (unexpectedError) {
    console.error("[UNEXPECTED_ERROR]", unexpectedError);
    const errorMessage = unexpectedError instanceof Error 
      ? unexpectedError.message 
      : String(unexpectedError);
    
    return createErrorResponse(
      `Server error: ${errorMessage}`,
      500
    );
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates standardized error response
 */
function createErrorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}
