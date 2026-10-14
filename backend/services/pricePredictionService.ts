
const PRICE_API_URL = (
  process.env.PRICE_API_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '');

export interface CropPricePredictionInput {
  state: string;
  district: string;
  commodity: string;
  market: string;
  current_price: number;
  forecast_date: string;
}

export interface CropPricePredictionResult {
  commodity: string;
  market: string;
  forecast_date: string;
  target_date: string;
  predicted_price_per_quintal: number;
  predicted_price_per_kg: number;
  currency: string;
  unit: string;
  forecast_horizon_days: number;
}

export async function predictCropPrice(
  input: CropPricePredictionInput
): Promise<CropPricePredictionResult> {
  const response = await fetch(`${PRICE_API_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Python prediction API returned ${response.status}: ${details}`
    );
  }

  return (await response.json()) as CropPricePredictionResult;
}
