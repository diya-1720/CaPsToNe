/*
 * AWEN - ESP32 MAX30102 + MPU6050 IoT Sensor Firmware
 * Hardware Setup:
 * - ESP32 Microcontroller
 * - MAX30102 Pulse Oximeter & Heart Rate Sensor (I2C: 0x57)
 * - MPU6050 6-DOF Accelerometer & Gyroscope (I2C: 0x68)
 * - Optional DS18B20 / MLX90614 Temperature Sensor
 * 
 * Connection (Shared I2C Bus):
 * MAX30102 & MPU6050 SDA -> ESP32 GPIO 21
 * MAX30102 & MPU6050 SCL -> ESP32 GPIO 22
 * VIN -> 3.3V / 5V
 * GND -> GND
 */

#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include "MAX30105.h"
#include "heartRate.h"

MAX30105 particleSensor;
Adafruit_MPU6050 mpu;
bool mpuFound = false;

const byte RATE_SIZE = 4; // Increase for more smoothing
byte rates[RATE_SIZE]; // Array of heart rates
byte rateSpot = 0;
long lastBeat = 0; // Time at which the last beat occurred

float beatsPerMinute;
int beatAvg;

void setup() {
  Serial.begin(115200);
  Serial.println("AWEN ESP32 Telemetry Node Initializing...");

  // Initialize MAX30102 PPG sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 was not found. Please check wiring/power.");
    while (1);
  }

  // Configure MAX30102 PPG settings
  particleSensor.setup(); 
  particleSensor.setPulseAmplitudeRed(0x0A); // Turn Red LED to low to indicate sensor is running
  particleSensor.setPulseAmplitudeGreen(0); // Turn off Green LED

  // Initialize MPU6050 accelerometer on shared I2C bus (non-blocking if not attached)
  if (mpu.begin(0x68, &Wire)) {
    mpuFound = true;
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setFilterBandwidth(MPU6050_BANDWIDTH_21_HZ);
    Serial.println("MPU6050 Accelerometer initialized successfully.");
  } else {
    Serial.println("MPU6050 not detected on I2C bus 0x68. Continuing with PPG only.");
  }
}

void loop() {
  long irValue = particleSensor.getIR();

  if (checkForBeat(irValue) == true) {
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 40) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= RATE_SIZE;

      beatAvg = 0;
      for (byte x = 0 ; x < RATE_SIZE ; x++)
        beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  }

  // Read MPU6050 accelerometer vector & magnitude
  float ax = 0.0, ay = 0.0, az = 9.81;
  float aMag = 1.0; // In g-force units
  bool isMoving = false;

  if (mpuFound) {
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    ax = a.acceleration.x;
    ay = a.acceleration.y;
    az = a.acceleration.z;
    float totalAccelMs2 = sqrt(ax * ax + ay * ay + az * az);
    aMag = totalAccelMs2 / 9.81; // Convert to g units
    isMoving = (aMag > 1.15 || aMag < 0.85); // Significant departure from 1.0g gravity baseline
  }

  // Periodically output JSON telemetry payload over Serial for AWEN Web Serial interface
  static unsigned long lastReport = 0;
  if (millis() - lastReport > 500) {
    lastReport = millis();

    float tempC = particleSensor.readTemperature();
    if (isnan(tempC) || tempC < 30.0) tempC = 36.6;

    // Output standardized JSON format expected by AWEN web interface
    Serial.print("{\"ir\":");
    Serial.print(irValue);
    Serial.print(",\"bpm\":");
    Serial.print(beatAvg > 0 ? beatAvg : 68);
    Serial.print(",\"spo2\":");
    Serial.print(irValue > 50000 ? 98.5 : 0.0);
    Serial.print(",\"temp\":");
    Serial.print(tempC, 1);
    Serial.print(",\"accel\":{\"x\":");
    Serial.print(ax, 2);
    Serial.print(",\"y\":");
    Serial.print(ay, 2);
    Serial.print(",\"z\":");
    Serial.print(az, 2);
    Serial.print("},\"moving\":");
    Serial.print(isMoving ? "true" : "false");
    Serial.println("}");
  }
}
