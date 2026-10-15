import { Router } from 'express';
import { predictCropPrice } from '../services/pricePredictionService';
import { recommendCrop } from '../services/cropRecommendationService';

const router = Router();

router.post('/price', async (req, res) => {
  try {
    const {
      state,
      district,
      commodity,
      market,
      current_price,
      forecast_date,
    } = req.body ?? {};

    if (
      !state ||
      !district ||
      !commodity ||
      !market ||
      !Number.isFinite(Number(current_price)) ||
      Number(current_price) <= 0
    ) {
      return res.status(400).json({
        error:
          'Provide state, district, commodity, market, and a valid current_price.',
      });
    }

    const currentPrice = Number(current_price);
    const forecastDate = forecast_date || new Date().toISOString().slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(forecastDate) ||
        Number.isNaN(Date.parse(forecastDate + 'T00:00:00Z'))) {
      return res.status(400).json({
        error: 'forecast_date must be a valid date in YYYY-MM-DD format.',
      });
    }

    const target = new Date(forecastDate + 'T00:00:00Z');
    target.setUTCDate(target.getUTCDate() + 7);

    return res.json({
      commodity: String(commodity),
      market: String(market),
      forecast_date: forecastDate,
      target_date: target.toISOString().slice(0, 10),
      predicted_price_per_quintal: Number(currentPrice.toFixed(2)),
      predicted_price_per_kg: Number((currentPrice / 100).toFixed(2)),
      currency: 'INR',
      unit: 'quintal',
      forecast_horizon_days: 7,
      model_name: 'Current-price baseline',
      evaluation_mae: 334.28,
      forecast_method: 'baseline',
    });
  } catch (error) {
    console.error('Baseline price forecast error:', error);
    return res.status(500).json({
      error: 'Could not calculate the baseline price forecast.',
    });
  }
});
router.post('/crop', async (req, res) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall } =
      req.body ?? {};

    const values = { N, P, K, temperature, humidity, ph, rainfall };
    const required = Object.keys(values);

    const missing = required.filter(
      (key) =>
        values[key as keyof typeof values] === undefined ||
        values[key as keyof typeof values] === null ||
        values[key as keyof typeof values] === ''
    );

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const input = Object.fromEntries(
      required.map((key) => [key, Number(values[key as keyof typeof values])])
    );

    if (Object.values(input).some((value) => !Number.isFinite(value))) {
      return res.status(400).json({
        error: 'All crop recommendation inputs must be valid numbers.',
      });
    }

    const prediction = await recommendCrop(input as {
      N: number;
      P: number;
      K: number;
      temperature: number;
      humidity: number;
      ph: number;
      rainfall: number;
    });

    return res.json(prediction);
  } catch (error) {
    console.error('Crop recommendation error:', error);

    return res.status(502).json({
      error: 'Could not obtain the crop recommendation.',
      details:
        error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

