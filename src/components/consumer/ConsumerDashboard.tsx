import React, { useState } from 'react';
import { 
  ShoppingBag, 
  QrCode, 
  Search, 
  ShieldCheck, 
  Heart, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Camera,
  Star
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ConsumerDashboard: React.FC<{ onOpenQRScanner: () => void }> = ({ onOpenQRScanner }) => {
  const { batches, navigateToVerification, searchBatchQuery, setSearchBatchQuery } = useApp();
  const [manualBatchId, setManualBatchId] = useState('');

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBatchId.trim()) return;

    const match = batches.find(b => 
      b.batchId.toLowerCase().includes(manualBatchId.trim().toLowerCase()) ||
      b.name.toLowerCase().includes(manualBatchId.trim().toLowerCase())
    );
    navigateToVerification(match ? match.id : 'batch-001');
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Scanner Banner */}
      <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-teal-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Fair-Trade & Chemical Safety Shield</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Verify What You Eat
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Scan the QR tag on any grocery box or pouch to reveal the exact farmer, harvest date, lab test results, and true middleman pricing breakdown.
          </p>

          {/* Direct Code Input */}
          <form onSubmit={handleManualSearch} className="flex gap-2 max-w-md pt-2">
            <input
              type="text"
              value={manualBatchId}
              onChange={(e) => setManualBatchId(e.target.value)}
              placeholder="Enter Batch ID (e.g. AGRI-2026-MNG-001)..."
              className="flex-1 px-4 py-2.5 bg-white/10 text-white placeholder-slate-400 text-xs rounded-xl outline-none border border-white/20 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs"
            >
              Verify
            </button>
          </form>
        </div>

        <button
          onClick={onOpenQRScanner}
          className="p-8 bg-white/10 hover:bg-white/20 border-2 border-teal-400/50 rounded-3xl transition flex flex-col items-center gap-3 text-center group flex-shrink-0"
        >
          <div className="w-16 h-16 bg-teal-500 text-slate-950 rounded-2xl flex items-center justify-center group-hover:scale-110 transition shadow-lg">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white block">Tap to Scan QR Tag</span>
            <span className="text-[11px] text-teal-300">Opens Smartphone Camera</span>
          </div>
        </button>
      </div>

      {/* Consumer Impact Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Farmer Revenue Retained</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">62.4%</div>
          <div className="text-[11px] text-slate-500 mt-1">vs ~24% standard supermarket</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Chemical Residues</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">0.00%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">100% Zero-Residue Certified</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Average Freshness</span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">97.2%</div>
          <div className="text-[11px] text-slate-500 mt-1">Reefer cold-chain preserved</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Verified Harvests</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">8 Batches</div>
          <div className="text-[11px] text-slate-500 mt-1">In your local retail network</div>
        </div>
      </div>

      {/* Available Shelf Produce with Instant Verification */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Available Verified Groceries</h2>
          <p className="text-xs text-slate-500">Tap any item to audit its unalterable blockchain passport</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map(batch => (
            <div key={batch.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="h-44 relative bg-slate-100">
                  <img src={batch.imageUrl} alt={batch.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/90 backdrop-blur text-emerald-800">
                      {batch.quality.grade}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/80 backdrop-blur text-white">
                      {batch.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {batch.batchId}
                    </span>
                    <span className="text-xs text-slate-400">Harvest: {batch.harvestDate}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{batch.name}</h3>
                    <p className="text-xs text-slate-500">{batch.variety}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Origin Farm:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">{(batch.farmerLocation || batch.farmLocation || 'Local Farm').split(',')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Retail Price:</span>
                      <span className="font-bold text-emerald-700">₹{batch.pricing.finalConsumerPrice}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Farmer Received:</span>
                      <span className="font-semibold text-slate-800">₹{batch.pricing.farmerPrice}/kg ({Math.round((batch.pricing.farmerPrice / batch.pricing.finalConsumerPrice) * 100)}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => navigateToVerification(batch.id)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>View True Price Breakdown</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
