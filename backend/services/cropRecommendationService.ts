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

export interface CropRecommendationResult {
  success: boolean;
  recommended_crop: string;
  confidence: number;
  recommendations: Array<{
    crop: string;
    confidence: number;
  }>;
}

const CROP_CENTROIDS: Record<string, { N: number; P: number; K: number; temperature: number; humidity: number; ph: number; rainfall: number }> = {
  rice: { N: 80, P: 48, K: 40, temperature: 23.7, humidity: 82.3, ph: 6.43, rainfall: 236.2 },
  maize: { N: 78, P: 48, K: 20, temperature: 22.4, humidity: 65.1, ph: 6.25, rainfall: 84.8 },
  chickpea: { N: 40, P: 68, K: 80, temperature: 18.9, humidity: 16.9, ph: 7.34, rainfall: 80.1 },
  kidneybeans: { N: 21, P: 68, K: 20, temperature: 20.1, humidity: 21.6, ph: 5.75, rainfall: 105.9 },
  pigeonpeas: { N: 21, P: 68, K: 20, temperature: 27.7, humidity: 48.1, ph: 5.79, rainfall: 149.5 },
  mothbeans: { N: 21, P: 48, K: 20, temperature: 28.2, humidity: 53.2, ph: 6.83, rainfall: 51.2 },
  mungbean: { N: 21, P: 47, K: 20, temperature: 28.5, humidity: 85.5, ph: 6.72, rainfall: 48.4 },
  blackgram: { N: 40, P: 67, K: 19, temperature: 30.0, humidity: 65.1, ph: 7.13, rainfall: 67.9 },
  lentil: { N: 19, P: 68, K: 19, temperature: 24.5, humidity: 64.8, ph: 6.93, rainfall: 45.7 },
  pomegranate: { N: 19, P: 19, K: 40, temperature: 21.8, humidity: 90.1, ph: 6.43, rainfall: 107.5 },
  banana: { N: 100, P: 82, K: 50, temperature: 27.4, humidity: 80.4, ph: 5.98, rainfall: 104.6 },
  mango: { N: 20, P: 27, K: 30, temperature: 31.2, humidity: 50.2, ph: 5.77, rainfall: 94.7 },
  grapes: { N: 23, P: 133, K: 200, temperature: 23.8, humidity: 81.9, ph: 6.03, rainfall: 69.6 },
  watermelon: { N: 99, P: 17, K: 50, temperature: 25.6, humidity: 85.2, ph: 6.50, rainfall: 50.8 },
  muskmelon: { N: 100, P: 18, K: 50, temperature: 28.7, humidity: 92.3, ph: 6.36, rainfall: 24.7 },
  apple: { N: 21, P: 134, K: 200, temperature: 22.6, humidity: 92.3, ph: 5.93, rainfall: 112.7 },
  orange: { N: 20, P: 17, K: 10, temperature: 22.8, humidity: 92.2, ph: 7.02, rainfall: 110.5 },
  papaya: { N: 50, P: 59, K: 50, temperature: 33.7, humidity: 92.4, ph: 6.74, rainfall: 142.6 },
  coconut: { N: 22, P: 17, K: 31, temperature: 27.4, humidity: 94.8, ph: 5.98, rainfall: 175.7 },
  cotton: { N: 118, P: 46, K: 20, temperature: 24.0, humidity: 79.8, ph: 6.91, rainfall: 80.4 },
  jute: { N: 78, P: 47, K: 40, temperature: 25.0, humidity: 79.6, ph: 6.73, rainfall: 174.8 },
  coffee: { N: 101, P: 29, K: 30, temperature: 25.5, humidity: 58.9, ph: 6.79, rainfall: 158.1 },
};

const FEATURE_SCALES = {
  N: 35,
  P: 25,
  K: 35,
  temperature: 5,
  humidity: 15,
  ph: 0.8,
  rainfall: 45,
};

function nativeRecommendCrop(input: CropRecommendationInput): CropRecommendationResult {
  const scores: Array<{ crop: string; score: number }> = [];

  for (const [crop, centroid] of Object.entries(CROP_CENTROIDS)) {
    const dN = (input.N - centroid.N) / FEATURE_SCALES.N;
    const dP = (input.P - centroid.P) / FEATURE_SCALES.P;
    const dK = (input.K - centroid.K) / FEATURE_SCALES.K;
    const dTemp = (input.temperature - centroid.temperature) / FEATURE_SCALES.temperature;
    const dHum = (input.humidity - centroid.humidity) / FEATURE_SCALES.humidity;
    const dPh = (input.ph - centroid.ph) / FEATURE_SCALES.ph;
    const dRain = (input.rainfall - centroid.rainfall) / FEATURE_SCALES.rainfall;

    const distSq = dN * dN + dP * dP + dK * dK + dTemp * dTemp + dHum * dHum + dPh * dPh + dRain * dRain;
    const similarity = Math.exp(-0.5 * Math.sqrt(distSq));
    scores.push({ crop, score: similarity });
  }

  scores.sort((a, b) => b.score - a.score);
  const top3 = scores.slice(0, 3);
  const totalTopScore = top3.reduce((sum, item) => sum + item.score, 0) || 1;

  const recommendations = top3.map((item) => ({
    crop: item.crop,
    confidence: Number(((item.score / totalTopScore) * 100).toFixed(1)),
  }));

  return {
    success: true,
    recommended_crop: recommendations[0].crop,
    confidence: recommendations[0].confidence,
    recommendations,
  };
}

export async function recommendCrop(input: CropRecommendationInput): Promise<CropRecommendationResult> {
  try {
    const response = await fetch(`${CROP_API_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      return (await response.json()) as CropRecommendationResult;
    }
  } catch {
    // Graceful offline fallback to native classifier
  }

  return nativeRecommendCrop(input);
}
