#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Temperature Sensor Configuration
#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// WiFi Configuration - UPDATE THESE VALUES
const char* ssid = "Joseph-WIFI";           // Your WiFi network name
const char* password = "k@#+ymej@AQ@3";   // Your WiFi password

// API Configuration
const char* apiEndpoint = "https://swhtqyopwxzqltclwdqw.supabase.co/functions/v1/record-temperature";
const char* apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3aHRxeW9wd3h6cWx0Y2x3ZHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzY1MzksImV4cCI6MjA3OTI1MjUzOX0.8dv0u0yoOFM2K7nK22cTY_X_la9qdz-kQnocyh9nYmw";  // From Supabase settings
const char* userId = "68172449-c682-48b0-a36a-b71feb3fc8a2";  // Your user ID from Supabase

// Temperature Reading Interval (milliseconds)
const unsigned long readingInterval = 60000; // Read every 60 seconds
unsigned long lastReadingTime = 0;

// Reconnection settings
const unsigned long reconnectInterval = 30000; // Try to reconnect every 30 seconds
unsigned long lastReconnectTime = 0;

void setup() {
  Serial.begin(115200);
  delay(100);
  
  Serial.println("\n\n========== Hydroponic Temperature Sensor ==========");
  Serial.println("DS18B20 Temperature Sensor + WiFi Integration");
  Serial.println("====================================================\n");
  
  sensors.begin();
  Serial.println("[SENSOR] Temperature sensor initialized");
  
  connectToWiFi();
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    unsigned long currentTime = millis();
    if (currentTime - lastReconnectTime >= reconnectInterval) {
      Serial.println("[WiFi] Connection lost. Attempting to reconnect...");
      connectToWiFi();
      lastReconnectTime = currentTime;
    }
    return;
  }

  // Check if it's time to take a reading
  unsigned long currentTime = millis();
  if (currentTime - lastReadingTime >= readingInterval) {
    recordTemperature();
    lastReadingTime = currentTime;
  }

  delay(100); // Small delay to prevent watchdog issues
}

void connectToWiFi() {
  Serial.print("[WiFi] Connecting to SSID: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] ✓ Connected!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm\n");
  } else {
    Serial.println("\n[WiFi] ✗ Failed to connect. Check credentials.\n");
  }
}

void recordTemperature() {
  // Request temperature
  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);

  // Check for sensor error
  if (temperature == DEVICE_DISCONNECTED_C) {
    Serial.println("[SENSOR] ✗ Error: Could not read temperature. Check sensor connection.");
    return;
  }

  Serial.print("[SENSOR] Temperature: ");
  Serial.print(temperature);
  Serial.println("°C");

  // Send to API
  if (WiFi.status() == WL_CONNECTED) {
    sendTemperatureToAPI(temperature);
  } else {
    Serial.println("[API] ✗ Not connected to WiFi. Skipping upload.");
  }
}

void sendTemperatureToAPI(float temperature) {
  HTTPClient http;
  
  Serial.print("[API] Sending to: ");
  Serial.println(apiEndpoint);

  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["temperature"] = temperature;
  doc["user_id"] = userId;
  doc["sensor_id"] = "ESP32_TEMP_SENSOR_001";
  doc["timestamp"] = getFormattedTimestamp();

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  Serial.print("[API] Payload: ");
  Serial.println(jsonPayload);

  // Set up HTTP connection
  http.begin(apiEndpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + apiKey);

  // Send POST request
  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    
    if (httpResponseCode == 201 || httpResponseCode == 200) {
      Serial.print("[API] ✓ Success (HTTP ");
      Serial.print(httpResponseCode);
      Serial.println(")");
      Serial.print("[API] Response: ");
      Serial.println(response);
    } else {
      Serial.print("[API] ✗ Error (HTTP ");
      Serial.print(httpResponseCode);
      Serial.println(")");
      Serial.print("[API] Response: ");
      Serial.println(response);
    }
  } else {
    Serial.print("[API] ✗ Connection failed. Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }

  http.end();
}

String getFormattedTimestamp() {
  // Returns current time (you may need NTP sync for accurate time)
  time_t now = time(nullptr);
  struct tm* timeinfo = localtime(&now);
  
  char buffer[30];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", timeinfo);
  
  return String(buffer);
}

