from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "crop_recommendation_model.joblib"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

artifact = joblib.load(MODEL_PATH)
model = artifact["model"]
FEATURES = artifact["features"]

app = FastAPI(
    title="AgriTrace Crop Recommendation API",
    version="1.0.0",
    description="Crop recommendations based on soil and environmental conditions."
)


class CropInput(BaseModel):
    N: float = Field(ge=0, le=200, description="Soil nitrogen")
    P: float = Field(ge=0, le=200, description="Soil phosphorus")
    K: float = Field(ge=0, le=250, description="Soil potassium")
    temperature: float = Field(ge=-10, le=60)
    humidity: float = Field(ge=0, le=100)
    ph: float = Field(ge=0, le=14)
    rainfall: float = Field(ge=0, le=5000)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "crop-recommendation",
        "model_loaded": True,
        "classes": len(artifact["classes"])
    }


@app.post("/predict")
def predict(data: CropInput):
    try:
        values = data.model_dump()
        features = pd.DataFrame(
            [[values[name] for name in FEATURES]],
            columns=FEATURES
        )

        probabilities = model.predict_proba(features)[0]
        ranked = probabilities.argsort()[::-1][:3]

        recommendations = [
            {
                "crop": str(model.classes_[i]),
                "confidence": round(float(probabilities[i]) * 100, 2)
            }
            for i in ranked
        ]

        return {
            "success": True,
            "recommended_crop": recommendations[0]["crop"],
            "confidence": recommendations[0]["confidence"],
            "recommendations": recommendations
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Crop prediction failed."
        ) from exc
