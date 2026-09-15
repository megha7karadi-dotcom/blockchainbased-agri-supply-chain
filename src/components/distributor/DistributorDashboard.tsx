import React, { useState } from 'react';
import { 
  Truck, 
  ThermometerSnowflake, 
  Package, 
  TrendingUp, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Layers,
  Search,
  ShoppingCart,
  BadgePercent,
  ArrowRightLeft,
  History,
  FileCheck2,
  ShieldCheck,
  Radio,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';
import { CryptoHashDisplay } from '../common/CryptoHashDisplay';

export const DistributorDashboard: React.FC = () => {
  const { batches, currentUser, navigate, setSelectedBatchId, distributorProcureProduce, navigateToVerification } = useApp();

  const [procuringBatch, setProcuringBatch] = useState<ProduceBatch | null>(null);
  const [logisticsCost, setLogisticsCost] = useState<number>(25);
  const [distributorMargin, setDistributorMargin] = useState<number>(15);
  const [vehicleNumber, setVehicleNumber] = useState('MH-04-TR-9182');
  const [targetTemp, setTargetTemp] = useState('12°C');
  const [procureAlert, setProcureAlert] = useState<string | null>(null);

  // Available batches awaiting distributor procurement
  const availableBatches = batches.filter(b => b.status === 'Ready for Dispatch' || b.status === 'Harvested & Tokenized');
  // In-transit batches under this distributor
  const inTransitBatches = batches.filter(b => b.status === 'In Transit');
  // Delivered / Handed over
  const handedOverBatches = batches.filter(b => b.status === 'Delivered to Retailer' || b.status === 'On Retail Shelf');

  const handleConfirmProcurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procuringBatch) return;

    distributorProcureProduce(procuringBatch.id, logisticsCost, distributorMargin, vehicleNumber, targetTemp);
    setProcureAlert(`Procurement successful: ${procuringBatch.name} (${procuringBatch.batchId}) assigned to vehicle ${vehicleNumber}. Escrow locked.`);
    setProcuringBatch(null);
  };

  const featureCards = [
    {
      title: 'Available Produce',
      desc: 'Browse tokenized farm harvests awaiting collection and lock fair-trade escrows.',
      icon: <ShoppingCart className="w-5 h-5 text-blue-600" />,
      path: '/distributor/available-produce',
      badge: `${availableBatches.length} Ready`,
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Receive Produce',
      desc: 'Perform QA gate inspection, check moisture, certify weight, and accept batch custody.',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      path: '/distributor/receive-produce',
      badge: 'Dock QA',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      title: 'Shipments & Fleet Tracker',
      desc: 'Monitor real-time reefer consignments, vehicle route progress, and ETA updates.',
      icon: <Package className="w-5 h-5 text-indigo-600" />,
      path: '/distributor/shipments',
      badge: `${inTransitBatches.length} En Route`,
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      title: 'Cold-Chain IoT Telemetry',
      desc: 'Live BLE sensor feeds, temperature threshold alerts, and Chainlink oracle sync.',
      icon: <Radio className="w-5 h-5 text-cyan-600" />,
      path: '/distributor/transportation',
      badge: 'Live Oracles',
      badgeColor: 'bg-cyan-100 text-cyan-800'
    },
    {
      title: 'Update Price & Margin',
      desc: 'Configure itemized cold logistics costs and fair margins published to the public ledger.',
      icon: <BadgePercent className="w-5 h-5 text-amber-600" />,
      path: '/distributor/update-price',
      badge: 'Zero Hidden Cuts',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      title: 'Transfer Custody',
      desc: 'Cryptographic handoff to retail partner distribution centers with automated receipt.',
      icon: <ArrowRightLeft className="w-5 h-5 text-purple-600" />,
      path: '/distributor/ownership-transfer',
      badge: 'Smart Contract',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Transaction History',
      desc: 'Complete financial ledger of farmer payments, logistics margins, and gas receipts.',
      icon: <History className="w-5 h-5 text-slate-600" />,
      path: '/distributor/transactions',
      badge: 'Verified Ledger',
      badgeColor: 'bg-slate-100 text-slate-700'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-12"
    >
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/50 text-slate-900 rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {currentUser?.organization || 'Maha-Agro Logistics Hub'}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Director: {currentUser?.name || 'Vikramaditya Shinde'} • Active GPS & Telemetry Oracles Synced
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/distributor/available-produce')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Procure Farm Harvests ({availableBatches.length})</span>
          </button>
          <button
            onClick={() => navigate('/distributor/transportation')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <ThermometerSnowflake className="w-4 h-4 text-blue-600" />
            <span>IoT Cold Telemetry</span>
          </button>
        </div>
      </div>

      {/* Procurement Alert */}
      {procureAlert && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{procureAlert}</span>
          </div>
          <button 
            onClick={() => setProcureAlert(null)} 
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Reefer Fleet</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">4 <span className="text-xs font-normal text-slate-500">vehicles</span></div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">100% GPS connected</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Average Reefer Temp</span>
            <ThermometerSnowflake className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-cyan-800">11.8°C</div>
          <div className="text-[11px] text-slate-500 mt-1">Optimal cold-chain window</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Batches In Transit</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{inTransitBatches.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">En route to wholesale hubs</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Logistics Compliance</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">99.4%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Zero thermal excursion breaches</div>
        </div>
      </div>

      {/* Complete Distributor Feature Operations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Distributor Operations Hub</h2>
            <p className="text-xs text-slate-500">Access and execute all cold-chain logistics, intake QA, pricing, and handoff modules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((feat, index) => (
            <div
              key={index}
              onClick={() => navigate(feat.path)}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition">
                    {feat.icon}
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                <span>Launch Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Farm Lots Awaiting Procurement */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Farm Harvests Ready for Procurement</h2>
            <p className="text-xs text-slate-500">Farmers requesting cold-chain pickup & distribution</p>
          </div>
          <button
            onClick={() => navigate('/distributor/available-produce')}
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({availableBatches.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {availableBatches.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No batches currently awaiting procurement. Check back once farmers register new harvests.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableBatches.slice(0, 3).map(batch => (
              <motion.div 
                key={batch.id} 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl border border-slate-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 relative bg-slate-100 overflow-hidden">
                    <img 
                      src={batch.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80'} 
                      alt={batch.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="font-mono text-[11px] font-bold text-slate-900 bg-white/95 px-2 py-0.5 rounded-md shadow-xs">
                        {batch.batchId}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[11px] font-bold text-white bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded-md">
                        {batch.quantityKg || batch.quantity} kg
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <h3 className="font-bold text-slate-900 text-sm">{batch.name}</h3>
                    <div className="text-xs text-slate-500">
                      <strong>Farmer:</strong> {batch.farmerName} • {(batch.farmerLocation || batch.farmLocation || 'Maharashtra').split(',')[0]}
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
                      <span className="text-slate-500">Farmer Price Floor:</span>
                      <span className="font-bold text-emerald-800">₹{batch.pricing?.farmerPrice || batch.farmgatePrice || 40}/kg</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-1.5">
                  <button
                    onClick={() => setProcuringBatch(batch)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Accept Custody & Dispatch Reefer</span>
                  </button>

                  <button
                    onClick={() => navigateToVerification(batch.batchId || batch.id)}
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Provenance</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Procurement Modal */}
      {procuringBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Procure & Dispatch Cold-Chain</h3>
                <p className="text-xs text-slate-500">{procuringBatch.name} ({procuringBatch.batchId})</p>
              </div>
              <button 
                onClick={() => setProcuringBatch(null)} 
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmProcurement} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex justify-between font-bold text-emerald-950">
                  <span>Farmer Payout (Base Gate Price):</span>
                  <span className="font-mono">₹{procuringBatch.pricing?.farmerPrice || procuringBatch.farmgatePrice || 40}/kg</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  Total contract escrow value: ₹{((procuringBatch.pricing?.farmerPrice || procuringBatch.farmgatePrice || 40) * (procuringBatch.quantityKg || procuringBatch.quantity || 500)).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Logistics Cost (₹/kg)</label>
                  <input
                    type="number"
                    min={1}
                    value={logisticsCost}
                    onChange={(e) => setLogisticsCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Distributor Margin (₹/kg)</label>
                  <input
                    type="number"
                    min={1}
                    value={distributorMargin}
                    onChange={(e) => setDistributorMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reefer Truck License #</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Reefer Temp</label>
                  <input
                    type="text"
                    value={targetTemp}
                    onChange={(e) => setTargetTemp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                Transparent Wholesale Price to Retailer will be: <strong>₹{(procuringBatch.pricing?.farmerPrice || procuringBatch.farmgatePrice || 40) + Number(logisticsCost) + Number(distributorMargin)}/kg</strong>. All values are published to the smart contract.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Sign Smart Contract & Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => setProcuringBatch(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};
