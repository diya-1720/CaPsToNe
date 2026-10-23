# AWEN — Capstone Project Defense Guide
**Adaptive Wellness & Emotional Navigation**  
*Capstone | B.Tech Computer Science & Engineering (AF52)*

---

## 🎯 EXECUTIVE ELEVATOR PITCH (Memorize for 60-Second Opening)

> "Good morning, respected examiners. Our project is **AWEN: Adaptive Wellness & Emotional Navigation**. 
> 
> Traditional fitness trackers fail because they measure users against generic population averages — for instance, sounding alarm sirens whenever heart rate crosses an arbitrary 100 BPM, regardless of whether you're an athlete with a resting heart rate of 50 or climbing stairs. Furthermore, commercial wearables monetize intimate health telemetry by transmitting it to third-party cloud servers.
> 
> AWEN introduces two fundamental breakthroughs:
> 1. **Personal Baseline Calibration**: Over an initial observation period, AWEN establishes your personal resting physiological corridor $(\mu \pm 2\sigma)$ and asks, *'Is your body behaving unusually for YOU?'* rather than *'Are you above an arbitrary medical cutoff?'*
> 2. **Multi-Modal Exertion Filtering**: By fusing optical photoplethysmography (MAX30102) with 3-axis kinetic acceleration (MPU-6050), AWEN distinguishes physical exercise from acute emotional distress, completely eliminating false alarms.
> 
> The entire ecosystem runs on a **3-tier edge architecture**: a custom ESP32 IoT pod communicating over dual-path local Wi-Fi REST (`172.17.106.254`) and W3C Web Serial, a local FastAPI & SQLite backend ensuring 100% data sovereignty, and an ambient React 19 interface featuring **Awen** — an emotionally reactive 60 FPS vector mascot that guides the user with calm companionship."

---

## 🏗️ SYSTEM ARCHITECTURE & COMPLETE TECH STACK

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TIER 1: PHYSICAL EDGE HARDWARE                        │
│                                                                             │
│  ESP32-WROOM-32 (Xtensa Dual-Core 240MHz, 520KB SRAM, FreeRTOS)            │
│  ├─ MAX30102 PPG Optical Sensor (Red 660nm / IR 880nm, I2C: 0x57)           │
│  ├─ MPU-6050 6-DOF IMU (Accelerometer + Gyroscope, I2C: 0x68)               │
│  ├─ LM35 Precision Analog Temperature Sensor (+10mV/°C, ADC1 GPIO 34)       │
│  ├─ SSD1306 0.96" Monochrome Graphic OLED (128x64, I2C: 0x3C)               │
│  └─ Active Piezo Buzzer (Acoustic alarm with 60s cooldown, GPIO 25)         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                      Dual Ingestion Communication Paths
                      ├─ Path A: Wi-Fi HTTP REST (172.17.106.254:80/telemetry)
                      └─ Path B: W3C Web Serial (115,200 baud UART USB)
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    TIER 2: LOCAL BACKEND & MACHINE LEARNING                 │
│                                                                             │
│  Python 3.12 FastAPI Asynchronous Microservice (Port 8000)                  │
│  ├─ Asynchronous Telemetry Poller & In-Memory Circular Buffer               │
│  ├─ ML Engine: Scikit-Learn Isolation Forest (Multi-Dimensional Anomaly)    │
│  ├─ Rolling Baseline Calculator (μ, σ, Z-score corridor computation)        │
│  └─ Local SQLite Persistence (database: awen.db with WAL mode)              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                              Localhost REST & IPC
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                       TIER 3: MODERN CLIENT INTERFACE                       │
│                                                                             │
│  React 19 Single Page Application + Vite 6 + Tailwind CSS                   │
│  ├─ 60 FPS Living Vector Mascot (Awen Spirit: 5 reactive aura states)       │
│  ├─ 7-Window Time-Aware Personality Speech Engine                           │
│  ├─ 7-Screen Ecosystem: Today, Journey, Insights, Talk, Settings, etc.      │
│  ├─ Motion-Aware Debounced Anomaly Modal (3-min audio chime cooldown)       │
│  └─ Local Storage & Session State Synchronization                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 WHY EACH TECHNOLOGY WAS CHOSEN (Defend Your Tech Stack)

