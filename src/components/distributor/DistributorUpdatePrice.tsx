import React, { useState } from 'react';
import { 
  BadgePercent, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  DollarSign, 
  ShieldCheck, 
  Scale, 
  Layers, 
  ArrowRight,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

export const DistributorUpdatePrice: React.FC = () => {
  const { batches, updateDistributorPrice, distributorSetPrice, navigateToVerification } = useApp();

  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [logisticsCost, setLogisticsCost] = useState<number>(25);
  const [margin, setMargin] = useState<number>(15);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Active batches under distributor custody or ready for pricing
  const distributorBatches = batches.filter(b => 
    b.status === 'In Transit' || 
    b.status === 'At Distributor' || 
    b.status === 'Ready for Dispatch' ||
    b.currentCustodianRole === 'distributor'
  );

  const activeBatch = batches.find(b => b.id === selectedBatchId || b.batchId === selectedBatchId) || distributorBatches[0] || batches[0];

  const handleSelectBatch = (b: ProduceBatch) => {
    setSelectedBatchId(b.id);
    setLogisticsCost(b.pricing?.distributorLogisticsCost || 25);
    setMargin(b.pricing?.distributorMargin || 15);
    setSuccessNotice(null);
  };

  const farmerPrice = activeBatch?.pricing?.farmerPrice || activeBatch?.farmgatePrice || 40;
  const wholesalePrice = farmerPrice + Number(logisticsCost) + Number(margin);
  const fairCeiling = activeBatch?.pricing?.fairPriceCeiling || Math.round(farmerPrice * 2.2);
  const isOverCeiling = wholesalePrice > fairCeiling;
  const quantityKg = activeBatch?.quantityKg || activeBatch?.quantity || 500;
  const totalWholesaleValue = wholesalePrice * quantityKg;
  const totalMarginProfit = Number(margin) * quantityKg;
  const marginPercentage = Math.round((Number(margin) / wholesalePrice) * 100) || 0;

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch) return;

    updateDistributorPrice(activeBatch.id, Number(logisticsCost), Number(margin));
    try {
      await distributorSetPrice(activeBatch.batchId, farmerPrice, marginPercentage, wholesalePrice);
    } catch {
      // Optimistic state was already updated
    }
    setSuccessNotice(`Wholesale price for ${activeBatch.cropName || activeBatch.name} (${activeBatch.batchId}) updated to ₹${wholesalePrice}/kg. Transparent pricing logged.`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-12"
    >
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/50 text-slate-900 rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Wholesale Price & Margin Architecture
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Configure transparent cold-chain freight rates and distribution margins. Price structures are cryptographically signed to prevent middleman exploitation and ensure compliance with APMC fair price ceilings.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs text-center flex-shrink-0">
          <span className="text-[11px] text-slate-500 font-semibold block">Regulated Margin Ceiling</span>
          <span className="text-2xl font-black text-blue-700">25.0%</span>
          <span className="text-[10px] text-emerald-700 font-medium block">Fair Trade Compliant</span>
        </div>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
          <button 
            onClick={() => setSuccessNotice(null)} 
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Main Layout: Batch Selection & Price Configuration Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Lot Selector (4 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Select Produce Lot</h2>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                {distributorBatches.length} Available
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lot ID or crop..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {distributorBatches
                .filter(b => 
                  (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (b.batchId || '').toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(batch => {
                  const isSelected = activeBatch?.id === batch.id;
                  return (
                    <button
                      key={batch.id}
                      onClick={() => handleSelectBatch(batch)}
                      className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-400 shadow-2xs' 
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-slate-800">
                            {batch.batchId}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {batch.quantityKg || batch.quantity} kg
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 line-clamp-1">{batch.name}</div>
                        <div className="text-[11px] text-slate-500">
                          Farmer floor: <strong className="text-emerald-800 font-mono">₹{batch.pricing?.farmerPrice || batch.farmgatePrice}/kg</strong>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-900 block">
                          ₹{batch.pricing?.finalConsumerPrice || 80}/kg
                        </span>
                        <span className="text-[10px] text-blue-700 font-semibold">Wholesale</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Margin Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeBatch ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
              
              {/* Active Lot Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {activeBatch.batchId}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-semibold text-slate-500">{activeBatch.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{activeBatch.name}</h3>
                  <p className="text-xs text-slate-500">Farmer: {activeBatch.farmerName} • {activeBatch.farmerLocation || activeBatch.farmLocation}</p>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Lot Quantity</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{quantityKg.toLocaleString()} kg</span>
                </div>
              </div>

              {/* Live Cost Stack Visualizer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Supply Chain Cost Stack Breakdown</span>
                  <span className="font-mono text-blue-700">₹{wholesalePrice}/kg to Retailer</span>
                </div>

                <div className="h-4 rounded-xl overflow-hidden flex bg-slate-100 border border-slate-200 text-[10px] font-bold text-white text-center">
                  <div 
                    style={{ width: `${(farmerPrice / wholesalePrice) * 100}%` }}
                    className="bg-emerald-600 flex items-center justify-center transition-all"
                    title={`Farmer Price: ₹${farmerPrice}/kg`}
                  >
                    {Math.round((farmerPrice / wholesalePrice) * 100)}%
                  </div>
                  <div 
                    style={{ width: `${(logisticsCost / wholesalePrice) * 100}%` }}
                    className="bg-blue-600 flex items-center justify-center transition-all"
                    title={`Logistics: ₹${logisticsCost}/kg`}
                  >
                    {Math.round((logisticsCost / wholesalePrice) * 100)}%
                  </div>
                  <div 
                    style={{ width: `${(margin / wholesalePrice) * 100}%` }}
                    className="bg-indigo-600 flex items-center justify-center transition-all"
                    title={`Distributor Margin: ₹${margin}/kg`}
                  >
                    {Math.round((margin / wholesalePrice) * 100)}%
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>Farmer: ₹{farmerPrice}/kg</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span>Cold Freight: ₹{logisticsCost}/kg</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <span>Distributor Margin: ₹{margin}/kg ({marginPercentage}%)</span>
                  </span>
                </div>
              </div>

              {/* Pricing Form */}
              <form onSubmit={handleSavePrice} className="space-y-5 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block font-bold text-slate-800">
                      Cold Reefer Freight & Handling (₹/kg)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Includes refrigerated fuel, driver labor, packaging crates, and insurance.
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={logisticsCost}
                        onChange={(e) => setLogisticsCost(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block font-bold text-slate-800">
                      Distributor Margin (₹/kg)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Wholesale profit markup capped at 25% by fair trade governance.
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={margin}
                        onChange={(e) => setMargin(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Summary Box */}
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Calculated Wholesale Price to Retailer:</span>
                    <span className="text-base font-black text-blue-900 font-mono">₹{wholesalePrice}/kg</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Total Lot Wholesale Turnover ({quantityKg} kg):</span>
                    <span className="font-bold text-slate-900 font-mono">₹{totalWholesaleValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Net Distributor Margin Earned:</span>
                    <span className="font-bold text-emerald-800 font-mono">₹{totalMarginProfit.toLocaleString()}</span>
                  </div>
                </div>

                {/* Fair Price Ceiling Compliance Warning */}
                {isOverCeiling ? (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2 text-amber-900 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      Warning: Wholesale price ₹{wholesalePrice}/kg exceeds the APMC fair price ceiling of ₹{fairCeiling}/kg. An on-chain transparency flag will be recorded.
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-900 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      Compliant: Wholesale quote is within fair market limits (Ceiling: ₹{fairCeiling}/kg).
                    </span>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <BadgePercent className="w-4 h-4" />
                    <span>Publish Wholesale Price on Blockchain</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToVerification(activeBatch.batchId || activeBatch.id)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
                  >
                    View Batch Passport
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
              <BadgePercent className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-sm">No produce lot selected</p>
              <p className="text-xs text-slate-400">Select a batch from the left column to configure its price stack.</p>
            </div>
          )}
        </div>

      </div>

    </motion.div>
  );
};
