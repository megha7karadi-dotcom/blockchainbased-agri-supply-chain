import React, { useState } from 'react';
import { 
  Truck, 
  ThermometerSnowflake, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  ShoppingCart, 
  ArrowRightLeft, 
  Radio, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

export const DistributorDashboard: React.FC = () => {
  const { batches, currentUser, navigate, distributorProcureProduce, navigateToVerification } = useApp();

  const [procuringBatch, setProcuringBatch] = useState<ProduceBatch | null>(null);
  const [logisticsCost, setLogisticsCost] = useState<number>(25);
  const [distributorMargin, setDistributorMargin] = useState<number>(15);
  const [vehicleNumber, setVehicleNumber] = useState('MH-04-TR-9182');
  const [targetTemp, setTargetTemp] = useState('12°C');
  const [procureAlert, setProcureAlert] = useState<string | null>(null);

  // Available batches awaiting distributor procurement
  const availableBatches = batches.filter(b => b.status === 'Ready for Dispatch' || b.status === 'Harvested & Tokenized');
  // In-transit batches under this distributor
  const inTransitBatches = batches.filter(b => b.status === 'In Transit');
  // Delivered / Handed over
  const handedOverBatches = batches.filter(b => b.status === 'Delivered to Retailer' || b.status === 'On Retail Shelf');

  const totalTransitKg = inTransitBatches.reduce((acc, b) => acc + (b.quantityKg || b.quantity || 0), 0);

  const handleConfirmProcurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procuringBatch) return;

    distributorProcureProduce(procuringBatch.id, logisticsCost, distributorMargin, vehicleNumber, targetTemp);
    setProcureAlert(`Procurement confirmed: ${procuringBatch.name} (${procuringBatch.batchId}) assigned to reefer unit ${vehicleNumber}. Custody locked on ledger.`);
    setProcuringBatch(null);
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      
      {/* 1. NODE HEADER & PRIMARY LOGISTICS ACTIONS */}
      <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                Logistics & Fleet Operations Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              {currentUser?.organization || 'Maha-Agro Logistics Hub'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Operations Lead: {currentUser?.name || 'Vikramaditya Shinde'} • <span className="text-stone-500">Fleet Cold Oracles Active</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/distributor/available-produce')}
              className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-xs sm:text-sm rounded-md transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Procure Farm Harvests ({availableBatches.length})</span>
            </button>
            <button
              onClick={() => navigate('/distributor/transportation')}
              className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>IoT Telemetry Feed</span>
            </button>
            <button
              onClick={() => navigate('/distributor/transfer-to-retailer')}
              className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-emerald-800" />
              <span>Transfer to Retailer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Procurement Toast Alert */}
      {procureAlert && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-md flex items-center justify-between gap-3 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>{procureAlert}</span>
          </div>
          <button 
            type="button"
            onClick={() => setProcureAlert(null)} 
            className="text-emerald-800 hover:text-emerald-950 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. OPERATIONAL LOGISTICS METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Active Reefer Fleet</div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">4 <span className="text-xs font-sans text-stone-500 font-normal">vehicles</span></div>
          <div className="text-[11px] text-emerald-800 font-medium mt-0.5">100% telemetry synced</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Cargo in Transit</div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">{totalTransitKg > 0 ? `${totalTransitKg} kg` : `${inTransitBatches.length} lots`}</div>
          <div className="text-[11px] text-stone-500 mt-0.5">En route to distribution centres</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Average Cargo Temp</div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">11.8°C</div>
          <div className="text-[11px] text-emerald-800 font-medium mt-0.5">Optimal cold-chain window</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Thermal Compliance</div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">99.4%</div>
          <div className="text-[11px] text-stone-500 mt-0.5">Zero unhandled temperature spikes</div>
        </div>
      </div>

      {/* 3. CONSIGNMENTS CURRENTLY IN TRANSIT (TABLE) */}
      <section className="bg-white rounded-lg border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Active Consignments in Transit</h2>
            <p className="text-xs text-stone-500">Live custody tracking of reefer vehicles, sensor telemetry, and wholesale destinations</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/distributor/transportation')}
            className="text-xs font-semibold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Live sensor telemetry feed</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {inTransitBatches.length === 0 ? (
          <div className="p-8 text-center text-stone-500 border border-stone-200 rounded-md bg-stone-50/50 text-xs">
            No consignments currently in transit. Procure farm harvests below to dispatch vehicles.
          </div>
        ) : (
          <div className="overflow-x-auto border border-stone-200 rounded-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Consignment / Batch</th>
                  <th className="py-3 px-4">Commodity</th>
                  <th className="py-3 px-4">Reefer Unit</th>
                  <th className="py-3 px-4 text-right">Cargo Weight</th>
                  <th className="py-3 px-4 text-center">Current Temp</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                {inTransitBatches.map(batch => (
                  <tr key={batch.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                      {batch.batchId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{batch.name}</div>
                      <div className="text-[11px] text-stone-500">{batch.farmerLocation || 'Origin Hub'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-700 whitespace-nowrap">
                      {batch.distributorDetails?.vehicleNumber || 'MH-04-TR-9182'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium whitespace-nowrap">
                      {batch.quantityKg || batch.quantity} kg
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap font-mono font-semibold text-emerald-800">
                      {batch.distributorDetails?.temperature || '11.8°C'}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-900 border border-emerald-300">
                        In Transit
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate('/distributor/transportation')}
                          className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded text-[11px] font-medium transition cursor-pointer"
                        >
                          Telemetry
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/distributor/transfer-to-retailer')}
                          className="px-2.5 py-1 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-[11px] font-medium transition cursor-pointer"
                        >
                          Transfer to Retail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 4. FARM HARVESTS AWAITING LOGISTICS INTAKE (STRUCTURED TABLE) */}
      <section className="bg-white rounded-lg border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Farm Harvests Ready for Intake</h2>
            <p className="text-xs text-stone-500">Growers requesting cold transport collection with fixed farmgate payouts</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/distributor/available-produce')}
            className="text-xs font-semibold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View all registered harvests ({availableBatches.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {availableBatches.length === 0 ? (
          <div className="p-8 text-center text-stone-500 border border-stone-200 rounded-md bg-stone-50/50 text-xs">
            No farm batches currently awaiting procurement. Check back once farmers register new harvests.
          </div>
        ) : (
          <div className="overflow-x-auto border border-stone-200 rounded-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4">Crop & Variety</th>
                  <th className="py-3 px-4">Grower & Location</th>
                  <th className="py-3 px-4 text-right">Available Volume</th>
                  <th className="py-3 px-4 text-right">Agreed Farm Payout</th>
                  <th className="py-3 px-4 text-right">Contract Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                {availableBatches.map(batch => (
                  <tr key={batch.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                      {batch.batchId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{batch.name}</div>
                      <div className="text-[11px] text-stone-500">{batch.cropVariety || batch.variety}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-stone-900">{batch.farmerName}</div>
                      <div className="text-[11px] text-stone-500">{batch.farmerLocation || batch.farmLocation || 'India'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium whitespace-nowrap">
                      {batch.quantityKg || batch.quantity} kg
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-950 whitespace-nowrap">
                      ₹{batch.pricing?.farmerPrice || batch.farmgatePrice || 40}/kg
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigateToVerification(batch.batchId || batch.id)}
                          className="px-2.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded text-[11px] font-semibold transition cursor-pointer"
                        >
                          Passport
                        </button>
                        <button
                          type="button"
                          onClick={() => setProcuringBatch(batch)}
                          className="px-3 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Accept & Dispatch</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. PROCUREMENT MODAL DIALOG */}
      {procuringBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-lg w-full border border-stone-200 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Procure & Assign Reefer Transport</h3>
                <p className="text-xs text-stone-500">{procuringBatch.name} • Batch ID: {procuringBatch.batchId}</p>
              </div>
              <button 
                type="button"
                onClick={() => setProcuringBatch(null)} 
                className="w-7 h-7 rounded bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmProcurement} className="space-y-4 text-xs">
              <div className="p-3 bg-stone-50 rounded border border-stone-200 space-y-1">
                <div className="flex justify-between font-bold text-stone-900">
                  <span>Guaranteed Farmgate Payout:</span>
                  <span className="font-mono text-emerald-950">₹{procuringBatch.pricing?.farmerPrice || procuringBatch.farmgatePrice || 40}/kg</span>
                </div>
                <div className="text-[11px] text-stone-600">
                  Total contract value: ₹{((procuringBatch.pricing?.farmerPrice || procuringBatch.farmgatePrice || 40) * (procuringBatch.quantityKg || procuringBatch.quantity || 500)).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Freight Logistics Markup (₹/kg)</label>
                  <input
                    type="number"
                    min={1}
                    value={logisticsCost}
                    onChange={(e) => setLogisticsCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono outline-none focus:bg-white focus:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Distributor Margin (₹/kg)</label>
                  <input
                    type="number"
                    min={1}
                    value={distributorMargin}
                    onChange={(e) => setDistributorMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono outline-none focus:bg-white focus:border-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Reefer Truck License Plate</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded outline-none font-mono focus:bg-white focus:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Target Reefer Temp</label>
                  <input
                    type="text"
                    value={targetTemp}
                    onChange={(e) => setTargetTemp(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono outline-none focus:bg-white focus:border-emerald-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200 text-stone-600 text-[11px] leading-relaxed">
                Audited Wholesale Price to Retailer: <strong>₹{(procuringBatch.pricing?.farmerPrice || procuringBatch.farmgatePrice || 40) + Number(logisticsCost) + Number(distributorMargin)}/kg</strong>. Itemized figures are permanently registered on the blockchain.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded transition cursor-pointer shadow-xs"
                >
                  Record Custody & Dispatch Reefer
                </button>
                <button
                  type="button"
                  onClick={() => setProcuringBatch(null)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded transition cursor-pointer"
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
