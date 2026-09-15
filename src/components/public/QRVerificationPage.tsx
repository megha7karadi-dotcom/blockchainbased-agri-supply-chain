import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QrCode, Camera, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QRCodeModal } from '../common/QRCodeModal';

export const QRVerificationPage: React.FC<{ onOpenQRScanner: () => void }> = ({ onOpenQRScanner }) => {
  const { batches, navigateToVerification } = useApp();
  const [selectedQRBatch, setSelectedQRBatch] = useState<any>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-5xl mx-auto space-y-8 pb-12"
    >
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50 text-slate-900 rounded-3xl p-6 sm:p-10 border border-emerald-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Produce QR Verification Center
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Every crate, carton, and retail package carries a deterministic cryptographic QR code linking physical produce to its immutable blockchain provenance record.
          </p>
        </div>

        <button
          onClick={onOpenQRScanner}
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition flex items-center gap-2 flex-shrink-0 cursor-pointer"
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
            <motion.div 
              key={batch.id} 
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                <img 
                  src={batch.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'} 
                  alt={batch.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs font-mono text-xs font-bold text-emerald-800 px-2.5 py-1 rounded-xl shadow-2xs border border-emerald-200">
                  {batch.batchId}
                </div>
                <div className="absolute top-3 right-3 bg-emerald-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                  {batch.status}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{batch.name}</h3>
                  <p className="text-xs text-slate-500">{batch.variety}</p>
                  <div className="text-xs text-slate-600 mt-2">
                    <strong>Origin:</strong> {batch.farmerLocation || batch.farmLocation || 'Origin Verified'}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedQRBatch(batch)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-emerald-700" />
                    <span>Display Printable QR Tag</span>
                  </button>
                  <button
                    onClick={() => navigateToVerification(batch.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <span>Scan QR & Verify Produce</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* QR Modal when clicked */}
      {selectedQRBatch && (
        <QRCodeModal batch={selectedQRBatch} onClose={() => setSelectedQRBatch(null)} />
      )}

    </motion.div>
  );
};
