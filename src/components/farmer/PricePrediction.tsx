import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Scale, 
  IndianRupee, 
  ArrowUpRight, 
  Info, 
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  Clock
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
  const [hasEvaluated, setHasEvaluated] = useState(true);

  // The multi-model selection and inference happens completely internally!
  // The system automatically determines the best performing model based on crop type,
  // perishability profile, shelf-life, and market arrival dynamics.
  const currentNum = parseFloat(currentMarketPrice) || 100;
  const quantityNum = parseFloat(quantity) || 1000;

  const bestPrediction: ModelPredictionOutput = useMemo(() => {
    // 1. Internally select the highest-performing model suited for this crop
    const bestInternalModel = selectBestModelForCrop(crop);
    // 2. Compute inference using the optimal model
    return calculateModelInference(bestInternalModel, currentNum, qualityGrade, quantityNum, crop);
  }, [crop, currentNum, qualityGrade, quantityNum]);

  const handleAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssessing(true);
    setTimeout(() => {
      setIsAssessing(false);
      setHasEvaluated(true);
    }, 450);
  };

  const totalLotRevenue = Math.round(quantityNum * bestPrediction.predictedPrice);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 text-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Price Prediction & Selling Advisory
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            Estimate Only
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          Check upcoming market trends and estimated future selling prices to choose the best time to sell your harvest.
        </p>
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs font-semibold text-amber-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Notice: Price prediction is an estimate and not a guarantee.</span>
        </div>
      </div>

      {/* Grid: Produce Parameters Input (Left) + Best Price & Forecast (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Harvest Parameters Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Harvest Lot Details</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Input your harvest particulars to generate the optimal market price
              </p>
            </div>

            <form onSubmit={handleAssessment} className="space-y-4">
              {/* 1. Crop Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Crop Variety *
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition font-medium text-slate-900"
                >
                  <option value="Alphonso Mango">Ratnagiri Alphonso Mango (Orchard Fruit)</option>
                  <option value="Basmati Rice">Traditional Basmati Rice Pusa 1121 (Durable Grain)</option>
                  <option value="Organic Vine Tomatoes">Organic Vine Tomatoes (Perishable Vegetable)</option>
                  <option value="Nagpur Oranges">Nagpur Mandarin Oranges (Seasonal Fruit)</option>
                  <option value="Nashik Red Onions">Nashik Red Onions (Volatile Cash Bulb)</option>
                  <option value="Shimla Royal Delicious Apples">Shimla Royal Delicious Apples (Cold Fruit)</option>
                </select>
              </div>

              {/* 2. Quantity & Quality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lot Volume (kg) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 1200"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quality Grade *
                  </label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition text-slate-900"
                  >
                    <option value="Grade A (Export Quality)">Grade A (Export Quality)</option>
                    <option value="Grade B (Premium Domestic)">Grade B (Premium Domestic)</option>
                    <option value="Grade C (Standard Market)">Grade C (Standard Market)</option>
                  </select>
                </div>
              </div>

              {/* 3. Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Farm Location / District *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Ratnagiri, Maharashtra"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition text-slate-900"
                  />
                </div>
              </div>

              {/* 4. Harvest Date & Current Mandi Spot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harvest Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Mandi Spot (₹/kg) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={currentMarketPrice}
                      onChange={(e) => setCurrentMarketPrice(e.target.value)}
                      placeholder="120"
                      className="w-full pl-8 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Submit / Recalculate Button */}
              <button
                type="submit"
                disabled={isAssessing}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isAssessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Analyzing APMC Market Trends...</span>
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Calculate Fair Price Forecast</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Guidance Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>How Fair Pricing Protects You</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Middlemen and speculative traders often offer below-market spot rates. Our fair price algorithm checks historical APMC arrivals, seasonal scarcity, and export quality premiums so you can negotiate or list produce with total confidence.
            </p>
          </div>
        </div>

        {/* Right Column: Best Predicted Fair Price & Actionable Advisory */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. PRIMARY PREDICTED FAIR PRICE CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Fair Value Advisory
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  Recommended Farmgate Price
                </span>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 font-mono">
                  ₹{bestPrediction.predictedPrice}
                  <span className="text-xs font-semibold text-slate-500 ml-1">/ kg</span>
                </div>
                <div className="text-xs text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+₹{bestPrediction.priceDelta} / kg (+{bestPrediction.percentGain}%) above current spot</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Expected Price Range:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{bestPrediction.lowRange} – ₹{bestPrediction.highRange} / kg
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Estimated Lot Revenue:</span>
                  <span className="font-extrabold text-emerald-800 text-sm font-mono">
                    ₹{totalLotRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pt-0.5 text-right font-mono">
                  Based on {quantityNum.toLocaleString()} kg batch volume
                </div>
              </div>
            </div>

            {/* 30-Day Market Price Trajectory */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>30-Day Market Price Trajectory</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Forecast Band</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {bestPrediction.forecastCurve.map((pt, idx) => (
                  <div 
                    key={pt.period} 
                    className={`p-2.5 rounded-xl border text-center text-xs space-y-1 ${
                      idx === 2 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs' 
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-[10px] block text-slate-400 font-mono">{pt.period}</span>
                    <span className="text-xs sm:text-sm block font-mono font-bold">₹{pt.price}</span>
                    <span className="text-[9px] block text-slate-400 font-mono">₹{pt.lowerBound}-{pt.upperBound}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. ACTIONABLE SELLING STRATEGY CARD - Unified Theme */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 text-slate-900 rounded-3xl p-6 sm:p-7 border border-emerald-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900">Recommended Selling Strategy</h3>
              </div>
              {(() => {
                let badgeText = "Consider waiting";
                let badgeClass = "bg-amber-100 text-amber-900 border-amber-300";
                if (bestPrediction.priceDelta < 0) {
                  badgeText = "Price may decrease";
                  badgeClass = "bg-rose-100 text-rose-900 border-rose-300";
                } else if (bestPrediction.recommendedAction === 'IMMEDIATE DISPATCH' || bestPrediction.percentGain <= 5) {
                  badgeText = "Good time to sell";
                  badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
                } else {
                  badgeText = "Consider waiting";
                  badgeClass = "bg-blue-100 text-blue-900 border-blue-300";
                }
                return (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                    {badgeText}
                  </span>
                );
              })()}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {bestPrediction.recommendationReason}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-slate-500 text-[11px] block">Current Spot Price</span>
                <span className="font-bold text-slate-900 text-sm font-mono">₹{currentMarketPrice}/kg</span>
                <span className="text-[10px] text-slate-500 block">Immediate liquidity</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-emerald-300 shadow-2xs space-y-1">
                <span className="text-emerald-800 text-[11px] font-semibold block">Target Realization</span>
                <span className="font-bold text-emerald-800 text-sm font-mono">₹{bestPrediction.predictedPrice}/kg</span>
                <span className="text-[10px] text-emerald-700 font-medium block">+{bestPrediction.percentGain}% gain</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-slate-500 text-[11px] block">Export Ceiling Potential</span>
                <span className="font-bold text-slate-900 text-sm font-mono">₹{bestPrediction.highRange}/kg</span>
                <span className="text-[10px] text-slate-500 block">Grade A premium</span>
              </div>
            </div>
          </div>

          {/* 3. KEY MARKET FACTORS INFLUENCING YOUR PRICE */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Key Market Drivers for {crop}</span>
            </h3>

            <div className="space-y-3">
              {bestPrediction.featureSensitivities.map((sens) => (
                <div key={sens.factor} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{sens.factor}</span>
                    <span className={`text-[11px] font-semibold ${
                      sens.impact === 'positive' 
                        ? 'text-emerald-700' 
                        : 'text-rose-700'
                    }`}>
                      {sens.impact === 'positive' ? `Bullish (+${sens.weightPercent}%)` : `Friction (-${sens.weightPercent}%)`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{sens.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. ACTIONS FOR FARMER */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => navigate('/farmer/register-produce')}
              className="w-full sm:w-1/2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Package className="w-4 h-4" />
              <span>Register Lot with This Target Price</span>
            </button>
            <button
              onClick={() => navigate('/farmer/bids')}
              className="w-full sm:w-1/2 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>Review Matching Buyer Bids</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
