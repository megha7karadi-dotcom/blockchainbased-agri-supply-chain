import React from 'react';
import { 
  ShieldCheck, 
  Leaf, 
  TrendingUp, 
  QrCode, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  Layers, 
  Truck, 
  Store, 
  ShoppingBag,
  Sparkles,
  BarChart3, 
  Lock, 
  ChevronRight,
  MapPin,
  Calendar,
  ThermometerSnowflake,
  ShieldAlert,
  Award,
  Sprout,
  ArrowRightLeft,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingPage: React.FC<{ onOpenQRScanner: () => void }> = ({ onOpenQRScanner }) => {
  const { 
    batches, 
    navigate,
    navigateToVerification, 
    searchBatchQuery, 
    setSearchBatchQuery
  } = useApp();

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchBatchQuery.trim()) {
      const match = batches.find(b => 
        b.batchId.toLowerCase().includes(searchBatchQuery.toLowerCase()) ||
        b.name.toLowerCase().includes(searchBatchQuery.toLowerCase())
      );
      navigateToVerification(match ? match.id : 'batch-001');
    } else {
      navigateToVerification('batch-001');
    }
  };

  const sampleBatch = batches[0] || null;

  // The 3 required featured products
  const featuredBatches = batches.slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-slate-800">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Agricultural Supply-Chain Traceability</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Transparent Agricultural Supply Chains, <span className="text-emerald-400">From Farm to Shelf</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              AgriTrace connects farmers, distributors, retailers, and consumers through traceable produce records, transparent pricing, and blockchain-backed provenance.
            </p>

            {/* Quick Track Input for Consumers */}
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 shadow-xl">
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-emerald-400" />
                <input
                  type="text"
                  value={searchBatchQuery}
                  onChange={(e) => setSearchBatchQuery(e.target.value)}
                  placeholder="Enter Batch ID (e.g., AGRI-2026-MNG-001) or crop..."
                  className="w-full pl-10 pr-3 py-2.5 bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm outline-none font-mono"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <span>Trace Your Produce</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onOpenQRScanner}
                  className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition flex items-center justify-center border border-white/20 gap-1.5 text-xs font-semibold cursor-pointer"
                  title="Scan Packaging QR"
                >
                  <QrCode className="w-4 h-4 text-emerald-300" />
                  <span className="hidden sm:inline">Scan QR</span>
                </button>
              </div>
            </form>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button 
                onClick={() => navigate('/trace-products')} 
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Trace Your Produce</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/signup')} 
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/15 transition cursor-pointer"
              >
                Get Started
              </button>
              <button 
                onClick={onOpenQRScanner}
                className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/10 text-emerald-300 font-semibold text-xs sm:text-sm border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan QR</span>
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/10 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Log In</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Provenance Preview Card */}
          {sampleBatch && (
            <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl p-6 text-slate-900 border border-white/30 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="font-mono text-xs font-bold text-emerald-800">
                    Live Verified Batch
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  On-Chain Provenance
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <img 
                  src={sampleBatch.imageUrl} 
                  alt={sampleBatch.name} 
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <div className="font-mono text-[11px] text-emerald-700 font-semibold">{sampleBatch.batchId}</div>
                  <h3 className="font-extrabold text-base text-slate-900 truncate">{sampleBatch.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{sampleBatch.variety}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Farmgate Price</span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {sampleBatch.pricing.currency}{sampleBatch.pricing.farmerPrice}/kg
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Retail Price</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {sampleBatch.pricing.currency}{sampleBatch.pricing.finalConsumerPrice}/kg
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200 flex justify-between text-[11px]">
                  <span className="text-slate-500">Origin:</span>
                  <span className="font-medium text-slate-800">{(sampleBatch.farmerLocation || sampleBatch.farmLocation || 'Maharashtra, India').split(',')[0]}</span>
                </div>
              </div>

              <button
                onClick={() => navigateToVerification(sampleBatch.id)}
                className="w-full py-2.5 bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Inspect Provenance Certificate</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Realistic Terminology Value Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Blockchain-backed Provenance</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Cryptographic lot custody</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Tamper-evident Records</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Immutable event history</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Transparent Price History</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Farmgate to shelf markup</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Traceable Ownership</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Verified custodian handoffs</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 col-span-2 lg:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">AI-assisted Price Insights</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Predictive mandi analytics</div>
          </div>
        </div>
      </section>

      {/* A. PLATFORM OVERVIEW: Farm → Distributor → Retailer → Consumer */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8">
        <div className="max-w-2xl space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <span>Platform Overview</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Seamless Produce Flow: Farm → Distributor → Retailer → Consumer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Every participant in the value chain connects to a unified ledger, preserving product origin, quality metrics, and fair pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Stage 1: Farm */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative hover:border-emerald-300 transition">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                1
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Source
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Farm</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Farmer registers harvest with GPS coordinates, variety, lab certs, and initial farmgate price.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
              Output: Minted Batch Token & QR
            </div>
          </div>

          {/* Stage 2: Distributor */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative hover:border-blue-300 transition">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                2
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Transit & Cold Chain
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Distributor</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Logistics provider accepts custody, records freight overhead, and logs reefer temperature telemetry.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
              Output: Verified Custody Transfer
            </div>
          </div>

          {/* Stage 3: Retailer */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative hover:border-purple-300 transition">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                3
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Inventory & Shelf
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Retailer</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Supermarket scans intake lot, verifies quality grade, and updates retail price transparently.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
              Output: Shelf Placement & Final Price
            </div>
          </div>

          {/* Stage 4: Consumer */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative hover:border-teal-300 transition">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                4
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Direct Verification
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Consumer</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Shopper scans QR tag on packaging to review complete journey, farm origin, and fair payout history.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
              Output: Instant Trust & Transparency
            </div>
          </div>
        </div>
      </section>

      {/* B. HOW IT WORKS: 6 Sequential Steps */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8">
        <div className="max-w-2xl space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <span>Process & Verification</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A standardized 6-step lifecycle that guarantees produce provenance and price honesty from origin to table.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                01
              </span>
              <Sprout className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">1. Register Produce</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Farmer logs crop name, harvest date, quantity, soil metrics, and initial farmgate price into the registry.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                02
              </span>
              <FileCheck2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">2. Record Supply-Chain Transactions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every dispatch, quality inspection, and transport milestone is signed with timestamps and sensor telemetry.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs">
                03
              </span>
              <ArrowRightLeft className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">3. Transfer Ownership</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Smart contract custody changes cryptographically upon delivery confirmation from distributor to retail hub.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                04
              </span>
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">4. Update Pricing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent cost additions (freight, chilling, store overhead) are recorded, preventing middleman price gouging.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                05
              </span>
              <QrCode className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">5. Generate QR</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              System issues tamper-evident packaging QR tags linking physical retail crates directly to digital provenance records.
            </p>
          </div>

          {/* Step 6 */}
          <div className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs">
                06
              </span>
              <ShieldCheck className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">6. Consumer Verifies Product</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consumers scan the QR code with any smartphone to inspect farm location, harvest date, quality tests, and price buildup.
            </p>
          </div>
        </div>
      </section>

      {/* C. FEATURED VERIFIED PRODUCE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Verified Produce</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Verified Produce Batches
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Explore authentic agricultural lots with verified provenance, farmgate compensation, and custody history.
            </p>
          </div>
          <button
            onClick={() => navigate('/trace-products')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All Batches</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBatches.map((batch) => {
            return (
              <div 
                key={batch.id} 
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 relative overflow-hidden bg-slate-100">
                    <img 
                      src={batch.imageUrl} 
                      alt={batch.name} 
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-white/95 text-slate-900 shadow-xs">
                        {batch.batchId}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {batch.category}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{batch.name}</h3>
                      <p className="text-xs text-slate-500">{batch.variety}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Origin:</span>
                        <span className="font-medium text-slate-800">{batch.farmerLocation || batch.farmLocation || 'Local Farm'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Harvest Date:</span>
                        <span className="font-medium text-slate-800">{batch.harvestDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Quality Grade:</span>
                        <span className="font-semibold text-slate-900">{(batch.quality?.grade || 'Grade A').split(' ')[0]}</span>
                      </div>
                    </div>

                    {/* Farmgate and Retail Pricing Details */}
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Farmgate Price:</span>
                        <span className="font-bold text-emerald-800">
                          {batch.pricing.currency}{batch.pricing.farmerPrice.toFixed(2)}/kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Retail Price:</span>
                        <span className="font-bold text-slate-900">
                          {batch.pricing.currency}{batch.pricing.finalConsumerPrice.toFixed(2)}/kg
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-emerald-200/60 text-[11px] font-bold text-emerald-800">
                        <span>Verification Status:</span>
                        <span className="text-emerald-700">Audit Confirmed</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => navigateToVerification(batch.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <span>View Product</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* D. BENEFITS: Farmer, Distributor, Retailer, Consumer */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <span>Value Proposition</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Benefits for the Entire Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Purpose-built functionality delivering verifiable value to every participant in agricultural trade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Farmer */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Farmer</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold text-emerald-800">
                Transparent pricing and traceable sales
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct on-chain lot tokenization guarantees authentic harvest attribution, fair compensation, and protection against distress markdowns.
              </p>
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-2 cursor-pointer"
            >
              <span>Onboard as Farmer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Distributor */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Distributor</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold text-blue-800">
                Supply-chain and transportation visibility
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Real-time cold-chain tracking, automated custody transfers, and digital dispatch notes eliminate cargo disputes and transit losses.
              </p>
            </div>
            <button
              onClick={() => navigate('/for-businesses')}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 pt-2 cursor-pointer"
            >
              <span>Logistics Solutions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Retailer */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Retailer</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold text-purple-800">
                Inventory and product provenance
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verified certificates of origin, certified organic audits, and transparent markup compliance build unmatched customer loyalty on retail shelves.
              </p>
            </div>
            <button
              onClick={() => navigate('/for-businesses')}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 pt-2 cursor-pointer"
            >
              <span>Retailer Integration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Consumer */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Consumer</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold text-teal-800">
                QR-based product verification
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Immediate smartphone access to genuine farmgate payouts, harvest location, chemical residue tests, and journey timeline without downloading apps.
              </p>
            </div>
            <button
              onClick={onOpenQRScanner}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 pt-2 cursor-pointer"
            >
              <span>Scan QR Code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* E. CALL TO ACTION */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
            AgriTrace Platform
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Build a more transparent agricultural supply chain.
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Whether you are a grower seeking fair prices, a distributor optimizing cold transit, or a retailer delivering certified provenance, join the AgriTrace network today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <span>Register as Farmer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition cursor-pointer"
          >
            Partner as Distributor or Retailer
          </button>
        </div>
      </section>

    </div>
  );
};
