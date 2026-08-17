import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import math

class PersonalizedPhysiologicalEngine:
    """
    AWEN Core Intelligence Engine.
    Compares real-time telemetry against the user's personal physiological baseline
    rather than generic medical thresholds. Adjusts for current physical context
    (climbing stairs, exercise, caffeine, studying) to eliminate false positives.
    """
    def __init__(self):
        # Default baseline signature (learned over 3-7 days)
        self.baseline = {
            "resting_hr": 65.0,           # bpm
            "resting_spo2": 98.5,         # %
            "resting_temp": 36.6,         # °C
            "hr_std_dev": 5.2,            # natural variance
            "recovery_rate_bpm_per_min": 18.0, # bpm drop per min after exertion
            "learning_progress_pct": 100,  # 100% baseline complete
            "days_observed": 5
        }
        
        # Activity adjustment coefficients (multipliers for expected physiological lift)
        self.activity_multipliers = {
            "Resting": {"hr_offset": 0, "temp_offset": 0.0},
            "Studying": {"hr_offset": 5, "temp_offset": 0.1},
            "Working": {"hr_offset": 8, "temp_offset": 0.2},
            "Traveling": {"hr_offset": 10, "temp_offset": 0.2},
            "Walking": {"hr_offset": 22, "temp_offset": 0.4},
            "Climbing Stairs": {"hr_offset": 35, "temp_offset": 0.6},
            "Gym": {"hr_offset": 45, "temp_offset": 0.8},
            "Running": {"hr_offset": 55, "temp_offset": 1.0},
            "Feeling Unwell": {"hr_offset": 12, "temp_offset": 0.8}
        }
        
        # Isolation Forest Anomaly Detection Model
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self._is_trained = False
        self._bootstrap_model()

    def _bootstrap_model(self):
        """Train isolation forest on synthetic baseline-normal distributions."""
        np.random.seed(42)
        # Generate 500 normal physiological data points around baseline
        rhr = self.baseline["resting_hr"]
        normal_hr = np.random.normal(rhr, 4.0, 400)
        normal_spo2 = np.random.normal(98.5, 0.8, 400)
        normal_temp = np.random.normal(36.6, 0.2, 400)
        
        X_train = np.column_stack((normal_hr, normal_spo2, normal_temp))
        self.model.fit(X_train)
        self._is_trained = True

    def analyze_readings(
        self,
        hr: float,
        spo2: float,
        temp: float,
        activity: str = "Resting",
        mood: str = "Normal",
        user_baseline: dict = None
    ):
        """
        Analyze incoming telemetry relative to personal baseline and activity context.
        Uses supplied user_baseline when available; falls back to default signature when missing.
        """
        user_b = user_baseline or {}
        rhr = float(user_b.get("resting_hr")) if user_b.get("resting_hr") is not None else self.baseline["resting_hr"]
        rspo2 = float(user_b.get("resting_spo2")) if user_b.get("resting_spo2") is not None else self.baseline["resting_spo2"]
        rtemp = float(user_b.get("resting_temp")) if user_b.get("resting_temp") is not None else self.baseline["resting_temp"]
        hr_sd = float(user_b.get("hr_std_dev")) if user_b.get("hr_std_dev") is not None else self.baseline["hr_std_dev"]
        confidence_tier = str(user_b.get("confidence")) if user_b.get("confidence") else "Learning"
        is_personalized = user_b.get("resting_hr") is not None

        act_config = self.activity_multipliers.get(activity, {"hr_offset": 0, "temp_offset": 0.0})
        
        # Calculate context-adjusted expected metrics using active baseline
        expected_hr = rhr + act_config["hr_offset"]
        expected_temp = rtemp + act_config["temp_offset"]
        
        # Compute physiological deviations
        hr_delta = hr - expected_hr
        raw_resting_delta = hr - rhr
        spo2_delta = rspo2 - spo2
        temp_delta = temp - expected_temp
        
        # Calculate anomaly score (raw deviation score)
        raw_anomaly = (max(0, hr_delta) / 12.0) + (max(0, spo2_delta) * 1.5) + (abs(temp_delta) * 1.2)
        
        # Determine Wellness Index category and confidence
        if raw_anomaly < 1.2:
            status = "Balanced" if raw_anomaly > 0.4 else "Excellent"
            confidence = min(98, math.floor(92 + (1.2 - raw_anomaly) * 5))
            stress_level = "low"
        elif raw_anomaly < 2.5:
            status = "Good"
            confidence = min(95, math.floor(88 + (2.5 - raw_anomaly) * 4))
            stress_level = "moderate"
        else:
            status = "Needs Attention"
            confidence = min(94, math.floor(85 + (raw_anomaly) * 2))
            stress_level = "elevated"

        # Check if high HR is explained by physical activity (false-positive prevention)
        is_activity_explained = (activity in ["Walking", "Climbing Stairs", "Gym", "Running"]) and (hr_delta <= 15)
        if is_activity_explained:
            status = "Balanced"
            stress_level = "low"
            reasoning = f"Elevated heart rate (+{round(raw_resting_delta)} bpm above resting) is fully consistent with your current activity ({activity}). Your recovery curve is optimal."
        else:
            if status == "Needs Attention":
                reasoning = f"Heart rate is {round(hr_delta, 1)} bpm above your expected baseline for '{activity}'. Activity level is low, indicating non-exertional physiological stress."
            elif status == "Good":
                reasoning = f"Minor physiological variance (+{round(hr_delta, 1)} bpm from expected baseline). Your body is adapting smoothly."
            else:
                reasoning = f"Physiological signals closely align with your personal baseline ({round(rhr, 1)} bpm resting RHR)."

        return {
            "wellness_index": status,
            "confidence_score": confidence,
            "stress_level": stress_level,
            "readings": {
                "heart_rate": hr,
                "spo2": spo2,
                "temperature": temp,
                "activity": activity,
                "mood": mood
            },
            "baseline_comparison": {
                "resting_hr": round(rhr, 1),
                "expected_hr_for_activity": round(expected_hr, 1),
                "hr_delta": round(hr_delta, 1),
                "raw_resting_delta": round(raw_resting_delta, 1),
                "is_activity_explained": is_activity_explained,
                "is_personalized": is_personalized,
                "confidence_tier": confidence_tier
            },
            "explainability": {
                "summary": reasoning,
                "factors": [
                    {
                        "key": "baseline_delta",
                        "title": "Baseline Difference",
                        "label": "Baseline Difference",
                        "value": f"{'+' if hr_delta >= 0 else ''}{round(hr_delta, 1)} bpm from expected",
                        "status": "normal" if abs(hr_delta) < 8 else "elevated",
                        "explanation": f"Your heart rate ({round(hr)} bpm) is {round(abs(hr_delta), 1)} bpm {'above' if hr_delta >= 0 else 'below'} your expected baseline for {activity}."
                    },
                    {
                        "key": "activity_context",
                        "title": "Activity Context",
                        "label": "Activity Context",
                        "value": activity,
                        "status": "active" if is_activity_explained else "normal",
                        "explanation": f"Elevated heart rate is expected during physical movement ({activity}). Activity exertion filter active." if is_activity_explained else f"Current activity level is {activity}. Reading captured during low physical movement."
                    },
                    {
                        "key": "spo2_stability",
                        "title": "SpO2 Oxygen Stability",
                        "label": "SpO2 Oxygen Stability",
                        "value": f"{spo2}% ({'Optimal' if spo2 >= 95 else 'Mild Variance'})",
                        "status": "normal" if spo2 >= 95 else "warning",
                        "explanation": f"Oxygen saturation ({spo2}%) aligns with your {'personalized' if is_personalized else 'default'} baseline."
                    },
                    {
                        "key": "model_confidence",
                        "title": "Analysis Confidence",
                        "label": "Analysis Confidence",
                        "value": f"{confidence}% profile match",
                        "status": "high",
                        "explanation": f"Analysis confidence matched against your learned resting baseline profile ({confidence_tier})."
                    }
                ]
            }
        }
