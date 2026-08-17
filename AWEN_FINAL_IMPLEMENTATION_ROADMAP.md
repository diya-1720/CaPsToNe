# AWEN — Master Implementation Roadmap & Development Plan

> **Document Version**: 1.0.0  
> **Creation Date**: August 11, 2026  
> **Target File Path**: `c:\Users\Anurag Singh\Desktop\AWEN\AWEN_FINAL_IMPLEMENTATION_ROADMAP.md`  
> **Primary Context Baseline**: `AWEN_CURRENT_STATUS_AUDIT.md`  
> **Mandatory Rule**: Inspection and documentation only. No source code modifications, no firmware changes, no database migrations, zero Git commits, and zero Git pushes permitted until explicit user instruction is given.

---

## SECTION 1 — CURRENT PROJECT SNAPSHOT

### 1.1 Completion Estimates by System Domain

* **UI Completion**: **75%** *(Core screens, 60 FPS vector mascot, dark aesthetic, state animations, and auth modals are complete; history graphs use static mock data)*
* **Backend Completion**: **40%** *(FastAPI microservice and Supabase schema/RLS are ready; analytics aggregation pipeline missing)*
* **Database / Storage Completion**: **60%** *(All 5 tables and RLS security policies configured; historical aggregation queries missing)*
* **AI / ML Completion**: **30%** *(State engine, time-aware speech engine, and rule-based chat work; true ML models, HRV features, and SHAP missing)*
* **Hardware Integration**: **20%** *(MAX30102 Arduino sketch and Web Serial reader written; MPU6050, BLE, UI pair dialog, and SQI missing)*
* **Data Pipeline Completion**: **35%** *(Simulated telemetry streams to Supabase; real hardware ingestion, SQI filtering, and HRV extraction missing)*
* 📊 **OVERALL AWEN IMPLEMENTATION**: **45%**

### 1.2 "What AWEN Is Today"
AWEN is currently a **high-fidelity interactive React web application** featuring an Apple Health/Headspace dark-mode aesthetic (`#080d18` / `#040711`), a 60 FPS Living Vector Mascot (**AWEN**), 5 reactive aura color states, a 7-window time-aware speech engine, a supportive rule-based AI companion chat, full Supabase authentication (Email/Password + Google OAuth), persistent Postgres database storage, and a 1-second simulated telemetry stream modeling exertion scenarios (Stairs, Caffeine, Workout). It includes software-level firmware drivers for the MAX30102 PPG sensor and browser Web Serial API line parsing.

### 1.3 "What AWEN Needs to Become for the Final Project"
To fulfill the research proposal thesis, AWEN must transition into a **fully closed-loop AI-IoT hardware/software system**. It must ingest real multi-sensor telemetry (MAX30102 PPG + MPU6050 movement), apply PPG signal quality noise rejection (SQI), extract Heart Rate Variability features (RMSSD/SDNN), compute dynamic 7-day personal physiological baseline signatures from Supabase database history, classify non-exertional stress using trained machine learning models, display dynamic explainability outputs, and present real historical longitudinal trends across all dashboard screens.

---

## SECTION 2 — ALREADY COMPLETED

The following checklist represents features that are **genuinely working and verified** in the codebase:

- [x] **Living Vector Mascot Stage (`AwenSpirit.jsx`)**: 60 FPS vector SVG mascot featuring organic mochi contours, glowing crystal fins, halo ring, automatic blinking every 3.8s, subtle eye glances, spring bounce animation, waving fin gesture on click, and floating vector `"Zzz"` particles during night mode (`sleeping`).
- [x] **Facial Expression Engine**: 6 distinct facial expressions (`happy`, `thinking`, `listening`, `concerned`, `sleeping`, `celebrating`).
- [x] **Dynamic Colour / State Reactivity (`stateEngine.js`)**: Evaluates 5 states (`LEARNING`, `BALANCED`, `ACTIVE`, `WATCHFUL`, `WIND_DOWN`) and dynamically maps SVG gradient themes (`Lavender`, `Emerald`, `Golden Yellow`, `Amber`, `Deep Violet`).
- [x] **Mascot Speech Cloud (`AwenSpeechCloud.jsx`)**: Organic glass bubble rendered directly above AWEN with 5-second auto-fade, non-navigating speech updates on tap, and a `"Talk more →"` link.
- [x] **7-Window Time-Aware Personality Engine (`speechEngine.js`)**: Calculates local time windows (`EARLY_MORNING` through `LATE_NIGHT`) with a sliding history buffer ensuring zero line repetition.
- [x] **Today / Home Stage Layout (`TodayScreen.jsx`)**: Responsive 2-column layout (`max-w-6xl`) with time-aware greeting, mascot stage, simplified wellness card, 3 live body reading cards (HR, SpO₂, Temp), and 2-step evening check-in modal.
- [x] **Supabase Authentication (`AuthModal.jsx` & `apiService.js`)**: Email/Password Sign Up & Sign In, Google OAuth redirect handling, profile creation triggers, and active session restoration (`onAuthStateChange`).
- [x] **Supabase PostgreSQL Schema & Security (`schema.sql`)**: 5 Postgres tables (`profiles`, `physiological_readings`, `user_checkins`, `awen_conversations`, `user_baselines`) with Row Level Security policies (`auth.uid() = user_id`).
- [x] **Observation Mode System (`ObservationModal.jsx` & `YouScreen.jsx`)**: 3–7 day learning onboarding modal, profile settings toggle with confirmation dialog, baseline confidence state tracking (`Learning` → `Stable baseline`).
- [x] **Supportive Rule-Based AI Chat (`TalkScreen.jsx` & `aiEngine.js`)**: Warm 8th-grade level response generator providing direct answers, telemetry context, and actionable wellness suggestions. Saves conversations to Supabase `awen_conversations`.
- [x] **Telemetry Streaming Engine (`telemetryStream.js`)**: Real-time 1-second pulse stream with activity scenario switching (`Resting`, `Stairs`, `Caffeine`, `Running`) and background Supabase saving.
- [x] **FastAPI Backend Server (`backend/main.py`)**: Microservice endpoints `/api/analyze`, `/api/chat`, and WebSocket `/ws/telemetry` with fallback handling in the frontend.
- [x] **ESP32 MAX30102 Firmware Sketch (`esp32_max30102.ino`)**: Arduino sketch reading MAX30102 via SparkFun library and emitting JSON payloads over Serial at 115200 baud.
- [x] **Web Serial Ingestion Service (`telemetryStream.js`)**: `connectWebSerial()` method parses line-by-line JSON streams from Chrome Web Serial API.

