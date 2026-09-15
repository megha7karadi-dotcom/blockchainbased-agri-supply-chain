import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Store, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  IndianRupee, 
  Truck,
  Check,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

const RETAILER_PARTNERS = [
  { id: 'ret-01', name: 'FreshRoot Organic Supermarket', location: 'Bandra West, Mumbai' },
  { id: 'ret-02', name: 'Nature Basket Gourmet Hub', location: 'Andheri East, Mumbai' },
  { id: 'ret-03', name: 'Sahyadri Agro Mart', location: 'Kothrud, Pune' },
  { id: 'ret-04', name: 'Direct Farm-to-Consumer Market', location: 'Vashi APMC Sector 19, Navi Mumbai' }
];

export const DistributorTransferToRetailer: React.FC = () => {
  const { batches, distributorTransferToRetailer, navigate, selectedBatchId: globalBatchId } = useApp();

  // Batches eligible for transfer to retailer: At Distributor, Ready for Dispatch, In Transit
  const eligibleBatches = batches.filter(b => 
    b.status === 'At Distributor' || 
    b.status === 'Ready for Dispatch' ||
    b.status === 'In Transit' ||
    b.currentCustodianRole === 'distributor'
  );

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    globalBatchId || eligibleBatches[0]?.id || ''
  );
  const [selectedRetailerId, setSelectedRetailerId] = useState<string>(RETAILER_PARTNERS[0].id);
  const [customRetailerName, setCustomRetailerName] = useState<string>('');
  const [transferQuantity, setTransferQuantity] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedBatch = batches.find(b => b.id === selectedBatchId || b.batchId === selectedBatchId) || eligibleBatches[0];

  // Auto-fill price & quantity when batch selection changes
  React.useEffect(() => {
    if (selectedBatch) {
      const purchase = selectedBatch.pricing?.farmerPrice || selectedBatch.farmgatePrice || 40;
      const logistics = selectedBatch.pricing?.distributorLogisticsCost || 20;
      const margin = selectedBatch.pricing?.distributorMargin || 15;
      const wholesale = purchase + logistics + margin;

      setTransferQuantity(String(selectedBatch.quantityKg || selectedBatch.quantity || 500));
      setSellingPrice(String(wholesale));
    }
  }, [selectedBatchId]);

  // Transferred to retailer history
  const transferredBatches = batches.filter(b => 
    b.status === 'In Transit to Retailer' || 
    b.status === 'Delivered to Retailer' || 
    b.status === 'On Retail Shelf' || 
    b.status === 'Sold to Consumer'
  );

  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedBatch) {
      setErrorMessage('Please select a batch from inventory.');
      return;
    }

    const qty = parseFloat(transferQuantity);
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage('Please enter a valid transfer quantity.');
      return;
    }

    const price = parseFloat(sellingPrice);
    if (isNaN(price) || price <= 0) {
      setErrorMessage('Please enter a valid wholesale selling price.');
      return;
    }

    const retObj = RETAILER_PARTNERS.find(r => r.id === selectedRetailerId);
    const retailerName = selectedRetailerId === 'custom' 
      ? (customRetailerName.trim() || 'Direct Retail Partner')
      : (retObj?.name || 'FreshRoot Organic Supermarket');

    setIsSubmitting(true);

    try {
      const result = await distributorTransferToRetailer(
        selectedBatch.batchId,
        retailerName,
        selectedRetailerId,
        qty,
        price
      );

      if (result) {
        setSuccessMessage(`Successfully dispatched batch ${selectedBatch.batchId} (${selectedBatch.cropName || selectedBatch.name}) to ${retailerName} at ₹${price}/${selectedBatch.unit || 'kg'}.`);
      } else {
        setSuccessMessage(`Transfer to ${retailerName} recorded.`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to complete transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Store className="w-7 h-7 text-purple-600" />
              <span>Transfer Produce to Retailer</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Dispatch cold-chain consignments to verified retail partners and store shelves with transparent wholesale pricing.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/distributor/inventory')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Hub Inventory
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Consignment Dispatched!</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Transfer Notice</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Dispatch Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-600" />
              <span>Retail Dispatch Manifest</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select produce from your storage, choose target retail store, and confirm wholesale rate.
            </p>
          </div>

          <form onSubmit={handleConfirmTransfer} className="space-y-5">
            
            {/* 1. Select Batch */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Inventory Batch *
              </label>
              {eligibleBatches.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
                  No batches currently available in distributor inventory.{' '}
                  <button 
                    type="button" 
                    onClick={() => navigate('/distributor/incoming')} 
                    className="text-blue-700 font-bold underline"
                  >
                    Check incoming shipments
                  </button>
                </div>
              ) : (
                <select
                  value={selectedBatch?.id || ''}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none transition font-medium text-slate-900"
                >
                  {eligibleBatches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.cropName || b.name} ({b.batchId}) — {b.quantityKg || b.quantity} {b.unit || 'kg'} [{b.status}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Batch Info Card */}
            {selectedBatch && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Farm Origin:</span>
                  <span className="font-medium text-slate-800">{selectedBatch.farmerName} • {selectedBatch.farmLocation || selectedBatch.farmerLocation}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Purchase Price (Farmgate):</span>
                  <span className="font-mono text-slate-900 font-semibold">₹{selectedBatch.pricing?.farmerPrice || selectedBatch.farmgatePrice || 0}/{selectedBatch.unit || 'kg'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Available Hub Stock:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedBatch.quantityKg || selectedBatch.quantity} {selectedBatch.unit || 'kg'}</span>
                </div>
              </div>
            )}

            {/* 2. Select Retailer */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Destination Retail Store / Supermarket *
              </label>
              <select
                value={selectedRetailerId}
                onChange={(e) => setSelectedRetailerId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none transition font-medium text-slate-900"
              >
                {RETAILER_PARTNERS.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.location})
                  </option>
                ))}
                <option value="custom">Other Retailer (Enter Name Below)</option>
              </select>
            </div>

            {selectedRetailerId === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Retailer Name & Location *
                </label>
                <input
                  type="text"
                  required
                  value={customRetailerName}
                  onChange={(e) => setCustomRetailerName(e.target.value)}
                  placeholder="e.g. Nature Organics Supermarket, Vashi"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none transition text-slate-900"
                />
              </div>
            )}

            {/* 3. Quantity & Wholesale Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Quantity to Transfer ({selectedBatch?.unit || 'kg'}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={transferQuantity}
                  onChange={(e) => setTransferQuantity(e.target.value)}
                  placeholder="500"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none transition font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Wholesale Price (₹ / {selectedBatch?.unit || 'kg'}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="90"
                    className="w-full pl-8 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-600 outline-none transition font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Total Billing */}
            {transferQuantity && sellingPrice && (
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-purple-900 block">Total Wholesale Consignment Value</span>
                  <span className="text-xs text-slate-600">Billed to retail store account</span>
                </div>
                <div className="text-xl font-black text-purple-950 font-mono">
                  ₹{(parseFloat(transferQuantity) * parseFloat(sellingPrice) || 0).toLocaleString()}
                </div>
              </div>
            )}

            {/* Confirm Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedBatch}
              className="w-full py-3.5 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Dispatching Consignment...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm and Transfer to Retailer</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Transfer Rules & Process */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Chain of Custody Protection</span>
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                <span><strong>Instant Notification:</strong> The retail store's incoming portal is notified of this scheduled delivery.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                <span><strong>Shelf Acknowledgment:</strong> Retailers inspect and accept the batch directly onto store inventory.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                <span><strong>Transparent Pricing:</strong> Both farmer farmgate price and your wholesale margin are preserved for full consumer visibility.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Transferred Consignments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          <span>Recent Retail Dispatches</span>
        </h2>

        {transferredBatches.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No retail transfers recorded yet. Dispatched consignments will show here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3">Batch ID</th>
                  <th className="py-3 px-3">Crop Name</th>
                  <th className="py-3 px-3">Retail Store</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Wholesale Price</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transferredBatches.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-purple-800">{b.batchId}</td>
                    <td className="py-3.5 px-3 font-medium text-slate-900">{b.cropName || b.name}</td>
                    <td className="py-3.5 px-3 text-slate-700">{b.currentCustodianName || 'Retail Partner'}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-800">{b.quantityKg || b.quantity} {b.unit || 'kg'}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-900">
                      ₹{(b.pricing?.farmerPrice || b.farmgatePrice || 0) + (b.pricing?.distributorLogisticsCost || 0) + (b.pricing?.distributorMargin || 0)}/{b.unit || 'kg'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
