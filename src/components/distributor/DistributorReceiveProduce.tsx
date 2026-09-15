import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  MapPin, 
  Calendar, 
  Scale, 
  ClipboardCheck, 
  FileText, 
  ArrowRight,
  AlertCircle,
  Truck,
  Check,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ProduceBatch } from '../../types/produce';
import { CryptoHashDisplay } from '../common/CryptoHashDisplay';

export const DistributorReceiveProduce: React.FC = () => {
  const { batches, distributorReceiveProduce, navigateToVerification, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inspectingBatch, setInspectingBatch] = useState<ProduceBatch | null>(null);

  // Quality Inspection Checklist State
  const [brixRating, setBrixRating] = useState('18.4° Brix');
  const [moistureReading, setMoistureReading] = useState('14.2%');
  const [tareWeightKg, setTareWeightKg] = useState<number>(0);
  const [visualGrade, setVisualGrade] = useState<'Grade A (Export)' | 'Grade B (Premium)' | 'Standard'>('Grade A (Export)');
  const [pesticideTestPassed, setPesticideTestPassed] = useState(true);
  const [intakeLocation, setIntakeLocation] = useState('KisanLogix Regional Intake Hub, Pune');
  const [inspectionNotes, setInspectionNotes] = useState('Intake lot physically verified upon truck arrival. Crates in pristine condition with active tamper-evident batch QR seals.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Eligible batches for intake inspection: Harvested or Ready for Dispatch or In Transit
  const eligibleBatches = batches.filter(b => 
    b.status === 'Ready for Dispatch' || 
    b.status === 'Harvested & Tokenized' || 
    b.status === 'Harvested' ||
    b.status === 'In Transit' ||
    b.status === 'At Distributor'
  );

  const filteredBatches = eligibleBatches.filter(batch => {
    const nameMatch = (batch.name || batch.cropName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = (batch.batchId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const farmerMatch = (batch.farmerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory === 'All' || batch.category === selectedCategory;
    return (nameMatch || idMatch || farmerMatch) && categoryMatch;
  });

  const handleOpenInspection = (batch: ProduceBatch) => {
    setInspectingBatch(batch);
    setTareWeightKg(batch.quantityKg || batch.quantity || 500);
    setSuccessNotice(null);
  };

  const handleConfirmIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingBatch) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const notes = `${inspectionNotes} (Tare: ${tareWeightKg}kg, Brix: ${brixRating}, Moisture: ${moistureReading}, Grade: ${visualGrade}, Location: ${intakeLocation})`;
      distributorReceiveProduce(inspectingBatch.id, notes, pesticideTestPassed);
      setIsSubmitting(false);
      setSuccessNotice(`Intake inspection passed for ${inspectingBatch.name} (${inspectingBatch.batchId}). Custody recorded on blockchain.`);
      setInspectingBatch(null);
    }, 600);
  };

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
            Receive Produce & Quality Inspection
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Execute physical gate intake for incoming farm consignments. Verify Brix sweetness, moisture content, tare weight, and authenticate blockchain QR seals before approving custody.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-blue-200 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Pending Intake Lots</div>
            <div className="text-lg font-black text-slate-900">
              {eligibleBatches.filter(b => b.status !== 'At Distributor').length}
            </div>
          </div>
        </div>
      </div>

      {/* Success Notice */}
      {successNotice && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
          <button 
            onClick={() => setSuccessNotice(null)} 
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop, batch ID, or farmer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Fruits', 'Vegetables', 'Grains', 'Spices'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Batches Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Incoming & Active Farm Consignments</h2>
            <p className="text-xs text-slate-500">Select any batch to verify digital bill of lading and execute farmgate intake</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {filteredBatches.length} Batches Found
          </span>
        </div>

        {filteredBatches.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Truck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No matching produce lots ready for intake.</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBatches.map(batch => {
              const isAtWarehouse = batch.status === 'At Distributor';
              return (
                <div key={batch.id} className="p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img 
                      src={batch.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80'} 
                      alt={batch.name} 
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-slate-800">
                          {batch.batchId}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className={`font-semibold ${
                          isAtWarehouse ? 'text-blue-700' : 'text-amber-700'
                        }`}>
                          {batch.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{batch.name || batch.cropName}</h3>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Farmer: <strong className="text-slate-700">{batch.farmerName}</strong></span>
                        <span>•</span>
                        <span>Location: {batch.farmerLocation || batch.farmLocation}</span>
                        <span>•</span>
                        <span>Quantity: <strong>{batch.quantityKg || batch.quantity} kg</strong></span>
                        <span>•</span>
                        <span>Harvest: {batch.harvestDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                      onClick={() => navigateToVerification(batch.batchId || batch.id)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                    >
                      View Passport
                    </button>
                    <button
                      onClick={() => handleOpenInspection(batch)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>{isAtWarehouse ? 'Re-Inspect Lot' : 'Gate Intake Inspection'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Intake Inspection Modal */}
      {inspectingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  <span>Farmgate Produce Intake Inspection</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {inspectingBatch.name} • Batch ID: <span className="font-mono font-bold text-slate-800">{inspectingBatch.batchId}</span>
                </p>
              </div>
              <button 
                onClick={() => setInspectingBatch(null)} 
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmIntake} className="space-y-4 text-xs">
              
              {/* Farmer & Lot Overview */}
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 grid grid-cols-2 gap-2 text-slate-800">
                <div>
                  <span className="text-[11px] text-slate-500 block">Producer Node</span>
                  <span className="font-bold text-slate-900">{inspectingBatch.farmerName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Farmgate Price</span>
                  <span className="font-bold text-emerald-800">₹{inspectingBatch.pricing?.farmerPrice || inspectingBatch.farmgatePrice}/kg</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Manifest Quantity</span>
                  <span className="font-bold text-slate-900">{inspectingBatch.quantityKg || inspectingBatch.quantity} kg</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Harvest Date</span>
                  <span className="font-bold text-slate-900">{inspectingBatch.harvestDate}</span>
                </div>
              </div>

              {/* Physical Parameters */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>Quality & Physiological Measurements</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tare Scale Net Weight (kg)</label>
                    <input
                      type="number"
                      min={1}
                      value={tareWeightKg}
                      onChange={(e) => setTareWeightKg(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold focus:bg-white focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Visual Lot Grade</label>
                    <select
                      value={visualGrade}
                      onChange={(e) => setVisualGrade(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold focus:bg-white focus:border-blue-500"
                    >
                      <option value="Grade A (Export)">Grade A (Export Quality)</option>
                      <option value="Grade B (Premium)">Grade B (Premium Mandi)</option>
                      <option value="Standard">Standard Retail Lot</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Brix Sweetness Reading</label>
                    <input
                      type="text"
                      value={brixRating}
                      onChange={(e) => setBrixRating(e.target.value)}
                      placeholder="e.g. 18.4° Brix"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Moisture Level</label>
                    <input
                      type="text"
                      value={moistureReading}
                      onChange={(e) => setMoistureReading(e.target.value)}
                      placeholder="e.g. 14.2%"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Intake Depot / Bay</label>
                  <input
                    type="text"
                    value={intakeLocation}
                    onChange={(e) => setIntakeLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                {/* Pesticide Verification Checkbox */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 block">Pesticide Residue Lab Clearance</span>
                    <span className="text-[11px] text-slate-500">APEDA accredited laboratory test certified zero harmful residues</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pesticideTestPassed}
                      onChange={(e) => setPesticideTestPassed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Warehouse Receiver Notes</label>
                  <textarea
                    rows={2}
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Cryptographic notice */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                By signing, receiver <strong>{currentUser?.name || 'Vikram Mehra'}</strong> certifies that physical goods have been inspected and acknowledged into cold custody. The smart contract state will update to <strong>At Distributor</strong> on Ethereum Sepolia.
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Signing Smart Contract...' : 'Sign Digital BOL & Accept Custody'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingBatch(null)}
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
