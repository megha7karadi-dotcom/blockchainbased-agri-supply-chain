import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Store, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  MapPin, 
  Calendar, 
  FileText, 
  DollarSign, 
  Lock,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

interface RetailerDestination {
  id: string;
  name: string;
  storeLocation: string;
  walletAddress: string;
  managerName: string;
  coldStorageCertified: boolean;
}

const VERIFIED_RETAILERS: RetailerDestination[] = [
  {
    id: 'ret-01',
    name: 'FreshRoot Organics Flagship',
    storeLocation: 'Bandra West, Mumbai, MH',
    walletAddress: '0x1F2B...A4C9',
    managerName: 'Ananya Sharma',
    coldStorageCertified: true,
  },
  {
    id: 'ret-02',
    name: "Nature's Basket Artisanal Hub",
    storeLocation: 'Worli Sea Face, Mumbai, MH',
    walletAddress: '0x89C1...E432',
    managerName: 'Sanjay Deshmukh',
    coldStorageCertified: true,
  },
  {
    id: 'ret-03',
    name: 'Reliance Signature SuperCenter',
    storeLocation: 'Andheri East, Mumbai, MH',
    walletAddress: '0x44D9...F128',
    managerName: 'Pooja Kulkarni',
    coldStorageCertified: true,
  },
  {
    id: 'ret-04',
    name: 'GreenLeaf Agro Mart',
    storeLocation: 'Koregaon Park, Pune, MH',
    walletAddress: '0x55A1...B890',
    managerName: 'Rohan Mehta',
    coldStorageCertified: true,
  },
];

