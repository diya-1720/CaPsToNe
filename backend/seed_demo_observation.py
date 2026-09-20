import sqlite3
import datetime
import uuid
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "awen.db")

def seed_demo_observation():
    print(f"Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Target user
    target_email = "singhdiya1720@gmail.com"
    cursor.execute("SELECT * FROM users WHERE email = ?", (target_email,))
    user = cursor.fetchone()

    if not user:
        print(f"Error: Target user '{target_email}' not found in database!")
        conn.close()
        return

    user_id = user["id"]
    patient_id = user["patient_id"] or "PAT-ED5123"
    device_id = user["device_id"] or "AWEN_ESP32_A714"
    print(f"Found target user: {target_email} (ID: {user_id}, Patient ID: {patient_id}, Device: {device_id})")

    # Record counts before for all users
    cursor.execute("SELECT user_id, COUNT(*) as cnt FROM sensor_readings GROUP BY user_id")
    prior_counts = {r["user_id"]: r["cnt"] for r in cursor.fetchall()}
    print("Prior sensor readings count by user:", prior_counts)

    # 2. Clean previous synthetic data ONLY for this user
    cursor.execute("DELETE FROM sensor_readings WHERE user_id = ? AND data_source = 'demo_synthetic'", (user_id,))
    deleted_readings = cursor.rowcount
    cursor.execute("DELETE FROM observations WHERE user_id = ? AND type = 'demo_synthetic_alert'", (user_id,))
    deleted_alerts = cursor.rowcount
    print(f"Cleaned previous synthetic data: {deleted_readings} readings, {deleted_alerts} alerts deleted.")

    # 3. Update observation mode and baseline for target user
    obs_start = "2026-09-17T08:00:00"
    cursor.execute("""
        UPDATE users 
        SET observation_mode = 1,
            observation_start = ?,
            observation_day = 4,
            baseline_confidence = 'Developing baseline',
            patient_id = ?,
            device_id = ?,
            updated_at = datetime('now')
        WHERE id = ?
    """, (obs_start, patient_id, device_id, user_id))

    # Baseline: 64.0 BPM resting HR, 98.6% SpO2, 36.6 C temp, 4.8 hr_variance
    cursor.execute("""
        INSERT INTO user_baselines (id, user_id, resting_hr, resting_spo2, resting_temp, hr_variance, confidence, samples, updated_at)
        VALUES (?, ?, 64.0, 98.6, 36.6, 4.8, 'Developing baseline', 44, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
            resting_hr = 64.0,
            resting_spo2 = 98.6,
            resting_temp = 36.6,
            hr_variance = 4.8,
            confidence = 'Developing baseline',
            samples = 44,
            updated_at = datetime('now')
    """, (f"bsl_{uuid.uuid4().hex[:10]}", user_id))

    # 4. Generate 44 realistic records across 4 days (Sept 17 - Sept 20, 2026)
    # Schedule: 11 readings per day (Morning, Mid-day, Afternoon, Evening, Night)
    schedule = [
        # DAY 1: Sept 17, 2026 - Healthy baseline calibration
        ("2026-09-17T08:30:00", 63.5, 98.8, 36.5, "Resting", 0.02, 0.04, 0.98, 0.98, "normal", None),
        ("2026-09-17T09:45:00", 65.0, 98.5, 36.6, "Resting", 0.01, 0.05, 0.99, 0.99, "normal", None),
        ("2026-09-17T11:15:00", 64.2, 98.7, 36.6, "Resting", 0.03, 0.02, 0.98, 0.98, "normal", None),
        ("2026-09-17T12:30:00", 66.8, 98.6, 36.7, "Resting", 0.05, 0.08, 0.97, 0.98, "normal", None),
        ("2026-09-17T14:00:00", 63.8, 98.9, 36.5, "Resting", 0.01, 0.03, 0.99, 0.99, "normal", None),
        ("2026-09-17T15:30:00", 64.5, 98.6, 36.6, "Resting", 0.02, 0.04, 0.98, 0.98, "normal", None),
        ("2026-09-17T17:15:00", 84.0, 98.2, 36.9, "Active",  0.42, 0.65, 1.15, 1.38, "normal", None), # Afternoon brisk walk
        ("2026-09-17T18:00:00", 72.0, 98.4, 36.8, "Resting", 0.12, 0.15, 0.98, 1.01, "normal", None), # Recovery
        ("2026-09-17T19:30:00", 64.0, 98.8, 36.6, "Resting", 0.02, 0.03, 0.98, 0.98, "normal", None),
        ("2026-09-17T21:00:00", 62.5, 99.0, 36.5, "Resting", 0.01, 0.02, 0.99, 0.99, "normal", None),
        ("2026-09-17T22:30:00", 61.8, 99.1, 36.4, "Resting", 0.01, 0.01, 0.99, 0.99, "normal", None),

        # DAY 2: Sept 18, 2026 - Tachycardia spike at 14:15 during sedentary rest
        ("2026-09-18T08:15:00", 63.2, 98.7, 36.5, "Resting", 0.02, 0.03, 0.98, 0.98, "normal", None),
        ("2026-09-18T09:30:00", 64.8, 98.6, 36.6, "Resting", 0.03, 0.04, 0.98, 0.98, "normal", None),
        ("2026-09-18T11:00:00", 65.5, 98.5, 36.6, "Resting", 0.02, 0.03, 0.98, 0.98, "normal", None),
        ("2026-09-18T12:45:00", 67.0, 98.4, 36.7, "Resting", 0.04, 0.06, 0.97, 0.98, "normal", None),
        # ABNORMAL EVENT 1: Resting HR Spike 104.5 BPM (Delta +40.5 BPM vs baseline 64.0)
        ("2026-09-18T14:15:00", 104.5, 97.8, 36.7, "Resting", 0.01, 0.02, 0.98, 0.98, "alert", 
         "Resting heart rate reached 104.5 BPM during sedentary rest, exceeding normal baseline (64.0 ± 9.6 BPM) without physical movement."),
        ("2026-09-18T14:45:00", 88.0, 98.0, 36.7, "Resting", 0.02, 0.03, 0.98, 0.98, "normal", None),
        ("2026-09-18T16:00:00", 66.5, 98.6, 36.6, "Resting", 0.02, 0.04, 0.98, 0.98, "normal", None),
        ("2026-09-18T17:30:00", 78.5, 98.3, 36.8, "Active",  0.35, 0.50, 1.10, 1.25, "normal", None),
        ("2026-09-18T19:00:00", 65.0, 98.7, 36.6, "Resting", 0.03, 0.02, 0.98, 0.98, "normal", None),
        ("2026-09-18T20:45:00", 63.5, 98.9, 36.5, "Resting", 0.01, 0.02, 0.99, 0.99, "normal", None),
        ("2026-09-18T22:15:00", 62.0, 99.0, 36.4, "Resting", 0.01, 0.01, 0.99, 0.99, "normal", None),

        # DAY 3: Sept 19, 2026 - SpO2 arterial desaturation drop at 11:30
        ("2026-09-19T08:00:00", 62.8, 98.8, 36.5, "Resting", 0.02, 0.03, 0.98, 0.98, "normal", None),
        ("2026-09-19T09:15:00", 64.0, 98.6, 36.6, "Resting", 0.02, 0.04, 0.98, 0.98, "normal", None),
        ("2026-09-19T10:30:00", 65.2, 98.5, 36.6, "Resting", 0.03, 0.03, 0.98, 0.98, "normal", None),
        # ABNORMAL EVENT 2: SpO2 drop to 91.2% (<92% clinical threshold)
        ("2026-09-19T11:30:00", 68.0, 91.2, 36.6, "Resting", 0.02, 0.02, 0.99, 0.99, "alert",
         "Oxygen saturation dipped to 91.2% (clinically sub-optimal, baseline 98.6%) during resting observation."),
        ("2026-09-19T12:00:00", 65.8, 96.5, 36.6, "Resting", 0.02, 0.03, 0.98, 0.98, "normal", None),
        ("2026-09-19T13:45:00", 64.5, 98.6, 36.6, "Resting", 0.01, 0.04, 0.98, 0.98, "normal", None),
        ("2026-09-19T15:15:00", 63.8, 98.8, 36.5, "Resting", 0.02, 0.03, 0.98, 0.98, "normal", None),
        ("2026-09-19T17:00:00", 80.2, 98.3, 36.8, "Active",  0.38, 0.58, 1.12, 1.30, "normal", None),
        ("2026-09-19T18:30:00", 66.0, 98.6, 36.6, "Resting", 0.03, 0.03, 0.98, 0.98, "normal", None),
        ("2026-09-19T20:15:00", 63.5, 98.9, 36.5, "Resting", 0.01, 0.02, 0.99, 0.99, "normal", None),
        ("2026-09-19T22:00:00", 62.0, 99.1, 36.4, "Resting", 0.01, 0.01, 0.99, 0.99, "normal", None),

        # DAY 4: Sept 20, 2026 - Pyrexia (elevated temperature 38.2 C) at 09:45
        ("2026-09-20T08:15:00", 64.5, 98.6, 36.6, "Resting", 0.02, 0.03, 0.98, 0.98, "normal", None),
        ("2026-09-20T09:00:00", 71.0, 98.0, 37.4, "Resting", 0.02, 0.04, 0.98, 0.98, "normal", None),
        # ABNORMAL EVENT 3: Elevated skin temp 38.2 C (>38.0 C threshold)
        ("2026-09-20T09:45:00", 78.5, 97.4, 38.2, "Resting", 0.01, 0.02, 0.98, 0.98, "alert",
         "Skin temperature elevated to 38.2°C (baseline 36.6°C), indicating transient physiological thermal elevation."),
        ("2026-09-20T10:45:00", 74.0, 97.8, 37.8, "Resting", 0.02, 0.03, 0.98, 0.98, "normal", None),
        ("2026-09-20T11:30:00", 68.2, 98.2, 37.2, "Resting", 0.02, 0.02, 0.98, 0.98, "normal", None),
        ("2026-09-20T12:15:00", 66.0, 98.4, 36.9, "Resting", 0.03, 0.04, 0.98, 0.98, "normal", None),
        ("2026-09-20T13:00:00", 65.0, 98.6, 36.7, "Resting", 0.02, 0.03, 0.98, 0.98, "normal", None),
        ("2026-09-20T13:45:00", 64.2, 98.7, 36.6, "Resting", 0.02, 0.03, 0.98, 0.98, "normal", None),
        ("2026-09-20T14:30:00", 63.8, 98.8, 36.6, "Resting", 0.01, 0.02, 0.99, 0.99, "normal", None),
        ("2026-09-20T15:00:00", 64.0, 98.7, 36.6, "Resting", 0.02, 0.03, 0.98, 0.98, "normal", None),
        ("2026-09-20T15:20:00", 65.2, 98.5, 36.7, "Resting", 0.02, 0.03, 0.98, 0.98, "normal", None),
    ]

    inserted_readings = 0
    inserted_alerts = 0

    for i, (ts_iso, hr, spo2, temp, activity, ax, ay, az, amag, status, alert_msg) in enumerate(schedule, 1):
        reading_id = f"srd_syn_{i:04d}"
        dt = datetime.datetime.fromisoformat(ts_iso)
        ts_ms = int(dt.timestamp() * 1000)

        cursor.execute("""
            INSERT INTO sensor_readings (
                id, user_id, device_id, heart_rate, spo2, temperature,
                accel_x, accel_y, accel_z, accel_magnitude,
                activity_state, data_source, timestamp_ms, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'demo_synthetic', ?, ?)
        """, (
            reading_id, user_id, device_id, hr, spo2, temp,
            ax, ay, az, amag,
            activity, ts_ms, ts_iso
        ))
        inserted_readings += 1

        if alert_msg:
            obs_id = f"obs_syn_{inserted_alerts + 1:03d}"
            cursor.execute("""
                INSERT INTO observations (
                    id, user_id, reading_id, severity, message, type, status, created_at
                ) VALUES (?, ?, ?, 'warning', ?, 'demo_synthetic_alert', 'active', ?)
            """, (obs_id, user_id, reading_id, alert_msg, ts_iso))
            inserted_alerts += 1

    conn.commit()

    # 5. Verification checks
    cursor.execute("SELECT COUNT(*) as cnt FROM sensor_readings WHERE user_id = ?", (user_id,))
    total_readings = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM observations WHERE user_id = ?", (user_id,))
    total_obs = cursor.fetchone()["cnt"]

    cursor.execute("SELECT MIN(created_at) as earliest, MAX(created_at) as latest FROM sensor_readings WHERE user_id = ?", (user_id,))
    time_span = cursor.fetchone()

    # Verify other users remained untouched
    cursor.execute("SELECT user_id, COUNT(*) as cnt FROM sensor_readings GROUP BY user_id")
    post_counts = {r["user_id"]: r["cnt"] for r in cursor.fetchall()}

    print("\n--- SEEDING COMPLETE ---")
    print(f"Target User: {target_email} ({user_id})")
    print(f"Readings inserted: {inserted_readings}")
    print(f"Alerts inserted: {inserted_alerts}")
    print(f"Total readings for target user: {total_readings}")
    print(f"Total alerts for target user: {total_obs}")
    print(f"Date range: {time_span['earliest']} to {time_span['latest']}")
    print("Post sensor readings count by user:", post_counts)

    # Sanity check other users:
    for uid, count in prior_counts.items():
        if uid != user_id:
            assert post_counts.get(uid) == count, f"FATAL: User {uid} count changed from {count} to {post_counts.get(uid)}!"
    print("Verification: Other users data remains strictly untouched!")

    conn.close()

if __name__ == "__main__":
    seed_demo_observation()
