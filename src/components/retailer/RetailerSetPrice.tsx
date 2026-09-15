import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Store, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  IndianRupee, 
  TrendingUp, 
  Building2, 
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

export const RetailerSetPrice: React.FC = () => {
  const { batches, retailerSetFinalPrice, retailerUpdatePrice, navigate, selectedBatchId: globalBatchId } = useApp();

  const shelfBatches = batches.filter(b => 
    b.status === 'On Retail Shelf' || 
    b.status === 'Delivered to Retailer' || 
    b.status === 'At Retailer' ||
    b.status === 'Partially Sold' ||
    b.currentCustodianRole === 'retailer'
  );

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    globalBatchId || shelfBatches[0]?.id || ''
  );
  const [storeOverhead, setStoreOverhead] = useState<number>(15);
  const [retailMargin, setRetailMargin] = useState<number>(20);
  const [isSaving, setIsSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const selectedBatch = batches.find(b => b.id === selectedBatchId || b.batchId === selectedBatchId) || shelfBatches[0];

  useEffect(() => {
    if (selectedBatch) {
      setStoreOverhead(selectedBatch.pricing?.retailerStoreOverhead || 15);
      setRetailMargin(selectedBatch.pricing?.retailerMargin || 20);
      setSuccessNotice(null);
      setErrorNotice(null);
    }
  }, [selectedBatchId]);

  // Pricing calculations
  const farmerPrice = selectedBatch?.pricing?.farmerPrice || selectedBatch?.farmgatePrice || 40;
  const distributorLogistics = selectedBatch?.pricing?.distributorLogisticsCost || 20;
  const distributorMargin = selectedBatch?.pricing?.distributorMargin || 15;
  const distributorPrice = distributorLogistics + distributorMargin;
  const wholesalePurchasePrice = farmerPrice + distributorPrice;

  const retailerPrice = Number(storeOverhead) + Number(retailMargin);
  const totalConsumerPrice = wholesalePurchasePrice + retailerPrice;
  const unit = selectedBatch?.unit || 'kg';

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSaving(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      // Optimistic update
      retailerUpdatePrice(selectedBatch.id, Number(storeOverhead), Number(retailMargin));
      // Backend call
      await retailerSetFinalPrice(selectedBatch.batchId, retailerPrice, totalConsumerPrice);

      setSuccessNotice(`Consumer retail price for ${selectedBatch.cropName || selectedBatch.name} updated to ₹${totalConsumerPrice}/${unit}. Published to shelf barcode.`);
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to update consumer price.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Tag className="w-7 h-7 text-purple-600" />
              <span>Set Consumer Shelf Price</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Configure store overhead and retail margins. All price layers are published transparently so shoppers know exactly how every rupee is distributed.
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
              onClick={() => navigate('/retailer/qr-labels')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-xs"
            >
              Print Shelf QR
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Shelf Price Configured!</span>
            <span>{successNotice}</span>
          </div>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Update Notice</span>
            <span>{errorNotice}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Configure Retail Markup
            </h2>
            <p className="text-xs text-slate-500">
              Select produce lot from shelf and adjust store overheads.
            </p>
          </div>

          <form onSubmit={handleSavePrice} className="space-y-5">
            {/* Batch Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Produce Lot *
              </label>
              {shelfBatches.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
                  No active batches on shelf. Check incoming deliveries.
                </div>
              ) : (
                <select
                  value={selectedBatch?.id || ''}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none transition font-medium text-slate-900"
                >
                  {shelfBatches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.cropName || b.name} ({b.batchId}) — {b.quantityKg || b.quantity} {b.unit || 'kg'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Distributor Purchase Cost Reference */}
            {selectedBatch && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Farmgate Base (Farmer):</span>
                  <span className="font-mono text-slate-900 font-semibold">₹{farmerPrice}/{unit}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Cold Logistics & Distributor Share:</span>
                  <span className="font-mono text-slate-900 font-semibold">₹{distributorPrice}/{unit}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-slate-900">
                  <span>Store Purchase Cost:</span>
                  <span className="font-mono text-purple-900 text-sm">₹{wholesalePurchasePrice}/{unit}</span>
                </div>
              </div>
            )}

            {/* Markup Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Store Overhead & Refrigeration Cost (₹ / {unit})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={storeOverhead}
                    onChange={(e) => setStoreOverhead(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none transition font-mono text-slate-900"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Store display cooling, shelf sorting & handling</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Retail Store Net Margin (₹ / {unit})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={retailMargin}
                    onChange={(e) => setRetailMargin(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none transition font-mono text-slate-900"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Store profit per unit</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving || !selectedBatch}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <span>Publishing Price...</span>
              ) : (
                <>
                  <Tag className="w-4 h-4" />
                  <span>Update Shelf Price to ₹{totalConsumerPrice}/{unit}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Clean Price Breakdown Display */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Transparent Consumer Price Breakdown</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                This exact itemized breakdown is visible to shoppers scanning the shelf QR barcode.
              </p>
            </div>

            {/* Big Consumer Price Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-slate-50 to-pink-50/50 border border-purple-200 text-center space-y-1">
              <span className="text-xs text-slate-500 font-semibold block">Total Consumer Shelf Price</span>
              <div className="text-4xl font-black text-slate-900 font-mono">
                ₹{totalConsumerPrice}
                <span className="text-sm font-semibold text-slate-500 ml-1">/ {unit}</span>
              </div>
              <span className="text-[11px] text-purple-700 font-bold block">
                Fair Trade Certified • Zero Undisclosed Markup
              </span>
            </div>

            {/* Itemized List */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">1. Farmer Price</span>
                  <span className="text-[11px] text-slate-500">Paid directly to {selectedBatch?.farmerName || 'Farmer'}</span>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-sm">₹{farmerPrice} / {unit}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">2. Distributor Price</span>
                  <span className="text-[11px] text-slate-500">Reefer transport (₹{distributorLogistics}) + logistics margin (₹{distributorMargin})</span>
                </div>
                <span className="font-mono font-bold text-blue-800 text-sm">₹{distributorPrice} / {unit}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">3. Retailer Price</span>
                  <span className="text-[11px] text-slate-500">Store handling & cooling (₹{storeOverhead}) + retail margin (₹{retailMargin})</span>
                </div>
                <span className="font-mono font-bold text-purple-800 text-sm">₹{retailerPrice} / {unit}</span>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 border border-purple-300 flex items-center justify-between font-bold">
                <span className="text-slate-900">Total Consumer Price</span>
                <span className="font-mono text-purple-950 text-base">₹{totalConsumerPrice} / {unit}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
