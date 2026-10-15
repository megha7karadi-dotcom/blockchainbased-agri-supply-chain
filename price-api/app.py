
from datetime import date, timedelta
from pathlib import Path

import pandas as pd
from catboost import CatBoostRegressor
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="AgriTrace Price Prediction")

MODEL_PATH = Path(__file__).parent / "agritrace_price_7day.cbm"

model = CatBoostRegressor()
model.load_model(str(MODEL_PATH))

FEATURES = [
    "State", "District Name", "Commodity", "Market Name",
    "Modal Price (Rs./Quintal)",
    "month", "day_of_week", "day_of_year"
]

CATEGORICAL = ["State", "District Name", "Commodity", "Market Name"]


class PredictionInput(BaseModel):
    state: str
    district: str
    commodity: str
    market: str
    current_price: float = Field(gt=0)
    forecast_date: date


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(body: PredictionInput):
    forecast_date = body.forecast_date

    row = {
        "State": body.state,
        "District Name": body.district,
        "Commodity": body.commodity,
        "Market Name": body.market,
        "Modal Price (Rs./Quintal)": body.current_price,
        "month": forecast_date.month,
        "day_of_week": forecast_date.weekday(),
        "day_of_year": forecast_date.timetuple().tm_yday
    }

    X = pd.DataFrame([row], columns=FEATURES)
    for col in CATEGORICAL:
        X[col] = X[col].astype(str)

    predicted = max(0.0, float(model.predict(X)[0]))

    return {
        "commodity": body.commodity,
        "market": body.market,
        "forecast_date": forecast_date.isoformat(),
        "target_date": (forecast_date + timedelta(days=7)).isoformat(),
        "predicted_price_per_quintal": round(predicted, 2),
        "predicted_price_per_kg": round(predicted / 100, 2),
        "currency": "INR",
        "unit": "quintal",
        "forecast_horizon_days": 7
    }
