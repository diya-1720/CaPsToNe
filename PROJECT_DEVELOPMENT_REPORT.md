# AWEN — Project Development Report

> **Project Title**: AWEN (Adaptive Wellness & Emotional Navigation)  
> **Domain**: IoT-Enabled Health Informatics & Adaptive Baseline Physiological Monitoring  
> **Platform**: React 19 Frontend, Python FastAPI Backend, SQLite 3 Local Database, ESP32 Sensor Hardware  
> **Academic / Capstone Evaluation Report**

---

## 1. Introduction

Continuous health monitoring has emerged as one of the most transformative applications of the Internet of Things (IoT) and biomedical engineering. Modern consumer wearables, such as smartwatches and fitness bands, continuously capture vital signs including heart rate, peripheral capillary oxygen saturation (SpO₂), and skin temperature. 

However, existing consumer and institutional monitoring solutions predominantly evaluate health telemetry against **static, one-size-fits-all clinical population thresholds**. While such thresholds are valuable in acute clinical diagnostics, they frequently generate false-positive alerts or fail to detect meaningful personal deviations when applied to daily outpatient wellness monitoring. 

**AWEN (Adaptive Wellness & Emotional Navigation)** was conceived and developed to solve this fundamental challenge. AWEN establishes a personalized physiological baseline corridor for each individual patient by combining multi-parameter sensor acquisition, motion context filtering, secure relational database persistence, and an emotionally intelligent, non-diagnostic digital companion interface.

---

## 2. Problem Statement

Conventional physiological monitoring systems suffer from three primary shortcomings:

1. **Static Population Threshold Fallacy**: Standard health tracking applications rely on universal boundaries (e.g., standard resting heart rate defined broadly between 60 and 100 BPM). Under this model, an individual whose normal resting heart rate is 55 BPM could experience an elevated rate of 88 BPM during mental stress without the system registering any anomaly. Conversely, a healthy individual who naturally rests at 85 BPM may trigger false alarms during routine cognitive exertion.
2. **Context-Blind Alerting**: Traditional systems often fail to differentiate between physiological elevation caused by physical exercise (tachycardia due to climbing stairs or walking) and physiological elevation occurring during complete sedentary rest (which may signify psychological distress, dehydration, or illness).
3. **Data Ephemerality & Cloud Dependency**: Many student and demonstrator prototypes rely on hardcoded mock data, temporary browser memory, or complex third-party cloud services that compromise patient privacy and fail to operate reliably in local demonstration environments.

---

## 3. Project Objective

The primary objectives of the AWEN project are:

1. **Design and Implement a Real Full-Stack Localhost Architecture**: Build an end-to-end medical-wellness software suite utilizing a Python FastAPI backend and an isolated SQLite 3 relational database that operates reliably on localhost without external cloud dependencies.
2. **Integrate Multi-Sensor IoT Telemetry**: Develop firmware and ingestion pipelines for an ESP32 microcontroller interfaced with a MAX30102/MAX30100 photoplethysmography sensor, an MPU-6050 6-axis inertial measurement unit (IMU), and skin temperature sensing.
3. **Implement Contextual Motion Filtering**: Calculate real-time 3D acceleration vector magnitude ($\sqrt{a_x^2 + a_y^2 + a_z^2}$) to determine physical movement context, preventing false stress alarms during active exertion.
4. **Enforce Real Authentication and Patient Data Privacy**: Implement cryptographic PBKDF2 password hashing, persistent session token management, and strict multi-tenant data isolation ensuring Patient A cannot access Patient B's physiological records.
5. **Establish an Authentic Zero-Mock Policy**: Eliminate all synthetic, random, or hardcoded sensor generators from the production workflow so that an empty database accurately reflects an awaiting sensor state (`-- BPM`, `No Signal`).

---

## 4. Proposed Solution

AWEN resolves the limitations of static monitoring through a multi-tiered architecture:

