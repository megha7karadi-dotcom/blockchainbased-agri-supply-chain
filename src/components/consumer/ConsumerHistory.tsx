import React from 'react';
import { History, ShieldCheck, QrCode, ArrowRight, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ConsumerHistory: React.FC<{ onOpenQRScanner: () => void }> = ({ onOpenQRScanner }) => {
  const { batches, navigateToVerification } = useApp();

  const scanHistory = [
    {
      id: 'scan-01',
      batch: batches[0],
      scannedAt: 'Today at 2:15 PM',
      retailer: 'FreshRoot Organics Flagship (Bandra West)',
      farmerPaid: '₹120/kg (61.5% of total)',
      ratingGiven: 5,
    },
    {
      id: 'scan-02',
      batch: batches[1],
      scannedAt: 'Yesterday at 6:40 PM',
      retailer: 'FreshRoot Organics Flagship (Bandra West)',
      farmerPaid: '₹65/kg (68.4% of total)',
      ratingGiven: 5,
    },
    {
      id: 'scan-03',
      batch: batches[2],
      scannedAt: '3 days ago',
      retailer: 'Sahakari Bhandar Supermarket',
      farmerPaid: '₹22/kg (52.3% of total)',
      ratingGiven: 4,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-teal-600" />
            <span>My Scanned Produce History</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of grocery packages verified via smartphone camera and cryptographic QR tags
          </p>
        </div>

        <button
          onClick={onOpenQRScanner}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan New Item</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {scanHistory.map((item) => (
          <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition">
            <div className="flex items-center gap-4">
              <img
                src={item.batch.imageUrl}
                alt={item.batch.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {item.batch.batchId}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs text-slate-400">{item.scannedAt}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{item.batch.name}</h3>
                <p className="text-xs text-slate-500">
                  Store: {item.retailer} • <strong className="text-emerald-700">{item.farmerPaid}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="flex text-amber-400">
                {[...Array(item.ratingGiven)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <button
                onClick={() => navigateToVerification(item.batch.id)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>View Full Passport</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
