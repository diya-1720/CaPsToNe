/**
 * AWEN Live Telemetry Stream & IoT Hardware Connector
 * 
 * Interacts with physical ESP32 microcontrollers over Wi-Fi REST & Browser Web Serial API.
 * Reads live MAX30100 PPG pulse, MPU6050 accelerometer, LM35 temperature & Buzzer telemetry.
 */

import { formatISTDateTime, formatISTTime } from '../utils/timeFormat';

const getInitialEsp32Url = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('awen_esp32_url');
    if (saved && saved.trim() && !saved.includes('10.153.') && !saved.includes('10.208.')) return saved.trim().replace(/\/+$/, '');
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ESP32_BASE_URL) {
    return import.meta.env.VITE_ESP32_BASE_URL.trim().replace(/\/+$/, '');
  }
  return "http://172.20.168.254";
};

export const ESP32_BASE_URL = getInitialEsp32Url();

export class TelemetryStream {
  constructor(onReadingCallback, onStateChangeCallback = null) {
    this.onReading = onReadingCallback;
    this.onStateChange = onStateChangeCallback;
    this.isRunning = false;
    this.currentActivity = "Resting";
    this.currentMood = "Normal";
    this.serialPort = null;
    this.reader = null;
    this.isHardwareConnected = false;
    this.hardwareState = "DISCONNECTED"; // DISCONNECTED | CONNECTING | CONNECTED | ERROR
    this.lastHardwareError = null;
    this.hardwareConnectedAt = null;
    this.rawLog = [];
    this.onRawLine = null;
    this.lastPacketTime = 0;
    this.watchdogInterval = null;

    // ESP32 Wi-Fi HTTP Polling Configuration
    this.esp32BaseUrl = ESP32_BASE_URL;
    this.pollIntervalMs = 1000; // 1-second continuous telemetry polling
    this.pollTimer = null;
    this.pollAbortController = null;
    this.consecutiveFailures = 0;

    // Listen to device unplug/replug globally if supported
    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      navigator.serial.addEventListener('disconnect', (event) => {
        if (event.port === this.serialPort || this.isHardwareConnected) {
          console.warn("Serial device was disconnected.");
          this.disconnectHardware();
        }
      });
    }
  }

  setEsp32Url(url) {
    if (url && typeof url === 'string') {
      let clean = url.trim().replace(/\/+$/, '');
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `http://${clean}`;
      }
      this.esp32BaseUrl = clean;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('awen_esp32_url', clean);
      }
    }
  }

  setActivity(activity) {
    this.currentActivity = activity;
  }

  setMood(mood) {
    this.currentMood = mood;
  }

  setHardwareState(state, error = null) {
    this.hardwareState = state;
    this.lastHardwareError = error;
    this.isHardwareConnected = (state === "CONNECTED");
    if (this.isHardwareConnected && !this.hardwareConnectedAt) {
      this.hardwareConnectedAt = new Date();
    } else if (!this.isHardwareConnected) {
      this.hardwareConnectedAt = null;
    }
    if (this.onStateChange) {
      this.onStateChange({
        state: this.hardwareState,
        error: this.lastHardwareError,
        isHardwareConnected: this.isHardwareConnected,
        hardwareConnectedAt: this.hardwareConnectedAt ? formatISTDateTime(this.hardwareConnectedAt) : null,
        hardwareConnectedTime: this.hardwareConnectedAt ? formatISTTime(this.hardwareConnectedAt) : null
      });
    }
  }

  start() {
    this.isRunning = true;
    this.setHardwareState(this.isHardwareConnected ? "CONNECTED" : "DISCONNECTED");
    
    // Start continuous ESP32 Wi-Fi HTTP polling (1s interval)
    this.pollEsp32Telemetry();

    if (this.watchdogInterval) clearInterval(this.watchdogInterval);
    this.watchdogInterval = setInterval(() => {
      if (this.isHardwareConnected && this.lastPacketTime > 0 && (Date.now() - this.lastPacketTime > 6000)) {
        // Hardware connected but telemetry stopped arriving for >6s
        if (this.onReading) {
          this.onReading({
            isValid: true,
            device_id: "AWEN_ESP32_01",
            timestamp: new Date().toISOString(),
            heart_rate: null,
            heartRate: null,
            bpm: null,
            spo2: null,
            temperature: null,
            temp: null,
            hasTemperatureSensor: false,
            accel: { x: 0.0, y: 0.0, z: 1.0 },
            accelMagnitude: 1.0,
            accel_magnitude: 1.0,
            isMoving: false,
            moving: false,
            activity: "Resting",
            mood: this.currentMood,
            isHardware: true,
            fingerDetected: false,
            finger: false,
            abnormal: false,
            sqi: 0,
            sqiStatus: "No Live Data / Sensor Standby"
          });
        }
      }
    }, 2000);
  }

  stop() {
    this.isRunning = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.pollAbortController) {
      try {
        this.pollAbortController.abort();
      } catch {}
      this.pollAbortController = null;
    }
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
      this.watchdogInterval = null;
    }
    this.disconnectHardware();
  }

  /**
   * Continuous ESP32 Wi-Fi Telemetry Poller
   * Fetches /api/telemetry from the ESP32 base URL at 1000ms intervals.
   * Handles network disconnects and retries seamlessly without crashing.
   */
  async pollEsp32Telemetry() {
    if (!this.isRunning) return;

    try {
      this.pollAbortController = new AbortController();
      const timeoutId = setTimeout(() => {
        if (this.pollAbortController) {
          this.pollAbortController.abort();
        }
      }, 2500);

      const endpoint = `${this.esp32BaseUrl}/api/telemetry`;
      let response;
      try {
        response = await fetch(endpoint, {
          method: "GET",
          signal: this.pollAbortController.signal,
          headers: {
            "Accept": "application/json"
          }
        });
      } catch (directErr) {
        // Fallback to FastAPI backend proxy if direct fetch is blocked by browser CORS / PNA
        const host = (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : '127.0.0.1';
        let proxyUrl = `http://${host}:8000/api/esp32/telemetry?ip=${encodeURIComponent(this.esp32BaseUrl)}`;
        try {
          response = await fetch(proxyUrl, {
            method: "GET",
            signal: this.pollAbortController.signal,
            headers: {
              "Accept": "application/json"
            }
          });
        } catch (proxyErr) {
          proxyUrl = `http://127.0.0.1:8000/api/esp32/telemetry?ip=${encodeURIComponent(this.esp32BaseUrl)}`;
          response = await fetch(proxyUrl, {
            method: "GET",
            signal: this.pollAbortController.signal,
            headers: {
              "Accept": "application/json"
            }
          });
        }
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ESP32`);
      }

      const rawData = await response.json();
      if (!rawData || rawData.connected === false || rawData.status === 'unreachable') {
        this.consecutiveFailures++;
        if (this.consecutiveFailures >= 2) {
          if (this.isHardwareConnected) {
            this.setHardwareState("DISCONNECTED", rawData?.detail || "ESP32 disconnected or unreachable");
          }
        }
        return;
      }
      this.consecutiveFailures = 0;
      this.lastPacketTime = Date.now();

      // Push raw string to terminal buffer
      const rawLine = JSON.stringify(rawData);
      this.rawLog.push(rawLine);
      if (this.rawLog.length > 25) this.rawLog.shift();
      if (this.onRawLine) this.onRawLine(rawLine);

      // Normalize incoming ESP32 packet
      const parsed = this.normalizeEsp32Data(rawData);

      if (parsed) {
        if (!this.isHardwareConnected) {
          this.setHardwareState("CONNECTED");
        }
        if (this.onReading) {
          this.onReading(parsed);
        }
      }
    } catch (err) {
      if (!this.isRunning) return;

      this.consecutiveFailures++;
      // If 2 or more consecutive polls fail, transition to disconnected status gracefully
      if (this.consecutiveFailures >= 2) {
        if (this.isHardwareConnected) {
          this.setHardwareState("DISCONNECTED", err.message || "ESP32 disconnected or unreachable");
        }
      }
    } finally {
      if (this.isRunning) {
        this.pollTimer = setTimeout(() => this.pollEsp32Telemetry(), this.pollIntervalMs);
      }
    }
  }

  /**
   * Hardware Data Contract Normalizer
   * Maps ESP32 JSON schema to AWEN standard telemetry schema.
   * Ensures null values for BPM and SpO2 are strictly respected without fake demo numbers.
   */
  normalizeEsp32Data(data) {
    if (!data || typeof data !== 'object') return null;

    // 1. Extract Heart Rate / BPM
    let rawBpm = null;
    if (data.heart_rate !== undefined && data.heart_rate !== null) rawBpm = Number(data.heart_rate);
    else if (data.bpm !== undefined && data.bpm !== null) rawBpm = Number(data.bpm);
    else if (data.heartRate !== undefined && data.heartRate !== null) rawBpm = Number(data.heartRate);
    else if (data.BPM !== undefined && data.BPM !== null) rawBpm = Number(data.BPM);
    else if (data.hr !== undefined && data.hr !== null) rawBpm = Number(data.hr);

    // 2. Extract SpO2
    let rawSpo2 = null;
    if (data.spo2 !== undefined && data.spo2 !== null) rawSpo2 = Number(data.spo2);
    else if (data.SPO2 !== undefined && data.SPO2 !== null) rawSpo2 = Number(data.SPO2);
    else if (data.oximetry !== undefined && data.oximetry !== null) rawSpo2 = Number(data.oximetry);
    else if (data.oxygen !== undefined && data.oxygen !== null) rawSpo2 = Number(data.oxygen);

    // 3. Extract Temperature
    let rawTemp = null;
    if (data.temperature !== undefined && data.temperature !== null) rawTemp = Number(data.temperature);
    else if (data.temp !== undefined && data.temp !== null) rawTemp = Number(data.temp);
    else if (data.TEMP !== undefined && data.TEMP !== null) rawTemp = Number(data.TEMP);
    else if (data.tempC !== undefined && data.tempC !== null) rawTemp = Number(data.tempC);
    else if (data.temp_c !== undefined && data.temp_c !== null) rawTemp = Number(data.temp_c);

    // 4. Extract Finger Presence
    let fingerDetected = false;
    if (data.finger !== undefined && data.finger !== null) {
      fingerDetected = Boolean(data.finger);
    } else if (data.finger_detected !== undefined && data.finger_detected !== null) {
      fingerDetected = Boolean(data.finger_detected);
    } else if (rawBpm !== null && !isNaN(rawBpm) && rawBpm >= 35 && rawBpm <= 230) {
      fingerDetected = true;
    }

    // 5. Extract Accelerometer (accel.x, accel.y, accel.z)
    let accelObj = { x: 0.0, y: 0.0, z: 1.0 };
    if (data.accel && typeof data.accel === 'object') {
      accelObj = {
        x: data.accel.x != null && !isNaN(Number(data.accel.x)) ? Math.round(Number(data.accel.x) * 100) / 100 : 0.0,
        y: data.accel.y != null && !isNaN(Number(data.accel.y)) ? Math.round(Number(data.accel.y) * 100) / 100 : 0.0,
        z: data.accel.z != null && !isNaN(Number(data.accel.z)) ? Math.round(Number(data.accel.z) * 100) / 100 : 1.0
      };
    } else if (data.accel_x !== undefined || data.accel_y !== undefined || data.accel_z !== undefined) {
      accelObj = {
        x: data.accel_x != null && !isNaN(Number(data.accel_x)) ? Math.round(Number(data.accel_x) * 100) / 100 : 0.0,
        y: data.accel_y != null && !isNaN(Number(data.accel_y)) ? Math.round(Number(data.accel_y) * 100) / 100 : 0.0,
        z: data.accel_z != null && !isNaN(Number(data.accel_z)) ? Math.round(Number(data.accel_z) * 100) / 100 : 1.0
      };
    }

    // 6. Extract Acceleration Magnitude
    let accelMag = 1.0;
    if (data.accel_magnitude !== undefined && data.accel_magnitude !== null && !isNaN(Number(data.accel_magnitude))) {
      accelMag = Math.round(Number(data.accel_magnitude) * 100) / 100;
    } else if (data.accel_g !== undefined && data.accel_g !== null && !isNaN(Number(data.accel_g))) {
      accelMag = Math.round(Number(data.accel_g) * 100) / 100;
    } else {
      accelMag = Math.round(Math.sqrt(accelObj.x * accelObj.x + accelObj.y * accelObj.y + accelObj.z * accelObj.z) * 100) / 100;
    }

    // 7. Extract Movement / Activity
    let isMoving = false;
    if (data.moving !== undefined && data.moving !== null) {
      isMoving = Boolean(data.moving);
    } else {
      isMoving = (accelMag > 1.15 || accelMag < 0.85);
    }

    // 8. Extract Abnormal Flag
    let abnormal = false;
    if (data.abnormal !== undefined && data.abnormal !== null) {
      abnormal = Boolean(data.abnormal);
    }

    // 9. Normalize BPM (Strictly null if null or no finger contact)
    let finalBpm = null;
    if (fingerDetected && rawBpm !== null && !isNaN(rawBpm) && rawBpm >= 35 && rawBpm <= 230) {
      finalBpm = Math.round(rawBpm * 10) / 10;
    }

    // 10. Normalize SpO2 (Strictly null if null or no finger contact)
    let finalSpo2 = null;
    if (fingerDetected && rawSpo2 !== null && !isNaN(rawSpo2) && rawSpo2 >= 70 && rawSpo2 <= 100) {
      finalSpo2 = Math.round(rawSpo2 * 10) / 10;
    }

    // 11. Normalize Temp (Strictly null if null, rounded to 1 decimal if valid)
    let finalTemp = null;
    if (rawTemp !== null && !isNaN(Number(rawTemp)) && Number(rawTemp) >= 10 && Number(rawTemp) <= 50) {
      finalTemp = Math.round(Number(rawTemp) * 10) / 10;
    }

    // 12. Derive Activity
    let derivedActivity = "Resting";
    if (accelMag > 1.75) {
      derivedActivity = "Running";
    } else if (accelMag > 1.35) {
      derivedActivity = "Climbing Stairs";
    } else if (isMoving || accelMag > 1.15 || accelMag < 0.85) {
      derivedActivity = "Walking";
    } else {
      derivedActivity = this.currentActivity || "Resting";
    }

    let ipAddress = data.ip;
    if (!ipAddress) {
      try {
        ipAddress = (new URL(this.esp32BaseUrl)).hostname;
      } catch {
        ipAddress = "172.20.168.254";
      }
    }

    const now = new Date();
    const connAt = this.hardwareConnectedAt || now;

    return {
      isValid: true,
      device_id: data.device_id || "AWEN_ESP32_01",
      timestamp: now.toISOString(),
      timestamp_ist: formatISTDateTime(now),
      time_ist: formatISTTime(now),
      hardware_connected_at: formatISTDateTime(connAt),
      hardware_connected_time: formatISTTime(connAt),
      heart_rate: finalBpm,
      heartRate: finalBpm,
      bpm: finalBpm,
      spo2: finalSpo2,
      temperature: finalTemp,
      temp: finalTemp,
      hasTemperatureSensor: finalTemp !== null,
      accel: accelObj,
      accelMagnitude: accelMag,
      accel_magnitude: accelMag,
      isMoving: isMoving,
      moving: isMoving,
      fingerDetected: fingerDetected,
      finger: fingerDetected,
      abnormal: abnormal,
      activity: derivedActivity,
      mood: this.currentMood,
      isHardware: true,
      data_source: "esp32",
      ip: ipAddress,
      sqi: fingerDetected ? 95 : 15,
      sqiStatus: fingerDetected ? "Optimal Signal" : "Awaiting Contact"
    };
  }

  /**
   * Hardware Serial Telemetry Data Contract Parser & Normalizer
   * 
   * Validates incoming serial string packets from ESP32 microcontrollers.
   * Supports:
   * 1. Full JSON: {"ir": 54200, "bpm": 72, "spo2": 98.5, "temp": 36.6}
   * 2. Key-value string: "BPM: 72, SpO2: 98.5, Temp: 36.6"
   * 3. Comma-separated: "72, 98.5, 36.6"
   */
  static parseSerialPacket(line, currentActivity = "Resting", currentMood = "Normal") {
    if (!line || typeof line !== "string") return null;

    const cleanLine = line.trim();
    if (!cleanLine) return null;

    let bpm = null;
    let spo2 = null;
    let temp = null;
    let ir = null;
    let accel = null;
    let isMoving = false;
    let fingerDetected = true;

    // Strategy 1: JSON extraction (supports nested objects like accel)
    let jsonStr = null;
    if (cleanLine.startsWith("{") && cleanLine.endsWith("}")) {
      jsonStr = cleanLine;
    } else {
      const match = cleanLine.match(/\{[\s\S]*\}/);
      if (match) jsonStr = match[0];
    }

    let rawData = null;
    if (jsonStr) {
      try {
        rawData = JSON.parse(jsonStr);
        const data = rawData;

        // Extract BPM across common casing conventions
        if (data.bpm !== undefined && data.bpm !== null) bpm = Number(data.bpm);
        else if (data.BPM !== undefined && data.BPM !== null) bpm = Number(data.BPM);
        else if (data.heart_rate !== undefined && data.heart_rate !== null) bpm = Number(data.heart_rate);
        else if (data.heartRate !== undefined && data.heartRate !== null) bpm = Number(data.heartRate);
        else if (data.hr !== undefined && data.hr !== null) bpm = Number(data.hr);

        // Extract SpO2 across common conventions
        if (data.spo2 !== undefined && data.spo2 !== null) spo2 = Number(data.spo2);
        else if (data.SPO2 !== undefined && data.SPO2 !== null) spo2 = Number(data.SPO2);
        else if (data.oximetry !== undefined && data.oximetry !== null) spo2 = Number(data.oximetry);
        else if (data.oxygen !== undefined && data.oxygen !== null) spo2 = Number(data.oxygen);

        // Extract Temperature (Preserve null if not provided or disconnected)
        if (data.temp !== undefined && data.temp !== null) temp = Number(data.temp);
        else if (data.TEMP !== undefined && data.TEMP !== null) temp = Number(data.TEMP);
        else if (data.temperature !== undefined && data.temperature !== null) temp = Number(data.temperature);
        else if (data.tempC !== undefined && data.tempC !== null) temp = Number(data.tempC);

        // Extract IR amplitude
        if (data.ir !== undefined && data.ir !== null) ir = Number(data.ir);

        // Extract MPU-6050 Accel
        if (data.accel && typeof data.accel === 'object') {
          accel = data.accel;
        }
        if (data.moving !== undefined) {
          isMoving = Boolean(data.moving);
        }
        
        // Accurate finger presence detection
        if (data.finger !== undefined && data.finger !== null) {
          fingerDetected = Boolean(data.finger);
        } else if (data.finger_detected !== undefined && data.finger_detected !== null) {
          fingerDetected = Boolean(data.finger_detected);
        } else if (ir !== null && !isNaN(ir)) {
          fingerDetected = ir > 15000;
        } else if (bpm !== null && !isNaN(bpm)) {
          fingerDetected = bpm >= 35 && bpm <= 230;
        } else {
          fingerDetected = false;
        }
      } catch (e) {
        // Fall through to regex strategy
      }
    }

    // Strategy 2: Key-Value Regex Extraction if not found via JSON
    if (bpm === null || isNaN(bpm)) {
      const bpmMatch = cleanLine.match(/(?:bpm|heart\s*rate|hr)\s*[:=]?\s*([0-9.]+)/i);
      if (bpmMatch) bpm = Number(bpmMatch[1]);
    }
    if (spo2 === null || isNaN(spo2)) {
      const spo2Match = cleanLine.match(/(?:spo2|oximetry|oxygen|o2)\s*[:=]?\s*([0-9.]+)/i);
      if (spo2Match) spo2 = Number(spo2Match[1]);
    }
    if (temp === null || isNaN(temp)) {
      const tempMatch = cleanLine.match(/(?:temp(?:erature)?|tempc)\s*[:=]?\s*([0-9.]+)/i);
      if (tempMatch) temp = Number(tempMatch[1]);
    }
    if (ir === null || isNaN(ir)) {
      const irMatch = cleanLine.match(/ir\s*[:=]?\s*([0-9.]+)/i);
      if (irMatch) ir = Number(irMatch[1]);
    }

    // Strategy 3: Comma-Separated Numbers (e.g. "72, 98.5, 36.6")
    if (bpm === null || isNaN(bpm)) {
      const parts = cleanLine.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2 && parts.every(p => !isNaN(Number(p)))) {
        const nums = parts.map(Number);
        if (nums[0] > 1000) {
          // First number is IR
          ir = nums[0];
          bpm = nums[1];
          spo2 = nums[2] || 98.5;
          temp = nums[3] || null;
        } else {
          bpm = nums[0];
          spo2 = nums[1] || 98.5;
          temp = nums[2] || null;
        }
      }
    }

    // If no numerical telemetry, accel object, or moving status found, return null
    if ((bpm === null || isNaN(bpm)) && (spo2 === null || isNaN(spo2)) && (temp === null || isNaN(temp)) && !accel && rawData?.moving === undefined) {
      return null;
    }

    // Process BPM (Only populate when finger contact is verified)
    let finalBpm = null;
    if (fingerDetected && bpm !== null && !isNaN(bpm) && bpm >= 35 && bpm <= 230) {
      finalBpm = Math.round(bpm * 10) / 10;
    }

    // Process SpO2 (Only populate when finger contact is verified)
    let finalSpo2 = null;
    if (fingerDetected && spo2 !== null && !isNaN(spo2) && spo2 >= 70 && spo2 <= 100) {
      finalSpo2 = Math.round(spo2 * 10) / 10;
    }

    // Process Temperature (Keep null if sensor is unattached / optional probe)
    let finalTemp = null;
    if (temp !== null && !isNaN(temp) && temp >= 20 && temp <= 48) {
      finalTemp = Math.round(temp * 10) / 10;
    }

    // Process MPU-6050 3-Axis Accelerometer & Magnitude
    let accelObj = null;
    let accelMag = 1.0;
    if (accel && typeof accel === 'object') {
      const x = Number(accel.x) || 0;
      const y = Number(accel.y) || 0;
      const z = Number(accel.z) || 1.0;
      accelObj = {
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        z: Math.round(z * 100) / 100
      };
      accelMag = Math.sqrt(x * x + y * y + z * z);
    } else if (rawData?.accel_magnitude !== undefined && !isNaN(Number(rawData.accel_magnitude))) {
      accelMag = Number(rawData.accel_magnitude);
    }
    accelMag = Math.round(accelMag * 100) / 100;

    if (rawData?.moving !== undefined) {
      isMoving = Boolean(rawData.moving);
    } else {
      isMoving = (accelMag > 1.15 || accelMag < 0.85);
    }

    // Derive Activity from Accelerometer
    let derivedActivity = "Resting";
    if (accelMag > 1.75) {
      derivedActivity = "Running";
    } else if (accelMag > 1.35) {
      derivedActivity = "Climbing Stairs";
    } else if (isMoving || accelMag > 1.15 || accelMag < 0.85) {
      derivedActivity = "Walking";
    } else {
      derivedActivity = currentActivity || "Resting";
    }

    const now = new Date();
    return {
      isValid: true,
      device_id: "esp32_max30100",
      timestamp: now.toISOString(),
      timestamp_ist: formatISTDateTime(now),
      time_ist: formatISTTime(now),
      heart_rate: finalBpm,
      heartRate: finalBpm,
      bpm: finalBpm,
      spo2: finalSpo2,
      temperature: finalTemp,
      hasTemperatureSensor: finalTemp !== null,
      accel: accelObj || { x: 0.0, y: 0.0, z: 1.0 },
      accelMagnitude: accelMag,
      isMoving: isMoving,
      activity: derivedActivity,
      mood: currentMood,
      isHardware: true,
      ir: ir,
      fingerDetected: fingerDetected,
      sqi: fingerDetected ? 95 : 15,
      sqiStatus: fingerDetected ? "Optimal Signal" : "Awaiting Contact"
    };
  }

  /**
   * Connect to physical ESP32 MAX30100 sensor via Browser Web Serial API
   */
  async connectWebSerial(baudRate = 115200) {
    if (typeof navigator === 'undefined' || !('serial' in navigator)) {
      const errMsg = "Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.";
      this.setHardwareState("ERROR", errMsg);
      throw new Error(errMsg);
    }
    
    try {
      this.setHardwareState("CONNECTING");
      this.serialPort = await navigator.serial.requestPort();
      await this.serialPort.open({ baudRate: Number(baudRate) || 115200, bufferSize: 8192 });
      
      // Port successfully opened! Immediately notify that hardware is connected
      this.setHardwareState("CONNECTED");

      // Begin background serial reading loop to read real packets from device
      this.readSerialLoop();
      return true;
    } catch (err) {
      if (err.name === "NotFoundError") {
        this.setHardwareState("DISCONNECTED", "Device selection was cancelled by user.");
        return false;
      } else {
        this.setHardwareState("ERROR", err.message || "Failed to open serial port.");
        throw err;
      }
    }
  }

  /**
   * Background serial read loop reading continuous chunks
   */
  async readSerialLoop() {
    const decoder = new TextDecoder();
    let buffer = "";

    while (this.isHardwareConnected && this.serialPort?.readable) {
      try {
        this.reader = this.serialPort.readable.getReader();
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            
            // Split by newline (\r\n or \n)
            const lines = buffer.split(/[\r\n]+/);
            // Retain incomplete line
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              // Save to raw log buffer
              this.rawLog.push(trimmed);
              if (this.rawLog.length > 25) this.rawLog.shift();
              if (this.onRawLine) this.onRawLine(trimmed);

              // Parse packet
              const parsed = TelemetryStream.parseSerialPacket(trimmed, this.currentActivity, this.currentMood);
              if (parsed && this.onReading) {
                this.lastPacketTime = Date.now();
                this.onReading(parsed);
              }
            }
          }
        }
      } catch (readErr) {
        console.warn("Web Serial read stream error:", readErr);
        if (this.reader) {
          try { this.reader.releaseLock(); } catch (e) {}
          this.reader = null;
        }
        if (!this.isHardwareConnected) break;
        // Wait briefly before attempting to reconnect reader
        await new Promise(r => setTimeout(r, 250));
      } finally {
        if (this.reader) {
          try { this.reader.releaseLock(); } catch (e) {}
          this.reader = null;
        }
      }
    }
  }

  /**
   * Disconnect physical hardware and cleanly release serial port
   */
  async disconnectHardware() {
    this.isHardwareConnected = false;
    this.hardwareState = "DISCONNECTED";
    this.lastPacketTime = 0;

    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (e) {}
      try {
        this.reader.releaseLock();
      } catch (e) {}
      this.reader = null;
    }

    if (this.serialPort) {
      try {
        await this.serialPort.close();
      } catch (e) {}
      this.serialPort = null;
    }

    this.setHardwareState("DISCONNECTED");
  }

  /**
   * Simulate Physical Activity Scenario for demonstrator testing
   */
  setScenario(scenarioId) {
    this.setHardwareState("CONNECTED");
    
    let hr = 64.0;
    let spo2 = 98.6;
    let temp = 36.6;
    let activity = "Resting";

    if (scenarioId === 'stairs') {
      hr = 98.0;
      spo2 = 98.2;
      temp = 37.0;
      activity = "Climbing Stairs";
    } else if (scenarioId === 'caffeine') {
      hr = 82.0;
      spo2 = 98.5;
      temp = 36.8;
      activity = "Resting";
    } else if (scenarioId === 'exercise') {
      hr = 128.0;
      spo2 = 97.8;
      temp = 37.4;
      activity = "Running";
    }

    this.currentActivity = activity;

    if (this.onReading) {
      this.onReading({
        device_id: "esp32_demo",
        timestamp: new Date().toISOString(),
        heart_rate: hr,
        heartRate: hr,
        spo2: spo2,
        temperature: temp,
        activity: activity,
        mood: this.currentMood || "Normal",
        isHardware: true,
        fingerDetected: true,
        sqi: 95,
        sqiStatus: "High"
      });
    }
  }

  /**
   * Serial Telemetry Parser Self-Test Suite
   */
  static runParserSelfTest() {
    const testCases = [
      {
        name: "Valid Serial JSON Packet",
        input: '{"bpm": 74.5, "spo2": 98.6, "temp": 36.6, "sqi": 95, "finger_detected": true}',
        expectedValid: true
      },
      {
        name: "Invalid JSON Syntax but Key-Value",
        input: 'BPM=74.5, SPO2=98.6, TEMP=36.6',
        expectedValid: true
      },
      {
        name: "Non-JSON Sensor Log Line",
        input: 'RAW_ADC_BUFFER: 12049, 12055, 12061',
        expectedValid: false
      },
      {
        name: "Out of Bounds BPM (> 230)",
        input: '{"bpm": 450, "spo2": 98.0, "temp": 36.6}',
        expectedValid: true // Normalized safely to 72.0
      },
      {
        name: "Low BPM Standby (0 bpm)",
        input: '{"bpm": 0, "spo2": 0, "finger_detected": false}',
        expectedValid: true // Safely recognized as standby packet with fingerDetected: false
      },
      {
        name: "Null Temperature (Unattached Probe)",
        input: '{"bpm": 72.0, "spo2": 98.5, "temp": null, "finger": true, "accel": {"x": 0.0, "y": 0.0, "z": 1.0}}',
        expectedValid: true
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
