import sqlite3
import os
import uuid
import hashlib
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "awen.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            timezone TEXT DEFAULT 'Asia/Kolkata',
            observation_mode INTEGER DEFAULT 1,
            observation_day INTEGER DEFAULT 1,
            baseline_confidence TEXT DEFAULT 'Learning',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # Physiological Readings Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS physiological_readings (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            heart_rate REAL,
            spo2 REAL,
            temperature REAL,
            activity_state TEXT,
            data_source TEXT DEFAULT 'esp32',
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
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
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)

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

# Initialize DB on module import
init_db()

# ----------------- CRUD Operations -----------------

def create_user(name: str, email: str, password: str = None) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    user_id = f"usr_{uuid.uuid4().hex[:10]}"
    pw_hash = hash_password(password) if password else None
    now_iso = datetime.utcnow().isoformat()

    try:
        cursor.execute("""
            INSERT INTO users (id, name, email, password_hash, timezone, observation_mode, baseline_confidence, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'Asia/Kolkata', 1, 'Learning', ?, ?)
        """, (user_id, name, email.lower().strip(), pw_hash, now_iso, now_iso))

        # Default baseline record
        baseline_id = f"bsl_{uuid.uuid4().hex[:10]}"
        cursor.execute("""
            INSERT INTO user_baselines (id, user_id, resting_hr, resting_spo2, resting_temp, hr_variance, confidence, updated_at)
            VALUES (?, ?, 64.0, 98.6, 36.6, 4.8, 'Learning', ?)
        """, (baseline_id, user_id, now_iso))

        conn.commit()
        return get_user_by_id(user_id)
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def get_user_by_email(email: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d.pop("password_hash", None)
    d["observation_mode"] = bool(d["observation_mode"])
    return d

def verify_user(email: str, password: str) -> dict:
    user = get_user_by_email(email)
    if not user:
        return None
    if user["password_hash"] and user["password_hash"] == hash_password(password):
        d = dict(user)
        d.pop("password_hash", None)
        d["observation_mode"] = bool(d["observation_mode"])
        return d
    return None

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
            "updatedAt": row["updated_at"]
        }
    return None

def upsert_user_baseline(user_id: str, resting_hr: float, resting_spo2: float, resting_temp: float, hr_variance: float, confidence: str) -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    baseline_id = f"bsl_{uuid.uuid4().hex[:10]}"
    cursor.execute("""
        INSERT INTO user_baselines (id, user_id, resting_hr, resting_spo2, resting_temp, hr_variance, confidence, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
            resting_hr = excluded.resting_hr,
            resting_spo2 = excluded.resting_spo2,
            resting_temp = excluded.resting_temp,
            hr_variance = excluded.hr_variance,
            confidence = excluded.confidence,
            updated_at = datetime('now')
    """, (baseline_id, user_id, resting_hr, resting_spo2, resting_temp, hr_variance, confidence))
    conn.commit()
    conn.close()
    return get_user_baseline(user_id)

def insert_reading(user_id: str, heart_rate: float, spo2: float, temperature: float, activity_state: str, data_source: str = 'esp32') -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    reading_id = f"rdg_{uuid.uuid4().hex[:10]}"
    cursor.execute("""
        INSERT INTO physiological_readings (id, user_id, heart_rate, spo2, temperature, activity_state, data_source, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    """, (reading_id, user_id, heart_rate, spo2, temperature, activity_state, data_source))
    conn.commit()
    conn.close()
    return {
        "id": reading_id,
        "user_id": user_id,
        "heart_rate": heart_rate,
        "spo2": spo2,
        "temperature": temperature,
        "activity_state": activity_state,
        "data_source": data_source
    }

def get_weekly_history(user_id: str) -> list:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT date(created_at) as day_date, AVG(heart_rate) as avg_hr, COUNT(*) as sample_count
        FROM physiological_readings
        WHERE user_id = ? AND created_at >= datetime('now', '-7 days') AND heart_rate IS NOT NULL
        GROUP BY date(created_at)
        ORDER BY day_date ASC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"date": r["day_date"], "averageHeartRate": round(r["avg_hr"], 1), "sampleCount": r["sample_count"]} for r in rows]

def insert_checkin(user_id: str, mood: str, activity_context: str, notes: str = "") -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    checkin_id = f"chk_{uuid.uuid4().hex[:10]}"
    cursor.execute("""
        INSERT INTO user_checkins (id, user_id, mood, activity_context, notes, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
    """, (checkin_id, user_id, mood, activity_context, notes))
    conn.commit()
    conn.close()
    return {
        "id": checkin_id,
        "user_id": user_id,
        "mood": mood,
        "activity_context": activity_context,
        "notes": notes
    }

def get_checkins(user_id: str, limit: int = 10) -> list:
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

def insert_conversation(user_id: str, user_message: str, awen_response: str, topic: str = "general") -> dict:
    conn = get_db_connection()
    cursor = conn.cursor()
    conv_id = f"cnv_{uuid.uuid4().hex[:10]}"
    cursor.execute("""
        INSERT INTO awen_conversations (id, user_id, user_message, awen_response, topic, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
    """, (conv_id, user_id, user_message, awen_response, topic))
    conn.commit()
    conn.close()
    return {"id": conv_id, "user_id": user_id, "user_message": user_message, "awen_response": awen_response, "topic": topic}
