#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "MAX30100_PulseOximeter.h"
#include <WiFi.h>
#include <WebServer.h>

// ================= Wi-Fi Configuration =================
const char* WIFI_SSID = "Jalebi";
const char* WIFI_PASS = "123456789";

// Static IP Configuration (Target IP: 172.20.168.254 on hotspot "Jalebi")
IPAddress local_IP(172, 20, 168, 254);
IPAddress gateway(172, 20, 168, 151);
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8);

WebServer server(80);

// ================= Pins =================
#define I2C_SDA_PIN     18
#define I2C_SCL_PIN     19
#define LM35_PIN        34
#define BUZZER_PIN      25

// ================= I2C Addresses =================
#define OLED_ADDR       0x3C
#define MPU6050_ADDR    0x68
#define MPU_WHO_AM_I    0x75
#define MPU_PWR_MGMT_1  0x6B
#define MPU_ACCEL_XOUT  0x3B

#define SCREEN_WIDTH    128
#define SCREEN_HEIGHT   64
#define OLED_RESET      -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
PulseOximeter pox;

// ================= Global Telemetry State =================
float g_heartRate = 0.0f;
uint8_t g_spO2 = 0;
float g_temperatureC = 36.6f;
float g_accelMag = 1.0f;
float g_ax = 0.0f, g_ay = 0.0f, g_az = 1.0f;
bool g_isMoving = false;
bool g_fingerDetected = false;
bool g_anomaly = false;

// ================= Timers =================
uint32_t tsLastReport = 0;
const uint32_t REPORT_INTERVAL_MS = 1000; // 1-second cadence matching AWEN frontend poller

bool buzzerActive = false;
uint32_t buzzerStartTime = 0;
volatile bool beatFlag = false;

// ================= Helpers =================
void initMPU6050() {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(MPU_PWR_MGMT_1);
  Wire.write(0x00);
  Wire.endTransmission(true);
}

void readMPUAcceleration(int16_t &ax, int16_t &ay, int16_t &az) {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(MPU_ACCEL_XOUT);
  Wire.endTransmission(false);
  
  Wire.requestFrom((uint8_t)MPU6050_ADDR, (uint8_t)6);
  if (Wire.available() >= 6) {
    ax = (Wire.read() << 8) | Wire.read();
    ay = (Wire.read() << 8) | Wire.read();
    az = (Wire.read() << 8) | Wire.read();
  }
}

void onBeatDetected() {
  beatFlag = true;
}

// ================= HTTP REST Handlers =================
void handleOptions() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "*");
  server.send(204);
}

void handleRoot() {
  handleTelemetry();
}

