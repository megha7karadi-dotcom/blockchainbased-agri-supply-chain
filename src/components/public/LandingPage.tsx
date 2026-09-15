import React, { useState } from 'react';
import { motion } from 'motion/react';
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

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  // Filtered featured batches
  const filteredBatches = selectedCategory === 'all' 
    ? batches.slice(0, 6) 
    : batches.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-16 pb-16"
    >
      
      {/* 1. HERO SECTION WITH MOTION & AGRI BACKGROUND */}
      <motion.section 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50/95 via-slate-50 to-teal-50/70 text-slate-900 p-8 sm:p-12 lg:p-16 shadow-xs border border-emerald-200/90"
      >
        {/* Subtle photo background texture with safe opacity */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.06] pointer-events-none mix-blend-multiply"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80')` }}
        ></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Copy & Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
              Transparent Agricultural Supply Chains, <span className="text-emerald-700">From Farm to Shelf</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              AgriTrace connects farmers, distributors, retailers, and consumers through traceable produce records, transparent pricing, and blockchain-backed provenance.
            </p>

            {/* Quick Track Input for Consumers */}
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-emerald-600" />
                <input
                  type="text"
                  value={searchBatchQuery}
                  onChange={(e) => setSearchBatchQuery(e.target.value)}
                  placeholder="Enter Batch ID (e.g., AGRI-2026-MNG-001) or crop..."
                  className="w-full pl-10 pr-3 py-2.5 bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm outline-none font-mono"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <span>Trace Your Produce</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onOpenQRScanner}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center border border-slate-200 gap-1.5 text-xs font-semibold cursor-pointer"
                  title="Scan Packaging QR"
                >
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  <span className="hidden sm:inline">Scan QR</span>
                </button>
              </div>
            </form>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button 
                onClick={() => navigate('/trace-products')} 
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Trace Your Produce</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/signup')} 
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-300 transition shadow-2xs cursor-pointer"
              >
                Get Started
              </button>
              <button 
                onClick={onOpenQRScanner}
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs sm:text-sm border border-emerald-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan QR</span>
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Log In</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Live Provenance Preview Card */}
          {sampleBatch && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-5 bg-white rounded-3xl p-6 text-slate-900 border border-slate-200 shadow-md space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  Verified Batch Card
                </span>
                <span className="font-mono text-xs text-slate-500 font-medium">
                  {sampleBatch.batchId}
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
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Farmgate Price</span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {sampleBatch.pricing.currency}{sampleBatch.pricing.farmerPrice}/kg
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Retail Price</span>
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
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Inspect Provenance Certificate</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-100" />
              </button>
            </motion.div>
          )}

        </div>
      </motion.section>

      {/* Realistic Terminology Value Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Blockchain-backed Provenance</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Cryptographic lot custody</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Tamper-evident Records</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Immutable event history</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Transparent Price History</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Farmgate to shelf markup</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Traceable Ownership</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Verified custodian handoffs</div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 col-span-2 lg:col-span-1 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">AI-assisted Price Insights</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Predictive mandi analytics</div>
          </div>
        </motion.div>
      </section>

      {/* A. PLATFORM OVERVIEW: Farm → Distributor → Retailer → Consumer */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8">
        <div className="max-w-2xl space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Seamless Produce Flow: Farm → Distributor → Retailer → Consumer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Every participant in the value chain connects to a unified ledger, preserving product origin, quality metrics, and fair pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Stage 1: Farm */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="group p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative hover:border-emerald-300 transition"
          >
            <div className="h-36 w-full rounded-xl overflow-hidden mb-3 border border-slate-200/80 relative">
              <img 
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80" 
                alt="Organic farm harvest"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                1
              </span>
              <h3 className="font-bold text-base text-slate-900">Farm Origin</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Farmer registers harvest with GPS coordinates, variety, lab certs, and initial farmgate price.
            </p>
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
              Output: Minted Batch Token & QR
            </div>
          </motion.div>

          {/* Stage 2: Distributor */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="group p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative hover:border-blue-300 transition"
          >
            <div className="h-36 w-full rounded-xl overflow-hidden mb-3 border border-slate-200/80 relative">
              <img 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80" 
                alt="Cold chain logistics & transport"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                2
              </span>
              <h3 className="font-bold text-base text-slate-900">Cold Chain Transit</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Logistics provider accepts custody, records freight overhead, and logs reefer temperature telemetry.
            </p>
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
              Output: Verified Custody Transfer
            </div>
          </motion.div>

          {/* Stage 3: Retailer */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="group p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative hover:border-purple-300 transition"
          >
            <div className="h-36 w-full rounded-xl overflow-hidden mb-3 border border-slate-200/80 relative">
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" 
                alt="Retail grocery store produce shelf"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                3
              </span>
              <h3 className="font-bold text-base text-slate-900">Retailer Shelf</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Supermarket scans intake lot, verifies quality grade, and updates retail price transparently.
            </p>
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
              Output: Shelf Placement & Final Price
            </div>
          </motion.div>

          {/* Stage 4: Consumer */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="group p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative hover:border-teal-300 transition"
          >
            <div className="h-36 w-full rounded-xl overflow-hidden mb-3 border border-slate-200/80 relative">
              <img 
                src="https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=600&q=80" 
                alt="Consumer inspecting fresh produce with QR"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                4
              </span>
              <h3 className="font-bold text-base text-slate-900">Consumer Kitchen</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Shopper scans QR tag on packaging to review complete journey, farm origin, and fair payout history.
            </p>
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
              Output: Instant Trust & Transparency
            </div>
          </motion.div>
        </div>
      </section>

      {/* B. HOW IT WORKS: 6 Sequential Steps */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8">
        <div className="max-w-2xl space-y-1">
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

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {['all', 'Fruits', 'Grains', 'Vegetables', 'Spices'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Produce' : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch) => {
            return (
              <motion.div 
                key={batch.id} 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 relative overflow-hidden bg-slate-100">
                    <img 
                      src={batch.imageUrl} 
                      alt={batch.name} 
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-white/95 text-slate-900 shadow-xs">
                        {batch.batchId}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-semibold text-white bg-slate-900/60 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <div className="text-xs font-medium text-emerald-700">
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
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <span>View Product</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-100" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* D. BENEFITS: Farmer, Distributor, Retailer, Consumer */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Benefits for the Entire Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Purpose-built functionality delivering verifiable value to every participant in agricultural trade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Farmer */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="h-36 relative overflow-hidden bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80" 
                  alt="Farmer harvesting crops"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Farmers</h3>
                </div>
                <p className="text-xs font-semibold text-emerald-800">
                  Transparent pricing & direct buyer trust
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cryptographic lot registration protects against middleman price squeezing and certifies authentic organic origins.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={() => navigate('/signup')}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Onboard as Farmer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Distributor */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="h-36 relative overflow-hidden bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80" 
                  alt="Cold chain freight fleet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Distributors</h3>
                </div>
                <p className="text-xs font-semibold text-blue-800">
                  Cold-chain telemetry & custody tracking
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Continuous temperature sensors, GPS routes, and automated handoffs prevent spoilages and invoice disputes.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={() => navigate('/for-businesses')}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Logistics Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Retailer */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="h-36 relative overflow-hidden bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" 
                  alt="Supermarket organic produce shelves"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Retailers</h3>
                </div>
                <p className="text-xs font-semibold text-purple-800">
                  Verified origin & shelf pricing honesty
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Differentiate on store shelves with auditable provenance that builds customer trust and increases sell-through.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={() => navigate('/for-businesses')}
                className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Retailer Solutions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Consumer */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="h-36 relative overflow-hidden bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=600&q=80" 
                  alt="Consumer verifying product with QR tag"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Consumers</h3>
                </div>
                <p className="text-xs font-semibold text-teal-800">
                  Instant QR scan farmgate verification
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Scan any package to see farm coordinates, chemical test clearances, and fair compensation breakdown instantly.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button
                onClick={onOpenQRScanner}
                className="w-full py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Scan Package QR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* E. CALL TO ACTION WITH SCENIC FARM PHOTOGRAPHY & MOTION */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50/95 via-teal-50/70 to-slate-50 text-slate-900 p-8 sm:p-12 lg:p-16 border border-emerald-200/90 shadow-xs"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.08] pointer-events-none mix-blend-multiply"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80')` }}
        ></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-slate-900">
            Build a more transparent agricultural supply chain.
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Whether you are a grower seeking fair prices, a distributor optimizing cold transit, or a retailer delivering certified provenance, join the AgriTrace network today.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <span>Register as Farmer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-2xs transition cursor-pointer"
            >
              Partner as Distributor or Retailer
            </button>
          </div>
        </div>
      </motion.section>

    </motion.div>
  );
};
