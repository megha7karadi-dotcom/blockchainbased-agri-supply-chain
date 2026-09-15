import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  ArrowRightLeft, 
  BadgePercent, 
  CheckCircle2, 
  Eye, 
  MapPin, 
  Calendar,
  Truck,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

export const DistributorInventory: React.FC = () => {
  const { batches, navigate, setSelectedBatchId } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Distributor inventory: At Distributor, Ready for Dispatch, In Transit
  const inventoryBatches = batches.filter(b => 
    b.status === 'At Distributor' || 
    b.status === 'Ready for Dispatch' || 
    b.status === 'In Transit' ||
    b.currentCustodianRole === 'distributor'
  );

  const filtered = inventoryBatches.filter(b => {
    const statusMatch = statusFilter === 'all' || b.status.toLowerCase() === statusFilter.toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = 
      (b.cropName || b.name || '').toLowerCase().includes(query) ||
      (b.batchId || '').toLowerCase().includes(query) ||
      (b.farmerName || '').toLowerCase().includes(query);
    return statusMatch && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Package className="w-7 h-7 text-blue-600" />
              <span>Distributor Hub Inventory</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Real-time produce stored in your cold rooms and aggregation warehouses, ready for price updates and retail transfers.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/distributor/incoming')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Check Incoming
            </button>
            <button
              onClick={() => navigate('/distributor/transfer-to-retailer')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-xs"
            >
              Transfer to Retailer
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crop, batch ID, farmer..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-blue-600 outline-none transition text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
          <span className="text-slate-400 font-medium mr-1">Status:</span>
          {['all', 'At Distributor', 'Ready for Dispatch'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl transition text-xs font-semibold cursor-pointer ${
                statusFilter.toLowerCase() === st.toLowerCase()
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Inventory' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No produce batches in inventory matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Batch ID</th>
                  <th className="py-3.5 px-4">Produce Details</th>
                  <th className="py-3.5 px-4">Origin Farm</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Purchase Price</th>
                  <th className="py-3.5 px-4">Selling Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(batch => {
                  const cropName = batch.cropName || batch.name;
                  const purchasePrice = batch.pricing?.farmerPrice || batch.farmgatePrice || 0;
                  const logistics = batch.pricing?.distributorLogisticsCost || 0;
                  const margin = batch.pricing?.distributorMargin || 0;
                  const wholesalePrice = purchasePrice + logistics + margin;

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {batch.batchId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{cropName}</div>
                        {batch.cropVariety && <div className="text-[11px] text-slate-500">{batch.cropVariety}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{batch.farmerName}</div>
                        <div className="text-[11px] text-slate-400">{batch.farmLocation || batch.farmerLocation}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {batch.quantityKg || batch.quantity} {batch.unit || 'kg'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        ₹{purchasePrice}/{batch.unit || 'kg'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                        ₹{wholesalePrice}/{batch.unit || 'kg'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg text-[11px]">
                          {batch.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedBatchId(batch.id);
                            navigate('/distributor/update-price');
                          }}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                          title="Update Price"
                        >
                          <BadgePercent className="w-3.5 h-3.5" />
                          <span>Price</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBatchId(batch.id);
                            navigate('/distributor/transfer-to-retailer');
                          }}
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                          title="Transfer to Retailer"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Transfer</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBatchId(batch.id);
                            navigate(`/verify/${batch.batchId}`);
                          }}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 transition inline-flex items-center cursor-pointer"
                          title="View Trace"
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