void handleTelemetry() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "*");

  String ipStr = WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : "172.20.168.254";

  String json = "{";
  json += "\"device_id\":\"AWEN_ESP32_01\",";
  json += "\"connected\":true,";
  json += "\"status\":\"streaming\",";
  json += "\"bpm\":" + (g_fingerDetected ? String(g_heartRate, 1) : "null") + ",";
  json += "\"heart_rate\":" + (g_fingerDetected ? String(g_heartRate, 1) : "null") + ",";
  json += "\"spo2\":" + (g_fingerDetected ? String(g_spO2) : "null") + ",";
  json += "\"temp\":" + String(g_temperatureC, 1) + ",";
  json += "\"temperature\":" + String(g_temperatureC, 1) + ",";
  json += "\"accel\":{\"x\":" + String(g_ax, 2) + ",\"y\":" + String(g_ay, 2) + ",\"z\":" + String(g_az, 2) + "},";
  json += "\"accel_magnitude\":" + String(g_accelMag, 2) + ",";
  json += "\"moving\":" + String(g_isMoving ? "true" : "false") + ",";
  json += "\"finger\":" + String(g_fingerDetected ? "true" : "false") + ",";
  json += "\"finger_detected\":" + String(g_fingerDetected ? "true" : "false") + ",";
  json += "\"abnormal\":" + String(g_anomaly ? "true" : "false") + ",";
  json += "\"ip\":\"" + ipStr + "\"";
  json += "}";

  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // KEY FIX: 400kHz Fast I2C so OLED transfers take ~8ms instead of ~40ms
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  Wire.setClock(400000);

  // 1. OLED Display
  if (display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(10, 20);
    display.print(F("AWEN HEALTH NODE"));
    display.setCursor(10, 36);
    display.print(F("CONNECTING WI-FI..."));
    display.display();
  }

  // 2. Wi-Fi & Web Server Initialization
  WiFi.mode(WIFI_STA);
  // Configure static IP for 172.20.168.254 on hotspot "Jalebi"
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS)) {
    Serial.println(F("[WARN] Static IP configuration failed, using DHCP fallback"));
  }
  
  if (strlen(WIFI_SSID) > 0) {
    WiFi.begin(WIFI_SSID, WIFI_PASS);
  } else {
    WiFi.begin(); // Reconnects with NVS saved credentials
  }

  // Wait briefly for Wi-Fi (non-blocking after 4s)
  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 4000) {
    delay(200);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(F("[OK] Wi-Fi Connected. IP: "));
    Serial.println(WiFi.localIP());
    display.clearDisplay();
    display.setCursor(5, 18);
    display.print(F("WI-FI CONNECTED!"));
    display.setCursor(5, 34);
    display.print(F("IP: "));
    display.print(WiFi.localIP());
    display.display();
    delay(1000);
  } else {
    Serial.println(F("[INFO] Wi-Fi connecting in background. Target IP: 172.20.168.254"));
  }

  server.on("/", HTTP_GET, handleRoot);
  server.on("/api/telemetry", HTTP_GET, handleTelemetry);
  server.on("/api/telemetry", HTTP_OPTIONS, handleOptions);
  server.begin();
  Serial.println(F("[OK] HTTP Telemetry REST Server active on port 80"));

  // 3. MPU-6050
  initMPU6050();

  // 4. MAX30100
  if (!pox.begin()) {
    Serial.println(F("[ERR] MAX30100 init failed"));
  } else {
    Serial.println(F("[OK] MAX30100 ready"));
    pox.setOnBeatDetectedCallback(onBeatDetected);
    pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
  }
}

