# AWEN

> **Adaptive Wellness & Emotional Navigation**  
> *Personalized Physiological Baseline Intelligence & Longitudinal Health Companion*

---

## Project Overview

**AWEN (Adaptive Wellness & Emotional Navigation)** is a full-stack, personal health and physiological monitoring platform designed to address a critical limitation in conventional healthcare monitors: **static medical thresholds**. 

Traditional wearable devices compare every individual to generic population averages (for example, triggering alerts whenever heart rate exceeds 100 BPM). However, resting physiological parameters vary naturally from person to person. A heart rate of 82 BPM may be completely normal for one individual during quiet study, yet an indicator of acute fatigue for an athlete.

AWEN continuously learns a patient's **individual resting baseline** over time. By combining physiological data (Heart Rate, Blood Oxygen SpO₂, and Skin Temperature) with physical motion context (6-axis accelerometer and gyroscope vectors), AWEN evaluates whether today's body behavior deviates from the patient's **own personal normal**, preventing false stress alarms during exercise and providing calm, contextual recovery feedback.

---

## Key Features

The following capabilities are fully implemented in the codebase and backed by a real SQLite database:

- **Real Patient Registration**: Complete registration flow collecting patient name, email, password, age, gender, contact number, and assigned device ID. Auto-generates permanent clinical identifiers (`PAT-XXXXXX`).
- **Cryptographic Authentication**: Secure password hashing using PBKDF2-HMAC-SHA256 with 100,000 iterations and per-user unique 16-byte random salts. Persistent SQLite session tokens.
- **Patient Profile Management**: Interactive profile module where patients view and edit their demographics, contact details, and hardware associations, persisting immediately to SQLite.
- **Multi-Tenant Patient Data Isolation**: Absolute data isolation enforced at the database query layer (`WHERE user_id = current_user.id`). Patient A can never query or view Patient B's records, vitals, or baselines.
- **Hardware-Compatible Sensor Data Ingestion**: REST endpoint (`POST /api/readings`) and Web Serial USB bridge capable of accepting real multi-parameter telemetry packets from ESP32 microcontrollers.
- **Physiological Parameter Tracking**:
  - **Heart Rate (BPM)**: Photoplethysmography (PPG) pulse rate tracking.
  - **Blood Oxygen (SpO₂ %)**: Arterial oxygen saturation percentage.
  - **Skin Temperature (°C)**: Thermal equilibrium tracking.
  - **Accelerometer (3-Axis $a_x, a_y, a_z$ & Total Magnitude)**: Motion exertion detection.
  - **Gyroscope (3-Axis $g_x, g_y, g_z$)**: Orientation stability.
- **Authentic Zero-Mock Empty State**: When hardware is not streaming and no database readings exist, the dashboard displays `--` and explicitly states `"No sensor data available yet"` with an `AWAITING SENSOR` status. Fake, randomized, or mock numbers are strictly prohibited.
- **Interactive Executive Dashboard**: Features 4 metric cards, a real-time 60 FPS HTML5 Canvas PPG pulse wave oscilloscope, current activity context badges, and an interactive vector mascot.
- **Chronological Today Timeline**: Aggregates real timestamped sensor readings and subjective daily check-ins into an ordered daily recovery timeline.
- **7-Day Longitudinal Journey**: SQLite-computed rolling daily resting averages and an interactive database inspection table showing raw stored records.
- **Comparative Baseline Insights**: Statistical dispersion chart plotting individual resting averages against learned personal baseline corridors.
- **Automated Observation Engine**: Detects statistically significant heart rate elevations during quiet resting periods and writes actionable recovery observations to the database.
- **Clinical Health Report Export**: Formatted printable PDF report and structured JSON export containing authenticated patient details, baseline corridors, and raw audit logs.

---

## Technology Stack

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
- **Microcontroller**: ESP32-WROOM-32 (Dual-Core 240 MHz Tensilica LX6)
- **Sensors**: MAX30102 / MAX30100 Optical PPG + MPU-6050 6-DOF IMU + Temperature sensor
- **Protocols**: W3C Web Serial API (Direct USB CDC at 115,200 baud) and HTTP POST REST telemetry

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   ESP32 Hardware Node                            │
│  - MAX30102 Optical PPG (Heart Rate, SpO2)                       │
│  - MPU-6050 6-Axis IMU (Accelerometer & Gyroscope)               │
│  - On-Die / External Thermal Sensor                              │
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
│  - users & user_sessions (Patient authentication & isolation)    │
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
│  - Today Chronology & Recovery Timeline                          │
│  - 7-Day Longitudinal Journey & Database Inspector               │
│  - Insights Dispersion Chart & Printable Health Reports          │
└──────────────────────────────────────────────────────────────────┘
```

### Localhost Architecture
The application runs entirely on the local machine without requiring external cloud accounts:
- **Frontend Server**: `http://localhost:5173`
- **Backend API Server**: `http://127.0.0.1:8000`
- **Persistent Database**: `backend/awen.db`

