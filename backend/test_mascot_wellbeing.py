import sys
import os
import sqlite3
import datetime

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app
import database

client = TestClient(app)

def test_mascot_wellbeing_flow():
    print("====================================================")
    print("TESTING AI MASCOT WELL-BEING CHECK & SQLITE FLOW")
    print("====================================================")

    # 1. Login target user
    login_resp = client.post("/api/auth/login", json={
        "email": "singhdiya1720@gmail.com",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]
    user_id = login_resp.json()["user"]["id"]
    auth_headers = {"Authorization": f"Bearer {token}"}
    print(f"[OK] Logged in as target user: {user_id}")

    # 2. Check Abnormality / Alerts in SQLite
    obs_resp = client.get("/api/observations", headers=auth_headers)
    assert obs_resp.status_code == 200
    alerts = obs_resp.json()["observations"]
    warning_alerts = [a for a in alerts if a["severity"] == "warning"]
    print(f"[OK] Found {len(warning_alerts)} warning alerts in SQLite for target user.")
    assert len(warning_alerts) >= 3, "Expected at least 3 warning alerts!"

    # 3. Simulate User Clicking "I'm okay" on Mascot Prompt
    checkin_payload_ok = {
        "mood": "Good",
        "activity": "Resting",
        "notes": "User response to AWEN Mascot prompt: Confirmed feeling okay."
    }
    resp1 = client.post("/api/user/checkins", json=checkin_payload_ok, headers=auth_headers)
    assert resp1.status_code == 201
    saved_chk1 = resp1.json()
    print(f"[OK] Saved Mascot Check-in (Feeling Okay): id={saved_chk1['id']}, mood={saved_chk1['mood']}")

    # 4. Simulate User Clicking "Not feeling well" on Mascot Prompt
    checkin_payload_unwell = {
        "mood": "Difficult",
        "activity": "Resting",
        "notes": "User response to AWEN Mascot prompt: Indicated feeling unwell."
    }
    resp2 = client.post("/api/user/checkins", json=checkin_payload_unwell, headers=auth_headers)
    assert resp2.status_code == 201
    saved_chk2 = resp2.json()
    print(f"[OK] Saved Mascot Check-in (Feeling Unwell): id={saved_chk2['id']}, mood={saved_chk2['mood']}")

    # 5. Query Checkins via API and SQLite
    list_resp = client.get("/api/user/checkins?limit=5", headers=auth_headers)
    assert list_resp.status_code == 200
    checkins_list = list_resp.json()
    assert len(checkins_list) >= 2
    assert checkins_list[0]["id"] == saved_chk2["id"]
    assert checkins_list[1]["id"] == saved_chk1["id"]
    print(f"[OK] Verified check-in records retrieved via GET /api/user/checkins.")

    # 6. Verify SQLite direct query
    conn = database.get_db_connection()
    c = conn.cursor()
    c.execute("SELECT id, mood, notes, created_at FROM user_checkins WHERE user_id = ? ORDER BY created_at DESC LIMIT 2", (user_id,))
    rows = c.fetchall()
    conn.close()
    assert len(rows) == 2
    print(f"[OK] Verified SQLite awen.db user_checkins table holds records:")
    for r in rows:
        print(f"  ID: {r['id']}, Mood: {r['mood']}, Notes: {r['notes'][:40]}..., Time: {r['created_at']}")

    print("\n====================================================")
    print("ALL MASCOT WELL-BEING TEST CHECKS PASSED [OK]!")
    print("====================================================")

if __name__ == "__main__":
    test_mascot_wellbeing_flow()
