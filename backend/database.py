import sqlite3
import os
import uuid
import hashlib
import secrets
import math
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "awen.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

# ----------------- Password Hashing (PBKDF2-HMAC-SHA256) -----------------

def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with 100,000 iterations and a 16-byte random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}:{key.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored salt:hash or legacy sha256."""
    if not stored_hash:
        return False
    if ":" in stored_hash:
        salt, key_hex = stored_hash.split(":", 1)
        new_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
        return secrets.compare_digest(new_key.hex(), key_hex)
    # Legacy fallback for old plain sha256
    legacy_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return secrets.compare_digest(legacy_hash, stored_hash)

# ----------------- Database Initialization & Migration -----------------

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users / Patients Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            patient_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            phone TEXT,
            timezone TEXT DEFAULT 'Asia/Kolkata',
            observation_mode INTEGER DEFAULT 1,
            observation_day INTEGER DEFAULT 1,
            baseline_confidence TEXT DEFAULT 'Learning',
            device_id TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # Check for missing columns in existing users table (Migration helper)
    cursor.execute("PRAGMA table_info(users);")
    existing_cols = {row["name"] for row in cursor.fetchall()}
    if "patient_id" not in existing_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN patient_id TEXT;")
        # Backfill any existing user with a patient_id
        cursor.execute("SELECT id FROM users WHERE patient_id IS NULL")
        for u in cursor.fetchall():
            pat_id = f"PAT-{secrets.token_hex(3).upper()}"
            cursor.execute("UPDATE users SET patient_id = ? WHERE id = ?", (pat_id, u["id"]))
    if "age" not in existing_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN age INTEGER;")
    if "gender" not in existing_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN gender TEXT;")
    if "phone" not in existing_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN phone TEXT;")
    if "device_id" not in existing_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN device_id TEXT;")

    # User Sessions Table (Persistent SQLite token sessions)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            expires_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

    # Devices Association Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS devices (
            id TEXT PRIMARY KEY,
            device_id TEXT UNIQUE NOT NULL,
            user_id TEXT NOT NULL,
            api_key TEXT UNIQUE NOT NULL,
            device_name TEXT DEFAULT 'AWEN Sensor Unit',
            last_seen TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

    # Real Sensor Readings Table (Supports complete ESP32 hardware telemetry model)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sensor_readings (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            device_id TEXT NOT NULL,
            heart_rate REAL,
            spo2 REAL,
            temperature REAL,
            accel_x REAL,
            accel_y REAL,
            accel_z REAL,
            gyro_x REAL,
            gyro_y REAL,
            gyro_z REAL,
            accel_magnitude REAL,
            alarm TEXT,
            status TEXT,
            activity_state TEXT DEFAULT 'Resting',
            data_source TEXT DEFAULT 'esp32',
            timestamp_ms INTEGER,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_readings_user_time ON sensor_readings(user_id, created_at);")

    # Migrate any old data from physiological_readings to sensor_readings if needed
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='physiological_readings';")
    if cursor.fetchone():
        cursor.execute("""
            INSERT OR IGNORE INTO sensor_readings (id, user_id, device_id, heart_rate, spo2, temperature, activity_state, data_source, created_at)
            SELECT id, user_id, 'AWEN_ESP32_01', heart_rate, spo2, temperature, activity_state, data_source, created_at
            FROM physiological_readings
        """)

    # User Baselines Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_baselines (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL,
            resting_hr REAL DEFAULT 64.0,
            resting_spo2 REAL DEFAULT 98.6,
            resting_temp REAL DEFAULT 36.6,
            hr_variance REAL DEFAULT 4.8,
            confidence TEXT DEFAULT 'Learning',
            samples INTEGER DEFAULT 0,
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)
    cursor.execute("PRAGMA table_info(user_baselines);")
    bsl_cols = {row["name"] for row in cursor.fetchall()}
    if "samples" not in bsl_cols:
        cursor.execute("ALTER TABLE user_baselines ADD COLUMN samples INTEGER DEFAULT 0;")

    # User Checkins Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_checkins (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            mood TEXT,
            activity_context TEXT,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

    # Observations & Alerts Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS observations (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            reading_id TEXT,
            severity TEXT DEFAULT 'info',
            message TEXT NOT NULL,
            type TEXT DEFAULT 'physiological',
            status TEXT DEFAULT 'active',
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

    # Conversations Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS awen_conversations (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            user_message TEXT,
            awen_response TEXT,
            topic TEXT DEFAULT 'general',
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    conn.close()

# Auto-initialize DB on import
init_db()

# ----------------- User Authentication & Management -----------------

def create_user(
    name: str,
    email: str,
    password: str,
    age: int = None,
    gender: str = None,
    phone: str = None,
    device_id: str = None
) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    patient_id = f"PAT-{secrets.token_hex(3).upper()}"
    pw_hash = hash_password(password)
    now_iso = datetime.utcnow().isoformat()
    assigned_device_id = device_id.strip() if device_id else f"AWEN_ESP32_{secrets.token_hex(2).upper()}"

    try:
        cursor.execute("""
            INSERT INTO users (
                id, patient_id, name, email, password_hash, age, gender, phone,
                timezone, observation_mode, observation_day, baseline_confidence,
                device_id, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Asia/Kolkata', 1, 1, 'Learning', ?, ?, ?)
        """, (
            user_id, patient_id, name.strip(), email.lower().strip(), pw_hash,
            age, gender, phone, assigned_device_id, now_iso, now_iso
        ))

        # Create baseline record
        baseline_id = f"bsl_{uuid.uuid4().hex[:10]}"
        cursor.execute("""
            INSERT INTO user_baselines (id, user_id, resting_hr, resting_spo2, resting_temp, hr_variance, confidence, samples, updated_at)
            VALUES (?, ?, 64.0, 98.6, 36.6, 4.8, 'Learning', 0, ?)
        """, (baseline_id, user_id, now_iso))

        # Register default device
        dev_uuid = f"dev_{uuid.uuid4().hex[:10]}"
        api_key = f"awen_key_{secrets.token_urlsafe(24)}"
        cursor.execute("""
            INSERT INTO devices (id, device_id, user_id, api_key, device_name, created_at)
            VALUES (?, ?, ?, ?, 'Primary ESP32 Unit', ?)
            ON CONFLICT(device_id) DO UPDATE SET
                user_id = excluded.user_id,
                api_key = excluded.api_key
        """, (dev_uuid, assigned_device_id, user_id, api_key, now_iso))

        conn.commit()
        return get_user_by_id(user_id)
    except sqlite3.IntegrityError:
        conn.rollback()
        return None
    finally:
        conn.close()

def verify_user(email: str, password: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    user = dict(row)
    if verify_password(password, user.get("password_hash")):
        user.pop("password_hash", None)
        user["observation_mode"] = bool(user["observation_mode"])
        return user
    return None

def get_user_by_id(user_id: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    user = dict(row)
    user.pop("password_hash", None)
    user["observation_mode"] = bool(user["observation_mode"])
    return user

def get_user_by_email(email: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_user_profile(
    user_id: str,
    name: str = None,
    age: int = None,
    gender: str = None,
    phone: str = None,
    device_id: str = None,
    timezone: str = None
) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()

    updates = []
    params = []

    if name is not None:
        updates.append("name = ?")
        params.append(name.strip())
    if age is not None:
        updates.append("age = ?")
        params.append(age)
    if gender is not None:
        updates.append("gender = ?")
        params.append(gender.strip())
    if phone is not None:
        updates.append("phone = ?")
        params.append(phone.strip())
    if device_id is not None:
        updates.append("device_id = ?")
        params.append(device_id.strip())
    if timezone is not None:
        updates.append("timezone = ?")
        params.append(timezone.strip())

    if not updates:
        conn.close()
        return get_user_by_id(user_id)

    updates.append("updated_at = datetime('now')")
    params.append(user_id)

    query = f"UPDATE users SET {', '.join(updates)} WHERE id = ?"
    cursor.execute(query, tuple(params))

    # If device_id was updated, ensure device table mapping is also kept in sync
    if device_id:
        cursor.execute("SELECT id FROM devices WHERE device_id = ? AND user_id = ?", (device_id.strip(), user_id))
        if not cursor.fetchone():
            dev_uuid = f"dev_{uuid.uuid4().hex[:10]}"
            api_key = f"awen_key_{secrets.token_urlsafe(24)}"
            cursor.execute("""
                INSERT INTO devices (id, device_id, user_id, api_key, device_name, created_at)
                VALUES (?, ?, ?, ?, 'Linked ESP32 Device', datetime('now'))
            """, (dev_uuid, device_id.strip(), user_id, api_key))

    conn.commit()
    conn.close()
    return get_user_by_id(user_id)

# ----------------- Session Token Management (SQLite-Backed) -----------------

def create_session(user_id: str, duration_days: int = 7) -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    token = f"awen_sess_{secrets.token_urlsafe(32)}"
    now = datetime.utcnow()
    expires_at = (now + timedelta(days=duration_days)).isoformat()

    cursor.execute("""
        INSERT INTO user_sessions (token, user_id, created_at, expires_at)
        VALUES (?, ?, ?, ?)
    """, (token, user_id, now.isoformat(), expires_at))

    conn.commit()
    conn.close()
    return token

def verify_session(token: str) -> dict:
    if not token:
        return None
    conn = get_db_connection()
    cursor = conn.cursor()
    now_iso = datetime.utcnow().isoformat()

    cursor.execute("""
        SELECT u.* FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ? AND s.expires_at > ?
    """, (token, now_iso))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None
    user = dict(row)
    user.pop("password_hash", None)
    user["observation_mode"] = bool(user["observation_mode"])
    return user

def delete_session(token: str):
    if not token:
        return
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()

# ----------------- Device Management -----------------

def get_user_devices(user_id: str) -> list:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM devices WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_device_by_id(device_id: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM devices WHERE device_id = ?", (device_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_device_by_api_key(api_key: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM devices WHERE api_key = ?", (api_key,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def register_device(user_id: str, device_id: str, device_name: str = 'AWEN ESP32 Unit') -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    dev_uuid = f"dev_{uuid.uuid4().hex[:10]}"
    api_key = f"awen_key_{secrets.token_urlsafe(24)}"
    now_iso = datetime.utcnow().isoformat()

    cursor.execute("""
        INSERT INTO devices (id, device_id, user_id, api_key, device_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(device_id) DO UPDATE SET
            user_id = excluded.user_id,
            device_name = excluded.device_name
    """, (dev_uuid, device_id.strip(), user_id, api_key, device_name, now_iso))

    conn.commit()
    conn.close()
    return get_device_by_id(device_id.strip())

# ----------------- Sensor Readings Management -----------------

def insert_sensor_reading(
    user_id: str,
    device_id: str,
    heart_rate: float = None,
    spo2: float = None,
    temperature: float = None,
    accel_x: float = None,
    accel_y: float = None,
    accel_z: float = None,
    gyro_x: float = None,
    gyro_y: float = None,
    gyro_z: float = None,
    accel_magnitude: float = None,
    alarm: str = None,
    status: str = None,
    activity_state: str = "Resting",
    data_source: str = "esp32",
    timestamp_ms: int = None
) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    reading_id = f"rdg_{uuid.uuid4().hex[:10]}"
    now_iso = datetime.utcnow().isoformat()

    # Calculate accel magnitude if not provided but components are present
    if accel_magnitude is None and accel_x is not None and accel_y is not None and accel_z is not None:
        accel_magnitude = round(math.sqrt(accel_x**2 + accel_y**2 + accel_z**2), 3)

    # Derive activity if not set and magnitude is known
    if (activity_state is None or activity_state == "Resting") and accel_magnitude is not None:
        if accel_magnitude > 1.8:
            activity_state = "Running"
        elif accel_magnitude > 1.4:
            activity_state = "Climbing Stairs"
        elif accel_magnitude > 1.15:
            activity_state = "Walking"
        else:
            activity_state = "Resting"

    cursor.execute("""
        INSERT INTO sensor_readings (
            id, user_id, device_id, heart_rate, spo2, temperature,
            accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z,
            accel_magnitude, alarm, status, activity_state,
            data_source, timestamp_ms, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        reading_id, user_id, device_id, heart_rate, spo2, temperature,
        accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z,
        accel_magnitude, alarm, status, activity_state,
        data_source, timestamp_ms, now_iso
    ))

    # Update device last_seen
    cursor.execute("""
        UPDATE devices SET last_seen = ? WHERE device_id = ?
    """, (now_iso, device_id))

    # Automatically check baseline and log an observation if heart rate is elevated while resting
    if heart_rate is not None and activity_state == "Resting":
        cursor.execute("SELECT resting_hr, hr_variance FROM user_baselines WHERE user_id = ?", (user_id,))
        bsl = cursor.fetchone()
        if bsl and bsl["resting_hr"]:
            delta = heart_rate - bsl["resting_hr"]
            tolerance = (bsl["hr_variance"] or 4.8) * 2.0
            if delta > tolerance:
                obs_id = f"obs_{uuid.uuid4().hex[:10]}"
                cursor.execute("""
                    INSERT INTO observations (id, user_id, reading_id, severity, message, type, status, created_at)
                    VALUES (?, ?, ?, 'watchful', ?, 'elevated_hr', 'active', ?)
                """, (
                    obs_id, user_id, reading_id,
                    f"Resting heart rate ({heart_rate:.1f} BPM) is {delta:+.1f} BPM above your quiet baseline ({bsl['resting_hr']:.1f} BPM). Take a quiet break to recalibrate.",
                    now_iso
                ))

    conn.commit()
    conn.close()

    return {
        "id": reading_id,
        "user_id": user_id,
        "device_id": device_id,
        "heart_rate": heart_rate,
        "spo2": spo2,
        "temperature": temperature,
        "accel_x": accel_x,
        "accel_y": accel_y,
        "accel_z": accel_z,
        "gyro_x": gyro_x,
        "gyro_y": gyro_y,
        "gyro_z": gyro_z,
        "accel_magnitude": accel_magnitude,
        "alarm": alarm,
        "status": status,
        "activity_state": activity_state,
        "data_source": data_source,
        "timestamp_ms": timestamp_ms,
        "created_at": now_iso
    }

def get_latest_reading(user_id: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM sensor_readings
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    """, (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["bpm"] = d.get("heart_rate")
    return d

def get_historical_readings(
    user_id: str,
    limit: int = 50,
    offset: int = 0,
    from_time: str = None,
    to_time: str = None
) -> list:
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM sensor_readings WHERE user_id = ?"
    params = [user_id]

    if from_time:
        query += " AND created_at >= ?"
        params.append(from_time)
    if to_time:
        query += " AND created_at <= ?"
        params.append(to_time)

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["bpm"] = d.get("heart_rate")
        result.append(d)
    return result

def get_weekly_history(user_id: str) -> list:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT date(created_at) as day_date,
               AVG(heart_rate) as avg_hr,
               AVG(spo2) as avg_spo2,
               AVG(temperature) as avg_temp,
               COUNT(*) as sample_count
        FROM sensor_readings
        WHERE user_id = ? AND created_at >= datetime('now', '-7 days') AND heart_rate IS NOT NULL
        GROUP BY date(created_at)
        ORDER BY day_date ASC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "date": r["day_date"],
            "averageHeartRate": round(r["avg_hr"], 1) if r["avg_hr"] is not None else None,
            "averageSpo2": round(r["avg_spo2"], 1) if r["avg_spo2"] is not None else None,
            "averageTemp": round(r["avg_temp"], 1) if r["avg_temp"] is not None else None,
            "sampleCount": r["sample_count"]
        }
        for r in rows
    ]

# ----------------- Baselines Management -----------------

def get_user_baseline(user_id: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_baselines WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "restingHr": row["resting_hr"],
            "restingSpo2": row["resting_spo2"],
            "restingTemp": row["resting_temp"],
            "hrStdDev": row["hr_variance"],
            "confidence": row["confidence"],
            "samples": row["samples"],
            "updatedAt": row["updated_at"]
        }
    return None

def upsert_user_baseline(
    user_id: str,
    resting_hr: float,
    resting_spo2: float = 98.6,
    resting_temp: float = 36.6,
    hr_variance: float = 4.8,
    confidence: str = "Learning",
    samples: int = 0
) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    baseline_id = f"bsl_{uuid.uuid4().hex[:10]}"
    now_iso = datetime.utcnow().isoformat()

    cursor.execute("""
        INSERT INTO user_baselines (id, user_id, resting_hr, resting_spo2, resting_temp, hr_variance, confidence, samples, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            resting_hr = excluded.resting_hr,
            resting_spo2 = excluded.resting_spo2,
            resting_temp = excluded.resting_temp,
            hr_variance = excluded.hr_variance,
            confidence = excluded.confidence,
            samples = excluded.samples,
            updated_at = excluded.updated_at
    """, (baseline_id, user_id, resting_hr, resting_spo2, resting_temp, hr_variance, confidence, samples, now_iso))

    conn.commit()
    conn.close()
    return get_user_baseline(user_id)

def update_user_observation_mode(user_id: str, enabled: bool) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    confidence = 'Learning' if enabled else 'Stable baseline'
    cursor.execute("""
        UPDATE users 
        SET observation_mode = ?, baseline_confidence = ?, updated_at = datetime('now')
        WHERE id = ?
    """, (1 if enabled else 0, confidence, user_id))
    cursor.execute("""
        UPDATE user_baselines
        SET confidence = ?, updated_at = datetime('now')
        WHERE user_id = ?
    """, (confidence, user_id))
    conn.commit()
    conn.close()
    return get_user_by_id(user_id)

# ----------------- Checkins Management -----------------

def insert_checkin(user_id: str, mood: str, activity_context: str = "", notes: str = "") -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    checkin_id = f"chk_{uuid.uuid4().hex[:10]}"
    now_iso = datetime.utcnow().isoformat()

    cursor.execute("""
        INSERT INTO user_checkins (id, user_id, mood, activity_context, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (checkin_id, user_id, mood, activity_context, notes, now_iso))

    conn.commit()
    conn.close()
    return {
        "id": checkin_id,
        "user_id": user_id,
        "mood": mood,
        "activity_context": activity_context,
        "notes": notes,
        "created_at": now_iso
    }

def get_checkins(user_id: str, limit: int = 15) -> list:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM user_checkins
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    """, (user_id, limit))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ----------------- Observations / Alerts Management -----------------

def insert_observation(
    user_id: str,
    message: str,
    severity: str = "info",
    obs_type: str = "physiological",
    reading_id: str = None
) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    obs_id = f"obs_{uuid.uuid4().hex[:10]}"
    now_iso = datetime.utcnow().isoformat()

    cursor.execute("""
        INSERT INTO observations (id, user_id, reading_id, severity, message, type, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    """, (obs_id, user_id, reading_id, severity, message, obs_type, now_iso))

    conn.commit()
    conn.close()
    return {
        "id": obs_id,
        "user_id": user_id,
        "reading_id": reading_id,
        "severity": severity,
        "message": message,
        "type": obs_type,
        "status": "active",
        "created_at": now_iso
    }

def get_observations(user_id: str, limit: int = 20) -> list:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM observations
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    """, (user_id, limit))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ----------------- Conversations -----------------

def insert_conversation(user_id: str, user_message: str, awen_response: str, topic: str = "general") -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    conv_id = f"cnv_{uuid.uuid4().hex[:10]}"
    now_iso = datetime.utcnow().isoformat()

    cursor.execute("""
        INSERT INTO awen_conversations (id, user_id, user_message, awen_response, topic, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (conv_id, user_id, user_message, awen_response, topic, now_iso))

    conn.commit()
    conn.close()
    return {
        "id": conv_id,
        "user_id": user_id,
        "user_message": user_message,
        "awen_response": awen_response,
        "topic": topic,
        "created_at": now_iso
    }