- **Continuous Personal Baseline Learning**: Rather than relying on population norms, AWEN tracks quiet resting periods over a longitudinal observation window, calculating the patient's individual mean resting heart rate ($\mu$) and standard deviation corridor ($\sigma$).
- **Integrated Motion Context**: By reading 3-axis accelerometer and 3-axis gyroscope data concurrently with PPG pulse signals, AWEN categorizes telemetry into physical states (`Resting`, `Walking`, `Climbing Stairs`, `Running`).
- **Algorithmic Baseline Deviation Engine**: An elevated heart rate is flagged as an observation **only** if the acceleration vector confirms the patient is in a sedentary resting state while heart rate departs significantly from their personal baseline corridor ($\Delta > 2\sigma$).
- **Responsive Neo-Brutalist User Interface**: Telemetry is visualized through high-contrast metrics, a 60 FPS HTML5 Canvas PPG pulse wave oscilloscope, a daily chronological timeline, 7-day rolling baseline charts, and an interactive vector companion mascot.

---

## 5. System Architecture

The complete system architecture consists of five coordinated tiers:

```
┌────────────────────────────────────────────────────────────┐
│                    TIER 1: SENSOR HARDWARE                 │
│  - MAX30102 / MAX30100 Optical PPG (IR & Red Photodiode)   │
│  - MPU-6050 6-DOF IMU (Accelerometer & Gyroscope)          │
│  - Peripheral Skin Temperature Sensor (On-Die / LM35)      │
└─────────────────────────────┬──────────────────────────────┘
                              │ I2C Bus (GPIO 21 SDA, GPIO 22 SCL)
                              ▼
┌────────────────────────────────────────────────────────────┐
│              TIER 2: EMBEDDED PROCESSING (ESP32)           │
│  - Peak-to-Peak Beat Interval Calculation (BPM)            │
│  - Motion Vector Magnitude ($a_{mag} = \sqrt{\sum a_i^2}$) │
│  - JSON Serialization & USB CDC / Wi-Fi HTTP Transmission  │
└─────────────────────────────┬──────────────────────────────┘
                              │
               HTTP POST /api/readings  OR  Web Serial USB
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                 TIER 3: BACKEND API (FastAPI)              │
│  - Token / API-Key Authentication Middleware               │
│  - Pydantic Schema Validation & Data Normalization         │
│  - Motion Context Derivation & Deviation Analysis          │
│  - Automatic Observation & Alert Generation                │
└─────────────────────────────┬──────────────────────────────┘
                              │
                   SQL Transactions (ACID)
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│            TIER 4: RELATIONAL DATABASE (SQLite 3)          │
│  - Database File: backend/awen.db                          │
│  - Schema: users, user_sessions, devices, sensor_readings, │
│            user_baselines, user_checkins, observations     │
│  - Multi-Tenant Patient Data Isolation (auth.uid filter)   │
└─────────────────────────────┬──────────────────────────────┘
                              │
              Authenticated REST API (Bearer Token)
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                 TIER 5: CLIENT PRESENTATION                │
│  - React 19 Single Page Application (Vite 8)               │
│  - Executive Dashboard & 60 FPS Canvas Oscilloscope        │
│  - Today Chronology & 7-Day Baseline Evolution Charts      │
│  - Clinical Health Report Generation (PDF / JSON)          │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Hardware Components

| Component | Model / Specification | Interface | Role in AWEN |
|---|---|---|---|
| **Microcontroller** | ESP32-WROOM-32 (Tensilica Dual-Core 240 MHz, 520 KB SRAM) | USB / Wi-Fi | Master controller responsible for high-speed sensor sampling, signal filtering, and data packet transmission. |
| **PPG Pulse Oximeter** | MAX30102 / MAX30100 Optical Sensor | I2C (Address `0x57`) | Emits alternating Red (660 nm) and Infrared (880 nm) light through capillary beds to measure pulse wave intervals and calculate arterial oxygen saturation (SpO₂). |
| **Inertial Measurement Unit** | MPU-6050 6-Axis Motion Tracking | I2C (Address `0x68`) | Features a 3-axis accelerometer and 3-axis gyroscope. Provides real-time movement telemetry to classify physical activity context. |
| **Temperature Sensor** | MAX30102 On-Die Thermal Sensor / LM35 | I2C / ADC | Samples peripheral skin surface temperature in degrees Celsius to detect thermal equilibrium changes. |

### Hardware Interfacing
The MAX30102 and MPU-6050 share the hardware I2C bus:
- **SDA Pin**: ESP32 GPIO 21
- **SCL Pin**: ESP32 GPIO 22
- **Operating Voltage**: 3.3V DC regulated power rail

---

## 7. Software Components

### Frontend Layer
- **React 19 & Vite 8**: Implements a component-driven Single Page Application (SPA) offering sub-millisecond route transitions and real-time state updates.
- **Design System**: High-contrast Neo-Brutalist aesthetic featuring warm off-white backgrounds (`#F4F4EF`), crisp 2px ink borders, and high-visibility typography (Space Grotesk and Inter).
- **HTML5 Canvas Oscilloscope**: Renders dynamic photoplethysmography wave animations at 60 FPS based on actual incoming telemetry.

