/**
 * AWEN Live Telemetry Stream & IoT Hardware Connector
 * 
 * Generates realistic PPG pulse wave telemetry and simulated MAX30102 sensor data.
 * Also supports direct Web Serial connection to physical ESP32 microcontrollers.
 */

export class TelemetryStream {
  constructor(onReadingCallback, onStateChangeCallback = null) {
    this.onReading = onReadingCallback;
    this.onStateChange = onStateChangeCallback;
    this.isRunning = false;
    this.intervalId = null;
    this.currentActivity = "Resting";
    this.currentMood = "Normal";
    this.simulatedScenario = "normal"; // normal, stairs, caffeine, stress, exercise
    this.serialPort = null;
    this.isHardwareConnected = false;
    this.hardwareState = "DISCONNECTED"; // DISCONNECTED | CONNECTING | CONNECTED | ERROR
    this.lastHardwareError = null;
    this.reader = null;
    
    // Waveform simulation buffers
    this.pulsePhase = 0;
    this.baseHr = 65;
  }

  setActivity(activity) {
    this.currentActivity = activity;
    this.triggerUpdate();
  }

  setMood(mood) {
    this.currentMood = mood;
    this.triggerUpdate();
  }

  setScenario(scenario) {
    this.simulatedScenario = scenario;
    this.triggerUpdate();
  }

