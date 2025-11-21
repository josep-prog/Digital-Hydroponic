/**
 * API Testing Utilities for Temperature Recording System
 * 
 * Use these functions to test the temperature recording API
 * and debug connectivity issues.
 */

/**
 * Test the temperature API endpoint
 * 
 * @param apiEndpoint - Full URL to the API endpoint
 * @param apiKey - API key for authentication
 * @param temperature - Temperature value to send
 * @param userId - User ID
 */
export const testTemperatureAPI = async (
  apiEndpoint: string,
  apiKey: string,
  temperature: number = 25.5,
  userId: string = "test-user"
): Promise<any> => {
  try {
    console.log("🧪 Testing Temperature API...");
    console.log(`📍 Endpoint: ${apiEndpoint}`);

    const payload = {
      temperature,
      user_id: userId,
      sensor_id: "test_sensor_001",
      timestamp: new Date().toISOString(),
    };

    console.log("📤 Sending payload:", payload);

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    console.log(`📊 Response Status: ${response.status}`);

    const data = await response.json();
    console.log("📥 Response Data:", data);

    if (response.ok) {
      console.log("✅ API Test Successful!");
      return { success: true, data };
    } else {
      console.error("❌ API Test Failed!");
      return { success: false, error: data };
    }
  } catch (error) {
    console.error("❌ API Test Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

/**
 * Test GET endpoint (should return API documentation)
 */
export const testTemperatureAPIGet = async (
  apiEndpoint: string
): Promise<any> => {
  try {
    console.log("🧪 Testing GET endpoint...");

    const response = await fetch(apiEndpoint, {
      method: "GET",
    });

    const data = await response.json();
    console.log("✅ GET Response:", data);

    return { success: true, data };
  } catch (error) {
    console.error("❌ GET Test Error:", error);
    return { success: false, error };
  }
};

/**
 * Simulate continuous temperature readings
 */
export const simulateTemperatureReadings = async (
  apiEndpoint: string,
  apiKey: string,
  userId: string,
  count: number = 5,
  interval: number = 2000
): Promise<void> => {
  console.log(`📊 Simulating ${count} temperature readings...`);

  for (let i = 0; i < count; i++) {
    // Generate random temperature between 20 and 30°C
    const temperature = 20 + Math.random() * 10;

    console.log(`\n[${i + 1}/${count}] Recording: ${temperature.toFixed(1)}°C`);

    await testTemperatureAPI(apiEndpoint, apiKey, temperature, userId);

    if (i < count - 1) {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  console.log("\n✅ Simulation Complete!");
};

/**
 * Validate API configuration
 */
export const validateConfig = (config: {
  apiEndpoint?: string;
  apiKey?: string;
  userId?: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.apiEndpoint) {
    errors.push("Missing apiEndpoint");
  } else if (!config.apiEndpoint.startsWith("http")) {
    errors.push("Invalid apiEndpoint format");
  }

  if (!config.apiKey) {
    errors.push("Missing apiKey");
  }

  if (!config.userId) {
    errors.push("Missing userId");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Pretty print temperature data
 */
export const printTemperatureData = (data: any): void => {
  console.group("🌡️ Temperature Data");
  console.table({
    Temperature: `${data.temperature}°C`,
    "pH Level": data.ph_level,
    "EC Level": data.ec_level,
    "CO2 Level": data.co2_level,
    NDVI: data.ndvi_value,
    "Recorded At": new Date(data.recorded_at).toLocaleString(),
  });
  console.groupEnd();
};

// Export for use in browser console
if (typeof window !== "undefined") {
  (window as any).temperatureTestUtils = {
    testTemperatureAPI,
    testTemperatureAPIGet,
    simulateTemperatureReadings,
    validateConfig,
    printTemperatureData,
  };

  console.log("✅ Temperature Test Utils loaded. Use temperatureTestUtils in console.");
}
