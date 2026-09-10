import React, { useState } from 'react';
import { ShoppingCart, Search, Truck, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

export const AvailableProduce: React.FC = () => {
  const { batches, distributorProcureProduce, navigateToVerification } = useApp();
  const [selectedBatch, setSelectedBatch] = useState<ProduceBatch | null>(null);
  const [logisticsCost, setLogisticsCost] = useState<number>(25);
  const [distributorMargin, setDistributorMargin] = useState<number>(15);
  const [vehicleNumber, setVehicleNumber] = useState('MH-04-TR-9182');
  const [targetTemp, setTargetTemp] = useState('12°C');

  const available = batches.filter(b => b.status === 'Ready for Dispatch' || b.status === 'Harvested & Tokenized');

  const handleProcure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    distributorProcureProduce(selectedBatch.id, logisticsCost, distributorMargin, vehicleNumber, targetTemp);
    setSelectedBatch(null);
  };

  return (
    <div className="space-y-8 pb-12">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          <span>Available Farm Produce Marketplace</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fresh harvests verified by farmgate smart contracts awaiting cold-chain logistics dispatch
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {available.map(batch => (
          <div key={batch.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="h-44 relative bg-slate-100">
                <img src={batch.imageUrl} alt={batch.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/90 backdrop-blur text-emerald-800">
                    {batch.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-900/85 backdrop-blur text-white">
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
                    <span className="text-slate-500">Farmer / Farm:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">{batch.farmerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[150px]">{(batch.farmerLocation || batch.farmLocation || 'Local Farm').split(',')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Available Volume:</span>
                    <span className="font-bold text-slate-900">{batch.quantityKg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Farmgate Floor:</span>
                    <span className="font-bold text-emerald-700">₹{batch.pricing.farmerPrice}/kg</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 space-y-2">
              <button
                onClick={() => setSelectedBatch(batch)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Procure & Lock Escrow</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Procurement Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Sign Procurement Escrow Contract</h3>
                <p className="text-xs text-slate-500">{selectedBatch.name} ({selectedBatch.batchId})</p>
              </div>
              <button onClick={() => setSelectedBatch(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleProcure} className="space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                <div className="flex justify-between font-bold text-emerald-950 text-sm">
                  <span>Farmer Payout (Base):</span>
                  <span>₹{selectedBatch.pricing.farmerPrice}/kg</span>
                </div>
                <div className="text-[11px] text-emerald-700">
                  Total contract value: ₹{(selectedBatch.pricing.farmerPrice * selectedBatch.quantityKg).toLocaleString()}
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Distributor Margin (₹/kg)</label>
                  <input
                    type="number"
                    min={1}
                    value={distributorMargin}
                    onChange={(e) => setDistributorMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Cold-Chain Temp</label>
                  <input
                    type="text"
                    value={targetTemp}
                    onChange={(e) => setTargetTemp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                Upon signing, custody is transferred to your fleet on the distributed ledger.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
                >
                  Execute Smart Contract Handover
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBatch(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