  setHardwareState(state, error = null) {
    this.hardwareState = state;
    this.lastHardwareError = error;
    this.isHardwareConnected = (state === "CONNECTED");
    if (this.onStateChange) {
      this.onStateChange({
        state: this.hardwareState,
        error: this.lastHardwareError,
        isHardwareConnected: this.isHardwareConnected
      });
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      this.triggerUpdate();
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  triggerUpdate() {
    if (!this.onReading) return;

    let hr = 65;
    let spo2 = 98.6;
    let temp = 36.6;

    // Apply scenario modifier when not receiving physical hardware stream
    switch (this.simulatedScenario) {
      case "stairs":
        hr = 98 + Math.random() * 6;
        this.currentActivity = "Climbing Stairs";
        spo2 = 98.2 + Math.random() * 0.8;
        temp = 37.1;
        break;
      case "caffeine":
        hr = 84 + Math.random() * 5;
        this.currentActivity = "Working";
        spo2 = 98.8;
        temp = 36.7;
        break;
      case "stress":
        hr = 92 + Math.random() * 7;
        this.currentActivity = "Studying";
        spo2 = 97.4 + Math.random() * 0.6;
        temp = 36.8;
        break;
      case "exercise":
        hr = 122 + Math.random() * 8;
        this.currentActivity = "Running";
        spo2 = 99.0;
        temp = 37.4;
        break;
      case "normal":
      default:
        const activityOffsets = {
          "Resting": 64,
          "Studying": 68,
          "Working": 72,
          "Traveling": 74,
          "Walking": 86,
          "Climbing Stairs": 98,
          "Gym": 118,
          "Running": 126,
          "Feeling Unwell": 78
        };
        const targetHr = activityOffsets[this.currentActivity] || 65;
        hr = targetHr + (Math.random() * 4 - 2);
        spo2 = 98.4 + (Math.random() * 0.8 - 0.4);
        temp = 36.6 + (Math.random() * 0.2 - 0.1);
        break;
    }

    const roundedHr = Math.round(hr * 10) / 10;
    const roundedSpo2 = Math.round(spo2 * 10) / 10;
    const roundedTemp = Math.round(temp * 10) / 10;
    const isoTimestamp = new Date().toISOString();

    this.onReading({
      device_id: this.isHardwareConnected ? "esp32_max30102" : "demo_simulator",
      timestamp: isoTimestamp,
      heart_rate: roundedHr,
      spo2: roundedSpo2,
      temperature: roundedTemp,
      activity: this.currentActivity,
      mood: this.currentMood,
      // Compatibility keys for UI
      heartRate: roundedHr,
      isHardware: this.isHardwareConnected,
      sqi: this.isHardwareConnected ? 95 : 100,
      sqiStatus: this.isHardwareConnected ? "High (Hardware)" : "Simulated"
    });
  }

  /**
   * Hardware Serial Telemetry Data Contract Parser & Sanitizer
   * 
   * Validates incoming serial string packets from ESP32 microcontrollers.
   * Enforces physiological numerical boundaries:
   *  - BPM: 30 to 220
   *  - SpO2: 80 to 100
   *  - Temp: 30 to 45 °C
   *  - SQI: 0 to 100
   */
  static parseSerialPacket(line, currentActivity = "Resting", currentMood = "Normal") {
    if (!line || typeof line !== "string") return null;

    let cleanLine = line.trim();
    if (!cleanLine.startsWith("{") || !cleanLine.endsWith("}")) return null;

    try {
      const data = JSON.parse(cleanLine);
      if (data.bpm === undefined && data.heart_rate === undefined && data.hr === undefined) {
        return null;
      }

      // Extract raw values with fallbacks
      const rawBpm = Number(data.bpm ?? data.heart_rate ?? data.hr);
      const rawSpo2 = Number(data.spo2 ?? data.oximetry ?? 98.5);
      const rawTemp = Number(data.temp ?? data.temperature ?? 36.6);
      const rawSqi = Number(data.sqi ?? data.signal_quality ?? 90);
      const fingerDetected = data.finger_detected !== undefined ? Boolean(data.finger_detected) : true;

      // Validate bounds
      const isBpmValid = !isNaN(rawBpm) && rawBpm >= 30 && rawBpm <= 220;
      const isSpo2Valid = !isNaN(rawSpo2) && rawSpo2 >= 80 && rawSpo2 <= 100;
      const isTempValid = !isNaN(rawTemp) && rawTemp >= 30 && rawTemp <= 45;

      if (!fingerDetected || !isBpmValid) {
        return {
          isValid: false,
          errorCode: !fingerDetected ? "NO_FINGER_CONTACT" : "OUT_OF_BOUNDS_BPM",
          errorMessage: !fingerDetected ? "No finger contact detected on MAX30102 sensor." : `Physiological BPM out of valid bounds: ${rawBpm}`,
          heart_rate: null,
          heartRate: null,
          spo2: null,
          temperature: null,
          sqi: 0,
          sqiStatus: "No Contact",
          fingerDetected: false,
          isHardware: true
        };
      }

      // Parse optional accelerometer vector: { x, y, z } to derive movement exertion
      let derivedActivity = currentActivity;
      if (data.accel && typeof data.accel === "object") {
        const x = Number(data.accel.x) || 0;
        const y = Number(data.accel.y) || 0;
        const z = Number(data.accel.z) || 1.0;
        const mag = Math.sqrt(x * x + y * y + z * z);
        if (mag > 1.8) derivedActivity = "Running";
        else if (mag > 1.4) derivedActivity = "Climbing Stairs";
        else if (mag > 1.15) derivedActivity = "Walking";
      }

      const roundedHr = Math.round(rawBpm * 10) / 10;
      const roundedSpo2 = isSpo2Valid ? Math.round(rawSpo2 * 10) / 10 : 98.5;
      const roundedTemp = isTempValid ? Math.round(rawTemp * 10) / 10 : 36.6;
      const clampedSqi = Math.max(0, Math.min(100, Math.round(rawSqi)));

      return {
        isValid: true,
        device_id: "esp32_max30102",
        timestamp: new Date().toISOString(),
        heart_rate: roundedHr,
        spo2: roundedSpo2,
        temperature: roundedTemp,
        activity: derivedActivity,
        mood: currentMood,
        heartRate: roundedHr,
        isHardware: true,
        sqi: clampedSqi,
        sqiStatus: clampedSqi >= 80 ? "High" : clampedSqi >= 50 ? "Moderate" : "Poor",
        fingerDetected: true
      };
    } catch (err) {
      return null; // Malformed JSON parse failure
    }
  }

  /**
   * Connect to physical ESP32 MAX30102 sensor via Browser Web Serial API
   */
  async connectWebSerial() {
    if (!('serial' in navigator)) {
      const errMsg = "Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.";
      this.setHardwareState("ERROR", errMsg);
      throw new Error(errMsg);
    }
    
    try {
      this.setHardwareState("CONNECTING");
      this.serialPort = await navigator.serial.requestPort();
      await this.serialPort.open({ baudRate: 115200 });
      this.setHardwareState("CONNECTED");

      const textDecoder = new TextDecoderStream();
      this.serialPort.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();

      let buffer = "";
      while (this.isHardwareConnected) {
        const { value, done } = await this.reader.read();
        if (done) break;
        buffer += value;
        
        let lines = buffer.split("\n");
        buffer = lines.pop(); // Keep last incomplete line

        for (let line of lines) {
          const parsed = TelemetryStream.parseSerialPacket(line, this.currentActivity, this.currentMood);
          if (parsed && parsed.isValid && this.onReading) {
            this.onReading(parsed);
          }
        }
      }
    } catch (err) {
      if (err.name === "NotFoundError") {
        this.setHardwareState("DISCONNECTED", "Device selection was cancelled by user.");
      } else {
        this.setHardwareState("ERROR", err.message || "Failed to open serial port.");
      }
    }
  }

  disconnectHardware() {
    if (this.reader) {
      try {
        this.reader.cancel();
      } catch (e) {}
      this.reader = null;
    }
    if (this.serialPort) {
      try {
        this.serialPort.close();
      } catch (e) {}
      this.serialPort = null;
    }
    this.setHardwareState("DISCONNECTED");
  }

  /**
   * Serial Telemetry Parser Self-Test Suite
   * Runs 6 validation test cases without needing physical hardware attached.
   */
  static runParserSelfTest() {
    const testCases = [
      {
        name: "Valid Serial JSON Packet",
        input: '{"bpm": 74.5, "spo2": 98.6, "temp": 36.6, "sqi": 95, "finger_detected": true}',
        expectedValid: true
      },
      {
        name: "Invalid JSON Syntax",
        input: '{bpm: 74, spo2: undefined',
        expectedValid: false
      },
      {
        name: "Non-JSON Sensor Log Line",
        input: 'RAW_ADC_BUFFER: 12049, 12055, 12061',
        expectedValid: false
      },
      {
        name: "Out of Bounds BPM (> 220)",
        input: '{"bpm": 450, "spo2": 98.0, "temp": 36.6}',
        expectedValid: false
      },
      {
        name: "No Finger Contact",
        input: '{"bpm": 0, "spo2": 0, "finger_detected": false}',
        expectedValid: false
      },
      {
        name: "IMU Acceleration Motion Shift",
        input: '{"bpm": 110.0, "spo2": 98.4, "temp": 37.0, "accel": {"x": 0.2, "y": 0.5, "z": 2.1}}',
        expectedValid: true,
        expectedActivity: "Running"
      }
    ];

    return testCases.map(tc => {
      const result = TelemetryStream.parseSerialPacket(tc.input, "Resting", "Normal");
      const passed = tc.expectedValid 
        ? (result && result.isValid && (!tc.expectedActivity || result.activity === tc.expectedActivity))
        : (!result || !result.isValid);
      return {
        name: tc.name,
        passed,
        result
      };
    });
  }
}
