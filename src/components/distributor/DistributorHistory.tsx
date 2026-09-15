import React, { useState } from 'react';
import { 
  History, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Truck, 
  Store, 
  CheckCircle2, 
  Calendar,
  IndianRupee,
  Eye,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DistributorHistory: React.FC = () => {
  const { batches, navigate, setSelectedBatchId } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'intake' | 'dispatch'>('all');

  // Build real history from batches
  const historyEvents = batches.flatMap(batch => {
    const events: any[] = [];
    const crop = batch.cropName || batch.name;
    const unit = batch.unit || 'kg';
    const qty = batch.quantityKg || batch.quantity;

    // Intake event
    if (batch.status !== 'Harvested & Tokenized' && batch.status !== 'Ready for Dispatch') {
      events.push({
        id: `${batch.id}-intake`,
        batchId: batch.batchId,
        date: batch.harvestDate || '2026-05-12',
        type: 'Farm Intake',
        party: batch.farmerName,
        role: 'Farmer / Producer',
        crop,
        quantity: `${qty} ${unit}`,
        amount: (batch.pricing?.farmerPrice || batch.farmgatePrice || 40) * qty,
        unitPrice: `₹${batch.pricing?.farmerPrice || batch.farmgatePrice || 40}/${unit}`,
        category: 'intake',
        status: 'Received & Verified'
      });
    }

    // Retail Dispatch event
    if (batch.status === 'In Transit to Retailer' || batch.status === 'Delivered to Retailer' || batch.status === 'On Retail Shelf' || batch.status === 'Sold to Consumer') {
      const wholesalePrice = (batch.pricing?.farmerPrice || batch.farmgatePrice || 40) + (batch.pricing?.distributorLogisticsCost || 20) + (batch.pricing?.distributorMargin || 15);
      events.push({
        id: `${batch.id}-dispatch`,
        batchId: batch.batchId,
        date: '2026-05-16',
        type: 'Retail Dispatch',
        party: batch.currentCustodianName || 'FreshRoot Organics Supermarket',
        role: 'Retail Partner',
        crop,
        quantity: `${qty} ${unit}`,
        amount: wholesalePrice * qty,
        unitPrice: `₹${wholesalePrice}/${unit}`,
        category: 'dispatch',
        status: 'Delivered'
      });
    }

    return events;
  });

  const filtered = historyEvents.filter(ev => {
    const matchesCategory = filterType === 'all' || ev.category === filterType;
    const query = search.toLowerCase();
    const matchesSearch = 
      ev.crop.toLowerCase().includes(query) ||
      ev.batchId.toLowerCase().includes(query) ||
      ev.party.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <History className="w-7 h-7 text-blue-600" />
              <span>Consignment & Trade History</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Audit trail of all farm intake receipts, dock QA clearances, and outbound retail handovers.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/distributor/incoming')}
              className="px-4 py-2 bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Incoming Produce
            </button>
            <button
              onClick={() => navigate('/distributor/inventory')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Current Inventory
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
            placeholder="Search crop, batch ID, counterparty..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-blue-600 outline-none transition text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
              filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterType('intake')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 ${
              filterType === 'intake' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
            <span>Farm Intakes</span>
          </button>
          <button
            onClick={() => setFilterType('dispatch')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 ${
              filterType === 'dispatch' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-500" />
            <span>Retail Dispatches</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No history logs match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Batch ID</th>
                  <th className="py-3.5 px-4">Produce</th>
                  <th className="py-3.5 px-4">Counterparty</th>
                  <th className="py-3.5 px-4">Volume</th>
                  <th className="py-3.5 px-4">Value</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        ev.category === 'intake' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}>
                        {ev.category === 'intake' ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-purple-600" />}
                        <span>{ev.type}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {ev.batchId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {ev.crop}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{ev.party}</div>
                      <div className="text-[11px] text-slate-400">{ev.role}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {ev.quantity}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-900 whitespace-nowrap">
                      <div className="font-bold">₹{ev.amount.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">{ev.unitPrice}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/verify/${ev.batchId}`)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 transition inline-flex items-center cursor-pointer"
                        title="View Full Provenance"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
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
