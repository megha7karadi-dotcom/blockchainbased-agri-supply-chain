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
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QRCodeModal } from '../common/QRCodeModal';
import { ProduceBatch } from '../../types/produce';

// =========================================================================
// MONGODB / BACKEND DATA STRUCTURES
// Structured cleanly so these values will directly bind to backend queries
// =========================================================================

export interface FarmerDashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedSales: number;
  totalRevenue: number;
  currencySymbol: string;
}

export interface RecentProduceBatchItem {
  id: string;
  batchId: string;
  crop: string;
  variety: string;
  quantity: string;
  harvestDate: string;
  quality: string;
  farmgatePrice: string;
  status: 'Active' | 'In Transit' | 'Completed' | 'Ready for Dispatch';
}

export interface SupplyChainTransactionItem {
  txId: string;
  batchId: string;
  action: string;
  from: string;
  to: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'In Escrow';
}

export interface PriceInsightItem {
  crop: string;
  currentPrice: string;
  predictedFairPrice: string;
  difference: string;
  isPositive: boolean;
  recommendation: string;
}

export interface FarmerReputationData {
  trustScore: number;
  successfulTransactions: number;
  disputes: number;
  verifiedBatches: number;
}

// Default mock values as required by specification
// (Will be populated from MongoDB collection in later step)
const DEFAULT_STATS: FarmerDashboardStats = {
  totalBatches: 24,
  activeBatches: 8,
  completedSales: 16,
  totalRevenue: 184500,
  currencySymbol: '₹',
};

const MOCK_RECENT_BATCHES: RecentProduceBatchItem[] = [
  {
    id: 'batch-001',
    batchId: 'AGRI-2026-MNG-001',
    crop: 'Alphonso Mango',
    variety: 'Ratnagiri Hapus GI-139',
    quantity: '500 kg',
    harvestDate: '2026-05-10',
    quality: 'Grade A',
    farmgatePrice: '₹120/kg',
    status: 'Active',
  },
  {
    id: 'batch-002',
    batchId: 'AGRI-2026-RIC-002',
    crop: 'Basmati Rice',
    variety: 'Dehradun Organic 1121',
    quantity: '1,200 kg',
    harvestDate: '2026-05-04',
    quality: 'Grade A+',
    farmgatePrice: '₹65/kg',
    status: 'In Transit',
  },
  {
    id: 'batch-003',
    batchId: 'AGRI-2026-TOM-003',
    crop: 'Vine Tomatoes',
    variety: 'Roma San Marzano',
    quantity: '450 kg',
    harvestDate: '2026-05-08',
    quality: 'Grade A',
    farmgatePrice: '₹28/kg',
    status: 'Active',
  },
  {
    id: 'batch-004',
    batchId: 'AGRI-2026-TRM-004',
    crop: 'Turmeric',
    variety: 'High Curcumin (5.8%)',
    quantity: '300 kg',
    harvestDate: '2026-04-26',
    quality: 'Grade A (Export)',
    farmgatePrice: '₹140/kg',
    status: 'Completed',
  },
  {
    id: 'batch-005',
    batchId: 'AGRI-2026-APL-005',
    crop: 'Royal Delicious Apple',
    variety: 'Kinnaur Mountain Organic',
    quantity: '800 kg',
    harvestDate: '2026-05-02',
    quality: 'Grade A',
    farmgatePrice: '₹95/kg',
    status: 'Active',
  },
];

const MOCK_PRICE_INSIGHT: PriceInsightItem = {
  crop: 'Alphonso Mango',
  currentPrice: '₹120/kg',
  predictedFairPrice: '₹128/kg',
  difference: '+₹8/kg',
  isPositive: true,
  recommendation: 'Consider negotiating closer to the predicted fair price.',
};

