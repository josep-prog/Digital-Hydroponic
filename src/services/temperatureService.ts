/**
 * Temperature Recording Service
 * 
 * This service acts as a bridge between hardware sensors and the database.
 * It handles temperature data reception, validation, and storage.
 */

import { supabase } from "@/integrations/supabase/client";

export interface TemperatureReading {
  temperature: number;
  user_id?: string;
  sensor_id?: string;
  location?: string;
}

export interface DatabaseTemperatureRecord {
  id: string;
  user_id: string;
  temperature: number;
  ph_level: number; // Kept constant
  ec_level: number; // Kept constant
  co2_level: number; // Kept constant
  ndvi_value: number; // Kept constant
  recorded_at: string;
  created_at: string;
}

// Default constant values for when only temperature is variable
const DEFAULT_CONSTANTS = {
  ph_level: 6.5, // Neutral pH
  ec_level: 1.2, // Standard EC level
  co2_level: 400.0, // Atmospheric CO2
  ndvi_value: 0.5, // Neutral NDVI
};

/**
 * Record temperature reading to database
 * 
 * @param temperature - The temperature value in Celsius
 * @param userId - User ID (optional, uses current user if not provided)
 * @returns The created record or null if failed
 */
export const recordTemperature = async (
  temperature: number,
  userId?: string
): Promise<DatabaseTemperatureRecord | null> => {
  try {
    // Validate temperature
    if (typeof temperature !== "number" || isNaN(temperature)) {
      throw new Error("Invalid temperature value");
    }

    // Get current user if userId not provided
    let finalUserId = userId;
    if (!finalUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No user authenticated");
      }
      finalUserId = user.id;
    }

    // Insert temperature reading with constant values
    const { data, error } = await supabase
      .from("farming_data")
      .insert({
        user_id: finalUserId,
        temperature: temperature,
        ph_level: DEFAULT_CONSTANTS.ph_level,
        ec_level: DEFAULT_CONSTANTS.ec_level,
        co2_level: DEFAULT_CONSTANTS.co2_level,
        ndvi_value: DEFAULT_CONSTANTS.ndvi_value,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      throw error;
    }

    console.log("Temperature recorded successfully:", data);
    return data;
  } catch (error) {
    console.error("Error recording temperature:", error);
    return null;
  }
};

/**
 * Send temperature data to API endpoint (for direct hardware integration)
 * 
 * @param temperature - The temperature value
 * @param apiKey - API key for authentication
 * @returns Response from the API
 */
export const sendTemperatureToAPI = async (
  temperature: number,
  apiKey: string
): Promise<any> => {
  try {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(
      `${baseUrl}/functions/v1/record-temperature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ temperature }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending temperature to API:", error);
    throw error;
  }
};

/**
 * Fetch latest temperature readings
 * 
 * @param limit - Number of records to fetch
 * @param userId - User ID (optional)
 * @returns Array of temperature records
 */
export const getLatestTemperatures = async (
  limit: number = 10,
  userId?: string
): Promise<DatabaseTemperatureRecord[]> => {
  try {
    let query = supabase
      .from("farming_data")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching temperatures:", error);
    return [];
  }
};

/**
 * Get temperature statistics for a time period
 * 
 * @param startDate - Start date for the period
 * @param endDate - End date for the period
 * @param userId - User ID (optional)
 * @returns Temperature statistics
 */
export const getTemperatureStats = async (
  startDate: Date,
  endDate: Date,
  userId?: string
): Promise<{ avg: number; min: number; max: number; count: number } | null> => {
  try {
    let query = supabase
      .from("farming_data")
      .select("temperature")
      .gte("recorded_at", startDate.toISOString())
      .lte("recorded_at", endDate.toISOString());

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      return null;
    }

    const temperatures = data
      .map((r) => r.temperature)
      .filter((t) => typeof t === "number");

    return {
      avg: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      min: Math.min(...temperatures),
      max: Math.max(...temperatures),
      count: temperatures.length,
    };
  } catch (error) {
    console.error("Error calculating temperature stats:", error);
    return null;
  }
};

/**
 * Real-time subscription to temperature changes
 * 
 * @param callback - Function to call when data changes
 * @param userId - User ID (optional)
 * @returns Unsubscribe function
 */
export const subscribeToTemperatureChanges = (
  callback: (data: DatabaseTemperatureRecord) => void,
  userId?: string
): (() => void) => {
  const channel = supabase
    .channel("farming_data_changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "farming_data",
        filter: userId ? `user_id=eq.${userId}` : undefined,
      },
      (payload) => {
        callback(payload.new as DatabaseTemperatureRecord);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
