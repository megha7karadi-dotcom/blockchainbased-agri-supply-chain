import React, { useState } from 'react';
import { 
  QrCode, 
  Printer, 
  Store, 
  Tag, 
  ShieldCheck, 
  Eye, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';

export const RetailerQRLabels: React.FC = () => {
  const { batches, navigate, selectedBatchId: globalBatchId } = useApp();

  const shelfBatches = batches.filter(b => 
    b.status === 'On Retail Shelf' || 
    b.status === 'Delivered to Retailer' || 
    b.status === 'At Retailer' ||
    b.status === 'Partially Sold' ||
    b.currentCustodianRole === 'retailer'
  );

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    globalBatchId || shelfBatches[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);

  const selectedBatch = batches.find(b => b.id === selectedBatchId || b.batchId === selectedBatchId) || shelfBatches[0] || batches[0];

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verificationUrl = `${origin}/verify/${selectedBatch?.batchId || ''}`;

  const unit = selectedBatch?.unit || 'kg';
  const farmerPrice = selectedBatch?.pricing?.farmerPrice || selectedBatch?.farmgatePrice || 40;
  const distributorPrice = (selectedBatch?.pricing?.distributorLogisticsCost || 20) + (selectedBatch?.pricing?.distributorMargin || 15);
  const retailerPrice = (selectedBatch?.pricing?.retailerStoreOverhead || 15) + (selectedBatch?.pricing?.retailerMargin || 20);
  const consumerPrice = selectedBatch?.pricing?.consumerPrice || (farmerPrice + distributorPrice + retailerPrice);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <QrCode className="w-7 h-7 text-purple-600" />
            <span>Produce Shelf QR & Price Barcode Generator</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Print standard grocery shelf edge tags encoding live product provenance and itemized price breakdown for shoppers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/verify/${selectedBatch?.batchId}`)}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4 text-purple-700" />
            <span>Preview Scan Page</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Shelf Tag</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Selector */}
        <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Select Shelf Produce</label>
            <select
              value={selectedBatch?.id || ''}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-purple-600 outline-none font-medium text-slate-800"
            >
              {shelfBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.cropName || b.name} — {b.batchId}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-600">
            <div className="font-bold text-slate-900">Shelf Label Specs</div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Meets standard supermarket 4" x 3" electronic and adhesive shelf-talker standards. Contains verifiable batch URL, APMC quality certificate, and transparent farmer share.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCopy}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Verification URL Copied' : 'Copy Verification URL'}</span>
            </button>
          </div>
        </div>

        {/* Right: Shelf Tag Preview */}
        <div className="md:col-span-8 flex justify-center">
          {selectedBatch && (
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-lg space-y-5">
              
              {/* Store & Quality Top Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                  <span className="font-extrabold text-xs tracking-wider uppercase text-slate-900">AgriTrace Verified Organic</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  {selectedBatch.batchId}
                </span>
              </div>

              {/* Crop & Origin */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {selectedBatch.cropName || selectedBatch.name}
                </h2>
                {selectedBatch.cropVariety && (
                  <span className="text-xs text-slate-500 font-medium">{selectedBatch.cropVariety} • {selectedBatch.qualityGrade || 'Grade A'}</span>
                )}
                <div className="text-xs text-slate-600 mt-1">
                  Farm: <strong>{selectedBatch.farmerName}</strong> ({selectedBatch.farmLocation || selectedBatch.farmerLocation})
                </div>
              </div>

              {/* Main Price & QR Code Grid */}
              <div className="grid grid-cols-2 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Retail Price</span>
                  <div className="text-3xl font-black text-slate-900 font-mono">
                    ₹{consumerPrice}
                    <span className="text-xs font-semibold text-slate-500 ml-0.5">/{unit}</span>
                  </div>
                  <div className="text-[10px] text-emerald-800 font-bold mt-1">
                    Farmer receives ₹{farmerPrice}/{unit} ({(farmerPrice / (consumerPrice || 1) * 100).toFixed(0)}%)
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-slate-300">
                  <QRCodeSVG 
                    value={verificationUrl}
                    size={110}
                    level="H"
                    includeMargin={false}
                  />
                  <span className="text-[9px] font-bold text-slate-600 mt-1 font-mono">SCAN FOR TRACE</span>
                </div>
              </div>

              {/* Transparent Breakdown Ribbon */}
              <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">Zero Hidden Intermediaries</span>
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                  <div className="bg-emerald-50 border border-emerald-200 p-1.5 rounded-lg">
                    <span className="text-[9px] text-emerald-800 block font-sans">Farmer</span>
                    <span className="font-bold text-emerald-900">₹{farmerPrice}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-1.5 rounded-lg">
                    <span className="text-[9px] text-blue-800 block font-sans">Cold Logistics</span>
                    <span className="font-bold text-blue-900">₹{distributorPrice}</span>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-1.5 rounded-lg">
                    <span className="text-[9px] text-purple-800 block font-sans">Retail Store</span>
                    <span className="font-bold text-purple-900">₹{retailerPrice}</span>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 text-center font-mono">
                Harvest Date: {selectedBatch.harvestDate} • Direct from Indian Agro Hubs
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
