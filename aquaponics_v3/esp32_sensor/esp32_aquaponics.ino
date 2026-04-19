/*
  🌱 ESP32 Aquaponics Sensor Module
  
  This sketch reads multiple sensors (temperature, pH, humidity, water level)
  and sends data to the backend server via WiFi.
  
  Requires:
  - ESP32 Development Board
  - DHT22 (temperature + humidity sensor)
  - Analog sensors (pH probe, water level)
  - 4.7kΩ & 10kΩ resistors for pH sensor
  - Water level float sensor
  
  Install libraries:
  - DHT sensor library by Adafruit (1.4.4)
  - AsyncHTTPClient or HTTPClient
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"
#include <SPIFFS.h>

// ─── WiFi Configuration ──────────────────────────────────────────────────────
const char* SSID = "YOUR_SSID";
const char* PASSWORD = "YOUR_PASSWORD";
const char* BACKEND_URL = "http://192.168.1.100:5000/api/sensors/data";
const char* DEVICE_ID = "esp32-aquaponics-01";

// ─── Sensor Pins ─────────────────────────────────────────────────────────────
#define DHT_PIN 4              // DHT22 data pin (GPIO 4)
#define DHT_TYPE DHT22         // DHT 22 sensor
#define PH_SENSOR_PIN 34       // Analog input for pH sensor (ADC1_CH6)
#define WATER_LEVEL_PIN 35     // Analog input for water level (ADC1_CH7)
#define WATER_TEMP_PIN 36      // Analog input for DS18B20 or thermistor (ADC1_CH0)

// ─── Sensor Objects & Variables ──────────────────────────────────────────────
DHT dht(DHT_PIN, DHT_TYPE);

// Sensor read interval (milliseconds)
const unsigned long SENSOR_INTERVAL = 10000;  // Read every 10 seconds
const unsigned long SEND_INTERVAL = 30000;    // Send every 30 seconds (or after 3 reads)
unsigned long lastSensorRead = 0;
unsigned long lastDataSend = 0;

// Sensor data buffer (average of multiple reads)
struct SensorBuffer {
  float waterTemp = 0;
  float roomTemp = 0;
  float humidity = 0;
  float waterlevel = 0;
  float ph = 0;
  int readCount = 0;
};
SensorBuffer sensorBuffer;

// Setup WiFi and perform initial configuration
void setupWiFi() {
  Serial.println("\n🔌 Starting WiFi connection...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n✗ WiFi connection failed!");
  }
}

// Initialize sensors
void setupSensors() {
  Serial.println("🌱 Initializing sensors...");
  
  // DHT22 initialization
  dht.begin();
  
  // Analog pins (no setup needed, just read)
  pinMode(PH_SENSOR_PIN, INPUT);
  pinMode(WATER_LEVEL_PIN, INPUT);
  pinMode(WATER_TEMP_PIN, INPUT);
  
  Serial.println("✓ Sensors initialized");
}

// Read water temperature from thermistor or analog sensor
float readWaterTemperature() {
  int rawValue = analogRead(WATER_TEMP_PIN);
  // Convert ADC value to temperature (example for thermistor)
  // This is simplified; adjust based on your specific sensor
  float voltage = rawValue * (3.3 / 4095.0);
  float temp = (voltage - 0.5) * 100;  // Example scaling
  temp = constrain(temp, -10, 60);
  return temp;
}

// Read room temperature and humidity from DHT22
void readDHT22() {
  float humidity = dht.readHumidity();
  float temp = dht.readTemperature();

  if (isnan(humidity) || isnan(temp)) {
    Serial.println("✗ DHT22 read failed");
    return;
  }

  Serial.print("🌡 Room Temp: ");
  Serial.print(temp);
  Serial.print("°C | Humidity: ");
  Serial.print(humidity);
  Serial.println("%");

  sensorBuffer.roomTemp += temp;
  sensorBuffer.humidity += humidity;
}

// Read water level (analog sensor with 0-100% mapping)
float readWaterLevel() {
  int rawValue = analogRead(WATER_LEVEL_PIN);
  // Assuming 0 ADC = 0% (empty), 4095 ADC = 100% (full)
  float level = constrain(map(rawValue, 0, 4095, 0, 100), 0, 100);
  return level;
}

// Read pH sensor (0-14 scale)
float readPH() {
  int rawValue = analogRead(PH_SENSOR_PIN);
  // pH = 7 + (voltage - 2.5V) / 0.059V per pH unit
  float voltage = rawValue * (3.3 / 4095.0);
  float ph = 7.0 + (voltage - 2.5) / 0.059;
  ph = constrain(ph, 0, 14);
  return ph;
}

// Collect sensor readings
void collectSensorData() {
  // Water temperature
  float waterTemp = readWaterTemperature();
  sensorBuffer.waterTemp += waterTemp;

  // Room temperature and humidity
  readDHT22();

  // Water level
  float waterLevel = readWaterLevel();
  sensorBuffer.waterlevel += waterLevel;

  // pH level
  float ph = readPH();
  sensorBuffer.ph += ph;

  sensorBuffer.readCount++;

  Serial.print("📊 Reading #");
  Serial.print(sensorBuffer.readCount);
  Serial.print(" | Water: ");
  Serial.print(waterTemp);
  Serial.print("°C | Level: ");
  Serial.print(waterLevel);
  Serial.print("% | pH: ");
  Serial.println(ph);
}

// Calculate averages and prepare JSON payload
void prepareSensorPayload(JsonDocument& doc) {
  if (sensorBuffer.readCount == 0) {
    Serial.println("✗ No sensor readings collected");
    return;
  }

  doc["deviceId"] = DEVICE_ID;
  doc["waterTemperature"] = sensorBuffer.waterTemp / sensorBuffer.readCount;
  doc["roomTemperature"] = sensorBuffer.roomTemp / sensorBuffer.readCount;
  doc["humidity"] = sensorBuffer.humidity / sensorBuffer.readCount;
  doc["waterLevel"] = sensorBuffer.waterlevel / sensorBuffer.readCount;
  doc["ph"] = sensorBuffer.ph / sensorBuffer.readCount;
  doc["timestamp"] = millis() / 1000;
  doc["signalStrength"] = WiFi.RSSI();

  // Reset buffer
  sensorBuffer.waterTemp = 0;
  sensorBuffer.roomTemp = 0;
  sensorBuffer.humidity = 0;
  sensorBuffer.waterlevel = 0;
  sensorBuffer.ph = 0;
  sensorBuffer.readCount = 0;
}

// Send data to backend server
void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi not connected. Reconnecting...");
    setupWiFi();
    return;
  }

  // Create JSON payload
  StaticJsonDocument<512> doc;
  prepareSensorPayload(doc);

  String payload;
  serializeJson(doc, payload);

  Serial.println("📤 Sending data to backend...");
  Serial.print("Payload: ");
  Serial.println(payload);

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.setConnectTimeout(5000);
  http.setTimeout(5000);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("✓ Response code: ");
    Serial.println(httpResponseCode);
    Serial.print("Response: ");
    Serial.println(response);
  } else {
    Serial.print("✗ Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }

  http.end();
}

// Main setup function
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n╔════════════════════════════════════════════════════════════╗");
  Serial.println("║      🌱 ESP32 Aquaponics Sensor Module v1.0            ║");
  Serial.println("╚════════════════════════════════════════════════════════════╝");

  setupWiFi();
  setupSensors();

  Serial.println("\n✓ Setup complete! Starting data collection...\n");
}

// Main loop function
void loop() {
  unsigned long currentMillis = millis();

  // Read sensors at SENSOR_INTERVAL
  if (currentMillis - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = currentMillis;
    collectSensorData();
  }

  // Send data at SEND_INTERVAL
  if (currentMillis - lastDataSend >= SEND_INTERVAL) {
    lastDataSend = currentMillis;
    sendSensorData();
  }

  // WiFi keepalive check
  if (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    setupWiFi();
  }

  delay(100);  // Prevent watchdog reset
}
