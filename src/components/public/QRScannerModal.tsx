import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Camera, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useWallet } from '../../context/WalletContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { batches, navigateToVerification } = useApp();
  const { addScanRecord, contractAddress } = useWallet();
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScanSample = (batchIdOrCode: string) => {
    setIsScanning(true);
    setScanResult(null);

    const match = batches.find(b => 
      b.id === batchIdOrCode || 
      b.batchId.toLowerCase() === batchIdOrCode.toLowerCase()
    );

    if (match) {
      addScanRecord({
        batchId: match.batchId,
        name: match.name,
        variety: match.variety,
        imageUrl: match.imageUrl,
        farmLocation: match.farmerLocation || match.farmLocation,
        farmerName: match.farmerName,
        finalPrice: match.pricing?.finalConsumerPrice,
        farmerPrice: match.pricing?.farmerPrice,
        qualityGrade: match.quality?.grade,
        freshnessScore: match.quality?.freshnessScore,
        status: match.status,
        contractAddress: match.blockchain?.contractAddress || contractAddress,
        tokenId: match.blockchain?.tokenId,
        blockNumber: match.blockchain?.blockNumber,
        networkName: match.blockchain?.consensusMechanism || 'Ethereum Sepolia',
        isTamperEvident: true
      });
    }

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
    const match = batches.find(b => 
      b.id === cleanId || 
      b.batchId.toLowerCase() === cleanId.toLowerCase()
    );

    if (match) {
      addScanRecord({
        batchId: match.batchId,
        name: match.name,
        variety: match.variety,
        imageUrl: match.imageUrl,
        farmLocation: match.farmerLocation || match.farmLocation,
        farmerName: match.farmerName,
        finalPrice: match.pricing?.finalConsumerPrice,
        farmerPrice: match.pricing?.farmerPrice,
        qualityGrade: match.quality?.grade,
        freshnessScore: match.quality?.freshnessScore,
        status: match.status,
        contractAddress: match.blockchain?.contractAddress || contractAddress,
        tokenId: match.blockchain?.tokenId,
        blockNumber: match.blockchain?.blockNumber,
        networkName: match.blockchain?.consensusMechanism || 'Ethereum Sepolia',
        isTamperEvident: true
      });
    }

    navigateToVerification(cleanId);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
      >
        
        {/* Modal Header */}
        <div className="bg-white text-slate-900 p-4.5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">Packaging QR Scanner</h3>
              <p className="text-xs text-slate-500">Scan packaging label or enter Batch ID</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optical Viewfinder */}
        <div className="p-6 bg-slate-950 flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          <div className="relative w-56 h-56 rounded-2xl border-2 border-emerald-500/40 bg-slate-900/90 flex flex-col items-center justify-center shadow-inner overflow-hidden">
            {/* Corner reticles */}
            <div className="absolute top-2.5 left-2.5 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm"></div>
            <div className="absolute top-2.5 right-2.5 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm"></div>
            <div className="absolute bottom-2.5 left-2.5 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm"></div>
            <div className="absolute bottom-2.5 right-2.5 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-sm"></div>

            {/* Continuous Sweeping Laser Scan Line */}
            <motion.div 
              animate={{ 
                top: ['8%', '90%', '8%'] 
              }}
              transition={{ 
                duration: 2.2, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399]"
            />

            {isScanning ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-emerald-400 space-y-2 z-10"
              >
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-mono font-bold animate-pulse">Reading QR Tag...</span>
              </motion.div>
            ) : scanResult ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-emerald-400 space-y-2 z-10"
              >
                <CheckCircle2 className="w-10 h-10" />
                <span className="text-xs font-bold font-mono">Verified Match!</span>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center text-slate-400 space-y-2 p-4 z-10">
                <QrCode className="w-12 h-12 text-slate-500" />
                <span className="text-[11px] text-slate-400">Align QR code inside viewfinder</span>
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Laser active • Point camera or select a sample batch</span>
          </div>
        </div>

        {/* Quick sample pickers with produce thumbnails */}
        <div className="p-4.5 bg-slate-50 border-t border-slate-200">
          <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center justify-between">
            <span>Simulate Scan on Sample Batches:</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Click to test</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {batches.slice(0, 4).map(b => (
              <motion.button
                key={b.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleScanSample(b.id)}
                className="p-2 text-left bg-white hover:bg-emerald-50/70 hover:border-emerald-300 border border-slate-200 rounded-xl transition text-xs group flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <img 
                  src={b.imageUrl || '/assets/harvest_crates.svg'} 
                  alt={b.name}
                  onError={(e) => { e.currentTarget.src = '/assets/harvest_crates.svg'; }}
                  className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 truncate group-hover:text-emerald-800 text-[11px]">{b.name}</div>
                  <div className="font-mono text-[10px] text-slate-500 truncate">{b.batchId}</div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="mt-3.5 pt-3 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or enter Batch ID (e.g. AGRI-2026-MNG-001)"
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-mono"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-xs cursor-pointer"
            >
              <span>Verify</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </motion.div>
    </motion.div>
  );
};

