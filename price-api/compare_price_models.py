
from pathlib import Path
import time
import json

import numpy as np
import pandas as pd
import joblib

from catboost import CatBoostRegressor
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OrdinalEncoder
from xgboost import XGBRegressor


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

BASE = Path(__file__).parent
DATA = BASE / "agritrace_prices_with_historical_weather.csv"
OUT = BASE / "model_comparison"
OUT.mkdir(parents=True, exist_ok=True)

PRICE = "Modal Price (Rs./Quintal)"
DATE = "Price Date"

KEYS = [
    "State",
    "District Name",
    "Market Name",
    "Commodity",
    "Variety",
    "Grade",
]

CATS = KEYS.copy()

RANDOM_STATE = 42


# --------------------------------------------------
# LOAD AND VALIDATE DATA
# --------------------------------------------------

print("Loading dataset...", flush=True)

if not DATA.exists():
    raise FileNotFoundError(f"Dataset not found: {DATA}")

df = pd.read_csv(DATA, low_memory=False)

required = KEYS + [DATE, PRICE]
missing = [c for c in required if c not in df.columns]

if missing:
    raise ValueError(f"Missing required columns: {missing}")

df[DATE] = pd.to_datetime(df[DATE], errors="coerce")
df[PRICE] = pd.to_numeric(df[PRICE], errors="coerce")

df = df.dropna(subset=[DATE, PRICE]).copy()
df = df[df[PRICE] > 0].copy()

for col in CATS:
    df[col] = df[col].fillna("Unknown").astype(str).str.strip()
    df.loc[df[col] == "", col] = "Unknown"

# Remove exact duplicate observations before constructing targets.
df = df.drop_duplicates(subset=KEYS + [DATE, PRICE])

# One target price per market/commodity/date key.
# If multiple grades/varieties exist, keep them separate.
df = df.sort_values(DATE).reset_index(drop=True)

print(f"Valid source rows: {len(df):,}", flush=True)


# --------------------------------------------------
# CONSTRUCT EXACT SEVEN-CALENDAR-DAY TARGET
# --------------------------------------------------

print("Matching prices exactly seven calendar days later...", flush=True)

future = df[KEYS + [DATE, PRICE]].copy()

# Shift future date back by 7 days so it joins the current observation.
future[DATE] = future[DATE] - pd.Timedelta(days=7)
future = future.rename(columns={PRICE: "target_price"})

# Resolve duplicate target rows deterministically.
future = future.sort_values("target_price")
future = future.drop_duplicates(subset=KEYS + [DATE], keep="last")

df = df.merge(
    future,
    on=KEYS + [DATE],
    how="inner",
    validate="many_to_one",
)

df = df.dropna(subset=["target_price"])
df = df[df["target_price"] > 0].copy()

if len(df) < 100:
    raise ValueError(
        f"Only {len(df):,} matched rows have a price exactly 7 days later. "
        "There may not be enough daily market observations for this target."
    )

df["month"] = df[DATE].dt.month
df["day_of_week"] = df[DATE].dt.dayofweek
df["day_of_year"] = df[DATE].dt.dayofyear

df = df.sort_values(DATE).reset_index(drop=True)

print(f"Matched seven-day rows: {len(df):,}", flush=True)
print(f"Unique dates: {df[DATE].nunique():,}", flush=True)


# --------------------------------------------------
# CHRONOLOGICAL DATE-BASED SPLIT
# --------------------------------------------------

dates = np.sort(df[DATE].dropna().unique())

if len(dates) < 5:
    raise ValueError("Not enough distinct dates for a chronological split.")

cut_index = int(len(dates) * 0.8)
cut_index = min(max(cut_index, 1), len(dates) - 1)
split_date = pd.Timestamp(dates[cut_index])

train = df[df[DATE] < split_date].copy()
test = df[df[DATE] >= split_date].copy()

if train.empty or test.empty:
    raise ValueError("Chronological train/test split produced an empty set.")

print(f"Split date: {split_date.date()}", flush=True)
print(f"Train rows: {len(train):,}", flush=True)
print(f"Test rows: {len(test):,}", flush=True)
print(
    f"Test period: {test[DATE].min().date()} to {test[DATE].max().date()}",
    flush=True,
)


# --------------------------------------------------
# FEATURES
# --------------------------------------------------

# Initial comparison uses only fields available in the existing API.
# Weather is deliberately excluded until future-weather availability
# can be handled correctly.
FEATURES = CATS + [
    PRICE,
    "month",
    "day_of_week",
    "day_of_year",
]

NUMERIC = [
    PRICE,
    "month",
    "day_of_week",
    "day_of_year",
]

