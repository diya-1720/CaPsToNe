import asyncio
import json
import os
import math
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Header, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any

from ml_engine import PersonalizedPhysiologicalEngine
import database

app = FastAPI(
    title="AWEN Physiological Analysis & SQLite API",
    description="Adaptive Wellness & Emotional Navigation Backend Engine powered by SQLite",
    version="2.1.0"
)

# Configure environment-aware CORS
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

# ----------------- Request / Response Models -----------------

class SignUpRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    device_id: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Invalid email address format.")
        return clean

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    device_id: Optional[str] = None
    timezone: Optional[str] = None

class ObservationModeRequest(BaseModel):
    enabled: bool

class BaselinePayload(BaseModel):
    resting_hr: float
    resting_spo2: Optional[float] = 98.6
    resting_temp: Optional[float] = 36.6
    hr_variance: Optional[float] = 4.8
    confidence: Optional[str] = "Learning"
    samples: Optional[int] = 0

class Vector3D(BaseModel):
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None

class SensorReadingPayload(BaseModel):
    device_id: Optional[str] = "AWEN_ESP32_01"
    heart_rate: Optional[float] = None
    spo2: Optional[float] = None
    temperature: Optional[float] = None
    accel: Optional[Vector3D] = None
    gyro: Optional[Vector3D] = None
    accel_x: Optional[float] = None
    accel_y: Optional[float] = None
    accel_z: Optional[float] = None
    gyro_x: Optional[float] = None
    gyro_y: Optional[float] = None
    gyro_z: Optional[float] = None
    accel_magnitude: Optional[float] = None
    alarm: Optional[str] = None
    status: Optional[str] = None
    activity_state: Optional[str] = "Resting"
    data_source: Optional[str] = "esp32"
    timestamp_ms: Optional[int] = None

class CheckinPayload(BaseModel):
    mood: str
    activity: Optional[str] = None
    notes: Optional[str] = ""

class ObservationPayload(BaseModel):
    message: str
    severity: Optional[str] = "info"
    type: Optional[str] = "physiological"
    reading_id: Optional[str] = None

class DeviceRegisterPayload(BaseModel):
    device_id: str
    device_name: Optional[str] = "AWEN ESP32 Unit"

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

class UserBaselinePayload(BaseModel):
    resting_hr: Optional[float] = None
    resting_spo2: Optional[float] = None
    resting_temp: Optional[float] = None
    hr_std_dev: Optional[float] = None
    confidence: Optional[str] = None

class TelemetryPayload(BaseModel):
    device_id: Optional[str] = "AWEN_ESP32_01"
    timestamp: Optional[str] = None
    heart_rate: Optional[float] = None
    spo2: Optional[float] = None
    temperature: Optional[float] = None
    activity: Optional[str] = "Resting"
    mood: Optional[str] = "Normal"
    user_baseline: Optional[UserBaselinePayload] = None

# ----------------- Real Authentication Middleware / Dependency -----------------

def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    Verify bearer session token in SQLite user_sessions table.
    Ensures strict tenant isolation. If token is invalid or expired, raises HTTP 401.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    user = database.verify_session(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or is invalid. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

# Optional authentication dependency for endpoints that can accept either authenticated session or device credentials
def get_optional_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return database.verify_session(parts[1])
    return None

# ----------------- System Root Endpoint -----------------

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "AWEN AI-IoT Physiological Companion",
        "database": "SQLite (awen.db)",
        "version": "2.1.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/health")
def read_health():
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.utcnow().isoformat()
    }

# ----------------- Real Authentication Endpoints -----------------

