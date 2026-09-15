import React, { useState } from 'react';
import { Truck, ThermometerSnowflake, MapPin, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

export const InTransitBatches: React.FC = () => {
  const { batches, transferToRetailer, navigateToVerification } = useApp();
  const [selectedBatchForTransfer, setSelectedBatchForTransfer] = useState<ProduceBatch | null>(null);
  const [retailerName, setRetailerName] = useState('FreshRoot Organics Flagship (Bandra West)');
  const [storeOverhead, setStoreOverhead] = useState<number>(15);
  const [retailMargin, setRetailMargin] = useState<number>(20);
  const [handoverSuccess, setHandoverSuccess] = useState<string | null>(null);

  const inTransit = batches.filter(b => b.status === 'In Transit');

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForTransfer) return;

    transferToRetailer(selectedBatchForTransfer.id, retailerName, storeOverhead, retailMargin);
    setHandoverSuccess(`Consignment ${selectedBatchForTransfer.name} (${selectedBatchForTransfer.batchId}) successfully handed over to ${retailerName}.`);
    setSelectedBatchForTransfer(null);
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
            In-Transit Consignments
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Monitor real-time cold-chain vehicle telemetry and execute cryptographic handover to destination retail supermarket docks upon arrival.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs text-center flex-shrink-0">
          <span className="text-[11px] text-slate-500 font-semibold block">Active in Transit</span>
          <span className="text-2xl font-black text-blue-700">{inTransit.length}</span>
          <span className="text-[10px] text-emerald-700 font-medium block">Live GPS & Oracles</span>
        </div>
      </div>

      {/* Success Notification */}
      {handoverSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{handoverSuccess}</span>
          </div>
          <button 
            onClick={() => setHandoverSuccess(null)} 
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
          >
            ✕
          </button>
        </motion.div>
      )}

      {inTransit.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3 shadow-xs">
          <Truck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">No consignments currently in transit</h3>
          <p className="text-xs text-slate-400">Procure farm harvests from the Available Produce tab to dispatch your reefer fleet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {inTransit.map(batch => {
            const logs = Array.isArray(batch.sensorLogs) ? batch.sensorLogs : [];
            const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

            return (
              <div 
                key={batch.id} 
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="font-mono font-bold text-slate-800">
                      {batch.batchId}
                    </span>
                    <span className="font-semibold text-blue-700">
                      In Transit
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{batch.name}</h3>
                  <p className="text-xs text-slate-500">{batch.variety} • {batch.quantityKg || batch.quantity} kg</p>

                  {/* Telemetry dashboard for this truck */}
                  <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-blue-200/60 pb-2">
                      <span className="flex items-center gap-1.5 text-blue-800 font-mono font-bold">
                        <ThermometerSnowflake className="w-4 h-4 text-blue-600" />
                        <span>Reefer Vehicle: MH-04-TR-9182</span>
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-800">
                        IoT Synced
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block font-medium">Temperature</span>
                        <span className="text-base font-bold text-emerald-800 font-mono">
                          {latestLog?.temperature ? `${latestLog.temperature}°C` : '12.2°C'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block font-medium">Humidity</span>
                        <span className="text-base font-bold text-blue-800 font-mono">
                          {latestLog?.humidity ? `${latestLog.humidity}%` : '88%'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-blue-100 shadow-2xs">
                        <span className="text-[10px] text-slate-500 block font-medium">GPS Position</span>
                        <span className="text-[11px] font-semibold text-slate-700 font-mono block truncate">
                          {latestLog?.location || 'NH-66 Highway'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price info */}
                  <div className="mt-3.5 text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Farmer Received:</span>
                      <span className="font-semibold text-slate-800 font-mono">₹{batch.pricing?.farmerPrice || batch.farmgatePrice || 40}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Logistics Cost:</span>
                      <span className="font-semibold text-slate-800 font-mono">₹{batch.pricing?.distributorLogisticsCost || 25}/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Distributor Margin:</span>
                      <span className="font-bold text-blue-700 font-mono">₹{batch.pricing?.distributorMargin || 15}/kg</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => setSelectedBatchForTransfer(batch)}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Handover to Retailer</span>
                  </button>
                  <button
                    onClick={() => navigateToVerification(batch.batchId || batch.id)}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transfer to Retailer Modal */}
      {selectedBatchForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Transfer Custody to Retailer</h3>
                <p className="text-xs text-slate-500">{selectedBatchForTransfer.name} ({selectedBatchForTransfer.batchId})</p>
              </div>
              <button 
                onClick={() => setSelectedBatchForTransfer(null)} 
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-500"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Retail Shelf Margin (₹/kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={retailMargin}
                    onChange={(e) => setRetailMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
                Upon transfer, the retailer inspects physical condition and stocks produce directly to consumer shelves.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Confirm Physical Handover
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBatchForTransfer(null)}
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
