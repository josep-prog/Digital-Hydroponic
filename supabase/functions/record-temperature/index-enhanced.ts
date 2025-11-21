/**
 * Enhanced Temperature Recording Function
 * 
 * Handles Arduino sensor temperature data and stores it in the farming_data table
 * with validation, error handling, and real-time updates
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS Headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Temperature validation constants
const TEMP_MIN = -50; // Minimum valid temperature (°C)
const TEMP_MAX = 150; // Maximum valid temperature (°C)
const TEMP_WARNING_LOW = 15; // Warning threshold low
const TEMP_WARNING_HIGH = 35; // Warning threshold high

// Default sensor data (when sensors aren't providing real values)
const DEFAULT_CONSTANTS = {
  ph_level: 6.5,
  ec_level: 1.2,
  co2_level: 400.0,
  ndvi_value: 0.5,
};

/**
 * Main request handler
 */
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate HTTP method
    if (req.method !== "POST") {
      return errorResponse(
        "Method not allowed. Only POST requests are supported",
        405
      );
    }

    // Parse and validate request body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("[PARSE_ERROR]", parseError);
      return errorResponse(
        "Invalid JSON format. Ensure body is valid JSON",
        400
      );
    }

    console.log("[REQUEST_RECEIVED]", JSON.stringify(body));

    // Extract fields from request
    const {
      temperature,
      user_id,
      sensor_id = "ESP32_DEFAULT",
      timestamp,
      location = "Main Greenhouse",
      // Optional: real sensor values if available
      ph_level,
      ec_level,
      co2_level,
      ndvi_value,
    } = body;

    // ============================================================
    // VALIDATION SECTION
    // ============================================================

    // 1. Validate temperature (REQUIRED)
    if (temperature === undefined || temperature === null) {
      return errorResponse("Missing required field: temperature", 400);
    }

    if (typeof temperature !== "number") {
      return errorResponse(
        `Invalid temperature type. Expected number, got ${typeof temperature}`,
        400
      );
    }

    if (isNaN(temperature)) {
      return errorResponse("Temperature value is NaN (not a number)", 400);
    }

    if (temperature < TEMP_MIN || temperature > TEMP_MAX) {
      return errorResponse(
        `Temperature out of valid range. Must be between ${TEMP_MIN}°C and ${TEMP_MAX}°C. Got: ${temperature}°C`,
        400
      );
    }

    // 2. Validate user_id (REQUIRED)
    if (!user_id) {
      return errorResponse("Missing required field: user_id", 400);
    }

    if (typeof user_id !== "string" || user_id.trim().length === 0) {
      return errorResponse(
        "Invalid user_id. Must be a non-empty string",
        400
      );
    }

    // 3. Validate sensor_id
    if (sensor_id && typeof sensor_id !== "string") {
      return errorResponse("Invalid sensor_id. Must be a string", 400);
    }

    // 4. Validate timestamp format if provided
    let recordedAt = new Date().toISOString();
    if (timestamp) {
      try {
        const parsedDate = new Date(timestamp);
        if (isNaN(parsedDate.getTime())) {
          console.warn("[WARNING] Invalid timestamp format, using current time");
        } else {
          recordedAt = parsedDate.toISOString();
        }
      } catch (e) {
        console.warn("[WARNING] Error parsing timestamp:", e);
      }
    }

    // ============================================================
    // SUPABASE INITIALIZATION
    // ============================================================

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[CONFIG_ERROR] Missing Supabase environment variables");
      return errorResponse(
        "Server configuration error. Check Supabase credentials",
        500
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // ============================================================
    // DATA PREPARATION
    // ============================================================

    // Use provided sensor values or defaults
    const sensorData = {
      ph_level: typeof ph_level === "number" ? ph_level : DEFAULT_CONSTANTS.ph_level,
      ec_level: typeof ec_level === "number" ? ec_level : DEFAULT_CONSTANTS.ec_level,
      co2_level: typeof co2_level === "number" ? co2_level : DEFAULT_CONSTANTS.co2_level,
      ndvi_value: typeof ndvi_value === "number" ? ndvi_value : DEFAULT_CONSTANTS.ndvi_value,
    };

    const dataToInsert = {
      user_id: user_id.trim(),
      sensor_id: sensor_id || "ESP32_DEFAULT",
      temperature: parseFloat(temperature.toFixed(2)),
      ph_level: parseFloat(sensorData.ph_level.toFixed(2)),
      ec_level: parseFloat(sensorData.ec_level.toFixed(2)),
      co2_level: parseFloat(sensorData.co2_level.toFixed(2)),
      ndvi_value: parseFloat(sensorData.ndvi_value.toFixed(2)),
      recorded_at: recordedAt,
      location: location || "Main Greenhouse",
    };

    console.log("[DATA_PREPARED]", JSON.stringify(dataToInsert));

    // ============================================================
    // DATABASE INSERTION
    // ============================================================

    const { data: insertedData, error: insertError } = await supabase
      .from("farming_data")
      .insert([dataToInsert])
      .select();

    if (insertError) {
      console.error("[DB_ERROR]", insertError);
      return errorResponse(
        `Database error: ${insertError.message}`,
        500
      );
    }

    if (!insertedData || insertedData.length === 0) {
      console.error("[DB_ERROR] No data returned after insert");
      return errorResponse(
        "Database insertion failed: no data returned",
        500
      );
    }

    const record = insertedData[0];

    // ============================================================
    // ANALYSIS & ALERTS
    // ============================================================

    const alerts = [];

    if (temperature < TEMP_WARNING_LOW) {
      alerts.push({
        level: "warning",
        message: `Temperature is low: ${temperature}°C (below ${TEMP_WARNING_LOW}°C)`,
      });
    }

    if (temperature > TEMP_WARNING_HIGH) {
      alerts.push({
        level: "warning",
        message: `Temperature is high: ${temperature}°C (above ${TEMP_WARNING_HIGH}°C)`,
      });
    }

    console.log("[SUCCESS] Temperature recorded successfully", {
      id: record.id,
      temperature: record.temperature,
      timestamp: record.recorded_at,
    });

    // ============================================================
    // SUCCESS RESPONSE
    // ============================================================

    return successResponse({
      id: record.id,
      temperature: record.temperature,
      ph_level: record.ph_level,
      ec_level: record.ec_level,
      co2_level: record.co2_level,
      ndvi_value: record.ndvi_value,
      recorded_at: record.recorded_at,
      sensor_id: record.sensor_id,
      user_id: record.user_id,
      alerts: alerts.length > 0 ? alerts : undefined,
      message: "Temperature recorded successfully",
    });

  } catch (unexpectedError) {
    console.error("[UNEXPECTED_ERROR]", unexpectedError);
    const errorMsg = unexpectedError instanceof Error 
      ? unexpectedError.message 
      : String(unexpectedError);
    return errorResponse(`Server error: ${errorMsg}`, 500);
  }
});

/**
 * Helper function to return error responses
 */
function errorResponse(message: string, status: number = 400) {
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

/**
 * Helper function to return success responses
 */
function successResponse(data: Record<string, unknown>, status: number = 201) {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
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
