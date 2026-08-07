# AGENTS.md — AWEN Project Guide & AI Context Memory

> **Purpose**: This file serves as the definitive reference document for any AI assistant or developer working on the AWEN repository. It documents what has been built, the architectural principles, what works, what is currently simulated, and strict guidelines on what NOT to change.

---

## 📌 Project Overview & Philosophy

**Product Name**: AWEN (Adaptive Wellness & Emotional Navigation)  
**Core Thesis**: Traditional health systems compare users against generic medical thresholds (e.g. *"Is your heart rate above 100?"*). AWEN compares users against their **own personal physiological baseline** (e.g. *"Is today's physiological behavior different from YOUR normal?"*).  
**Design Aesthetic**: Inspired by Apple Health, Nothing OS, and Headspace. Deep space navy (`#080d18` / `#040711`), ambient glassmorphism, 60 FPS vector mascot micro-animations, serene typography (Space Grotesk & Inter), large intentional whitespace. **Never look like a cluttered student dashboard.**

---

## 🟢 WORK COMPLETED (100% Implemented & Verified)

### 1. Living Vector Mascot — AWEN ([AwenSpirit.jsx](file:///c:/Users/Anurag%20Singh/Desktop/AWEN/src/components/AwenSpirit.jsx))
- 60 FPS vector SVG mascot featuring organic mochi contours, glowing crystal fins, halo ring, automatic blinking every 3.8s, subtle eye glances, spring bounce animation, waving fin gesture on click, and floating vector `"Zzz"` particles during sleeping mode.
- Supports 6 facial expressions: `happy`, `thinking`, `listening`, `concerned`, `sleeping`, `celebrating`.

### 2. Mascot Tap Interaction & Speech Cloud ([AwenSpeechCloud.jsx](file:///c:/Users/Anurag%20Singh/Desktop/AWEN/src/components/AwenSpeechCloud.jsx) & [TodayScreen.jsx](file:///c:/Users/Anurag%20Singh/Desktop/AWEN/src/components/TodayScreen.jsx))
- Tapping AWEN triggers a cute mascot bounce/blink reaction and displays an **organic glass speech cloud directly ABOVE AWEN** with a downward tail pointing to AWEN.
- Includes a 5-second auto-fade timer. Re-tapping AWEN smoothly updates the message without stacking clouds.
- Includes a subtle link at the bottom: **"Talk more →"** (tapping *"Talk more →"* navigates to the Talk page). Tapping AWEN itself does **NOT** navigate away from the Today screen.

### 3. Centralized AWEN State Engine ([stateEngine.js](file:///c:/Users/Anurag%20Singh/Desktop/AWEN/src/services/stateEngine.js))
Calculates current wellness state & dynamic mascot aura color reactivity across 5 states:
- `LEARNING`: Soft Lavender / Cyan (`#a855f7`) — Observation Mode active.
- `BALANCED`: Soft Cyan / Emerald (`#34d399`) — Normal resting baseline.
- `ACTIVE`: Warm Golden Yellow (`#f59e0b`) — Physical exercise/walking (prevents false stress alarms).
- `WATCHFUL`: Soft Amber (`#f97316`) — Elevated heart rate while resting.
- `WIND_DOWN`: Deep Violet / Blue (`#818cf8`) — Evening / Late-night rest.

### 4. 7-Window Time-Aware Personality Engine ([speechEngine.js](file:///c:/Users/Anurag%20Singh/Desktop/AWEN/src/services/speechEngine.js))
Calculates time window based on local time and selects context-aware messages:
- `EARLY_MORNING` (5:00–8:00) | `MORNING` (8:00–11:30) | `LUNCH_WINDOW` (11:30–14:30) | `AFTERNOON` (14:30–17:30) | `EVENING` (17:30–21:00) | `NIGHT` (21:00–00:00) | `LATE_NIGHT` (00:00–5:00).
- **Context Cascade Priority**: `timeContext` → `healthContext` → `activityContext` → `conversationContext` → `recentMessageContext`.
- Includes a sliding message history buffer to guarantee **zero repeated lines** within cooldown periods.

