
import { Router } from 'express';
import { predictCropPrice } from '../services/pricePredictionService';

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

    const prediction = await predictCropPrice({
      state: String(state),
      district: String(district),
      commodity: String(commodity),
      market: String(market),
      current_price: Number(current_price),
      forecast_date:
        forecast_date || new Date().toISOString().slice(0, 10),
    });

    return res.json(prediction);
  } catch (error) {
    console.error('Price prediction error:', error);

    return res.status(502).json({
      error: 'Could not obtain the crop price prediction.',
      details:
        error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
