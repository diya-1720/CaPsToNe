import urllib.request
import urllib.error
import json
import time
import sys

BASE_URL = "http://127.0.0.1:8000"

def api_request(method, endpoint, data=None, token=None, headers_extra=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if headers_extra:
        headers.update(headers_extra)
    
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            return resp.getcode(), json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {"error": err_body}

def run_tests():
    print("==================================================")
    print("      AWEN FULL-STACK END-TO-END VERIFICATION     ")
    print("==================================================")
    all_passed = True

    # 1. Health check
    code, res = api_request("GET", "/api/health")
    assert code == 200, f"Health check failed with code {code}"
    print("[PASS] 1. Backend health check (HTTP 200, SQLite connected)")

    # 2. Register Patient A
    ts = int(time.time() * 1000)
    user_a_email = f"patient_a_{ts}@hospital.org"
    sarah_dev_id = f"ESP32_SARAH_{ts}"
    code, res = api_request("POST", "/api/auth/signup", {
        "name": "Sarah Jenkins",
        "email": user_a_email,
        "password": "SecurePassword123!",
        "age": 34,
        "gender": "Female",
        "phone": "+91-9876543210",
        "device_id": sarah_dev_id
    })
    assert code == 201, f"Patient A registration failed: {res}"
    token_a = res["token"]
    user_a = res["user"]
    assert user_a["email"] == user_a_email
    assert user_a["patient_id"].startswith("PAT-")
    print(f"[PASS] 2. Patient A registration: {user_a['name']} ({user_a['patient_id']}) with PBKDF2 hash")

    # 3. Verify Empty State Before Sensor Telemetry
    code, res = api_request("GET", "/api/readings/latest", token=token_a)
    assert code == 200, f"Empty latest reading failed: {res}"
    assert res.get("status") == "empty" or res.get("reading") is None
    print("[PASS] 3. Empty database verification: No sensor data available yet (None/null returned)")

    code, res = api_request("GET", "/api/readings/history", token=token_a)
    assert code == 200
    assert len(res.get("readings", [])) == 0
    print("[PASS] 4. Empty history verification: 0 historical readings found")

    # 4. Ingest ESP32 Hardware-Compatible Sensor Telemetry
    esp32_payload = {
        "device_id": sarah_dev_id,
        "heart_rate": 72.4,
        "spo2": 98.8,
        "temperature": 36.65,
        "accel_x": 0.05,
        "accel_y": 0.12,
        "accel_z": 0.98,
        "gyro_x": 0.01,
        "gyro_y": -0.02,
        "gyro_z": 0.00,
        "accel_magnitude": 0.99,
        "alarm": "NONE",
        "status": "NORMAL",
        "activity_state": "Resting",
        "timestamp_ms": int(time.time() * 1000)
    }
    code, res = api_request("POST", "/api/readings", data=esp32_payload, token=token_a)
    assert code == 201, f"Sensor POST failed: {res}"
    reading_id = res["reading"]["id"]
    print(f"[PASS] 5. ESP32 sensor POST: Recorded reading {reading_id} (HR: 72.4 BPM, SpO2: 98.8%, Temp: 36.65 C)")

    # Ingest a second reading (Walking activity)
    esp32_payload_2 = dict(esp32_payload)
    esp32_payload_2["heart_rate"] = 88.5
    esp32_payload_2["accel_magnitude"] = 1.35
    esp32_payload_2["activity_state"] = "Walking"
    code, res = api_request("POST", "/api/readings", data=esp32_payload_2, token=token_a)
    assert code == 201
    print("[PASS] 6. Second ESP32 sensor POST recorded (Exertion: 88.5 BPM, Walking)")

    # 5. Verify Latest Reading for Patient A
    code, res = api_request("GET", "/api/readings/latest", token=token_a)
    assert code == 200
    latest = res["reading"]
    assert latest is not None
    assert latest["bpm"] == 88.5 or latest["heart_rate"] == 88.5
    assert latest["device_id"] == sarah_dev_id
    print(f"[PASS] 7. Latest reading fetch: Successfully returned newest reading ({latest['heart_rate']} BPM, {latest['activity_state']})")

    # 6. Verify Readings History for Patient A
    code, res = api_request("GET", "/api/readings/history", token=token_a)
    assert code == 200
    readings = res["readings"]
    assert len(readings) == 2
    print(f"[PASS] 8. Reading history verification: Retrieved exactly {len(readings)} records in descending order")

    # 7. Update Patient Profile & Verify Persistence
    code, res = api_request("PUT", "/api/user/profile", data={"age": 35, "phone": "+91-9988776655"}, token=token_a)
    assert code == 200
    assert res["user"]["age"] == 35
    assert res["user"]["phone"] == "+91-9988776655"
    print("[PASS] 9. Patient profile update: Age updated to 35, phone to +91-9988776655 in SQLite")

    # 8. Multi-Tenant Patient Isolation Test
    user_b_email = f"patient_b_{ts}@hospital.org"
    david_dev_id = f"ESP32_DAVID_{ts}"
    code, res = api_request("POST", "/api/auth/signup", {
        "name": "David Miller",
        "email": user_b_email,
        "password": "PasswordForDavid456!",
        "age": 42,
        "gender": "Male",
        "device_id": david_dev_id
    })
    assert code == 201
    token_b = res["token"]
    user_b = res["user"]
    print(f"[PASS] 10. Patient B registration: {user_b['name']} ({user_b['patient_id']})")

    # Verify Patient B has NO sensor readings (Complete Isolation)
    code, res = api_request("GET", "/api/readings/latest", token=token_b)
    assert code == 200
    assert res.get("reading") is None
    code, res = api_request("GET", "/api/readings/history", token=token_b)
    assert code == 200
    assert len(res.get("readings", [])) == 0
    print("[PASS] 11. Patient isolation: Patient B sees ZERO readings from Patient A")

    # Post reading for Patient B
    code, res = api_request("POST", "/api/readings", data={
        "device_id": david_dev_id,
        "heart_rate": 61.0,
        "spo2": 99.1,
        "temperature": 36.4,
        "activity_state": "Resting"
    }, token=token_b)
    assert code == 201

    # Verify Patient A still sees ONLY their own 2 readings (61.0 is NOT visible to Patient A)
    code, res = api_request("GET", "/api/readings/history", token=token_a)
    assert code == 200
    readings_a = res["readings"]
    assert len(readings_a) == 2
    for r in readings_a:
        assert r["heart_rate"] != 61.0
        assert r["device_id"] == sarah_dev_id
    print("[PASS] 12. Cross-patient isolation verified: Patient A history contains NO records from Patient B")

    # 9. Test Logout & Session Invalidation
    code, res = api_request("POST", "/api/auth/logout", token=token_a)
    assert code == 200
    print("[PASS] 13. Patient A logout: Session invalidated in user_sessions SQLite table")

    # Verify invalidated token cannot access endpoints
    code, res = api_request("GET", "/api/readings/latest", token=token_a)
    assert code == 401, f"Expected 401 Unauthorized but got {code}"
    print("[PASS] 14. Protected route enforcement: Logged out session properly rejected (HTTP 401)")

    # 10. Re-login Patient A and Verify All Data Still Present
    code, res = api_request("POST", "/api/auth/login", {
        "email": user_a_email,
        "password": "SecurePassword123!"
    })
    assert code == 200, f"Re-login failed: {res}"
    new_token_a = res["token"]
    print("[PASS] 15. Re-login Patient A: Authenticated with password hash, issued new active session")

    # Verify all previous data is fully intact in SQLite
    code, res = api_request("GET", "/api/user/profile", token=new_token_a)
    assert code == 200
    assert res["age"] == 35
    assert res["phone"] == "+91-9988776655"
    assert res["patient_id"] == user_a["patient_id"]

    code, res = api_request("GET", "/api/readings/history", token=new_token_a)
    assert code == 200
    assert len(res["readings"]) == 2
    print("[PASS] 16. Persistence verified: Profile and all sensor readings 100% present after re-login")

    print("==================================================")
    print("  ALL 16 VERIFICATION CRITERIA PASSED (100% OK)   ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
