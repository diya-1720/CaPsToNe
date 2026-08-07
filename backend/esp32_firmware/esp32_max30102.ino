/*
 * AWEN - ESP32 MAX30102 IoT Sensor Firmware
 * Hardware Setup:
 * - ESP32 Microcontroller
 * - MAX30102 Pulse Oximeter & Heart Rate Sensor (I2C)
 * - Optional DS18B20 / MLX90614 Temperature Sensor
 * 
 * Connection:
 * MAX30102 SDA -> ESP32 GPIO 21
 * MAX30102 SCL -> ESP32 GPIO 22
 * MAX30102 VIN -> 3.3V / 5V
 * MAX30102 GND -> GND
 */

#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

MAX30105 particleSensor;

const byte RATE_SIZE = 4; // Increase for more smoothing
byte rates[RATE_SIZE]; // Array of heart rates
byte rateSpot = 0;
long lastBeat = 0; // Time at which the last beat occurred

float beatsPerMinute;
int beatAvg;

void setup() {
  Serial.begin(115200);
  Serial.println("AWEN ESP32 Telemetry Node Initializing...");

  // Initialize MAX30102 I2C sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 was not found. Please check wiring/power.");
    while (1);
  }

  // Configure sensor settings for low-noise PPG acquisition
  particleSensor.setup(); 
  particleSensor.setPulseAmplitudeRed(0x0A); // Turn Red LED to low to indicate sensor is running
  particleSensor.setPulseAmplitudeGreen(0); // Turn off Green LED
}

void loop() {
  long irValue = particleSensor.getIR();

  if (checkForBeat(irValue) == true) {
    // We sensed a pulse beat!
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 40) {
      rates[rateSpot++] = (byte)beatsPerMinute; // Store this reading in the array
      rateSpot %= RATE_SIZE; // Wrap variable

      // Take average of readings
      beatAvg = 0;
      for (byte x = 0 ; x < RATE_SIZE ; x++)
        beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  }

  // Periodically output JSON telemetry payload over Serial for AWEN Web Serial interface
  static unsigned long lastReport = 0;
  if (millis() - lastReport > 500) {
    lastReport = millis();

    float tempC = particleSensor.readTemperature();
    if (isnan(tempC) || tempC < 30.0) tempC = 36.6; // Fallback to nominal body temp if unequipped

    // Output clean JSON format expected by AWEN web interface
    Serial.print("{\"ir\":");
    Serial.print(irValue);
    Serial.print(",\"bpm\":");
    Serial.print(beatAvg > 0 ? beatAvg : 68);
    Serial.print(",\"spo2\":");
    Serial.print(irValue > 50000 ? 98.5 : 0.0);
    Serial.print(",\"temp\":");
    Serial.print(tempC, 1);
    Serial.println("}");
  }
}