### Backend Layer
- **Python 3.13 FastAPI**: Asynchronous REST framework utilizing Uvicorn ASGI server for high-throughput, low-latency API handling.
- **Pydantic Validation Models**: Strictly validates inbound HTTP payloads, enforcing schema compliance and sanitizing inputs.
- **CORS Middleware**: Manages local origin security while permitting seamless communication between Vite (`:5173`) and FastAPI (`:8000`).

### Database Layer
- **SQLite 3 (`backend/awen.db`)**: A serverless, self-contained relational database management system delivering ACID transactions, fast query execution, and complete portability without requiring external database servers.

---

## 8. Database Design

The relational database schema is normalized into eight specialized tables:

```
┌──────────────────┐       1:N       ┌──────────────────┐
│      users       ├─────────────────┤  user_sessions   │
└────────┬─────────┘                 └──────────────────┘
         │
         │ 1:N
         ├───────────────────────────┐
         │                           │
         ▼ 1:N                       ▼ 1:N
┌──────────────────┐       ┌──────────────────┐
│     devices      │       │ sensor_readings  │
└──────────────────┘       └────────┬─────────┘
                                    │
                                    │ 1:N
                                    ▼
┌──────────────────┐       ┌──────────────────┐
│  user_baselines  │       │   observations   │
└──────────────────┘       └──────────────────┘
         ▲
         │ 1:N
┌────────┴─────────┐       ┌──────────────────┐
│  user_checkins   │       │awen_conversations│
└──────────────────┘       └──────────────────┘
```

### Table Definitions
1. **`users`**: Stores patient profile demographics, unique patient identifier (`patient_id`), hashed password, age, gender, phone, and assigned device ID.
2. **`user_sessions`**: Maintains active authentication tokens with issuance and expiration timestamps.
3. **`devices`**: Tracks paired physical microcontrollers, unique device hardware keys, and device connection timestamps.
4. **`sensor_readings`**: High-resolution time-series table storing heart rate, SpO₂, temperature, 3-axis accelerometer, 3-axis gyroscope, computed acceleration magnitude, activity context, and source metadata.
5. **`user_baselines`**: Stores personalized quiet resting parameters, including resting heart rate ($\mu$), natural variance corridor ($\sigma$), sample volume, and baseline confidence tiers.
6. **`user_checkins`**: Records subjective patient self-assessments (mood, physical tags, contextual notes).
7. **`observations`**: Records algorithmic baseline deviation events generated when resting vitals exceed tolerance corridors.
8. **`awen_conversations`**: Persists conversational dialogue history with the AI companion.

---

## 9. Authentication and Security

Authentication is fully implemented using industry-standard cryptographic techniques:

1. **Password Hashing**: Passwords submitted during registration are never stored in plaintext. They are salted with a 16-byte random salt generated via the operating system's cryptographic entropy source (`secrets.token_bytes(16)`) and hashed using **PBKDF2-HMAC-SHA256** across **100,000 iterations**.
2. **Session Token Management**: Upon successful credential verification, a high-entropy 32-byte URL-safe session token is generated and recorded in the `user_sessions` database table.
3. **Protected Route Authorization**: All private endpoints require the `Authorization: Bearer <TOKEN>` HTTP header. The backend validates the token against active SQLite records before processing requests.
4. **Secure Logout**: Calling `POST /api/auth/logout` explicitly deletes the token from SQLite. Subsequent requests with that token are rejected with `HTTP 401 Unauthorized`.
5. **No Synthetic Backdoors**: All simulated bypasses (such as `guest_demo` and mock OAuth redirects) have been completely removed.