const MOCK_SUPPLY_CHAIN_TRANSACTIONS: SupplyChainTransactionItem[] = [
  {
    txId: 'TX-001',
    batchId: 'AGRI-2026-MNG-001',
    action: 'Produce Registered',
    from: 'Farmer',
    to: 'Blockchain',
    date: '10 May 2026',
    status: 'Confirmed',
  },
  {
    txId: 'TX-002',
    batchId: 'AGRI-2026-MNG-001',
    action: 'Ownership Transfer',
    from: 'Farmer',
    to: 'Distributor',
    date: '11 May 2026',
    status: 'Confirmed',
  },
  {
    txId: 'TX-003',
    batchId: 'AGRI-2026-RIC-002',
    action: 'Quality Inspection',
    from: 'Quality Lab',
    to: 'Smart Contract',
    date: '05 May 2026',
    status: 'Confirmed',
  },
  {
    txId: 'TX-004',
    batchId: 'AGRI-2026-TOM-003',
    action: 'Cold-Chain Handover',
    from: 'Farmer',
    to: 'Distributor',
    date: '09 May 2026',
    status: 'Confirmed',
  },
  {
    txId: 'TX-005',
    batchId: 'AGRI-2026-TRM-004',
    action: 'Escrow Payment Released',
    from: 'Retailer',
    to: 'Farmer',
    date: '01 May 2026',
    status: 'Confirmed',
  },
];

const MOCK_REPUTATION: FarmerReputationData = {
  trustScore: 92,
  successfulTransactions: 24,
  disputes: 1,
  verifiedBatches: 22,
};