@app.post("/api/auth/signup", status_code=status.HTTP_201_CREATED)
def signup(req: SignUpRequest):
    """Register a new patient account in SQLite with PBKDF2 password hashing."""
    user = database.create_user(
        name=req.name,
        email=req.email,
        password=req.password,
        age=req.age,
        gender=req.gender,
        phone=req.phone,
        device_id=req.device_id
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    token = database.create_session(user["id"])
    return {
        "user": user,
        "token": token
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    """Authenticate patient using email & password verified with PBKDF2."""
    user = database.verify_user(req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again."
        )

    token = database.create_session(user["id"])
    return {
        "user": user,
        "token": token
    }

@app.post("/api/auth/logout")
def logout(authorization: Optional[str] = Header(None)):
    """Terminate and invalidate the active session token in SQLite."""
    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            database.delete_session(parts[1])
    return {"status": "ok", "message": "Successfully logged out."}

@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """Retrieve authenticated patient's profile directly from SQLite."""
    return current_user

# ----------------- Patient Profile Endpoints -----------------

@app.get("/api/user/profile")
def get_patient_profile(current_user: dict = Depends(get_current_user)):
    """Get full patient profile details."""
    devices = database.get_user_devices(current_user["id"])
    profile_data = dict(current_user)
    profile_data["devices"] = devices
    return profile_data

@app.put("/api/user/profile")
def update_patient_profile(
    req: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update patient profile fields (name, age, gender, phone, device_id, timezone).
    Persists changes to SQLite; survives refresh and logout/login.
    """
    updated_user = database.update_user_profile(
        user_id=current_user["id"],
        name=req.name,
        age=req.age,
        gender=req.gender,
        phone=req.phone,
        device_id=req.device_id,
        timezone=req.timezone
    )
    return {
        "status": "success",
        "message": "Patient profile updated successfully.",
        "user": updated_user
    }

# ----------------- Observation Mode, Baselines & Summary -----------------

@app.get("/api/user/summary")
def get_user_summary_endpoint(current_user: dict = Depends(get_current_user)):
    """
    Get comprehensive patient observation summary generated strictly from SQLite database records.
    Includes observation period, reading counts, min/max/avg vitals, and abnormal events.
    """
    summary = database.get_patient_summary(current_user["id"])
    if not summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient record not found.")
    return summary

@app.post("/api/user/observation-mode")
def set_observation_mode(
    req: ObservationModeRequest,
    current_user: dict = Depends(get_current_user)
):
    updated = database.update_user_observation_mode(current_user["id"], req.enabled)
    return {"status": "ok", "user": updated}

@app.get("/api/user/baseline")
def fetch_baseline(current_user: dict = Depends(get_current_user)):
    baseline = database.get_user_baseline(current_user["id"])
    if not baseline:
        return {
            "restingHr": 64.0,
            "restingSpo2": 98.6,
            "restingTemp": 36.6,
            "hrStdDev": 4.8,
            "confidence": "Learning",
            "samples": 0,
            "isDynamic": False
        }
    baseline["isDynamic"] = True
    return baseline

@app.post("/api/user/baseline")
def save_baseline(
    payload: BaselinePayload,
    current_user: dict = Depends(get_current_user)
):
    saved = database.upsert_user_baseline(
        user_id=current_user["id"],
        resting_hr=payload.resting_hr,
        resting_spo2=payload.resting_spo2 or 98.6,
        resting_temp=payload.resting_temp or 36.6,
        hr_variance=payload.hr_variance or 4.8,
        confidence=payload.confidence or "Learning",
        samples=payload.samples or 0
    )
    return saved

# ----------------- Real Sensor Telemetry API (Hardware Compatible) -----------------

@app.post("/api/readings", status_code=status.HTTP_201_CREATED)
def post_sensor_reading(
    payload: SensorReadingPayload,
    x_api_key: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None)
):
    """
    Ingest telemetry reading from ESP32 microcontroller or authenticated client.
    Supports complete AWEN hardware data contract:
    - heart_rate, spo2, temperature
    - 3-axis accelerometer (accel.x, accel.y, accel.z)
    - 3-axis gyroscope (gyro.x, gyro.y, gyro.z)
    - accel_magnitude
    - timestamp_ms & device_id
    Strict validation is enforced so malformed payloads return helpful JSON error messages.
    """
    # 1. Identify Target Patient / User
    user_id = None
    dev_id = (payload.device_id or "").strip()

    # Strategy A: Authenticated Bearer token session
    current_user = get_optional_current_user(authorization)
    if current_user:
        user_id = current_user["id"]
        if not dev_id:
            dev_id = current_user.get("device_id") or "AWEN_ESP32_01"

    # Strategy B: Device API Key in Header
    elif x_api_key:
        device_rec = database.get_device_by_api_key(x_api_key.strip())
        if device_rec:
            user_id = device_rec["user_id"]
            dev_id = device_rec["device_id"]
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid X-API-Key for sensor telemetry ingestion."
            )

    # Strategy C: Device ID lookup in registered devices table
    elif dev_id:
        device_rec = database.get_device_by_id(dev_id)
        if device_rec:
            user_id = device_rec["user_id"]
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Device '{dev_id}' is not associated with any patient account. Please link the device in Profile settings."
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid device_id, API key, or Bearer token is required to record sensor telemetry."
        )

    # 2. Extract nested or flat vector fields
    accel_x = payload.accel.x if payload.accel and payload.accel.x is not None else payload.accel_x
    accel_y = payload.accel.y if payload.accel and payload.accel.y is not None else payload.accel_y
    accel_z = payload.accel.z if payload.accel and payload.accel.z is not None else payload.accel_z

    gyro_x = payload.gyro.x if payload.gyro and payload.gyro.x is not None else payload.gyro_x
    gyro_y = payload.gyro.y if payload.gyro and payload.gyro.y is not None else payload.gyro_y
    gyro_z = payload.gyro.z if payload.gyro and payload.gyro.z is not None else payload.gyro_z

    # 3. Numeric Validation (Prevents malformed data from corrupting database)
    hr = payload.heart_rate
    if hr is not None:
        try:
            hr = float(hr)
            if hr < 20.0 or hr > 250.0:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Heart rate value must be between 20 and 250 BPM.")
        except ValueError:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid heart rate format; numeric value expected.")

    spo2_val = payload.spo2
    if spo2_val is not None:
        try:
            spo2_val = float(spo2_val)
            if spo2_val < 50.0 or spo2_val > 100.0:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="SpO2 value must be between 50% and 100%.")
        except ValueError:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid SpO2 format; numeric value expected.")

    temp_val = payload.temperature
    if temp_val is not None:
        try:
            temp_val = float(temp_val)
            if temp_val < 25.0 or temp_val > 45.0:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Skin temperature must be between 25.0°C and 45.0°C.")
        except ValueError:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid temperature format; numeric value expected.")

    # 4. Insert into SQLite
    saved_reading = database.insert_sensor_reading(
        user_id=user_id,
        device_id=dev_id,
        heart_rate=hr,
        spo2=spo2_val,
        temperature=temp_val,
        accel_x=accel_x,
        accel_y=accel_y,
        accel_z=accel_z,
        gyro_x=gyro_x,
        gyro_y=gyro_y,
        gyro_z=gyro_z,
        accel_magnitude=payload.accel_magnitude,
        alarm=payload.alarm,
        status=payload.status,
        activity_state=payload.activity_state or "Resting",
        data_source=payload.data_source or "esp32",
        timestamp_ms=payload.timestamp_ms
    )

    return {
        "status": "success",
        "message": "Sensor reading recorded successfully.",
        "reading": saved_reading
    }

@app.get("/api/readings/latest")
def get_latest_sensor_reading(current_user: dict = Depends(get_current_user)):
    """
    Get the most recent sensor reading for the authenticated patient.
    If no readings exist, returns null with clear empty status.
    """
    latest = database.get_latest_reading(current_user["id"])
    if not latest:
        return {
            "status": "empty",
            "message": "No sensor data available yet.",
            "reading": None
        }
    return {
        "status": "success",
        "reading": latest
    }

@app.get("/api/readings/history")
def get_sensor_readings_history(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    from_time: Optional[str] = Query(None, alias="from"),
    to_time: Optional[str] = Query(None, alias="to"),
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieve historical sensor readings for the authenticated patient.
    Supports pagination and date/time range filtering.
    """
    readings = database.get_historical_readings(
        user_id=current_user["id"],
        limit=limit,
        offset=offset,
        from_time=from_time,
        to_time=to_time
    )
    return {
        "status": "success",
        "count": len(readings),
        "readings": readings
    }

@app.get("/api/readings")
def get_sensor_readings_alias(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    from_time: Optional[str] = Query(None, alias="from"),
    to_time: Optional[str] = Query(None, alias="to"),
    current_user: dict = Depends(get_current_user)
):
    """Alias for /api/readings/history with range filtering."""
    return get_sensor_readings_history(limit, offset, from_time, to_time, current_user)

@app.get("/api/history/weekly")
def get_weekly_history_endpoint(current_user: dict = Depends(get_current_user)):
    """
    Calculates 7-day daily resting average metrics from real sensor readings in SQLite.
    If no readings are recorded for a day, averageHeartRate is null.
    """
    weekly_rows = database.get_weekly_history(current_user["id"])
    return weekly_rows

# ----------------- Checkins Endpoints -----------------

@app.post("/api/user/checkins", status_code=status.HTTP_201_CREATED)
def post_checkin(
    payload: CheckinPayload,
    current_user: dict = Depends(get_current_user)
):
    saved = database.insert_checkin(
        user_id=current_user["id"],
        mood=payload.mood,
        activity_context=payload.activity or "",
        notes=payload.notes or ""
    )
    return saved

@app.get("/api/user/checkins")
def get_checkins_list(
    limit: int = Query(15, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    return database.get_checkins(current_user["id"], limit=limit)

# ----------------- Observations & Alerts Endpoints -----------------

@app.get("/api/observations")
def get_patient_observations(
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get persistent observations & alerts for the authenticated patient."""
    obs = database.get_observations(current_user["id"], limit=limit)
    return {
        "status": "success",
        "observations": obs
    }

@app.post("/api/observations", status_code=status.HTTP_201_CREATED)
def create_patient_observation(
    payload: ObservationPayload,
    current_user: dict = Depends(get_current_user)
):
    obs = database.insert_observation(
        user_id=current_user["id"],
        message=payload.message,
        severity=payload.severity or "info",
        obs_type=payload.type or "physiological",
        reading_id=payload.reading_id
    )
    return obs

# ----------------- Device Management Endpoints -----------------

@app.get("/api/devices")
def get_devices(current_user: dict = Depends(get_current_user)):
    """Get all devices linked to current patient."""
    return database.get_user_devices(current_user["id"])

@app.post("/api/devices", status_code=status.HTTP_201_CREATED)
def register_device_endpoint(
    payload: DeviceRegisterPayload,
    current_user: dict = Depends(get_current_user)
):
    """Link a new ESP32 device ID to current patient."""
    device = database.register_device(
        user_id=current_user["id"],
        device_id=payload.device_id,
        device_name=payload.device_name or "AWEN ESP32 Unit"
    )
    return device

# ----------------- Baseline ML Analysis -----------------

@app.post("/api/analyze")
def analyze_telemetry(
    payload: TelemetryPayload,
    authorization: Optional[str] = Header(None)
):
    """
    Analyze telemetry point against personal baseline signature.
    Strictly non-diagnostic non-alarmist evaluation.
    """
    user = get_optional_current_user(authorization)
    is_authenticated = user is not None

    user_baseline_dict = None
    if payload.user_baseline:
        user_baseline_dict = payload.user_baseline.model_dump()
    elif user:
        user_baseline_dict = database.get_user_baseline(user["id"])

    # If no heart rate reading is available (sensor disconnected / standby), return non-diagnostic waiting status
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
    analysis["device_id"] = payload.device_id or "AWEN_ESP32_01"
    analysis["timestamp"] = payload.timestamp or datetime.utcnow().isoformat()
    analysis["is_authenticated_session"] = is_authenticated
    return analysis

# ----------------- Supportive Companion Chat -----------------

@app.post("/api/chat")
def awen_chat(
    payload: ChatRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """AWEN Supportive Companion Response Generator with acute medical safety guardrails."""
    msg = payload.message.lower()

    # 1. Acute Medical Safety Guardrail
    symptom_keywords = [
        "chest pain", "pain in chest", "shortness of breath", "difficulty breathing",
        "trouble breathing", "fainting", "passed out", "blackout", "severe pain",
        "severe dizziness", "alarming symptom", "breathless", "seizure", "unconscious"
    ]
    if any(kw in msg for kw in symptom_keywords):
        return {
            "reply": "If you are experiencing chest pain, difficulty breathing, fainting, or severe dizziness, please seek immediate real-world emergency medical attention. AWEN is a non-clinical wellness companion and cannot diagnose medical emergencies.",
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
            "reply": "Because you are recovering from surgery or a clinical procedure, please follow your surgeon's direct instructions regarding physical exertion. AWEN cannot provide clinical clearance.",
            "tone": "medical_override",
            "confidence": 99
        }

    user_name = current_user.get("name", "").split()[0] if current_user and current_user.get("name") else "there"

    if "stress" in msg or "anxious" in msg or "elevated" in msg:
        reply = (
            f"Hello {user_name}. I notice you're asking about elevated readings. "
            "Rather than stress, temporary heart rate lifts often reflect natural physical activity, ambient temperature, or cognitive focus. "
            "Would you like to try a short 2-minute breathing sequence?"
        )
    elif "baseline" in msg or "pattern" in msg:
        reply = (
            f"Your personal physiological pattern is compared against your own learned resting signature in local SQLite, "
            "rather than generic thresholds. Routine daily actions like climbing stairs are contextually recognized."
        )
    elif "hardware" in msg or "sensor" in msg or "esp32" in msg:
        reply = (
            "To stream real-time physiological data, connect your ESP32 MAX30102 sensor via Web Serial in Chrome or Edge, "
            "or have your hardware post telemetry packets directly to POST /api/readings."
        )
    else:
        reply = (
            f"I'm here with you, {user_name}. My role is observing your natural body pattern over time. "
            "Feel free to check your real-time overview or review your weekly journey."
        )

    # Save to conversations table if user is logged in
    if current_user:
        try:
            database.insert_conversation(
                user_id=current_user["id"],
                user_message=payload.message,
                awen_response=reply,
                topic="wellness"
            )
        except Exception:
            pass

    return {
        "reply": reply,
        "tone": "supportive",
        "confidence": 95
    }

# ----------------- WebSocket Live Telemetry -----------------

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await asyncio.sleep(5.0)
    except WebSocketDisconnect:
        pass
