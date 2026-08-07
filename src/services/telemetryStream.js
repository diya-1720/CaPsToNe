/**
 * AWEN Live Telemetry Stream & IoT Hardware Connector
 * 
 * Generates realistic PPG pulse wave telemetry and simulated MAX30102 sensor data.
 * Also supports direct Web Serial connection to physical ESP32 microcontrollers.
 */

export class TelemetryStream {
  constructor(onReadingCallback) {
    this.onReading = onReadingCallback;
    this.isRunning = false;
    this.intervalId = null;
    this.currentActivity = "Resting";
    this.currentMood = "Normal";
    this.simulatedScenario = "normal"; // normal, stairs, caffeine, stress
    this.serialPort = null;
    this.isHardwareConnected = false;
    
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

    // Apply scenario modifier
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
        // Adjust based on current activity
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

    this.onReading({
      heartRate: Math.round(hr * 10) / 10,
      spo2: Math.round(spo2 * 10) / 10,
      temperature: Math.round(temp * 10) / 10,
      activity: this.currentActivity,
      mood: this.currentMood,
      isHardware: this.isHardwareConnected,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  }

  /**
   * Connect to physical ESP32 MAX30102 sensor via Browser Web Serial API
   */
  async connectWebSerial() {
    if (!('serial' in navigator)) {
      throw new Error("Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
    }
    
    try {
      this.serialPort = await navigator.serial.requestPort();
      await this.serialPort.open({ baudRate: 115200 });
      this.isHardwareConnected = true;

      const textDecoder = new TextDecoderStream();
      this.serialPort.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      let buffer = "";
      while (this.isHardwareConnected) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        
        let lines = buffer.split("\n");
        buffer = lines.pop(); // Keep last incomplete line

        for (let line of lines) {
          line = line.trim();
          if (line.startsWith("{") && line.endsWith("}")) {
            try {
              const data = JSON.parse(line);
              if (data.bpm && this.onReading) {
                this.onReading({
                  heartRate: data.bpm,
                  spo2: data.spo2 || 98.5,
                  temperature: data.temp || 36.6,
                  activity: this.currentActivity,
                  mood: this.currentMood,
                  isHardware: true,
                  timestamp: new Date().toLocaleTimeString()
                });
              }
            } catch (e) {
              // Parse error ignore partial line
            }
          }
        }
      }
    } catch (err) {
      this.isHardwareConnected = false;
      throw err;
    }
  }

  disconnectHardware() {
    if (this.serialPort) {
      try {
        this.serialPort.close();
      } catch (e) {}
      this.serialPort = null;
    }
    this.isHardwareConnected = false;
  }
}
