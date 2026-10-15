
import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  MapPin,
  Scale,
  ArrowUpRight,
  Info,
  ArrowRight,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BackButton } from '../common/BackButton';

interface PredictionResult {
  commodity: string;
  market: string;
  forecast_date: string;
  target_date: string;
  predicted_price_per_quintal: number;
  predicted_price_per_kg: number;
  currency: string;
  unit: string;
  forecast_horizon_days: number;
  model_name?: string;
  evaluation_mae?: number;
  forecast_method?: string;
}

export const PricePrediction: React.FC = () => {
  const { navigate } = useApp();

  const [crop, setCrop] = useState('Alphonso Mango');
  const [quantity, setQuantity] = useState('1200');
  const [qualityGrade, setQualityGrade] = useState(
    'Grade A (Export Quality)'
  );
  const [location, setLocation] = useState('Ratnagiri, Maharashtra');
  const [harvestDate, setHarvestDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [currentMarketPrice, setCurrentMarketPrice] = useState('120');

  const [isAssessing, setIsAssessing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState('');

  const quantityNum = Number(quantity);
  const currentPriceNum = Number(currentMarketPrice);

  const formatPrice = (value: number) =>
    value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPrediction(null);

    if (
      !Number.isFinite(quantityNum) ||
      quantityNum <= 0 ||
      !Number.isFinite(currentPriceNum) ||
      currentPriceNum <= 0
    ) {
      setError('Enter a valid quantity and current market price.');
      return;
    }

    const locationParts = location
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    if (locationParts.length < 2) {
      setError('Enter your location as District, State. For example: Ludhiana, Punjab.');
      return;
    }

    const district = locationParts[0];
    const state = locationParts[1];

    // The form accepts ₹/kg; the Python API expects ₹/quintal.
    const currentPricePerQuintal = currentPriceNum * 100;

    // Map the UI crop labels to commodity names supported by the model.
    const commodityMap: Record<string, string> = {
      'Alphonso Mango': 'Mango',
      'Basmati Rice': 'Rice',
      'Organic Vine Tomatoes': 'Tomato',
      'Nagpur Oranges': 'Orange',
      'Nashik Red Onions': 'Onion',
      'Shimla Royal Delicious Apples': 'Apple',
    };

    const commodity = commodityMap[crop] || crop;

    setIsAssessing(true);

    try {
      const response = await fetch('/api/predict/price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          state,
          district,
          commodity,
          market: district,
          current_price: currentPricePerQuintal,
          forecast_date: new Date().toISOString().slice(0, 10),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details || data.error || `Prediction request failed (${response.status}).`
        );
      }

      if (
        typeof data.predicted_price_per_kg !== 'number' ||
        typeof data.predicted_price_per_quintal !== 'number' ||
        !data.target_date
      ) {
        throw new Error('The prediction API returned an unexpected response.');
      }

      setPrediction(data as PredictionResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to obtain a price prediction. Check that both servers are running.'
      );
    } finally {
      setIsAssessing(false);
    }
  };

  const predictedPrice = prediction?.predicted_price_per_kg ?? 0;
  const priceDelta = predictedPrice - currentPriceNum;
  const totalLotRevenue = quantityNum * predictedPrice;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Navigation Back Button */}
      <div className="flex items-center justify-start">
        <BackButton fallback="/farmer/dashboard" />
      </div>

      <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#bbf7d0] shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
          <span className="text-[11px] font-semibold text-[#16a34a] uppercase tracking-wider">
            Market Advisory
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1c1917]">
          Check Market Prices & Selling Guide
        </h1>
        <p className="text-xs sm:text-sm text-[#78716c] max-w-2xl">
          Get a seven-day crop price forecast from the connected AgriTrace prediction API.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#bbf7d0] shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1c1917] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#16a34a]" />
                Crop & Harvest Details
              </h2>
              <p className="text-xs text-[#78716c] mt-1">
                Enter your crop and market details to request a prediction.
              </p>
            </div>

            <form onSubmit={handleAssessment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1">
                  Crop Variety *
                </label>
                <select
                  required
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-[#bbf7d0] rounded-lg text-stone-900"
                >
                  <option value="Alphonso Mango">Ratnagiri Alphonso Mango</option>
                  <option value="Basmati Rice">Traditional Basmati Rice (Pusa 1121)</option>
                  <option value="Organic Vine Tomatoes">Organic Vine Tomatoes</option>
                  <option value="Nagpur Oranges">Nagpur Mandarin Oranges</option>
                  <option value="Nashik Red Onions">Nashik Red Onions</option>
                  <option value="Shimla Royal Delicious Apples">Shimla Royal Apples</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Volume (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-[#bbf7d0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Quality Grade
                  </label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-[#bbf7d0] rounded-lg"
                  >
                    <option>Grade A (Export Quality)</option>
                    <option>Grade B (Premium Domestic)</option>
                    <option>Grade C (Standard Market)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Farm District, State *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Ludhiana, Punjab"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-[#bbf7d0] rounded-lg"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  Enter District, State in that order.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-2 py-2 text-xs bg-stone-50 border border-[#bbf7d0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Current Mandi (₹/kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={currentMarketPrice}
                    onChange={(e) => setCurrentMarketPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-[#bbf7d0] rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAssessing}
                className="w-full py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAssessing ? (
                  'Getting real model prediction...'
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Calculate Price Forecast
                  </>
                )}
              </button>
            </form>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
              >
                <strong>Prediction failed:</strong> {error}
              </div>
            )}
          </div>

          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs text-[#78716c] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#1c1917]">
              <Info className="w-3.5 h-3.5 text-[#16a34a]" />
              Model information
            </div>
            <p className="text-[11px] leading-relaxed">
              The prediction uses the connected API. Quality grade, harvest date,
              and lot quantity are collected by the form but are not sent as model
              features by the current prediction endpoint.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#bbf7d0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h2 className="text-sm font-bold text-[#1c1917]">
                Seven-Day Price Prediction
              </h2>
              {prediction && (
                <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                  <CheckCircle2 className="w-3 h-3 inline mr-1" />
                  {prediction.forecast_method === 'baseline' ? 'Best evaluated strategy: Baseline' : 'API result'}
                </span>
              )}
            </div>

            {!prediction ? (
              <div className="py-12 text-center text-sm text-stone-500">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-600" />
                Submit the form to fetch a prediction from your Python model.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <span className="text-xs text-[#78716c] block">
                      Predicted Price on {prediction.target_date}
                    </span>
                    <div className="text-3xl font-extrabold text-[#16a34a] mt-1 font-mono">
                      ₹{formatPrice(predictedPrice)}
                      <span className="text-xs font-normal text-[#78716c] ml-1">
                        / kg
                      </span>
                    </div>
                    <div className={`text-xs font-semibold mt-2 flex items-center gap-1 ${priceDelta >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      <ArrowUpRight className="w-4 h-4" />
                      {priceDelta >= 0 ? '+' : ''}
                      ₹{formatPrice(priceDelta)}/kg compared with the entered price
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-green-50/60 border border-[#bbf7d0] space-y-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-600">Current price:</span>
                      <strong>₹{formatPrice(currentPriceNum)}/kg</strong>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-stone-600">Forecast per quintal:</span>
                      <strong>₹{formatPrice(prediction.predicted_price_per_quintal)}</strong>
                    </div>
                    <div className="flex justify-between gap-2 border-t border-green-200 pt-2">
                      <span className="text-stone-600">Estimated lot value:</span>
                      <strong className="text-green-700">
                        ₹{Math.round(totalLotRevenue).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="text-[10px] text-stone-500 text-right">
                      {quantityNum.toLocaleString('en-IN')} kg
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <span className="font-semibold text-sm text-stone-800">
                    Forecast details
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-stone-50 border rounded-lg p-3">
                      <span className="block text-stone-500">Commodity</span>
                      <strong>{prediction.commodity}</strong>
                    </div>
                    <div className="bg-stone-50 border rounded-lg p-3">
                      <span className="block text-stone-500">Market</span>
                      <strong>{prediction.market}</strong>
                    </div>
                    <div className="bg-stone-50 border rounded-lg p-3">
                      <span className="block text-stone-500">Forecast horizon</span>
                      <strong>{prediction.forecast_horizon_days} days</strong>
                    </div>
                    <div className="bg-stone-50 border rounded-lg p-3">
                      <span className="block text-stone-500">Target date</span>
                      <strong>{prediction.target_date}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 text-xs text-stone-600">
                  This result is from the connected prediction API. The price
                  difference is calculated from your entered market price; it is
                  not a separate recommendation generated by the model.
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => navigate('/farmer/register-produce')}
              className="w-full sm:w-1/2 py-2.5 px-4 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              Add Crop at This Price
            </button>
            <button
              onClick={() => navigate('/farmer/transfers')}
              className="w-full sm:w-1/2 py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-300 text-stone-900 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
            >
              Transfer Existing Crop
              <ArrowRight className="w-4 h-4 text-green-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


