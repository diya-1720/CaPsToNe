/*
 * =========================================================================================
 * AWEN (Adaptive Wellness & Emotional Navigation)
 * FINAL PRODUCTION ESP32 TELEMETRY & OLED MASCOT FIRMWARE
 * =========================================================================================
 * Target Board: ESP32 Dev Module
 * Pinout Configuration:
 * - OLED SSD1306 (128x64, I2C 0x3C): SDA -> GPIO 21, SCL -> GPIO 22, 3.3V, GND
 * - MAX30100 PPG Pulse Oximeter (I2C 0x57): SDA -> GPIO 21, SCL -> GPIO 22, 3.3V, GND
 * - MPU Sensor (6-DOF IMU, I2C 0x68): SDA -> GPIO 21, SCL -> GPIO 22, 3.3V, GND
 *   (Uses robust direct-register I2C reading compatible with MPU-6050 & MPU-6500 WHO_AM_I 0x70)
 * - LM35 Precision Analog Temp Sensor: Analog VOUT -> GPIO 34 (ADC1_CH6), 3.3V/5V, GND
 * - Active Buzzer: (+) -> GPIO 25, (-) -> GND
 * 
 * Required Arduino IDE Libraries:
 * - Adafruit SSD1306
 * - Adafruit GFX Library
 * - MAX30100lib (by Gabriel Bichat / OXullo Intervent)
 * =========================================================================================
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "MAX30100_PulseOximeter.h"

// ----------------- Pin Definitions -----------------
#define I2C_SDA_PIN   21
#define I2C_SCL_PIN   22
#define LM35_ADC_PIN  34  // Analog Input on GPIO 34
#define BUZZER_PIN    25  // Active Buzzer on GPIO 25

// ----------------- I2C Addresses -------------------
#define OLED_ADDR     0x3C
#define MPU_ADDR      0x68
#define MAX30100_ADDR 0x57

// ----------------- OLED Display --------------------
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
bool oledDetected = false;

// ----------------- MAX30100 PPG Sensor -------------
PulseOximeter pox;
bool maxDetected = false;

// Robust Pulse Validation Variables
float validatedBpm = 0.0f;
float validatedSpo2 = 0.0f;
bool isBpmReliable = false;
uint8_t consecutiveValidBeats = 0;
uint32_t lastBeatTimeMs = 0;
#define MIN_VALID_BPM 42.0f
#define MAX_VALID_BPM 210.0f
#define BEATS_REQUIRED_FOR_LOCK 3

// ----------------- MPU IMU (Raw Registers) ---------
bool mpuDetected = false;
float accelX = 0.0f, accelY = 0.0f, accelZ = 1.0f;
float gyroX = 0.0f, gyroY = 0.0f, gyroZ = 0.0f;
float accelMagnitude = 1.0f;
bool isMoving = false;

// ----------------- LM35 Temperature ---------------
float currentTempC = 0.0f;
bool isTempValid = false;

// ----------------- Abnormality Detection -----------
bool isAbnormal = false;
bool bpmAbnormal = false;
bool spo2Abnormal = false;
bool tempAbnormal = false;
bool motionAbnormal = false;
const char* activeAlertReason = "";

// ----------------- Buzzer State --------------------
unsigned long buzzerEndTime = 0;
bool buzzerIsBeeping = false;

void triggerBuzzer(uint16_t durationMs) {
  digitalWrite(BUZZER_PIN, HIGH);
  buzzerEndTime = millis() + durationMs;
  buzzerIsBeeping = true;
}

void updateBuzzer() {
  if (buzzerIsBeeping && millis() >= buzzerEndTime) {
    digitalWrite(BUZZER_PIN, LOW);
    buzzerIsBeeping = false;
  }
}

// ----------------- OLED Screen Rotation ------------
uint8_t currentOledScreen = 0; // 0 = Mascot, 1 = Vitals, 2 = IMU / Status
unsigned long lastScreenRotateTime = 0;
#define SCREEN_ROTATE_INTERVAL_MS 2800

// ----------------- Telemetry Period ----------------
unsigned long lastTelemetryReportTime = 0;
#define TELEMETRY_INTERVAL_MS 500

// ----------------- MAX30100 Beat Callback ----------
void onBeatDetected() {
  uint32_t now = millis();
  uint32_t deltaBeat = now - lastBeatTimeMs;
  lastBeatTimeMs = now;

  // Validate physiological inter-beat interval (between 285ms and 1428ms corresponds to 42 - 210 BPM)
  if (deltaBeat >= 285 && deltaBeat <= 1428) {
    consecutiveValidBeats++;
    if (consecutiveValidBeats >= BEATS_REQUIRED_FOR_LOCK) {
      float instantBpm = 60000.0f / (float)deltaBeat;
      if (instantBpm >= MIN_VALID_BPM && instantBpm <= MAX_VALID_BPM) {
        validatedBpm = instantBpm;
        isBpmReliable = true;
      }
    }
  } else {
    // Reset consecutive beat count on noise / erratic beat
    consecutiveValidBeats = 0;
  }
}

// ----------------- Direct MPU I2C Reader -----------
void initRawMpu() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1 register
  Wire.write(0x00); // Wake up MPU
  if (Wire.endTransmission() == 0) {
    mpuDetected = true;
    Serial.println("[INIT] MPU-6050/6500 (0x68): OK (Raw I2C Active)");
  } else {
    mpuDetected = false;
    Serial.println("[INIT] MPU Sensor (0x68): NOT DETECTED (Check wiring)");
  }
}

void readRawMpu() {
  if (!mpuDetected) return;

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); // Starting from ACCEL_XOUT_H
  if (Wire.endTransmission(false) != 0) return;

  Wire.requestFrom((uint8_t)MPU_ADDR, (size_t)14, true);
  if (Wire.available() >= 14) {
    int16_t rawAx = (Wire.read() << 8) | Wire.read();
    int16_t rawAy = (Wire.read() << 8) | Wire.read();
    int16_t rawAz = (Wire.read() << 8) | Wire.read();
    int16_t rawT  = (Wire.read() << 8) | Wire.read();
    int16_t rawGx = (Wire.read() << 8) | Wire.read();
    int16_t rawGy = (Wire.read() << 8) | Wire.read();
    int16_t rawGz = (Wire.read() << 8) | Wire.read();

    // Convert raw 16-bit counts to g-force (default scale: +/- 2g => 16384 LSB/g)
    accelX = (float)rawAx / 16384.0f;
    accelY = (float)rawAy / 16384.0f;
    accelZ = (float)rawAz / 16384.0f;
    accelMagnitude = sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);

    // Convert gyro to deg/sec (default scale: 131 LSB / deg/s)
    gyroX = (float)rawGx / 131.0f;
    gyroY = (float)rawGy / 131.0f;
    gyroZ = (float)rawGz / 131.0f;

    // Movement detection threshold
    isMoving = (accelMagnitude > 1.18f || accelMagnitude < 0.82f);
  }
}

// ----------------- LM35 Averaged Reader ------------
void readLm35() {
  // Average 16 analog samples to suppress electrical ADC noise
  long sum = 0;
  for (int i = 0; i < 16; i++) {
    sum += analogRead(LM35_ADC_PIN);
    delayMicroseconds(80);
  }
  float avgAdc = (float)sum / 16.0f;
  float millivolts = (avgAdc / 4095.0f) * 3300.0f; // 3.3V reference
  float computedTemp = millivolts / 10.0f;          // LM35 is 10mV / degree C

  if (computedTemp >= 20.0f && computedTemp <= 45.0f) {
    currentTempC = computedTemp;
    isTempValid = true;
  } else {
    isTempValid = false;
  }
}

// ----------------- OLED Mascot Graphics ------------
void drawAwenMascot(bool alertState) {
  // Mascot Head Outer Capsule
  display.drawRoundRect(46, 12, 36, 30, 8, SSD1306_WHITE);

  if (!alertState) {
    // Friendly Ears / Crystal Fins
    display.fillTriangle(48, 12, 44, 4, 54, 12, SSD1306_WHITE);
    display.fillTriangle(80, 12, 84, 4, 74, 12, SSD1306_WHITE);

    // Friendly Eyes: ^  ^
    display.drawLine(53, 24, 57, 20, SSD1306_WHITE);
    display.drawLine(57, 20, 61, 24, SSD1306_WHITE);

    display.drawLine(67, 24, 71, 20, SSD1306_WHITE);
    display.drawLine(71, 20, 75, 24, SSD1306_WHITE);

    // Friendly Small Smile: \__/
    display.drawLine(58, 32, 61, 35, SSD1306_WHITE);
    display.drawLine(61, 35, 67, 35, SSD1306_WHITE);
    display.drawLine(67, 35, 70, 32, SSD1306_WHITE);

    // Cheerful Little Blush Dots
    display.drawPixel(52, 30, SSD1306_WHITE);
    display.drawPixel(76, 30, SSD1306_WHITE);
  } else {
    // Alert Drooped Fins
    display.fillTriangle(46, 16, 40, 22, 46, 24, SSD1306_WHITE);
    display.fillTriangle(82, 16, 88, 22, 82, 24, SSD1306_WHITE);

    // Concerned Wide Eyes: O  O
    display.drawCircle(57, 22, 3, SSD1306_WHITE);
    display.fillCircle(57, 22, 1, SSD1306_WHITE);

    display.drawCircle(71, 22, 3, SSD1306_WHITE);
    display.fillCircle(71, 22, 1, SSD1306_WHITE);

    // Concerned Mouth: ~
    display.drawLine(59, 34, 62, 32, SSD1306_WHITE);
    display.drawLine(62, 32, 66, 32, SSD1306_WHITE);
    display.drawLine(66, 32, 69, 34, SSD1306_WHITE);
  }
}

// ----------------- OLED Multi-Screen Engine --------
void renderOled() {
  if (!oledDetected) return;

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // If abnormal, lock immediately to Mascot Alert or rotate
  if (isAbnormal && currentOledScreen != 0 && currentOledScreen != 1) {
    currentOledScreen = 0;
  }

  // SCREEN 0: AWEN Mascot & Interactive State
  if (currentOledScreen == 0) {
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("AWEN");
    display.setCursor(75, 0);
    display.print(isAbnormal ? "[ALERT]" : "[NORMAL]");
    display.drawLine(0, 9, 127, 9, SSD1306_WHITE);

    drawAwenMascot(isAbnormal);

    // Bottom Well-Being Prompt
    display.setCursor(isAbnormal ? 24 : 18, 48);
    display.print(isAbnormal ? "\"ARE YOU OK?\"" : "\"HOW ARE YOU?\"");

    if (isAbnormal) {
      display.setCursor(20, 56);
      display.print(activeAlertReason);
    } else {
      display.setCursor(30, 56);
      display.print(isMoving ? "ACTIVE REST" : "QUIET RHYTHM");
    }
  }
  // SCREEN 1: Real-Time Physiological Vitals
  else if (currentOledScreen == 1) {
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("AWEN VITALS");
    display.setCursor(80, 0);
    display.print(isMoving ? "ACTIVE" : "RESTING");
    display.drawLine(0, 9, 127, 9, SSD1306_WHITE);

    // Line 1: Heart Rate
    display.setCursor(0, 14);
    display.print("HEART RATE: ");
    if (isBpmReliable && validatedBpm > 0) {
      display.print((int)validatedBpm);
      display.print(" BPM");
    } else if (consecutiveValidBeats > 0) {
      display.print("Measuring...");
    } else {
      display.print("-- BPM");
    }

    // Line 2: SpO2
    display.setCursor(0, 26);
    display.print("OXYGEN    : ");
    if (validatedSpo2 > 70.0f) {
      display.print((int)validatedSpo2);
      display.print(" %");
    } else {
      display.print("-- %");
    }

    // Line 3: Skin Temperature
    display.setCursor(0, 38);
    display.print("SKIN TEMP : ");
    if (isTempValid) {
      display.print(currentTempC, 1);
      display.print(" C");
    } else {
      display.print("-- (N/A)");
    }

    // Line 4: Finger Contact Status
    display.setCursor(0, 50);
    display.print("PPG SENSOR: ");
    if (isBpmReliable) {
      display.print("LOCKED [OK]");
    } else if (consecutiveValidBeats > 0) {
      display.print("CALIBRATING");
    } else {
      display.print("PLACE FINGER");
    }
  }
  // SCREEN 2: 6-DOF IMU Motion & System Status
  else if (currentOledScreen == 2) {
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("AWEN MOTION");
    display.setCursor(75, 0);
    display.print(mpuDetected ? "MPU 6050" : "NO IMU");
    display.drawLine(0, 9, 127, 9, SSD1306_WHITE);

    display.setCursor(0, 14);
    display.print("ACCEL MAG : ");
    display.print(accelMagnitude, 2);
    display.print(" g");

    display.setCursor(0, 26);
    display.print("ACTIVITY  : ");
    display.print(isMoving ? "MOVEMENT / WALK" : "STILL / RESTING");

    display.setCursor(0, 38);
    display.print("GYRO Z    : ");
    display.print((int)gyroZ);
    display.print(" dps");

    display.setCursor(0, 50);
    display.print("SYSTEM    : READY");
  }

  display.display();
}

// ----------------- Arduino Setup -------------------
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("=================================================");
  Serial.println("  AWEN ESP32 TELEMETRY NODE (OLED+MAX+MPU+LM35) ");
  Serial.println("=================================================");

  // 1. Initialize Buzzer Pin
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  triggerBuzzer(120); // Power-on confirmation beep

  // 2. Configure ADC for LM35
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // 3. Initialize Shared I2C Bus at 100 kHz
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  Wire.setClock(100000);

  // 4. Initialize OLED Display (0x3C)
  if (display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    oledDetected = true;
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);
    display.setCursor(14, 12);
    display.println("AWEN PLATFORM");
    display.setCursor(8, 28);
    display.println("Calibrating Sensors");
    display.drawLine(8, 42, 120, 42, SSD1306_WHITE);
    display.display();
    Serial.println("[INIT] SSD1306 OLED (0x3C): OK");
  } else {
    Serial.println("[INIT] SSD1306 OLED (0x3C): FAILED");
  }

  // 5. Initialize Raw MPU Register Interface (0x68)
  initRawMpu();

  // 6. Initialize MAX30100 (0x57)
  if (pox.begin()) {
    maxDetected = true;
    pox.setOnBeatDetectedCallback(onBeatDetected);
    pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA); // Conservative LED current
    Serial.println("[INIT] MAX30100 PPG (0x57): OK");
  } else {
    Serial.println("[INIT] MAX30100 PPG (0x57): FAILED (Check VCC/GND)");
  }

  delay(1200);
  Serial.println("[READY] Continuous streaming active at 115200 baud.");
}

// ----------------- Arduino Main Loop ---------------
void loop() {
  // CRITICAL: pox.update() must execute as frequently as possible
  if (maxDetected) {
    pox.update();
  }

  // Update Non-blocking Buzzer
  updateBuzzer();

  // Screen Rotation Timer (Every 2.8 seconds)
  if (millis() - lastScreenRotateTime >= SCREEN_ROTATE_INTERVAL_MS) {
    lastScreenRotateTime = millis();
    currentOledScreen = (currentOledScreen + 1) % 3;
  }

  // Periodic Sensor Read & Telemetry Output (Every 500 ms)
  if (millis() - lastTelemetryReportTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryReportTime = millis();

    // 1. Read MPU Sensors via Direct Registers
    readRawMpu();

    // 2. Read LM35 Averaged Analog Temperature
    readLm35();

    // 3. Read MAX30100 Pulse Data
    float currentRawPoxHr = 0.0f;
    float currentRawSpo2 = 0.0f;
    if (maxDetected) {
      currentRawPoxHr = pox.getHeartRate();
      currentRawSpo2 = pox.getSpO2();
    }

    // PPG Heartbeat Timeout Check: If no beat seen for 3.5 seconds, reset reliable lock
    if (millis() - lastBeatTimeMs > 3500) {
      isBpmReliable = false;
      consecutiveValidBeats = 0;
      validatedBpm = 0.0f;
      validatedSpo2 = 0.0f;
    } else {
      if (currentRawSpo2 >= 70.0f && currentRawSpo2 <= 100.0f) {
        validatedSpo2 = currentRawSpo2;
      }
    }

    bool fingerPlaced = isBpmReliable && (validatedBpm > 0.0f);

    // 4. Unified Abnormality Detection
    bpmAbnormal = false;
    spo2Abnormal = false;
    tempAbnormal = false;
    motionAbnormal = false;

    // Resting Tachycardia / Bradycardia Alert (Only when stationary and BPM is strictly verified)
    if (fingerPlaced && !isMoving) {
      if (validatedBpm > 105.0f) {
        bpmAbnormal = true;
        activeAlertReason = "ELEVATED HR";
      } else if (validatedBpm < 48.0f) {
        bpmAbnormal = true;
        activeAlertReason = "LOW HR";
      }
    }

    // Oxygen Desaturation Alert (Only when valid finger placed)
    if (fingerPlaced && validatedSpo2 > 70.0f && validatedSpo2 < 92.0f) {
      spo2Abnormal = true;
      activeAlertReason = "LOW SpO2";
    }

    // Skin Thermal Elevation (Pyrexia) Alert
    if (isTempValid && currentTempC > 38.0f) {
      tempAbnormal = true;
      activeAlertReason = "ELEVATED TEMP";
    }

    // Motion Alert (High impact jerk)
    if (accelMagnitude > 2.6f) {
      motionAbnormal = true;
      activeAlertReason = "SUDDEN MOTION";
    }

    isAbnormal = (bpmAbnormal || spo2Abnormal || tempAbnormal || motionAbnormal);

    // Buzzer Alert Logic: Trigger short distinct alert beep on abnormal events (Do NOT buzz on finger removed)
    if (isAbnormal) {
      triggerBuzzer(80);
    }

    // 5. Update OLED Display
    renderOled();

    // 6. Output Standardized JSON for Web Serial API & Browser Dashboard
    Serial.print("{\"bpm\":");
    if (fingerPlaced) {
      Serial.print(validatedBpm, 1);
    } else {
      Serial.print("null");
    }
    Serial.print(",\"heart_rate\":");
    if (fingerPlaced) {
      Serial.print(validatedBpm, 1);
    } else {
      Serial.print("null");
    }
    Serial.print(",\"spo2\":");
    if (fingerPlaced && validatedSpo2 > 70.0f) {
      Serial.print(validatedSpo2, 1);
    } else {
      Serial.print("null");
    }
    Serial.print(",\"temp\":");
    if (isTempValid) {
      Serial.print(currentTempC, 1);
    } else {
      Serial.print("null");
    }
    Serial.print(",\"temperature\":");
    if (isTempValid) {
      Serial.print(currentTempC, 1);
    } else {
      Serial.print("null");
    }
    Serial.print(",\"accel\":{\"x\":");
    Serial.print(accelX, 2);
    Serial.print(",\"y\":");
    Serial.print(accelY, 2);
    Serial.print(",\"z\":");
    Serial.print(accelZ, 2);
    Serial.print("},\"accel_magnitude\":");
    Serial.print(accelMagnitude, 2);
    Serial.print(",\"moving\":");
    Serial.print(isMoving ? "true" : "false");
    Serial.print(",\"finger\":");
    Serial.print(fingerPlaced ? "true" : "false");
    Serial.print(",\"abnormal\":");
    Serial.print(isAbnormal ? "true" : "false");
    Serial.println("}");
  }
}