---

## SECTION 3 — REMAINING WORK

### A. CRITICAL (Research Core — Mandatory for Final Project)
1. **Dynamic Personal Baseline Engine**: Replace hardcoded baseline constants (`64.0 bpm`) with automated SQL/JavaScript aggregation functions that compute user-specific resting averages from Supabase `physiological_readings`.
2. **Real Historical Database Integration for Journey & Profile**: Remove static mock arrays (`WEEKLY_POINTS`, static body pattern, static reflections) and wire real historical database queries to `JourneyScreen.jsx` and `YouScreen.jsx`.
3. **Dynamic Explainability Engine**: Connect the Today screen `"Why did AWEN suggest this?"` modal to parse real dynamic physiological factors from backend analysis rather than static text.
4. **MPU6050 Accelerometer Firmware & Ingestion**: Update ESP32 firmware to include MPU6050 I2C driver code and transmit movement X/Y/Z accelerometer metrics in telemetry payloads.
5. **Hardware Connection UI Manager**: Add a dedicated "Connect Wearable (ESP32)" button and connection status dialog in `YouScreen.jsx` and top header bar to trigger `connectWebSerial()`.
6. **PPG Signal Quality Index (SQI)**: Implement moving window noise detection and motion artifact rejection algorithms.
7. **HRV Feature Extraction Pipeline**: Extract Heart Rate Variability features (RMSSD, SDNN) from peak-to-peak pulse intervals (RR/PPI).
8. **Lightweight ML Classifier**: Train and evaluate a lightweight classifier (e.g. Random Forest / Logistic Regression) on extracted physiological + movement features to estimate non-exertional stress states.
9. **Quantitative Evaluation & Comparison**: Conduct benchmark experiments comparing fixed generic medical thresholds against AWEN's personalized context-aware model.
10. **Physical Wearable Integration**: Package ESP32, MAX30102, MPU6050, and power wiring into a compact physical wearable prototype.

### B. IMPORTANT (User Experience & Feedback Enhancements)
1. **Interactive Guided Recovery / Breathing Exercise**: Route and enhance `BreathingModal.jsx` into an active guided breathing tool with visual bio-feedback cues.
2. **Hardware & Application Feedback Mechanisms**: Implement Web Vibration API / haptic motor driver and browser toast notifications when state transitions to `WATCHFUL`.
3. **Orphaned Component Cleanup**: Clean up or integrate the 12 unused component files in `src/components/`.

### C. OPTIONAL / ONLY IF TIME ALLOWS
1. **BLE (Bluetooth Low Energy) Integration**: Replace USB Web Serial cable with Web Bluetooth API streaming.
2. **Hardware Audio Buzzer Tone Cues**: Add PWM tone generator code to ESP32 firmware.
3. **Hardware Battery Monitoring**: Add ADC resistor divider voltage monitoring to ESP32 firmware.

### D. DO NOT BUILD (Scope Creep & Philosophy Violations)
* ❌ Gamification elements (coins, XP, badges, streaks, leaderboards).
* ❌ Alarmist medical diagnostic labels ("You have medical condition X").
* ❌ Direct immediate navigation away from Today screen on mascot tap.
* ❌ Ultra-wide unbounded dashboard layouts.

---

## SECTION 4 — MASTER IMPLEMENTATION ROADMAP

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 0: Project Safety & Environment Baseline                                          │
└────────────────────────────┬────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Dynamic Data & Personal Baseline Engine                                        │
└────────────────────────────┬────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Real Historical Dashboard & Journey Integration                                │
└────────────────────────────┬────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Dynamic Explainability Pipeline                                                │
└────────────────────────────┬────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: Hardware Connection UI & Web Serial Pairing Manager                             │
└────────────────────────────┬────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: MPU6050 Movement Sensing & Firmware Integration                                │
└────────────────────────────┬────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 6: PPG Signal Quality Index (SQI) & Noise Filtering                               │
└────────────────────────────┬────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 7: HRV Feature Extraction Pipeline (RMSSD / SDNN)                                 │
└────────────────────────────┬────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 8: Stress-State Machine Learning Pipeline                                         │
└────────────────────────────┬────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 9: Feedback & Interactive Recovery Features                                       │
└────────────────────────────┬────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 10: Physical Wearable Hardware Finalization                                       │
└────────────────────────────┬────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 11: Evaluation, Experiments & Quantitative Benchmarking                           │
└────────────────────────────┬────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 12: Codebase Cleanup, Documentation & Final Demo Prep                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## SECTION 5 — STEP-BY-STEP TASK BREAKDOWN

