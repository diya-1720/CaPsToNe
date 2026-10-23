import asyncio
import json
import os
import sys
import math
import time
import urllib.request
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import logging
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Header, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any

from dotenv import load_dotenv

# Load environment variables from backend/.env and root .env
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

logger = logging.getLogger("awen_api")

try:
    from google import genai
    from google.genai import types
    from google.genai.errors import APIError
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.warning("google-genai library not installed; will return AI unavailable status.")

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
    created_at_ist: Optional[str] = None
    hardware_connected_at: Optional[str] = None
    timestamp_ist: Optional[str] = None

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

class ESP32ConnectionTestRequest(BaseModel):
    url: str = Field(..., description="ESP32 Wi-Fi IP or telemetry endpoint")
    timeout: Optional[float] = Field(2.5, description="Timeout in seconds")

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, Any]]] = None

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

class StressEvaluationPayload(BaseModel):
    heart_rate: Optional[float] = None
    temperature: Optional[float] = None
    accel_magnitude: Optional[float] = 1.0
    activity_state: Optional[str] = "Resting"
    is_moving: Optional[bool] = False
    user_baseline: Optional[UserBaselinePayload] = None
    checkin_mood: Optional[str] = None
    checkin_notes: Optional[str] = None

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

@app.get("/api/esp32/telemetry")
def proxy_esp32_telemetry(ip: Optional[str] = Query(None)):
    """
    Proxies telemetry from the local ESP32 Wi-Fi microcontroller.
    Seamlessly bridges browser requests to the local hardware network without CORS or PNA issues.
    """
    target = ip or os.getenv("ESP32_BASE_URL", "http://172.17.106.254")
    if not target.startswith("http://") and not target.startswith("https://"):
        target = f"http://{target}"
    target = target.rstrip("/")
    # Probe /api/telemetry first, fallback to / (root) for compatibility
    endpoints = [f"{target}/api/telemetry", f"{target}/"]
    last_err = None

    for url in endpoints:
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "AWEN-FastAPI-Bridge/1.0",
                    "Accept": "application/json"
                }
            )
            with urllib.request.urlopen(req, timeout=1.5) as response:
                data = json.loads(response.read().decode())
                if isinstance(data, dict):
                    data["connected"] = True
                    data["status"] = "streaming"
                    data.setdefault("ip", target)
                return data
        except urllib.error.HTTPError as he:
            last_err = str(he)
            if he.code == 404:
                continue
            break
        except Exception as e:
            last_err = str(e)
            break

    return {
        "connected": False,
        "status": "unreachable",
        "detail": f"Unable to reach ESP32 at {target}: {last_err}",
        "ip": target
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

# ----------------- ESP32 Wi-Fi Telemetry Proxy & Connectivity Suite -----------------

def fetch_esp32_telemetry_sync(target_url: str, timeout: float = 2.5) -> dict:
    """
    Synchronously probes and fetches telemetry from an ESP32 Wi-Fi endpoint or candidate path.
    Supports raw IPs, custom ports, full URLs, and automatic candidate path fallback.
    """
    url = (target_url or "").strip()
    if not url:
        return {"connected": False, "status": "unreachable", "detail": "Empty URL provided"}

    if not url.startswith("http://") and not url.startswith("https://"):
        url = "http://" + url

    try:
        parsed = urllib.parse.urlparse(url)
    except Exception as e:
        return {"connected": False, "status": "unreachable", "detail": f"Malformed URL: {e}"}

    base = f"{parsed.scheme}://{parsed.netloc}"
    path = parsed.path.rstrip("/")

    candidates = []
    # 1. Exact user-provided path if present
    if path and path != "":
        candidates.append(f"{base}{path}")

    # 2. Standard ESP32 AWEN endpoints
    candidates.append(f"{base}/api/telemetry")
    candidates.append(f"{base}/telemetry")
    candidates.append(f"{base}/data")
    candidates.append(f"{base}/")

    seen = set()
    unique_candidates = [c for c in candidates if not (c in seen or seen.add(c))]

    last_err = None
    start_time = time.time()

    for candidate_url in unique_candidates:
        try:
            req = urllib.request.Request(
                candidate_url,
                headers={
                    "User-Agent": "AWEN-FastAPI-Bridge/2.1",
                    "Accept": "application/json"
                }
            )
            with urllib.request.urlopen(req, timeout=timeout) as response:
                if response.status == 200:
                    raw_data = response.read().decode("utf-8")
                    data = json.loads(raw_data)
                    latency = round((time.time() - start_time) * 1000, 1)
                    if isinstance(data, dict):
                        data["connected"] = True
                        data["status"] = "streaming"
                        data["_resolved_endpoint"] = candidate_url
                        data["_latency_ms"] = latency
                        return data
        except Exception as e:
            last_err = str(e)
            continue

    return {
        "connected": False,
        "status": "unreachable",
        "detail": f"Could not reach ESP32 at {url}. (Last probe error: {last_err})"
    }


@app.get("/api/esp32/telemetry")
async def get_esp32_telemetry_proxy(
    ip: Optional[str] = Query(None),
    url: Optional[str] = Query(None)
):
    """
    FastAPI backend proxy for ESP32 Wi-Fi telemetry.
    Bypasses browser Private Network Access (PNA) and CORS restrictions by querying ESP32 natively.
    """
    target = url or ip or os.getenv("ESP32_BASE_URL") or "http://172.17.106.254"
    result = await asyncio.to_thread(fetch_esp32_telemetry_sync, target, 2.5)
    return result


@app.post("/api/esp32/test-connection")
async def test_esp32_connection(req: ESP32ConnectionTestRequest):
    """
    Tests connectivity to an ESP32 Wi-Fi telemetry link and returns diagnostic metrics.
    """
    timeout = req.timeout or 2.5
    result = await asyncio.to_thread(fetch_esp32_telemetry_sync, req.url, timeout)

    if result.get("connected"):
        bpm = result.get("bpm") or result.get("heart_rate") or result.get("heartRate")
        spo2 = result.get("spo2")
        temp = result.get("temp") or result.get("temperature")
        finger = result.get("finger") or result.get("finger_detected") or (bpm is not None and bpm > 0)
        latency = result.get("_latency_ms", 30)

        return {
            "success": True,
            "status": "connected",
            "endpoint": result.get("_resolved_endpoint") or req.url,
            "latency_ms": latency,
            "device_id": result.get("device_id", "AWEN_ESP32_01"),
            "data": result,
            "summary": {
                "bpm": bpm,
                "spo2": spo2,
                "temp": temp,
                "finger": finger
            },
            "message": f"Successfully connected to ESP32! Latency: {latency}ms"
        }
    else:
        return {
            "success": False,
            "status": "unreachable",
            "endpoint": req.url,
            "error": result.get("detail", "Connection timed out or failed."),
            "message": f"Unable to reach ESP32 at {req.url}. Please verify that the ESP32 is powered on and connected to the same Wi-Fi network."
        }


@app.get("/api/esp32/demo-telemetry")
def get_esp32_demo_telemetry():
    """
    Live simulated Wi-Fi telemetry endpoint for testing and demonstrating Wi-Fi connectivity.
    """
    now_sec = time.time()
    bpm = round(72.0 + 3.0 * math.sin(now_sec / 15.0), 1)
    spo2 = round(98.4 + 0.4 * math.cos(now_sec / 20.0), 1)
    temp = 36.6
    accel_mag = 1.00
    return {
        "device_id": "AWEN_ESP32_WIFI_DEMO",
        "connected": True,
        "status": "streaming",
        "bpm": bpm,
        "heart_rate": bpm,
        "spo2": spo2,
        "temp": temp,
        "temperature": temp,
        "accel": {"x": 0.02, "y": -0.01, "z": 0.99},
        "accel_magnitude": accel_mag,
        "moving": False,
        "finger": True,
        "finger_detected": True,
        "abnormal": False,
        "ip": "127.0.0.1",
        "timestamp_ms": int(now_sec * 1000)
    }


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
        timestamp_ms=payload.timestamp_ms,
        created_at_ist=payload.created_at_ist or payload.timestamp_ist,
        hardware_connected_at=payload.hardware_connected_at
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
    limit: int = Query(20, ge=1, le=500),
    severity: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get persistent observations & alerts for the authenticated patient."""
    obs = database.get_observations(current_user["id"], limit=limit, severity=severity)
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
            },
            "stress_indicator": None
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

# ----------------- Real Stress Detection API -----------------

@app.get("/api/stress/current")
def get_current_stress_indicator(current_user: dict = Depends(get_current_user)):
    """
    Calculates the real stress indicator for the authenticated patient based on:
    - Their latest stored sensor reading in SQLite
    - Their personal baseline in user_baselines
    - Their latest subjective check-in in user_checkins
    """
    user_id = current_user["id"]
    latest_reading = database.get_latest_reading(user_id)
    baseline = database.get_user_baseline(user_id)
    checkins = database.get_checkins(user_id, limit=1)
    latest_checkin = checkins[0] if checkins else None

    if not latest_reading or latest_reading.get("bpm") is None:
        return {
            "status": "STANDBY",
            "score": None,
            "explanation": "No sensor readings recorded yet. Connect your ESP32 or record readings to evaluate stress pattern.",
            "contributing_signals": [],
            "is_exertion_filtered": False,
            "data_source": "none",
            "reading": None
        }

    stress = engine.calculate_stress_indicator(
        hr=latest_reading.get("bpm"),
        temp=latest_reading.get("temperature"),
        accel_magnitude=latest_reading.get("accel_magnitude"),
        activity=latest_reading.get("activity_state") or "Resting",
        is_moving=False,
        user_baseline=baseline,
        checkin_mood=latest_checkin.get("mood") if latest_checkin else None,
        checkin_notes=latest_checkin.get("notes") if latest_checkin else None
    )
    stress["data_source"] = "sqlite"
    stress["reading_timestamp"] = latest_reading.get("created_at")
    stress["device_id"] = latest_reading.get("device_id")
    return stress

@app.post("/api/stress/evaluate")
def evaluate_stress_indicator(
    payload: StressEvaluationPayload,
    authorization: Optional[str] = Header(None)
):
    """
    Evaluates stress indicator for incoming reading payload.
    Uses authenticated user baseline if available and not overridden in payload.
    """
    user = get_optional_current_user(authorization)
    user_baseline_dict = None
    if payload.user_baseline:
        user_baseline_dict = payload.user_baseline.model_dump()
    elif user:
        user_baseline_dict = database.get_user_baseline(user["id"])

    mood = payload.checkin_mood
    notes = payload.checkin_notes
    if not mood and user:
        chks = database.get_checkins(user["id"], limit=1)
        if chks:
            mood = chks[0].get("mood")
            notes = chks[0].get("notes")

    res = engine.calculate_stress_indicator(
        hr=payload.heart_rate,
        temp=payload.temperature,
        accel_magnitude=payload.accel_magnitude,
        activity=payload.activity_state or "Resting",
        is_moving=bool(payload.is_moving),
        user_baseline=user_baseline_dict,
        checkin_mood=mood,
        checkin_notes=notes
    )
    return res


# ----------------- Supportive Companion Chat -----------------

@app.post("/api/chat")
def awen_chat(
    payload: ChatRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """AWEN Supportive Companion Response Generator powered by Google Gemini with acute safety guardrails."""
    msg = payload.message.strip()
    lower_msg = msg.lower()

    # 1. Acute Medical Safety Guardrail
    symptom_keywords = [
        "chest pain", "pain in chest", "shortness of breath", "difficulty breathing",
        "trouble breathing", "fainting", "passed out", "blackout", "severe pain",
        "severe dizziness", "alarming symptom", "breathless", "seizure", "unconscious"
    ]
    if any(kw in lower_msg for kw in symptom_keywords):
        safety_reply = (
            "If you are experiencing chest pain, difficulty breathing, fainting, or severe dizziness, "
            "please seek immediate real-world emergency medical attention or contact emergency services. "
            "AWEN is a non-clinical wellness companion and cannot diagnose medical emergencies."
        )
        if current_user:
            try:
                database.insert_conversation(
                    user_id=current_user["id"],
                    user_message=payload.message,
                    awen_response=safety_reply,
                    topic="safety"
                )
            except Exception:
                pass
        return {
            "reply": safety_reply,
            "tone": "urgent_safety",
            "source": "safety_guardrail"
        }

    # 2. Medical Recovery Guardrail
    recovery_keywords = [
        "surgery", "operation", "recovering", "post-op", "post-surgery",
        "medical procedure", "doctor told me", "physician restricted",
        "medical recovery", "hospital", "stitches", "healed", "rehab"
    ]
    if any(kw in lower_msg for kw in recovery_keywords):
        recovery_reply = (
            "Because you are recovering from surgery or a clinical procedure, please follow your surgeon's "
            "or healthcare provider's direct instructions regarding physical exertion. AWEN cannot provide clinical clearance."
        )
        if current_user:
            try:
                database.insert_conversation(
                    user_id=current_user["id"],
                    user_message=payload.message,
                    awen_response=recovery_reply,
                    topic="medical_recovery"
                )
            except Exception:
                pass
        return {
            "reply": recovery_reply,
            "tone": "medical_override",
            "source": "safety_guardrail"
        }

    # 3. Verify Gemini API Key & SDK Availability
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or not GENAI_AVAILABLE:
        logger.warning("Gemini API key missing or google-genai library unavailable.")
        return {
            "reply": "AI service temporarily unavailable. Please verify backend API key configuration.",
            "tone": "unavailable",
            "status": "unavailable"
        }

    # 4. Context Extraction & Telemetry Grounding
    user_name = "there"
    if current_user and current_user.get("name"):
        user_name = current_user["name"].split()[0]
    elif payload.context and isinstance(payload.context.get("user"), dict) and payload.context["user"].get("name"):
        user_name = payload.context["user"]["name"].split()[0]

    # Resolve telemetry: prefer context telemetry, fallback to database latest reading
    telemetry_data = None
    if payload.context and isinstance(payload.context.get("telemetry"), dict):
        telemetry_data = payload.context["telemetry"]
    elif current_user:
        try:
            latest_res = database.get_latest_reading(current_user["id"])
            if latest_res:
                telemetry_data = latest_res
        except Exception:
            pass

    # Build grounded telemetry status
    telemetry_lines = []
    if telemetry_data:
        hr = telemetry_data.get("heartRate") or telemetry_data.get("heart_rate")
        spo2 = telemetry_data.get("spo2")
        temp = telemetry_data.get("temperature")
        act = telemetry_data.get("activity") or telemetry_data.get("activity_state") or "Resting"
        src = telemetry_data.get("data_source") or ("esp32" if telemetry_data.get("isHardware") else "demo_stream")

        if hr is not None:
            telemetry_lines.append(f"  - Heart Rate: {hr} BPM")
        else:
            telemetry_lines.append("  - Heart Rate: UNAVAILABLE (sensor not measuring)")

        if spo2 is not None:
            telemetry_lines.append(f"  - Blood Oxygen (SpO2): {spo2}%")
        else:
            telemetry_lines.append("  - Blood Oxygen (SpO2): UNAVAILABLE")

        if temp is not None:
            telemetry_lines.append(f"  - Skin Temperature: {temp}\u00b0C")
        else:
            telemetry_lines.append("  - Skin Temperature: UNAVAILABLE")

        telemetry_lines.append(f"  - Physical Activity Context: {act}")
        telemetry_lines.append(f"  - Data Source: {src}")
    else:
        telemetry_lines.append("  - All live sensor telemetry is currently UNAVAILABLE (no active sensor readings).")

    # Resolve baseline
    baseline_data = None
    if payload.context and isinstance(payload.context.get("baseline"), dict):
        baseline_data = payload.context["baseline"]
    elif current_user:
        try:
            baseline_data = database.get_user_baseline(current_user["id"])
        except Exception:
            pass

    baseline_lines = []
    if baseline_data:
        b_hr = baseline_data.get("restingHr") or baseline_data.get("resting_hr")
        b_var = baseline_data.get("hrStdDev") or baseline_data.get("hr_variance") or baseline_data.get("hr_std_dev")
        b_conf = baseline_data.get("confidence") or "Stable baseline"
        if b_hr is not None:
            baseline_lines.append(f"  - Typical Resting Heart Rate: {b_hr} BPM")
        if b_var is not None:
            baseline_lines.append(f"  - Usual Resting Variation: \u00b1{b_var} BPM")
        baseline_lines.append(f"  - Baseline Calibration Status: {b_conf}")
    else:
        baseline_lines.append("  - Personal baseline is currently calibrating in Observation Mode.")

    # Resolve recent observations / alerts
    recent_obs_lines = []
    if current_user:
        try:
            obs_list = database.get_observations(current_user["id"], limit=3)
            for o in obs_list:
                recent_obs_lines.append(f"  - [{o.get('severity', 'info').upper()}]: {o.get('message', '')}")
        except Exception:
            pass
    if not recent_obs_lines:
        recent_obs_lines.append("  - No abnormal alerts or elevated observations recorded.")

    telemetry_summary = "\n".join(telemetry_lines)
    baseline_summary = "\n".join(baseline_lines)
    observations_summary = "\n".join(recent_obs_lines)

    system_instruction = f"""You are AWEN (Adaptive Wellness & Emotional Navigation), an emotionally intelligent, friendly, simple, and supportive personal wellness companion.
You are designed for students, corporate employees, working professionals, and general everyday users.

Core Persona & Rules:
1. Tone: Warm, empathetic, calm, and supportive. Keep language clean, natural, and accessible.
2. Non-Clinical: You are NOT a doctor or clinical diagnostic tool. NEVER diagnose diseases or clinical conditions. NEVER prescribe medications or treatments.
3. Medical Concerns: For everyday wellness questions (fatigue, caffeine, hydration, exam anxiety, headaches, sleep), provide practical, gentle wellness guidance (e.g. taking a 2-minute pause, drinking a glass of water, screen breaks, gentle stretching). When appropriate, recommend consulting a qualified healthcare professional.
4. AWEN Baseline Philosophy: Always interpret the user's readings in relation to their OWN personal baseline and current physical movement (e.g. walking or climbing stairs naturally elevates heart rate), rather than generic, rigid thresholds.
5. Non-Jargon Vocabulary:
   - Use 'Your Body Pattern' instead of 'Physiological Signature'
   - Use 'Your Weekly Pattern' instead of 'Baseline Rhythm'
   - Use 'Your Quiet Hours' instead of 'Circadian Dip'
   - Use 'Readings' instead of 'Metrics'

CRITICAL DATA GROUNDING RULES:
- ONLY reference health readings that are explicitly listed below as AVAILABLE.
- NEVER invent, simulate, or hallucinate sensor readings, vital signs, or health events that are not listed.
- If a reading or metric is marked as UNAVAILABLE or missing, clearly state that it is not currently available or connected if asked. Do NOT invent numbers.
- Keep responses concise, warm, and natural (typically 2 to 4 sentences unless the user explicitly requests an in-depth explanation).

CURRENT USER CONTEXT:
- User Name: {user_name}
- Available Live Telemetry:
{telemetry_summary}
- Personal Baseline Corridor:
{baseline_summary}
- Recent Observations & Alerts:
{observations_summary}
"""

    # 5. Build multi-turn conversational contents
    contents = []
    if payload.history and isinstance(payload.history, list):
        for turn in payload.history[-8:]:
            r = turn.get("role", "")
            if r in ["awen", "assistant", "model"]:
                role = "model"
            elif r == "user":
                role = "user"
            else:
                continue
            t = turn.get("content") or turn.get("text") or ""
            if t.strip():
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=t.strip())]))

    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=msg)]))

    # 6. Call Google GenAI SDK (with resilient model candidates)
    candidate_models = ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"]
    client = genai.Client(api_key=api_key)
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.7,
        max_output_tokens=600
    )

    last_error = None
    for model_name in candidate_models:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config
            )
            reply_text = response.text.strip() if response and response.text else "I'm here with you. How can I support your wellness today?"

            if current_user:
                try:
                    database.insert_conversation(
                        user_id=current_user["id"],
                        user_message=payload.message,
                        awen_response=reply_text,
                        topic="wellness"
                    )
                except Exception:
                    pass

            return {
                "reply": reply_text,
                "tone": "supportive",
                "source": "gemini",
                "model": model_name
            }
        except Exception as e:
            last_error = e
            logger.warning(f"Gemini model {model_name} attempt failed: {e}. Trying fallback if available.")

    logger.error(f"All Gemini models failed: {last_error}", exc_info=True)
    return {
        "reply": "AI service temporarily unavailable.",
        "tone": "unavailable",
        "status": "unavailable"
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
