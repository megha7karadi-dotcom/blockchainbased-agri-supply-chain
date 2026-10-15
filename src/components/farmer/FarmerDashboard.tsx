import React, { useState } from 'react';
import { 
  Package, 
  Sprout, 
  CheckCircle2, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight, 
  QrCode, 
  Award, 
  History, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  MapPin,
  Calendar,
  ThermometerSnowflake,
  Truck,
  Eye,
  Handshake,
  DollarSign,
  CloudSun,
  Scale,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QRCodeModal } from '../common/QRCodeModal';
import { ProduceBatch } from '../../types/produce';

export const FarmerDashboard: React.FC = () => {
  const { 
    currentUser, 
    navigate, 
    batches, 
    setSelectedBatchId, 
    navigateToVerification 
  } = useApp();
  
  const [selectedQRBatch, setSelectedQRBatch] = useState<ProduceBatch | null>(null);
  const [statusUpdateNotice, setStatusUpdateNotice] = useState<string | null>(null);

  // Authenticated farmer details
  const farmerName = currentUser?.name || 'Ramesh Patil';
  const farmerOrg = currentUser?.organization || 'Sahyadri Organic Producers Co-op';
  const farmerLocation = currentUser?.location || 'Ratnagiri, Maharashtra, India';

  // Filter batches belonging to the farmer or platform defaults
  const farmerBatches = batches.filter(b => 
    b.farmerId === currentUser?.id || 
    b.farmerName === currentUser?.name || 
    b.farmerId === 'usr-farmer-01'
  );

  const displayBatches = farmerBatches.length > 0 ? farmerBatches : batches;

  // Operational metrics
  const totalBatches = displayBatches.length;
  const activeBatches = displayBatches.filter(b => 
    b.status !== 'Sold to Consumer' && b.status !== 'Completed'
  ).length;
  const readyForDispatchCount = displayBatches.filter(b => 
    b.status === 'Ready for Dispatch' || b.status === 'Registered'
  ).length;

  const totalRevenue = displayBatches.reduce((sum, b) => {
    const qty = b.quantity || b.quantityKg || 500;
    const price = b.farmgatePrice || b.pricing?.farmerPrice || 80;
    return sum + (qty * price);
  }, 0);

  const formattedRevenue = `₹${totalRevenue.toLocaleString('en-IN')}`;

  const handleInspectBatch = (batchId: string) => {
    const existing = batches.find(b => b.batchId === batchId || b.id === batchId);
    if (existing) {
      setSelectedBatchId(existing.id);
    }
    navigate('/farmer/my-produce');
  };

  const handleShowQR = (batch: ProduceBatch) => {
    setSelectedQRBatch(batch);
  };

  const handleQuickDispatch = (batchId: string) => {
    const b = batches.find(item => item.batchId === batchId || item.id === batchId);
    if (b) {
      b.status = 'Ready for Dispatch';
      setStatusUpdateNotice(`Batch ${b.batchId} status updated to "Ready for Dispatch". Logistics carriers notified.`);
      setTimeout(() => setStatusUpdateNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      
      {/* Toast Notice */}
      {statusUpdateNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{statusUpdateNotice}</span>
          </div>
          <button 
            type="button"
            onClick={() => setStatusUpdateNotice(null)}
            className="p-1 hover:bg-emerald-100 rounded text-emerald-800 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. FARMER PROFILE & 5 CLEAR FARMER ACTIONS */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                Farmer Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              {farmerName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              {farmerOrg} • <span className="text-stone-500">{farmerLocation}</span>
            </p>
          </div>

          {/* 5 Clear Actions: Add New Crop, My Crops, Transfer Produce, Check Market Prices, View QR Code */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/farmer/register-produce')}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-md transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Crop</span>
            </button>
            <button
              onClick={() => navigate('/farmer/my-produce')}
              className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="w-4 h-4 text-emerald-800" />
              <span>My Crops ({displayBatches.length})</span>
            </button>
            <button
              onClick={() => navigate('/farmer/transfers')}
              className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-emerald-800" />
              <span>Transfer Produce</span>
            </button>
            <button
              onClick={() => navigate('/farmer/price-prediction')}
              className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-800" />
              <span>Check Market Prices</span>
            </button>
            <button
  onClick={() => navigate('/farmer/crop-recommendation')}
  className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
>
  <Sprout className="w-4 h-4" />
  <span>Crop Recommendation</span>
</button>
            <button
              onClick={() => navigate('/farmer/qr-codes')}
              className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm rounded-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-800" />
              <span>View QR Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL SUMMARY METRICS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Active Harvest Lots</div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">{activeBatches} <span className="text-xs font-sans text-stone-500 font-normal">/ {totalBatches} total</span></div>
          <div className="text-[11px] text-stone-500 mt-0.5">Recorded on system</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Ready for Dispatch</div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">{readyForDispatchCount} <span className="text-xs font-sans text-stone-500 font-normal">crops</span></div>
          <div className="text-[11px] text-emerald-800 font-medium mt-0.5">Awaiting transporter pickup</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Crop Earnings</div>
          <div className="text-2xl font-bold text-emerald-950 mt-1 font-mono">{formattedRevenue}</div>
          <div className="text-[11px] text-stone-500 mt-0.5">Direct farmer payouts</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Farmer Revenue Share</div>
          <div className="text-2xl font-bold text-stone-900 mt-1 font-mono">62.4%</div>
          <div className="text-[11px] text-stone-500 mt-0.5">vs ~24% traditional mandi average</div>
        </div>
      </div>

      {/* 3. CURRENT HARVEST BATCHES (PRIMARY PRACTICAL TABLE) */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900">My Harvested Crops</h2>
            <p className="text-xs text-stone-500">Crops logged and ready for market sale or transporter handover</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/farmer/my-produce')}
              className="text-xs font-semibold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View full directory ({displayBatches.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Crop & Variety</th>
                <th className="py-3 px-4">Harvest Date</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Quality Grade</th>
                <th className="py-3 px-4 text-right">My Price</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {displayBatches.map(batch => (
                <tr key={batch.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                    {batch.batchId}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-900">{batch.cropName || batch.name}</div>
                    <div className="text-[11px] text-stone-500">{batch.cropVariety || batch.variety}</div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">
                    {batch.harvestDate}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-stone-900 whitespace-nowrap">
                    {batch.quantity || batch.quantityKg} {batch.unit || 'kg'}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-800 border border-stone-200">
                      {batch.qualityGrade || batch.quality?.grade || 'Grade A'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-950 whitespace-nowrap">
                    ₹{batch.farmgatePrice || batch.pricing?.farmerPrice}/kg
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                      {batch.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleShowQR(batch)}
                        className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                        title="View Packaging QR"
                      >
                        <QrCode className="w-3 h-3 text-emerald-800" />
                        <span>QR</span>
                      </button>

                      {batch.status !== 'Ready for Dispatch' && batch.status !== 'With Distributor' && batch.status !== 'In Transit' && batch.status !== 'On Retail Shelf' && (
                        <button
                          type="button"
                          onClick={() => handleQuickDispatch(batch.batchId)}
                          className="px-2.5 py-1 bg-emerald-900 hover:bg-emerald-800 text-white rounded text-[11px] font-medium transition cursor-pointer"
                        >
                          Dispatch
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => navigateToVerification(batch.id)}
                        className="px-2.5 py-1 text-stone-600 hover:text-stone-900 rounded text-[11px] transition cursor-pointer"
                      >
                        Verify
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. SPLIT OPERATIONS: PENDING TRANSFERS (LEFT) & AGRO-MARKET ADVISORY (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Pending Transfers & Transporter Handoffs */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Produce Handover to Transporters</h3>
              <p className="text-xs text-stone-500">Handover batches to transport partners for safe cold delivery</p>
            </div>
            <Truck className="w-4 h-4 text-stone-600" />
          </div>

          <div className="space-y-3">
            {displayBatches.slice(0, 3).map((b, idx) => (
              <div key={b.id} className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">{b.batchId}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-stone-200 text-stone-800 rounded font-medium">
                      {b.status}
                    </span>
                  </div>
                  <div className="text-stone-700 font-semibold">{b.cropName || b.name} ({b.quantity || b.quantityKg} kg)</div>
                  <div className="text-[11px] text-stone-500">
                    Transporter: KisanLogix Cold Fleet • Vehicle: MH-04-TR-9182
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                  <span className="font-mono font-bold text-emerald-950 text-xs">₹{b.farmgatePrice || b.pricing?.farmerPrice}/kg</span>
                  <button
                    type="button"
                    onClick={() => navigate('/farmer/transfers')}
                    className="text-[11px] text-emerald-900 hover:underline font-semibold cursor-pointer"
                  >
                    Transfer Produce →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Agro-Meteorological & Market Advisory */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Regional Agronomic Advisory</h3>
              <p className="text-xs text-stone-500">Ratnagiri & Konkan agricultural cluster</p>
            </div>
            <CloudSun className="w-4 h-4 text-amber-700" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-stone-50 rounded-md border border-stone-200">
                <span className="text-[10px] text-stone-500 block uppercase">Temperature</span>
                <span className="font-bold text-stone-900 font-mono text-sm">31°C</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-md border border-stone-200">
                <span className="text-[10px] text-stone-500 block uppercase">Humidity</span>
                <span className="font-bold text-stone-900 font-mono text-sm">68% RH</span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-md border border-stone-200">
                <span className="text-[10px] text-stone-500 block uppercase">Harvest Window</span>
                <span className="font-bold text-emerald-800 text-sm">Optimal</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-md border border-stone-200 text-stone-700 leading-relaxed text-[11px]">
              <strong>Plucking Advisory:</strong> Low ambient moisture makes current morning conditions ideal for plucking export-grade mangoes and grains with zero fungal rot risk.
            </div>

            <div className="p-3 bg-stone-50 rounded-md border border-stone-200 text-stone-700 leading-relaxed text-[11px]">
              <strong>Mandi Intelligence:</strong> Vashi APMC experiencing arrival surges from unorganized belts. AgriTrace contract direct forward dispatch yields ~18% higher realization.
            </div>

            <button
              type="button"
              onClick={() => navigate('/farmer/price-prediction')}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-800" />
              <span>Check 30-Day Mandi Price Forecast</span>
            </button>
          </div>
        </div>

      </div>

      {/* QR Code Modal for Producer Packaging */}
      {selectedQRBatch && (
        <QRCodeModal
          isOpen={!!selectedQRBatch}
          onClose={() => setSelectedQRBatch(null)}
          batch={selectedQRBatch}
        />
      )}

    </div>
  );
};
