import React, { useState } from 'react';
import { ShoppingCart, Search, Truck, MapPin, Award, CheckCircle2, ShieldCheck, Scale, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

export const AvailableProduce: React.FC = () => {
  const { batches, distributorProcureProduce, navigateToVerification } = useApp();
  const [selectedBatch, setSelectedBatch] = useState<ProduceBatch | null>(null);
  const [logisticsCost, setLogisticsCost] = useState<number>(25);
  const [distributorMargin, setDistributorMargin] = useState<number>(15);
  const [vehicleNumber, setVehicleNumber] = useState('MH-04-TR-9182');
  const [targetTemp, setTargetTemp] = useState('12°C');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [procurementSuccess, setProcurementSuccess] = useState<string | null>(null);

  const available = batches.filter(b => 
    b.status === 'Ready for Dispatch' || 
    b.status === 'Harvested & Tokenized' ||
    b.status === 'Harvested'
  );

  const filtered = available.filter(b => {
    const matchesSearch = 
      (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.batchId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.farmerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenProcure = (batch: ProduceBatch) => {
    setSelectedBatch(batch);
    setProcurementSuccess(null);
  };

  const handleProcure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    distributorProcureProduce(selectedBatch.id, logisticsCost, distributorMargin, vehicleNumber, targetTemp);
    setProcurementSuccess(`Successfully procured ${selectedBatch.name} (${selectedBatch.batchId}). Vehicle ${vehicleNumber} dispatched with live IoT telemetry.`);
    setSelectedBatch(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-12"
    >
      
      {/* Header Banner in clean light palette */}
      <div className="bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/50 text-slate-900 rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Available Produce Marketplace
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Browse verified farm harvests waiting at collection centers. Procure directly with fair-trade smart contracts, transparent cold-chain logistics allocation, and zero hidden broker cuts.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs text-center flex-shrink-0">
          <span className="text-[11px] text-slate-500 font-semibold block">Available Lots Ready</span>
          <span className="text-2xl font-black text-blue-700">{available.length}</span>
          <span className="text-[10px] text-emerald-700 font-medium block">100% Tokenized</span>
        </div>
      </div>

      {/* Success Notification */}
      {procurementSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{procurementSuccess}</span>
          </div>
          <button 
            onClick={() => setProcurementSuccess(null)} 
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop, batch ID, or farmer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Fruits', 'Vegetables', 'Grains', 'Spices'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Produce Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-sm">No produce lots matching your criteria</p>
          <p className="text-xs text-slate-400">Try changing your search term or filtering across all categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(batch => {
            const farmerFloor = batch.pricing?.farmerPrice || batch.farmgatePrice || 40;
            const volumeKg = batch.quantityKg || batch.quantity || 500;
            const lotValue = farmerFloor * volumeKg;

            return (
              <div 
                key={batch.id} 
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 relative bg-slate-100">
                    <img 
                      src={batch.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80'} 
                      alt={batch.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-900/80 text-white backdrop-blur">
                        {batch.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/80 backdrop-blur text-white shadow-xs">
                        {batch.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {batch.batchId}
                      </span>
                      <span className="text-xs text-slate-400">Harvest: {batch.harvestDate}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{batch.name}</h3>
                      <p className="text-xs text-slate-500">{batch.variety}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Farmer:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[150px]">{batch.farmerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Location:</span>
                        <span className="font-medium text-slate-700 truncate max-w-[150px]">
                          {(batch.farmerLocation || batch.farmLocation || 'Maharashtra').split(',')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Lot Net Weight:</span>
                        <span className="font-bold text-slate-900 font-mono">{volumeKg.toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Farmgate Floor:</span>
                        <span className="font-bold text-emerald-800 font-mono">₹{farmerFloor}/kg</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  <button
                    onClick={() => handleOpenProcure(batch)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Procure Lot & Lock Escrow (₹{lotValue.toLocaleString()})</span>
                  </button>

                  <button
                    onClick={() => navigateToVerification(batch.batchId || batch.id)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Digital Passport</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Procurement Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Sign Procurement Escrow Contract</h3>
                <p className="text-xs text-slate-500">{selectedBatch.name} ({selectedBatch.batchId})</p>
              </div>
              <button 
                onClick={() => setSelectedBatch(null)} 
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcure} className="space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <div className="flex justify-between font-bold text-emerald-950 text-sm">
                  <span>Farmer Payout (Base Gate Price):</span>
                  <span className="font-mono">₹{selectedBatch.pricing?.farmerPrice || selectedBatch.farmgatePrice || 40}/kg</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  Total contract escrow value: <strong>₹{((selectedBatch.pricing?.farmerPrice || selectedBatch.farmgatePrice || 40) * (selectedBatch.quantityKg || selectedBatch.quantity || 500)).toLocaleString()}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Logistics Cost (₹/kg)</label>
                  <input
                    type="number"
                    min={1}
                    value={logisticsCost}
                    onChange={(e) => setLogisticsCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Distributor Margin (₹/kg)</label>
                  <input
                    type="number"
                    min={1}
                    value={distributorMargin}
                    onChange={(e) => setDistributorMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reefer Truck License #</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Cold-Chain Temp</label>
                  <input
                    type="text"
                    value={targetTemp}
                    onChange={(e) => setTargetTemp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                Upon executing, smart contract locks the farmer escrow, initializes IoT vehicle monitoring, and updates batch status to <strong>In Transit</strong> on Ethereum Sepolia.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Execute Smart Contract Handover
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBatch(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};