export const DistributorOwnershipTransfer: React.FC = () => {
  const { batches, distributorTransferProduce, navigateToVerification } = useApp();

  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedRetailer, setSelectedRetailer] = useState<RetailerDestination>(VERIFIED_RETAILERS[0]);
  const [deliveryVehicle, setDeliveryVehicle] = useState('MH-04-TR-9182');
  const [driverName, setDriverName] = useState('Mahesh Jadhav');
  const [deliveryNotes, setDeliveryNotes] = useState('Reefer cold-chain seals intact. Digital temperature log verified at 11.4°C upon arrival at retailer loading dock.');
  const [sealNumber, setSealNumber] = useState('SEAL-IN-98214');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  // Eligible batches for handoff: In Transit or At Distributor
  const eligibleBatches = batches.filter(b => 
    b.status === 'In Transit' || 
    b.status === 'At Distributor' ||
    b.currentCustodianRole === 'distributor'
  );

  const activeBatch = batches.find(b => b.id === selectedBatchId || b.batchId === selectedBatchId) || eligibleBatches[0];

  const wholesaleRate = (activeBatch?.pricing?.farmerPrice || 40) + 
    (activeBatch?.pricing?.distributorLogisticsCost || 25) + 
    (activeBatch?.pricing?.distributorMargin || 15);
  
  const totalPayout = wholesaleRate * (activeBatch?.quantityKg || activeBatch?.quantity || 500);

  const handleExecuteHandoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch) return;

    setIsTransferring(true);
    setTimeout(() => {
      distributorTransferProduce(
        activeBatch.id, 
        selectedRetailer.name, 
        deliveryVehicle, 
        `${deliveryNotes} (Seal: ${sealNumber}, Driver: ${driverName})`
      );
      setIsTransferring(false);
      setTransferSuccess(`Ownership custody of ${activeBatch.name} (${activeBatch.batchId}) successfully transferred to ${selectedRetailer.name}. Escrow released on blockchain.`);
    }, 700);
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
            Transfer Custody & Consignment Delivery
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Execute final delivery and cryptographic ownership transfer to verified retail stores. Confirms tamper-evident cold seals, records driver sign-off, and triggers automated wholesale escrow settlement.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs text-center flex-shrink-0">
          <span className="text-[11px] text-slate-500 font-semibold block">Consignments in Handoff Window</span>
          <span className="text-2xl font-black text-blue-700">{eligibleBatches.length}</span>
          <span className="text-[10px] text-emerald-700 font-medium block">Ready for Delivery</span>
        </div>
      </div>

      {/* Success Notification */}
      {transferSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{transferSuccess}</span>
          </div>
          <button 
            onClick={() => setTransferSuccess(null)} 
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Main Grid: Batch Selection & Transfer Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Eligible Lots List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Consignments Awaiting Retail Handoff</h2>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                {eligibleBatches.length} Lots
              </span>
            </div>

            {eligibleBatches.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Truck className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                <p className="text-xs font-semibold">No active lots in custody.</p>
                <p className="text-[11px] text-slate-400">Procure farm lots from the marketplace to dispatch consignments.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {eligibleBatches.map(batch => {
                  const isSelected = (activeBatch?.id === batch.id);
                  return (
                    <button
                      key={batch.id}
                      onClick={() => {
                        setSelectedBatchId(batch.id);
                        setTransferSuccess(null);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-400 shadow-2xs' 
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-mono text-[11px] font-bold text-slate-800">
                            {batch.batchId}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-[11px] font-semibold text-blue-700">
                            {batch.status}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 line-clamp-1">{batch.name}</div>
                        <div className="text-[11px] text-slate-500">
                          Cargo: <strong>{batch.quantityKg || batch.quantity} kg</strong> • Origin: {(batch.farmerLocation || batch.farmLocation || '').split(',')[0]}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-900 block">
                          ₹{wholesaleRate * (batch.quantityKg || batch.quantity || 500) > 0 ? (wholesaleRate * (batch.quantityKg || batch.quantity || 500)).toLocaleString() : '35,000'}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold">Wholesale Value</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Destination Retailer & Transfer Execution (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeBatch ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
              
              {/* Batch Summary Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {activeBatch.batchId}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="font-semibold text-slate-500">{activeBatch.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{activeBatch.name}</h3>
                  <p className="text-xs text-slate-500">Producer: {activeBatch.farmerName} • Net Weight: {activeBatch.quantityKg || activeBatch.quantity} kg</p>
                </div>

                <button
                  onClick={() => navigateToVerification(activeBatch.batchId || activeBatch.id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <span>Batch QR Passport</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleExecuteHandoff} className="space-y-5 text-xs">
                
                {/* Step 1: Select Verified Retailer */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-800 flex items-center justify-between">
                    <span>1. Select Verified Destination Supermarket / Retailer</span>
                    <span className="text-[11px] text-blue-700 font-normal">All nodes KYC verified</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {VERIFIED_RETAILERS.map(retailer => {
                      const isChosen = selectedRetailer.id === retailer.id;
                      return (
                        <div
                          key={retailer.id}
                          onClick={() => setSelectedRetailer(retailer)}
                          className={`p-3 rounded-2xl border transition cursor-pointer space-y-1 ${
                            isChosen 
                              ? 'bg-blue-50 border-blue-500 shadow-2xs' 
                              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs line-clamp-1">{retailer.name}</span>
                            {isChosen && <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{retailer.storeLocation}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Wallet: {retailer.walletAddress}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Cold Transit & Delivery Credentials */}
                <div className="space-y-3 pt-2">
                  <label className="block font-bold text-slate-800">
                    2. Transport Vehicle & Loading Dock Seal Details
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Reefer Truck License #</label>
                      <input
                        type="text"
                        value={deliveryVehicle}
                        onChange={(e) => setDeliveryVehicle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono focus:bg-white focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Tamper Seal Identifier</label>
                      <input
                        type="text"
                        value={sealNumber}
                        onChange={(e) => setSealNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Authorized Delivery Driver</label>
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Store Receiving Manager</label>
                      <input
                        type="text"
                        disabled
                        value={selectedRetailer.managerName}
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Delivery Manifest Notes</label>
                    <textarea
                      rows={2}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Escrow Settlement Preview */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-700" />
                      <span>Smart Contract Wholesale Escrow Release</span>
                    </span>
                    <span className="font-mono text-base text-emerald-800">₹{totalPayout.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Upon cryptographic handoff, ownership token transfers to <strong>{selectedRetailer.name}</strong>. The retailer's pre-funded escrow is released directly into KisanLogix distributor wallet.
                  </p>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isTransferring}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>{isTransferring ? 'Executing Smart Contract Transfer...' : `Transfer Custody to ${selectedRetailer.name}`}</span>
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-sm">No consignment selected</p>
              <p className="text-xs text-slate-400">Select a lot from the left column to execute retail handoff.</p>
            </div>
          )}
        </div>

      </div>

    </motion.div>
  );
};
