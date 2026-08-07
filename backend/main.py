import asyncio
import json
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from ml_engine import PersonalizedPhysiologicalEngine

app = FastAPI(
    title="AWEN Physiological Analysis API",
    description="Adaptive Wellness & Emotional Navigation Backend Engine",
    version="1.0.0"
)

# Enable CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = PersonalizedPhysiologicalEngine()

class TelemetryPayload(BaseModel):
    heart_rate: float
    spo2: float
    temperature: float
    activity: Optional[str] = "Resting"
    mood: Optional[str] = "Normal"

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
def analyze_telemetry(payload: TelemetryPayload):
    """Analyze single point telemetry against baseline signature."""
    analysis = engine.analyze_readings(
        hr=payload.heart_rate,
        spo2=payload.spo2,
        temp=payload.temperature,
        activity=payload.activity,
        mood=payload.mood
    )
    return analysis

@app.post("/api/chat")
def awen_chat(payload: ChatRequest):
    """
    AWEN Supportive AI Companion Response Generator.
    Discusses user physiological data, guidance, and wellness in a calm, non-diagnostic tone.
    """
    msg = payload.message.lower()
    
    if "stress" in msg or "anxious" in msg or "elevated" in msg:
        reply = (
            "I'm noticing subtle variations in your heart rate pattern today. "
            "Rather than stress, your readings often reflect non-exertional fatigue or cognitive load. "
            "Would you like to try a short 2-minute bio-feedback breathing sequence with me?"
        )
    elif "baseline" in msg or "learning" in msg:
        reply = (
            f"Your personal physiological baseline is established at a resting heart rate of {engine.baseline['resting_hr']} bpm "
            f"and an SpO₂ average of {engine.baseline['resting_spo2']}%. Because I compare your current metrics against your own body signature "
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