export const FarmerDashboard: React.FC = () => {
  const { currentUser, navigate, batches, setSelectedBatchId } = useApp();
  const [selectedQRBatch, setSelectedQRBatch] = useState<ProduceBatch | null>(null);

  // Use authenticated farmer user details
  const farmerName = currentUser?.name || 'Ramesh';
  const farmerOrg = currentUser?.organization || 'Sahyadri Organic Producers Co-op';
  const farmerLocation = currentUser?.location || 'Maharashtra, India';

  // Stats structure (ready for MongoDB query hydration)
  const stats: FarmerDashboardStats = DEFAULT_STATS;

  // Format currency with Indian grouping
  const formattedRevenue = `${stats.currencySymbol}${stats.totalRevenue.toLocaleString('en-IN')}`;

  const handleInspectBatch = (batchId: string) => {
    const existing = batches.find(b => b.batchId === batchId);
    if (existing) {
      setSelectedBatchId(existing.id);
    }
    navigate('/farmer/my-produce');
  };

  const handleShowQR = (batchItem: RecentProduceBatchItem) => {
    // Find matching ProduceBatch in AppContext or fallback to first available batch
    const match = batches.find(b => b.batchId === batchItem.batchId) || batches[0];
    if (match) {
      setSelectedQRBatch(match);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* =========================================================================
          1. DASHBOARD HEADER
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono uppercase tracking-wider">Farmer Workspace</span>
              <span className="text-slate-300">•</span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                Verified Producer Node
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Farmer Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Manage your produce, track supply-chain activity, and monitor transparent pricing.
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
              id="header-btn-prediction"
              onClick={() => navigate('/farmer/price-prediction')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Check Price Prediction</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. QUICK ACTIONS
          ========================================================================= */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Quick Actions
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <button
            id="qa-register-produce"
            onClick={() => navigate('/farmer/register-produce')}
            className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xs transition text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white">
                <PlusCircle className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Register New Produce</div>
              <div className="text-[11px] text-emerald-100 mt-0.5">Log new harvest onto ledger</div>
            </div>
          </button>

          <button
            id="qa-view-produce"
            onClick={() => navigate('/farmer/my-produce')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl shadow-xs transition text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-700">
                <Package className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">View My Produce</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Active & archived batches</div>
            </div>
          </button>

          <button
            id="qa-price-prediction"
            onClick={() => navigate('/farmer/price-prediction')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl shadow-xs transition text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Check Price Prediction</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Mandi rate & fair benchmarks</div>
            </div>
          </button>

          <button
            id="qa-view-transactions"
            onClick={() => navigate('/farmer/transactions')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl shadow-xs transition text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <History className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">View Transactions</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Escrow & payment logs</div>
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. PRODUCE STATISTICS CARDS
          Structured for direct MongoDB data retrieval
          ========================================================================= */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
          Produce Statistics
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Produce Batches */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Total Produce Batches</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {stats.totalBatches}
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
                <span className="text-xs font-semibold text-slate-600">Active Batches</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Sprout className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {stats.activeBatches}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span>In storage & transit</span>
              <span className="text-blue-700 font-semibold font-mono">Current Season</span>
            </div>
          </div>

          {/* Completed Sales */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Completed Sales</span>
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {stats.completedSales}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span>Delivered to retailers/consumers</span>
              <span className="text-teal-700 font-semibold font-mono">Zero Disputes</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold text-slate-600">Total Revenue</span>
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
              <span className="text-emerald-700 font-semibold font-mono">Escrow Cleared</span>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          MAIN SECTION: 2-COLUMN LAYOUT
          Left: Recent Produce Batches & Recent Supply-Chain Activity
          Right: Price Insights & Trust / Reputation
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* =========================================================================
              4. RECENT PRODUCE BATCHES
              ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Recent Produce Batches
                </h2>
                <p className="text-xs text-slate-500">
                  Latest harvested lots registered in your farm inventory
                </p>
              </div>
              <button
                onClick={() => navigate('/farmer/my-produce')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>View All Batches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3">Batch ID</th>
                    <th className="py-3 px-3">Crop</th>
                    <th className="py-3 px-3">Quantity</th>
                    <th className="py-3 px-3">Harvest Date</th>
                    <th className="py-3 px-3">Quality</th>
                    <th className="py-3 px-3">Farmgate Price</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_RECENT_BATCHES.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-700">
                        {batch.batchId}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{batch.crop}</div>
                        <div className="text-[10px] text-slate-400">{batch.variety}</div>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-700">
                        {batch.quantity}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {batch.harvestDate}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {batch.quality}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {batch.farmgatePrice}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          batch.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : batch.status === 'In Transit'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
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
                            onClick={() => handleInspectBatch(batch.batchId)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-medium transition cursor-pointer"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* =========================================================================
              5. RECENT TRANSACTIONS (Supply-Chain Activity)
              ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Recent Supply-Chain Activity
                </h2>
                <p className="text-xs text-slate-500">
                  Immutable custody handovers, lab verifications, and escrow settlements
                </p>
              </div>
              <button
                onClick={() => navigate('/farmer/transactions')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>View Full Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3">Transaction ID</th>
                    <th className="py-3 px-3">Batch ID</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">From</th>
                    <th className="py-3 px-3">To</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_SUPPLY_CHAIN_TRANSACTIONS.map((tx) => (
                    <tr key={tx.txId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {tx.txId}
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-700 font-medium">
                        {tx.batchId}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {tx.action}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {tx.from}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {tx.to}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {tx.date}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
              6. PRICE INSIGHTS CARD
              UI/Mock data - Will connect to agricultural dataset and ML model later
              ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">AI Price Insight</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Market Advisory
              </span>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Crop</span>
                <span className="text-xs font-bold text-slate-900">{MOCK_PRICE_INSIGHT.crop}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-emerald-100/60">
                <span className="text-xs text-slate-600 font-medium">Current Farmgate Price</span>
                <span className="text-xs font-bold text-slate-800">{MOCK_PRICE_INSIGHT.currentPrice}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-emerald-100/60">
                <span className="text-xs text-slate-600 font-medium">Predicted Fair Price</span>
                <span className="text-xs font-extrabold text-emerald-800">{MOCK_PRICE_INSIGHT.predictedFairPrice}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-emerald-100/60">
                <span className="text-xs text-slate-600 font-medium">Difference</span>
                <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-mono">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{MOCK_PRICE_INSIGHT.difference}</span>
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>Recommendation</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "{MOCK_PRICE_INSIGHT.recommendation}"
              </p>
            </div>

            <button
              onClick={() => navigate('/farmer/price-prediction')}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Explore Price Models</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* =========================================================================
              7. TRUST & REPUTATION CARD
              UI only for now - algorithm to be connected
              ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Trust & Reputation</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                High Integrity
              </span>
            </div>

            {/* Score Big Display */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center space-y-1">
              <div className="text-xs text-slate-500 font-medium">Overall Trust Score</div>
              <div className="text-3xl font-black text-slate-900 flex items-center justify-center gap-1">
                <span>{MOCK_REPUTATION.trustScore}</span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${MOCK_REPUTATION.trustScore}%` }}
                />
              </div>
            </div>

            {/* Reputation Sub-Metrics */}
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Successful Transactions</span>
                <span className="font-bold text-slate-900 font-mono">
                  {MOCK_REPUTATION.successfulTransactions}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Disputes</span>
                <span className="font-bold text-slate-900 font-mono">
                  {MOCK_REPUTATION.disputes}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Verified Batches</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {MOCK_REPUTATION.verifiedBatches}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/farmer/trust')}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Reputation Details</span>
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
