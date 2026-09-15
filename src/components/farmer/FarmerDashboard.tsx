import React, { useState } from 'react';
import { 
  Package, 
  Sprout, 
  CheckCircle2, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight, 
  QrCode, 
  Award, 
  History, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Info,
  CloudSun,
  Droplets,
  Wind,
  Handshake,
  DollarSign,
  Truck,
  Eye,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QRCodeModal } from '../common/QRCodeModal';
import { ProduceBatch } from '../../types/produce';

export interface WeatherAdvisory {
  district: string;
  temperature: string;
  condition: string;
  humidity: string;
  windSpeed: string;
  harvestSuitability: 'Optimal' | 'Caution' | 'Delayed';
  advisoryText: string;
  mandiGlutAlert: string;
}

export const FarmerDashboard: React.FC = () => {
  const { 
    currentUser, 
    navigate, 
    batches, 
    setSelectedBatchId, 
    navigateToVerification,
    notifications 
  } = useApp();
  
  const [selectedQRBatch, setSelectedQRBatch] = useState<ProduceBatch | null>(null);
  const [statusUpdateNotice, setStatusUpdateNotice] = useState<string | null>(null);

  // Authenticated farmer details
  const farmerName = currentUser?.name || 'Ramesh Patil';
  const farmerOrg = currentUser?.organization || 'Sahyadri Organic Producers Co-op';
  const farmerLocation = currentUser?.location || 'Ratnagiri, Maharashtra, India';
  const trustScore = currentUser?.trustScore || 98;

  // Filter batches belonging to the farmer or platform defaults
  const farmerBatches = batches.filter(b => 
    b.farmerId === currentUser?.id || 
    b.farmerName === currentUser?.name || 
    b.farmerId === 'usr-farmer-01'
  );

  const displayBatches = farmerBatches.length > 0 ? farmerBatches : batches;

  // Dynamic Statistics
  const totalBatches = displayBatches.length;
  const activeBatches = displayBatches.filter(b => 
    b.status !== 'Sold to Consumer' && b.status !== 'Completed'
  ).length;
  const completedSales = displayBatches.filter(b => 
    b.status === 'Sold to Consumer' || b.status === 'Delivered to Retailer' || b.status === 'Completed'
  ).length;

  const totalRevenue = displayBatches.reduce((sum, b) => {
    const qty = b.quantity || b.quantityKg || 500;
    const price = b.farmgatePrice || b.pricing?.farmerPrice || 80;
    return sum + (qty * price);
  }, 0);

  const formattedRevenue = `₹${totalRevenue.toLocaleString('en-IN')}`;

  // Recent 5 Batches
  const recentBatches = displayBatches.slice(0, 5);

  // Derive real recent transactions from timeline events
  const derivedTransactions = displayBatches.flatMap(b => {
    if (!b.timeline || b.timeline.length === 0) {
      return [{
        txId: `TX-${b.batchId.slice(-4)}-01`,
        batchId: b.batchId,
        action: 'Produce Registered on Chain',
        from: b.farmerName || farmerName,
        to: 'Smart Contract Escrow',
        date: b.harvestDate || '2026-05-10',
        status: 'Confirmed',
        hash: b.blockchain?.mintTxHash || '0x9fa1c7849e89d10e0129bc88a71928019ab91284',
      }];
    }
    return b.timeline.map((evt, idx) => ({
      txId: `TX-${b.batchId.slice(-4)}-0${idx + 1}`,
      batchId: b.batchId,
      action: evt.title,
      from: evt.actorName,
      to: evt.actorRole === 'farmer' ? 'Cold-Chain Consortium' : 'Retailer Shelf',
      date: evt.timestamp.split('T')[0] || evt.timestamp,
      status: evt.verified ? 'Confirmed' : 'Pending',
      hash: evt.txHash,
    }));
  }).slice(0, 5);

  // Agro-meteorological and mandi advisory
  const weatherAdvisory: WeatherAdvisory = {
    district: farmerLocation.includes('Ratnagiri') ? 'Ratnagiri / Konkan Belt' : 'Western Maharashtra',
    temperature: '31°C',
    condition: 'Partly Sunny & Dry',
    humidity: '68% RH',
    windSpeed: '12 km/h SW',
    harvestSuitability: 'Optimal',
    advisoryText: 'Ideal window for morning plucking. Low humidity minimizes fungal rot risk for export-grade fruits.',
    mandiGlutAlert: 'Vashi APMC receiving heavy unorganized consignments from Gujarat. AgriTrace direct forward contracts recommended for 15-20% higher realization.',
  };

  const handleInspectBatch = (batchId: string) => {
    const existing = batches.find(b => b.batchId === batchId || b.id === batchId);
    if (existing) {
      setSelectedBatchId(existing.id);
    }
    navigate('/farmer/my-produce');
  };

  const handleShowQR = (batch: ProduceBatch) => {
    setSelectedQRBatch(batch);
  };

  const handleQuickDispatch = (batchId: string) => {
    const b = batches.find(item => item.batchId === batchId || item.id === batchId);
    if (b) {
      b.status = 'Ready for Dispatch';
      setStatusUpdateNotice(`Batch ${b.batchId} updated to "Ready for Dispatch". Cold-chain distributors notified.`);
      setTimeout(() => setStatusUpdateNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast Notice */}
      {statusUpdateNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-semibold animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{statusUpdateNotice}</span>
          </div>
          <button 
            onClick={() => setStatusUpdateNotice(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* =========================================================================
          1. DASHBOARD HEADER
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Farmer Command Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Register harvest lots, track smart contract escrow payouts, generate verifiable QR tags, and access AI fair price forecasting.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">
                Welcome back, {farmerName}
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-slate-500">
                {farmerOrg} ({farmerLocation})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="header-btn-register"
              onClick={() => navigate('/farmer/register-produce')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Produce</span>
            </button>
            <button
              id="header-btn-bids"
              onClick={() => navigate('/farmer/bids')}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Handshake className="w-4 h-4 text-emerald-700" />
              <span>Buyer Bids & Contracts</span>
            </button>
            <button
              id="header-btn-prediction"
              onClick={() => navigate('/farmer/price-prediction')}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Price Prediction</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. QUICK ACTIONS
          ========================================================================= */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 px-1">
          Quick Actions & Operations
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <button
            id="qa-register-produce"
            onClick={() => navigate('/farmer/register-produce')}
            className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xs transition text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white">
                <PlusCircle className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-xs text-white">Register Produce</div>
              <div className="text-[10px] text-emerald-100 mt-0.5">Mint batch on-chain</div>
            </div>
          </button>

          <button
            id="qa-view-produce"
            onClick={() => navigate('/farmer/my-produce')}
            className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl shadow-xs transition text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-700">
                <Package className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">My Inventory</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{totalBatches} registered lots</div>
            </div>
          </button>

          <button
            id="qa-bids"
            onClick={() => navigate('/farmer/bids')}
            className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl shadow-xs transition text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                <Handshake className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Buyer Bids</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Forward contracts</div>
            </div>
          </button>

          <button
            id="qa-price-prediction"
            onClick={() => navigate('/farmer/price-prediction')}
            className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl shadow-xs transition text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Price Prediction</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Fair price advisory</div>
            </div>
          </button>

          <button
            id="qa-view-transactions"
            onClick={() => navigate('/farmer/transactions')}
            className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl shadow-xs transition text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <History className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Escrow Payouts</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Zero middleman cut</div>
            </div>
          </button>

          <button
            id="qa-qr-codes"
            onClick={() => navigate('/farmer/qr-codes')}
            className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl shadow-xs transition text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <QrCode className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Print QR Tags</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Crate & pouch tags</div>
            </div>
          </button>

        </div>
      </div>

      {/* =========================================================================
          3. PRODUCE & REVENUE STATISTICS CARDS (Dynamic from Context)
          ========================================================================= */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 px-1">
          Live Farm Economics & Inventory Telemetry
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Produce Batches */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Registered Harvest Lots</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {totalBatches}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span>All registered harvest lots</span>
              <span className="text-emerald-700 font-semibold font-mono">100% On-Chain</span>
            </div>
          </div>

          {/* Active Batches */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Active in Supply Chain</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Sprout className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {activeBatches}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span>In storage & cold transit</span>
              <span className="text-blue-700 font-semibold font-mono">Live Custody</span>
            </div>
          </div>

          {/* Completed Sales */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Completed & Settled Sales</span>
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {completedSales}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span>Delivered to consumer retail</span>
              <span className="text-teal-700 font-semibold font-mono">Zero Disputes</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Total Farmgate Value</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700">
                {formattedRevenue}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span>Direct farmgate proceeds</span>
              <span className="text-emerald-700 font-semibold font-mono">62% Retail Share</span>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          AGRO-METEOROLOGY & MANDI GLUT ADVISORY
          ========================================================================= */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50 text-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-emerald-200/90">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500">
              {weatherAdvisory.district}
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Harvest Window:</span>
              <span className="text-emerald-700 font-extrabold">{weatherAdvisory.harvestSuitability} Conditions</span>
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {weatherAdvisory.advisoryText}
            </p>

            <div className="pt-1 text-xs text-amber-900 flex items-start gap-1.5 bg-amber-50 border border-amber-200 p-2.5 rounded-xl max-w-2xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <span><strong>Mandi Glut Intelligence:</strong> {weatherAdvisory.mandiGlutAlert}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs shrink-0">
            <div className="text-center">
              <div className="text-2xl font-black text-slate-900">{weatherAdvisory.temperature}</div>
              <div className="text-[10px] font-medium text-slate-500">{weatherAdvisory.condition}</div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-center">
              <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                <span>{weatherAdvisory.humidity}</span>
              </div>
              <div className="text-[10px] text-slate-500">Moisture</div>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="text-center">
              <div className="text-sm font-bold text-blue-700 flex items-center gap-1">
                <Wind className="w-3 h-3" />
                <span>{weatherAdvisory.windSpeed}</span>
              </div>
              <div className="text-[10px] text-slate-500">Wind</div>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          MAIN SECTION: 2-COLUMN LAYOUT
          Left: Recent Produce Batches & Supply-Chain Activity
          Right: Price Insights, Forward Contracts, & Trust
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* =========================================================================
              4. RECENT PRODUCE BATCHES (Dynamic from AppContext)
              ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Registered Harvest Batches
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time blockchain records for your harvested produce lots
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/farmer/register-produce')}
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Lot</span>
                </button>
                <button
                  onClick={() => navigate('/farmer/my-produce')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All ({totalBatches})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3">Batch ID</th>
                    <th className="py-3 px-3">Crop / Variety</th>
                    <th className="py-3 px-3">Quantity</th>
                    <th className="py-3 px-3">Harvest Date</th>
                    <th className="py-3 px-3">Quality</th>
                    <th className="py-3 px-3">Farmgate Price</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBatches.map((batch) => {
                    const cropName = batch.cropName || batch.name || 'Produce';
                    const variety = batch.cropVariety || batch.variety || 'Standard';
                    const qty = `${batch.quantity || batch.quantityKg || 500} ${batch.unit || 'kg'}`;
                    const price = batch.farmgatePrice || batch.pricing?.farmerPrice || 80;
                    const priceFormatted = `₹${price}/${batch.unit || 'kg'}`;
                    const grade = batch.qualityGrade || batch.quality?.grade || 'Grade A';

                    return (
                      <tr key={batch.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-3 font-mono font-bold text-emerald-700">
                          {batch.batchId}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-800">{cropName}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{variety}</div>
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-700">
                          {qty}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          {batch.harvestDate}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="text-xs font-semibold text-slate-700">
                            {grade}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900">
                          {priceFormatted}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`text-xs font-semibold ${
                            batch.status === 'Ready for Dispatch' 
                              ? 'text-amber-700'
                              : batch.status === 'In Transit'
                              ? 'text-blue-700'
                              : batch.status === 'On Retail Shelf' || batch.status === 'Delivered to Retailer'
                              ? 'text-purple-700'
                              : batch.status === 'Sold to Consumer'
                              ? 'text-teal-700'
                              : 'text-emerald-700'
                          }`}>
                            {batch.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleShowQR(batch)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                              title="Generate/View QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigateToVerification(batch.batchId)}
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Verify on Blockchain"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleInspectBatch(batch.batchId)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                            >
                              Inspect
                            </button>
                            {batch.status === 'Registered' && (
                              <button
                                onClick={() => handleQuickDispatch(batch.batchId)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                title="Notify cold-chain logistics for pickup"
                              >
                                Ready
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* =========================================================================
              5. SUPPLY-CHAIN SETTLEMENTS & ESCROW ACTIVITY
              ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Recent Supply-Chain Activity & Escrow Events
                </h2>
                <p className="text-xs text-slate-500">
                  Immutable custody handovers, lab verifications, and escrow settlements
                </p>
              </div>
              <button
                onClick={() => navigate('/farmer/transactions')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>Full Settlement Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3">Transaction ID</th>
                    <th className="py-3 px-3">Batch ID</th>
                    <th className="py-3 px-3">Event Action</th>
                    <th className="py-3 px-3">From</th>
                    <th className="py-3 px-3">To</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {derivedTransactions.map((tx) => (
                    <tr key={tx.txId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                        {tx.txId}
                      </td>
                      <td className="py-3 px-3 text-emerald-700 font-medium">
                        {tx.batchId}
                      </td>
                      <td className="py-3 px-3 font-sans font-medium text-slate-800">
                        {tx.action}
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-600">
                        {tx.from}
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-600">
                        {tx.to}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {tx.date}
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{tx.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          
          {/* =========================================================================
              6. BUYER PROCUREMENT BIDS BANNER
              ========================================================================= */}
          <div className="bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-slate-50 text-slate-900 rounded-3xl p-6 shadow-xs space-y-4 border border-teal-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Handshake className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Direct Buyer Offers</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">
                3 New Bids
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>KisanLogix Cold Fleet</span>
                  <span className="text-emerald-700 font-mono">₹135/kg</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Alphonso Mango (800 kg) • +12.5% over mandi
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>FreshRoot Organic</span>
                  <span className="text-emerald-700 font-mono">₹32/kg</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Vine Tomatoes (450 kg) • 50% advance escrow
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/farmer/bids')}
              className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Review Bids & Lock Escrow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* =========================================================================
              7. MULTI-MODEL PRICE PREDICTION SPOTLIGHT
              ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Autonomous Fair Price Engine</h3>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500">
                4 ML Models
              </span>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Selected Model</span>
                <span className="text-xs font-bold text-emerald-800 font-mono">RF-Agri-v4.2 (Ensemble)</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-emerald-100/60">
                <span className="text-xs text-slate-600 font-medium">Current Mandi Rate</span>
                <span className="text-xs font-bold text-slate-800">₹120 / kg</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-emerald-100/60">
                <span className="text-xs text-slate-600 font-medium">Predicted Fair Benchmark</span>
                <span className="text-xs font-extrabold text-emerald-800">₹138.50 / kg</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-emerald-100/60">
                <span className="text-xs text-slate-600 font-medium">Potential Surplus</span>
                <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-emerald-700 font-mono">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+15.4% Gain</span>
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>Harvest Stagger Advisory</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Peak fair pricing forecasted around Day 14. Recommend staggering dispatches with pre-cooling to lock higher export premiums.
              </p>
            </div>

            <button
              onClick={() => navigate('/farmer/price-prediction')}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Explore Price Forecast Advisory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* =========================================================================
              8. TRUST & REPUTATION CARD
              ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Reputation & Trust Score</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Diamond Tier
              </span>
            </div>

            {/* Score Big Display */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center space-y-1">
              <div className="text-xs text-slate-500 font-medium">Consensus Trust Score</div>
              <div className="text-3xl font-black text-slate-900 flex items-center justify-center gap-1">
                <span>{trustScore}</span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${trustScore}%` }}
                />
              </div>
            </div>

            {/* Reputation Sub-Metrics */}
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Chemical Residue Test</span>
                <span className="font-bold text-emerald-700 font-mono">100% Zero-Residue</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Logistics Dispatch SLA</span>
                <span className="font-bold text-slate-900 font-mono">98.2% On-Time</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Consumer QR Rating</span>
                <span className="font-bold text-amber-600 font-mono">★ 4.9 / 5.0</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/farmer/trust')}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Certified Lab Reports & Oracles</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

        </div>

      </div>

      {/* QR Modal for batch label generation */}
      {selectedQRBatch && (
        <QRCodeModal 
          batch={selectedQRBatch} 
          onClose={() => setSelectedQRBatch(null)} 
        />
      )}

    </div>
  );
};
