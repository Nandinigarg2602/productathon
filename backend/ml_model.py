"""
Lead scoring model - uses XGBoost trained on entity features.
Extracts features from company name + signal text, outputs confidence score 0-100.
"""

import os
import numpy as np
import pandas as pd
import xgboost as xgb

# Path to model (relative to backend/)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "xgboost_guest_model.json")

# Feature columns expected by the model (from xgboost_model.py)
BASE_FEATURES = ["username_len", "username_sum_ord", "num_digits", "num_letters"]
DATETIME_FEATURES = [
    "valid_from_hour", "valid_from_day", "valid_from_month",
    "valid_to_hour", "valid_to_day", "valid_to_month"
]
FEATURE_COLS = BASE_FEATURES + DATETIME_FEATURES

# Default datetime values (from training data)
DEFAULT_DATETIME = [23, 6, 2, 23, 8, 2]  # hour, day, month for valid_from and valid_to

_model = None


def _extract_text_features(text: str) -> dict:
    """Extract same features as xgboost_model.py from any string (company name, signal)."""
    s = str(text) if text else ""
    return {
        "username_len": len(s),
        "username_sum_ord": sum(ord(c) for c in s),
        "num_digits": sum(1 for c in s if c.isdigit()),
        "num_letters": sum(1 for c in s if c.isalpha()),
    }


def _get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
        _model = xgb.XGBRegressor()
        _model.load_model(MODEL_PATH)
    return _model


def predict_confidence(company_name: str, signal_text: str = "") -> float:
    """
    Predict lead confidence score (0-100) using XGBoost model.
    Combines features from company name and signal text for richer representation.
    """
    model = _get_model()

    # Combine company + signal for feature extraction (signal adds intent context)
    combined = f"{company_name} {signal_text}".strip()

    feats = _extract_text_features(combined)
    values = [feats[k] for k in BASE_FEATURES]
    values.extend(DEFAULT_DATETIME)

    X = pd.DataFrame([values], columns=FEATURE_COLS)

    pred = model.predict(X)[0]

    # Scale model output (trained on 0-9999 range) to 0-100 confidence
    # Clip and normalize
    raw_score = float(np.clip(pred, 0, 10000))
    confidence = min(100, max(0, (raw_score / 10000) * 100))

    return round(confidence, 1)


def enrich_lead_with_score(lead: dict) -> dict:
    """Add AI-predicted confidence score to a lead. Blends with static if present."""
    company = lead.get("company", "")
    signal = lead.get("signal", "")
    ai_score = predict_confidence(company, signal)

    # Blend: 70% AI model + 30% static (if provided) for demo variety
    static = lead.get("confidence")
    if static is not None:
        confidence = round(0.7 * ai_score + 0.3 * static, 1)
    else:
        confidence = ai_score

    return {**lead, "confidence": min(100, max(0, confidence)), "ai_score": ai_score}
