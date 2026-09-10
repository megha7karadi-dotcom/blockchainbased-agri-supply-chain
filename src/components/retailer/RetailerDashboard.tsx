import React, { useState } from 'react';
import { 
  Store, 
  Package, 
  TrendingUp, 
  QrCode, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Edit3,
  ShoppingCart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';
import { QRCodeModal } from '../common/QRCodeModal';

export const RetailerDashboard: React.FC = () => {
  const { batches, currentUser, retailerUpdatePrice, retailerSellProduce, setActiveTab, setSelectedBatchId, navigateToVerification } = useApp();

  const [editingPriceBatch, setEditingPriceBatch] = useState<ProduceBatch | null>(null);
  const [newStoreOverhead, setNewStoreOverhead] = useState<number>(15);
  const [newRetailMargin, setNewRetailMargin] = useState<number>(20);
  const [activeQRBatch, setActiveQRBatch] = useState<ProduceBatch | null>(null);

  const retailBatches = batches.filter(b => b.status === 'On Retail Shelf' || b.status === 'Delivered to Retailer' || b.status === 'Sold to Consumer');
  const onShelfBatches = batches.filter(b => b.status === 'On Retail Shelf');

  const totalKg = onShelfBatches.reduce((acc, b) => acc + b.quantityKg, 0);

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceBatch) return;

    retailerUpdatePrice(editingPriceBatch.id, newStoreOverhead, newRetailMargin);
    setEditingPriceBatch(null);
  };

  const handleRecordSale = (batchId: string) => {
    retailerSellProduce(batchId, 25);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span>Retail Node: {currentUser.organization}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Store Manager: {currentUser.name}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            {currentUser.location} • Fair Trade Compliance Node Active
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('retailer-inventory')}
            className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span>Manage Store Stock ({onShelfBatches.length})</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Shelf Produce</span>
            <Store className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{onShelfBatches.length} <span className="text-xs font-normal text-slate-500">lots</span></div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">{totalKg} kg active stock</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Average Freshness Index</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">96.8%</div>
          <div className="text-[11px] text-slate-500 mt-1">Verified cold-chain intake</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Fair Pricing Compliance</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">100%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">All lots within fair ceiling</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Consumer QR Scans</span>
            <QrCode className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">1,240</div>
          <div className="text-[11px] text-slate-500 mt-1">Direct shelf provenance inquiries</div>
        </div>
      </div>

      {/* Store Shelf Inventory */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Store Shelf Produce Lots</h2>
            <p className="text-xs text-slate-500">Live batches tagged with consumer-facing QR barcodes</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Produce Batch</th>
                <th className="py-3 px-3">Stock Available</th>
                <th className="py-3 px-3">Farmer Base</th>
                <th className="py-3 px-3">Distributor Cost</th>
                <th className="py-3 px-3">Retail Shelf Price</th>
                <th className="py-3 px-3">Freshness</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {retailBatches.map(batch => (
                <tr key={batch.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{batch.name}</div>
                    <div className="font-mono text-[10px] text-emerald-700">{batch.batchId}</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{batch.quantityKg} kg</td>
                  <td className="py-3.5 px-3 text-slate-600 font-mono">₹{batch.pricing.farmerPrice}/kg</td>
                  <td className="py-3.5 px-3 text-slate-600 font-mono">
                    ₹{batch.pricing.distributorLogisticsCost + batch.pricing.distributorMargin}/kg
                  </td>
                  <td className="py-3.5 px-3 font-bold text-emerald-700 font-mono text-sm">
                    ₹{batch.pricing.finalConsumerPrice}/kg
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {batch.quality.freshnessScore}% Fresh
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingPriceBatch(batch);
                          setNewStoreOverhead(batch.pricing.retailerOverhead);
                          setNewRetailMargin(batch.pricing.retailerMargin);
                        }}
                        className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                        title="Edit Shelf Price Margin"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveQRBatch(batch)}
                        className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                        title="Display Shelf QR Tag"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRecordSale(batch.id)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-semibold transition"
                        title="Record Customer Checkout"
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
      </div>

      {/* Edit Price Modal */}
      {editingPriceBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Configure Transparent Shelf Pricing</h3>
                <p className="text-xs text-slate-500">{editingPriceBatch.name} ({editingPriceBatch.batchId})</p>
              </div>
              <button onClick={() => setEditingPriceBatch(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handlePriceUpdate} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Farmer Paid:</span>
                  <span className="font-semibold text-slate-800">₹{editingPriceBatch.pricing.farmerPrice}/kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Logistics & Wholesale:</span>
                  <span className="font-semibold text-slate-800">
                    ₹{editingPriceBatch.pricing.distributorLogisticsCost + editingPriceBatch.pricing.distributorMargin}/kg
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                  <span>Regulatory Fair Price Ceiling:</span>
                  <span className="text-purple-700 font-mono">₹{editingPriceBatch.pricing.fairPriceCeiling}/kg</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Store Overhead (₹/kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={newStoreOverhead}
                    onChange={(e) => setNewStoreOverhead(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Retail Margin (₹/kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={newRetailMargin}
                    onChange={(e) => setNewRetailMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              {/* Real-time calculated price */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-950">Calculated Shelf Price:</span>
                <span className="text-xl font-black text-emerald-800 font-mono">
                  ₹{editingPriceBatch.pricing.farmerPrice + editingPriceBatch.pricing.distributorLogisticsCost + editingPriceBatch.pricing.distributorMargin + Number(newStoreOverhead) + Number(newRetailMargin)}/kg
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition"
                >
                  Publish Price to On-Chain QR Tag
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPriceBatch(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
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
