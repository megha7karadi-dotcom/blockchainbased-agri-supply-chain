import React, { useState } from 'react';
import { 
  Store, 
  Package, 
  QrCode, 
  CheckCircle2, 
  Edit3,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Scale
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';
import { QRCodeModal } from '../common/QRCodeModal';

export const RetailerDashboard: React.FC = () => {
  const { batches, currentUser, retailerUpdatePrice, retailerSellProduce, setActiveTab, navigate } = useApp();

  const [editingPriceBatch, setEditingPriceBatch] = useState<ProduceBatch | null>(null);
  const [newStoreOverhead, setNewStoreOverhead] = useState<number>(15);
  const [newRetailMargin, setNewRetailMargin] = useState<number>(20);
  const [activeQRBatch, setActiveQRBatch] = useState<ProduceBatch | null>(null);
  const [saleNotice, setSaleNotice] = useState<string | null>(null);

  const retailBatches = batches.filter(b => b.status === 'On Retail Shelf' || b.status === 'Delivered to Retailer' || b.status === 'Sold to Consumer');
  const onShelfBatches = batches.filter(b => b.status === 'On Retail Shelf');

  const totalKg = onShelfBatches.reduce((acc, b) => acc + (b.quantityKg || b.quantity || 0), 0);

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceBatch) return;

    retailerUpdatePrice(editingPriceBatch.id, newStoreOverhead, newRetailMargin);
    setEditingPriceBatch(null);
  };

  const handleRecordSale = (batchId: string, batchName: string) => {
    retailerSellProduce(batchId, 25);
    setSaleNotice(`Recorded 25 kg checkout sale for ${batchName}. Inventory updated.`);
    setTimeout(() => setSaleNotice(null), 4000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      
      {/* 1. STORE NODE HEADER & ACTIONS */}
      <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                Retail Distribution Point
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              {currentUser?.name || 'FreshRoot Organics Market'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              {currentUser?.location || 'Bandra West, Mumbai'} • <span className="text-stone-500">Fair Price Ceiling Verified</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/retailer/inventory')}
              className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-xs sm:text-sm rounded-md transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Shelf Inventory ({onShelfBatches.length})</span>
            </button>
            <button
              onClick={() => navigate('/retailer/incoming')}
              className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Store className="w-4 h-4 text-emerald-700" />
              <span>Incoming Shipments</span>
            </button>
            <button
              onClick={() => navigate('/retailer/qr-labels')}
              className="px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-800" />
              <span>Print Shelf Labels</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sale Toast Notice */}
      {saleNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-md flex items-center justify-between gap-3 text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>{saleNotice}</span>
          </div>
          <button 
            type="button"
            onClick={() => setSaleNotice(null)} 
            className="text-emerald-850 hover:text-emerald-950 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. OPERATIONAL STORE METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Active Shelf Stock</div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">{onShelfBatches.length} <span className="text-xs font-sans text-stone-500 font-normal">lots</span></div>
          <div className="text-[11px] text-stone-500 mt-0.5">{totalKg} kg on sales floor</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Freshness Index</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1 font-mono">96.8%</div>
          <div className="text-[11px] text-stone-500 mt-0.5">Cold intake compliance verified</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Fair Margin Compliance</div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">100%</div>
          <div className="text-[11px] text-emerald-800 font-medium mt-0.5">Within APEDA fair ceiling rule</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Consumer QR Scans</div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">1,240</div>
          <div className="text-[11px] text-stone-500 mt-0.5">Verified on-shelf audits</div>
        </div>
      </div>

      {/* 3. STORE SHELF PRODUCE LOTS (TABLE) */}
      <section className="bg-white rounded-lg border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Current Store Shelf Inventory</h2>
            <p className="text-xs text-stone-500">Live commodity lots verified with farmgate payouts, logistic marks, and final retail prices</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/retailer/inventory')}
            className="text-xs font-semibold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Full retail inventory view</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4 text-right">Available Stock</th>
                <th className="py-3 px-4 text-right">Farmer Base</th>
                <th className="py-3 px-4 text-right">Logistics Added</th>
                <th className="py-3 px-4 text-right">Retail Shelf Price</th>
                <th className="py-3 px-4 text-center">Freshness</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {retailBatches.map(batch => (
                <tr key={batch.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                    {batch.batchId}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-900">{batch.name}</div>
                    <div className="text-[11px] text-stone-500">{batch.farmerLocation || 'Origin Farm'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold whitespace-nowrap">
                    {batch.quantityKg || batch.quantity} kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-stone-700 whitespace-nowrap">
                    ₹{batch.pricing.farmerPrice}/kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-stone-600 whitespace-nowrap">
                    ₹{batch.pricing.distributorLogisticsCost + batch.pricing.distributorMargin}/kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-950 whitespace-nowrap text-sm">
                    ₹{batch.pricing.finalConsumerPrice}/kg
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300">
                      {batch.quality.freshnessScore}% Fresh
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPriceBatch(batch);
                          setNewStoreOverhead(batch.pricing.retailerOverhead);
                          setNewRetailMargin(batch.pricing.retailerMargin);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded text-[11px] font-medium transition cursor-pointer"
                        title="Adjust margin & overhead"
                      >
                        Adjust Price
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveQRBatch(batch)}
                        className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                        title="View shelf QR"
                      >
                        <QrCode className="w-3 h-3 text-emerald-700" />
                        <span>QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRecordSale(batch.id, batch.name)}
                        className="px-3 py-1 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-[11px] font-semibold transition cursor-pointer"
                        title="Record 25kg checkout"
                      >
                        Record Sale
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. CONFIGURE SHELF PRICING MODAL */}
      {editingPriceBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full border border-stone-200 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Configure Shelf Pricing</h3>
                <p className="text-xs text-stone-500">{editingPriceBatch.name} • Batch ID: {editingPriceBatch.batchId}</p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingPriceBatch(null)} 
                className="w-7 h-7 rounded bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePriceUpdate} className="space-y-4 text-xs">
              <div className="p-3 bg-stone-50 rounded border border-stone-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-600">Farmer Paid:</span>
                  <span className="font-semibold text-stone-900 font-mono">₹{editingPriceBatch.pricing.farmerPrice}/kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Logistics & Wholesale Added:</span>
                  <span className="font-semibold text-stone-900 font-mono">
                    ₹{editingPriceBatch.pricing.distributorLogisticsCost + editingPriceBatch.pricing.distributorMargin}/kg
                  </span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-1 font-bold text-stone-900">
                  <span>Regulatory Fair Price Ceiling:</span>
                  <span className="text-emerald-950 font-mono">₹{editingPriceBatch.pricing.fairPriceCeiling}/kg</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Store Overhead (₹/kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={newStoreOverhead}
                    onChange={(e) => setNewStoreOverhead(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono outline-none focus:bg-white focus:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Retail Margin (₹/kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={newRetailMargin}
                    onChange={(e) => setNewRetailMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono outline-none focus:bg-white focus:border-emerald-800"
                  />
                </div>
              </div>

              {/* Real-time calculated price */}
              <div className="p-3 bg-stone-50 rounded border border-stone-200 flex justify-between items-center">
                <span className="text-xs font-semibold text-stone-700">Calculated Shelf Price:</span>
                <span className="text-lg font-bold text-emerald-950 font-mono">
                  ₹{editingPriceBatch.pricing.farmerPrice + editingPriceBatch.pricing.distributorLogisticsCost + editingPriceBatch.pricing.distributorMargin + Number(newStoreOverhead) + Number(newRetailMargin)}/kg
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded transition cursor-pointer shadow-xs"
                >
                  Publish Price to Shelf QR
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPriceBatch(null)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {activeQRBatch && (
        <QRCodeModal batch={activeQRBatch} onClose={() => setActiveQRBatch(null)} />
      )}

    </div>
  );
};
