<div align="center">

# 🌿 AWEN
### **Adaptive Wellness & Emotional Navigation**
*Personalized Physiological Baseline Intelligence & Longitudinal Health Companion*

**Capstone Project | Bachelor of Engineering in Computer Science & Engineering (Data Science)**  
**Department of Computer Science & Engineering (Data Science)**  
**St. John College of Engineering and Management (Autonomous College Affiliated to University of Mumbai)**  
*Academic Year: 2026–2027 | Project Batch Code: AF52*

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python_3.12%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_6%2F8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![SQLite](https://img.shields.io/badge/SQLite_3_WAL-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![ESP32](https://img.shields.io/badge/ESP32_WROOM_32-E7352C?style=for-the-badge&logo=espressif&logoColor=white)](https://espressif.com/)
[![W3C Web Serial](https://img.shields.io/badge/Web_Serial_API-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://wicg.github.io/serial/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Verification Status](https://img.shields.io/badge/Audit_Suite-16%2F16_PASSED-success?style=for-the-badge)]()

<br/>

> **"Comparing your body against your own physiological normal — not static population averages."**  
> An end-to-end, privacy-first IoT and machine learning healthcare platform that couples dual-mode hardware ingestion with dynamic personal baseline corridors ($\mu \pm 2\sigma$), context-aware motion gating, and a 60 FPS emotional navigation companion.

</div>

---

## 📑 Project Deliverables & Academic Evaluation Hub

| Resource Document | Description | Format / Path |
|---|---|---|
| 📖 **Project Development Report** | Complete 8-chapter capstone engineering report including system requirements, feasibility, algorithmic design, and verification. | [`PROJECT_DEVELOPMENT_REPORT.md`](PROJECT_DEVELOPMENT_REPORT.md) |
| 🌐 **Interactive Web Presentation Deck** | 14-slide neo-brutalist interactive presentation slide deck directly viewable in any desktop browser with keyboard controls (`Space` / `Arrows`). | [`public/presentation/index.html`](public/presentation/index.html) |
| 📊 **Capstone Final Presentation Deck** | 16:9 widescreen PowerPoint deck covering problem statement, system architecture, baseline math, UI demo, and commercial roadmap. | [`AWEN_Final_Presentation_AF52.pptx`](AWEN_Final_Presentation_AF52.pptx) |
| 💻 **Platform & Feature Overview** | Screen-by-screen breakdown of all 7 client views, dynamic island alerts, and privacy mechanics. | [`WEBSITE_OVERVIEW.md`](WEBSITE_OVERVIEW.md) |

---

## 👥 Project Team & Mentorship

- **Project Batch Code**: `AF52`
- **Degree**: Bachelor of Engineering (B.E.) in Computer Science & Engineering (Data Science)
- **Department**: Department of Computer Science & Engineering (Data Science)
- **Institution**: St. John College of Engineering and Management (SJCEM), Palghar
- **University Affiliation**: Autonomous College Affiliated to University of Mumbai
- **Academic Year**: 2026–2027

### Core Engineering Team

| Sr. No. | Student Name | PID No. | Role & Core Contributions |
|:---:|:---|:---:|:---|
| 1 | **Diya Singh**<br/>*(Project Lead & System Architect)* | `EU1258014` | **Overall Project Leadership & End-to-End System Architecture**:<br/>• Conceived, mathematically designed, and implemented the core dynamic physiological baseline corridor engine ($\mu \pm 2\sigma$) and kinetic exertion motion gating.<br/>• Architected and developed the complete React 19 single-page application (7-screen ecosystem, 60 FPS HTML5 Canvas PPG pulse wave oscilloscope, and state-reactive living vector mascot).<br/>• Developed the asynchronous Python FastAPI backend, SQLite multi-tenant data isolation, hardware REST proxy bridge, and Scikit-Learn baseline classification engine.<br/>• Directed end-to-end hardware-software integration, Web Serial UART communication, and system verification. |
| 2 | **Parth Topale** | `EU1258058` | **Firmware Drivers & Peripheral Control Lead**:<br/>• ESP32 microcontroller pinout configuration and FreeRTOS multi-sensor task scheduling.<br/>• MAX30100/102 optical PPG I2C registers and pulse peak lock integration.<br/>• UART serial telemetry packet formatting (115,200 baud). |
| 3 | **Nishtha Lokhande** | `EU1258019` | **Electrical Verification & Probing Lead**:<br/>• Hardware breadboard assembly and sensor voltage rail stabilization ($3.3\text{V}$ / $5\text{V}$).<br/>• Sensor noise probing, LM35 analog temperature multi-sample ADC calibration, and I2C address bus scanning. |
| 4 | **Swara Patil** | `EU1258011` | **BOM Management & Technical Documentation Lead**:<br/>• Bill of Materials (BOM) management and component procurement.<br/>• SQLite test dataset auditing and verification assistance.<br/>• Academic report compilation and formatting. |

### Project Guide & Mentorship

- **Prof. Sachin Sase**  
  *Assistant Professor, Department of Computer Science & Engineering (Data Science)*  
  *St. John College of Engineering and Management (SJCEM), Palghar*

---

## 💡 The Core Thesis: Beyond Static Population Cutoffs

### The Problem with Conventional Wearables
Traditional consumer fitness trackers and institutional monitors evaluate human physiology against **generic, static medical thresholds**:
$$\text{Alert triggered if } \text{HR} > 100\text{ BPM}$$

This population-wide approach exhibits two critical clinical failure modes:
1. **False Negatives in Athletic or Low-Baseline Users**: An individual whose resting heart rate is normally $52\text{ BPM}$ could suffer severe emotional distress or physiological illness elevating their heart rate to $88\text{ BPM}$. Static systems remain completely silent because $88 < 100\text{ BPM}$.
2. **False Positives in Naturally High-Baseline Users**: A healthy individual who naturally rests at $85\text{ BPM}$ triggers constant anxiety-inducing alerts during mild cognitive exertion.
3. **Context Blindness**: Standard monitors cannot differentiate between an elevated heart rate caused by physical exercise (e.g., climbing stairs) and an elevated heart rate during quiet rest (e.g., panic or acute distress).

```
   TRADITIONAL HEALTH MONITORS                  AWEN ADAPTIVE BASELINE
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│ Generic Cutoff: 100 BPM         │       │ Dynamic Range: [μ - 2σ, μ + 2σ] │
│                                 │       │                                 │
│ Patient A (Normal 52 BPM):      │       │ Patient A:                      │
│ 88 BPM → "Normal" (NO ALERT!)   │       │ 88 BPM → +3.6σ OUTLIER DETECTED │
│                                 │       │                                 │
│ Patient B (Normal 85 BPM):      │       │ Patient B:                      │
│ 102 BPM → "TACHYCARDIA ALERT!"  │       │ 102 BPM → Contextually Normal   │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

### AWEN's Dual-Breakthrough Solution
1. **Dynamic Personal Baseline Corridor ($\mu \pm 2\sigma$)**:
   During an initial 3–7 day observation window, AWEN computes the user's personal Gaussian resting corridor:
   $$\mu_{\text{rest}} = \frac{1}{N} \sum_{i=1}^{N} \text{BPM}_i, \quad \sigma_{\text{rest}} = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (\text{BPM}_i - \mu_{\text{rest}})^2}$$
   $$\text{Normal Corridor} = \left[ \mu_{\text{rest}} - 2\sigma_{\text{rest}}, \; \mu_{\text{rest}} + 2\sigma_{\text{rest}} \right] \quad (95.4\% \text{ confidence})$$

2. **Multi-Modal Motion Gating**:
   AWEN calculates the instantaneous 3D acceleration vector magnitude:
   $$|\vec{a}| = \sqrt{a_x^2 + a_y^2 + a_z^2}$$
   - When $|\vec{a}| > 1.25\text{ g}$: The user is physically active (`Walking`, `Exercising`, `Climbing Stairs`). Alerts are automatically **gated and suppressed** to prevent false alarms.
   - When $|\vec{a}| \approx 1.0\text{ g}$ (Stationary Rest) AND $\text{BPM} > \mu + 2\sigma$: The elevated vitals cannot be explained by kinetic motion. AWEN triggers an empathetic check-in prompt: *"I noticed an unusual pattern in your readings. Are you feeling okay?"*

---

## 🏗️ System Architecture

AWEN is built on an end-to-end 3-tier edge architecture operating with complete local data sovereignty:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TIER 1: PHYSICAL EDGE HARDWARE                        │
│                                                                             │
│  ESP32-WROOM-32 (Xtensa Dual-Core 240MHz, 520KB SRAM, FreeRTOS)            │
│  ├─ MAX30102 / MAX30100 Optical PPG (Red 660nm / IR 880nm, I2C: 0x57)      │
│  ├─ MPU-6050 / MPU-6500 6-Axis IMU (Accel + Gyroscope, I2C: 0x68)           │
│  ├─ LM35 Precision Analog Temperature Sensor (+10mV/°C, ADC1 GPIO 34)       │
│  ├─ SSD1306 0.96" Monochrome Graphic OLED (128x64, I2C: 0x3C)               │
│  └─ Active Piezo Buzzer (Acoustic alarm with 60s cooldown, GPIO 25)         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                      Dual Ingestion Communication Paths
                      ├─ Path A: Wi-Fi HTTP REST (http://<ESP32_IP>/api/telemetry)
                      └─ Path B: W3C Web Serial (115,200 baud UART USB CDC)
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    TIER 2: LOCAL BACKEND & MACHINE LEARNING                 │
│                                                                             │
│  Python 3.12+ FastAPI Asynchronous Microservice (:8000)                     │
│  ├─ Hardware Proxy Bridge: Bypasses browser CORS & PNA restrictions         │
│  ├─ ML Engine: Scikit-Learn Isolation Forest & Rolling Gaussian Statistics  │
│  ├─ Motion Classifier: 3D Kinetic Vector Magnitude Engine                   │
│  ├─ Cryptographic Auth: PBKDF2-HMAC-SHA256 (100,000 iterations + salt)      │
│  └─ SQLite 3 Relational Database (WAL mode, multi-tenant row isolation)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                      Localhost REST Queries (Bearer Token)
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                       TIER 3: MODERN CLIENT INTERFACE                       │
│                                                                             │
│  React 19 Single Page Application + Vite 6/8 (:5173)                        │
│  ├─ Living Mascot Stage: 60 FPS vector SVG with 5 aura color reactivity    │
│  ├─ 60 FPS HTML5 Canvas PPG Oscilloscope with real-time waveform buffer     │
│  ├─ 7 Dedicated Views: Today, Journey, Insights, Talk, You, Settings, etc. │
│  ├─ IoT Hardware Console: Dual-mode COM port pairing & Wi-Fi monitor        │
│  └─ Authentic Zero-Mock Policy: Strict '--' display when sensors offline    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📟 Hardware Pinout & Circuitry

| Component | Interface / Protocol | ESP32 Pin | Technical Role |
|---|---|---|---|
| **SSD1306 128×64 OLED** | I2C (`0x3C`) | SDA: `GPIO 21`, SCL: `GPIO 22` | Displays live vitals & 3-screen animated mascot face |
| **MAX30102 / MAX30100** | I2C (`0x57`) | SDA: `GPIO 21`, SCL: `GPIO 22` | Optical PPG sensing for Heart Rate & Blood Oxygen (SpO₂) |
| **MPU-6050 / MPU-6500** | I2C (`0x68`) | SDA: `GPIO 21`, SCL: `GPIO 22` | 6-Axis motion sensing (acceleration magnitude gating) |
| **LM35 Temperature** | Analog ADC1 | Analog Pin: `GPIO 34` | Precision linear thermal sensing (+10 mV/°C) |
| **Active Buzzer** | Digital Output | Digital Pin: `GPIO 25` | Acoustic notification on sustained physiological outliers |

---

## 🔒 Security, Authentication & Multi-Tenant Isolation

1. **Cryptographic Password Storage**: Passwords use **PBKDF2-HMAC-SHA256** with unique 16-byte cryptographically secure random salts and 100,000 hashing rounds.
2. **Persistent Session Tokens**: Successful authentication yields an opaque cryptographic bearer token stored in SQLite `user_sessions`.
3. **Multi-Tenant Row-Level Isolation**: Absolute user boundary enforcement at the SQL query layer (`WHERE user_id = current_user.id`). User A can never query, infer, or alter User B's vitals, check-ins, or baseline corridors.
4. **Authentic Zero-Mock Policy**: When no hardware is transmitting, the dashboard cleanly displays `--` with an explicit `AWAITING SENSOR` status. Fake, randomized, or mock numbers are strictly forbidden.

---

## 📂 Clean Repository Structure

```
CaPsToNe/
├── backend/                        # Python FastAPI service, ML engine, SQLite DB, tests, ESP32 firmware
│   ├── esp32_firmware/             # Complete C++ Arduino firmware for ESP32 & OLED mascot
│   │   └── esp32_max30102.ino      # Multi-screen rotation, 3-beat lock, MPU raw register reads
│   ├── database.py                 # SQLite 3 schema, PBKDF2 auth, session tokens & CRUD
│   ├── main.py                     # FastAPI routes, Pydantic validation, ESP32 proxy endpoints
│   ├── ml_engine.py                # Rolling baseline Gaussian corridor & anomaly detection
│   ├── requirements.txt            # Python backend dependencies
│   ├── seed_demo_observation.py    # Synthetic baseline observation seeder for demos
│   ├── test_complete_audit.py      # Comprehensive 16/16 end-to-end system audit suite
│   ├── test_mascot_wellbeing.py    # AI mascot prompt & SQLite check-in integration test
│   └── test_stress_indicator.py    # Kinetic motion filter & stress indicator verification
├── public/                         # Static web assets & interactive HTML presentation
│   ├── presentation/
│   │   └── index.html              # 14-slide interactive Neo-Brutalist presentation slide deck
│   ├── favicon.svg                 # SVG browser icon
│   └── icons.svg                   # Vector icon spritesheet
├── scripts/                        # Automated presentation generation utilities
│   └── generate_pptx.py            # 14-slide main capstone presentation builder
├── src/                            # React 19 Frontend application
│   ├── components/                 # Reusable UI components & screen views
│   │   ├── AbnormalReadingPopup.jsx# Motion-aware alert modal with subjective check-in
│   │   ├── AwenSpeechCloud.jsx     # Organic glass speech cloud above mascot
│   │   ├── AwenSpirit.jsx          # 60 FPS vector mascot with 5 reactive aura states
│   │   ├── HomeScreen.jsx          # Executive dashboard with vitals & oscilloscope
│   │   ├── IoTConfigModal.jsx      # Dual-mode USB Serial & Wi-Fi pairing console
│   │   ├── InsightsScreen.jsx      # Baseline corridor statistical dispersion chart
│   │   ├── JourneyScreen.jsx       # 7-day longitudinal baseline evolution & raw SQLite table
│   │   ├── LandingPage.jsx         # Product landing showcase
│   │   ├── SettingsScreen.jsx      # System configuration & baseline calibration controls
│   │   ├── TalkScreen.jsx          # AI companion conversational interface
│   │   ├── TodayScreen.jsx         # Chronological sensor timeline & subjective reflections
│   │   └── YouScreen.jsx           # User profile & demographic information editor
│   ├── services/                   # Client state engines & API communicators
│   │   ├── apiService.js           # REST communication with FastAPI backend
│   │   ├── stateEngine.js          # Mascot aura state engine (5 emotional states)
│   │   ├── speechEngine.js         # 7-window time-aware personality engine
│   │   ├── stressEngine.js         # Motion-aware exertion calculator & deviation detector
│   │   └── telemetryStream.js      # Web Serial USB & Wi-Fi polling bridge
│   ├── App.jsx                     # Root router, auth listener & background telemetry coordinator
│   ├── index.css                   # Neo-brutalist styling variables, typography & layout base
│   └── main.jsx                    # React 19 DOM entry point
├── AWEN_Final_Presentation_AF52.pptx   # 14-slide main capstone presentation deck (16:9 widescreen)
├── PROJECT_DEVELOPMENT_REPORT.md       # Comprehensive 8-chapter formal academic project report
├── WEBSITE_OVERVIEW.md                 # Detailed feature breakdown & screen inspection guide
├── package.json                        # Node.js project manifest & script declarations
└── vite.config.js                      # Vite bundler build settings
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.11 or higher with `pip`
- **Arduino IDE**: v2.x (with `ESP32 by Espressif`, `Adafruit SSD1306`, `Adafruit GFX`, and `MAX30100lib`)
- **Browser**: Google Chrome or Microsoft Edge (required for W3C Web Serial API)

### 2. Frontend Installation & Launch
```powershell
npm install
npm run dev
```
The client will launch at: **`http://localhost:5173`**

### 3. Backend Setup & Server Launch
```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base: **`http://127.0.0.1:8000`**
- Interactive Swagger API Documentation: **`http://127.0.0.1:8000/docs`**

### 4. Running the Verification Test Suite
```powershell
python backend/test_complete_audit.py
```
*Expected Result: All 16 verification checks pass with zero errors.*

### 5. Flashing ESP32 Microcontroller
1. Connect ESP32 via USB cable.
2. Open `backend/esp32_firmware/esp32_max30102.ino` in **Arduino IDE**.
3. Select Board: **ESP32 Dev Module**, Port: **COMx**.
4. Click **Upload**.
5. In the web application, click **Connect USB (Serial)** to stream live biometric packets at 115,200 baud.

---

## 📜 License

This project was developed by the students of Batch **AF52** as a Capstone Engineering Project at **St. John College of Engineering & Management**, affiliated with the **University of Mumbai**.

Released under the **MIT License**. See [`LICENSE`](LICENSE) for full details.
