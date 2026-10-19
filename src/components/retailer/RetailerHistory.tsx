import { BackButton } from '../common/BackButton';
import React, { useState } from 'react';
import { 
  History, 
  Search, 
  ArrowDownLeft, 
  ShoppingCart, 
  Store, 
  Eye, 
  Calendar,
  IndianRupee,
  CheckCircle2,
  Download,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { downloadCsv } from '../../lib/csvExport';

export const RetailerHistory: React.FC = () => {
  const { batches, navigate, setSelectedBatchId } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'receipt' | 'sale'>('all');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Build events
  const historyEvents = batches.flatMap(batch => {
    const events: any[] = [];
    const crop = batch.cropName || batch.name;
    const unit = batch.unit || 'kg';
    const qty = batch.quantityKg || batch.quantity;

    // Delivery receipt event
    if (batch.status === 'On Retail Shelf' || batch.status === 'Delivered to Retailer' || batch.status === 'Sold to Consumer' || batch.status === 'Partially Sold' || batch.currentCustodianRole === 'retailer') {
      const wholesalePrice = (batch.pricing?.farmerPrice || batch.farmgatePrice || 40) + (batch.pricing?.distributorLogisticsCost || 20) + (batch.pricing?.distributorMargin || 15);
      events.push({
        id: `${batch.id}-recv`,
        batchId: batch.batchId,
        date: batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString('en-CA') : '2026-05-16',
        type: 'Delivery Intake',
        party: batch.currentCustodianName || 'Maha-Agro Logistics Fleet',
        role: 'Distributor',
        crop,
        quantity: `${qty} ${unit}`,
        quantityNum: qty,
        unit,
        amount: wholesalePrice * qty,
        unitPriceNum: wholesalePrice,
        unitPrice: `₹${wholesalePrice}/${unit}`,
        category: 'receipt',
        status: 'Stocked on Shelf',
        txHash: batch.blockchain?.txHash || '0x...'
      });
    }

    // Dynamic sales from batch timeline if present
    const posTimelineEvents = (batch.timeline || []).filter(t => t.title?.includes('Point of Sale') || t.stage === 'Consumer');
    if (posTimelineEvents.length > 0) {
      posTimelineEvents.forEach((tl, idx) => {
        const consumerPrice = batch.pricing?.consumerPrice || 120;
        const matchQty = tl.description?.match(/Sold\s+([\d.]+)/i);
        const soldQty = matchQty ? parseFloat(matchQty[1]) : 25;
        events.push({
          id: `${batch.id}-sale-${idx}`,
          batchId: batch.batchId,
          date: tl.timestamp && tl.timestamp.includes('-') ? tl.timestamp : '2026-05-17',
          type: 'Consumer POS Sale',
          party: 'Retail Shopper (Counter POS)',
          role: 'Consumer',
          crop,
          quantity: `${soldQty} ${unit}`,
          quantityNum: soldQty,
          unit,
          amount: consumerPrice * soldQty,
          unitPriceNum: consumerPrice,
          unitPrice: `₹${consumerPrice}/${unit}`,
          category: 'sale',
          status: 'Completed',
          txHash: tl.txHash || batch.blockchain?.txHash || '0x...'
        });
      });
    } else if (batch.status === 'Sold to Consumer' || batch.status === 'Partially Sold') {
      const consumerPrice = batch.pricing?.consumerPrice || 120;
      events.push({
        id: `${batch.id}-sale-default`,
        batchId: batch.batchId,
        date: '2026-05-17',
        type: 'Consumer POS Sale',
        party: 'Rohan Deshmukh (Retail Shopper)',
        role: 'Consumer',
        crop,
        quantity: `25 ${unit}`,
        quantityNum: 25,
        unit,
        amount: consumerPrice * 25,
        unitPriceNum: consumerPrice,
        unitPrice: `₹${consumerPrice}/${unit}`,
        category: 'sale',
        status: 'Completed',
        txHash: batch.blockchain?.txHash || '0x...'
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

  const handleDownloadCsv = () => {
    const recordsToExport = filtered.length > 0 ? filtered : historyEvents;
    if (recordsToExport.length === 0) return;

    downloadCsv({
      filename: `retailer_sales_and_shipments_ledger_${new Date().toISOString().slice(0, 10)}.csv`,
      data: recordsToExport,
      columns: [
        { header: 'Transaction Reference', accessor: (r) => r.id },
        { header: 'Date', accessor: (r) => r.date },
        { header: 'Event Type', accessor: (r) => r.type },
        { header: 'Ledger Category', accessor: (r) => r.category === 'receipt' ? 'Inbound Store Receipt' : 'Consumer Retail Sale' },
        { header: 'Batch ID', accessor: (r) => r.batchId },
        { header: 'Produce Name', accessor: (r) => r.crop },
        { header: 'Quantity (Numeric)', accessor: (r) => r.quantityNum },
        { header: 'Unit of Measure', accessor: (r) => r.unit },
        { header: 'Quantity Volume', accessor: (r) => r.quantity },
        { header: 'Rate Per Unit (INR)', accessor: (r) => r.unitPriceNum },
        { header: 'Total Settlement Value (INR)', accessor: (r) => r.amount },
        { header: 'Counterparty / Customer', accessor: (r) => r.party },
        { header: 'Counterparty Type', accessor: (r) => r.role },
        { header: 'Transaction Status', accessor: (r) => r.status },
        { header: 'Accounting Classification', accessor: (r) => r.category === 'receipt' ? 'COGS - Inbound Wholesale Intake' : 'Sales Revenue - Customer POS' },
        { header: 'Blockchain Verification Hash', accessor: (r) => r.txHash },
      ]
    });

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <BackButton fallback="/retailer/dashboard" />
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <History className="w-7 h-7 text-purple-600" />
              <span>Store Receipts & Sales Ledger</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Complete chronological audit trail of wholesale intake deliveries and customer retail checkout transactions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Download store receipts and sales history as CSV"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-100" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download CSV</span>
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/retailer/inventory')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Store Inventory
            </button>
            <button
              onClick={() => navigate('/retailer/sell')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-xs"
            >
              Record New Sale
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
            placeholder="Search crop, batch ID, customer..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-purple-600 outline-none transition text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
              filterType === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterType('receipt')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 ${
              filterType === 'receipt' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-blue-500" />
            <span>Inbound Receipts</span>
          </button>
          <button
            onClick={() => setFilterType('sale')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 ${
              filterType === 'sale' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-500" />
            <span>Consumer Sales</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="ml-auto sm:ml-2 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Download currently filtered sales and receipts as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No transaction records match your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Batch ID</th>
                  <th className="py-3.5 px-4">Produce</th>
                  <th className="py-3.5 px-4">Counterparty</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        ev.category === 'receipt' 
                          ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {ev.category === 'receipt' ? <ArrowDownLeft className="w-3 h-3 text-blue-600" /> : <ShoppingCart className="w-3 h-3 text-emerald-600" />}
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
