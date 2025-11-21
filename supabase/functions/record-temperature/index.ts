import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface FarmingDataRequest {
  user_id: string;
  temperature?: number | null;
  ph_level?: number | null;
  ec_level?: number | null;
  co2_level?: number | null;
  ndvi_value?: number | null;
  recorded_at?: string;
}

interface FarmingDataResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Method not allowed. Only POST requests are accepted.",
        } as FarmingDataResponse),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    let requestBody: FarmingDataRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in request body",
        } as FarmingDataResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate required field: user_id
    if (!requestBody.user_id || typeof requestBody.user_id !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing or invalid required field: user_id (must be a string UUID)",
        } as FarmingDataResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate temperature if provided
    if (requestBody.temperature !== undefined && requestBody.temperature !== null) {
      if (typeof requestBody.temperature !== "number") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid temperature value. Must be a number.",
          } as FarmingDataResponse),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Validate temperature range (-50°C to 150°C)
      if (requestBody.temperature < -50 || requestBody.temperature > 150) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid temperature value. Must be between -50 and 150°C",
          } as FarmingDataResponse),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Validate pH level if provided (0-14)
    if (requestBody.ph_level !== undefined && requestBody.ph_level !== null) {
      if (typeof requestBody.ph_level !== "number") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid pH level. Must be a number between 0 and 14.",
          } as FarmingDataResponse),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (requestBody.ph_level < 0 || requestBody.ph_level > 14) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid pH level. Must be between 0 and 14.",
          } as FarmingDataResponse),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Validate EC level if provided
    if (requestBody.ec_level !== undefined && requestBody.ec_level !== null) {
      if (typeof requestBody.ec_level !== "number") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid EC level. Must be a number.",
          } as FarmingDataResponse),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (requestBody.ec_level < 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid EC level. Must be positive.",
          } as FarmingDataResponse),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Validate CO2 level if provided
    if (requestBody.co2_level !== undefined && requestBody.co2_level !== null) {
      if (typeof requestBody.co2_level !== "number") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid CO2 level. Must be a number.",
          } as FarmingDataResponse),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (requestBody.co2_level < 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid CO2 level. Must be positive.",
          } as FarmingDataResponse),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Validate NDVI value if provided (0-1)
    if (requestBody.ndvi_value !== undefined && requestBody.ndvi_value !== null) {
      if (typeof requestBody.ndvi_value !== "number") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid NDVI value. Must be a number between 0 and 1.",
          } as FarmingDataResponse),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (requestBody.ndvi_value < 0 || requestBody.ndvi_value > 1) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid NDVI value. Must be between 0 and 1.",
          } as FarmingDataResponse),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error: Missing Supabase credentials",
        } as FarmingDataResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Prepare data for insertion - handle all fields with null if not provided
    const farmingData: Record<string, unknown> = {
      user_id: requestBody.user_id,
      temperature: requestBody.temperature ?? null,
      ph_level: requestBody.ph_level ?? null,
      ec_level: requestBody.ec_level ?? null,
      co2_level: requestBody.co2_level ?? null,
      ndvi_value: requestBody.ndvi_value ?? null,
      recorded_at: requestBody.recorded_at ?? new Date().toISOString(),
    };

    console.log("Inserting farming data:", farmingData);

    // Insert into farming_data table
    const { data: insertedData, error: insertError } = await supabase
      .from("farming_data")
      .insert([farmingData])
      .select();

    if (insertError) {
      console.error("Database insertion error:", insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Database error: ${insertError.message}`,
        } as FarmingDataResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Successfully inserted farming data:", insertedData);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "All sensor readings recorded successfully",
        data: insertedData && insertedData.length > 0 ? insertedData[0] : farmingData,
      } as FarmingDataResponse),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected server error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return new Response(
      JSON.stringify({
        success: false,
        error: `Server error: ${errorMessage}`,
      } as FarmingDataResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
