#!/usr/bin/env node

/**
 * Temperature System Testing Helper
 * Node.js script to test the temperature recording API
 * 
 * Usage:
 *   node temperature-test.js [command] [options]
 * 
 * Commands:
 *   test-api      Test the API endpoint
 *   simulate      Simulate multiple temperature readings
 *   validate      Validate configuration
 *   help          Show this help message
 * 
 * Examples:
 *   node temperature-test.js test-api --temp 25.5 --endpoint https://... --key abc123
 *   node temperature-test.js simulate --count 5 --interval 2000
 *   node temperature-test.js validate --endpoint https://... --key abc123 --user-id xyz
 */

import fetch from "node-fetch";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function loadConfig() {
  console.log("\n🔧 Loading configuration...\n");

  const endpoint = process.env.VITE_TEMPERATURE_API_ENDPOINT || (await question("API Endpoint: "));
  const apiKey = process.env.VITE_TEMPERATURE_API_KEY || (await question("API Key: "));
  const userId = process.env.VITE_DEFAULT_USER_ID || (await question("User ID: "));

  if (!endpoint || !apiKey || !userId) {
    console.error("❌ Missing required configuration");
    process.exit(1);
  }

  return { endpoint, apiKey, userId };
}

async function testAPI(config, temperature = 25.5) {
  console.log("\n🧪 Testing Temperature API...\n");
  console.log(`📍 Endpoint: ${config.endpoint}`);
  console.log(`🌡️  Temperature: ${temperature}°C\n`);

  try {
    const payload = {
      temperature,
      user_id: config.userId,
      sensor_id: "test_sensor_001",
      timestamp: new Date().toISOString(),
    };

    console.log("📤 Sending request...");
    console.log(`Payload: ${JSON.stringify(payload, null, 2)}\n`);

    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    console.log(`📊 Response Status: ${response.status}\n`);

    const data = await response.json();

    if (response.ok) {
      console.log("✅ API Test Successful!\n");
      console.log("Response Data:");
      console.log(JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log("❌ API Test Failed!\n");
      console.log("Error Response:");
      console.log(JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

async function simulateReadings(config, count = 5, interval = 2000) {
  console.log(`\n📊 Simulating ${count} temperature readings...\n`);

  let successCount = 0;

  for (let i = 0; i < count; i++) {
    const temperature = 20 + Math.random() * 10; // Random between 20-30

    console.log(`\n[${i + 1}/${count}] Recording: ${temperature.toFixed(1)}°C`);

    try {
      const payload = {
        temperature: parseFloat(temperature.toFixed(1)),
        user_id: config.userId,
        sensor_id: `test_sensor_${i}`,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("  ✅ Success");
        successCount++;
      } else {
        console.log("  ❌ Failed");
      }
    } catch (error) {
      console.log("  ❌ Error:", error.message);
    }

    if (i < count - 1) {
      process.stdout.write(`  ⏳ Waiting ${interval}ms...`);
      await new Promise((resolve) => setTimeout(resolve, interval));
      console.log(" Done");
    }
  }

  console.log(`\n✅ Simulation Complete! (${successCount}/${count} successful)\n`);
}

function validateConfig(config) {
  console.log("\n✅ Validating Configuration...\n");

  const checks = [
    {
      name: "API Endpoint",
      valid: config.endpoint && config.endpoint.startsWith("http"),
    },
    { name: "API Key", valid: !!config.apiKey },
    { name: "User ID", valid: !!config.userId },
  ];

  let allValid = true;
  checks.forEach((check) => {
    console.log(`  ${check.valid ? "✅" : "❌"} ${check.name}`);
    if (!check.valid) allValid = false;
  });

  console.log(`\n${allValid ? "✅ Configuration Valid!" : "❌ Configuration Invalid!"}\n`);

  return allValid;
}

async function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Temperature System Testing Helper                             ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  node temperature-test.js [command] [options]

COMMANDS:
  test-api      Test the API endpoint with a single temperature reading
  simulate      Simulate multiple temperature readings
  validate      Validate your configuration
  help          Show this help message

OPTIONS:
  --endpoint URL    API endpoint URL (or use env: VITE_TEMPERATURE_API_ENDPOINT)
  --key KEY         API key (or use env: VITE_TEMPERATURE_API_KEY)
  --user-id ID      User ID (or use env: VITE_DEFAULT_USER_ID)
  --temp TEMP       Temperature value (default: 25.5)
  --count COUNT     Number of readings to simulate (default: 5)
  --interval TIME   Milliseconds between readings (default: 2000)

EXAMPLES:
  # Test with interactive prompts
  node temperature-test.js test-api

  # Test with environment variables
  VITE_TEMPERATURE_API_ENDPOINT=https://... \\
  VITE_TEMPERATURE_API_KEY=abc123 \\
  VITE_DEFAULT_USER_ID=xyz \\
  node temperature-test.js test-api --temp 25.5

  # Simulate 5 readings at 2-second intervals
  node temperature-test.js simulate --count 5 --interval 2000

  # Validate configuration
  node temperature-test.js validate

ENVIRONMENT VARIABLES:
  VITE_TEMPERATURE_API_ENDPOINT  Your API endpoint URL
  VITE_TEMPERATURE_API_KEY       Your Supabase API key
  VITE_DEFAULT_USER_ID           Your Supabase user ID

For more information, see:
  - TEMPERATURE_SETUP.md
  - TEMPERATURE_IMPLEMENTATION.md
  - TEMPERATURE_VISUAL_GUIDE.md
  `);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  console.log("🌡️  Temperature Recording System - Testing Helper\n");

  try {
    if (command === "help") {
      await showHelp();
    } else if (command === "test-api") {
      const config = await loadConfig();
      const temp = args.includes("--temp") ? parseFloat(args[args.indexOf("--temp") + 1]) : 25.5;
      validateConfig(config);
      await testAPI(config, temp);
    } else if (command === "simulate") {
      const config = await loadConfig();
      const count = args.includes("--count") ? parseInt(args[args.indexOf("--count") + 1]) : 5;
      const interval = args.includes("--interval") ? parseInt(args[args.indexOf("--interval") + 1]) : 2000;
      validateConfig(config);
      await simulateReadings(config, count, interval);
    } else if (command === "validate") {
      const config = await loadConfig();
      validateConfig(config);
    } else {
      console.log(`❌ Unknown command: ${command}\n`);
      await showHelp();
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }

  rl.close();
  process.exit(0);
}

main();