---

## 10. Sensor Data Flow

The end-to-end data lifecycle from skin contact to user display operates as follows:

```
[Skin Capillaries & Motion]
             │
             ▼
[MAX30102 PPG + MPU-6050 IMU]
             │ I2C Bus (400 kHz)
             ▼
[ESP32 Firmware Processing]
  - Peak-to-peak beat detection
  - Total acceleration: a_mag = sqrt(ax^2 + ay^2 + az^2) / 9.81
  - Serial JSON packet construction
             │
             ▼
[Transmission Channel]
  - Direct USB CDC Serial at 115,200 baud (Web Serial API) OR
  - Local Wi-Fi HTTP POST to /api/readings
             │
             ▼
[FastAPI Backend Endpoint]
  - Token / Device-Key verification
  - Activity context categorization
  - Real-time comparison with user_baselines table
  - Automatic observation insertion if elevated during rest
             │
             ▼
[SQLite 3 Database (awen.db)]
  - INSERT INTO sensor_readings
             │
             ▼
[Client Polling / Stream Refresh]
  - GET /api/readings/latest
  - React state update (currentHr, currentSpo2, currentTemp)
             │
             ▼
[Patient Dashboard & UI]
  - 4 Metric cards updated with live values
  - 60 FPS HTML5 Canvas oscilloscope animates pulse waveform
  - Today timeline & 7-day Journey table record new row
```

---

## 11. User Flow

```
[Patient Arrival at Landing Page]
                │
                ▼
[Registration / Login Modal]
  - Input Name, Email, Password, Age, Gender, Phone, Device ID
  - Submit credentials -> Backend hashes password -> SQLite persists
  - Bearer token returned -> Client saves to localStorage
                │
                ▼
[Executive Dashboard Screen]
  - Authenticated patient name & PAT-XXXXXX identifier displayed
  - Real-time digital clock and contextual greeting
  - IF no sensor data: Displays "-- BPM", "No Signal", "AWAITING SENSOR"
  - IF sensor streaming: Displays live BPM, SpO2, Temp, Motion
                │
                ▼
[Navigation Modules]
  - Today: Chronological view of daily readings and subjective check-ins
  - Journey: 7-day resting averages chart and SQLite raw table
  - Insights: Baseline corridor dispersion graph
  - Profile (You): Edit age, phone, gender, device association
  - Reports: Generate printable clinical PDF / structured JSON export
                │
                ▼
[Logout & Verification]
  - Click Sign Out -> Session token deleted in SQLite
  - Protected endpoints immediately lock
  - Re-login with password -> All previous data fully restored
```

---

## 12. Frontend Modules

| Screen / Component | Route / Tab | Implemented Functionality | Data Source |
|---|---|---|---|
| **Landing Page** | Root (`/`) | Editorial introduction, value proposition, and modal trigger for real registration/login. | Static assets |
| **Auth Modal** | Global Dialog | Tabbed registration and sign-in interface with validation feedback. | SQLite `users` & `user_sessions` |
| **Home (Dashboard)** | Tab `01 / home` | Executive overview: 4 biometric metric cards, 60 FPS Canvas oscilloscope, rhythm narrative card, and Mascot. | Real-time stream & SQLite `sensor_readings` |
| **Today Screen** | Tab `02 / today` | Chronological recovery timeline combining telemetry readings and subjective check-in logs. | SQLite `sensor_readings` & `user_checkins` |
| **Journey Screen** | Tab `03 / journey` | Longitudinal 7-day baseline evolution chart and interactive SQLite raw records inspection table. | SQLite `sensor_readings` via aggregation |
| **Insights Screen** | Tab `04 / insights` | Comparative analytics displaying statistical dispersion of resting vitals against baseline corridors. | SQLite rolling calculations |
| **AI Companion (Talk)** | Tab `05 / talk` | Conversational wellness support with memory of previous check-ins and contextual dialogue. | SQLite `awen_conversations` |
| **Clinical Reports** | Modal `06 / reports`| Formatted clinical summary with print-to-PDF stylesheet and JSON data export. | SQLite `users` & `sensor_readings` |
| **Settings Screen** | Tab `07 / settings` | Display units (Celsius/Fahrenheit), 60 FPS toggle, serial parser test, and marked dev tools. | Local client preferences & API |
| **Profile Screen (You)** | Tab `you` | Patient demographic viewer and interactive editor persisting updates directly to SQLite. | SQLite `users` table |
| **Notification Center** | Header Dropdown | Real-time observation alerts triggered by resting baseline deviations. | SQLite `observations` table |
| **Hardware Modal** | Header Pill | Web Serial console for direct USB hardware connection with baud rate selection and raw monitor. | Browser Web Serial API |

