
import React, { useEffect, useState } from 'react';
import { Activity, Clock, Database, TrendingDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';
import { BackButton } from '../common/BackButton';

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

const translations = {
  en: {
    title: 'Model Performance',
    subtitle:
      'Compare seven-day crop price evaluation results across the current-price baseline and three machine-learning models.',
    loading: 'Loading saved evaluation results...',
    loadError: 'Unable to load model evaluation results.',
    genericError: 'Something went wrong.',
    backendError: 'Check that the backend server is running.',
    testObservations: 'Test observations',
    heldOut: 'Held-out test set',
    lowestMAE: 'Lowest MAE',
    baseline: 'Current-price baseline',
    catboost: 'CatBoost training',
    trainingTime: 'Recorded training time',
    horizon: 'Forecast horizon',
    observedPrice: 'Observed target price',
    comparison: 'Model comparison',
    comparisonHelp:
      'Lower MAE and RMSE indicate smaller prediction errors.',
    model: 'Model',
    mae: 'MAE (₹/quintal)',
    rmse: 'RMSE (₹/quintal)',
    time: 'Training time',
    result: 'Result',
    reference: 'Reference',
    compared: 'Compared',
    details: 'Evaluation details',
    dataset: 'Dataset',
    trainingPeriod: 'Training period',
    testingPeriod: 'Testing period',
    trainRows: 'Training observations',
    testRows: 'Test observations',
    splitDate: 'Split date',
    weather: 'Weather features used',
    yes: 'Yes',
    no: 'No',
    meaning: 'What these results mean',
    meaningOne:
      'The current-price baseline achieved the lowest MAE in this evaluation. CatBoost, XGBoost, and Random Forest did not outperform it on the saved test set.',
    meaningTwo:
      'The evaluation uses a chronological split and compares predictions with observed prices exactly seven calendar days later. Results describe this test period and do not guarantee future accuracy.',
    offline:
      'These are offline evaluation metrics. The production price prediction model has not been changed by this dashboard.',
    openPrediction: 'Open Price Prediction',
    refresh: 'Refresh results',
    naBaseline: 'N/A (baseline)',
    day: 'days',
    lowest: 'Lowest MAE',
    referenceResult: 'Reference',
    comparedResult: 'Compared',
  },
  hi: {
    title: 'मॉडल प्रदर्शन',
    subtitle:
      'वर्तमान मूल्य आधार और तीन मशीन लर्निंग मॉडलों के सात-दिवसीय फसल मूल्य मूल्यांकन की तुलना करें।',
    loading: 'सहेजे गए मूल्यांकन परिणाम लोड हो रहे हैं...',
    loadError: 'मॉडल मूल्यांकन परिणाम लोड नहीं हो सके।',
    genericError: 'कुछ गलत हो गया।',
    backendError: 'जाँचें कि बैकएंड सर्वर चल रहा है।',
    testObservations: 'परीक्षण अवलोकन',
    heldOut: 'अलग रखा गया परीक्षण डेटा',
    lowestMAE: 'सबसे कम MAE',
    baseline: 'वर्तमान मूल्य आधार',
    catboost: 'CatBoost प्रशिक्षण',
    trainingTime: 'दर्ज प्रशिक्षण समय',
    horizon: 'पूर्वानुमान अवधि',
    observedPrice: 'देखा गया लक्ष्य मूल्य',
    comparison: 'मॉडल तुलना',
    comparisonHelp:
      'कम MAE और RMSE का अर्थ है कि पूर्वानुमान की त्रुटियाँ कम हैं।',
    model: 'मॉडल',
    mae: 'MAE (₹/क्विंटल)',
    rmse: 'RMSE (₹/क्विंटल)',
    time: 'प्रशिक्षण समय',
    result: 'परिणाम',
    details: 'मूल्यांकन विवरण',
    dataset: 'डेटासेट',
    trainingPeriod: 'प्रशिक्षण अवधि',
    testingPeriod: 'परीक्षण अवधि',
    trainRows: 'प्रशिक्षण अवलोकन',
    testRows: 'परीक्षण अवलोकन',
    splitDate: 'विभाजन तिथि',
    weather: 'मौसम सुविधाओं का उपयोग',
    yes: 'हाँ',
    no: 'नहीं',
    meaning: 'इन परिणामों का अर्थ',
    meaningOne:
      'इस मूल्यांकन में वर्तमान मूल्य आधार का MAE सबसे कम रहा। सहेजे गए परीक्षण डेटा पर CatBoost, XGBoost और Random Forest इससे बेहतर प्रदर्शन नहीं कर सके।',
    meaningTwo:
      'मूल्यांकन में कालानुक्रमिक विभाजन का उपयोग किया गया है और पूर्वानुमानों की तुलना ठीक सात कैलेंडर दिन बाद के वास्तविक मूल्यों से की गई है। परिणाम केवल इस परीक्षण अवधि को दर्शाते हैं और भविष्य की सटीकता की गारंटी नहीं देते।',
    offline:
      'ये ऑफलाइन मूल्यांकन मेट्रिक्स हैं। इस डैशबोर्ड ने उत्पादन मूल्य पूर्वानुमान मॉडल को नहीं बदला है।',
    openPrediction: 'मूल्य पूर्वानुमान खोलें',
    refresh: 'परिणाम रीफ्रेश करें',
    naBaseline: 'लागू नहीं (आधार)',
    day: 'दिन',
    lowest: 'सबसे कम MAE',
    referenceResult: 'संदर्भ',
    comparedResult: 'तुलना',
  },
  kn: {
    title: 'ಮಾದರಿಯ ಕಾರ್ಯಕ್ಷಮತೆ',
    subtitle:
      'ಪ್ರಸ್ತುತ ಬೆಲೆ ಆಧಾರ ಮತ್ತು ಮೂರು ಯಂತ್ರ ಕಲಿಕೆ ಮಾದರಿಗಳ ಏಳು ದಿನಗಳ ಬೆಳೆ ಬೆಲೆ ಮೌಲ್ಯಮಾಪನ ಫಲಿತಾಂಶಗಳನ್ನು ಹೋಲಿಸಿ.',
    loading: 'ಉಳಿಸಿದ ಮೌಲ್ಯಮಾಪನ ಫಲಿತಾಂಶಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    loadError: 'ಮಾದರಿಯ ಮೌಲ್ಯಮಾಪನ ಫಲಿತಾಂಶಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
    genericError: 'ಏನೋ ತಪ್ಪಾಗಿದೆ.',
    backendError: 'ಬ್ಯಾಕೆಂಡ್ ಸರ್ವರ್ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.',
    testObservations: 'ಪರೀಕ್ಷಾ ವೀಕ್ಷಣೆಗಳು',
    heldOut: 'ಪ್ರತ್ಯೇಕ ಪರೀಕ್ಷಾ ಡೇಟಾ',
    lowestMAE: 'ಕಡಿಮೆ MAE',
    baseline: 'ಪ್ರಸ್ತುತ ಬೆಲೆ ಆಧಾರ',
    catboost: 'CatBoost ತರಬೇತಿ',
    trainingTime: 'ದಾಖಲಿಸಿದ ತರಬೇತಿ ಸಮಯ',
    horizon: 'ಮುನ್ಸೂಚನೆ ಅವಧಿ',
    observedPrice: 'ಗಮನಿಸಿದ ಗುರಿ ಬೆಲೆ',
    comparison: 'ಮಾದರಿಗಳ ಹೋಲಿಕೆ',
    comparisonHelp:
      'ಕಡಿಮೆ MAE ಮತ್ತು RMSE ಎಂದರೆ ಕಡಿಮೆ ಮುನ್ಸೂಚನೆ ದೋಷಗಳು.',
    model: 'ಮಾದರಿ',
    mae: 'MAE (₹/ಕ್ವಿಂಟಲ್)',
    rmse: 'RMSE (₹/ಕ್ವಿಂಟಲ್)',
    time: 'ತರಬೇತಿ ಸಮಯ',
    result: 'ಫಲಿತಾಂಶ',
    details: 'ಮೌಲ್ಯಮಾಪನ ವಿವರಗಳು',
    dataset: 'ಡೇಟಾಸೆಟ್',
    trainingPeriod: 'ತರಬೇತಿ ಅವಧಿ',
    testingPeriod: 'ಪರೀಕ್ಷಾ ಅವಧಿ',
    trainRows: 'ತರಬೇತಿ ವೀಕ್ಷಣೆಗಳು',
    testRows: 'ಪರೀಕ್ಷಾ ವೀಕ್ಷಣೆಗಳು',
    splitDate: 'ವಿಭಜನೆಯ ದಿನಾಂಕ',
    weather: 'ಹವಾಮಾನ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಬಳಸಲಾಗಿದೆ',
    yes: 'ಹೌದು',
    no: 'ಇಲ್ಲ',
    meaning: 'ಈ ಫಲಿತಾಂಶಗಳ ಅರ್ಥ',
    meaningOne:
      'ಈ ಮೌಲ್ಯಮಾಪನದಲ್ಲಿ ಪ್ರಸ್ತುತ ಬೆಲೆ ಆಧಾರವು ಅತ್ಯಂತ ಕಡಿಮೆ MAE ಸಾಧಿಸಿದೆ. ಉಳಿಸಿದ ಪರೀಕ್ಷಾ ಡೇಟಾದಲ್ಲಿ CatBoost, XGBoost ಮತ್ತು Random Forest ಇದಕ್ಕಿಂತ ಉತ್ತಮ ಪ್ರದರ್ಶನ ನೀಡಲಿಲ್ಲ.',
    meaningTwo:
      'ಮೌಲ್ಯಮಾಪನವು ಕಾಲಾನುಕ್ರಮದ ವಿಭಜನೆಯನ್ನು ಬಳಸುತ್ತದೆ ಮತ್ತು ಮುನ್ಸೂಚನೆಗಳನ್ನು ನಿಖರವಾಗಿ ಏಳು ಕ್ಯಾಲೆಂಡರ್ ದಿನಗಳ ನಂತರದ ನೈಜ ಬೆಲೆಗಳೊಂದಿಗೆ ಹೋಲಿಸುತ್ತದೆ. ಫಲಿತಾಂಶಗಳು ಈ ಪರೀಕ್ಷಾ ಅವಧಿಯನ್ನು ಮಾತ್ರ ವಿವರಿಸುತ್ತವೆ; ಭವಿಷ್ಯದ ನಿಖರತೆಗೆ ಖಾತರಿ ನೀಡುವುದಿಲ್ಲ.',
    offline:
      'ಇವು ಆಫ್‌ಲೈನ್ ಮೌಲ್ಯಮಾಪನ ಅಳತೆಗಳಾಗಿವೆ. ಈ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಉತ್ಪಾದನಾ ಬೆಲೆ ಮುನ್ಸೂಚನೆ ಮಾದರಿಯನ್ನು ಬದಲಾಯಿಸಿಲ್ಲ.',
    openPrediction: 'ಬೆಲೆ ಮುನ್ಸೂಚನೆ ತೆರೆಯಿರಿ',
    refresh: 'ಫಲಿತಾಂಶಗಳನ್ನು ಮರುಲೋಡ್ ಮಾಡಿ',
    naBaseline: 'ಅನ್ವಯಿಸುವುದಿಲ್ಲ (ಆಧಾರ)',
    day: 'ದಿನಗಳು',
    lowest: 'ಕಡಿಮೆ MAE',
    referenceResult: 'ಉಲ್ಲೇಖ',
    comparedResult: 'ಹೋಲಿಕೆ',
  },
};

export const ModelPerformance: React.FC = () => {
  const { navigate } = useApp();
  const { language } = useFarmerLanguage();
  const t = translations[language] || translations.en;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch('/api/model-performance/price-models')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(t.loadError);
        }
        return response.json() as Promise<ApiResponse>;
      })
      .then((result) => {
        if (active) {
          setData(result);
          setError('');
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : t.genericError);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t.loadError, t.genericError]);

  const money = (value: number) =>
    '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const bestMAE =
    data && data.models.length > 0
      ? Math.min(...data.models.map((model) => model.mae))
      : 0;

  const formatDateRange = (start: string, end: string) =>
    `${start} – ${end}`;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-start">
          <BackButton fallback="/farmer/price-prediction" />
        </div>

        <header className="rounded-3xl bg-gradient-to-r from-emerald-950 to-emerald-700 p-7 text-white sm:p-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Activity className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
            AgriTrace · Machine Learning
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">
            {t.subtitle}
          </p>
        </header>

        {loading && (
          <div className="rounded-2xl border bg-white p-8 text-center text-slate-600">
            {t.loading}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700"
          >
            {error} {t.backendError}
          </div>
        )}

        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                icon={<Database className="h-5 w-5" />}
                label={t.testObservations}
                value={data.metadata.test_rows.toLocaleString('en-IN')}
                detail={t.heldOut}
              />
              <Metric
                icon={<TrendingDown className="h-5 w-5" />}
                label={t.lowestMAE}
                value={money(bestMAE)}
                detail={t.baseline}
              />
              <Metric
                icon={<Clock className="h-5 w-5" />}
                label={t.catboost}
                value={`${data.models.find((m) => m.model === 'CatBoost')?.training_seconds ?? 0}s`}
                detail={t.trainingTime}
              />
              <Metric
                icon={<Activity className="h-5 w-5" />}
                label={t.horizon}
                value={`7 ${t.day}`}
                detail={t.observedPrice}
              />
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  {t.comparison}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t.comparisonHelp}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4">{t.model}</th>
                      <th className="px-6 py-4">{t.mae}</th>
                      <th className="px-6 py-4">{t.rmse}</th>
                      <th className="px-6 py-4">{t.time}</th>
                      <th className="px-6 py-4">{t.result}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.models.map((model) => {
                      const baseline =
                        model.model === 'Current-price baseline';
                      const best = model.mae === bestMAE;

                      return (
                        <tr
                          key={model.model}
                          className={best ? 'bg-emerald-50/60' : ''}
                        >
                          <td className="px-6 py-5 font-semibold text-slate-800">
                            {model.model}
                          </td>
                          <td className="px-6 py-5 tabular-nums">
                            {money(model.mae)}
                          </td>
                          <td className="px-6 py-5 tabular-nums">
                            {money(model.rmse)}
                          </td>
                          <td className="px-6 py-5 tabular-nums">
                            {model.training_seconds === 0
                              ? t.naBaseline
                              : `${model.training_seconds}s`}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                best
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {best
                                ? t.lowest
                                : baseline
                                  ? t.referenceResult
                                  : t.comparedResult}
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
                <h2 className="font-bold text-slate-900">{t.details}</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <Detail label={t.dataset} value={data.metadata.dataset} />
                  <Detail
                    label={t.trainingPeriod}
                    value={formatDateRange(
                      data.metadata.train_start,
                      data.metadata.train_end,
                    )}
                  />
                  <Detail
                    label={t.testingPeriod}
                    value={formatDateRange(
                      data.metadata.test_start,
                      data.metadata.test_end,
                    )}
                  />
                  <Detail
                    label={t.trainRows}
                    value={data.metadata.train_rows.toLocaleString('en-IN')}
                  />
                  <Detail
                    label={t.testRows}
                    value={data.metadata.test_rows.toLocaleString('en-IN')}
                  />
                  <Detail
                    label={t.splitDate}
                    value={data.metadata.split_date}
                  />
                  <Detail
                    label={t.weather}
                    value={
                      data.metadata.weather_features_used ? t.yes : t.no
                    }
                  />
                </dl>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="font-bold text-amber-950">{t.meaning}</h2>
                <p className="mt-3 text-sm leading-6 text-amber-900">
                  {t.meaningOne}
                </p>
                <p className="mt-3 text-sm leading-6 text-amber-900">
                  {t.meaningTwo}
                </p>
                <p className="mt-3 text-xs leading-5 text-amber-800">
                  {t.offline}
                </p>
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/farmer/price-prediction')}
                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
              >
                {t.openPrediction}
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                {t.refresh}
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

const Detail: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:justify-between">
    <dt className="text-slate-500">{label}</dt>
    <dd className="break-words font-medium text-slate-800 sm:max-w-[65%] sm:text-right">
      {value}
    </dd>
  </div>
);