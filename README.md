# AWEN (Adaptive Wellness & Emotional Navigation)

> **Personalized Physiological Intelligence & Emotional Wellness Companion**

[![GitHub Repository](https://img.shields.io/badge/GitHub-diya--1720%2FAWEN-181717?style=for-the-badge&logo=github)](https://github.com/diya-1720/AWEN)

AWEN is a premium AI-IoT digital wellness platform that analyzes an individual's personal physiological behavior rather than comparing them against generic medical thresholds. Instead of asking *"Is your heart rate above 100?"*, AWEN asks *"Is today's physiological behavior different from YOUR normal baseline?"*.

---

## 🌟 Key Features

- **Personalized Baseline Intelligence**: Learns your personal resting heart rate, SpO₂, and body temperature over a 3–7 day observation window to prevent false stress alarms during exercise or desk focus.
- **Observation Mode (3–7 Days Onboarding)**: New users begin in a dedicated baseline learning phase where AWEN observes natural daily rhythms without jumping to early conclusions.
- **Context-Aware Interpretation**: Evaluates physiological readings alongside physical activity (exercise, walking, climbing stairs), time of day, and daily check-in logs.
- **Living Vector Companion (AWEN)**: 60 FPS vector mascot featuring idle floating, automatic blinking, waving gestures, eye glances, floating speech clouds, and state-based color reactivity.
- **7-Window Time-Aware Personality**: Responds dynamically based on your local time window (Early Morning, Morning, Lunch Window, Afternoon, Evening, Night, Late Night).
- **Dynamic State & Color Reactivity**:
  - `LEARNING` (Soft Lavender / Cyan `#a855f7`)
  - `BALANCED` (Soft Cyan / Emerald `#34d399`)
  - `ACTIVE` (Warm Golden Yellow `#f59e0b`)
  - `WATCHFUL` (Soft Amber `#f97316`)
  - `WIND_DOWN` (Deep Violet / Blue `#818cf8`)
- **Day & Night Mode Starlight Atmosphere**: Top-right Moon symbol button toggles deep starlight navy backdrop (`#040711`) with floating vector sleeping mascot state (`Zzz`).
- **Interactive Daily Check-ins**: Log daily emotional state and activity context to enrich AWEN's personalized predictions.
- **AI Conversation Memory**: AWEN remembers past user conversations (e.g. exam prep, stress topics) and provides supportive, non-diagnostic guidance.
- **Demo Mode**: Built-in simulated telemetry stream allowing full interactive evaluation prior to hardware pairing.

---

## 🏗️ System Architecture

```
Client (Vite + React)
        │
        ├── Auth (Supabase Auth / Google OAuth)
        │
        ├── State Engine (Baseline & Context Evaluation)
        │
        ├── Database (Supabase Postgres + Row Level Security)
        │       ├── profiles
        │       ├── physiological_readings
        │       ├── user_baselines
        │       ├── user_checkins
        │       └── awen_conversations
        │
        └── Living Mascot UI (State Color Reactivity & Speech Clouds)
```

### Future IoT Hardware Pipeline
```
ESP32 (MAX30102 PPG / Temp Sensor) ──> REST/WebSocket API ──> Supabase DB ──> Baseline Engine ──> AWEN UI
```

---

## 💻 Technology Stack

- **Frontend Core**: React 19, JavaScript (ES6+), Vite 8
- **Styling & Design**: Tailwind CSS v4, Lucide React Icons, Custom Glassmorphism, Space Grotesk & Inter Typography
- **Backend & Database**: Supabase JS (`@supabase/supabase-js`), Python 3 FastAPI microservice (`backend/main.py`)
- **Authentication**: Supabase Auth (Email/Password + Google OAuth) with Row Level Security (RLS)

---

## 🛠️ Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/awen-wellness.git
   cd awen-wellness
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

---

## 🚀 Development & Building

### Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Create Production Build
```bash
npm run build
```
Output directory: `dist`

---

## 🐙 Version Control & GitHub Repository

### 1. Clone the Repository
```bash
git clone https://github.com/diya-1720/AWEN.git
cd AWEN
```

### 2. Local Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

### 3. Push Updates to GitHub
```bash
git add .
git commit -m "chore: prepare AWEN for local development and GitHub repository"
git push origin main
```

---

## 🧪 Demo Mode & Hardware Notice

Until physical wearable hardware is paired, AWEN runs in **Demo Mode** generating simulated physiological readings (Heart Rate, SpO₂, Skin Temperature). All simulated readings are linked to your authenticated user account and can be swapped for live hardware telemetry using the sensor controls in the **You / Profile** tab.

---

## ⚠️ Important Medical Disclaimer

AWEN is an educational and wellness prototype designed for personalized baseline tracking and emotional support. **AWEN does NOT diagnose medical conditions, replace clinical medical equipment, or provide clinical medical advice.** Always consult a qualified healthcare provider for medical concerns.

---

## 🔮 Future Scope

- Physical ESP32 + MAX30102 wristwear hardware integration.
- Continuous nocturnal PPG sleep architecture recovery modelling.
- Native mobile application builds (React Native / iOS / Android).
