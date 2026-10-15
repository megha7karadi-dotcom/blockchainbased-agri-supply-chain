
import React, { useState } from 'react';
import {
  Sprout,
  Leaf,
  FlaskConical,
  Thermometer,
  Droplets,
  CloudRain,
  LoaderCircle,
  AlertCircle,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import { BackButton } from '../common/BackButton';

interface CropInput {
  N: string;
  P: string;
  K: string;
  temperature: string;
  humidity: string;
  ph: string;
  rainfall: string;
}

interface CropResult {
  success: boolean;
  recommended_crop: string;
  confidence: number;
  recommendations: Array<{
    crop: string;
    confidence: number;
  }>;
}

const initialValues: CropInput = {
  N: '90',
  P: '42',
  K: '43',
  temperature: '20.5',
  humidity: '80',
  ph: '6.5',
  rainfall: '200',
};

const fields: Array<{
  key: keyof CropInput;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  icon: React.ElementType;
}> = [
  { key: 'N', label: 'Nitrogen (N)', unit: 'kg/ha', min: 0, max: 140, step: 1, icon: FlaskConical },
  { key: 'P', label: 'Phosphorus (P)', unit: 'kg/ha', min: 5, max: 145, step: 1, icon: FlaskConical },
  { key: 'K', label: 'Potassium (K)', unit: 'kg/ha', min: 5, max: 205, step: 1, icon: FlaskConical },
  { key: 'temperature', label: 'Temperature', unit: '°C', min: 0, max: 50, step: 0.1, icon: Thermometer },
  { key: 'humidity', label: 'Humidity', unit: '%', min: 0, max: 100, step: 0.1, icon: Droplets },
  { key: 'ph', label: 'Soil pH', unit: 'pH', min: 0, max: 14, step: 0.1, icon: Leaf },
  { key: 'rainfall', label: 'Rainfall', unit: 'mm', min: 0, max: 500, step: 0.1, icon: CloudRain },
];

export const CropRecommendation: React.FC = () => {
  const [values, setValues] = useState<CropInput>(initialValues);
  const [result, setResult] = useState<CropResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key: keyof CropInput, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const handleReset = () => {
    setValues(initialValues);
    setResult(null);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setResult(null);

    for (const field of fields) {
      const value = values[field.key].trim();
      const number = Number(value);

      if (value === '' || !Number.isFinite(number)) {
        setError(`Please enter a valid value for ${field.label}.`);
        return;
      }

      if (number < field.min || number > field.max) {
        setError(
          `${field.label} must be between ${field.min} and ${field.max}.`
        );
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/predict/crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          N: Number(values.N),
          P: Number(values.P),
          K: Number(values.K),
          temperature: Number(values.temperature),
          humidity: Number(values.humidity),
          ph: Number(values.ph),
          rainfall: Number(values.rainfall),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Crop recommendation request failed.'
        );
      }

      if (!data.success || !data.recommended_crop) {
        throw new Error('The model did not return a crop recommendation.');
      }

      setResult(data as CropResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to the crop recommendation service.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Navigation Back Button */}
      <div className="flex items-center justify-start">
        <BackButton fallback="/farmer/dashboard" />
      </div>

      <div className="rounded-3xl bg-gradient-to-r from-emerald-800 to-green-600 p-6 text-white sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white/15 p-3">
            <Sprout className="h-8 w-8" />
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-100">
              AI-powered farming assistant
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Crop Recommendation
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50">
              Enter your soil nutrient levels and local weather conditions to
              discover which crop best matches the provided data.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Soil Nutrients</h2>
              <p className="text-sm text-slate-500">
                Enter measured nitrogen, phosphorus and potassium values.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fields.slice(0, 3).map((field) => (
              <label key={field.key} className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  {field.label}
                </span>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={values[field.key]}
                    onChange={(event) =>
                      handleChange(field.key, event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-20 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    {field.unit}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-sky-50 p-2.5 text-sky-700">
              <CloudRain className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">
                Weather & Soil Conditions
              </h2>
              <p className="text-sm text-slate-500">
                Use recent local measurements where possible.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fields.slice(3).map((field) => (
              <label key={field.key} className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  {field.label}
                </span>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={values[field.key]}
                    onChange={(event) =>
                      handleChange(field.key, event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    {field.unit}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Analysing conditions...
              </>
            ) : (
              <>
                <Sprout className="h-5 w-5" />
                Recommend Best Crop
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </form>

      {result && (
        <section
          aria-live="polite"
          className="space-y-5 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5 sm:p-7"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recommendation Results
              </h2>
              <p className="text-sm text-slate-500">
                Generated from your submitted conditions.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Leaf className="h-8 w-8" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Recommended crop
                </p>
                <h3 className="mt-1 text-2xl font-bold capitalize text-slate-900">
                  {result.recommended_crop}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Model confidence: {Number(result.confidence).toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.max(0, Math.min(100, Number(result.confidence) || 0))}%`,
                }}
              />
            </div>
          </div>

          {result.recommendations?.length > 0 && (
            <div>
              <h3 className="mb-3 font-bold text-slate-800">
                Other matching crops
              </h3>
              <div className="space-y-3">
                {result.recommendations.map((item, index) => (
                  <div
                    key={`${item.crop}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold capitalize text-slate-800">
                        {item.crop}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{
                            width: `${Math.max(0, Math.min(100, Number(item.confidence) || 0))}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {Number(item.confidence).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs leading-5 text-slate-500">
            This is a model-based suggestion, not a guarantee of yield or
            profitability. Consider your season, local climate, water
            availability and advice from an agricultural expert before planting.
          </p>
        </section>
      )}
    </div>
  );
};

export default CropRecommendation;