---

## 13. Backend Modules

The backend service is structured into modular Python components:

- **`backend/database.py`**:
  - `init_db()`: Initializes database schema and executes non-destructive table migrations.
  - `create_user()`, `verify_user()`, `get_user_by_id()`: User lifecycle and PBKDF2 authentication.
  - `create_session()`, `get_user_by_session()`, `delete_session()`: Token session lifecycle management.
  - `insert_sensor_reading()`: Validates telemetry, calculates acceleration magnitude, assigns motion context, and checks resting baseline corridors.
  - `get_latest_reading()`, `get_historical_readings()`: Patient-isolated query execution.
  - `get_weekly_history()`: SQL aggregation query computing 7-day daily averages.
- **`backend/main.py`**:
  - Exposes 18 REST endpoints conforming to OpenAPI (Swagger) specifications.
  - Enforces dependency injection (`Depends(get_current_user)`) across all protected routes.
  - Handles CORS pre-flight negotiations and HTTP status code mappings.
- **`backend/ml_engine.py`**:
  - `PersonalizedPhysiologicalEngine`: Statistical analysis module calculating dynamic confidence tiers (`Learning`, `Early baseline`, `Developing baseline`, `Stable baseline`).

---

## 14. Data Persistence

Data persistence is guaranteed by SQLite 3 ACID transaction properties:

1. **Browser Refresh Immunity**: Active session tokens and patient data are stored in SQLite and referenced by client `localStorage`. Reloading the page immediately restores the authenticated patient profile and queries the latest database state.
2. **Session Persistence**: Logging out invalidates the session token in the database. Logging back in with the patient's password establishes a new session while preserving all historical sensor readings, baselines, and check-ins.
3. **Server Restart Immunity**: Because database records reside in the physical binary file `backend/awen.db`, stopping or restarting the FastAPI backend server causes zero data loss. All tables, readings, and credentials remain completely intact.

---

## 15. Patient Data Isolation

Multi-tenant security and patient privacy are strictly enforced:

- Every private database table contains a `user_id` foreign key referencing `users.id`.
- The backend authentication dependency resolves the authenticated patient from the bearer token and injects `current_user` into endpoint handlers.
- Database access queries strictly append `WHERE user_id = ?`, passing `current_user['id']`.
- **Validation**: In automated testing, Patient B (`David Miller`) registered on the same instance was unable to view, query, or aggregate any readings logged by Patient A (`Sarah Jenkins`).

---

## 16. Testing and Validation

The implementation was verified using a comprehensive automated test script (`backend/test_complete_e2e.py`) alongside interactive browser testing.

### Automated End-to-End Test Suite (16/16 Passed)

