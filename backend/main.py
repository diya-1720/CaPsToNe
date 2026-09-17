import asyncio
import json
import random
import os
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any

from ml_engine import PersonalizedPhysiologicalEngine
import database

app = FastAPI(
    title="AWEN Physiological Analysis & SQLite API",
    description="Adaptive Wellness & Emotional Navigation Backend Engine powered by SQLite",
    version="2.0.0"
)

# Configure environment-aware CORS for production & local development
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = PersonalizedPhysiologicalEngine()

# ----------------- Request Models -----------------

class SignUpRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ObservationModeRequest(BaseModel):
    enabled: bool

class BaselinePayload(BaseModel):
    resting_hr: float
    resting_spo2: Optional[float] = 98.6
    resting_temp: Optional[float] = 36.6
    hr_variance: Optional[float] = 4.8
    confidence: Optional[str] = "Learning"

class ReadingPayload(BaseModel):
    heart_rate: Optional[float] = None
    spo2: Optional[float] = None
    temperature: Optional[float] = None
    activity: Optional[str] = "Resting"
    data_source: Optional[str] = "esp32"

class CheckinPayload(BaseModel):
    mood: str
    activity: Optional[str] = None
    notes: Optional[str] = ""

class ConversationPayload(BaseModel):
    message: str
    response: str
    topic: Optional[str] = "general"

class UserBaselinePayload(BaseModel):
    resting_hr: Optional[float] = None
    resting_spo2: Optional[float] = None
    resting_temp: Optional[float] = None
    hr_std_dev: Optional[float] = None
    confidence: Optional[str] = None

class TelemetryPayload(BaseModel):
    device_id: Optional[str] = "esp32_max30102"
    timestamp: Optional[str] = None
    heart_rate: Optional[float] = None
    spo2: Optional[float] = None
    temperature: Optional[float] = None
    activity: Optional[str] = "Resting"
    mood: Optional[str] = "Normal"
    user_baseline: Optional[UserBaselinePayload] = None

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

# Helper to extract user_id from Authorization Header
def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        return "usr_local"
    # Header format: Bearer usr_xxx or Bearer token
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
        if token.startswith("usr_"):
            return token
        # Check if user with this id exists
        u = database.get_user_by_id(token)
        if u:
            return u["id"]
    return "usr_local"

# ----------------- System Endpoints -----------------

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "AWEN AI-IoT Physiological Companion",
        "database": "SQLite (awen.db)",
        "baseline_learned": True,
        "resting_hr_baseline": engine.baseline["resting_hr"]
    }

# ----------------- Auth Endpoints -----------------

