# SENSEBAND OS — Website Audit & AI Reference File

> [!NOTE]
> This audit file is designed as a structural and functional reference for AI models to understand the features, themes, elemental details, and operational flow of the SENSEBAND website/platform.

## 1. System Overview & Purpose
SENSEBAND is a full-stack smart wearable stress detection & management platform. It acts as an end-to-end hardware, signal processing, machine learning, and real-time visualization system designed to acquire physiological data and movement context, establish personalized baselines, and deliver explainable stress-related estimations.

### Key Functionalities:
- Acquires live sensor data (Heart Rate/Pulse wave via MAX30102, 6-DOF IMU via MPU6050).
- Real-time telemetry processing using a FastAPI backend with WebSockets.
- Personalized resting baseline engine and context-aware movement filtering.
- Explainable ML classification for stress estimations with natural language justifications.
- Web-based Dashboard (React + Vite) for monitoring real-time data, historical analytics, and standalone demo simulations.

---

## 2. Visual Theme & Elemental Details

The website employs a **Bio-Tech Industrial × Dark Neo-Brutalist Wearable Research Lab OS** visual identity.

### 2.1. 8-Color Semantic Token System (60/20/15/5 Ratio Matrix)
- **Carbon Black (`#111315`) [60%]**: System Environment (Dominant background, hero background, command palette, terminal screen).
- **Graphite (`#1C2023`) [20%]**: Hardware Surfaces (Container background for cards, panels, modals, drawers, instrument blocks).
- **Warm Ivory (`#F1EDE3`) [15%]**: Information & Structure (Headings, body text, structural borders, monospace metadata).
- **Ash Grey (`#A8ABA6`)**: Secondary Metadata (Timestamps, technical labels, inactive tabs).
- **Signal Coral (`#FF4D4D`) [5% Accent]**: Physiological Attention (Active tab, primary CTA, live PPG pulse stream, ELEVATED stress state).
- **Bio Sage (`#7BD6A3`)**: Healthy & Connected (LOW stress state, device connected, successful calibration).
- **Amber (`#F4C95D`)**: Moderate & Caution (MODERATE stress state, low battery, evaluator demo mode).
- **Electric Cyan (`#5CC8D7`)**: Technology & Sensors (Hardware node status, data packet flow, DSP filter parameters).

### 2.2. Component Design & Interactive Elements
- **Neo-Brutalist Elements**: High-contrast, tactile UI with hard offset shadows, crisp industrial typography, and thick borders (e.g., `BrutalCard`, `BrutalButton`).
- **Waveform Canvas (`SignalWaveformCanvas.tsx`)**: Real-time 100Hz PPG optical pulse wave stream in Signal Coral on a Carbon Black canvas.
- **System Terminal (`SystemTerminal.tsx`)**: CLI emulator providing raw hardware output (Electric Cyan) and deviation highlights (Signal Coral).
- **Stress Gauge (`StressGauge.tsx`)**: Central instrument using semantic colors for states (Bio Sage = LOW, Amber = MODERATE, Signal Coral = ELEVATED).
- **Pipeline & Hardware Visualizers**: Embedded node diagrams and data journey visualizers tracking the signal from hardware through DSP filters and ML evaluation.

---

## 3. Core Features & Website Workflows

### 3.1. Authentication & Onboarding
- **Multi-Mode Auth Portal (`LoginPage.tsx`)**: Supports standard login, registration, password reset, and a "Demo Mode" for evaluators.
- **Onboarding Wizard (`OnboardingFlow.tsx`)**: Guides new users through system setup.
- **Baseline Calibration (`BaselinePage.tsx`)**: Allows the user to establish initial resting physiological baselines.

### 3.2. Real-Time Dashboard & Telemetry
- **Command Center Console (`DashboardPage.tsx`)**: Primary view for real-time sensor telemetry tracking.
- **Live Sensor Cards (`LiveSensorCard.tsx`)**: Displays continuous 3-channel sensor readings.
- **Explainability Panel**: Translates ML stress predictions into understandable natural language reasoning ("WHY?").

### 3.3. Interactive Demo Mode
- **Simulator Drawer (`DemoControlPanel.tsx`)**: Allows users to simulate various telemetry scenarios (Normal, Active, Elevated, Noisy, Disconnected) without requiring physical hardware to be attached.

### 3.4. Analytics & Historical Data
- **Analytics Visualizer (`AnalyticsPage.tsx`)**: Recharts-based trend visualization (1d, 7d, 30d views) using LineChart, BarChart, and Bivariate Scatter graphs.
- **3D Spatial Trajectory (`Telemetry3DCanvas.tsx`)**: HTML5 3D spatial matrix projection showing Time (X), Heart Rate (Y), and Acceleration (Z).
- **Data Export (`DataExportPage.tsx`)**: Allows downloading raw telemetry datasets in CSV and JSON formats.

### 3.5. System Management & Wellbeing
- **Device Management (`DevicePage.tsx`)**: Wearable hardware node status, battery monitoring, and diagnostic triggers.
- **Profile Preferences (`ProfilePage.tsx`)**: User profile and data isolation management.
- **Wellbeing Interventions (`RecommendationsPage.tsx` & `BreathingExerciseModal.tsx`)**: Non-clinical protocols including a guided biofeedback resonance breathing visualizer.

---

## 4. Technical Architecture Reference

### Frontend Stack (TypeScript / React)
- **Framework**: React 18 with Vite build tool.
- **Styling**: Tailwind CSS + Custom Vanilla CSS Variables.
- **State Management**: Context API (`SensorDataContext`, `AuthContext`).
- **Graphics**: Native HTML5 Canvas for high-frequency waveforms and 3D projections; Recharts for standard graphs.

### Backend Stack (Python / FastAPI)
- **Framework**: FastAPI with WebSockets for real-time data streaming.
- **Database**: SQLite (Development) with SQLAlchemy ORM and Pydantic for validation.
- **Processing**: SciPy (2nd-order Butterworth bandpass filter for 0.5-4.0Hz PPG AC extraction) and NumPy for vector math.
- **ML Engine**: Rule-based heuristic stress state classifier (designed to be replaceable with scikit-learn models).

### Communication Protocol
- Data ingested from ESP32 hardware via Wi-Fi/BLE JSON packets, validated by the backend, then broadcasted to the React frontend via WebSockets (`/ws/telemetry`).
