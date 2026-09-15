import React, { useState } from 'react';
import { 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  IndianRupee, 
  Truck,
  ArrowRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

export const DistributorIncoming: React.FC = () => {
  const { batches, distributorReceiveBatch, navigate, setSelectedBatchId } = useApp();

  // Incoming batches: transferred by farmer awaiting physical intake or dispatch
  const incomingBatches = batches.filter(b => 
    b.status === 'Transferred to Distributor' || 
    b.status === 'Ready for Dispatch' ||
    b.status === 'In Transit'
  );

  const [inspectingBatch, setInspectingBatch] = useState<ProduceBatch | null>(null);
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [isReceiving, setIsReceiving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenReceive = (batch: ProduceBatch) => {
    setInspectingBatch(batch);
    setInspectionNotes(`Intake inspection passed at cold storage hub. Tare weight verified (${batch.quantityKg || batch.quantity} ${batch.unit || 'kg'}). Quality grade verified.`);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleConfirmReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingBatch) return;

    setIsReceiving(true);
    setErrorMessage(null);

    try {
      const updated = await distributorReceiveBatch(
        inspectingBatch.batchId,
        inspectionNotes.trim() || 'Received and accepted at distributor cold hub.'
      );

      setSuccessMessage(`Successfully received batch ${inspectingBatch.batchId} (${inspectingBatch.cropName || inspectingBatch.name}). It is now in your active inventory.`);
      setInspectingBatch(null);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to confirm produce receipt.');
    } finally {
      setIsReceiving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Truck className="w-7 h-7 text-blue-600" />
              <span>Incoming Produce Consignments</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Inspect, verify tare weights, and accept batches dispatched by registered farmers into distributor custody.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/distributor/inventory')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              View Inventory
            </button>
            <button
              onClick={() => navigate('/distributor/update-price')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-xs"
            >
              Update Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Consignment Accepted!</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Receipt Notice</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Consignments List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Pending Farmgate Shipments ({incomingBatches.length})</span>
          </h2>
          <span className="text-xs text-slate-500">
            Awaiting dock check-in
          </span>
        </div>

        {incomingBatches.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No incoming consignments pending</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When farmers transfer harvested produce to your distribution center, the batches will appear here for dock verification.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {incomingBatches.map(batch => {
              const cropName = batch.cropName || batch.name;
              const farmer = batch.farmerName || 'Verified Producer';
              const location = batch.farmLocation || batch.farmerLocation || 'Origin Farm';
              const qty = batch.quantityKg || batch.quantity;
              const unit = batch.unit || 'kg';
              const price = batch.pricing?.farmerPrice || batch.farmgatePrice || 0;

              return (
                <div key={batch.id} className="p-5 sm:p-6 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                        {batch.batchId}
                      </span>
                      <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                        {batch.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Harvested: {batch.harvestDate}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {cropName}
                      {batch.cropVariety && <span className="text-xs font-normal text-slate-500 ml-2">({batch.cropVariety})</span>}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{farmer} • {location}</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        Lot: {qty} {unit}
                      </span>
                      <span className="font-bold text-emerald-700">
                        Farmgate: ₹{price}/{unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                    <button
                      onClick={() => {
                        setSelectedBatchId(batch.id);
                        navigate(`/verify/${batch.batchId}`);
                      }}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition text-xs flex items-center gap-1"
                      title="Inspect Provenance"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span className="hidden sm:inline">Inspect</span>
                    </button>
                    <button
                      onClick={() => handleOpenReceive(batch)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Receive Produce</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Receive Produce Modal */}
      {inspectingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-700">{inspectingBatch.batchId}</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Acknowledge & Receive Produce
                </h3>
              </div>
              <button
                onClick={() => setInspectingBatch(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReceive} className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Crop:</span>
                  <span className="font-bold text-slate-900">{inspectingBatch.cropName || inspectingBatch.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Farmer:</span>
                  <span className="font-medium text-slate-800">{inspectingBatch.farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quantity:</span>
                  <span className="font-mono font-bold text-slate-900">{inspectingBatch.quantityKg || inspectingBatch.quantity} {inspectingBatch.unit || 'kg'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Agreed Farmgate Price:</span>
                  <span className="font-mono font-bold text-emerald-800">₹{inspectingBatch.pricing?.farmerPrice || inspectingBatch.farmgatePrice}/{inspectingBatch.unit || 'kg'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Dock QA & Intake Inspection Notes
                </label>
                <textarea
                  rows={3}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="Verify crate tare weight, temperature, moisture level..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition text-slate-900"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectingBatch(null)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReceiving}
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isReceiving ? (
                    <span>Confirming...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Accept</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