### PHASE 0 — Project Safety & Baseline Environment
* **Goal**: Establish a baseline environment state and confirm audit integrity before initiating changes.
* **Why Needed**: Ensures existing working features (living mascot, Supabase auth, state engine) remain intact.
* **Starting Point**: Codebase audited; [AWEN_CURRENT_STATUS_AUDIT.md](file:///c:/Users/Anurag%20Singh/Desktop/AWEN/AWEN_CURRENT_STATUS_AUDIT.md) created.
* **Tasks**:
  0.1 Verify local environment configuration (.env variables, node_modules).  
  0.2 Verify clean local dev build (`npm run build`).  
  0.3 Confirm zero uncommitted staging state in Git.  
* **Affected Files**: None (read-only verification).
* **Expected Output**: Verified build pipeline ready for Phase 1.
* **Verification**: `npm run build` succeeds without errors.
* **Do NOT Change**: Existing component code or database rules.

---

### PHASE 1 — Dynamic Data & Personal Baseline Engine
* **Goal**: Transition personal baseline from hardcoded constants (`64.0 bpm`) to an automated calculation derived from user readings stored in Supabase.
* **Why Needed**: Core thesis requirement — comparing user against their *own* physiological baseline rather than hardcoded thresholds.
* **Starting Point**: `baselineEngine.js` uses `DEFAULT_BASELINE = { restingHr: 64.0 }`. Supabase table `user_baselines` exists.
* **Tasks**:
  1.1 Inspect `apiService.js` and `supabase/schema.sql` `user_baselines` schema.  
  1.2 Implement `apiService.fetchUserBaseline(userId)` to retrieve calculated baselines from Supabase.  
  1.3 Implement `apiService.computeAndSaveBaseline(userId)` to query `physiological_readings` for resting states (activity == 'Resting'), calculate 7th-percentile RHR, median SpO₂, and standard deviation, and upsert into `user_baselines`.  
  1.4 Update `baselineEngine.js` constructor to update its baseline values when a user session loads.  
  1.5 Connect observation mode progress (Days 1–7) to baseline confidence calculation (`Learning` → `Early baseline` → `Developing baseline` → `Stable baseline`).  
  1.6 Verify fallback to `DEFAULT_BASELINE` when insufficient readings exist.  
* **Affected Files**: `src/services/apiService.js`, `src/services/baselineEngine.js`, `src/App.jsx`.
* **Prerequisites**: Phase 0.
* **Expected Output**: User's resting baseline dynamically reflects their recorded data history.
* **Verification**: Add simulated readings for resting state, run calculation, verify `restingHr` updates in state.

---

### PHASE 2 — Real Historical Dashboard & Journey Integration
* **Goal**: Replace hardcoded mock arrays and hardcoded text in `JourneyScreen.jsx` and `YouScreen.jsx` with real aggregated database queries.
* **Why Needed**: Eliminates mock data debt and provides accurate longitudinal tracking.
* **Starting Point**: `JourneyScreen.jsx` uses hardcoded `WEEKLY_POINTS` array `[65, 67, 64, 70, 66, 63, 65]`. `YouScreen.jsx` displays static numbers and static discovery cards.
* **Tasks**:
  2.1 Implement `apiService.fetchWeeklyHeartRateHistory(userId)` to query daily average heart rate for the past 7 days from `physiological_readings`.  
  2.2 Update `JourneyScreen.jsx` SVG chart to dynamically map fetched daily averages to chart coordinates.  
  2.3 Implement dynamic reflection generation in `JourneyScreen.jsx` based on week-over-week recovery rate and quiet hour dips.  
  2.4 Update `YouScreen.jsx` "Your Body Pattern" card to read values directly from the user's `user_baselines` record.  
  2.5 Implement dynamic unlocking of "Discovery Journey" cards in `YouScreen.jsx` based on `user_profile.observation_day`.  
* **Affected Files**: `src/components/JourneyScreen.jsx`, `src/components/YouScreen.jsx`, `src/services/apiService.js`.
* **Prerequisites**: Phase 1.
* **Expected Output**: Journey chart and profile cards update dynamically based on database entries.
* **Verification**: Insert distinct telemetry records across multiple days in Supabase, verify SVG curve matches real averages.

---

### PHASE 3 — Dynamic Explainability Pipeline
* **Goal**: Connect the Today screen `"Why did AWEN suggest this?"` modal to parse real dynamic metrics from `evaluation.explainability` instead of hardcoded static text.
* **Why Needed**: Fulfills the explainability requirement in non-clinical human-readable terms.
* **Starting Point**: `TodayScreen.jsx` renders a static `<ul>` with 3 fixed text bullets.
* **Tasks**:
  3.1 Inspect `evaluation.explainability` object returned by `apiService.analyzeTelemetry`.  
  3.2 Update `TodayScreen.jsx` explainability modal state to consume `evaluation.explainability.summary` and `evaluation.explainability.factors`.  
  3.3 Map metric factor details (`Baseline Delta`, `Activity Context`, `SpO2 Stability`, `Model Confidence`) to clear visual status badges in the modal.  
  3.4 Add plain-English contextual explanations based on active scenario (`Stairs`, `Caffeine`, `Resting`).  
* **Affected Files**: `src/components/TodayScreen.jsx`, `src/services/baselineEngine.js`.
* **Prerequisites**: Phase 2.
* **Expected Output**: Clicking "Why did AWEN suggest this?" displays dynamic explainability details matching current readings.
* **Verification**: Trigger "Stairs" activity scenario, click explainability button, verify modal explains staircase exertion offset.

---

### PHASE 4 — Hardware Connection UI & Web Serial Pairing Manager
* **Goal**: Add a dedicated UI control in the frontend so users can pair and connect an ESP32 hardware node via Web Serial API.
* **Why Needed**: Bridges web software to physical sensor hardware.
* **Starting Point**: `TelemetryStream.js` has `connectWebSerial()`, but no UI button calls it.
* **Tasks**:
  4.1 Create a hardware connection pill/button in the top header and `YouScreen.jsx`.  
  4.2 Build a connection modal explaining browser Web Serial requirements (Chrome/Edge, 115200 baud).  
  4.3 Wire button click to invoke `telemetryStream.connectWebSerial()`.  
  4.4 Add UI visual feedback for `Connecting`, `Connected (ESP32 Live)`, and `Disconnected (Demo Mode)`.  
  4.5 Add disconnect trigger and error toast alerts for serial port disconnects.  
* **Affected Files**: `src/components/YouScreen.jsx`, `src/App.jsx`, `src/services/telemetryStream.js`.
* **Prerequisites**: Phase 3.
* **Expected Output**: Users can pair an ESP32 via browser UI with live status indicators.
* **Verification**: Click "Connect Hardware", select USB serial port, verify header updates to `ESP32 Live`.

---

### PHASE 5 — MPU6050 Movement Sensing & Firmware Integration
* **Goal**: Add MPU6050 accelerometer sensor support to ESP32 firmware and ingest movement metrics into the software data pipeline.
* **Why Needed**: Required to distinguish physical exertion from non-exertional stress.
* **Starting Point**: `esp32_max30102.ino` only reads MAX30102 PPG. No accelerometer keys exist.
* **Tasks**:
  5.1 Update `esp32_max30102.ino` to include `Adafruit_MPU6050.h` / `Wire.h` I2C driver.  
  5.2 Read X/Y/Z acceleration and calculate vector magnitude $a_{\text{mag}} = \sqrt{x^2 + y^2 + z^2}$.  
  5.3 Append `"accel": a_mag` and `"moving": boolean` to Serial JSON payload.  
  5.4 Update `telemetryStream.js` to parse `accel` metric from incoming payloads.  
  5.5 Update `baselineEngine.js` to automatically set activity context to `Walking` or `Active` when accelerometer magnitude exceeds motion threshold.  
* **Affected Files**: `backend/esp32_firmware/esp32_max30102.ino`, `src/services/telemetryStream.js`, `src/services/baselineEngine.js`.
* **Prerequisites**: Phase 4.
* **Expected Output**: Movement data automatically adjusts activity context in real-time.
* **Verification**: Simulate motion magnitude payload, verify activity automatically transitions to active state.

---

### PHASE 6 — PPG Signal Quality Index (SQI) & Noise Filtering
* **Goal**: Implement noise rejection and signal quality estimation for raw MAX30102 PPG signals to eliminate motion artifacts.
* **Why Needed**: PPG sensors are highly sensitive to motion; invalid readings must be rejected before baseline analysis.
* **Starting Point**: Firmware outputs raw IR values without quality assessment.
* **Tasks**:
  6.1 Implement rolling window peak detection stability check in firmware/telemetryStream.  
  6.2 Compute SQI score (`0` to `100%`) based on pulse amplitude consistency and IR AC/DC ratio.  
  6.3 Flag readings with SQI < 60% as `invalid_artifact` and suppress false stress warnings.  
  6.4 Render SQI indicator badge on health cards when hardware mode is active.  
* **Affected Files**: `backend/esp32_firmware/esp32_max30102.ino`, `src/services/telemetryStream.js`, `src/components/TodayScreen.jsx`.
* **Prerequisites**: Phase 5.
* **Expected Output**: Motion artifact spikes are ignored; UI indicates signal quality status.
* **Verification**: Inject erratic pulse interval noise, verify system labels signal as poor quality and suppresses state change.

---

### PHASE 7 — HRV Feature Extraction Pipeline (RMSSD / SDNN)
* **Goal**: Calculate Heart Rate Variability (HRV) metrics from consecutive peak-to-peak inter-beat intervals (RR intervals).
* **Why Needed**: HRV is the single most reliable non-invasive physiological index of autonomic nervous system stress.
* **Starting Point**: Only average BPM is calculated; inter-beat interval array is missing.
* **Tasks**:
  7.1 Capture RR intervals (in milliseconds) from MAX30102 pulse timestamps.  
  7.2 Implement RMSSD calculation: $\text{RMSSD} = \sqrt{\frac{1}{N-1} \sum_{i=1}^{N-1} (RR_{i+1} - RR_i)^2}$.  
  7.3 Implement SDNN calculation: $\text{SDNN} = \sqrt{\frac{1}{N-1} \sum_{i=1}^{N} (RR_i - \overline{RR})^2}$.  
  7.4 Append `rmssd` and `sdnn` metrics to payload and save to Supabase `physiological_readings`.  
  7.5 Integrate RMSSD drop below personal baseline as an input to stress estimation.  
* **Affected Files**: `backend/esp32_firmware/esp32_max30102.ino`, `src/services/telemetryStream.js`, `src/services/baselineEngine.js`, `backend/ml_engine.py`.
* **Prerequisites**: Phase 6.
* **Expected Output**: Live telemetry stream provides calculated RMSSD and SDNN values.
* **Verification**: Pass known RR interval sequence, verify computed RMSSD matches theoretical result.

---

### PHASE 8 — Stress-State Machine Learning Pipeline
* **Goal**: Build and evaluate a lightweight interpretable ML classifier (e.g. Random Forest / Logistic Regression) using extracted physiological features + movement context.
* **Why Needed**: Replaces static rule math with trained machine learning inference.
* **Starting Point**: `ml_engine.py` has an untrained `IsolationForest` initialized on 400 random synthetic points.
* **Tasks**:
  8.1 Structure feature vector: `[hr_delta, spo2_delta, rmssd_delta, accel_magnitude, activity_code]`.  
  8.2 Prepare training dataset combining synthetic baseline-normal distributions and labeled non-exertional stress scenarios.  
  8.3 Train a lightweight `RandomForestClassifier` or `LogisticRegression` model in `ml_engine.py`.  
  8.4 Output predicted stress probability (`low`, `moderate`, `elevated`) and feature importance metrics.  
  8.5 Connect FastAPI `/api/analyze` response directly to frontend `TodayScreen` and state engine.  
* **Affected Files**: `backend/ml_engine.py`, `backend/main.py`, `src/services/apiService.js`.
* **Prerequisites**: Phase 7.
* **Expected Output**: FastAPI backend provides ML-driven stress probability and feature contributions.
* **Verification**: Send test telemetry vector with elevated HR + low RMSSD + zero movement, verify model classifies state as non-exertional stress.

---

### PHASE 9 — Feedback & Interactive Recovery Features
* **Goal**: Implement interactive recovery support, including a guided bio-feedback breathing tool and non-intrusive alert feedback.
* **Why Needed**: Delivers non-clinical wellbeing support when stress deviations are detected.
* **Starting Point**: `BreathingModal.jsx` exists as an orphaned file; no haptic or push alerts exist.
* **Tasks**:
  9.1 Clean up, route, and enhance `BreathingModal.jsx` with a 4-7-8 breathing pacer animation.  
  9.2 Add a `"Try 2-min Breathing"` action button to the mascot speech cloud when state is `WATCHFUL`.  
  9.3 Implement Web Haptic Vibration API (`navigator.vibrate([100, 50, 100])`) on state transition for supported devices.  
  9.4 Implement browser application toast alert when elevated non-exertional stress is detected.  
* **Affected Files**: `src/components/BreathingModal.jsx`, `src/components/TodayScreen.jsx`, `src/components/AwenSpeechCloud.jsx`.
* **Prerequisites**: Phase 8.
* **Expected Output**: Users can open a functional breathing exercise directly from mascot alerts.
* **Verification**: Trigger `WATCHFUL` state, click speech cloud action, verify breathing modal launches with active pacer animation.

---

### PHASE 10 — Physical Wearable Hardware Finalization
* **Goal**: Assemble and test physical wearable hardware components (ESP32 + MAX30102 + MPU6050 + USB/power wiring).
* **Why Needed**: Demonstrates physical IoT hardware integration for the research prototype.
* **Starting Point**: Code written; physical breadboard/wearable assembly pending.
* **Tasks**:
  10.1 Wire MAX30102 (I2C: GPIO 21 SDA, GPIO 22 SCL) and MPU6050 to ESP32 microcontroller.  
  10.2 Flash updated firmware containing PPG + MPU6050 + SQI logic.  
  10.3 Verify stable USB Serial transmission at 115200 baud.  
  10.4 Perform wrist/finger physical sensor placement test and record telemetry stream.  
* **Affected Files**: `backend/esp32_firmware/esp32_max30102.ino`.
* **Prerequisites**: Phase 9.
* **Expected Output**: Physical ESP32 wearable streams valid heart rate, temperature, and motion to AWEN web app.
* **Verification**: Connect physical ESP32 to computer, click "Connect Hardware" in AWEN web app, verify live PPG pulse and movement respond to physical touch and wrist motion.

---

### PHASE 11 — Evaluation, Experiments & Benchmarking
* **Goal**: Execute quantitative evaluation experiments comparing generic medical threshold detection against AWEN's personalized baseline model.
* **Why Needed**: Provides empirical validation for research thesis claims.
* **Starting Point**: No evaluation benchmarking script exists.
* **Tasks**:
  11.1 Create evaluation script in `backend/evaluation_benchmark.py`.  
  11.2 Run evaluation comparing:
    - **Model A (Generic Fixed Threshold)**: HR > 100 bpm triggers stress alarm.
    - **Model B (AWEN Personalized Context Model)**: Baseline HR + Activity Offset + RMSSD delta.  
  11.3 Test across 3 scenarios: (1) Quiet resting rest, (2) Staircase climbing exertion, (3) Desk studying mental stress.  
  11.4 Calculate False Positive Rate (FPR) reduction (demonstrating staircase false alarms are eliminated).  
  11.5 Document accuracy, precision, recall, and FPR comparison tables.  
* **Affected Files**: `backend/evaluation_benchmark.py`.
* **Prerequisites**: Phase 10.
* **Expected Output**: Quantitative benchmark table proving personalized baseline reduces false positive stress alarms.
* **Verification**: Run evaluation script, confirm Model B eliminates staircase false positives while correctly identifying desk stress.

---

### PHASE 12 — Codebase Cleanup, Documentation & Final Demo Preparation
* **Goal**: Clean up unused codebase artifacts, finalize documentation, and verify reproducible demo execution.
* **Why Needed**: Ensures clean repository structure and flawless final presentation.
* **Starting Point**: 12 orphaned files exist; final docs need updating.
* **Tasks**:
  12.1 Remove or archive the 12 orphaned component files in `src/components/`.  
  12.2 Update `README.md` with complete architecture setup instructions, live Vercel links, and hardware connection steps.  
  12.3 Conduct end-to-end user flow walkthrough (Landing → Sign In → Observation Mode → Telemetry Stream → Mascot Interaction → AI Chat → Journey History → Profile Settings).  
  12.4 Perform clean production build (`npm run build`).  
* **Affected Files**: `src/components/*`, `README.md`.
* **Prerequisites**: Phase 11.
* **Expected Output**: Clean, production-ready codebase with zero compiler warnings or broken imports.
* **Verification**: `npm run build` passes with zero errors; complete demo walkthrough executes cleanly.

---

## SECTION 6 — RESEARCH ALIGNMENT

| Research Requirement | Current Status | Required Implementation | Validation Strategy |
| :--- | :--- | :--- | :--- |
| **Wearable Sensing** | PARTIALLY DONE | ESP32 + MAX30102 + MPU6050 stream | Stream verified over Web Serial |
| **MAX30102 PPG Sensor** | PARTIALLY DONE | Hardware I2C driver & JSON stream | Real-time BPM and SpO₂ telemetry |
| **MPU6050 Accelerometer** | MISSING | Add MPU6050 driver & acceleration vector magnitude | Motion magnitude changes on wrist movement |
| **Physiological Telemetry** | PARTIALLY DONE | Collect HR, SpO₂, Temp, RMSSD | Data persisted to Supabase Postgres |
| **Movement Context** | PARTIALLY DONE | Activity profile offsets & auto motion detection | Exertion filter suppresses stair alarms |
| **Signal Quality (SQI)** | MISSING | Moving window peak stability check | Suppress state changes when SQI < 60% |
| **Personal Baseline** | PARTIALLY DONE | 7th-percentile RHR aggregation from Supabase history | Baseline updates dynamically per user |
| **Context Deviation** | PARTIALLY DONE | $HR_{\text{delta}} = HR_{\text{current}} - (HR_{\text{base}} + Offset)$ | Anomaly score reflects net deviation |
| **ML State Estimation** | PARTIALLY DONE | Trained Random Forest / Logistic Regression classifier | Classify non-exertional stress probability |
| **Explainability** | PARTIALLY DONE | Dynamic factor attribution badges & human text | Modal explains exact deviation factors |
| **Longitudinal Tracking** | PARTIALLY DONE | Dynamic Supabase queries for Journey & Profile charts | Real weekly average curve rendered |
| **Personalized Feedback** | ALREADY DONE | Mascot expression, aura color theme & supportive chat | 5 reactive states & 8th-grade AI advice |
| **Guided Recovery** | MISSING | Interactive 4-7-8 bio-feedback breathing tool | Guided breathing modal launches cleanly |
| **Quantitative Evaluation** | MISSING | Generic fixed threshold vs AWEN baseline benchmark | Demonstrate false positive reduction |
| **Non-Clinical Guardrails** | ALREADY DONE | Enforce non-diagnostic supportive framing | Zero medical jargon or alarmist labels |

---

## SECTION 7 — DATA FLOW: FINAL TARGET ARCHITECTURE

```
                                CURRENT DATA FLOW
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Simulated Stream -> TelemetryStream -> App.jsx -> Client Math -> Today Screen  │
│ (1s Timer Stream)  (Scenario State)  (React State) (Rule Offsets) (Static Chart)│
└─────────────────────────────────────────────────────────────────────────────────┘

                             FINAL TARGET DATA FLOW
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Hardware Sensors (MAX30102 PPG + MPU6050 Accel)                                │
│       │                                                                         │
│       ▼                                                                         │
│  ESP32 Firmware (I2C Read + Timestamping + Baud 115200)                         │
│       │                                                                         │
│       ▼                                                                         │
│  Browser Web Serial API (Chrome Stream / TelemetryStream)                       │
│       │                                                                         │
│       ▼                                                                         │
│  Signal Quality Index (SQI Filter: Reject Motion Artifacts < 60%)                │
│       │                                                                         │
│       ▼                                                                         │
│  Feature Extraction (HR, SpO2, Temp, Accel Vector, RMSSD, SDNN)                 │
│       │                                                                         │
│       ▼                                                                         │
│  Dynamic Personal Baseline Engine (Supabase Historical Aggregation)            │
│       │                                                                         │
│       ▼                                                                         │
│  Context-Aware Deviation & ML Classifier (Random Forest Inference)               │
│       │                                                                         │
│       ▼                                                                         │
│  Dynamic Explainability & AWEN State Engine (5 Color Themes + Mascot)           │
│       │                                                                         │
│       ▼                                                                         │
│  UI Stage + Interactive Breathing Exercise + Supabase DB Persistence             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## SECTION 8 — ML ROADMAP

To transition AWEN's intelligence layer from rule-based formulas to a true, lightweight, interpretable machine learning pipeline:

1. **Feature Vector Definition**:
   * $f_1 = HR_{\text{current}} - HR_{\text{resting\_baseline}}$ (Heart rate delta from resting baseline)
   * $f_2 = SpO2_{\text{baseline}} - SpO2_{\text{current}}$ (Oxygen saturation delta)
   * $f_3 = \text{RMSSD}_{\text{current}} / \text{RMSSD}_{\text{baseline}}$ (HRV variance ratio)
   * $f_4 = a_{\text{magnitude}}$ (Accelerometer vector magnitude)
   * $f_5 = \text{Activity\_Code}$ (Encoded activity context: Resting=0, Study=1, Walk=2, Stairs=3)

2. **Target Label Definition (Non-Clinical)**:
   * Class 0 (`BALANCED`): Normal physiological state aligned with baseline.
   * Class 1 (`ACTIVE`): Elevated HR explained by accelerometer movement ($a_{\text{magnitude}} > \text{threshold}$).
   * Class 2 (`WATCHFUL`): Elevated HR and lowered RMSSD with low movement ($a_{\text{magnitude}} < \text{threshold}$), indicating non-exertional cognitive load or fatigue.

3. **Model Selection & Architecture**:
   * Primary Model: **Lightweight Random Forest Classifier** (`n_estimators=20`, `max_depth=4`) or **Logistic Regression**.
   * Rationale: Interpretable, low computational footprint, zero risk of overfitting, easy export to Python/JavaScript. Deep neural networks will **not** be used to prevent unnecessary complexity and overfitting.

4. **Validation & Leakage Prevention**:
   * Group K-Fold cross-validation grouped by user ID to guarantee models generalize to unseen individuals.
   * Feature importance metrics (Gini importance) extracted to populate dynamic explainability badges.

---

## SECTION 9 — HARDWARE ROADMAP

```
                    CURRENT HARDWARE SUPPORT
┌──────────────────────────────────────────────────────────────┐
│ ESP32 + MAX30102 (PPG) + Web Serial USB + Telemetry Simulator │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
                    REQUIRED TARGET HARDWARE
┌──────────────────────────────────────────────────────────────┐
│ ESP32 + MAX30102 (PPG) + MPU6050 (Accel) + Web Serial Pairing│
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
                    PHYSICAL WEARABLE PROTOTYPE
┌──────────────────────────────────────────────────────────────┐
│ Microcontroller + PPG Finger/Wrist Sensor + Accel + Case Wire │
└──────────────────────────────────────────────────────────────┘
```

### Mandatory Hardware Requirements
* **ESP32 Microcontroller**: Core processing node.
* **MAX30102 Pulse Oximeter**: I2C bus connection (GPIO 21 SDA, GPIO 22 SCL).
* **MPU6050 Accelerometer / Gyroscope**: I2C bus sharing (GPIO 21 SDA, GPIO 22 SCL).
* **USB Telemetry Interface**: Wired 115200 baud Web Serial connection.

### Optional Hardware Features (If Time Permits)
* **Web Bluetooth (BLE) Module**: Wireless GATT server transmission.
* **Haptic Vibration Motor**: GPIO 13 PWM motor output.
* **Battery ADC Voltage Divider**: GPIO 34 battery monitoring.

---

## SECTION 10 — TESTING CHECKLIST

| System Domain | Test Description | Verification Criteria |
| :--- | :--- | :--- |
| **UI Stage** | 4-tab navbar routing & layout | Clicking tabs updates view cleanly without re-render glitches |
| **Mascot Stage** | Mascot tap gesture & expressions | Tapping AWEN displays speech cloud directly above AWEN |
| **Authentication** | Supabase Auth sign in & session restore | Google OAuth and Email login restore profile state on refresh |
| **Database** | Telemetry and conversation saving | Postgres tables store user ID, timestamp, and readings |
| **Telemetry Stream** | Scenario switching (Stairs, Caffeine) | Changing scenario smoothly updates HR, SpO₂, and activity |
| **Web Serial** | Hardware USB connection | Clicking "Connect Hardware" parses incoming JSON packets |
| **MAX30102** | PPG heart rate & temperature reading | Sensor output matches human pulse rates (60–100 bpm) |
| **MPU6050** | Movement vector magnitude | Shaking sensor changes magnitude and sets activity to active |
| **Signal Quality** | Motion artifact rejection | Erratic noise flags reading as low SQI (<60%) |
| **Personal Baseline** | Dynamic 7th-percentile calculation | Inserting low resting HR readings updates user baseline |
| **State Estimation** | Non-exertional stress trigger | Elevated HR + low movement transitions state to `WATCHFUL` |
| **ML Engine** | FastAPI model inference | `/api/analyze` returns predicted stress probability & factors |
| **Explainability** | Dynamic factor attribution | Explainability modal displays dynamic metrics matching state |
| **Recovery Guide** | Guided 4-7-8 breathing modal | Launching breathing modal renders active animated pacer |
| **Evaluation** | Baseline model benchmark | Script proves AWEN baseline reduces false alarms vs fixed HR>100 |

---

## SECTION 11 — GIT / VERSION CONTROL RULE

> ⚠️ **MANDATORY RULE FOR ALL FUTURE DEVELOPMENT PHASES**:  
> **NO GIT COMMIT OR GIT PUSH IS ALLOWED UNLESS THE USER EXPLICITLY INSTRUCTS IT.**

Until explicit written permission (`"Push to Git"`) is provided by the user:
* Do **NOT** run `git commit`.
* Do **NOT** run `git push`.
* Do **NOT** create release tags or modify remote tracking branches.
* Do **NOT** perform force-pushes, resets, or rebase operations.
* All development, file creation, editing, and testing **MUST REMAIN LOCAL ONLY**.

---

## SECTION 12 — AGENT EXECUTION RULES

When executing future implementation tasks, any AI agent **MUST STRICTLY OBEY**:

1. Never implement multiple major phases in a single prompt without explicit instruction.
2. Work strictly on the requested phase and task.
3. Inspect existing code before modifying any file.
4. Preserve all working UI designs, mascot animations, and glassmorphism styling.
5. Do not rewrite working components unnecessarily.
6. Do not introduce scope creep or gamification elements.
7. Do not install third-party dependencies without explicit user approval.
8. Do not modify database schemas unless the specific task requires it.
9. Do not replace existing working architecture for purely stylistic reasons.
10. Test every task thoroughly before declaring completion.
11. Report exactly what files were changed.
12. Report exactly what verification tests were run.
13. Report any remaining limitations accurately.
14. Never declare a feature complete if it relies on mock data.
15. **NEVER execute a Git commit or Git push unless explicitly requested.**

---

## SECTION 13 — FINAL DEFINITION OF DONE

The AWEN project shall be declared **100% COMPLETE** for final submission only when all of the following criteria are met:

1. **Functional AWEN Stage**: Living mascot, speech cloud, time-aware speech engine, 5 reactive color states, and dark glassmorphic UI.
2. **Persistent User Data**: Real user profiles, readings, check-ins, and conversations stored in Supabase with RLS security.
3. **Dynamic Personal Baseline**: Resting physiological baseline computed dynamically from user historical database records.
4. **Real Historical Dashboard**: Journey and Profile screens render live daily averages from Supabase instead of mock data.
5. **Context-Aware Analysis**: Exertion filter successfully eliminates false positive stress alarms during physical activity (e.g. climbing stairs).
6. **Multi-Sensor Hardware Support**: ESP32 firmware reads MAX30102 PPG and MPU6050 accelerometer telemetry over USB Serial.
7. **Signal Quality Rejection (SQI)**: Motion artifact noise rejected before state analysis.
8. **Lightweight ML Classifier**: Trained model classifies non-exertional stress probability using physiological + movement features.
9. **Dynamic Explainability**: Human-readable explanation modal breaks down exact deviation factors.
10. **Interactive Wellbeing Support**: Guided breathing recovery exercise modal launches cleanly from mascot alerts.
11. **Quantitative Evaluation**: Benchmark script demonstrates reduction in false positive stress alerts compared to generic fixed thresholds.
12. **Clean Codebase & Docs**: All orphaned components removed; clean production build (`npm run build`) passes with zero errors.

---

## SECTION 14 — FINAL PRIORITY ORDER ("DO THIS NEXT")

To systematically complete AWEN from its current 45% state to 100% final completion, follow this exact sequence:

```
NEXT 1 ──► PHASE 1: Dynamic Personal Baseline Engine (Supabase Aggregator)
NEXT 2 ──► PHASE 2: Real Historical Dashboard & Journey Integration (Eliminate Mock Data)
NEXT 3 ──► PHASE 3: Dynamic Explainability Pipeline (Connect Factors to Modal)
NEXT 4 ──► PHASE 4: Hardware Connection UI & Web Serial Pairing Manager
NEXT 5 ──► PHASE 5: MPU6050 Movement Sensing & Firmware Integration
NEXT 6 ──► PHASE 6: PPG Signal Quality Index (SQI) Noise Filter
NEXT 7 ──► PHASE 7: HRV Feature Extraction Pipeline (RMSSD / SDNN)
NEXT 8 ──► PHASE 8: Stress-State Machine Learning Classifier (FastAPI Engine)
NEXT 9 ──► PHASE 9: Interactive Guided Recovery Breathing Exercise
NEXT 10 ─► PHASE 10: Physical Wearable Hardware Finalization & Assembly
NEXT 11 ─► PHASE 11: Quantitative Evaluation Benchmark Experiments
NEXT 12 ─► PHASE 12: Codebase Cleanup & Final Demo Verification
```

---

> **Roadmap Status**: Fully Defined & Documented  
> **Target File Created**: `c:\Users\Anurag Singh\Desktop\AWEN\AWEN_FINAL_IMPLEMENTATION_ROADMAP.md`  
> **Immediate Action Required**: Wait for explicit user instruction before initiating Phase 1.
