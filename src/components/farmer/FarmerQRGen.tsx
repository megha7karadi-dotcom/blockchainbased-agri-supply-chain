import React, { useState, useEffect } from 'react';
import { QrCode, Printer, Check, Copy, Package, ShieldCheck, Leaf, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';

export const FarmerQRGen: React.FC = () => {
  const { batches, currentUser, selectedBatchId: appSelectedBatchId, navigate } = useApp();

  // Batches relevant for farmer, fallback to all batches if needed
  const farmerBatches = batches.filter(b => 
    b.farmerId === currentUser?.id || 
    b.farmerName === currentUser?.name || 
    b.farmerId === 'usr-farmer-01'
  );
  const selectableBatches = farmerBatches.length > 0 ? farmerBatches : batches;

  // Selected batch state
  const [selectedBatchId, setSelectedBatchId] = useState<string>(() => {
    if (appSelectedBatchId && batches.some(b => b.id === appSelectedBatchId || b.batchId === appSelectedBatchId)) {
      return appSelectedBatchId;
    }
    return selectableBatches[0]?.id || batches[0]?.id || '';
  });

  const [labelSize, setLabelSize] = useState<'crate' | 'pouch' | 'pallet'>('crate');
  const [copied, setCopied] = useState(false);

  // Sync if appSelectedBatchId changes
  useEffect(() => {
    if (appSelectedBatchId && batches.some(b => b.id === appSelectedBatchId || b.batchId === appSelectedBatchId)) {
      setSelectedBatchId(appSelectedBatchId);
    }
  }, [appSelectedBatchId, batches]);

  const selectedBatch = batches.find(b => b.id === selectedBatchId || b.batchId === selectedBatchId) || selectableBatches[0] || batches[0];

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verificationUrl = `${origin}/verify/${selectedBatch.batchId}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleOpenVerification = () => {
    navigate(`/verify/${selectedBatch.batchId}`);
  };

  // Dynamic QR size based on label type
  const qrSize = labelSize === 'pallet' ? 240 : labelSize === 'crate' ? 220 : 180;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <QrCode className="w-6 h-6 text-emerald-600" />
            <span>Produce QR Packaging Tag Generator</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate printable, scannable QR tags encoding the real AgriTrace verification URL for every batch
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleOpenVerification}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-emerald-700" />
            <span>Open Verification Page</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Physical Label</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Configuration Panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Select Produce Batch</label>
            <select
              value={selectedBatch.id}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-medium text-slate-800"
            >
              {selectableBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.cropName || b.name} — {b.batchId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Packaging Format / Size</label>
            <div className="space-y-2">
              {[
                { id: 'crate' as const, label: 'Export Crate Tag (4" x 6")', desc: 'Heavy corrugated box label' },
                { id: 'pouch' as const, label: 'Consumer Retail Sticker (2" x 2")', desc: 'Direct pouch/punnet adhesive' },
                { id: 'pallet' as const, label: 'Cold Storage Pallet Sign (A4)', desc: 'Bulk transit container manifest' },
              ].map(sz => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => setLabelSize(sz.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition text-xs ${
                    labelSize === sz.id
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div>{sz.label}</div>
                  <div className="text-[10px] text-slate-500 font-normal">{sz.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Verification URL and Copy Action */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Encoded Verification URL</label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-600 break-all select-all">
              {verificationUrl}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                copied 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                  : 'border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Verification URL copied' : 'Copy Verification URL'}</span>
            </button>
          </div>
        </div>

        {/* Live Printable Tag Preview */}
        <div className="md:col-span-2 flex items-center justify-center p-6 bg-slate-100 rounded-3xl border border-slate-200">
          
          {/* Physical Sticker Card */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-xl max-w-sm w-full space-y-4 text-slate-900">
            
            {/* Tag Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-700 text-white rounded">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider">AgriTrace Verified</div>
                  <div className="text-[9px] text-slate-500">Decentralized Produce Passport</div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                LOT #{(selectedBatch.batchId || '').split('-')[3] || (selectedBatch.batchId || '').slice(-3) || '001'}
              </span>
            </div>

            {/* Produce Info */}
            <div>
              <div className="text-base font-black leading-tight">{selectedBatch.cropName || selectedBatch.name}</div>
              <div className="text-xs text-slate-600">{selectedBatch.cropVariety || selectedBatch.variety}</div>
            </div>

            {/* QR Box & Metas */}
            <div className="flex flex-col items-center py-2 space-y-3">
              <div className="p-3 bg-white border border-slate-300 rounded-2xl shadow-sm flex items-center justify-center">
                <QRCodeSVG
                  value={verificationUrl}
                  size={qrSize}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
              </div>

              <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="truncate"><strong>Farm:</strong> {selectedBatch.farmName || 'Verified Producer Farm'}</div>
                <div><strong>Harvest:</strong> {selectedBatch.harvestDate}</div>
                <div><strong>Grade:</strong> {selectedBatch.qualityGrade || selectedBatch.quality?.grade || 'Grade A'}</div>
                <div><strong>Price:</strong> ₹{selectedBatch.farmgatePrice || selectedBatch.pricing?.farmerPrice || 0}/{selectedBatch.unit || 'kg'}</div>
              </div>
            </div>

            {/* Tag Footer - NO fake hash, showing real Batch ID */}
            <div className="pt-2 border-t border-slate-200 text-center space-y-1">
              <div className="font-mono text-[10px] font-bold text-slate-800">
                Batch ID: {selectedBatch.batchId}
              </div>
              <div className="font-mono text-[9px] text-slate-500 truncate">
                Verification ID: {selectedBatch.batchId}
              </div>
              <div className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider">
                Scan with any camera to verify farm-to-fork chain
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

