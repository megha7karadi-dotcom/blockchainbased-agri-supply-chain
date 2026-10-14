import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  ThermometerSnowflake, 
  Clock, 
  ShieldCheck, 
  Search, 
  ChevronRight, 
  Filter, 
  AlertTriangle,
  ArrowRight,
  Phone,
  Navigation,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';

interface ShipmentRouteStage {
  name: string;
  location: string;
  completed: boolean;
  active: boolean;
  time: string;
}

export const DistributorShipments: React.FC = () => {
  const { batches, navigateToVerification, setActiveTab } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<'All' | 'In Transit' | 'Delivered' | 'Warning'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<ProduceBatch | null>(null);

  // All relevant batches for shipments
  const shipmentBatches = batches.filter(b => 
    b.status === 'In Transit' || 
    b.status === 'Delivered to Retailer' || 
    b.status === 'At Distributor' ||
    b.currentCustodianRole === 'distributor'
  );

  const filteredBatches = shipmentBatches.filter(batch => {
    const matchesSearch = 
      (batch.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (batch.batchId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (batch.currentCustodianName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'In Transit') return batch.status === 'In Transit';
    if (selectedFilter === 'Delivered') return batch.status === 'Delivered to Retailer';
    if (selectedFilter === 'Warning') {
      const logs = Array.isArray(batch.sensorLogs) ? batch.sensorLogs : [];
      const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;
      const tempNum = latestLog?.temperature || 12;
      return tempNum > 16 || tempNum < 8;
    }
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-12"
    >
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/50 text-slate-900 rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Shipments & Consignment Tracking
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Monitor real-time GPS locations, route milestone checkpoints, and IoT container temperatures across all refrigerated trucks in transit to regional distribution hubs and retail partners.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-shrink-0">
          <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-2xs text-center">
            <span className="text-[11px] text-slate-500 font-semibold block">Active in Transit</span>
            <span className="text-xl font-black text-blue-700">
              {batches.filter(b => b.status === 'In Transit').length}
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-2xs text-center">
            <span className="text-[11px] text-slate-500 font-semibold block">Delivered to Stores</span>
            <span className="text-xl font-black text-emerald-700">
              {batches.filter(b => b.status === 'Delivered to Retailer').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search consignment, vehicle or crop..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'In Transit', 'Delivered', 'Warning'] as const).map(f => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedFilter === f 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'Warning' ? '⚠️ Temp Alerts' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Shipment Cards Grid */}
      {filteredBatches.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-sm">No shipments found</p>
          <p className="text-xs text-slate-400">Try changing your filters or searching another batch ID.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBatches.map((batch, index) => {
            const isDelivered = batch.status === 'Delivered to Retailer';
            const isInTransit = batch.status === 'In Transit';
            const logs = Array.isArray(batch.sensorLogs) ? batch.sensorLogs : [];
            const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;
            const currentTemp = latestLog?.temperature || 12.4;
            const isTempWarning = currentTemp > 16 || currentTemp < 6;
            const vehicleNo = index % 2 === 0 ? 'MH-04-TR-9182' : 'MH-12-QC-4019';
            const driver = index % 2 === 0 ? 'Mahesh Jadhav (+91 98231 44102)' : 'Sunil Ghadge (+91 94220 89114)';

            return (
              <div 
                key={batch.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Batch ID, Status & Temp */}
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">
                        {batch.batchId}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className={`font-semibold ${
                        isDelivered 
                          ? 'text-emerald-700' 
                          : isInTransit 
                          ? 'text-blue-700' 
                          : 'text-amber-700'
                      }`}>
                        {batch.status}
                      </span>
                    </div>

                    <div className={`flex items-center gap-1 font-mono font-semibold ${
                      isTempWarning ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      <ThermometerSnowflake className="w-3.5 h-3.5 text-slate-400" />
                      <span>{currentTemp}°C</span>
                    </div>
                  </div>

                  {/* Produce Title & Weight */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{batch.name || batch.cropName}</h3>
                      <p className="text-xs text-slate-500">Producer: {batch.farmerName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 font-mono block">
                        {batch.quantityKg || batch.quantity} kg
                      </span>
                      <span className="text-[10px] text-slate-400">Net Payload</span>
                    </div>
                  </div>

                  {/* Vehicle & Telematics Info Box */}
                  <div className="mt-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Reefer Vehicle:</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900">{vehicleNo}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Driver Contact:</span>
                      </span>
                      <span className="text-[11px] text-slate-600 font-medium">{driver}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Current Location:</span>
                      </span>
                      <span className="text-[11px] text-slate-800 font-medium truncate max-w-[180px]">
                        {isDelivered ? 'Store Receiving Dock' : 'Mumbai-Pune Expressway (Km 64)'}
                      </span>
                    </div>
                  </div>

                  {/* Route Milestones Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Farm Origin</span>
                      <span>Pune Pre-cooling</span>
                      <span>Gateway Hub</span>
                      <span>Store Outlet</span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex">
                      <div className={`h-full transition-all ${
                        isDelivered ? 'w-full bg-emerald-600' : 'w-3/4 bg-blue-600'
                      }`} />
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                  <button
                    onClick={() => navigateToVerification(batch.batchId || batch.id)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    View Passport
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('/distributor/transportation')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                    >
                      IoT Telemetry
                    </button>
                    {isInTransit && (
                      <button
                        onClick={() => setActiveTab('/distributor/ownership-transfer')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <span>Deliver</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </motion.div>
  );
};