---

## Project Structure

```
CaPsToNe/
├── backend/
│   ├── awen.db                     # Local SQLite 3 database file
│   ├── database.py                 # SQLite schema, CRUD operations, PBKDF2 auth
│   ├── main.py                     # FastAPI routes, Pydantic models, CORS middleware
│   ├── ml_engine.py                # Physiological baseline ML analytics engine
│   ├── test_complete_e2e.py        # 16-point automated integration test suite
│   └── esp32_firmware/
│       └── esp32_max30102.ino      # ESP32 C++ Arduino firmware sketch
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx           # Real registration & login dialog
│   │   ├── HomeScreen.jsx          # Executive dashboard with vitals & oscilloscope
│   │   ├── TodayScreen.jsx         # Daily timeline of sensor readings & check-ins
│   │   ├── JourneyScreen.jsx       # 7-day baseline evolution & raw SQLite table
│   │   ├── InsightsScreen.jsx      # Baseline corridor statistical dispersion chart
│   │   ├── TalkScreen.jsx          # AI companion conversational interface
│   │   ├── YouScreen.jsx           # Patient profile & demographic editor
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

## Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher with `pip`

### Step 1: Install Frontend Dependencies
```powershell
cd "c:\Users\Anurag Singh\Desktop\capstone\CaPsToNe"
npm install
```

### Step 2: Install Backend Dependencies
```powershell
cd "c:\Users\Anurag Singh\Desktop\capstone\CaPsToNe\backend"
pip install fastapi uvicorn pydantic pandas numpy scikit-learn
```

---

## Running the Project

### 1. Start the FastAPI Backend
```powershell
cd "c:\Users\Anurag Singh\Desktop\capstone\CaPsToNe\backend"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- **Backend API**: `http://127.0.0.1:8000`
- **Interactive OpenAPI Documentation**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

### 2. Start the React Frontend
In a separate terminal window:
```powershell
cd "c:\Users\Anurag Singh\Desktop\capstone\CaPsToNe"
npm run dev
```
- **Web Application**: `http://localhost:5173`

---

## Authentication

AWEN uses a real, persistent authentication architecture:
1. **Registration**: The patient registers with Name, Email, Password, Age, Gender, and Phone.
2. **Password Hashing**: Passwords are never stored in plaintext. Passwords are salted with a 16-byte cryptographically secure random salt and hashed using PBKDF2-HMAC-SHA256 across 100,000 iterations.
3. **Session Tokens**: Successful login generates an active session token stored in the `user_sessions` SQLite table.
4. **Authorization Header**: All protected requests pass `Authorization: Bearer <TOKEN>`.
5. **Logout**: Invalidates the active session token in SQLite; subsequent requests are rejected with `HTTP 401 Unauthorized`.
6. **No Mock Fallbacks**: Hardcoded credentials and fake guest bypasses (`guest_demo`) are completely removed.

---

## Database

The database is a local SQLite 3 database located at:
```
backend/awen.db
```

### Major Tables
- `users`: Patient profiles, hashed credentials, demographics, and assigned device IDs.
- `user_sessions`: Active authentication bearer tokens with timestamps.
- `devices`: Registered hardware units and device API keys.
- `sensor_readings`: High-precision physiological readings (BPM, SpO₂, temperature, 3-axis accelerometer, 3-axis gyroscope, acceleration magnitude, motion context).
- `user_baselines`: Individual quiet resting baseline values (resting HR, variance, sample count).
- `user_checkins`: Timestamped daily subjective wellness and recovery logs.
- `observations`: Algorithmic baseline deviation events detected by the system.
- `awen_conversations`: Timestamped dialogue history with the AI wellness companion.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend system & database health check |
| `POST` | `/api/auth/signup` | Register new patient account with PBKDF2 hash |
| `POST` | `/api/auth/login` | Authenticate patient credentials; returns bearer token |
| `POST` | `/api/auth/logout` | Terminate session and invalidate token in SQLite |
| `GET` | `/api/auth/me` | Retrieve currently authenticated patient details |
| `GET` | `/api/user/profile` | Retrieve patient profile including Patient ID |
| `PUT` | `/api/user/profile` | Update editable profile fields (age, phone, etc.) |
| `POST` | `/api/readings` | Ingest ESP32 sensor telemetry packet |
| `GET` | `/api/readings/latest` | Retrieve patient's newest reading (`null` if empty) |
| `GET` | `/api/readings/history` | Paginated sensor history with date filtering |
| `GET` | `/api/history/weekly` | 7-day daily rolling averages calculated in SQLite |
| `GET` | `/api/user/baseline` | Retrieve calibrated resting baseline signature |
| `POST` | `/api/user/checkins` | Record daily subjective check-in |
| `GET` | `/api/observations` | Retrieve baseline observation alert history |

---

## ESP32 Integration