X_train = train[FEATURES].copy()
X_test = test[FEATURES].copy()

y_train = train["target_price"].to_numpy()
y_test = test["target_price"].to_numpy()

# CatBoost accepts string categories directly.
# Scikit-learn and XGBoost use a separate fitted encoder.
preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            Pipeline(
                steps=[
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    (
                        "encoder",
                        OrdinalEncoder(
                            handle_unknown="use_encoded_value",
                            unknown_value=-1,
                        ),
                    ),
                ]
            ),
            CATS,
        ),
        (
            "numeric",
            SimpleImputer(strategy="median"),
            NUMERIC,
        ),
    ],
    remainder="drop",
)

print("Encoding features for Random Forest and XGBoost...", flush=True)
X_train_encoded = preprocessor.fit_transform(X_train)
X_test_encoded = preprocessor.transform(X_test)


# --------------------------------------------------
# TRAIN MODELS
# --------------------------------------------------

models = {
    "CatBoost": CatBoostRegressor(
        iterations=500,
        depth=8,
        learning_rate=0.05,
        loss_function="RMSE",
        random_seed=RANDOM_STATE,
        thread_count=-1,
        verbose=False,
        allow_writing_files=False,
    ),
    "Random Forest": RandomForestRegressor(
        n_estimators=100,
        min_samples_leaf=2,
        max_features=0.8,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    ),
    "XGBoost": XGBRegressor(
        n_estimators=400,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        tree_method="hist",
        n_jobs=-1,
        random_state=RANDOM_STATE,
    ),
}

results = []

for name, model in models.items():
    print(f"\nTraining {name}...", flush=True)
    start = time.time()

    if name == "CatBoost":
        model.fit(
            X_train,
            y_train,
            cat_features=CATS,
            verbose=False,
        )
        predictions = model.predict(X_test)
        model.save_model(str(OUT / "catboost_7day.cbm"))

    else:
        model.fit(X_train_encoded, y_train)
        predictions = model.predict(X_test_encoded)

        filename = name.lower().replace(" ", "_") + ".joblib"
        joblib.dump(
            {
                "preprocessor": preprocessor,
                "model": model,
                "features": FEATURES,
                "categorical_features": CATS,
            },
            OUT / filename,
        )

    predictions = np.maximum(np.asarray(predictions), 0)

    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))

    results.append(
        {
            "model": name,
            "test_rows": len(y_test),
            "MAE_Rs_per_quintal": round(float(mae), 2),
            "RMSE_Rs_per_quintal": round(float(rmse), 2),
            "training_seconds": round(time.time() - start, 2),
        }
    )

    print(f"MAE: Rs. {mae:.2f}/quintal", flush=True)
    print(f"RMSE: Rs. {rmse:.2f}/quintal", flush=True)


# --------------------------------------------------
# BASELINE: NO CHANGE FROM CURRENT PRICE
# --------------------------------------------------

baseline_predictions = np.maximum(
    test[PRICE].to_numpy(dtype=float),
    0,
)

baseline_mae = mean_absolute_error(y_test, baseline_predictions)
baseline_rmse = np.sqrt(
    mean_squared_error(y_test, baseline_predictions)
)

results.append(
    {
        "model": "Current-price baseline",
        "test_rows": len(y_test),
        "MAE_Rs_per_quintal": round(float(baseline_mae), 2),
        "RMSE_Rs_per_quintal": round(float(baseline_rmse), 2),
        "training_seconds": 0,
    }
)


# --------------------------------------------------
# SAVE RESULTS
# --------------------------------------------------

comparison = pd.DataFrame(results).sort_values(
    "MAE_Rs_per_quintal"
)

comparison.to_csv(OUT / "comparison_results.csv", index=False)
comparison.to_json(
    OUT / "comparison_results.json",
    orient="records",
    indent=2,
)

metadata = {
    "dataset": DATA.name,
    "target": "Observed price exactly 7 calendar days after Price Date",
    "split_method": "Chronological split by distinct Price Date",
    "split_date": split_date.date().isoformat(),
    "train_rows": int(len(train)),
    "test_rows": int(len(test)),
    "train_start": train[DATE].min().date().isoformat(),
    "train_end": train[DATE].max().date().isoformat(),
    "test_start": test[DATE].min().date().isoformat(),
    "test_end": test[DATE].max().date().isoformat(),
    "features": FEATURES,
    "weather_features_used": False,
}

with open(OUT / "evaluation_metadata.json", "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)

print("\n=== MODEL COMPARISON ===", flush=True)
print(comparison.to_string(index=False), flush=True)
print(f"\nResults saved in: {OUT}", flush=True)
