
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
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';

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

const translations = {
  en: {
    eyebrow: 'AI-powered farming assistant',
    title: 'Crop Recommendation',
    description:
      'Enter your soil nutrient levels and local weather conditions to discover which crop best matches the provided data.',
    soil: 'Soil Nutrients',
    soilDescription:
      'Enter measured nitrogen, phosphorus and potassium values.',
    weather: 'Weather & Soil Conditions',
    weatherDescription: 'Use recent local measurements where possible.',
    nitrogen: 'Nitrogen (N)',
    phosphorus: 'Phosphorus (P)',
    potassium: 'Potassium (K)',
    temperature: 'Temperature',
    humidity: 'Humidity',
    ph: 'Soil pH',
    rainfall: 'Rainfall',
    analyse: 'Analysing conditions...',
    recommend: 'Recommend Best Crop',
    reset: 'Reset',
    results: 'Recommendation Results',
    resultsDescription: 'Generated from your submitted conditions.',
    recommended: 'Recommended crop',
    confidence: 'Model confidence',
    alternatives: 'Other matching crops',
    advice:
      'This is a model-based suggestion, not a guarantee of yield or profitability. Consider your season, local climate, water availability and advice from an agricultural expert before planting.',
    invalid: (label: string) => `Please enter a valid value for ${label}.`,
    range: (label: string, min: number, max: number) =>
      `${label} must be between ${min} and ${max}.`,
    requestFailed: 'Crop recommendation request failed.',
    noRecommendation: 'The model did not return a crop recommendation.',
    connectionError:
      'Could not connect to the crop recommendation service.',
    unknownError: 'Something went wrong. Please try again.',
  },
  hi: {
    eyebrow: 'AI-संचालित कृषि सहायक',
    title: 'फसल की सिफारिश',
    description:
      'मिट्टी में पोषक तत्वों के स्तर और स्थानीय मौसम की जानकारी दर्ज करें, ताकि आपके डेटा के अनुसार उपयुक्त फसल का सुझाव मिल सके।',
    soil: 'मिट्टी के पोषक तत्व',
    soilDescription:
      'नाइट्रोजन, फॉस्फोरस और पोटैशियम के मापे गए मान दर्ज करें।',
    weather: 'मौसम और मिट्टी की स्थिति',
    weatherDescription: 'जहाँ संभव हो, हाल के स्थानीय मापों का उपयोग करें।',
    nitrogen: 'नाइट्रोजन (N)',
    phosphorus: 'फॉस्फोरस (P)',
    potassium: 'पोटैशियम (K)',
    temperature: 'तापमान',
    humidity: 'आर्द्रता',
    ph: 'मिट्टी का pH',
    rainfall: 'वर्षा',
    analyse: 'जानकारी का विश्लेषण हो रहा है...',
    recommend: 'सबसे उपयुक्त फसल सुझाएँ',
    reset: 'रीसेट करें',
    results: 'फसल सिफारिश के परिणाम',
    resultsDescription: 'आपके द्वारा दर्ज की गई जानकारी के आधार पर।',
    recommended: 'सुझाई गई फसल',
    confidence: 'मॉडल का विश्वास स्तर',
    alternatives: 'अन्य उपयुक्त फसलें',
    advice:
      'यह मॉडल पर आधारित सुझाव है, उपज या लाभ की गारंटी नहीं। बुवाई से पहले मौसम, स्थानीय जलवायु, पानी की उपलब्धता और कृषि विशेषज्ञ की सलाह पर विचार करें।',
    invalid: (label: string) => `${label} के लिए सही मान दर्ज करें।`,
    range: (label: string, min: number, max: number) =>
      `${label} का मान ${min} से ${max} के बीच होना चाहिए।`,
    requestFailed: 'फसल की सिफारिश का अनुरोध विफल रहा।',
    noRecommendation: 'मॉडल कोई फसल सुझा नहीं पाया।',
    connectionError: 'फसल सिफारिश सेवा से कनेक्ट नहीं हो सका।',
    unknownError: 'कुछ गलत हुआ। कृपया फिर से प्रयास करें।',
  },
  kn: {
    eyebrow: 'AI ಆಧಾರಿತ ಕೃಷಿ ಸಹಾಯಕ',
    title: 'ಬೆಳೆ ಶಿಫಾರಸು',
    description:
      'ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳ ಮಟ್ಟ ಮತ್ತು ಸ್ಥಳೀಯ ಹವಾಮಾನದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ. ನಿಮ್ಮ ಮಾಹಿತಿಗೆ ಹೊಂದುವ ಬೆಳೆಯ ಶಿಫಾರಸನ್ನು ಪಡೆಯಿರಿ.',
    soil: 'ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳು',
    soilDescription:
      'ಅಳತೆ ಮಾಡಿದ ಸಾರಜನಕ, ರಂಜಕ ಮತ್ತು ಪೊಟ್ಯಾಸಿಯಮ್ ಮೌಲ್ಯಗಳನ್ನು ನಮೂದಿಸಿ.',
    weather: 'ಹವಾಮಾನ ಮತ್ತು ಮಣ್ಣಿನ ಪರಿಸ್ಥಿತಿಗಳು',
    weatherDescription: 'ಸಾಧ್ಯವಾದರೆ ಇತ್ತೀಚಿನ ಸ್ಥಳೀಯ ಅಳತೆಗಳನ್ನು ಬಳಸಿ.',
    nitrogen: 'ಸಾರಜನಕ (N)',
    phosphorus: 'ರಂಜಕ (P)',
    potassium: 'ಪೊಟ್ಯಾಸಿಯಮ್ (K)',
    temperature: 'ತಾಪಮಾನ',
    humidity: 'ಆರ್ದ್ರತೆ',
    ph: 'ಮಣ್ಣಿನ pH',
    rainfall: 'ಮಳೆ',
    analyse: 'ಪರಿಸ್ಥಿತಿಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    recommend: 'ಉತ್ತಮ ಬೆಳೆಯನ್ನು ಶಿಫಾರಸು ಮಾಡಿ',
    reset: 'ಮರುಹೊಂದಿಸಿ',
    results: 'ಶಿಫಾರಸು ಫಲಿತಾಂಶಗಳು',
    resultsDescription: 'ನೀವು ನಮೂದಿಸಿದ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ ರಚಿಸಲಾಗಿದೆ.',
    recommended: 'ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆ',
    confidence: 'ಮಾದರಿಯ ವಿಶ್ವಾಸ ಮಟ್ಟ',
    alternatives: 'ಇತರ ಹೊಂದುವ ಬೆಳೆಗಳು',
    advice:
      'ಇದು ಮಾದರಿಯ ಆಧಾರದ ಮೇಲಿನ ಸಲಹೆ ಮಾತ್ರ; ಇಳುವರಿ ಅಥವಾ ಲಾಭದ ಖಾತರಿ ಅಲ್ಲ. ಬಿತ್ತುವ ಮೊದಲು ಋತು, ಸ್ಥಳೀಯ ಹವಾಮಾನ, ನೀರಿನ ಲಭ್ಯತೆ ಮತ್ತು ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆಯನ್ನು ಪರಿಗಣಿಸಿ.',
    invalid: (label: string) => `${label}ಗೆ ಸರಿಯಾದ ಮೌಲ್ಯವನ್ನು ನಮೂದಿಸಿ.`,
    range: (label: string, min: number, max: number) =>
      `${label} ಮೌಲ್ಯವು ${min} ಮತ್ತು ${max}ರ ನಡುವೆ ಇರಬೇಕು.`,
    requestFailed: 'ಬೆಳೆ ಶಿಫಾರಸು ವಿನಂತಿ ವಿಫಲವಾಗಿದೆ.',
    noRecommendation: 'ಮಾದರಿಯಿಂದ ಯಾವುದೇ ಬೆಳೆ ಶಿಫಾರಸು ದೊರೆತಿಲ್ಲ.',
    connectionError: 'ಬೆಳೆ ಶಿಫಾರಸು ಸೇವೆಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
    unknownError: 'ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  },
};

const cropNames: Record<string, { hi: string; kn: string }> = {
  rice: { hi: 'चावल', kn: 'ಅಕ್ಕಿ' },
  jute: { hi: 'जूट', kn: 'ಸೆಣಬು' },
  banana: { hi: 'केला', kn: 'ಬಾಳೆಹಣ್ಣು' },
  maize: { hi: 'मक्का', kn: 'ಮೆಕ್ಕೆಜೋಳ' },
  chickpea: { hi: 'चना', kn: 'ಕಡಲೆ' },
  kidneybeans: { hi: 'राजमा', kn: 'ರಾಜ್ಮಾ' },
  kidney_beans: { hi: 'राजमा', kn: 'ರಾಜ್ಮಾ' },
  pigeonpeas: { hi: 'अरहर', kn: 'ತೊಗರಿ' },
  pigeon_peas: { hi: 'अरहर', kn: 'ತೊಗರಿ' },
  mothbeans: { hi: 'मोठ दाल', kn: 'ಮಡಿಕೆಕಾಳು' },
  moth_beans: { hi: 'मोठ दाल', kn: 'ಮಡಿಕೆಕಾಳು' },
  mungbean: { hi: 'मूंग', kn: 'ಹೆಸರುಕಾಳು' },
  mung_bean: { hi: 'मूंग', kn: 'ಹೆಸರುಕಾಳು' },
  blackgram: { hi: 'उड़द', kn: 'ಉದ್ದು' },
  black_gram: { hi: 'उड़द', kn: 'ಉದ್ದು' },
  lentil: { hi: 'मसूर', kn: 'ಮಸೂರ' },
  pomegranate: { hi: 'अनार', kn: 'ದಾಳಿಂಬೆ' },
  watermelon: { hi: 'तरबूज', kn: 'ಕಲ್ಲಂಗಡಿ' },
  muskmelon: { hi: 'खरबूजा', kn: 'ಕರಬೂಜ' },
  apple: { hi: 'सेब', kn: 'ಸೇಬು' },
  mango: { hi: 'आम', kn: 'ಮಾವು' },
  grapes: { hi: 'अंगूर', kn: 'ದ್ರಾಕ್ಷಿ' },
  orange: { hi: 'संतरा', kn: 'ಕಿತ್ತಳೆ' },
  papaya: { hi: 'पपीता', kn: 'ಪಪ್ಪಾಯಿ' },
  coconut: { hi: 'नारियल', kn: 'ತೆಂಗಿನಕಾಯಿ' },
  cotton: { hi: 'कपास', kn: 'ಹತ್ತಿ' },
  coffee: { hi: 'कॉफी', kn: 'ಕಾಫಿ' },
  sugarcane: { hi: 'गन्ना', kn: 'ಕಬ್ಬು' },
  tobacco: { hi: 'तंबाकू', kn: 'ತಂಬಾಕು' },
  barley: { hi: 'जौ', kn: 'ಬಾರ್ಲಿ' },
  wheat: { hi: 'गेहूँ', kn: 'ಗೋಧಿ' },
};

const getCropName = (crop: string, language: string): string => {
  if (language === 'en') return crop;

  const key = crop.trim().toLowerCase().replace(/[\s-]+/g, '_');
  const normalizedKey = key.replace(/_/g, '');
  const translated = cropNames[key] || cropNames[normalizedKey];

  if (!translated) return crop;

  return language === 'hi' ? translated.hi : translated.kn;
};

const getFields = (t: (typeof translations)['en']) => [
  {
    key: 'N' as const,
    label: t.nitrogen,
    unit: 'kg/ha',
    min: 0,
    max: 140,
    step: 1,
    icon: FlaskConical,
  },
  {
    key: 'P' as const,
    label: t.phosphorus,
    unit: 'kg/ha',
    min: 5,
    max: 145,
    step: 1,
    icon: FlaskConical,
  },
  {
    key: 'K' as const,
    label: t.potassium,
    unit: 'kg/ha',
    min: 5,
    max: 205,
    step: 1,
    icon: FlaskConical,
  },
  {
    key: 'temperature' as const,
    label: t.temperature,
    unit: '°C',
    min: 0,
    max: 50,
    step: 0.1,
    icon: Thermometer,
  },
  {
    key: 'humidity' as const,
    label: t.humidity,
    unit: '%',
    min: 0,
    max: 100,
    step: 0.1,
    icon: Droplets,
  },
  {
    key: 'ph' as const,
    label: t.ph,
    unit: 'pH',
    min: 0,
    max: 14,
    step: 0.1,
    icon: Leaf,
  },
  {
    key: 'rainfall' as const,
    label: t.rainfall,
    unit: 'mm',
    min: 0,
    max: 500,
    step: 0.1,
    icon: CloudRain,
  },
];

export const CropRecommendation: React.FC = () => {
  const { language } = useFarmerLanguage();
  const t = translations[language] || translations.en;
  const fields = getFields(t);

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

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError('');
    setResult(null);

    for (const field of fields) {
      const value = values[field.key].trim();
      const number = Number(value);

      if (value === '' || !Number.isFinite(number)) {
        setError(t.invalid(field.label));
        return;
      }

      if (number < field.min || number > field.max) {
        setError(t.range(field.label, field.min, field.max));
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
          data.message || data.error || t.requestFailed,
        );
      }

      if (!data.success || !data.recommended_crop) {
        throw new Error(t.noRecommendation);
      }

      setResult(data as CropResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.connectionError || t.unknownError,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
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
              {t.eyebrow}
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {t.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50">
              {t.description}
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
              <h2 className="font-bold text-slate-900">{t.soil}</h2>
              <p className="text-sm text-slate-500">
                {t.soilDescription}
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
              <h2 className="font-bold text-slate-900">{t.weather}</h2>
              <p className="text-sm text-slate-500">
                {t.weatherDescription}
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
                {t.analyse}
              </>
            ) : (
              <>
                <Sprout className="h-5 w-5" />
                {t.recommend}
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
            {t.reset}
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
                {t.results}
              </h2>
              <p className="text-sm text-slate-500">
                {t.resultsDescription}
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
                  {t.recommended}
                </p>
                <h3 className="mt-1 text-2xl font-bold capitalize text-slate-900">
                  {getCropName(result.recommended_crop, language)}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {t.confidence}: {Number(result.confidence).toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, Number(result.confidence) || 0),
                  )}%`,
                }}
              />
            </div>
          </div>

          {result.recommendations?.length > 0 && (
            <div>
              <h3 className="mb-3 font-bold text-slate-800">
                {t.alternatives}
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
                        {getCropName(item.crop, language)}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, Number(item.confidence) || 0),
                            )}%`,
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

          <p className="text-xs leading-5 text-slate-500">{t.advice}</p>
        </section>
      )}
    </div>
  );
};

export default CropRecommendation;
