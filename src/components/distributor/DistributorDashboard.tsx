import React, { useState } from 'react';
import { 
  Truck, 
  ThermometerSnowflake, 
  Package, 
  TrendingUp, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Layers,
  Search,
  ShoppingCart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';
import { CryptoHashDisplay } from '../common/CryptoHashDisplay';

export const DistributorDashboard: React.FC = () => {
  const { batches, currentUser, setActiveTab, setSelectedBatchId, distributorProcureProduce } = useApp();

  const [procuringBatch, setProcuringBatch] = useState<ProduceBatch | null>(null);
  const [logisticsCost, setLogisticsCost] = useState<number>(25);
  const [distributorMargin, setDistributorMargin] = useState<number>(15);
  const [vehicleNumber, setVehicleNumber] = useState('MH-04-TR-9182');
  const [targetTemp, setTargetTemp] = useState('12°C');

  // Available batches awaiting distributor procurement
  const availableBatches = batches.filter(b => b.status === 'Ready for Dispatch' || b.status === 'Harvested & Tokenized');
  // In-transit batches under this distributor
  const inTransitBatches = batches.filter(b => b.status === 'In Transit');

  const handleConfirmProcurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procuringBatch) return;

    distributorProcureProduce(procuringBatch.id, logisticsCost, distributorMargin, vehicleNumber, targetTemp);
    setProcuringBatch(null);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>Cold Logistics Node: {currentUser.walletAddress}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentUser.organization}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Director: {currentUser.name} • Active GPS & Telemetry Oracles Synced
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('available-produce')}
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Procure Farm Harvests ({availableBatches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('cold-chain-monitor')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
          >
            <ThermometerSnowflake className="w-4 h-4 text-blue-300" />
            <span>IoT Cold Telemetry</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Reefer Fleet</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">4 <span className="text-xs font-normal text-slate-500">vehicles</span></div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">100% GPS connected</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Average Reefer Temp</span>
            <ThermometerSnowflake className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700">11.8°C</div>
          <div className="text-[11px] text-slate-500 mt-1">Optimal cold-chain window</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Batches In Transit</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{inTransitBatches.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">En route to wholesale hubs</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Logistics Compliance</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">99.4%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Zero thermal excursion breaches</div>
        </div>
      </div>

      {/* Available Farm Lots Awaiting Procurement */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Farm Harvests Ready for Procurement</h2>
            <p className="text-xs text-slate-500">Farmers requesting cold-chain pickup & distribution</p>
          </div>
          <button
            onClick={() => setActiveTab('available-produce')}
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
          >
            <span>View Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {availableBatches.map(batch => (
            <div key={batch.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {batch.batchId}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{batch.quantityKg} kg</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{batch.name}</h3>
                <div className="text-xs text-slate-500 mt-1">
                  <strong>Farmer:</strong> {batch.farmerName} • {(batch.farmerLocation || batch.farmLocation || 'Local Farm').split(',')[0]}
                </div>

                <div className="mt-3 p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex justify-between">
                  <span className="text-slate-500">Farmer Price Floor:</span>
                  <span className="font-bold text-emerald-700">₹{batch.pricing.farmerPrice}/kg</span>
                </div>
              </div>

              <button
                onClick={() => setProcuringBatch(batch)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Accept Custody & Dispatch Reefer</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Procurement Modal */}
      {procuringBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Procure & Dispatch Cold-Chain</h3>
                <p className="text-xs text-slate-500">{procuringBatch.name} ({procuringBatch.batchId})</p>
              </div>
              <button onClick={() => setProcuringBatch(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmProcurement} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex justify-between font-bold text-emerald-900">
                  <span>Farmer Payout:</span>
                  <span>₹{procuringBatch.pricing.farmerPrice}/kg</span>
                </div>
                <div className="text-[11px] text-emerald-700">
                  Total escrow locked for farmer: ₹{(procuringBatch.pricing.farmerPrice * procuringBatch.quantityKg).toLocaleString()}
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
                  <label className="block font-semibold text-slate-700 mb-1">Target Reefer Temp</label>
                  <input
                    type="text"
                    value={targetTemp}
                    onChange={(e) => setTargetTemp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px]">
                Transparent Wholesale Price to Retailer will be: <strong>₹{procuringBatch.pricing.farmerPrice + Number(logisticsCost) + Number(distributorMargin)}/kg</strong>. All values are published to the smart contract.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
                >
                  Sign Smart Contract & Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => setProcuringBatch(null)}
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
