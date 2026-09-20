<div align="center">

# AWEN

### **Adaptive Wellness & Emotional Navigation**
*Personalized Physiological Baseline Intelligence & Longitudinal Health Companion*

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python_3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![SQLite](https://img.shields.io/badge/SQLite_3-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![ESP32](https://img.shields.io/badge/ESP32-E7352C?style=for-the-badge&logo=espressif&logoColor=white)](https://espressif.com/)
[![Arduino](https://img.shields.io/badge/Arduino_IDE-00979D?style=for-the-badge&logo=arduino&logoColor=white)](https://arduino.cc)
[![W3C Web Serial](https://img.shields.io/badge/Web_Serial_API-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://wicg.github.io/serial/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/System_Status-Demo_Ready-brightgreen?style=for-the-badge)]()
[![Tests](https://img.shields.io/badge/Tests-All_Passing-success?style=for-the-badge)]()

<br/>

**A complete full-stack IoT physiological baseline monitoring system designed for students, professionals, and general users.**  
*Comparing your body against your own physiological normal — not static population averages.*

</div>

---

## 📌 Project Overview

**AWEN (Adaptive Wellness & Emotional Navigation)** is a full-stack, personal health and physiological monitoring platform designed to address a critical limitation in conventional wellness wearables: **static population thresholds**. 

Traditional wearable devices compare every individual to generic medical averages (for example, triggering alerts whenever heart rate exceeds 100 BPM). However, resting physiological parameters vary naturally from person to person. A heart rate of 82 BPM may be completely normal for one individual during quiet study, yet an indicator of acute fatigue for an endurance athlete.

AWEN continuously learns a user's **individual resting baseline** over time. By combining physiological data (Heart Rate, Blood Oxygen SpO₂, and Skin Temperature) with physical motion context (6-axis accelerometer and gyroscope vectors), AWEN evaluates whether today's body behavior deviates from the user's **own personal normal**, preventing false stress alarms during exercise and providing calm, contextual recovery feedback.

---

## 🚀 Key Features

The following capabilities are fully implemented in the codebase and backed by a real SQLite database:

- **User Registration & Security**: Complete registration flow collecting user name, email, password, age, gender, contact number, and assigned device ID. Auto-generates permanent user identifiers (`PAT-XXXXXX` / `USR-XXXXXX`).
- **Cryptographic Authentication**: Secure password hashing using PBKDF2-HMAC-SHA256 with 100,000 iterations and per-user unique 16-byte random salts. Persistent SQLite session tokens.
- **User Profile Management**: Interactive profile module where users view and edit their demographics, contact details, and hardware associations, persisting immediately to SQLite.
- **Multi-Tenant User Data Isolation**: Absolute data isolation enforced at the database query layer (`WHERE user_id = current_user.id`). User A can never query or view User B's records, vitals, or baselines.
- **Hardware-Compatible Sensor Data Ingestion**: REST endpoint (`POST /api/readings`) and Web Serial USB bridge capable of accepting real multi-parameter telemetry packets from ESP32 microcontrollers.
- **AI Living Mascot & Well-Being Interaction**:
  - State-reactive vector mascot with 6 facial expressions (`happy`, `thinking`, `listening`, `concerned`, `sleeping`, `celebrating`).
  - **Dynamic Well-Being Prompt**: When an abnormal reading or alert state occurs, the mascot automatically asks: *"I noticed an unusual pattern in your readings. Are you feeling okay?"*
  - **Interactive Action Pills**: Users can respond directly with `[ ✓ I'm okay ]` or `[ ✗ Feeling unwell ]`.
  - **Emotional Mood Transition**: AWEN adapts its mood immediately based on the response and stores the check-in directly in the SQLite `user_checkins` table.
- **ESP32 SSD1306 128×64 OLED Hardware Mascot**:
  - Embedded monochrome mascot face on 128×64 OLED (`^ ^` friendly smile during normal state, `O O` concerned expression with `"ARE YOU OK?"` on alerts).
  - 3-screen non-blocking auto-rotation (Mascot → Vitals → IMU/Status).
  - Robust 3-beat lock pulse peak detection algorithm with `-- BPM` fallback (zero fake BPM).
  - Raw register reads for MPU-6500 / 9250 sensors (`WHO_AM_I = 0x70` compatible).
  - Active buzzer alerts on GPIO 25.
- **Physiological Parameter Tracking**:
  - **Heart Rate (BPM)**: Photoplethysmography (PPG) pulse rate tracking.
  - **Blood Oxygen (SpO₂ %)**: Arterial oxygen saturation percentage.
  - **Skin Temperature (°C)**: Thermal equilibrium tracking via 16-sample ADC averaging.
  - **Accelerometer (3-Axis $a_x, a_y, a_z$ & Total Magnitude)**: Motion exertion detection.
  - **Gyroscope (3-Axis $g_x, g_y, g_z$)**: Orientation and posture stability.
- **Authentic Zero-Mock Empty State**: When hardware is not streaming and no database readings exist, the dashboard displays `--` and explicitly states `"No sensor data available yet"` with an `AWAITING SENSOR` status. Fake, randomized, or mock numbers are strictly prohibited.
- **Interactive Executive Dashboard**: Features 4 metric cards, a real-time 60 FPS HTML5 Canvas PPG pulse wave oscilloscope, current activity context badges, and an interactive vector mascot.
- **Chronological Today Timeline**: Aggregates real timestamped sensor readings and subjective daily check-ins into an ordered daily recovery timeline.
- **7-Day Longitudinal Journey**: SQLite-computed rolling daily resting averages and an interactive database inspection table showing raw stored records.
- **Comparative Baseline Insights**: Statistical dispersion chart plotting individual resting averages against learned personal baseline corridors.
- **Automated Observation Engine**: Detects statistically significant heart rate elevations during quiet resting periods and writes actionable recovery observations to the database.
- **Health Summary Report Export**: Formatted printable PDF report and structured JSON export containing authenticated user details, baseline corridors, and raw audit logs.

---

## 🛠️ Technology Stack

### Frontend Application
- **Framework**: React 19 (ES6+ JavaScript)
- **Build Tool**: Vite 8 (Ultra-fast HMR and optimized production bundling)
- **Styling Architecture**: Vanilla CSS with Neo-Brutalist High-Contrast design system (`#F4F4EF` canvas, 2px ink borders, high legibility)
- **Icons & Visuals**: Lucide React, 60 FPS SVG Vector Mascot micro-animations, HTML5 Canvas oscilloscope

### Backend API
- **Framework**: Python 3.13 FastAPI
- **Web Server**: Uvicorn (Asynchronous ASGI server)
- **Data Validation**: Pydantic v2 with custom field validators (RFC 5322 email regex)
- **Machine Learning & Analytics**: NumPy, Pandas, Scikit-Learn baseline classification engine

### Database & Persistence
- **Engine**: SQLite 3 (Database file: `backend/awen.db`)
- **Schema Management**: Automated table initialization and non-destructive schema migrations
- **Security**: PBKDF2 password hashing (hashlib), cryptographically secure session tokens (secrets module)

### IoT & Hardware Integration
- **Microcontroller**: ESP32 Dev Module (Dual-Core 240 MHz Tensilica LX6)
- **Display**: SSD1306 128×64 Monochrome I2C OLED (Address `0x3C`)
- **PPG Pulse Oximeter**: MAX30100 / MAX30102 Optical PPG (Address `0x57`)
- **Motion Sensor**: MPU-6050 / MPU-6500 6-Axis IMU (Address `0x68`, raw register reads)
- **Temperature**: Analog LM35 Linear Temperature Sensor on GPIO 34
- **Buzzer**: Active Buzzer on GPIO 25
- **Protocols**: W3C Web Serial API (Direct USB CDC at 115,200 baud) and HTTP POST REST telemetry

---

## 📐 System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   ESP32 Hardware Node                            │
│  - MAX30100/102 Optical PPG (Heart Rate, SpO2)                   │
│  - MPU-6050/6500 6-Axis IMU (Accelerometer & Gyroscope)          │
│  - LM35 Precision Analog Thermal Sensor (GPIO 34)                │
│  - Active Alert Buzzer (GPIO 25)                                 │
│  - SSD1306 128x64 OLED with AWEN Mascot & Multi-Screen Rotation  │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
                 HTTP POST /api/readings  OR  Web Serial USB
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (:8000)                        │
│  - Pydantic Validation & Security Sanitization                   │
│  - PBKDF2 Password Verification & Session Auth                   │
│  - Acceleration Vector Magnitude Computation                     │
│  - Baseline Deviation & Observation Evaluator                    │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                   SQLite Database (backend/awen.db)              │
│  - users & user_sessions (User authentication & isolation)       │
│  - sensor_readings (Timestamped physiological signals)           │
│  - user_baselines (Calibrated resting baseline corridors)        │
│  - user_checkins & observations (Subjective & algorithmic logs)  │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
                Authenticated REST Queries (Bearer Token)
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                   AWEN Frontend (:5173)                          │
│  - Executive Dashboard (Vitals & Oscilloscope)                   │
│  - Living Mascot Stage with Interactive Well-Being Prompts       │
│  - Today Chronology & Recovery Timeline                          │
│  - 7-Day Longitudinal Journey & Database Inspector               │
│  - Insights Dispersion Chart & Printable Health Reports          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
CaPsToNe/
├── backend/
│   ├── awen.db                     # Local SQLite 3 database file
│   ├── database.py                 # SQLite schema, CRUD operations, PBKDF2 auth
│   ├── main.py                     # FastAPI routes, Pydantic models, CORS middleware
│   ├── ml_engine.py                # Physiological baseline ML analytics engine
│   ├── test_complete_audit.py      # Comprehensive 16-point audit script
│   ├── test_mascot_wellbeing.py    # AI mascot prompt & SQLite check-in test suite
│   ├── seed_demo_observation.py    # 4-day synthetic baseline observation seeder
│   └── esp32_firmware/
│       └── esp32_max30102.ino      # ESP32 C++ Arduino firmware sketch
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx           # User registration & login dialog
│   │   ├── AwenSpirit.jsx          # 60 FPS vector mascot with dynamic emotional states
│   │   ├── AwenSpeechCloud.jsx     # Glass speech cloud with interactive well-being choices
│   │   ├── HomeScreen.jsx          # Executive dashboard with vitals & oscilloscope
│   │   ├── TodayScreen.jsx         # Daily timeline of sensor readings & check-ins
│   │   ├── JourneyScreen.jsx       # 7-day baseline evolution & raw SQLite table
│   │   ├── InsightsScreen.jsx      # Baseline corridor statistical dispersion chart
│   │   ├── TalkScreen.jsx          # AI companion conversational interface
│   │   ├── YouScreen.jsx           # User profile & demographic editor
│   │   ├── SettingsScreen.jsx      # Display units & test baseline utilities
│   │   ├── HealthReportModal.jsx   # Clinical printable PDF & JSON report generator
│   │   ├── NotificationCenter.jsx  # Algorithmic observation notifications
│   │   ├── IoTConfigModal.jsx      # Web Serial hardware pairing console
│   │   └── LandingPage.jsx         # Product landing presentation
│   ├── services/
│   │   ├── apiService.js           # Client HTTP communication with backend API
│   │   ├── stateEngine.js          # Mascot wellness state evaluator (5 states)
│   │   ├── speechEngine.js         # 7-window time-aware personality engine
│   │   └── telemetryStream.js      # Web Serial USB packet parser and validator
│   ├── App.jsx                     # Root router, auth session listener, polling loop
│   ├── main.jsx                    # React 19 entry point
│   └── index.css                   # Neo-Brutalist design tokens and font typography
├── package.json                    # Node.js project configuration and dependencies
├── vite.config.js                  # Vite bundler configuration
├── README.md                       # Main project documentation (this file)
├── PROJECT_DEVELOPMENT_REPORT.md   # Formal academic project development report
└── WEBSITE_OVERVIEW.md             # Detailed screen & feature breakdown for evaluation
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher with `pip`
- **Arduino IDE**: 2.x (with `ESP32 by Espressif`, `Adafruit SSD1306`, `Adafruit GFX`, and `MAX30100lib`)

### 2. Frontend Setup
```powershell
npm install
npm run dev
```
Runs at: `http://localhost:5173`

### 3. Backend Setup
```powershell
cd backend
pip install fastapi uvicorn pydantic pandas numpy scikit-learn
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Runs at: `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`)

---

## 🔒 User Authentication & Privacy Isolation

AWEN enforces strict security and data isolation:
1. **User Registration**: Users register with Name, Email, Password, Age, Gender, and Phone.
2. **PBKDF2 Password Hashing**: Passwords are salted with a 16-byte random salt and hashed using PBKDF2-HMAC-SHA256 across 100,000 iterations.
3. **Session Tokens**: Successful login generates an active session token stored in SQLite `user_sessions`.
4. **Authorization Header**: All protected requests require `Authorization: Bearer <TOKEN>`.
5. **Data Isolation**: Every database query explicitly filters by `WHERE user_id = current_user.id`. User A can never view or modify User B's physiological readings or check-in logs.

---

## 📡 ESP32 Hardware & OLED Mascot Integration

The ESP32 firmware ([backend/esp32_firmware/esp32_max30102.ino](backend/esp32_firmware/esp32_max30102.ino)) is a complete, copy-paste-ready Arduino sketch:

### Pinout Configuration
| Component | ESP32 Pin | Interface / Details |
|---|---|---|
| **SSD1306 OLED** | SDA: GPIO 21, SCL: GPIO 22 | I2C Address `0x3C` |
| **MAX30100 / MAX30102** | SDA: GPIO 21, SCL: GPIO 22 | I2C Address `0x57` |
| **MPU-6050 / MPU-6500** | SDA: GPIO 21, SCL: GPIO 22 | I2C Address `0x68` (Raw Register Read) |
| **LM35 Temperature** | GPIO 34 | Analog Input (16-sample ADC averaging) |
| **Active Buzzer** | GPIO 25 | Digital Output (Active HIGH on abnormality) |

### OLED Mascot Screen Rotation
- **Screen 0 (Mascot)**: Shows the AWEN mascot face (`^ ^` friendly smile when normal, `O O` concerned face with `"ARE YOU OK?"` on abnormal readings).
- **Screen 1 (Vitals)**: Shows BPM, SpO₂ %, and LM35 Temperature (°C).
- **Screen 2 (Motion & Status)**: Shows Accelerometer magnitude, Gyroscope activity, and observation status.
- **Auto-Rotation**: Smooth non-blocking rotation every 2.8 seconds without display flicker.

---

## 🧪 Automated Testing & Verification

Run the comprehensive test suites located in `backend/`:

### Complete System Audit (16/16 Checks)
```powershell
python backend/test_complete_audit.py
```
Validates backend health, user registration, token revocation, profile updates, multi-tenant privacy isolation, and telemetry ingestion.

### AI Mascot Well-Being Flow Test
```powershell
python backend/test_mascot_wellbeing.py
```
Validates mascot alert triggering, user response submission (`[ ✓ I'm okay ]` / `[ ✗ Feeling unwell ]`), and persistence into SQLite `user_checkins`.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
