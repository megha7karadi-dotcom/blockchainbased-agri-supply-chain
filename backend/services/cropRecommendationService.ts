const CROP_API_URL =
  process.env.CROP_RECOMMENDATION_API_URL || 'http://127.0.0.1:8001';

export interface CropRecommendationInput {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export async function recommendCrop(input: CropRecommendationInput) {
  const response = await fetch(`${CROP_API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Crop recommendation API returned ${response.status}: ${details}`
    );
  }

  return response.json();
}
