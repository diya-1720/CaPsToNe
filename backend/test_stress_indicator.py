import sys
import os

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app
from ml_engine import PersonalizedPhysiologicalEngine
import database

client = TestClient(app)

def test_stress_algorithm_logic():
    engine = PersonalizedPhysiologicalEngine()
    baseline = {
        "resting_hr": 64.0,
        "resting_spo2": 98.6,
        "resting_temp": 36.6,
        "hr_variance": 4.8
    }

    # 1. Baseline resting readings (no stress)
    res_low = engine.calculate_stress_indicator(
        hr=64.0,
        temp=36.6,
        accel_magnitude=1.02,
        activity="Resting",
        user_baseline=baseline
    )
    assert res_low["status"] == "LOW"
    assert res_low["score"] < 40
    assert "close to your personal baseline" in res_low["explanation"].lower()
    print("[PASS] Low stress resting test:", res_low["score"], res_low["status"])

    # 2. Elevated resting HR during inactivity (elevated stress pattern)
    res_elevated = engine.calculate_stress_indicator(
        hr=74.0, # +10 BPM above resting baseline while still
        temp=36.6,
        accel_magnitude=1.04,
        activity="Resting",
        user_baseline=baseline
    )
    assert res_elevated["status"] in ["ELEVATED", "POSSIBLE STRESS"]
    assert res_elevated["score"] >= 40
    assert any("elevated resting heart rate" in s.lower() for s in res_elevated["contributing_signals"])
    print("[PASS] Elevated HR resting test:", res_elevated["score"], res_elevated["status"])

    # 3. Multiple indicators deviating during inactivity (POSSIBLE STRESS)
    res_possible_stress = engine.calculate_stress_indicator(
        hr=80.0, # +16 BPM
        temp=37.8, # +1.2°C temperature deviation
        accel_magnitude=1.01,
        activity="Resting",
        user_baseline=baseline,
        checkin_mood="Difficult"
    )
    assert res_possible_stress["status"] == "POSSIBLE STRESS"
    assert res_possible_stress["score"] >= 70
    assert any("temperature deviation" in s.lower() for s in res_possible_stress["contributing_signals"])
    print("[PASS] Multi-signal possible stress test:", res_possible_stress["score"], res_possible_stress["status"])

    # 4. Exertion filtering: High HR during walking/exercise should NOT be flagged as stress
    res_exertion = engine.calculate_stress_indicator(
        hr=98.0, # +34 BPM above baseline, but user is Walking with MPU motion 1.45g
        temp=36.8,
        accel_magnitude=1.45,
        activity="Walking",
        is_moving=True,
        user_baseline=baseline
    )
    assert res_exertion["status"] == "LOW"
    assert res_exertion["score"] < 40
    assert res_exertion["is_exertion_filtered"] is True
    assert any("physical activity" in s.lower() for s in res_exertion["contributing_signals"])
    print("[PASS] Motion exertion filtering test:", res_exertion["score"], res_exertion["status"])

def test_stress_api_endpoints():
    # Fetch active token for test user
    conn = database.get_db_connection()
    c = conn.cursor()
    c.execute("SELECT token FROM user_sessions WHERE user_id = 'usr_86712a5b49' LIMIT 1")
    row = c.fetchone()
    conn.close()

    assert row is not None, "No active test session found in SQLite awen.db"
    token = row["token"]

    # Test GET /api/stress/current
    resp_cur = client.get("/api/stress/current", headers={"Authorization": f"Bearer {token}"})
    assert resp_cur.status_code == 200, f"Failed GET /api/stress/current: {resp_cur.text}"
    cur_data = resp_cur.json()
    assert "score" in cur_data
    assert "status" in cur_data
    assert "contributing_signals" in cur_data
    assert cur_data["status"] in ["LOW", "ELEVATED", "POSSIBLE STRESS", "STANDBY"]
    assert cur_data["data_source"] == "sqlite"
    print(f"[PASS] GET /api/stress/current returned: score={cur_data['score']}, status={cur_data['status']}, signals={cur_data['contributing_signals']}")

    # Test POST /api/stress/evaluate with exertion payload
    eval_payload = {
        "heart_rate": 102.0,
        "temperature": 36.7,
        "accel_magnitude": 1.55,
        "activity_state": "Running",
        "is_moving": True
    }
    resp_eval = client.post("/api/stress/evaluate", json=eval_payload, headers={"Authorization": f"Bearer {token}"})
    assert resp_eval.status_code == 200
    eval_data = resp_eval.json()
    assert eval_data["status"] == "LOW"
    assert eval_data["is_exertion_filtered"] is True
    print(f"[PASS] POST /api/stress/evaluate (running): score={eval_data['score']}, status={eval_data['status']}")

if __name__ == "__main__":
    test_stress_algorithm_logic()
    test_stress_api_endpoints()
    print("\nALL STRESS INDICATOR AUTOMATED TESTS PASSED SUCCESSFULLY!")