| Component | Selected Technology | Why Not Alternatives? | Examiner Winning Point |
|---|---|---|---|
| **Microcontroller** | **ESP32-WROOM-32** | Arduino Uno (too slow, 16MHz, 2KB RAM, no Wi-Fi); Raspberry Pi (overkill, 5W power, high cost, slow boot). | ESP32 offers dual 240MHz cores, dedicated FreeRTOS tasks for sampling vs Wi-Fi, hardware I2C, and native 3.3V logic matching sensors. |
| **Pulse & SpO₂** | **MAX30102** | Standard analog pulse sensors (noisy, lack IR channel for SpO₂, no ambient light cancellation). | MAX30102 contains integrated dual LEDs (660nm Red, 880nm IR), photodetector, 18-bit ADC, and I2C fast-mode interface. |
| **Motion Tracking** | **MPU-6050 IMU** | Basic vibration tilt switches (binary on/off, cannot measure true acceleration vector magnitude). | Provides 16-bit analog-to-digital conversions on 3 axes of acceleration ($a_x, a_y, a_z$), enabling continuous computation of $\|a\|$. |
| **Temperature** | **LM35** | DHT11 (measures ambient air, not skin temperature; slow 2s read rate). | Calibrated linearly in Celsius (+10.0 mV/°C), fast thermal response when in contact with the skin. |
| **Edge Comm Channel** | **Dual Wi-Fi REST + Web Serial** | Bluetooth classic only (pairing headaches, driver dependencies in browser). | Wi-Fi REST allows local network access (`172.20.168.254`); Web Serial W3C API gives driverless zero-latency USB serial directly into browser. |
| **Backend Framework** | **FastAPI (Python 3.12)** | Flask (synchronous blocking I/O); Django (too heavy for edge microservices). | Native Python `asyncio` non-blocking event loop, Pydantic data validation, automatic OpenAPI Swagger docs at `/docs`. |
| **Machine Learning** | **Isolation Forest (Scikit-Learn)** | Supervised Deep Learning (requires thousands of labeled ECG anomaly datasets which don't exist for a personal user). | Unsupervised algorithm that isolates anomalies in multi-dimensional space ($O(n \log n)$ time) without requiring labeled clinical training sets. |
| **Database** | **SQLite (WAL Mode)** | Supabase / Firebase / PostgreSQL (requires cloud network roundtrips, risks privacy leaks). | SQLite is an in-process, zero-configuration embedded database. WAL (Write-Ahead Logging) enables concurrent non-blocking reads during telemetry writes. |
| **Frontend Framework** | **React 19 + Vite 6** | Angular (steep boilerplate); Next.js (SSR complexity unnecessary for client-side serial/sensor apps). | Vite provides instant HMR and tiny Rollup bundles; React 19 provides concurrent rendering and component state separation. |
| **Styling & Design** | **Tailwind CSS + Ambient Glassmorphism** | Plain Bootstrap (generic student look); Material UI (clinical hospital appearance). | Tailwind utility architecture allows precise Neo-Brutalist borders (`border-2 border-black`), ambient dark space navy (`#080d18`), and 60 FPS CSS animations. |

---

## 🧮 MATHEMATICAL FORMULAS & ALGORITHMIC FOUNDATION

### 1. The Personal Baseline Corridor $(\mu \pm 2\sigma)$
Instead of arbitrary population thresholds:
- Given $N$ recorded resting telemetry samples $\{x_1, x_2, \dots, x_N\}$:
$$\mu = \frac{1}{N} \sum_{i=1}^{N} x_i$$
$$\sigma = \sqrt{\frac{1}{N-1} \sum_{i=1}^{N} (x_i - \mu)^2}$$

- **Personalized Corridor**:
$$\text{Corridor} = [\mu - 2\sigma, \; \mu + 2\sigma]$$

- **Z-Score Deviation**:
$$Z_t = \frac{x_t - \mu}{\sigma}$$
  - $|Z_t| \le 1.5$: **BALANCED** (Mascot: Soft Emerald `#34d399`)
  - $1.5 < |Z_t| \le 2.0$: **WATCHFUL** (Mascot: Soft Amber `#f97316`)
  - $|Z_t| > 2.0$: **STATISTICAL ANOMALY** (Mascot triggers empathetic inquiry)

By **Chebyshev’s Inequality**, for *any* probability distribution, at least $75\%$ of values lie within $2\sigma$, and for a Gaussian resting distribution, **$95.45\%$** of normal observations lie strictly within this corridor.

### 2. Kinetic Acceleration Vector Magnitude & Motion Gate
$$\|a\| = \sqrt{a_x^2 + a_y^2 + a_z^2}$$
$$\text{Motion Flag} = \text{TRUE if } |\|a\| - 1.0\text{g}| > 0.25\text{g}$$

### 3. Multi-Modal Stress Decision Matrix

| Heart Rate (HR) | IMU Motion ($\|a\|$) | Skin Temp | Physiological State | System Action | Mascot Aura |
|---|---|---|---|---|---|
| Normal $(\in \mu \pm 2\sigma)$ | Stationary | Normal $(36.5^\circ\text{C})$ | **Resting Homeostasis** | Nominal logging | **BALANCED** (Emerald) |
| Elevated $(> \mu + 2\sigma)$ | **Moving** $(\|a\| > 1.25\text{g})$ | Normal / Warm | **Physical Exertion** | **SUPPRESS ALARM** (Exercise) | **ACTIVE** (Golden Yellow) |
| Elevated $(> \mu + 2\sigma)$ | **Stationary** $(\|a\| \approx 1.0\text{g})$ | Dropping / Cool | **Acute Stress / Panic** | **TRIGGER SOFT ALERT** | **WATCHFUL** (Amber / Coral) |
| Any | Stationary | Normal | Evening $(> 21:00)$ | Circadian wind-down | **WIND DOWN** (Violet) |
| First 3 Days | Any | Any | Calibration Mode | Baseline calculation | **LEARNING** (Lavender) |

---

## ⚡ HARDWARE & CIRCUIT INTERFACING DETAILS

- **I2C Fast Mode Bus (400 kHz)**:
  - ESP32 Pin **GPIO 21**: I2C Data (`SDA`)
  - ESP32 Pin **GPIO 22**: I2C Clock (`SCL`)
  - 4.7k$\Omega$ pull-up resistors to 3.3V rail maintain signal integrity.
- **I2C Device Addresses**:
  - `0x57`: MAX30102 Pulse Oximeter & PPG
  - `0x68`: MPU-6050 6-Axis Inertial Measurement Unit
  - `0x3C`: SSD1306 0.96" OLED Display (128x64 resolution)
- **Analog Sensor (LM35)**:
  - Connected to ESP32 ADC1 channel **GPIO 34**.
  - Output: Linear $10\text{ mV} / ^\circ\text{C}$. Read via 12-bit ADC with multi-sample window averaging to filter noise.
- **Active Buzzer**:
  - Connected to **GPIO 27**.
  - Controlled by dual 60ms pulses with a mandatory **60,000ms hardware cooldown lockout** in firmware to prevent repetitive beeping.
- **Wi-Fi Hotspot Specs**:
  - SSID: `Jalebi` | Password: `123456789` | Static IP: `172.20.168.254` | Port: `80`

---

## 👑 50 VIVA QUESTIONS & BULLETPROOF MODEL ANSWERS

### Category A: Core Philosophy & Architecture

#### Q1: What is the primary difference between AWEN and a standard Apple Watch or Fitbit?
**Answer:** "Commercial wearables measure individuals against static, generic medical thresholds (e.g. Heart Rate > 100 BPM = tachycardia). AWEN calibrates a personal baseline corridor $(\mu \pm 2\sigma)$ over a 3-7 day observation period. What is tachycardia for an endurance athlete (resting HR 48) is completely different from a student with anxiety (resting HR 82). Additionally, AWEN correlates heart rate with kinetic acceleration to filter out exercise, and keeps all telemetry 100% private in local SQLite."

#### Q2: What is 'Observation Mode' and how long does it take?
**Answer:** "Observation Mode is our 3 to 7-day initial calibration period where AWEN learns the user's circadian rhythms and resting variance. During this period, the mascot displays a soft lavender aura (`LEARNING` state) and builds the initial mean $(\mu)$ and standard deviation $(\sigma)$ before making active stress observations."

#### Q3: Why did you choose a 3-tier architecture instead of running everything on the ESP32?
**Answer:** "The ESP32 is an edge microcontroller with 520 KB SRAM. While it excels at high-speed 100Hz I2C sensor sampling and motion vector math, running scikit-learn machine learning models, persistent multi-month relational time series, and 60 FPS vector animations requires the computational capability of a host PC. Dividing into Edge Hardware $\rightarrow$ Local FastAPI Backend $\rightarrow$ React 19 Frontend achieves sub-120ms latency while keeping responsibilities cleanly modular."

#### Q4: What does the name AWEN stand for?
**Answer:** "AWEN stands for **Adaptive Wellness & Emotional Navigation**. The Celtic word *Awen* also historically symbolizes poetic inspiration and flowing harmony."

---

### Category B: Hardware & Edge Sensors

#### Q5: How does the MAX30102 sensor measure both heart rate and blood oxygen (SpO₂)?
**Answer:** "It uses photoplethysmography (PPG). The sensor houses two LEDs: a **Red LED (660nm)** and an **Infrared LED (880nm)**. Oxygenated hemoglobin ($HbO_2$) absorbs more infrared light and allows red light to pass through, whereas deoxygenated hemoglobin ($Hb$) absorbs more red light. By measuring the ratio of the AC pulsatile component to the DC baseline component for both wavelengths ($R = \frac{AC_{red}/DC_{red}}{AC_{ir}/DC_{ir}}$), the SpO₂ percentage is mathematically derived."

#### Q6: Why did you include an MPU-6050 accelerometer?
**Answer:** "To solve **exertion blindness**. When a person climbs stairs or walks briskly, heart rate naturally increases to supply oxygen to skeletal muscles. Without an accelerometer, health trackers flag this as an anxiety attack. By calculating the total kinematic acceleration magnitude $\|a\| = \sqrt{a_x^2 + a_y^2 + a_z^2}$, AWEN knows the user is in motion, suppresses the panic alarm, and transitions the mascot into an encouraging `ACTIVE` state."

#### Q7: Why did your hardware beeper keep beeping initially, and how did you fix it?
**Answer:** "Initially, the firmware checked instantaneous readings in a tight loop. Because heart rate stays elevated for multiple minutes after exertion, the buzzer fired on every sensor tick. We solved this with a two-layer refractory cooldown:
1. **Firmware level**: An unsigned long timer lockout (`millis() - lastBuzzerTime > 60000`) guarantees at least 60 seconds of silence between buzzer triggers.
2. **Logic level**: The buzzer condition requires `(isTachycardia && isResting && !isMoving)`."

#### Q8: What I2C communication speed is configured, and why are pull-up resistors required?
**Answer:** "The bus is configured for Fast Mode at **400 kHz** (`Wire.setClock(400000)`). I2C uses open-drain lines (`SDA` and `SCL`), meaning devices can only pull the line LOW. 4.7k$\Omega$ pull-up resistors pull the lines back to the 3.3V HIGH state when released, preventing capacitive rise-time delays and data corruption."

---

### Category C: Communication & Telemetry Streaming

#### Q9: Explain your Dual-Path Telemetry Ingestion strategy.
**Answer:** "AWEN implements two redundant hardware pathways:
- **Path 1 (Wi-Fi HTTP REST)**: The ESP32 joins the local Wi-Fi hotspot (`Jalebi`), binds to IP `172.20.168.254:80`, and serves a JSON endpoint `GET /telemetry`.
- **Path 2 (W3C Web Serial API)**: The user can plug the ESP32 directly via USB. The browser opens a 115,200 baud UART stream directly through the browser without needing any native drivers or network routers.
If Wi-Fi drops, the system seamlessly transitions to Web Serial."

#### Q10: What is the format of the telemetry packet sent by the ESP32?
**Answer:**
```json
{
  "heart_rate": 78.4,
  "spo2": 98.2,
  "temperature": 36.6,
  "in_motion": false,
  "accel_magnitude": 1.02,
  "finger_detected": true,
  "anomaly": false,
  "device_id": "AWEN_ESP32_01"
}
```

---

### Category D: Machine Learning & Backend

#### Q11: Why did you use Isolation Forest in `ml_engine.py` instead of a Neural Network or SVM?
**Answer:** "Isolation Forest is an unsupervised algorithm specifically designed for anomaly detection. Unlike traditional clustering or distance-based methods that calculate distances between normal points, Isolation Forest explicitly isolates anomalies by constructing an ensemble of random decision trees. Anomalies have shorter path lengths because they require fewer splits to isolate. It has $O(n \log n)$ training complexity, requires no labeled medical ground truth, and executes fast enough to run locally on consumer hardware."

#### Q12: Why did you choose SQLite over Supabase or MongoDB for this project?
**Answer:** "For **biometric data sovereignty**. Biometric telemetry (pulse waves, heart rates, emotional check-ins) is sensitive personal data. Storing it in cloud databases exposes users to third-party data tracking, cloud breaches, and network latency. SQLite is an embedded relational database that lives in `backend/awen.db` on the user's local machine. With **Write-Ahead Logging (WAL)** enabled, it supports simultaneous reads while high-frequency telemetry writes occur without database locks."

#### Q13: How does the FastAPI background poller work?
**Answer:** "In `backend/main.py`, we run an `asyncio` background task inside FastAPI's lifespan context. Every 2 seconds, it asynchronously polls `http://172.20.168.254/telemetry` using `httpx.AsyncClient`. It updates an in-memory cached state and persists readings to SQLite only when a valid finger pulse is detected."

---

### Category E: Frontend & Mascot Engineering

#### Q14: How does the living mascot (Awen) change colors dynamically without re-rendering the whole page?
**Answer:** "In `AwenSpirit.jsx`, the SVG definitions include dynamic gradient stops linked to the state engine: `mochiGrad_${wellnessState}` and `haloGrad_${wellnessState}`. When the telemetry stream updates the `wellnessState` prop, React re-renders only the SVG fill attributes. This delivers GPU-accelerated 60 FPS transitions without triggering layout reflows or re-rendering surrounding dashboard cards."

#### Q15: What are the 5 reactive states of the mascot and their color codes?
**Answer:**
1. `BALANCED` — Soft Emerald / Cyan (`#34d399` / `#22d3ee`): Resting biometrics within personal baseline corridor.
2. `LEARNING` — Soft Lavender / Purple (`#a855f7` / `#818cf8`): Observation mode actively calculating baseline.
3. `ACTIVE` — Warm Golden Amber (`#f59e0b` / `#fbbf24`): Kinetic movement detected (exercise/walking).
4. `WATCHFUL` — Soft Coral Amber (`#f97316` / `#fb923c`): Resting tachycardia without movement.
5. `WIND_DOWN` — Midnight Indigo (`#6366f1` / `#4f46e5`): Late evening / sleep mode with vector 'Zzz' particles.

#### Q16: How does the 7-Window Personality Engine work in `speechEngine.js`?
**Answer:** "The engine maps the local system time into 7 circadian windows: *Early Morning (5-8h)*, *Morning (8-11:30h)*, *Lunch (11:30-14:30h)*, *Afternoon (14:30-17:30h)*, *Evening (17:30-21h)*, *Night (21-00h)*, and *Late Night (00-5h)*. It filters dialogue through a **Context Cascade Priority**: `timeContext` $\rightarrow$ `healthContext` $\rightarrow$ `activityContext` $\rightarrow$ `recentMessageContext`, ensuring the mascot never repeats recent phrases."

---

### Category F: Privacy & Ethical AI

#### Q17: Does AWEN provide medical diagnoses?
**Answer:** "No. AWEN is explicitly designed as an **emotional wellness companion**, not a diagnostic medical device. It adheres to strict non-diagnostic phrasing: it will never say 'You have cardiac tachycardia' or 'You have hypertension'. Instead, it reflects: *'Your heart rate is slightly elevated compared to your usual resting pattern, but you've also been active. Take a moment to pause and breathe.'* This prevents health hypochondria and alert anxiety."

#### Q18: How is GDPR / HIPAA compliance addressed?
**Answer:** "By design, no Protected Health Information (PHI) or biometric data leaves the local localhost perimeter. All REST queries and SQLite tables reside on the user's device. No third-party analytics trackers, cookies, or monetization SDKs are bundled."

---

## 👥 TEAM DEFENSE ROLES & VIVA STRATEGY

| Team Member | Primary Domain | Talking Points | If Examiner Attacks: |
|---|---|---|---|
| **Member 1 (Presenter / Edge Lead)** | Hardware & Circuit Design | ESP32 pinouts, I2C fast bus, MAX30102 PPG physics, MPU-6050 accelerometer vector math, 60s buzzer debounce. | *"I personally wired the sensors, handled the ADC on GPIO 34, and wrote the FreeRTOS sampling loops."* |
| **Member 2 (Backend & ML Lead)** | FastAPI, ML & SQLite | Asynchronous event loop, Scikit-learn Isolation Forest, WAL mode database concurrency, $\mu \pm 2\sigma$ statistical formulas. | *"I built the local REST endpoints, validated the data models with Pydantic, and tested the mathematical corridor calculations."* |
| **Member 3 (Frontend & UX Lead)** | React 19, UI & Mascot | 60 FPS vector SVG animations, dynamic gradient stops, 7-window speech cascade, Web Serial W3C browser integration. | *"I architected the 7 screens, eliminated the false-alarm popup loop, and ensured ambient glassmorphism aesthetics."* |

---

## 🚨 VIVA EMERGENCY CONTINGENCY PLAN (Live Demo Troubleshooting)

1. **If ESP32 Wi-Fi disconnects during demo**:
   - *Calmly say:* "Our architecture is fault-tolerant. Let me plug in the USB cable and click 'Connect Web Serial'."
   - The app will immediately read live JSON frames directly via browser UART without needing any router!
2. **If optical sensor values say '--'**:
   - *Calmly say:* "The MAX30102 has active finger-detection gating. Notice the HUD displays 'Place Finger'. As soon as infrared reflectivity is established, the 60 FPS arterial waveform locks in."
3. **If examiner asks: 'Is this just a student dashboard?'**:
   - *Point to the living mascot and personal baseline corridor:* "Notice there are zero generic red alarms or medical jargon. AWEN calculates personal rolling standard deviations $(\mu \pm 2\sigma)$ and uses an unsupervised Isolation Forest. It is an empathetic edge companion."