void loop() {
  // 1. Handle HTTP Requests
  server.handleClient();

  // 2. MUST RUN UNIMPEDED IN EVERY CYCLE
  pox.update();

  // 3. Async buzzer shut-off
  if (buzzerActive && (millis() - buzzerStartTime >= 100)) {
    digitalWrite(BUZZER_PIN, LOW);
    buzzerActive = false;
  }

  // 4. Read sensors, update OLED & publish serial JSON periodically
  if (millis() - tsLastReport > REPORT_INTERVAL_MS) {
    tsLastReport = millis();

    // 1. Vitals
    float heartRate = pox.getHeartRate();
    uint8_t spO2 = pox.getSpO2();

    // 2. Temp
    int rawADC = analogRead(LM35_PIN);
    float millivolts = (rawADC / 4095.0f) * 3300.0f;
    float temperatureC = millivolts / 10.0f;

    // 3. IMU
    int16_t ax = 0, ay = 0, az = 0;
    readMPUAcceleration(ax, ay, az);
    float normAx = ax / 16384.0f;
    float normAy = ay / 16384.0f;
    float normAz = az / 16384.0f;
    float accelMag = sqrt(pow(normAx, 2) + pow(normAy, 2) + pow(normAz, 2));

    // Update global state
    g_heartRate = heartRate;
    g_spO2 = spO2;
    g_temperatureC = temperatureC;
    g_accelMag = accelMag;
    g_ax = normAx;
    g_ay = normAy;
    g_az = normAz;
    g_isMoving = (accelMag > 1.2f || accelMag < 0.8f);
    g_fingerDetected = (spO2 > 0 && heartRate >= 35.0f && heartRate <= 220.0f);

    // 4. Alerts: Motion-Aware Context (Exertion during movement is NOT anomalous)
    bool anomaly = false;
    if (g_fingerDetected) {
      // High heart rate while stationary indicates unexercised cardiac elevation
      if (!g_isMoving && g_heartRate > 130.0f) {
        anomaly = true;
      }
      if (g_spO2 < 88) {
        anomaly = true;
      }
    }
    if (g_temperatureC > 39.0f) {
      anomaly = true;
    }
    g_anomaly = anomaly;

    // Strict 60-Second Cooldown: prevents rapid buzzer beeping loops
    static unsigned long lastBuzzerAlertTime = 0;
    if (anomaly && !buzzerActive && (millis() - lastBuzzerAlertTime > 60000)) {
      digitalWrite(BUZZER_PIN, HIGH);
      buzzerActive = true;
      buzzerStartTime = millis();
      lastBuzzerAlertTime = millis();
    }

    // 5. Draw Clean OLED UI
    display.clearDisplay();

    // Top Bar
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(2, 1);
    display.print(F("AWEN HEALTH"));

    if (beatFlag) {
      display.fillCircle(85, 4, 3, SSD1306_WHITE);
      beatFlag = false;
    } else {
      display.drawCircle(85, 4, 3, SSD1306_WHITE);
    }

    display.drawRoundRect(92, 0, 34, 9, 2, SSD1306_WHITE);
    display.setCursor(95, 1);
    display.print(anomaly ? F("ALERT") : F("STABLE"));
    display.drawLine(0, 10, 127, 10, SSD1306_WHITE);

    // BPM Card
    display.drawRoundRect(0, 13, 62, 24, 3, SSD1306_WHITE);
    display.setCursor(4, 16);
    display.print(F("BPM"));
    display.setCursor(28, 20);
    display.setTextSize(2);
    if (g_fingerDetected) display.print((int)heartRate); else display.print(F("--"));

    // SpO2 Card
    display.setTextSize(1);
    display.drawRoundRect(65, 13, 62, 24, 3, SSD1306_WHITE);
    display.setCursor(69, 16);
    display.print(F("SpO2"));
    display.setCursor(97, 20);
    display.setTextSize(2);
    if (g_fingerDetected) display.print(spO2); else display.print(F("--"));

    // Bottom Stats
    display.setTextSize(1);
    display.setCursor(2, 41);
    display.print(F("TEMP : "));
    display.print(temperatureC, 1);
    display.print(F(" C"));

    display.setCursor(2, 53);
    display.print(F("MOTN : "));
    display.print(accelMag, 2);
    display.print(F(" g"));

    display.setCursor(76, 47);
    display.print(g_fingerDetected ? F("[LOCKED]") : F("[WAITING]"));

    display.display();

    // 6. Output Standardized JSON over Serial for W3C Web Serial USB CDC Driver
    Serial.print("{\"device_id\":\"AWEN_ESP32_01\",");
    Serial.print("\"bpm\":");
    if (g_fingerDetected) Serial.print(heartRate, 1); else Serial.print("null");
    Serial.print(",\"heart_rate\":");
    if (g_fingerDetected) Serial.print(heartRate, 1); else Serial.print("null");
    Serial.print(",\"spo2\":");
    if (g_fingerDetected) Serial.print(spO2); else Serial.print("null");
    Serial.print(",\"temp\":");
    Serial.print(temperatureC, 1);
    Serial.print(",\"temperature\":");
    Serial.print(temperatureC, 1);
    Serial.print(",\"accel\":{\"x\":");
    Serial.print(normAx, 2);
    Serial.print(",\"y\":");
    Serial.print(normAy, 2);
    Serial.print(",\"z\":");
    Serial.print(normAz, 2);
    Serial.print("},\"accel_magnitude\":");
    Serial.print(accelMag, 2);
    Serial.print(",\"moving\":");
    Serial.print(g_isMoving ? "true" : "false");
    Serial.print(",\"finger\":");
    Serial.print(g_fingerDetected ? "true" : "false");
    Serial.print(",\"abnormal\":");
    Serial.print(anomaly ? "true" : "false");
    Serial.println("}");
  }
}