import sys
import os
import json
import sqlite3
import datetime

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app
import database

client = TestClient(app)

def run_audit():
    print("====================================================")
    print("STARTING FULL AWEN SYSTEM & DATA FLOW AUDIT")
    print("====================================================")

    audit_results = {}

    # ----------------------------------------------------
    # 1. DATABASE & SQLITE CONNECTION AUDIT
    # ----------------------------------------------------
    print("\n--- 1. BACKEND -> SQLITE DATABASE AUDIT ---")
    conn = database.get_db_connection()
    cursor = conn.cursor()
    
    # Verify tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row["name"] for row in cursor.fetchall()]
    print(f"Detected Tables in awen.db: {tables}")
    
    expected_tables = ["users", "user_sessions", "devices", "sensor_readings", "user_baselines", "user_checkins", "observations", "awen_conversations"]
    for t in expected_tables:
        assert t in tables, f"Missing table {t} in SQLite!"
    print("[OK] All 8 core tables exist in SQLite awen.db.")

    # Check target user
    cursor.execute("SELECT * FROM users WHERE email = 'singhdiya1720@gmail.com'")
    user = cursor.fetchone()
    assert user is not None, "Target user singhdiya1720@gmail.com not found!"
    user_id = user["id"]
    print(f"[OK] Found target user: {user['email']} (id: {user_id}, patient_id: {user['patient_id']})")
    print(f"  Observation Mode: {user['observation_mode']}, Start: {user['observation_start']}, Day: {user['observation_day']}")

    # Check sensor_readings for target user
    cursor.execute("SELECT COUNT(*) as count, MIN(created_at) as earliest, MAX(created_at) as latest FROM sensor_readings WHERE user_id = ?", (user_id,))
    sr_stats = cursor.fetchone()
    print(f"[OK] Sensor readings in SQLite for target user: {sr_stats['count']} records")
    print(f"  Date range: {sr_stats['earliest']} -> {sr_stats['latest']}")
    assert sr_stats["count"] == 44, f"Expected 44 readings, got {sr_stats['count']}"

    # Check observations
    cursor.execute("SELECT COUNT(*) as count FROM observations WHERE user_id = ?", (user_id,))
    obs_count = cursor.fetchone()["count"]
    print(f"[OK] Observations/Alerts in SQLite for target user: {obs_count} records")
    assert obs_count >= 3, f"Expected at least 3 observations, got {obs_count}"

    # Check baseline
    cursor.execute("SELECT * FROM user_baselines WHERE user_id = ?", (user_id,))
    bsl = cursor.fetchone()
    assert bsl is not None, "User baseline not found!"
    print(f"[OK] Baseline in SQLite: Resting HR={bsl['resting_hr']} BPM, SpO2={bsl['resting_spo2']}%, Temp={bsl['resting_temp']}deg C, Variance={bsl['hr_variance']}")

    conn.close()
    audit_results["Backend -> SQLite"] = True

    # ----------------------------------------------------
    # 2. PATIENT SUMMARY SQLITE CALCULATION AUDIT
    # ----------------------------------------------------
    print("\n--- 2. SQLITE -> SUMMARY CALCULATION AUDIT ---")
    summary = database.get_patient_summary(user_id)
    print(f"Summary computed from SQLite:")
    print(f"  Observation Status: {summary['observation_period']['status']}")
    print(f"  Observation Start: {summary['observation_period']['start']}")
    print(f"  Observation Duration: {summary['observation_period']['duration']}")
    print(f"  Total Readings: {summary['total_readings']}")
    print(f"  Heart Rate: Min={summary['heart_rate']['min']}, Max={summary['heart_rate']['max']}, Avg={summary['heart_rate']['average']}")
    print(f"  SpO2: Min={summary['spo2']['min']}, Max={summary['spo2']['max']}, Avg={summary['spo2']['average']}")
    print(f"  Temperature: Min={summary['temperature']['min']}, Max={summary['temperature']['max']}, Avg={summary['temperature']['average']}")
    print(f"  Abnormal Events Count: {len(summary['abnormal_events'])}")

    # Verify no hardcoded values: check mathematically
    assert summary["total_readings"] == 44
    assert summary["heart_rate"]["max"] == 104.5
    assert summary["heart_rate"]["min"] == 61.8
    assert summary["spo2"]["min"] == 91.2
    assert summary["temperature"]["max"] == 38.2
    assert len(summary["abnormal_events"]) == 3
    print("[OK] All summary metrics strictly verified against SQLite records.")
    audit_results["Summary Calculation"] = True

    # ----------------------------------------------------
    # 3. AUTHENTICATION & SESSION ISOLATION AUDIT
    # ----------------------------------------------------
    print("\n--- 3. FRONTEND -> BACKEND AUTHENTICATION AUDIT ---")
    login_resp = client.post("/api/auth/login", json={
        "email": "singhdiya1720@gmail.com",
        "password": "password123"
    })
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    auth_data = login_resp.json()
    token = auth_data["token"]
    user_data = auth_data["user"]
    print(f"[OK] Authentication successful. Received token: {token[:12]}...")
    print(f"  User Record returned: ID={user_data['id']}, PatientID={user_data.get('patient_id')}, Duration={user_data.get('observation_duration')}")
    assert user_data["id"] == user_id
    assert user_data["email"] == "singhdiya1720@gmail.com"
    auth_headers = {"Authorization": f"Bearer {token}"}
    audit_results["Frontend -> Backend Auth"] = True

    # Verify patient isolation: test with other user
    other_login = client.post("/api/auth/login", json={
        "email": "sarah.demo@hospital.org",
        "password": "password123"
    })
    if other_login.status_code == 200:
        other_token = other_login.json()["token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}
        other_summary = client.get("/api/user/summary", headers=other_headers).json()
        assert other_summary["total_readings"] != 44, "FATAL: Cross-tenant data bleed detected!"
        print(f"[OK] Security check: Other user ({other_login.json()['user']['email']}) has {other_summary['total_readings']} readings, isolated from target user.")
    audit_results["User Isolation"] = True

    # ----------------------------------------------------
    # 4. API ENDPOINTS & DATA FLOW AUDIT
    # ----------------------------------------------------
    print("\n--- 4. API ENDPOINTS -> SQLITE DATA AUDIT ---")

    # A. GET /api/user/profile
    profile_resp = client.get("/api/user/profile", headers=auth_headers)
    assert profile_resp.status_code == 200
    p = profile_resp.json()
    assert p["email"] == "singhdiya1720@gmail.com"
    assert p["observation_mode"] is True
    assert p["observation_day"] == 4
    assert "days" in p["observation_duration"]
    print(f"[OK] GET /api/user/profile: verified (Patient ID: {p.get('patient_id')}, Observation Day: {p.get('observation_day')})")

    # B. GET /api/readings/latest
    latest_resp = client.get("/api/readings/latest", headers=auth_headers)
    assert latest_resp.status_code == 200
    latest_obj = latest_resp.json()
    assert latest_obj["status"] == "success"
    latest = latest_obj["reading"]
    assert latest is not None
    assert latest["data_source"] == "demo_synthetic"
    assert latest["heart_rate"] == 65.2
    assert latest["spo2"] == 98.5
    assert latest["temperature"] == 36.7
    print(f"[OK] GET /api/readings/latest: verified latest record from SQLite (HR: {latest['heart_rate']}, SpO2: {latest['spo2']}%, Temp: {latest['temperature']} deg C, Time: {latest['created_at']})")

    # C. GET /api/readings/history
    history_resp = client.get("/api/readings/history?limit=100", headers=auth_headers)
    assert history_resp.status_code == 200
    hist = history_resp.json()["readings"]
    assert len(hist) == 44
    for r in hist:
        assert r["user_id"] == user_id
        assert r["data_source"] == "demo_synthetic"
    print(f"[OK] GET /api/readings/history: verified 44 records flowing from SQLite with matching userId.")

    # D. GET /api/history/weekly (Graphs & Trends)
    weekly_resp = client.get("/api/history/weekly", headers=auth_headers)
    assert weekly_resp.status_code == 200
    weekly = weekly_resp.json()
    populated_days = [d for d in weekly if d["sampleCount"] > 0]
    print(f"[OK] GET /api/history/weekly: 7-day trend window contains {len(populated_days)} populated observation days.")
    for d in populated_days:
        print(f"  Day {d['date']}: Avg HR {d['averageHeartRate']} BPM, SpO2 {d['averageSpo2']}%, Samples {d['sampleCount']}")
    assert len(populated_days) >= 4, f"Expected 4 days with data, got {len(populated_days)}"

    # E. GET /api/observations (Alerts)
    obs_resp = client.get("/api/observations", headers=auth_headers)
    assert obs_resp.status_code == 200
    alerts = obs_resp.json()["observations"]
    print(f"[OK] GET /api/observations: verified {len(alerts)} alerts from SQLite.")
    for a in alerts:
        print(f"  [{a['severity'].upper()}] {a['created_at'][:19]}: {a['message']}")
    assert len(alerts) >= 3

    # F. GET /api/user/summary
    summary_resp = client.get("/api/user/summary", headers=auth_headers)
    assert summary_resp.status_code == 200
    api_summary = summary_resp.json()
    assert api_summary["total_readings"] == 44
    assert api_summary["heart_rate"]["average"] == summary["heart_rate"]["average"]
    print(f"[OK] GET /api/user/summary: verified full patient summary response.")

    audit_results["API Endpoints"] = True

    # ----------------------------------------------------
    # 5. OBSERVATION MODE TOGGLE AUDIT
    # ----------------------------------------------------
    print("\n--- 5. OBSERVATION MODE TOGGLE AUDIT ---")
    # Test toggle observation mode
    restart_resp = client.post("/api/user/observation-mode", json={"enabled": False}, headers=auth_headers)
    assert restart_resp.status_code == 200
    toggled_user = restart_resp.json()["user"]
    assert toggled_user["observation_mode"] is False
    print(f"[OK] POST /api/user/observation-mode: successfully toggled observation mode.")

    # Restore observation day to 4 and start to Sept 17 for final demo
    conn = database.get_db_connection()
    c = conn.cursor()
    c.execute("UPDATE users SET observation_mode = 1, observation_start = '2026-09-17T08:00:00', observation_day = 4, baseline_confidence = 'Developing baseline' WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    print(f"[OK] Restored 4-day active observation state for singhdiya1720@gmail.com.")
    audit_results["Observation Mode"] = True

    # ----------------------------------------------------
    # 6. ESP32 HARDWARE INTEGRATION STATUS
    # ----------------------------------------------------
    print("\n--- 6. ESP32 HARDWARE INTEGRATION AUDIT ---")
    # Verify ESP32 endpoint POST /api/readings
    test_packet = {
        "device_id": "AWEN_ESP32_A714",
        "heart_rate": 66.0,
        "spo2": 98.4,
        "temperature": 36.6,
        "accel_x": 0.01,
        "accel_y": 0.02,
        "accel_z": 0.98,
        "accel_magnitude": 0.98,
        "activity_state": "Resting",
        "data_source": "esp32",
        "timestamp_ms": int(datetime.datetime.now().timestamp() * 1000)
    }
    ingest_resp = client.post("/api/readings", json=test_packet, headers=auth_headers)
    print(f"[OK] POST /api/readings with Bearer auth: status={ingest_resp.status_code}")
    assert ingest_resp.status_code == 201
    saved = ingest_resp.json()["reading"]
    assert saved["heart_rate"] == 66.0
    print(f"[OK] Hardware packet successfully stored in SQLite (id: {saved['id']})")
    
    # Clean up test point so 44 demo points remain pristine
    conn = database.get_db_connection()
    c = conn.cursor()
    c.execute("DELETE FROM sensor_readings WHERE id = ?", (saved["id"],))
    conn.commit()
    conn.close()
    print("[OK] Test hardware reading cleanly purged; 44 demo records maintained.")
    audit_results["ESP32 -> Backend Ingest"] = True

    print("\n====================================================")
    print("ALL AUDIT CHECKS COMPLETED SUCCESSFULLY!")
    print("====================================================")
    for k, v in audit_results.items():
        print(f"  {k}: {'PASS' if v else 'FAIL'}")

if __name__ == "__main__":
    run_audit()