| Test Case # | Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **Test 1** | Backend Health Check | HTTP 200 with SQLite status `connected` | HTTP 200, `connected` | **PASS** |
| **Test 2** | Patient A Registration | Creates patient, hashes password, assigns `PAT-` ID | HTTP 201, `PAT-649A78` | **PASS** |
| **Test 3** | Empty Database Check | Newly registered patient has no readings (`null`) | `reading: null`, `status: empty` | **PASS** |
| **Test 4** | Empty History Check | Empty database returns array with 0 items | `count: 0, readings: []` | **PASS** |
| **Test 5** | Sensor Reading Ingestion | Ingests resting telemetry packet via POST | HTTP 201, reading recorded | **PASS** |
| **Test 6** | Second Sensor Ingestion | Ingests walking exertion reading (`88.5 BPM`) | HTTP 201, reading recorded | **PASS** |
| **Test 7** | Latest Reading Fetch | Returns most recent reading (`88.5 BPM`) | Matches newest reading | **PASS** |
| **Test 8** | Reading History Query | Retrieves exactly 2 records in descending order | 2 records returned | **PASS** |
| **Test 9** | Profile Update | Modifies age to 35 and phone to `+91-9988776655` | Profile persisted in SQLite | **PASS** |
| **Test 10** | Patient B Registration | Creates separate second patient (`David Miller`) | HTTP 201, `PAT-E77127` | **PASS** |
| **Test 11** | Multi-Tenant Isolation (B from A) | Patient B queries history and sees 0 records | `count: 0, readings: []` | **PASS** |
| **Test 12** | Cross-Isolation Verification | Patient A cannot see reading posted for Patient B | Patient A history isolated | **PASS** |
| **Test 13** | Patient Logout | Invalidates token in `user_sessions` | Session row deleted | **PASS** |
| **Test 14** | Protected Route Guard | Revoked token rejected with HTTP 401 | HTTP 401 Unauthorized | **PASS** |
| **Test 15** | Re-Authentication | Patient A logs in with password, gets new token | HTTP 200, new token issued | **PASS** |
| **Test 16** | Post-Login Persistence | Verifies all 2 readings and updated profile intact | All data 100% restored | **PASS** |

### Visual & Browser Validation
- Verified clean empty state displays `-- BPM`, `No Signal`, and `AWAITING SENSOR` status when no hardware is attached.
- Ingested live sensor reading via API; verified the dashboard dynamically refreshed within 4 seconds via polling to display `71.8 BPM` (`RESTING`), `98.7% SpO2` (`OPTIMAL`), and `36.6°C` (`NOMINAL`).

---

## 17. Current Implementation Status

### Fully Implemented & Operational
- Full-stack FastAPI backend and SQLite database with 8 relational tables.
- Cryptographic PBKDF2 authentication, token sessions, and multi-patient isolation.
- Hardware ingestion REST endpoint (`POST /api/readings`) and Web Serial USB driver.
- Zero-mock policy across all metric cards, timelines, and dispersion charts.
- Printable clinical PDF report and structured JSON export.
- Dynamic Mascot state reactivity across 5 emotional states.

### Hardware-Dependent Operation
- Continuous real-time streaming requires physical ESP32 hardware connected over USB or posting JSON over Wi-Fi. The backend API, database schema, and frontend parser are 100% prepared to accept live packets.

---

## 18. Limitations

1. **Hardware Ingestion Separation**: Due to physical hardware being tested separately from this development environment, live streaming was validated via the Web Serial emulator, simulated serial chunks, and HTTP POST packets rather than a physically attached finger probe during this test run.
2. **Web Serial Browser Compatibility**: Direct USB pairing via the Web Serial API requires a Chromium-based browser (Google Chrome, Microsoft Edge, Brave). Non-Chromium browsers (Mozilla Firefox, Apple Safari) must transmit sensor readings via Wi-Fi HTTP POST.

---

## 19. Future Scope

1. **Bluetooth Low Energy (BLE) Peripheral Support**: Implement Nordic UART or standard Bluetooth Health Device Profile (HDP) on the ESP32 to allow wireless pairing with mobile browsers.
2. **On-Device Circular Buffer Logging**: Configure ESP32 SPIFFS/LittleFS flash storage to record offline readings during connectivity drops and sync automatically upon reconnection.
3. **Nocturnal Sleep Staging**: Utilize continuous overnight pulse rate variability (PRV) to classify light, deep, and REM sleep phases against resting baseline signatures.

---

## 20. Conclusion

AWEN successfully demonstrates the feasibility and clinical utility of **adaptive physiological baseline tracking**. By rejecting arbitrary population thresholds in favor of individual resting corridors, integrating physical motion context, and maintaining an uncompromising zero-mock architecture backed by local SQLite persistence, AWEN provides an emotionally intelligent, technically robust foundation for modern digital wellness.