### 5. 3–7 Day Observation Mode Onboarding & Settings Toggle
- **First-time Onboarding Modal** ([ObservationModal.jsx](file:///c:/Users/Anurag%20Singh/Desktop/AWEN/src/components/ObservationModal.jsx)): *"Welcome to AWEN 🌱 I'm going to learn your normal physiological pattern before making strong observations."* (`[ Start Observation Mode ]` / `[ I already have baseline data ]`).
- **Settings Toggle** ([YouScreen.jsx](file:///c:/Users/Anurag%20Singh/Desktop/AWEN/src/components/YouScreen.jsx)): Manual stop/restart Observation Mode with confirmation dialog (*"AWEN will begin using your learned baseline for personalized observations."*). Historical data is preserved.
- **Baseline Confidence**: Tracks 4 confidence states (`Learning`, `Early baseline`, `Developing baseline`, `Stable baseline`).

### 6. Supabase Real Authentication & Persistent Database ([apiService.js](file:///c:/Users/Anurag%20Singh/Desktop/AWEN/src/services/apiService.js) & [supabaseClient.js](file:///c:/Users/Anurag%20Singh/Desktop/AWEN/src/services/supabaseClient.js))
- **Auth**: Email/Password Sign Up & Login, **Google OAuth** (`[ Continue with Google ]`), active session restoration via `supabase.auth.onAuthStateChange`.
- **Database Tables**: Supabase Postgres tables (`profiles`, `physiological_readings`, `user_baselines`, `user_checkins`, `awen_conversations`).
- **Row Level Security (RLS)**: Enforces `auth.uid() = user_id` across all tables so User A can NEVER access User B's records.
- **Fail-Safe Initializer**: `supabaseClient.js` cleans quotes and falls back gracefully to Demo Mode if Supabase environment variables are unconfigured, preventing production crashes.

### 7. Full Viewport Layout Architecture
- Root container (`App.jsx` & `index.css`) enforces `width: 100vw` and `min-height: 100dvh`.
- Desktop Layout (`lg:grid lg:grid-cols-12 lg:gap-10`): Centered `max-w-6xl` responsive stage.
  - **Left Column**: Dynamic Greeting + Living AWEN Mascot Visual Stage with Speech Cloud + Simplified Wellness Card.
  - **Right Column**: Exactly 3 Health Cards (Heart Rate, SpO₂, Temperature) + Evening Check-in.
- Mobile Viewport: Full-width native mobile app experience with safe area insets and `pb-32` bottom padding to protect content from the sticky bottom navigation bar.

### 8. Live Production Deployment
- **GitHub Repository**: [https://github.com/diya-1720/AWEN](https://github.com/diya-1720/AWEN)
- **Live Vercel Web App**: [https://awen-silk.vercel.app/](https://awen-silk.vercel.app/)

---

## 🟡 WHAT IS CURRENTLY SIMULATED (Demo Mode)

1. **Physiological Telemetry Stream** ([telemetryStream.js](file:///c:/Users/Anurag%20Singh/Desktop/AWEN/src/services/telemetryStream.js)):
   - When hardware is not connected, the application runs in **Demo Mode** generating simulated heart rate, SpO₂, and skin temperature values.
   - Readouts are labeled with a **Demo Stream** indicator.
   - Simulated data is persisted to Supabase associated with the authenticated user ID (`data_source: 'demo'`).

2. **Physical ESP32 Sensor Hardware (Future Integration)**:
   - ESP32 micro-controller firmware sketch is located in `backend/esp32_firmware/esp32_max30102.ino`.
   - FastAPI backend service is in `backend/main.py` and `backend/ml_engine.py`.
   - The data model is designed to seamlessly swap simulated readings for physical telemetry (`data_source: 'esp32'`) via REST or Web Serial API.

---

## 🔴 STRICT GUIDELINES & WHAT NOT TO DO

1. **NO Gamification**: Never add coins, XP, badges, streaks, leaderboards, or competitive elements. AWEN is an emotionally intelligent wellness companion, not a game.
2. **NO Medical Jargon**:
   - Use *"Your Body Pattern"* instead of *"Physiological Signature"*.
   - Use *"Your Weekly Pattern"* instead of *"Baseline Rhythm"*.
   - Use *"Your Quiet Hours"* instead of *"Circadian Dip"*.
   - Use *"Readings"* instead of *"Metrics"*.
3. **NO Direct Immediate Navigation on Mascot Tap**: Tapping AWEN on the Today screen must trigger mascot animation and speech cloud display. Do NOT navigate directly to the Chat tab on tap.
4. **NO Alarmist Medical Diagnoses**: Never say "You are stressed" or "You have a health issue". Frame observations in calm, non-diagnostic terms (e.g. *"Your heart rate is slightly higher, but you've also been active. I'll give your body time to settle."*).
5. **Preserve Full Viewport Background**: The background and atmosphere must extend to `100vw` and `100dvh`. Content inside must remain constrained to readable max-width containers (`max-w-6xl` on Desktop). Do NOT make content stretch indefinitely to 100% width on ultra-wide screens.

---

## 📂 Key Codebase File Map

```
AWEN/
├── src/
│   ├── components/
│   │   ├── AwenSpirit.jsx          # 60 FPS Living Vector Mascot with state color reactivity
│   │   ├── AwenSpeechCloud.jsx     # Organic glass speech bubble above AWEN
│   │   ├── TodayScreen.jsx         # Today screen with 2-column desktop grid & health cards
│   │   ├── JourneyScreen.jsx       # Journey tab with weekly SVG chart & reflections
│   │   ├── TalkScreen.jsx          # AI Chat companion tab with conversation memory
│   │   ├── YouScreen.jsx           # Profile tab with Observation Mode toggle & settings
│   │   ├── AuthModal.jsx           # Supabase Auth modal with Google OAuth & Email login
│   │   ├── ObservationModal.jsx    # First-time Observation Mode onboarding modal
│   │   └── BottomNav.jsx           # Mobile 4-tab bottom navigation bar
│   ├── services/
│   │   ├── stateEngine.js          # Centralized AWEN State Engine (5 states & color themes)
│   │   ├── speechEngine.js         # 7-Window Time-Aware Personality Engine
│   │   ├── aiEngine.js             # Conversational AI engine enforcing persona & memory
│   │   ├── apiService.js           # Supabase REST API & persistent database client
│   │   ├── supabaseClient.js       # Fail-safe Supabase client initializer
│   │   └── telemetryStream.js      # Simulated telemetry stream & Web Serial connector
│   ├── App.jsx                     # Main router, auth state listener, and layout shell
│   └── index.css                   # Glassmorphism utilities, fonts, 100dvh full viewport base
├── backend/
│   ├── main.py                     # Python FastAPI microservice
│   ├── ml_engine.py                # Physiological baseline ML engine
│   └── esp32_firmware/             # ESP32 MAX30102 Arduino firmware sketch
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules (.env, node_modules, dist)
└── README.md                       # Main project documentation with Vercel live links
```
