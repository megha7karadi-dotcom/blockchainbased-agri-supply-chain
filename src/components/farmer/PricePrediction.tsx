import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  MapPin, 
  Scale, 
  ArrowUpRight, 
  Info, 
  ArrowRight,
  Package, 
  Layers, 
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  selectBestModelForCrop, 
  calculateModelInference,
  ModelPredictionOutput
} from '../../data/predictionModels';
import { useApp } from '../../context/AppContext';

export const PricePrediction: React.FC = () => {
  const { navigate } = useApp();

  // Farmer produce inputs
  const [crop, setCrop] = useState('Alphonso Mango');
  const [quantity, setQuantity] = useState('1200');
  const [qualityGrade, setQualityGrade] = useState<'Grade A (Export Quality)' | 'Grade B (Premium Domestic)' | 'Grade C (Standard Market)'>('Grade A (Export Quality)');
  const [location, setLocation] = useState('Ratnagiri, Maharashtra');
  const [harvestDate, setHarvestDate] = useState('2026-05-15');
  const [currentMarketPrice, setCurrentMarketPrice] = useState('120');

  const [isAssessing, setIsAssessing] = useState(false);

  const currentNum = parseFloat(currentMarketPrice) || 100;
  const quantityNum = parseFloat(quantity) || 1000;

  const bestPrediction: ModelPredictionOutput = useMemo(() => {
    const bestInternalModel = selectBestModelForCrop(crop);
    return calculateModelInference(bestInternalModel, currentNum, qualityGrade, quantityNum, crop);
  }, [crop, currentNum, qualityGrade, quantityNum]);

  const handleAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssessing(true);
    setTimeout(() => {
      setIsAssessing(false);
    }, 400);
  };

  const totalLotRevenue = Math.round(quantityNum * bestPrediction.predictedPrice);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Page Header */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#DCE5D9] shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#246B35]"></span>
              <span className="text-[11px] font-semibold text-[#246B35] uppercase tracking-wider">
                Market Advisory
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#263329]">
              Check Market Prices & Selling Guide
            </h1>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 self-start sm:self-auto">
            Market Estimate
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#657267] max-w-2xl leading-relaxed">
          Check upcoming market trends and estimated selling prices so you can sell your harvest at the right time.
        </p>
      </div>

      {/* Grid: Produce Parameters Input (Left) + Best Price & Forecast (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DCE5D9] shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#263329] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#246B35]" />
                <span>Crop & Harvest Details</span>
              </h2>
              <p className="text-xs text-[#657267] mt-0.5">
                Input your crop details to see market price forecasts
              </p>
            </div>

            <form onSubmit={handleAssessment} className="space-y-3.5">
              {/* Crop Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#263329] mb-1">
                  Crop Variety *
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-[#DCE5D9] rounded-lg focus:bg-white focus:border-[#246B35] outline-none transition font-medium text-stone-900"
                >
                  <option value="Alphonso Mango">Ratnagiri Alphonso Mango</option>
                  <option value="Basmati Rice">Traditional Basmati Rice (Pusa 1121)</option>
                  <option value="Organic Vine Tomatoes">Organic Vine Tomatoes</option>
                  <option value="Nagpur Oranges">Nagpur Mandarin Oranges</option>
                  <option value="Nashik Red Onions">Nashik Red Onions</option>
                  <option value="Shimla Royal Delicious Apples">Shimla Royal Apples</option>
                </select>
              </div>

              {/* Quantity & Quality */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#263329] mb-1">
                    Volume (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1200"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-[#DCE5D9] rounded-lg focus:bg-white focus:border-[#246B35] outline-none transition font-mono text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263329] mb-1">
                    Quality Grade *
                  </label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-[#DCE5D9] rounded-lg focus:bg-white focus:border-[#246B35] outline-none transition text-stone-900"
                  >
                    <option value="Grade A (Export Quality)">Grade A (Export Quality)</option>
                    <option value="Grade B (Premium Domestic)">Grade B (Domestic)</option>
                    <option value="Grade C (Standard Market)">Grade C (Standard)</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-[#263329] mb-1">
                  Farm District *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Ratnagiri, Maharashtra"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-[#DCE5D9] rounded-lg focus:bg-white focus:border-[#246B35] outline-none transition text-stone-900"
                  />
                </div>
              </div>

              {/* Harvest Date & Current Mandi Spot */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#263329] mb-1">
                    Harvest Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-[#DCE5D9] rounded-lg focus:bg-white focus:border-[#246B35] outline-none transition text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#263329] mb-1">
                    Current Mandi (₹/kg) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-stone-400">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={currentMarketPrice}
                      onChange={(e) => setCurrentMarketPrice(e.target.value)}
                      placeholder="120"
                      className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-[#DCE5D9] rounded-lg focus:bg-white focus:border-[#246B35] outline-none transition font-mono text-stone-900"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAssessing}
                className="w-full py-2.5 bg-[#246B35] hover:bg-[#1B4332] text-white font-bold text-xs sm:text-sm rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isAssessing ? (
                  <span>Checking Mandi Trends...</span>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>Calculate Price Forecast</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs text-[#657267] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#263329]">
              <Info className="w-3.5 h-3.5 text-[#246B35]" />
              <span>Direct Sale Advantage</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Middlemen and local agents often quote lower prices. Use this forecast based on APMC arrivals to negotiate direct sales with verified distributors.
            </p>
          </div>
        </div>

        {/* Right Column: Price Output */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Price Card */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#DCE5D9] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h2 className="text-sm font-bold text-[#263329]">
                Recommended Price & Earnings
              </h2>
              <span className="text-xs text-[#246B35] font-semibold bg-[#F0F7EC] px-2 py-0.5 rounded border border-[#DCE5D9]">
                Expected Range
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <span className="text-xs text-[#657267] block">
                  Recommended Selling Price
                </span>
                <div className="text-3xl font-extrabold text-[#246B35] mt-1 font-mono">
                  ₹{bestPrediction.predictedPrice}
                  <span className="text-xs font-normal text-[#657267] ml-1">/ kg</span>
                </div>
                <div className="text-xs text-[#246B35] font-semibold mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+₹{bestPrediction.priceDelta}/kg above current spot</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F0F7EC]/60 border border-[#DCE5D9] space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#657267]">Price Band:</span>
                  <span className="font-bold text-[#263329] font-mono">
                    ₹{bestPrediction.lowRange} – ₹{bestPrediction.highRange} / kg
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-[#DCE5D9]">
                  <span className="text-[#657267]">Total Estimated Value:</span>
                  <span className="font-bold text-[#246B35] text-sm font-mono">
                    ₹{totalLotRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-[10px] text-stone-400 text-right">
                  For {quantityNum.toLocaleString()} kg crop volume
                </div>
              </div>
            </div>

            {/* 30-Day Trend */}
            <div className="pt-3 border-t border-stone-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#263329] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#246B35]" />
                  <span>Next 30 Days Forecast</span>
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {bestPrediction.forecastCurve.map((pt, idx) => (
                  <div 
                    key={pt.period} 
                    className={`p-2 rounded border text-center text-xs space-y-0.5 ${
                      idx === 2 
                        ? 'bg-[#E3F0DC] border-[#4F9D45] text-[#246B35] font-bold' 
                        : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <span className="text-[10px] block text-[#657267]">{pt.period}</span>
                    <span className="text-xs sm:text-sm block font-mono font-bold">₹{pt.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Advice */}
          <div className="bg-white rounded-xl p-5 border border-[#DCE5D9] shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#263329]">Selling Recommendation</span>
              <span className="px-2.5 py-0.5 rounded font-semibold text-xs bg-[#F0F7EC] text-[#246B35] border border-[#DCE5D9]">
                {bestPrediction.recommendedAction === 'IMMEDIATE DISPATCH' ? 'Good Time to Sell' : 'Consider Waiting'}
              </span>
            </div>
            <p className="text-xs text-[#657267] leading-relaxed">
              {bestPrediction.recommendationReason}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => navigate('/farmer/register-produce')}
              className="w-full sm:w-1/2 py-2.5 px-4 bg-[#246B35] hover:bg-[#1B4332] text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Package className="w-4 h-4" />
              <span>Add Crop at This Price</span>
            </button>
            <button
              onClick={() => navigate('/farmer/transfers')}
              className="w-full sm:w-1/2 py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-300 text-[#263329] rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Transfer Existing Crop</span>
              <ArrowRight className="w-4 h-4 text-[#246B35]" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
