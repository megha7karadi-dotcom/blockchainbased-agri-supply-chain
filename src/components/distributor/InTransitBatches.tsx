import React, { useState } from 'react';
import { Truck, ThermometerSnowflake, MapPin, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

export const InTransitBatches: React.FC = () => {
  const { batches, transferToRetailer, navigateToVerification } = useApp();
  const [selectedBatchForTransfer, setSelectedBatchForTransfer] = useState<ProduceBatch | null>(null);
  const [retailerName, setRetailerName] = useState('FreshRoot Organics Flagship (Bandra West)');
  const [storeOverhead, setStoreOverhead] = useState<number>(15);
  const [retailMargin, setRetailMargin] = useState<number>(20);

  const inTransit = batches.filter(b => b.status === 'In Transit');

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForTransfer) return;

    transferToRetailer(selectedBatchForTransfer.id, retailerName, storeOverhead, retailMargin);
    setSelectedBatchForTransfer(null);
  };

  return (
    <div className="space-y-8 pb-12">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Truck className="w-6 h-6 text-blue-600" />
          <span>Active In-Transit Consignments</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time cold-chain fleet monitoring and destination wholesale hub check-ins
        </p>
      </div>

      {inTransit.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Truck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">No consignments currently in transit</h3>
          <p className="text-xs text-slate-400">Procure farm harvests from the Available Produce tab to dispatch your reefer fleet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {inTransit.map(batch => {
            const transitEvent = batch.timeline.find(t => t.stage === 'distributor');
            const telemetry = transitEvent?.telemetry;

            return (
              <div key={batch.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      {batch.batchId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      In Transit
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{batch.name}</h3>
                  <p className="text-xs text-slate-500">{batch.variety} • {batch.quantityKg} kg</p>

                  {/* Telemetry dashboard for this truck */}
                  <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                      <span className="flex items-center gap-1.5 text-blue-400 font-mono">
                        <ThermometerSnowflake className="w-4 h-4" />
                        <span>Reefer Vehicle: {telemetry?.vehicleNumber || 'MH-04-TR-9182'}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        IoT Oracle Synced
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-slate-800/80 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Temperature</span>
                        <span className="text-base font-bold text-emerald-400 font-mono">
                          {telemetry?.temperature || '12.2°C'}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-800/80 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Humidity</span>
                        <span className="text-base font-bold text-blue-400 font-mono">
                          {telemetry?.humidity || '88%'}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-800/80 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">GPS Position</span>
                        <span className="text-[11px] font-semibold text-slate-300 font-mono block truncate">
                          {telemetry?.location || 'NH-66 Highway'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price info */}
                  <div className="mt-3 text-xs space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Farmer Received:</span>
                      <span className="font-semibold text-slate-800">₹{batch.pricing.farmerPrice}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Logistics Cost:</span>
                      <span className="font-semibold text-slate-800">₹{batch.pricing.distributorLogisticsCost}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Distributor Margin:</span>
                      <span className="font-bold text-blue-700">₹{batch.pricing.distributorMargin}/kg</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => setSelectedBatchForTransfer(batch)}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Handover to Retailer</span>
                  </button>
                  <button
                    onClick={() => navigateToVerification(batch.id)}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transfer to Retailer Modal */}
      {selectedBatchForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Transfer Custody to Retailer</h3>
                <p className="text-xs text-slate-500">{selectedBatchForTransfer.name} ({selectedBatchForTransfer.batchId})</p>
              </div>
              <button onClick={() => setSelectedBatchForTransfer(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination Retailer Outlet</label>
                <input
                  type="text"
                  value={retailerName}
                  onChange={(e) => setRetailerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Store Handling (₹/kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={storeOverhead}
                    onChange={(e) => setStoreOverhead(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Retail Shelf Margin (₹/kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={retailMargin}
                    onChange={(e) => setRetailMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-[11px]">
                Upon transfer, the retailer inspects physical condition and stocks produce directly to consumer shelves.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition"
                >
                  Confirm Physical Handover
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBatchForTransfer(null)}
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
