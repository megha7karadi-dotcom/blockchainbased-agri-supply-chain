import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  Clock, 
  Calendar,
  Building2,
  Check,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';
import { BackButton } from '../common/BackButton';

const DISTRIBUTOR_PARTNERS = [
  { id: 'dist-01', name: 'KisanLogix Cold Fleet Ltd', location: 'Pune Logistics Hub' },
  { id: 'dist-02', name: 'MahaAgro Export Consortium', location: 'Navi Mumbai Cold Hub' },
  { id: 'dist-03', name: 'Sahyadri Agri Logistics Hub', location: 'Nashik Aggregation Center' },
  { id: 'dist-04', name: 'Deccan Fresh Transporters', location: 'Satara Processing Depot' }
];

export const FarmerTransfers: React.FC = () => {
  const { batches, currentUser, farmerTransferToDistributor, navigate } = useApp();

  const farmerBatches = batches.filter(b => 
    (b.farmerId === currentUser?.id || b.farmerName === currentUser?.name || b.farmerId === 'usr-farmer-01')
  );

  const transferrableBatches = farmerBatches.filter(b => 
    b.status === 'Registered' || b.status === 'Ready for Dispatch' || b.status === 'Harvested & Tokenized'
  );

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    transferrableBatches[0]?.id || farmerBatches[0]?.id || ''
  );
  const [selectedDistributorId, setSelectedDistributorId] = useState<string>(DISTRIBUTOR_PARTNERS[0].id);
  const [customDistributorName, setCustomDistributorName] = useState<string>('');
  const [transferQuantity, setTransferQuantity] = useState<string>('');
  const [agreedPrice, setAgreedPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedBatch = batches.find(b => b.id === selectedBatchId || b.batchId === selectedBatchId);

  // Auto-fill defaults when batch changes
  React.useEffect(() => {
    if (selectedBatch) {
      setTransferQuantity(String(selectedBatch.quantityKg || selectedBatch.quantity || 1000));
      setAgreedPrice(String(selectedBatch.pricing?.farmerPrice || selectedBatch.farmgatePrice || 60));
    }
  }, [selectedBatchId]);

  // Transferred batches history
  const transferredBatches = farmerBatches.filter(b => 
    b.status === 'Transferred to Distributor' || 
    b.status === 'At Distributor' || 
    b.status === 'In Transit' || 
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
      setErrorMessage('Please select a crop to transfer.');
      return;
    }

    const qty = parseFloat(transferQuantity);
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage('Please enter a valid quantity.');
      return;
    }

    const price = parseFloat(agreedPrice);
    if (isNaN(price) || price <= 0) {
      setErrorMessage('Please enter a valid agreed price per unit.');
      return;
    }

    const distObj = DISTRIBUTOR_PARTNERS.find(d => d.id === selectedDistributorId);
    const distributorName = selectedDistributorId === 'custom' 
      ? (customDistributorName.trim() || 'Direct Distribution Partner') 
      : (distObj?.name || 'KisanLogix Cold Fleet Ltd');

    setIsSubmitting(true);

    try {
      const result = await farmerTransferToDistributor(
        selectedBatch.batchId,
        distributorName,
        selectedDistributorId,
        qty,
        price
      );

      if (result) {
        setSuccessMessage(`Transferred batch ${selectedBatch.batchId} (${selectedBatch.cropName || selectedBatch.name}) to ${distributorName} at ₹${price}/${selectedBatch.unit || 'kg'}.`);
      } else {
        setSuccessMessage(`Transfer confirmed for ${selectedBatch.cropName || selectedBatch.name} to ${distributorName}.`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Navigation Back Button */}
      <div className="flex items-center justify-start">
        <BackButton fallback="/farmer/dashboard" />
      </div>
      
      {/* Header */}
      <div className="bg-white border border-[#bbf7d0] rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
            <span className="text-[11px] font-semibold text-[#16a34a] uppercase tracking-wider">
              Produce Handover
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1c1917] flex items-center gap-2">
            <span>Transfer Produce</span>
          </h1>
          <p className="text-xs text-[#78716c]">
            Hand over your harvested crop to transporters or buyers. Record quantity and agreed price.
          </p>
        </div>

        <button
          onClick={() => navigate('/farmer/my-produce')}
          className="px-3.5 py-2 bg-stone-50 hover:bg-[#f0fdf4] text-[#1c1917] font-semibold text-xs rounded-lg border border-[#bbf7d0] transition cursor-pointer self-start sm:self-auto"
        >
          My Crops
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-[#f0fdf4] border border-[#22c55e] rounded-lg flex items-start gap-3 text-[#16a34a] text-xs">
          <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Transfer Confirmed</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-lg flex items-start gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Notice</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Transfer Form */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-xl border border-[#bbf7d0] shadow-xs space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-sm font-bold text-[#1c1917] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#16a34a]" />
              <span>Handover to Transporter or Buyer</span>
            </h2>
            <p className="text-xs text-[#78716c] mt-0.5">
              Select your crop, choose the receiving partner, and confirm the handover amount.
            </p>
          </div>

          <form onSubmit={handleConfirmTransfer} className="space-y-4">
            
            {/* 1. Select Crop Batch */}
            <div>
              <label className="block text-xs font-semibold text-[#1c1917] mb-1.5">
                Select Crop Batch <span className="text-rose-500">*</span>
              </label>
              {farmerBatches.length === 0 ? (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600">
                  You have not registered any crops yet.{' '}
                  <button 
                    type="button" 
                    onClick={() => navigate('/farmer/register-produce')} 
                    className="text-[#16a34a] font-bold underline"
                  >
                    Add a crop now
                  </button>
                </div>
              ) : (
                <select
                  value={selectedBatch?.id || ''}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f0fdf4]/30 border border-[#bbf7d0] rounded-lg focus:bg-white focus:border-[#16a34a] outline-none transition font-medium text-stone-900"
                >
                  {farmerBatches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.cropName || b.name} ({b.batchId}) — {b.quantityKg || b.quantity} {b.unit || 'kg'} [{b.status}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Batch Info Card */}
            {selectedBatch && (
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center text-stone-600">
                  <span>Current Status:</span>
                  <span className="font-semibold text-[#16a34a] bg-white px-2 py-0.5 rounded border border-stone-200">{selectedBatch.status}</span>
                </div>
                <div className="flex justify-between items-center text-stone-600">
                  <span>Farm Origin:</span>
                  <span className="font-medium text-stone-800">{selectedBatch.farmLocation || selectedBatch.farmerLocation}</span>
                </div>
                <div className="flex justify-between items-center text-stone-600">
                  <span>Recorded Farm Price:</span>
                  <span className="font-bold text-[#16a34a]">₹{selectedBatch.farmgatePrice || selectedBatch.pricing?.farmerPrice} / {selectedBatch.unit || 'kg'}</span>
                </div>
              </div>
            )}

            {/* 2. Choose Transporter / Buyer */}
            <div>
              <label className="block text-xs font-semibold text-[#1c1917] mb-1.5">
                Transporter / Buyer Partner <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedDistributorId}
                onChange={(e) => setSelectedDistributorId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-[#bbf7d0] rounded-lg focus:bg-white focus:border-[#16a34a] outline-none transition font-medium text-stone-900"
              >
                {DISTRIBUTOR_PARTNERS.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.location})
                  </option>
                ))}
                <option value="custom">Other Local Buyer / Transporter</option>
              </select>
            </div>

            {selectedDistributorId === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1.5">
                  Partner Name & Vehicle Number
                </label>
                <input
                  type="text"
                  value={customDistributorName}
                  onChange={(e) => setCustomDistributorName(e.target.value)}
                  placeholder="e.g. Patil Logistics, MH-09-AB-1234"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-[#bbf7d0] rounded-lg focus:bg-white focus:border-[#16a34a] outline-none transition"
                />
              </div>
            )}

            {/* 3. Quantity & Agreed Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1.5">
                  Quantity Handed Over <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={transferQuantity}
                    onChange={(e) => setTransferQuantity(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-[#bbf7d0] rounded-lg focus:bg-white focus:border-[#16a34a] outline-none transition font-semibold"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-medium text-stone-400">
                    {selectedBatch?.unit || 'kg'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1c1917] mb-1.5">
                  Agreed Handover Price (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(e.target.value)}
                    placeholder="e.g. 85"
                    className="w-full pl-7 pr-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-[#bbf7d0] rounded-lg focus:bg-white focus:border-[#16a34a] outline-none transition font-semibold"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-medium text-stone-400">
                    /{selectedBatch?.unit || 'kg'}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Payout Calculation */}
            {transferQuantity && agreedPrice && (
              <div className="p-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg flex items-center justify-between text-xs">
                <span className="text-[#78716c] font-medium">Estimated Handover Value:</span>
                <span className="font-mono font-bold text-[#16a34a] text-sm">
                  ₹{(parseFloat(transferQuantity) * parseFloat(agreedPrice)).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !selectedBatch}
              className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Confirming Transfer...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm & Hand Over Produce</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Transfer History */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-xl border border-[#bbf7d0] shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-bold text-sm text-[#1c1917]">Recent Transfers</h3>
            <p className="text-xs text-[#78716c]">Your produce currently in transit or delivered to distributors</p>
          </div>

          {transferredBatches.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400 space-y-2">
              <Truck className="w-8 h-8 mx-auto text-stone-300" />
              <p>No transferred crops yet. Use the form on the left to hand over your first batch.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transferredBatches.map(b => (
                <div key={b.id} className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#16a34a]">{b.batchId}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-white text-stone-700 rounded font-medium border border-stone-200">
                      {b.status}
                    </span>
                  </div>
                  <div className="font-semibold text-[#1c1917]">
                    {b.cropName || b.name} ({b.quantity || b.quantityKg} {b.unit || 'kg'})
                  </div>
                  <div className="text-[11px] text-[#78716c]">
                    Handed over at ₹{b.farmgatePrice || b.pricing?.farmerPrice}/kg
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
