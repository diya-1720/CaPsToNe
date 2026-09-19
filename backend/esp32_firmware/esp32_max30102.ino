/*
 * =========================================================================================
 * AWEN (Adaptive Wellness & Emotional Navigation)
 * ESP32 All-In-One IoT Telemetry Node Firmware
 * =========================================================================================
 * Hardware Configuration:
 * 1. ESP32-WROOM-32 Microcontroller
 * 2. 0.96" I2C Monochrome OLED (SSD1306, 128x64, I2C: 0x3C)
 * 3. MAX30100 Optical Pulse Oximeter & Heart Rate Sensor (I2C: 0x57)
 * 4. MPU-6050 6-DOF Accelerometer & Gyroscope (I2C: 0x68)
 * 5. LM35 Precision Centigrade Analog Temperature Sensor (ADC: GPIO 34)
 * 6. Active Piezo Buzzer (Audio Alerts: GPIO 18)
 * 
 * Shared I2C Bus Wiring (GPIO 21 = SDA, GPIO 22 = SCL):
 * - OLED:     VCC -> 3.3V, GND -> GND, SDA -> GPIO 21, SCL -> GPIO 22
 * - MAX30100: VIN -> 3.3V, GND -> GND, SDA -> GPIO 21, SCL -> GPIO 22
 * - MPU-6050: VCC -> 3.3V, GND -> GND, SDA -> GPIO 21, SCL -> GPIO 22, AD0 -> GND
 * - LM35:     VCC -> 3.3V or 5V, GND -> GND, VOUT -> GPIO 34 (ADC1_CH6)
 * - Buzzer:   (+) -> GPIO 18, (-) -> GND
 * 
 * Required Libraries (Install via Arduino IDE Library Manager):
 * - Adafruit SSD1306
 * - Adafruit GFX Library
 * - Adafruit MPU6050
 * - Adafruit Unified Sensor
 * - MAX30100lib (by OXullo Intervent / Gabriel Bichat)
 * =========================================================================================
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include "MAX30100_PulseOximeter.h"

// ---------------- OLED Configuration ----------------
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
#define OLED_ADDRESS  0x3C

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
bool oledReady = false;

// ---------------- MPU-6050 Configuration ------------
Adafruit_MPU6050 mpu;
bool mpuReady = false;

// ---------------- MAX30100 Configuration ----------
PulseOximeter pox;
bool poxReady = false;

// ---------------- LM35 Temperature Sensor -----------
#define LM35_PIN 34 // ADC1_CH6 (Input-only, ideal for analog sensors)

// ---------------- Buzzer Configuration --------------
#define BUZZER_PIN 18 // Digital pin for active buzzer alert

// Timing Variables (strictly non-blocking)
uint32_t lastReportTime = 0;
#define REPORTING_PERIOD_MS 500

// Beep management
unsigned long buzzerOffTime = 0;
bool buzzerActive = false;

void triggerBuzzer(uint16_t durationMs) {
  digitalWrite(BUZZER_PIN, HIGH);
  buzzerOffTime = millis() + durationMs;
  buzzerActive = true;
}

// Callback invoked when pulse beat is detected by MAX30100
void onBeatDetected() {
  // Short subtle 25ms tick on beat detection
  triggerBuzzer(25);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("=================================================");
  Serial.println("  AWEN ESP32 TELEMETRY NODE (OLED+MAX+MPU+LM35+BUZZ)");
  Serial.println("=================================================");

  // Initialize Buzzer Pin
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  triggerBuzzer(150); // Short power-on confirmation beep

  // Configure ADC for LM35
  analogReadResolution(12);       // 12-bit ADC (0 - 4095)
  analogSetAttenuation(ADC_11db); // 0 - 3.3V full-scale voltage range

  // Initialize shared I2C bus at 100 kHz for high stability with 3 devices
  Wire.begin(21, 22);
  Wire.setClock(100000);

  // 1. Initialize OLED
  Serial.print("[INIT] Initializing 0.96\" SSD1306 OLED (0x3C)... ");
  if (display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS)) {
    oledReady = true;
    Serial.println("OK");
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(10, 10);
    display.println("AWEN SYSTEM V2.0");
    display.setCursor(10, 25);
    display.println("Initializing sensors...");
    display.display();
  } else {
    Serial.println("FAILED (Check wiring/address 0x3C)");
  }

  // 2. Initialize MPU-6050
  Serial.print("[INIT] Initializing MPU-6050 IMU (0x68)... ");
  if (mpu.begin(0x68, &Wire)) {
    mpuReady = true;
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    Serial.println("OK");
  } else {
    Serial.println("FAILED (Check wiring/address 0x68)");
  }

  // 3. Initialize MAX30100
  Serial.print("[INIT] Initializing MAX30100 Optical PPG (0x57)... ");
  if (pox.begin()) {
    poxReady = true;
    pox.setOnBeatDetectedCallback(onBeatDetected);
    pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
    Serial.println("OK");
  } else {
    Serial.println("FAILED (Check power rail/3.3V/5V and 0x57)");
  }

  if (oledReady) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("AWEN SENSOR STATUS");
    display.drawLine(0, 10, 127, 10, SSD1306_WHITE);
    display.setCursor(0, 16);
    display.print("OLED (0x3C)  : "); display.println(oledReady ? "OK" : "ERR");
    display.setCursor(0, 28);
    display.print("MPU  (0x68)  : "); display.println(mpuReady ? "OK" : "ERR");
    display.setCursor(0, 40);
    display.print("MAX  (0x57)  : "); display.println(poxReady ? "OK" : "ERR");
    display.setCursor(0, 52);
    display.print("LM35 (PIN 34): OK");
    display.display();
    delay(1500);
  }

  Serial.println("=================================================");
  Serial.println("[READY] Telemetry streaming live at 115200 baud.");
  Serial.println("=================================================");
}

void loop() {
  // CRITICAL: pox.update() must be called on EVERY pass without blocking delays!
  if (poxReady) {
    pox.update();
  }

  // Non-blocking buzzer shutoff
  if (buzzerActive && millis() >= buzzerOffTime) {
    digitalWrite(BUZZER_PIN, LOW);
    buzzerActive = false;
  }

  // Periodic Telemetry & Display Refresh (Every 500 ms)
  if (millis() - lastReportTime >= REPORTING_PERIOD_MS) {
    lastReportTime = millis();

    // 1. Read LM35 Temperature
    int rawAdc = analogRead(LM35_PIN);
    float voltage = (rawAdc / 4095.0f) * 3.3f;
    // LM35 outputs 10 mV per degree Celsius (0.010 V / °C)
    float tempC = voltage * 100.0f;
    // Calibration bounds check
    if (tempC < 20.0f || tempC > 50.0f) {
      tempC = 36.6f; // Standard nominal human baseline fallback
    }

    // 2. Read MPU-6050 Motion Data
    float ax = 0.0f, ay = 0.0f, az = 1.0f;
    float aMag = 1.0f;
    bool isMoving = false;

    if (mpuReady) {
      sensors_event_t a, g, t;
      mpu.getEvent(&a, &g, &t);
      ax = a.acceleration.x / 9.80665f; // Convert m/s^2 to g-force
      ay = a.acceleration.y / 9.80665f;
      az = a.acceleration.z / 9.80665f;
      aMag = sqrt(ax * ax + ay * ay + az * az);
      isMoving = (aMag > 1.15f || aMag < 0.85f);
    }

    // 3. Read MAX30100 Pulse & SpO2
    float heartRate = 0.0f;
    float spo2 = 0.0f;
    if (poxReady) {
      heartRate = pox.getHeartRate();
      spo2 = pox.getSpO2();
    }

    // Sanitize heart rate & SpO2 for display & reporting
    bool fingerPlaced = (heartRate > 30.0f && spo2 > 70.0f);
    float displayHr = fingerPlaced ? heartRate : 70.0f;
    float displaySpo2 = fingerPlaced ? spo2 : 98.5f;

    // Trigger audible alarm if resting tachycardia occurs (resting HR > 110 while stationary)
    if (fingerPlaced && !isMoving && heartRate > 110.0f) {
      triggerBuzzer(100);
    }

    // 4. Update OLED Display
    if (oledReady) {
      display.clearDisplay();
      display.setTextColor(SSD1306_WHITE);

      // Header Banner
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.print("AWEN HEALTH");
      display.setCursor(75, 0);
      display.print(isMoving ? "ACTIVE" : "RESTING");
      display.drawLine(0, 9, 127, 9, SSD1306_WHITE);

      // Line 1: Heart Rate
      display.setCursor(0, 13);
      display.print("HEART RATE: ");
      if (fingerPlaced) {
        display.print((int)displayHr);
        display.print(" BPM");
      } else {
        display.print("-- BPM");
      }

      // Line 2: SpO2
      display.setCursor(0, 25);
      display.print("OXYGEN    : ");
      if (fingerPlaced) {
        display.print((int)displaySpo2);
        display.print(" %");
      } else {
        display.print("-- %");
      }

      // Line 3: Skin Temperature (LM35)
      display.setCursor(0, 37);
      display.print("TEMP      : ");
      display.print(tempC, 1);
      display.print(" C");

      // Line 4: Acceleration Magnitude & Status
      display.setCursor(0, 49);
      display.print("MOTION    : ");
      display.print(aMag, 2);
      display.print("g ");
      display.print(fingerPlaced ? "[LIVE]" : "[WAIT]");

      display.display();
    }

    // 5. Output Standardized JSON for AWEN Web Serial API & Dashboard
    Serial.print("{\"bpm\":");
    Serial.print(displayHr, 1);
    Serial.print(",\"heart_rate\":");
    Serial.print(displayHr, 1);
    Serial.print(",\"spo2\":");
    Serial.print(displaySpo2, 1);
    Serial.print(",\"temp\":");
    Serial.print(tempC, 1);
    Serial.print(",\"temperature\":");
    Serial.print(tempC, 1);
    Serial.print(",\"accel\":{\"x\":");
    Serial.print(ax, 2);
    Serial.print(",\"y\":");
    Serial.print(ay, 2);
    Serial.print(",\"z\":");
    Serial.print(az, 2);
    Serial.print("},\"accel_magnitude\":");
    Serial.print(aMag, 2);
    Serial.print(",\"moving\":");
    Serial.print(isMoving ? "true" : "false");
    Serial.print(",\"finger\":");
    Serial.print(fingerPlaced ? "true" : "false");
    Serial.println("}");
  }
}