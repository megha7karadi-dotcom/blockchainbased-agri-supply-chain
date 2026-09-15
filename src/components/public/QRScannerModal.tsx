import React, { useState } from 'react';
import { X, QrCode, Camera, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { batches, navigateToVerification } = useApp();
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScanSample = (batchIdOrCode: string) => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(batchIdOrCode);
      setTimeout(() => {
        navigateToVerification(batchIdOrCode);
        onClose();
      }, 500);
    }, 700);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = manualInput.trim();
    if (!raw) return;
    
    // Support either Batch ID or full pasted verification URL
    const cleanId = raw.replace(/^.*\/verify\/?/, '').split('?')[0].split('#')[0].trim();
    navigateToVerification(cleanId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-white text-slate-900 p-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">Produce QR Scanner</h3>
              <p className="text-xs text-slate-500">Scan packaging label or enter Batch ID</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optical Viewfinder */}
        <div className="p-6 bg-slate-950 flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          <div className="relative w-56 h-56 rounded-2xl border-2 border-emerald-500/40 bg-slate-900/90 flex flex-col items-center justify-center shadow-inner overflow-hidden">
            {/* Corner reticles */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-emerald-400"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-emerald-400"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-emerald-400"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-emerald-400"></div>

            {/* Laser scan line */}
            <div className={`absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] ${
              isScanning ? 'animate-bounce' : 'opacity-60'
            }`} style={{ top: isScanning ? '50%' : '30%' }}></div>

            {isScanning ? (
              <div className="flex flex-col items-center text-emerald-400 space-y-2">
                <Sparkles className="w-8 h-8 animate-spin" />
                <span className="text-xs font-mono font-bold animate-pulse">Reading QR Code...</span>
              </div>
            ) : scanResult ? (
              <div className="flex flex-col items-center text-emerald-400 space-y-2">
                <CheckCircle2 className="w-10 h-10" />
                <span className="text-xs font-bold font-mono">QR Code Recognized!</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-400 space-y-2 p-4">
                <QrCode className="w-12 h-12 text-slate-500" />
                <span className="text-[11px] text-slate-400">Align QR tag within frame</span>
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Point camera at packaging QR or select a sample batch below</span>
          </div>
        </div>

        {/* Quick sample pickers */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>Quick-Scan Sample Batches:</span>
            <span className="text-[10px] text-emerald-700 font-medium">Click to test</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {batches.slice(0, 4).map(b => (
              <button
                key={b.id}
                onClick={() => handleScanSample(b.id)}
                className="p-2 text-left bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl transition text-xs group"
              >
                <div className="font-semibold text-slate-800 truncate group-hover:text-emerald-800">{b.name}</div>
                <div className="font-mono text-[10px] text-slate-500 truncate">{b.batchId}</div>
              </button>
            ))}
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="mt-3.5 pt-3 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or enter Batch ID (e.g. AGRI-2026-MNG-001)"
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:border-emerald-600 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition"
            >
              <span>Verify</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
