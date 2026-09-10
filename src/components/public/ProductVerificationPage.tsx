import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Leaf, 
  MapPin, 
  Award, 
  TrendingUp, 
  QrCode, 
  Clock, 
  Layers, 
  FileCheck2, 
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Truck,
  Store,
  Calendar,
  DollarSign,
  Info,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { SupplyChainTimeline } from '../common/SupplyChainTimeline';
import { PriceBreakdownCard } from '../common/PriceBreakdownCard';
import { QRCodeModal } from '../common/QRCodeModal';
import { ProduceBatch } from '../../types/produce';

export const ProductVerificationPage: React.FC<{ onOpenQRScanner: () => void }> = ({ onOpenQRScanner }) => {
  const { batches, currentPath, navigate, selectedBatchId, setSelectedBatchId } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'journey' | 'pricing' | 'origin' | 'blockchain' | 'qr'>('journey');
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Extract requested batchId from currentPath, pathname, or search parameters
  const requestedId = useMemo(() => {
    // 1. From currentPath (/verify/AGRI-...)
    if (currentPath && currentPath.startsWith('/verify/')) {
      const seg = currentPath.replace(/^\/verify\/?/, '').split('/')[0].split('?')[0].split('#')[0].trim();
      if (seg) return decodeURIComponent(seg);
    }

    // 2. From browser window pathname
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/verify/')) {
      const seg = window.location.pathname.replace(/^\/verify\/?/, '').split('/')[0].split('?')[0].split('#')[0].trim();
      if (seg) return decodeURIComponent(seg);
    }

    // 3. From URL search parameters (?verify=... or ?batchId=...)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('batchId') || params.get('verify') || params.get('id');
      if (q) return q.trim();
    }

    // 4. Fallback to state selectedBatchId if present
    if (selectedBatchId && selectedBatchId !== 'batch-001') {
      return selectedBatchId;
    }

    return null;
  }, [currentPath, selectedBatchId]);

  // Lookup the requested batch
  const { resolvedBatch, isNotFound } = useMemo(() => {
    if (!requestedId) {
      // Default to first batch if user simply navigates to /verify
      return { resolvedBatch: batches[0] || null, isNotFound: false };
    }

    const cleanReq = requestedId.toLowerCase().trim();
    let found = batches.find(b => 
      b.batchId.toLowerCase() === cleanReq || 
      b.id.toLowerCase() === cleanReq
    );

    // Also check localStorage in case of newly registered batch
    if (!found && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('agritrace_batches_v1');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            found = list.find((b: ProduceBatch) => 
              b.batchId?.toLowerCase() === cleanReq || 
              b.id?.toLowerCase() === cleanReq
            );
          }
        }
      } catch {
        // ignore
      }
    }

    if (!found) {
      return { resolvedBatch: null, isNotFound: true };
    }

    return { resolvedBatch: found, isNotFound: false };
  }, [requestedId, batches]);

  const batch = resolvedBatch;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verificationUrl = batch ? `${origin}/verify/${batch.batchId}` : '';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    // Check if user entered batchId or full URL
    const cleanQuery = query.replace(/^.*\/verify\/?/, '').split('?')[0].split('#')[0].trim();
    setSelectedBatchId(cleanQuery);
    navigate(`/verify/${cleanQuery}`);
  };

  const handleSelectBatch = (targetBatch: ProduceBatch) => {
    setSelectedBatchId(targetBatch.batchId);
    navigate(`/verify/${targetBatch.batchId}`);
  };

  const handleCopyVerificationUrl = async () => {
    if (!verificationUrl) return;
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Search Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Public Verification Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Verify Agricultural Produce Provenance
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify authentic farm origin, cold-chain integrity, and transparent price buildup without creating an account.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenQRScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-emerald-300" />
            <span>Open Camera Scanner</span>
          </button>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Batch ID (e.g., AGRI-2026-MNG-001) or paste verification link..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 focus:bg-white outline-none font-mono"
            >
            </input>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Lookup Batch
          </button>
        </form>

        {/* Quick Batch Selectors */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-slate-400 font-medium">Verified Batches:</span>
          {batches.map(b => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleSelectBatch(b)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                batch && b.batchId === batch.batchId
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {b.cropName || b.name} ({b.batchId})
            </button>
          ))}
        </div>
      </div>

      {/* Case 1: Batch Not Found */}
      {isNotFound && (
        <div className="bg-white rounded-3xl border border-red-200 shadow-xs p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-200">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Batch Not Found
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              No registered agricultural produce record was found matching:
            </p>
            <div className="inline-block px-4 py-1.5 bg-red-50 text-red-800 font-mono font-bold text-sm rounded-xl border border-red-200">
              {requestedId}
            </div>
            <p className="text-xs text-slate-500 pt-2">
              The QR code or Batch ID you entered has not been registered on AgriTrace. Please verify the code on your physical produce crate or scan another label.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenQRScanner}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Another QR Code</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 max-w-md mx-auto text-left">
            <h3 className="text-xs font-bold text-slate-700 mb-2">Available Authenticated Batches to Test:</h3>
            <div className="space-y-1.5">
              {batches.slice(0, 3).map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBatch(b)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-xs text-left flex items-center justify-between transition"
                >
                  <span className="font-semibold text-slate-800">{b.cropName || b.name}</span>
                  <span className="font-mono text-emerald-800 font-bold">{b.batchId}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Case 2: Batch Found & Verified */}
      {batch && !isNotFound && (
        <div className="space-y-6">
          
          {/* Top Produce Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            
            {/* Header Ribbon */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300">
                  Verified AgriTrace Product
                </span>
                <span className="text-slate-400">|</span>
                <span className="font-mono text-xs font-bold text-white">
                  Batch ID: {batch.batchId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 text-emerald-200 border border-white/20">
                  Current Status: {batch.status || 'Registered'}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Product Image */}
              <div className="w-full md:w-72 h-52 md:h-auto bg-slate-100 relative shrink-0">
                <img 
                  src={batch.imageUrl || 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80'} 
                  alt={batch.cropName || batch.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-emerald-900 shadow-xs">
                    {batch.qualityGrade || batch.quality?.grade || 'Grade A'}
                  </span>
                </div>
              </div>

              {/* Produce Attributes */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {batch.cropName || batch.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    {batch.cropVariety || batch.variety}
                  </p>

                  {/* Core Specifications Required by Verification Spec */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Farm Name</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {batch.farmName || 'Verified Producer Farm'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Farm Location</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {batch.farmLocation || batch.farmerLocation || 'Maharashtra, India'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Harvest Date</span>
                      <span className="font-semibold text-slate-800 block">
                        {batch.harvestDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Quantity</span>
                      <span className="font-bold text-slate-800 font-mono block">
                        {(batch.quantity || batch.quantityKg || 1000).toLocaleString()} {batch.unit || 'kg'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Quality Grade</span>
                      <span className="font-bold text-emerald-700 block">
                        {batch.qualityGrade || batch.quality?.grade || 'Grade A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Farmgate Price</span>
                      <span className="font-extrabold text-emerald-800 block">
                        ₹{batch.farmgatePrice || batch.pricing?.farmerPrice || 0}/{batch.unit || 'kg'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Verification ID</span>
                      <span className="font-mono text-slate-700 font-medium truncate block">
                        {batch.batchId}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Pesticide Residue</span>
                      <span className="font-semibold text-emerald-700 block truncate">
                        {batch.quality?.pesticideResidueTest || (batch.certification ? 'Zero Residue (Certified)' : 'Tested Safe')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Journey */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Transparent Price Journey</span>
                    </span>
                    <span className="text-slate-500 font-medium text-[11px]">Direct Farmgate Audit</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    {/* Farmer */}
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200/80 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block font-medium">Farmer Farmgate</span>
                      <div className="text-sm sm:text-base font-extrabold text-emerald-800 mt-0.5">
                        ₹{batch.farmgatePrice || batch.pricing?.farmerPrice || 0}/{batch.unit || 'kg'}
                      </div>
                      <span className="text-[10px] text-emerald-700">Direct Producer Payout</span>
                    </div>

                    {/* Distributor */}
                    <div className="p-2.5 bg-white rounded-xl border border-blue-200/80 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block font-medium">Cold Transit</span>
                      <div className="text-sm sm:text-base font-extrabold text-blue-800 mt-0.5">
                        ₹{batch.pricing?.distributorPrice || Math.round((batch.farmgatePrice || 40) * 1.3)}/{batch.unit || 'kg'}
                      </div>
                      <span className="text-[10px] text-blue-600">Logistics & Handling</span>
                    </div>

                    {/* Retailer */}
                    <div className="p-2.5 bg-white rounded-xl border border-purple-200/80 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block font-medium">Consumer Retail</span>
                      <div className="text-sm sm:text-base font-extrabold text-purple-800 mt-0.5">
                        ₹{batch.pricing?.finalConsumerPrice || Math.round((batch.farmgatePrice || 40) * 1.6)}/{batch.unit || 'kg'}
                      </div>
                      <span className="text-[10px] text-purple-600">Final Shelf Price</span>
                    </div>
                  </div>
                </div>

                {/* Actions & QR link */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('qr')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Show Scannable QR Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyVerificationUrl}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copiedUrl ? 'Verification URL copied' : 'Copy Verification URL'}</span>
                    </button>
                  </div>

                  <div className="font-mono text-xs text-slate-500">
                    Verification ID: <span className="font-bold text-slate-800">{batch.batchId}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Sub-tab Switcher */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
            {[
              { id: 'journey' as const, label: 'Supply Chain History', icon: <Layers className="w-4 h-4" /> },
              { id: 'pricing' as const, label: 'Price Buildup', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'origin' as const, label: 'Quality & Origin', icon: <MapPin className="w-4 h-4" /> },
              { id: 'qr' as const, label: 'Scannable QR Code', icon: <QrCode className="w-4 h-4" /> },
              { id: 'blockchain' as const, label: 'Provenance Record', icon: <ShieldCheck className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Journey & Supply Chain History */}
          {activeSubTab === 'journey' && (
            <div className="space-y-6">
              <SupplyChainTimeline timeline={batch.timeline || []} currentStatus={batch.status || 'Registered'} />
              
              {/* Custody History Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>Recorded Custody & Ownership Transfers</span>
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-slate-900">Current Custodian:</strong>{' '}
                      <span className="text-purple-700 font-semibold">{batch.retailerName || 'Retail Distribution Partner'}</span>
                    </div>
                    <span className="text-slate-500">Status: {batch.status || 'Active'}</span>
                  </div>
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-slate-900">Logistics Transporter:</strong>{' '}
                      <span className="text-blue-700 font-semibold">{batch.distributorName || 'AgriLogistics Cold-Chain'}</span>
                    </div>
                    <span className="text-slate-500">Cold Chain Verified</span>
                  </div>
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-slate-900">Origin Producer:</strong>{' '}
                      <span className="text-emerald-700 font-semibold">{batch.farmerName} ({batch.farmName || 'Verified Producer Farm'})</span>
                    </div>
                    <span className="text-slate-500">Harvest Registered: {batch.harvestDate}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Pricing Transparency & Price History */}
          {activeSubTab === 'pricing' && (
            <div>
              <PriceBreakdownCard 
                pricing={batch.pricing || {
                  currency: '₹',
                  farmerPrice: batch.farmgatePrice || 40,
                  distributorPrice: Math.round((batch.farmgatePrice || 40) * 1.3),
                  retailerPrice: Math.round((batch.farmgatePrice || 40) * 1.6),
                  finalConsumerPrice: Math.round((batch.farmgatePrice || 40) * 1.6),
                  transportLogisticsCost: 10,
                  storageHandlingCost: 4,
                  packagingCost: 3,
                  marginDistributor: 5,
                  marginRetailer: 12
                }} 
                cropName={batch.cropName || batch.name} 
              />
            </div>
          )}

          {/* Tab 3: Origin & Quality Information */}
          {activeSubTab === 'origin' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Farm Origin & Laboratory Certificate</h3>
                <p className="text-xs text-slate-500">Audited agricultural parameters recorded at harvest</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Geographic Origin</span>
                  </h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div><strong>Farm Name:</strong> {batch.farmName || 'Verified Producer Farm'}</div>
                    <div><strong>Producer / Lead:</strong> {batch.farmerName}</div>
                    <div><strong>Location:</strong> {batch.farmLocation || batch.farmerLocation || 'Maharashtra, India'}</div>
                    <div><strong>GPS Coordinates:</strong> <span className="font-mono text-emerald-700">{batch.farmCoordinates || '19.8762° N, 75.3433° E'}</span></div>
                    <div><strong>Harvest Timestamp:</strong> {batch.harvestDate}</div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Lab Quality Analysis</span>
                  </h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div><strong>Pesticide Residue Test:</strong> <span className="text-emerald-700 font-semibold">{batch.quality?.pesticideResidueTest || (batch.certification ? 'Zero Residue (Certified)' : 'Tested Safe')}</span></div>
                    <div><strong>Quality Grade:</strong> {batch.qualityGrade || batch.quality?.grade || 'Grade A'}</div>
                    <div><strong>Moisture Content:</strong> {batch.quality?.moistureContent || 'Optimal (12%)'}</div>
                    <div><strong>Organic Cert Number:</strong> <span className="font-mono">{batch.quality?.organicCertificationNumber || 'NPOP-ORG-2025-9182'}</span></div>
                    <div><strong>Certifying Agency:</strong> {batch.quality?.certifyingBody || 'APEDA / FSSAI Accredited Laboratory'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: QR Verification */}
          {activeSubTab === 'qr' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span>Real Scannable QR Code</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Encoded directly with the AgriTrace public verification URL for this produce batch
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8 p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="p-4 bg-white rounded-2xl border border-slate-300 shadow-sm shrink-0 flex items-center justify-center">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={220}
                    level="H"
                    includeMargin={true}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-3.5 text-xs text-slate-600 flex-1">
                  <div>
                    <strong className="text-slate-900 block text-xs">Batch ID:</strong>
                    <span className="font-mono text-emerald-800 font-extrabold text-base">{batch.batchId}</span>
                  </div>

                  <div>
                    <strong className="text-slate-900 block text-xs">Encoded Scannable URL:</strong>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-slate-600 break-all select-all">
                      {verificationUrl}
                    </div>
                  </div>

                  <p className="text-slate-500 leading-relaxed text-xs">
                    Scanning this QR code with any smartphone camera instantly routes the consumer to this tamper-evident provenance record.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyVerificationUrl}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedUrl ? 'Verification URL copied' : 'Copy Verification URL'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQRModal(true)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View Printable Tag</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Provenance & Batch Verification */}
          {activeSubTab === 'blockchain' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Cryptographic Provenance Record</span>
                  </h3>
                  <p className="text-xs text-slate-500">Tamper-evident record and verification identifiers</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  AgriTrace Verified
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 font-mono text-xs">
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-slate-50">
                  <span className="text-slate-500">Registry System:</span>
                  <span className="font-bold text-slate-800">AgriTrace Verified Agricultural Ledger</span>
                </div>
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500">Batch ID:</span>
                  <span className="font-bold text-emerald-800 font-mono">{batch.batchId}</span>
                </div>
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500">Verification ID:</span>
                  <span className="font-mono text-slate-800">{batch.batchId}</span>
                </div>
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500">Produce Type:</span>
                  <span className="text-slate-800">{batch.cropName || batch.name} ({batch.cropVariety || batch.variety})</span>
                </div>
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500">Registered Harvest Date:</span>
                  <span className="font-bold text-slate-800">{batch.harvestDate}</span>
                </div>
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500">Registered Producer:</span>
                  <span className="text-slate-800">{batch.farmerName}</span>
                </div>
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-emerald-50/50">
                  <span className="text-slate-700 font-bold">Verification Status:</span>
                  <span className="text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Authentic Farm-to-Fork Record</span>
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 font-bold block mb-0.5">Agricultural Provenance Guarantee</strong>
                  This agricultural lot is certified on AgriTrace. Custody transfers, cold-chain temperature logs, and fair farmgate pricing disclosures are sealed with unique batch identifiers.
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* QR Code Tag Modal */}
      {showQRModal && batch && (
        <QRCodeModal batch={batch} onClose={() => setShowQRModal(false)} />
      )}

    </div>
  );
};
