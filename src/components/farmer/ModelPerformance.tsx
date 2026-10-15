import React, { useEffect, useState } from 'react';
import { ArrowLeft, Activity, Clock, Database, TrendingDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ModelResult {
  model: string;
  test_rows: number;
  mae: number;
  rmse: number;
  training_seconds: number;
}

interface EvaluationMetadata {
  dataset: string;
  target: string;
  split_method: string;
  split_date: string;
  train_rows: number;
  test_rows: number;
  train_start: string;
  train_end: string;
  test_start: string;
  test_end: string;
  weather_features_used: boolean;
}

interface ApiResponse {
  models: ModelResult[];
  metadata: EvaluationMetadata;
}

export const ModelPerformance: React.FC = () => {
  const { navigate } = useApp();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch('/api/model-performance/price-models')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load model evaluation results.');
        return response.json() as Promise<ApiResponse>;
      })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Something went wrong.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const money = (value: number) =>
    '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const bestMAE = data
    ? Math.min(...data.models.map((model) => model.mae))
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          onClick={() => navigate('/farmer/price-prediction')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Price Prediction
        </button>

        <header className="rounded-3xl bg-gradient-to-r from-emerald-950 to-emerald-700 p-7 text-white sm:p-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Activity className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
            AgriTrace · Machine Learning
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Model Performance
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">
            Compare seven-day crop price evaluation results across the
            current-price baseline and three machine-learning models.
          </p>
        </header>

        {loading && (
          <div className="rounded-2xl border bg-white p-8 text-center text-slate-600">
            Loading saved evaluation results...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
            {error} Check that the backend server is running.
          </div>
        )}

        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                icon={<Database className="h-5 w-5" />}
                label="Test observations"
                value={data.metadata.test_rows.toLocaleString('en-IN')}
                detail="Held-out test set"
              />
              <Metric
                icon={<TrendingDown className="h-5 w-5" />}
                label="Lowest MAE"
                value={money(bestMAE)}
                detail="Current-price baseline"
              />
              <Metric
                icon={<Clock className="h-5 w-5" />}
                label="CatBoost training"
                value={`${data.models.find(m => m.model === 'CatBoost')?.training_seconds ?? 0}s`}
                detail="Recorded training time"
              />
              <Metric
                icon={<Activity className="h-5 w-5" />}
                label="Forecast horizon"
                value="7 days"
                detail="Observed target price"
              />
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900">Model comparison</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Lower MAE and RMSE indicate smaller prediction errors.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Model</th>
                      <th className="px-6 py-4">MAE (₹/quintal)</th>
                      <th className="px-6 py-4">RMSE (₹/quintal)</th>
                      <th className="px-6 py-4">Training time</th>
                      <th className="px-6 py-4">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.models.map((model) => {
                      const baseline = model.model === 'Current-price baseline';
                      const best = model.mae === bestMAE;
                      return (
                        <tr key={model.model} className={best ? 'bg-emerald-50/60' : ''}>
                          <td className="px-6 py-5 font-semibold text-slate-800">
                            {model.model}
                          </td>
                          <td className="px-6 py-5 tabular-nums">{money(model.mae)}</td>
                          <td className="px-6 py-5 tabular-nums">{money(model.rmse)}</td>
                          <td className="px-6 py-5 tabular-nums">
                            {model.training_seconds === 0 ? 'N/A (baseline)' : `${model.training_seconds}s`}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                              best
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {best ? 'Lowest MAE' : baseline ? 'Reference' : 'Compared'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-bold text-slate-900">Evaluation details</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <Detail label="Dataset" value={data.metadata.dataset} />
                  <Detail label="Training period" value={`${data.metadata.train_start} to ${data.metadata.train_end}`} />
                  <Detail label="Testing period" value={`${data.metadata.test_start} to ${data.metadata.test_end}`} />
                  <Detail label="Training observations" value={data.metadata.train_rows.toLocaleString('en-IN')} />
                  <Detail label="Test observations" value={data.metadata.test_rows.toLocaleString('en-IN')} />
                  <Detail label="Split date" value={data.metadata.split_date} />
                  <Detail label="Weather features used" value={data.metadata.weather_features_used ? 'Yes' : 'No'} />
                </dl>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="font-bold text-amber-950">What these results mean</h2>
                <p className="mt-3 text-sm leading-6 text-amber-900">
                  The current-price baseline achieved the lowest MAE in this
                  evaluation. CatBoost, XGBoost, and Random Forest did not
                  outperform it on the saved test set.
                </p>
                <p className="mt-3 text-sm leading-6 text-amber-900">
                  The evaluation uses a chronological split and compares
                  predictions with observed prices exactly seven calendar
                  days later. Results describe this test period and do not
                  guarantee future accuracy.
                </p>
                <p className="mt-3 text-xs leading-5 text-amber-800">
                  These are offline evaluation metrics. The production price
                  prediction model has not been changed by this dashboard.
                </p>
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/farmer/price-prediction')}
                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
              >
                Open Price Prediction
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Refresh results
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Metric: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}> = ({ icon, label, value, detail }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-emerald-700">{icon}</span>
    </div>
    <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{detail}</p>
  </div>
);

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:justify-between">
    <dt className="text-slate-500">{label}</dt>
    <dd className="break-words font-medium text-slate-800 sm:max-w-[65%] sm:text-right">{value}</dd>
  </div>
);
