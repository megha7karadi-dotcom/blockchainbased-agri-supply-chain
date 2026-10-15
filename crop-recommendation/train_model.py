from pathlib import Path
import json

import joblib
import pandas as pd
import sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "Crop_recommendation.csv"
MODEL_FILE = BASE_DIR / "crop_recommendation_model.joblib"
METRICS_FILE = BASE_DIR / "training_metrics.json"

FEATURES = [
    "N", "P", "K", "temperature",
    "humidity", "ph", "rainfall"
]
TARGET = "label"


def main():
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_FILE}")

    df = pd.read_csv(DATA_FILE)
    df.columns = df.columns.str.strip()

    required = FEATURES + [TARGET]
    missing = [column for column in required if column not in df.columns]
    if missing:
        raise ValueError(
            f"Unexpected dataset columns. Missing: {missing}. "
            f"Found: {df.columns.tolist()}"
        )

    df = df[required].dropna().copy()

    for column in FEATURES:
        df[column] = pd.to_numeric(df[column], errors="raise")

    if df[TARGET].nunique() < 2:
        raise ValueError("Training requires at least two crop classes.")

    X = df[FEATURES]
    y = df[TARGET].astype(str)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )

    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)
    report = classification_report(
        y_test, predictions, output_dict=True, zero_division=0
    )

    artifact = {
        "model": model,
        "features": FEATURES,
        "classes": model.classes_.tolist(),
        "dataset": DATA_FILE.name,
        "sklearn_version": sklearn.__version__
    }

    joblib.dump(artifact, MODEL_FILE)

    metrics = {
        "dataset_rows_after_cleaning": int(len(df)),
        "number_of_classes": int(y.nunique()),
        "class_names": sorted(y.unique().tolist()),
        "training_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
        "accuracy": float(accuracy),
        "classification_report": report,
        "random_state": 42,
        "model": "RandomForestClassifier",
        "sklearn_version": sklearn.__version__
    }

    METRICS_FILE.write_text(json.dumps(metrics, indent=2))

    print("\nDataset columns:", df.columns.tolist())
    print("Rows used:", len(df))
    print("Crop classes:", y.nunique())
    print(f"Test accuracy: {accuracy:.4f}")
    print("\nClassification report:")
    print(classification_report(y_test, predictions, zero_division=0))
    print("\nSaved model:", MODEL_FILE)
    print("Saved metrics:", METRICS_FILE)


if __name__ == "__main__":
    main()
