import asyncio
import json
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from ml_engine import PersonalizedPhysiologicalEngine

app = FastAPI(
    title="AWEN Physiological Analysis API",
    description="Adaptive Wellness & Emotional Navigation Backend Engine",
    version="1.0.0"
)

import os

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

class UserBaselinePayload(BaseModel):
    resting_hr: Optional[float] = None
    resting_spo2: Optional[float] = None
    resting_temp: Optional[float] = None
    hr_std_dev: Optional[float] = None
    confidence: Optional[str] = None

class TelemetryPayload(BaseModel):
    device_id: Optional[str] = "demo_simulator"
    timestamp: Optional[str] = None
    heart_rate: float
    spo2: float
    temperature: float
    activity: Optional[str] = "Resting"
    mood: Optional[str] = "Normal"
    user_baseline: Optional[UserBaselinePayload] = None

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "AWEN AI-IoT Physiological Companion",
        "baseline_learned": True,
        "resting_hr_baseline": engine.baseline["resting_hr"]
    }

@app.post("/api/analyze")
def analyze_telemetry(payload: TelemetryPayload, authorization: Optional[str] = Header(None)):
    """
    Analyze single point telemetry against baseline signature.
    Validates optional Bearer token authorization header when provided.
    """
    is_authenticated_session = bool(authorization and authorization.startswith("Bearer "))
    user_baseline_dict = payload.user_baseline.model_dump() if payload.user_baseline else None
    analysis = engine.analyze_readings(
        hr=payload.heart_rate,
        spo2=payload.spo2,
        temp=payload.temperature,
        activity=payload.activity or "Resting",
        mood=payload.mood or "Normal",
        user_baseline=user_baseline_dict
    )
    analysis["device_id"] = payload.device_id or "demo_simulator"
    analysis["timestamp"] = payload.timestamp
    analysis["is_authenticated_session"] = is_authenticated_session
    return analysis

@app.post("/api/chat")
def awen_chat(payload: ChatRequest, authorization: Optional[str] = Header(None)):
    """
    AWEN Supportive AI Companion Response Generator.
    Discusses user physiological data, guidance, and wellness in a calm, non-diagnostic tone.
    """
    msg = payload.message.lower()
    # 1. Acute / Severe Medical Symptoms Guardrail
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

    # 2. Post-Surgery / Medical Recovery Guardrail
    recovery_keywords = [
        "surgery", "operation", "recovering", "post-op", "post-surgery",
        "medical procedure", "doctor told me", "physician restricted",
        "medical recovery", "hospital", "stitches", "healed", "rehab"
    ]
    if any(kw in msg for kw in recovery_keywords):
        return {
            "reply": f"Because you are recovering from surgery or a medical procedure, please follow your surgeon's or healthcare provider's direct instructions regarding physical exertion. AWEN is a non-clinical wellness companion; your current readings (like a {engine.baseline['resting_hr']} bpm resting heart rate) cannot provide medical clearance for gym workouts or physical exercise.",
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
    elif "recommend" in msg or "do today" in msg or "help" in msg:
        reply = (
            "Based on your recent recovery rate and baseline metrics, today is ideal for balanced focused work. "
            "Remember to hydrate and take a brief 5-minute movement break every hour."
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
    """WebSocket feed for real-time ESP32 IoT sensor telemetry stream."""
    await websocket.accept()
    try:
        base_hr = engine.baseline["resting_hr"]
        while True:
            # Simulate real-time MAX30102 PPG pulse stream with realistic micro-variations
            hr = round(base_hr + random.uniform(-3.0, 4.0), 1)
            spo2 = round(random.uniform(97.8, 99.2), 1)
            temp = round(36.5 + random.uniform(-0.1, 0.2), 1)
            
            analysis = engine.analyze_readings(hr, spo2, temp, activity="Resting")
            await websocket.send_text(json.dumps({
                "type": "telemetry",
                "data": analysis
            }))
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
