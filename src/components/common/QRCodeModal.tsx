import React, { useState } from 'react';
import { X, Printer, CheckCircle, Shield, Leaf, Copy, Check, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ProduceBatch } from '../../types/produce';

interface Props {
  batch: ProduceBatch;
  onClose: () => void;
}

export const QRCodeModal: React.FC<Props> = ({ batch, onClose }) => {
  const [copied, setCopied] = useState(false);
  const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${batch.batchId}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-900/50 rounded-lg">
              <Shield className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">AgriTrace Verification Tag</h3>
              <p className="text-xs text-emerald-200">Authentic Farm-to-Fork Traceability Passport</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-100 hover:text-white hover:bg-emerald-900/40 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div id="printable-qr-tag" className="p-6 bg-slate-50 flex flex-col items-center text-center">
          
          <div className="bg-white p-5 rounded-2xl shadow-md border-2 border-dashed border-emerald-500/50 max-w-xs w-full flex flex-col items-center">
            
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm mb-1">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>AgriTrace Verified Batch</span>
            </div>

            <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 mb-3">
              Batch ID: {batch.batchId}
            </div>

            {/* Scannable QR Code SVG */}
            <div className="p-3 bg-white rounded-xl shadow-inner border border-slate-200">
              <QRCodeSVG
                value={verificationUrl}
                size={190}
                level="H"
                includeMargin={true}
                className="rounded-lg"
              />
            </div>

            <div className="mt-4 text-center w-full">
              <h4 className="font-bold text-slate-900 text-base">{batch.cropName || batch.name}</h4>
              <p className="text-xs text-slate-500 font-medium">{batch.cropVariety || batch.variety}</p>
              
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-emerald-700">{batch.qualityGrade || batch.quality?.grade || 'Grade A'}</span>
                <span>•</span>
                <span>Harvest: {batch.harvestDate}</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500 font-medium">
              Scan with any phone camera to verify origin & fair pricing
            </div>
          </div>

          {/* Batch Verification URL & Details */}
          <div className="w-full mt-4 bg-white p-3.5 rounded-xl border border-slate-200 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Verification ID:</span>
              <span className="font-mono font-semibold text-slate-800">{batch.batchId}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Farm Location:</span>
              <span className="font-medium text-slate-700">{batch.farmLocation || batch.farmerLocation || 'Verified Producer'}</span>
            </div>
            <div className="flex flex-col text-xs pt-1 border-t border-slate-100">
              <span className="text-slate-500 mb-1">Verification URL:</span>
              <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-50 rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                <span className="truncate">{verificationUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-sans font-medium px-2 py-0.5 bg-white border border-emerald-200 rounded text-xs flex-shrink-0 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 text-emerald-700 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verification State</span>
              </span>
              <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                Verified AgriTrace Batch
              </span>
            </div>
          </div>

        </div>

        {/* Footer controls */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            QR encodes the direct AgriTrace verification URL.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Label</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
