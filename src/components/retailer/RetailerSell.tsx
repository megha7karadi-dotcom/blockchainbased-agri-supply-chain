import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Store, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Receipt, 
  Printer, 
  IndianRupee,
  User,
  Phone,
  Check,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

export const RetailerSell: React.FC = () => {
  const { batches, retailerSellProduce, navigate, selectedBatchId: globalBatchId } = useApp();

  const sellableBatches = batches.filter(b => 
    b.status === 'On Retail Shelf' || 
    b.status === 'Delivered to Retailer' || 
    b.status === 'At Retailer' ||
    b.status === 'Partially Sold' ||
    (b.currentCustodianRole === 'retailer' && (b.quantityKg || b.quantity) > 0)
  );

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    globalBatchId || sellableBatches[0]?.id || ''
  );
  const [sellQuantity, setSellQuantity] = useState<string>('5');
  const [customerName, setCustomerName] = useState<string>('Rohan Deshmukh');
  const [customerPhone, setCustomerPhone] = useState<string>('98201 44829');
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Card' | 'Cash'>('UPI');

  const [isProcessing, setIsProcessing] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState<{
    billNo: string;
    date: string;
    batchId: string;
    cropName: string;
    farmerName: string;
    quantity: number;
    unit: string;
    ratePerUnit: number;
    totalAmount: number;
    customerName: string;
    customerPhone: string;
    paymentMode: string;
  } | null>(null);

  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const selectedBatch = batches.find(b => b.id === selectedBatchId || b.batchId === selectedBatchId) || sellableBatches[0];

  const unit = selectedBatch?.unit || 'kg';
  const farmerPrice = selectedBatch?.pricing?.farmerPrice || selectedBatch?.farmgatePrice || 40;
  const wholesaleCost = farmerPrice + (selectedBatch?.pricing?.distributorLogisticsCost || 20) + (selectedBatch?.pricing?.distributorMargin || 15);
  const consumerRate = selectedBatch?.pricing?.consumerPrice || (wholesaleCost + (selectedBatch?.pricing?.retailerStoreOverhead || 15) + (selectedBatch?.pricing?.retailerMargin || 20));

  const totalBill = (parseFloat(sellQuantity) || 0) * consumerRate;
  const currentStock = selectedBatch?.quantityKg || selectedBatch?.quantity || 0;

  const handleProcessSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setErrorNotice(null);
    const qtyNum = parseFloat(sellQuantity);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorNotice('Please enter a valid sale quantity.');
      return;
    }

    if (qtyNum > currentStock) {
      setErrorNotice(`Insufficient shelf stock. Only ${currentStock} ${unit} available in this batch.`);
      return;
    }

    setIsProcessing(true);

    try {
      await retailerSellProduce(selectedBatch.batchId, qtyNum);

      const receipt = {
        billNo: `INV-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleString(),
        batchId: selectedBatch.batchId,
        cropName: selectedBatch.cropName || selectedBatch.name,
        farmerName: selectedBatch.farmerName,
        quantity: qtyNum,
        unit,
        ratePerUnit: consumerRate,
        totalAmount: qtyNum * consumerRate,
        customerName: customerName.trim() || 'Retail Consumer',
        customerPhone: customerPhone.trim() || 'N/A',
        paymentMode
      };

      setLatestReceipt(receipt);
      setSellQuantity('1');
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to complete point-of-sale transaction.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <ShoppingCart className="w-7 h-7 text-emerald-600" />
              <span>Consumer Point-of-Sale Register</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Record consumer purchases at the store checkout counter. Batch inventory automatically decrements and issues a verified digital invoice.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/retailer/inventory')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Store Inventory
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorNotice && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Checkout Notice</span>
            <span>{errorNotice}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: POS Checkout Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              New Customer Transaction
            </h2>
            <p className="text-xs text-slate-500">
              Select produce lot from shelf, weigh item, and tender payment.
            </p>
          </div>

          <form onSubmit={handleProcessSale} className="space-y-5">
            {/* Batch Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Scan or Select Shelf Batch *
              </label>
              {sellableBatches.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
                  No active stock on shelf. Please receive shipments first.
                </div>
              ) : (
                <select
                  value={selectedBatch?.id || ''}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition font-medium text-slate-900"
                >
                  {sellableBatches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.cropName || b.name} ({b.batchId}) — {b.quantityKg || b.quantity} {b.unit || 'kg'} in stock
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Batch Info */}
            {selectedBatch && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Farm Origin:</span>
                  <span className="font-medium text-slate-800">{selectedBatch.farmerName} • {selectedBatch.farmLocation || selectedBatch.farmerLocation}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Available Shelf Stock:</span>
                  <span className="font-mono font-bold text-slate-900">{currentStock} {unit}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Consumer Retail Rate:</span>
                  <span className="font-mono font-bold text-emerald-800 text-sm">₹{consumerRate} / {unit}</span>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity Purchased ({unit}) *
              </label>
              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                max={currentStock}
                value={sellQuantity}
                onChange={(e) => setSellQuantity(e.target.value)}
                placeholder="e.g. 5"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition font-mono text-slate-900"
              />
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number (for SMS receipt)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="98201 00000"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['UPI', 'Card', 'Cash'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      paymentMode === mode 
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Billing */}
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-900 block">Total Amount Payable</span>
                <span className="text-xs text-slate-600">{sellQuantity} {unit} @ ₹{consumerRate}/{unit}</span>
              </div>
              <div className="text-2xl font-black text-emerald-950 font-mono">
                ₹{totalBill.toLocaleString()}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !selectedBatch || currentStock <= 0}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Recording POS Sale...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Complete Sale & Generate Receipt</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Digital Bill / Receipt Preview */}
        <div className="lg:col-span-5 space-y-6">
          {latestReceipt ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-300 shadow-sm space-y-4 font-mono text-xs">
              <div className="text-center border-b border-dashed border-slate-300 pb-4 space-y-1">
                <h3 className="font-bold text-base text-slate-900 font-sans">FreshRoot Supermarket</h3>
                <p className="text-[11px] text-slate-500">Retail GSTIN: 27AABCF1924L1Z2</p>
                <p className="text-[11px] text-emerald-800 font-bold font-sans">Verified Farm-to-Fork Traceable Produce</p>
              </div>

              <div className="space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Receipt No:</span>
                  <span className="font-bold text-slate-900">{latestReceipt.billNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{latestReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{latestReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Batch Ref:</span>
                  <span className="font-bold text-purple-700">{latestReceipt.batchId}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-3 space-y-2">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{latestReceipt.cropName}</span>
                  <span>₹{latestReceipt.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>{latestReceipt.quantity} {latestReceipt.unit} x ₹{latestReceipt.ratePerUnit}/{latestReceipt.unit}</span>
                  <span>Farm: {latestReceipt.farmerName}</span>
                </div>
              </div>

              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1">
                <span>Total Paid ({latestReceipt.paymentMode}):</span>
                <span>₹{latestReceipt.totalAmount.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => window.print()}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center space-y-3">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">Digital Bill Preview</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Once a checkout transaction is completed, an itemized receipt showing the verified farm origin will appear here.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
