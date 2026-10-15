
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

    // Validate required fields
    if (
      typeof state !== 'string' ||
      !state.trim() ||
      typeof district !== 'string' ||
      !district.trim() ||
      typeof commodity !== 'string' ||
      !commodity.trim() ||
      typeof market !== 'string' ||
      !market.trim() ||
      !Number.isFinite(Number(current_price)) ||
      Number(current_price) <= 0
    ) {
      return res.status(400).json({
        error:
          'Provide state, district, commodity, market, and a valid current_price.',
      });
    }

    const forecastDate =
      forecast_date || new Date().toISOString().slice(0, 10);

    // Validate date format and calendar date
    if (
      typeof forecastDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(forecastDate) ||
      Number.isNaN(Date.parse(`${forecastDate}T00:00:00Z`)) ||
      new Date(`${forecastDate}T00:00:00Z`)
        .toISOString()
        .slice(0, 10) !== forecastDate
    ) {
      return res.status(400).json({
        error: 'forecast_date must be a valid date in YYYY-MM-DD format.',
      });
    }

    // Call the price prediction service
    const prediction = await predictCropPrice({
      state: state.trim(),
      district: district.trim(),
      commodity: commodity.trim(),
      market: market.trim(),
      current_price: Number(current_price),
      forecast_date: forecastDate,
    });

    // Validate the response from the prediction service
    if (
      !prediction ||
      !Number.isFinite(prediction.predicted_price_per_quintal) ||
      !Number.isFinite(prediction.predicted_price_per_kg) ||
      !prediction.target_date
    ) {
      console.error('Price prediction service returned an invalid response.');

      return res.status(502).json({
        error: 'The price prediction service returned an invalid response.',
      });
    }

    return res.status(200).json(prediction);
  } catch (error) {
    console.error('Price prediction error:', error);

    return res.status(502).json({
      error: 'Could not obtain a price prediction.',
      details:
        error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/crop', async (req, res) => {
  try {
    const {
      N,
      P,
      K,
      temperature,
      humidity,
      ph,
      rainfall,
    } = req.body ?? {};

    const values = {
      N,
      P,
      K,
      temperature,
      humidity,
      ph,
      rainfall,
    };

    const required = Object.keys(values);

    const missing = required.filter((key) => {
      const value = values[key as keyof typeof values];

      return (
        value === undefined ||
        value === null ||
        value === ''
      );
    });

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const input = Object.fromEntries(
      required.map((key) => [
        key,
        Number(values[key as keyof typeof values]),
      ])
    );

    if (
      Object.values(input).some(
        (value) => !Number.isFinite(value)
      )
    ) {
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

    return res.status(200).json(prediction);
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
