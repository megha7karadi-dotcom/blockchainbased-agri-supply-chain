import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  IndianRupee, 
  Clock, 
  Calendar,
  Building2,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

const DISTRIBUTOR_PARTNERS = [
  { id: 'dist-01', name: 'KisanLogix Cold Fleet Ltd', location: 'Pune Logistics Hub' },
  { id: 'dist-02', name: 'MahaAgro Export Consortium', location: 'Navi Mumbai Cold Hub' },
  { id: 'dist-03', name: 'Sahyadri Agri Logistics Hub', location: 'Nashik Aggregation Center' },
  { id: 'dist-04', name: 'Deccan Fresh Transporters', location: 'Satara Processing Depot' }
];

export const FarmerTransfers: React.FC = () => {
  const { batches, currentUser, farmerTransferToDistributor, navigate } = useApp();

  // Find farmer's batches that can be transferred (Registered or Ready)
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
      setErrorMessage('Please select a batch to transfer.');
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
        setSuccessMessage(`Successfully transferred batch ${selectedBatch.batchId} (${selectedBatch.cropName || selectedBatch.name}) to ${distributorName} at ₹${price}/${selectedBatch.unit || 'kg'}.`);
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
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <ArrowRightLeft className="w-7 h-7 text-emerald-600" />
              <span>Transfer Produce to Distributor</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Dispatch your harvested crops to partner distributors with confirmed quantities and agreed prices.
            </p>
          </div>
          <button
            onClick={() => navigate('/farmer/my-produce')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer self-start sm:self-auto"
          >
            View My Produce
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-900 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Transfer Confirmed!</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Notice</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Transfer Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Initiate Dispatch Shipment</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your crop batch, choose a licensed distributor, and confirm agreed pricing.
            </p>
          </div>

          <form onSubmit={handleConfirmTransfer} className="space-y-5">
            
            {/* 1. Select Batch */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Crop Batch *
              </label>
              {farmerBatches.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
                  You have not registered any produce yet.{' '}
                  <button 
                    type="button" 
                    onClick={() => navigate('/farmer/register-produce')} 
                    className="text-emerald-700 font-bold underline"
                  >
                    Add produce now
                  </button>
                </div>
              ) : (
                <select
                  value={selectedBatch?.id || ''}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition font-medium text-slate-900"
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
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Current Status:</span>
                  <span className="font-bold text-slate-900">{selectedBatch.status}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Farm Origin:</span>
                  <span className="font-medium text-slate-800">{selectedBatch.farmLocation || selectedBatch.farmerLocation}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Harvest Date:</span>
                  <span className="font-mono text-slate-800">{selectedBatch.harvestDate}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Quality Grade:</span>
                  <span className="font-bold text-emerald-800">{selectedBatch.quality?.grade || selectedBatch.qualityGrade || 'Grade A'}</span>
                </div>
              </div>
            )}

            {/* 2. Select Distributor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Destination Distributor *
              </label>
              <select
                value={selectedDistributorId}
                onChange={(e) => setSelectedDistributorId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition font-medium text-slate-900"
              >
                {DISTRIBUTOR_PARTNERS.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.location})
                  </option>
                ))}
                <option value="custom">Other / Enter Name Below</option>
              </select>
            </div>

            {selectedDistributorId === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Distributor or Logistics Name *
                </label>
                <input
                  type="text"
                  required
                  value={customDistributorName}
                  onChange={(e) => setCustomDistributorName(e.target.value)}
                  placeholder="e.g. Pune Fresh Agro Logistics"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition text-slate-900"
                />
              </div>
            )}

            {/* 3. Quantity & Agreed Price */}
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
                  placeholder="1000"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Agreed Selling Price (₹ / {selectedBatch?.unit || 'kg'}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(e.target.value)}
                    placeholder="110"
                    className="w-full pl-8 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Total Settlement */}
            {transferQuantity && agreedPrice && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-800 block">Total Agreed Shipment Value</span>
                  <span className="text-xs text-slate-600">Payable to your registered bank / account</span>
                </div>
                <div className="text-xl font-black text-emerald-950 font-mono">
                  ₹{(parseFloat(transferQuantity) * parseFloat(agreedPrice) || 0).toLocaleString()}
                </div>
              </div>
            )}

            {/* Confirm Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedBatch}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Recording Transfer...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm and Transfer to Distributor</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Quick Instructions & Trust */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>How Transfers Work</span>
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                <span><strong>Instant Batch Record:</strong> Your batch status updates to "Transferred to Distributor" across the platform.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                <span><strong>Distributor Verification:</strong> The distributor receives the shipment in their portal and accepts the lot after weight and quality verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                <span><strong>Unchanged Origin Data:</strong> Your name, farm location, harvest date, and agreed price remain permanently tied to this batch.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Transferred Batches History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <span>Recent Dispatch & Transfer Records</span>
        </h2>

        {transferredBatches.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No transfers recorded yet. When you transfer produce, the history will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3">Batch ID</th>
                  <th className="py-3 px-3">Crop Name</th>
                  <th className="py-3 px-3">Current Custodian</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Agreed Price</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transferredBatches.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-800">{b.batchId}</td>
                    <td className="py-3.5 px-3 font-medium text-slate-900">{b.cropName || b.name}</td>
                    <td className="py-3.5 px-3 text-slate-700">{b.currentCustodianName || 'Distributor'}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-800">{b.quantityKg || b.quantity} {b.unit || 'kg'}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-900">₹{b.pricing?.farmerPrice || b.farmgatePrice || 0}/{b.unit || 'kg'}</td>
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
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