Physical ESP32 hardware transmits sensor packets to the backend via HTTP POST or USB Web Serial.

### HTTP POST Ingestion
- **URL**: `http://<HOST_IP>:8000/api/readings`
- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <TOKEN>
  ```
  *(Or `X-API-Key: <DEVICE_API_KEY>`)*

### Expected JSON Telemetry Payload
```json
{
  "device_id": "AWEN_ESP32_01",
  "heart_rate": 72.4,
  "spo2": 98.8,
  "temperature": 36.65,
  "accel_x": 0.05,
  "accel_y": 0.12,
  "accel_z": 0.98,
  "gyro_x": 0.01,
  "gyro_y": -0.02,
  "gyro_z": 0.00,
  "accel_magnitude": 0.99,
  "alarm": "NONE",
  "status": "NORMAL",
  "activity_state": "Resting",
  "timestamp_ms": 1726744800000
}
```

---

## Patient Data Privacy / Isolation

Patient data is strictly separated:
- Every query to `sensor_readings`, `user_baselines`, `user_checkins`, and `observations` filters strictly by the authenticated patient's internal user ID (`WHERE user_id = current_user['id']`).
- **Patient A cannot access Patient B's data**: In automated testing, Patient B registered on the same system sees 0 records from Patient A and cannot query Patient A's telemetry, history, or profile.

---

## Testing

The application was validated using an automated 16-point end-to-end integration test suite located at `backend/test_complete_e2e.py`.

### Execution Command
```powershell
cd backend
python test_complete_e2e.py
```

### Test Results Summary (16/16 Passed)
1. `[PASS]` 1. Backend health check (HTTP 200, SQLite connected).
2. `[PASS]` 2. Patient A registration: PBKDF2 hash & auto-generated `PAT-XXXXXX` ID.
3. `[PASS]` 3. Empty database verification: Returns `reading: null` before telemetry ingestion.
4. `[PASS]` 4. Empty history verification: 0 records found for newly created patient.
5. `[PASS]` 5. ESP32 sensor POST: Successfully stored reading with HR, SpO₂, temperature, and motion.
6. `[PASS]` 6. Second ESP32 sensor POST: Successfully recorded exertion reading (`88.5 BPM`, Walking).
7. `[PASS]` 7. Latest reading fetch: Successfully returned newest reading.
8. `[PASS]` 8. Reading history verification: Retrieved exactly 2 records in descending order.
9. `[PASS]` 9. Patient profile update: Demographics updated and verified in SQLite.
10. `[PASS]` 10. Patient B registration: Created independent second patient account.
11. `[PASS]` 11. Patient isolation: Patient B sees 0 readings from Patient A.
12. `[PASS]` 12. Cross-patient isolation: Patient A history contains 0 records from Patient B.
13. `[PASS]` 13. Patient A logout: Session token invalidated in SQLite.
14. `[PASS]` 14. Protected route enforcement: Revoked session rejected with `HTTP 401 Unauthorized`.
15. `[PASS]` 15. Re-login Patient A: Authenticated with password, issued new session.
16. `[PASS]` 16. Persistence verified: Profile and all sensor readings 100% present after re-login.

---

## Hardware Components

The physical hardware architecture of AWEN includes:
1. **ESP32 Microcontroller (ESP32-WROOM-32)**: Dual-core processor handling I2C sensor polling, pulse peak detection algorithms, and serial/Wi-Fi packet transmission.
2. **MAX30102 / MAX30100 Pulse Oximeter**: Optical sensor module utilizing dual red (660 nm) and infrared (880 nm) LEDs to measure photoplethysmography (PPG) pulse waves and calculate blood oxygen saturation (SpO₂).
3. **MPU-6050 6-Axis Motion Tracking Sensor**: Combines a 3-axis accelerometer and 3-axis gyroscope on a shared I2C bus to quantify movement magnitude and distinguish physical exertion from psychological stress.
4. **Skin Temperature Sensor**: On-die thermal sensor / analog LM35 providing peripheral body temperature readings.

---

## Current Status

- **Fully Implemented & Verified**:
  - Full-stack FastAPI + SQLite backend with 8 normalized tables.
  - PBKDF2 cryptographic authentication and session token management.
  - Multi-tenant patient isolation.
  - Hardware ingestion REST endpoint and Web Serial parser.
  - Zero-mock empty state and live dashboard polling.
  - Today timeline, 7-day Journey history, and Insights dispersion charts.
  - Interactive profile editor and clinical PDF/JSON report exports.
- **Hardware-Dependent**:
  - Continuous streaming relies on physical ESP32 hardware connected via USB Web Serial or posting over local Wi-Fi. The backend API and frontend parser are 100% ready to receive live hardware packets.
- **Future Work**:
  - Bluetooth Low Energy (BLE) peripheral profile for direct smartphone pairing.
  - Nocturnal sleep stage classification using continuous overnight pulse interval analysis.
