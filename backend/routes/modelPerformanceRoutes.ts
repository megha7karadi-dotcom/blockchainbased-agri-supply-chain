import fs from 'fs';
import path from 'path';
import { Router } from 'express';

const router = Router();

router.get('/price-models', (_req, res) => {
  try {
    const base = path.join(
      process.cwd(),
      'price-api',
      'model_comparison'
    );

    const csv = fs.readFileSync(
      path.join(base, 'comparison_results.csv'),
      'utf8'
    ).trim();

    const lines = csv.split(/\r?\n/);
    const headers = lines[0].split(',');

    const models = lines.slice(1).map((line) => {
      const values = line.split(',');
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      return {
        model: row.model,
        test_rows: Number(row.test_rows),
        mae: Number(row.MAE_Rs_per_quintal),
        rmse: Number(row.RMSE_Rs_per_quintal),
        training_seconds: Number(row.training_seconds),
      };
    });

    const metadata = JSON.parse(
      fs.readFileSync(
        path.join(base, 'evaluation_metadata.json'),
        'utf8'
      )
    );

    res.json({ models, metadata });
  } catch (error) {
    console.error('Model performance error:', error);
    res.status(500).json({
      error: 'Unable to load saved model evaluation results.',
    });
  }
});

export default router;
