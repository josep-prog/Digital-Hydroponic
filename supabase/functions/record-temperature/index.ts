import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { temperature, user_id, sensor_id = "default", timestamp } = body;

    // Validate required fields
    if (temperature === undefined || temperature === null) {
      return new Response(
        JSON.stringify({ error: "Missing required field: temperature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate temperature range
    if (typeof temperature !== "number" || temperature < -50 || temperature > 150) {
      return new Response(
        JSON.stringify({ error: "Invalid temperature value. Must be between -50 and 150°C" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Define constant values
    const DEFAULT_CONSTANTS = {
      ph: 6.5,
      ec: 1.2,
      co2: 400,
      ndvi: 0.5,
    };

    // Prepare data for insertion
    const data = {
      user_id,
      sensor_id,
      temperature: typeof temperature === "number" ? temperature : parseFloat(String(temperature)),
      ph: DEFAULT_CONSTANTS.ph,
      ec: DEFAULT_CONSTANTS.ec,
      co2: DEFAULT_CONSTANTS.co2,
      ndvi: DEFAULT_CONSTANTS.ndvi,
      recorded_at: timestamp || new Date().toISOString(),
    };

    // Insert into farming_data table
    const { data: insertedData, error } = await supabase
      .from("farming_data")
      .insert([data])
      .select();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: `Database error: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Temperature recorded successfully",
        data: insertedData ? insertedData[0] : data,
        constants: DEFAULT_CONSTANTS,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: `Server error: ${errorMessage}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
