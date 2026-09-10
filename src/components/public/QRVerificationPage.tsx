import React, { useState } from 'react';
import { QrCode, Camera, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QRCodeModal } from '../common/QRCodeModal';

export const QRVerificationPage: React.FC<{ onOpenQRScanner: () => void }> = ({ onOpenQRScanner }) => {
  const { batches, navigateToVerification } = useApp();
  const [selectedQRBatch, setSelectedQRBatch] = useState<any>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <QrCode className="w-3.5 h-3.5" />
            <span>Anti-Counterfeiting Agricultural Passport</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Produce QR Verification Center
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Every crate, carton, and retail package carries a deterministic cryptographic QR code linking physical produce to its immutable blockchain provenance record.
          </p>
        </div>

        <button
          onClick={onOpenQRScanner}
          className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2 flex-shrink-0"
        >
          <Camera className="w-5 h-5" />
          <span>Launch Camera Scanner</span>
        </button>
      </div>

      {/* Demonstration QR Codes Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Active Supply Chain QR Passports</h2>
          <p className="text-xs text-slate-500">Click any batch to inspect its authentic QR tag or immediately verify its chain of custody</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.map((batch) => (
            <div 
              key={batch.id} 
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {batch.batchId}
                  </span>
                  <span className="text-[11px] text-slate-500">{batch.status}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{batch.name}</h3>
                <p className="text-xs text-slate-500">{batch.variety}</p>
                <div className="text-xs text-slate-600 mt-2">
                  <strong>Origin:</strong> {batch.farmerLocation || batch.farmLocation || 'Origin Verified'}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedQRBatch(batch)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  <span>Display Printable QR Tag</span>
                </button>
                <button
                  onClick={() => navigateToVerification(batch.id)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <span>Scan QR & Verify Produce</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Modal when clicked */}
      {selectedQRBatch && (
        <QRCodeModal batch={selectedQRBatch} onClose={() => setSelectedQRBatch(null)} />
      )}

    </div>
  );
};
