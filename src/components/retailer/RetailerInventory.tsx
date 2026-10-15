import React, { useState } from 'react';
import { 
  Store, 
  Search, 
  DollarSign, 
  ShoppingCart, 
  QrCode, 
  Eye, 
  Package, 
  CheckCircle2,
  Tag,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

export const RetailerInventory: React.FC = () => {
  const { batches, navigate, setSelectedBatchId } = useApp();
  const [search, setSearch] = useState('');

  // Retail inventory: On Retail Shelf, Delivered to Retailer, At Retailer
  const shelfBatches = batches.filter(b => 
    b.status === 'On Retail Shelf' || 
    b.status === 'Delivered to Retailer' || 
    b.status === 'At Retailer' ||
    b.status === 'Partially Sold' ||
    b.currentCustodianRole === 'retailer'
  );

  const filtered = shelfBatches.filter(b => {
    const query = search.toLowerCase();
    return (
      (b.cropName || b.name || '').toLowerCase().includes(query) ||
      (b.batchId || '').toLowerCase().includes(query) ||
      (b.farmerName || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Store className="w-7 h-7 text-purple-600" />
              <span>Retail Store Inventory & Shelf Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Active produce lots displayed on supermarket shelves, tagged with QR codes and transparent consumer pricing.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/retailer/sell')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Record POS Sale</span>
            </button>
            <button
              onClick={() => navigate('/retailer/qr-labels')}
              className="px-4 py-2 bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Shelf QR Tags</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crop, batch ID, farm..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-purple-600 outline-none transition text-slate-900"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} active shelf lots
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No produce lots found in store inventory.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Batch ID</th>
                  <th className="py-3.5 px-4">Produce Details</th>
                  <th className="py-3.5 px-4">Farm Origin</th>
                  <th className="py-3.5 px-4">Shelf Stock</th>
                  <th className="py-3.5 px-4">Wholesale Cost</th>
                  <th className="py-3.5 px-4">Consumer Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(batch => {
                  const crop = batch.cropName || batch.name;
                  const unit = batch.unit || 'kg';
                  const farmerPrice = batch.pricing?.farmerPrice || batch.farmgatePrice || 40;
                  const wholesaleCost = farmerPrice + (batch.pricing?.distributorLogisticsCost || 20) + (batch.pricing?.distributorMargin || 15);
                  const consumerPrice = batch.pricing?.consumerPrice || (wholesaleCost + (batch.pricing?.retailerStoreOverhead || 15) + (batch.pricing?.retailerMargin || 20));

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-700 whitespace-nowrap">
                        {batch.batchId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{crop}</div>
                        {batch.cropVariety && <div className="text-[11px] text-slate-500">{batch.cropVariety}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{batch.farmerName}</div>
                        <div className="text-[11px] text-slate-400">{batch.farmLocation || batch.farmerLocation}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {batch.quantityKg || batch.quantity} {unit}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        ₹{wholesaleCost}/{unit}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-800 whitespace-nowrap">
                        ₹{consumerPrice}/{unit}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg text-[11px]">
                          {batch.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedBatchId(batch.id);
                            navigate('/retailer/set-price');
                          }}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                          title="Set Price"
                        >
                          <Tag className="w-3.5 h-3.5" />
                          <span>Price</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBatchId(batch.id);
                            navigate('/retailer/sell');
                          }}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                          title="Record Sale"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Sell</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBatchId(batch.id);
                            navigate(`/verify/${batch.batchId}`);
                          }}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 transition inline-flex items-center cursor-pointer"
                          title="Inspect Shelf QR"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
