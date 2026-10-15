import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Package, 
  Store, 
  ArrowRight,
  Eye,
  MapPin,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

export const RetailerIncoming: React.FC = () => {
  const { batches, retailerReceiveBatch, navigate, setSelectedBatchId } = useApp();

  // Batches in transit or delivered to retailer awaiting shelf intake
  const incomingBatches = batches.filter(b => 
    b.status === 'In Transit to Retailer' || 
    b.status === 'Delivered to Retailer' ||
    b.status === 'At Distributor'
  );

  const [inspectingBatch, setInspectingBatch] = useState<ProduceBatch | null>(null);
  const [shelfAisle, setShelfAisle] = useState('Organic Fresh Produce Aisle 2 - Display Bay 4');
  const [isReceiving, setIsReceiving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenReceive = (batch: ProduceBatch) => {
    setInspectingBatch(batch);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleConfirmReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingBatch) return;

    setIsReceiving(true);
    setErrorMessage(null);

    try {
      await retailerReceiveBatch(
        inspectingBatch.batchId,
        shelfAisle.trim() || 'Store Fresh Produce Rack 1'
      );

      setSuccessMessage(`Consignment ${inspectingBatch.batchId} (${inspectingBatch.cropName || inspectingBatch.name}) has been verified and stocked onto store shelves.`);
      setInspectingBatch(null);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to acknowledge receipt.');
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
              <Truck className="w-7 h-7 text-purple-600" />
              <span>Incoming Distributor Shipments</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Inspect refrigerated deliveries arriving from regional aggregators and stock produce directly onto retail shelves.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/retailer/inventory')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Store Inventory
            </button>
            <button
              onClick={() => navigate('/retailer/set-price')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-xs"
            >
              Set Consumer Price
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Delivery Stocked!</span>
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

      {/* Incoming Consignments */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Scheduled & Arrived Deliveries ({incomingBatches.length})</span>
          </h2>
          <span className="text-xs text-slate-500">
            Awaiting shelf check-in
          </span>
        </div>

        {incomingBatches.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No incoming deliveries right now</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When distributors dispatch fresh batches to your store, they will appear here ready for dock inspection and stocking.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {incomingBatches.map(batch => {
              const crop = batch.cropName || batch.name;
              const farmer = batch.farmerName || 'Verified Farmer';
              const location = batch.farmLocation || batch.farmerLocation || 'Origin Farm';
              const qty = batch.quantityKg || batch.quantity;
              const unit = batch.unit || 'kg';
              const farmerPrice = batch.pricing?.farmerPrice || batch.farmgatePrice || 40;
              const wholesalePrice = farmerPrice + (batch.pricing?.distributorLogisticsCost || 20) + (batch.pricing?.distributorMargin || 15);

              return (
                <div key={batch.id} className="p-5 sm:p-6 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                        {batch.batchId}
                      </span>
                      <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                        {batch.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Harvested: {batch.harvestDate}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {crop}
                      {batch.cropVariety && <span className="text-xs font-normal text-slate-500 ml-2">({batch.cropVariety})</span>}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{farmer} • {location}</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        Consignment: {qty} {unit}
                      </span>
                      <span className="font-mono text-purple-900 font-bold">
                        Wholesale Cost: ₹{wholesalePrice}/{unit}
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
                      title="Inspect Farm Trace"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span className="hidden sm:inline">Trace</span>
                    </button>
                    <button
                      onClick={() => handleOpenReceive(batch)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept & Stock</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stocking Modal */}
      {inspectingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-purple-700">{inspectingBatch.batchId}</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Stock Produce onto Store Shelf
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
                  <span className="text-slate-500">Quantity:</span>
                  <span className="font-mono font-bold text-slate-900">{inspectingBatch.quantityKg || inspectingBatch.quantity} {inspectingBatch.unit || 'kg'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Farm Origin:</span>
                  <span className="text-slate-700">{inspectingBatch.farmerName}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Store Display Location / Aisle *
                </label>
                <input
                  type="text"
                  required
                  value={shelfAisle}
                  onChange={(e) => setShelfAisle(e.target.value)}
                  placeholder="e.g. Organic Produce Section - Bay 3"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none transition text-slate-900"
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
                    <span>Stocking...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Stock</span>
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