@app.post("/api/auth/signup")
def signup(req: SignUpRequest):
    user = database.create_user(req.name, req.email, req.password)
    if not user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    return {
        "user": user,
        "token": user["id"]
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = database.verify_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password. Please try again.")
    return {
        "user": user,
        "token": user["id"]
    }

@app.get("/api/auth/me")
def get_me(authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    user = database.get_user_by_id(user_id)
    if not user:
        return {
            "id": user_id,
            "name": "Local User",
            "email": "user@awen.local",
            "observation_mode": True,
            "baseline_confidence": "Learning"
        }
    return user

# ----------------- Profile & Observation Mode -----------------

@app.post("/api/user/observation-mode")
def set_observation_mode(req: ObservationModeRequest, authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    updated = database.update_user_observation_mode(user_id, req.enabled)
    return {"status": "ok", "user": updated}

# ----------------- Baselines -----------------

@app.get("/api/user/baseline")
def fetch_baseline(authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    baseline = database.get_user_baseline(user_id)
    if not baseline:
        return {
            "restingHr": 64.0,
            "restingSpo2": 98.6,
            "restingTemp": 36.6,
            "hrStdDev": 4.8,
            "confidence": "Learning",
            "isDynamic": False
        }
    baseline["isDynamic"] = True
    return baseline

@app.post("/api/user/baseline")
def save_baseline(payload: BaselinePayload, authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    saved = database.upsert_user_baseline(
        user_id,
        payload.resting_hr,
        payload.resting_spo2 or 98.6,
        payload.resting_temp or 36.6,
        payload.hr_variance or 4.8,
        payload.confidence or "Learning"
    )
    return saved

# ----------------- Readings & History -----------------

@app.post("/api/user/readings")
def post_reading(payload: ReadingPayload, authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    if payload.heart_rate is None:
        raise HTTPException(status_code=400, detail="heart_rate is required for recording a reading.")
    saved = database.insert_reading(
        user_id,
        payload.heart_rate,
        payload.spo2 or 98.6,
        payload.temperature or 36.6,
        payload.activity or "Resting",
        payload.data_source or "esp32"
    )
    return saved

@app.get("/api/history/weekly")
def weekly_history(authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    return database.get_weekly_history(user_id)

# ----------------- Checkins -----------------

@app.post("/api/user/checkins")
def post_checkin(payload: CheckinPayload, authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    saved = database.insert_checkin(user_id, payload.mood, payload.activity or "", payload.notes or "")
    return saved

@app.get("/api/user/checkins")
def get_checkins_list(authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    return database.get_checkins(user_id)

# ----------------- Conversations -----------------

@app.post("/api/conversations")
def post_conversation(payload: ConversationPayload, authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    return database.insert_conversation(user_id, payload.message, payload.response, payload.topic or "general")

# ----------------- ML Analysis -----------------

@app.post("/api/analyze")
def analyze_telemetry(payload: TelemetryPayload, authorization: Optional[str] = Header(None)):
    """
    Analyze single point telemetry against personal baseline signature.
    """
    is_authenticated = bool(authorization and authorization.startswith("Bearer "))
    user_baseline_dict = payload.user_baseline.model_dump() if payload.user_baseline else None
    
    # If no heart rate is provided (hardware disconnected), return non-diagnostic waiting status
    if payload.heart_rate is None or payload.heart_rate <= 0:
        return {
            "status": "awaiting_hardware",
            "wellness_index": "Awaiting Signal",
            "stress_level": "normal",
            "confidence_score": 0,
            "device_id": payload.device_id or "disconnected",
            "timestamp": payload.timestamp or datetime.utcnow().isoformat(),
            "is_authenticated_session": is_authenticated,
            "baseline_comparison": {
                "resting_hr": user_baseline_dict.get("resting_hr", 64.0) if user_baseline_dict else 64.0,
                "hr_delta": 0,
                "is_activity_explained": False
            },
            "explainability": {
                "summary": "Hardware not connected. Connect your ESP32 sensor to begin live physiological comparison.",
                "factors": []
            }
        }

    analysis = engine.analyze_readings(
        hr=payload.heart_rate,
        spo2=payload.spo2 or 98.6,
        temp=payload.temperature or 36.6,
        activity=payload.activity or "Resting",
        mood=payload.mood or "Normal",
        user_baseline=user_baseline_dict
    )
    analysis["device_id"] = payload.device_id or "esp32_max30102"
    analysis["timestamp"] = payload.timestamp
    analysis["is_authenticated_session"] = is_authenticated
    return analysis

@app.post("/api/chat")
def awen_chat(payload: ChatRequest, authorization: Optional[str] = Header(None)):
    """
    AWEN Supportive AI Companion Response Generator.
    """
    msg = payload.message.lower()
    # 1. Acute Medical Guardrail
    symptom_keywords = [
        "chest pain", "pain in chest", "shortness of breath", "difficulty breathing",
        "trouble breathing", "fainting", "passed out", "blackout", "severe pain",
        "severe dizziness", "alarming symptom", "breathless", "seizure", "unconscious"
    ]
    if any(kw in msg for kw in symptom_keywords):
        return {
            "reply": "If you are experiencing chest pain, difficulty breathing, fainting, or severe pain, please seek immediate real-world medical attention or contact emergency services. AWEN is a non-clinical wellness companion and cannot diagnose medical symptoms or provide emergency medical clearance.",
            "tone": "urgent_safety",
            "confidence": 99
        }

    # 2. Medical Recovery Guardrail
    recovery_keywords = [
        "surgery", "operation", "recovering", "post-op", "post-surgery",
        "medical procedure", "doctor told me", "physician restricted",
        "medical recovery", "hospital", "stitches", "healed", "rehab"
    ]
    if any(kw in msg for kw in recovery_keywords):
        return {
            "reply": f"Because you are recovering from surgery or a medical procedure, please follow your surgeon's or healthcare provider's direct instructions regarding physical exertion. AWEN is a non-clinical wellness companion; current readings cannot provide medical clearance for strenuous exercise.",
            "tone": "medical_override",
            "confidence": 99
        }

    if "stress" in msg or "anxious" in msg or "elevated" in msg:
        reply = (
            "I'm noticing subtle variations in your heart rate pattern today. "
            "Rather than stress, your readings often reflect non-exertional fatigue or cognitive load. "
            "Would you like to try a short 2-minute bio-feedback breathing sequence with me?"
        )
    elif "baseline" in msg or "learning" in msg:
        reply = (
            f"Your personal physiological baseline is established at a resting heart rate of {engine.baseline['resting_hr']} bpm "
            f"and an SpO2 average of {engine.baseline['resting_spo2']}%. Because I compare your current metrics against your own body signature "
            "rather than generic thresholds, routine activities like climbing stairs won't trigger unnecessary alerts."
        )
    elif "hardware" in msg or "sensor" in msg or "connect" in msg:
        reply = (
            "To stream real-time physiological data, connect your ESP32 MAX30102 sensor via Web Serial in Chrome or Edge. "
            "Once connected, I will continuously observe your heart rate and SpO2 against your baseline."
        )
    else:
        reply = (
            "I'm here with you. My focus is keeping track of your natural physiological rhythm. "
            "Feel free to check your real-time Wellness Index or start a guided breathing session whenever you need to recalibrate."
        )
        
    return {
        "reply": reply,
        "tone": "supportive",
        "confidence": 95
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    """WebSocket feed for ESP32 IoT sensor telemetry stream."""
    await websocket.accept()
    try:
        while True:
            await asyncio.sleep(5.0)
    except WebSocketDisconnect:
        pass
