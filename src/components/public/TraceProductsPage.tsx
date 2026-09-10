import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  QrCode, 
  ArrowRight,
  TrendingUp,
  Tag,
  Leaf
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch, ProduceCategory } from '../../types/produce';
import { QRCodeModal } from '../common/QRCodeModal';

interface Props {
  onOpenQRScanner: () => void;
}

export const TraceProductsPage: React.FC<Props> = ({ onOpenQRScanner }) => {
  const { batches, navigateToVerification } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBatchForQR, setSelectedBatchForQR] = useState<ProduceBatch | null>(null);

  const categories = ['All', 'Fruits', 'Vegetables', 'Grains'];

  const filteredBatches = batches.filter(batch => {
    const batchName = batch.name || batch.cropName || '';
    const batchId = batch.batchId || '';
    const batchLoc = batch.farmerLocation || batch.farmLocation || '';
    const batchFarmer = batch.farmerName || '';

    const matchesSearch = 
      batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batchLoc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batchFarmer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || batch.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
          <span>Public Traceability Registry</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trace Verified Produce Batches
            </h1>
            <p className="text-slate-600 text-sm mt-2 max-w-2xl leading-relaxed">
              Explore agricultural lots registered on the AgriTrace decentralized ledger. Every batch contains verified farm origin, transparent pricing steps, cold-chain temperature logs, and cryptographic custody records.
            </p>
          </div>
          <button
            onClick={onOpenQRScanner}
            className="self-start md:self-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Scan Packaging QR</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop, batch ID (e.g. AGRI-2026-MNG-001), farmer, or region..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-emerald-600 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong className="text-slate-800">{filteredBatches.length}</strong> verified agricultural batches</span>
        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ethereum Sepolia Audited</span>
        </span>
      </div>

      {/* Batches Grid */}
      {filteredBatches.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No matching produce batches found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for "Mango", "Basmati", "Tomato", or "Turmeric", or clear your filter.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="px-4 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl hover:bg-emerald-100 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map(batch => {
            const farmerSharePct = Math.round((batch.pricing.farmerPrice / batch.pricing.finalConsumerPrice) * 100);

            return (
              <div 
                key={batch.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition duration-200 flex flex-col overflow-hidden group"
              >
                {/* Image & Badges */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img 
                    src={batch.imageUrl} 
                    alt={batch.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

                  <div className="absolute top-3 left-3">
                    <span className="font-mono text-[11px] font-bold bg-white/95 text-slate-900 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-xs">
                      {batch.batchId}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
                        {batch.category}
                      </span>
                      <h3 className="font-bold text-base leading-tight drop-shadow-xs">
                        {batch.name}
                      </h3>
                      <p className="text-xs text-slate-200 drop-shadow-xs">{batch.variety}</p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  
                  {/* Origin & Harvest Info */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{batch.farmerLocation || batch.farmLocation || 'Local Farm'}</span>
                      </span>
                      <span className="font-medium text-slate-800">{batch.farmName || 'Verified Orchard'}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Harvest: {batch.harvestDate}</span>
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                        {(batch.quality?.grade || 'Grade A').split(' ')[0]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-100">
                      <span>Current Custody:</span>
                      <span className="font-semibold text-slate-800 capitalize bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {batch.status}
                      </span>
                    </div>
                  </div>

                  {/* Price Transparency Metric */}
                  <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Farmgate Price:</span>
                      <span className="font-bold text-emerald-800">
                        {batch.pricing.currency}{batch.pricing.farmerPrice.toFixed(2)}/kg
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Retail Shelf Price:</span>
                      <span className="font-bold text-slate-900">
                        {batch.pricing.currency}{batch.pricing.finalConsumerPrice.toFixed(2)}/kg
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-200/50">
                      <span className="text-emerald-700 font-medium">Farmer Revenue Share:</span>
                      <span className="font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                        {farmerSharePct}% of retail
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => navigateToVerification(batch.id)}
                      className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Verify Provenance</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => setSelectedBatchForQR(batch)}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                      title="View Packaging QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Tag Modal */}
      {selectedBatchForQR && (
        <QRCodeModal 
          batch={selectedBatchForQR} 
          onClose={() => setSelectedBatchForQR(null)} 
        />
      )}

    </div>
  );
};
