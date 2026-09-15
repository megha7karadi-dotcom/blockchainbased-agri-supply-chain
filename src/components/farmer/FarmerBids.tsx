import React, { useState } from 'react';
import { 
  Handshake, 
  DollarSign, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  ShieldCheck, 
  Truck, 
  Building2, 
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface ProcurementBid {
  id: string;
  buyerName: string;
  buyerType: 'Distributor' | 'Retailer' | 'Exporters Consortium';
  buyerLocation: string;
  crop: string;
  variety: string;
  batchId?: string;
  quantityKg: number;
  offeredPricePerKg: number;
  mandiBenchmarkPrice: number;
  advanceEscrowPercent: number; // e.g. 30%
  pickupDate: string;
  transportProvided: boolean;
  status: 'Pending' | 'Accepted' | 'Countered' | 'Declined';
  contractType: 'Forward Purchase' | 'Spot Procurement';
  notes: string;
}

const INITIAL_BIDS: ProcurementBid[] = [
  {
    id: 'bid-001',
    buyerName: 'KisanLogix Agri Cold-Chain Solutions',
    buyerType: 'Distributor',
    buyerLocation: 'Pune Logistics Hub, Maharashtra',
    crop: 'Alphonso Mango',
    variety: 'Ratnagiri Hapus GI-139',
    batchId: 'AGRI-2026-MNG-001',
    quantityKg: 800,
    offeredPricePerKg: 135,
    mandiBenchmarkPrice: 120,
    advanceEscrowPercent: 40,
    pickupDate: '2026-05-18',
    transportProvided: true,
    status: 'Pending',
    contractType: 'Forward Purchase',
    notes: 'Requires refrigerated reefers maintained between 12-14°C. Advance deposit locked in consortium smart contract.',
  },
  {
    id: 'bid-002',
    buyerName: 'FreshRoot Organic Markets Ltd',
    buyerType: 'Retailer',
    buyerLocation: 'Bandra West, Mumbai',
    crop: 'Vine Tomatoes',
    variety: 'Roma San Marzano',
    batchId: 'AGRI-2026-TOM-003',
    quantityKg: 450,
    offeredPricePerKg: 32,
    mandiBenchmarkPrice: 28,
    advanceEscrowPercent: 50,
    pickupDate: '2026-05-14',
    transportProvided: false,
    status: 'Pending',
    contractType: 'Spot Procurement',
    notes: 'Direct farm-to-shelf delivery to Mumbai store. Grade A zero-residue certified only.',
  },
  {
    id: 'bid-003',
    buyerName: 'MahaAgro Export Consortium',
    buyerType: 'Exporters Consortium',
    buyerLocation: 'JNPT Port Free Trade Zone, Navi Mumbai',
    crop: 'Basmati Rice',
    variety: 'Dehradun Organic 1121',
    batchId: 'AGRI-2026-RIC-002',
    quantityKg: 1200,
    offeredPricePerKg: 72,
    mandiBenchmarkPrice: 65,
    advanceEscrowPercent: 30,
    pickupDate: '2026-05-25',
    transportProvided: true,
    status: 'Accepted',
    contractType: 'Forward Purchase',
    notes: 'Contract executed on Ethereum Sepolia. Advance escrow of ₹25,920 released to farmer wallet.',
  },
  {
    id: 'bid-004',
    buyerName: 'Reliance Retail Agri Sourcing',
    buyerType: 'Retailer',
    buyerLocation: 'Thane Central Fulfillment Center',
    crop: 'Royal Delicious Apple',
    variety: 'Kinnaur Mountain Organic',
    batchId: 'AGRI-2026-APL-005',
    quantityKg: 600,
    offeredPricePerKg: 102,
    mandiBenchmarkPrice: 95,
    advanceEscrowPercent: 35,
    pickupDate: '2026-05-20',
    transportProvided: true,
    status: 'Pending',
    contractType: 'Forward Purchase',
    notes: 'Quality inspection on loading. Smart contract auto-settlement on GPS delivery confirmation.',
  },
];

export const FarmerBids: React.FC = () => {
  const { batches, currentUser, navigate } = useApp();
  const [bids, setBids] = useState<ProcurementBid[]>(INITIAL_BIDS);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted'>('all');
  const [selectedBid, setSelectedBid] = useState<ProcurementBid | null>(null);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [counterPrice, setCounterPrice] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleAcceptBid = (bidId: string) => {
    const bid = bids.find(b => b.id === bidId);
    if (!bid) return;

    setBids(prev => prev.map(b => b.id === bidId ? { ...b, status: 'Accepted' } : b));
    
    const advanceAmount = Math.round((bid.quantityKg * bid.offeredPricePerKg * bid.advanceEscrowPercent) / 100);
    setActionNotice(`Smart Contract Executed: Bid from ${bid.buyerName} accepted! Advance escrow of ₹${advanceAmount.toLocaleString('en-IN')} is locked in escrow for your batch.`);
    
    setTimeout(() => {
      setActionNotice(null);
    }, 6000);
  };

  const handleDeclineBid = (bidId: string) => {
    const bid = bids.find(b => b.id === bidId);
    if (!bid) return;

    setBids(prev => prev.map(b => b.id === bidId ? { ...b, status: 'Declined' } : b));
    setActionNotice(`Bid from ${bid.buyerName} declined.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleOpenCounter = (bid: ProcurementBid) => {
    setSelectedBid(bid);
    setCounterPrice((bid.offeredPricePerKg + 5).toString());
    setIsCounterModalOpen(true);
  };

  const handleSubmitCounter = () => {
    if (!selectedBid || !counterPrice) return;
    const priceNum = parseFloat(counterPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    setBids(prev => prev.map(b => b.id === selectedBid.id ? { 
      ...b, 
      status: 'Countered',
      offeredPricePerKg: priceNum,
      notes: `${b.notes} [Farmer countered with ₹${priceNum}/kg on ${new Date().toLocaleDateString()}]`
    } : b));

    setIsCounterModalOpen(false);
    setActionNotice(`Counter-offer of ₹${priceNum}/kg transmitted to ${selectedBid.buyerName}.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const filteredBids = bids.filter(b => {
    if (activeTab === 'pending') return b.status === 'Pending';
    if (activeTab === 'accepted') return b.status === 'Accepted';
    return true;
  });

  const totalContractValue = bids
    .filter(b => b.status === 'Accepted')
    .reduce((acc, b) => acc + (b.quantityKg * b.offeredPricePerKg), 0);

  const pendingBidsCount = bids.filter(b => b.status === 'Pending').length;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-semibold animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button 
            onClick={() => setActionNotice(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Handshake className="w-7 h-7 text-emerald-600" />
              <span>Procurement Bids & Forward Contracts</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Receive verified procurement offers directly from cold-chain distributors, organic retailers, and export consortiums with smart contract escrow protection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/farmer/price-prediction')}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Compare Mandi Rates</span>
            </button>
            <button
              onClick={() => navigate('/farmer/register-produce')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Register Produce for Bids</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Active Procurement Offers</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{pendingBidsCount} Bids Pending</div>
          <span className="text-[11px] text-emerald-700 font-medium">Above APMC Mandi Minimums</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Locked Forward Contract Escrow</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalContractValue.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-500">Guaranteed smart contract settlement</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Average Premium Realization</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">+12.4%</div>
          <span className="text-[11px] text-slate-500">Higher than traditional local middleman rates</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'accepted'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                activeTab === tab 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'all' ? `All Bids (${bids.length})` : tab === 'pending' ? `Pending (${pendingBidsCount})` : `Accepted Contracts`}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Consortium Multi-Sig Escrow Active
        </span>
      </div>

      {/* Bids List */}
      <div className="space-y-4">
        {filteredBids.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Handshake className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">No bids found in this category</h3>
            <p className="text-xs text-slate-500">When verified buyers make procurement offers, they will appear here.</p>
          </div>
        ) : (
          filteredBids.map(bid => {
            const totalValue = bid.quantityKg * bid.offeredPricePerKg;
            const advanceValue = Math.round((totalValue * bid.advanceEscrowPercent) / 100);
            const premiumPercent = Math.round(((bid.offeredPricePerKg - bid.mandiBenchmarkPrice) / bid.mandiBenchmarkPrice) * 100);

            return (
              <div 
                key={bid.id}
                className={`bg-white rounded-3xl p-6 border transition shadow-xs space-y-4 ${
                  bid.status === 'Accepted' ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Bid Card Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{bid.buyerName}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {bid.buyerType}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className={`text-xs font-semibold ${
                          bid.status === 'Accepted' ? 'text-emerald-700' :
                          bid.status === 'Countered' ? 'text-amber-700' :
                          bid.status === 'Declined' ? 'text-rose-700' :
                          'text-blue-700'
                        }`}>
                          {bid.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {bid.buyerLocation} • Contract Type: <span className="font-semibold text-slate-700">{bid.contractType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Highlighting */}
                  <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-700">
                        ₹{bid.offeredPricePerKg}<span className="text-xs text-slate-500 font-normal">/kg</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 md:justify-end">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+{premiumPercent}% vs Mandi (₹{bid.mandiBenchmarkPrice})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Produce & Variety</span>
                    <span className="font-bold text-slate-800">{bid.crop}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{bid.variety}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Requested Volume</span>
                    <span className="font-bold text-slate-800">{bid.quantityKg.toLocaleString()} kg</span>
                    <span className="text-[10px] text-emerald-700 block font-medium">
                      Total: ₹{totalValue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Advance Escrow Deposit</span>
                    <span className="font-bold text-emerald-700">{bid.advanceEscrowPercent}% on Signing</span>
                    <span className="text-[10px] text-slate-500 block">
                      ₹{advanceValue.toLocaleString('en-IN')} upfront
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Pickup & Transport</span>
                    <div className="flex items-center gap-1 text-slate-800 font-semibold">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>{bid.transportProvided ? 'Buyer Transports' : 'Farmer Delivery'}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Date: {bid.pickupDate}</span>
                  </div>
                </div>

                {/* Buyer Notes */}
                <div className="text-xs text-slate-600 bg-emerald-50/40 border border-emerald-100/60 p-3 rounded-xl flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-950">Terms & SLA: </span>
                    {bid.notes}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Scheduled dispatch: <strong className="text-slate-700">{bid.pickupDate}</strong></span>
                  </div>

                  {bid.status === 'Pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeclineBid(bid.id)}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleOpenCounter(bid)}
                        className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition cursor-pointer"
                      >
                        Counter Offer
                      </button>
                      <button
                        onClick={() => handleAcceptBid(bid.id)}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept & Lock Escrow</span>
                      </button>
                    </div>
                  )}

                  {bid.status === 'Accepted' && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Smart Contract Active • Escrow Secured</span>
                    </div>
                  )}

                  {bid.status === 'Countered' && (
                    <div className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                      Awaiting response from {bid.buyerName}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Counter Offer Modal */}
      {isCounterModalOpen && selectedBid && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Submit Counter-Offer</h3>
              <button 
                onClick={() => setIsCounterModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="text-slate-500">Buyer: <strong className="text-slate-800">{selectedBid.buyerName}</strong></div>
                <div className="text-slate-500">Produce: <strong className="text-slate-800">{selectedBid.crop}</strong> ({selectedBid.quantityKg} kg)</div>
                <div className="text-slate-500">Their Offer: <span className="font-bold text-slate-800">₹{selectedBid.offeredPricePerKg}/kg</span> (Mandi rate: ₹{selectedBid.mandiBenchmarkPrice}/kg)</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Your Proposed Rate (₹ / kg)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-bold text-slate-900"
                    placeholder="Enter revised price"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Total contract value at this rate: <strong>₹{((parseFloat(counterPrice) || 0) * selectedBid.quantityKg).toLocaleString('en-IN')}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsCounterModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCounter}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition"
              >
                Send Counter-Offer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
