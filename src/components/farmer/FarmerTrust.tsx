import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  FileText, 
  Check, 
  PlusCircle, 
  ExternalLink, 
  Download, 
  FlaskConical, 
  MapPin, 
  Calendar,
  MessageSquare,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface AuditLog {
  id: string;
  date: string;
  title: string;
  certId: string;
  status: string;
  auditor: string;
  expiryDate: string;
  documentHash: string;
}

export interface ConsumerReview {
  id: string;
  consumerName: string;
  location: string;
  rating: number;
  date: string;
  batchId: string;
  crop: string;
  comment: string;
  verifiedScan: boolean;
}

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-01',
    date: '2026-04-10',
    title: 'Annual APEDA Organic Certification Audit (NPOP)',
    certId: 'NPOP/NAB/0014/MH/2026',
    status: 'Passed (Zero Synthetic Residues)',
    auditor: 'State Agricultural Testing Laboratory, Pune',
    expiryDate: '2027-04-09',
    documentHash: '0x8f192...bc019',
  },
  {
    id: 'aud-02',
    date: '2026-03-15',
    title: 'Soil pH, Organic Carbon & Microbial Health Assessment',
    certId: 'SOIL-LAB-78901',
    status: 'Optimal (pH 6.8, Organic Carbon 1.2%)',
    auditor: 'Dr. Balasaheb Sawant Konkan Krishi Vidyapeeth, Dapoli',
    expiryDate: '2027-03-14',
    documentHash: '0x3dc81...91045',
  },
  {
    id: 'aud-03',
    date: '2026-02-28',
    title: 'Irrigation Borewell Heavy Metals Screening (GC-MS)',
    certId: 'WATER-TEST-3419',
    status: 'Clean (Zero Lead, Arsenic & Cadmium)',
    auditor: 'Maharashtra Pollution Control Board Testing Cell',
    expiryDate: '2027-02-27',
    documentHash: '0x71c22...88492',
  },
  {
    id: 'aud-04',
    date: '2025-11-20',
    title: 'Geographical Indication (GI) Authorization Inspection',
    certId: 'GI-APEDA-MH-139',
    status: 'Authorized Authentic Alphonso (GI Tag 139)',
    auditor: 'Konkan Hapus Mango Producers Association',
    expiryDate: 'Permanent (Subject to Annual Audit)',
    documentHash: '0x55aa9...11928',
  },
];

const INITIAL_CONSUMER_REVIEWS: ConsumerReview[] = [
  {
    id: 'rev-01',
    consumerName: 'Priya Nair',
    location: 'Worli, Mumbai',
    rating: 5,
    date: '2026-05-11',
    batchId: 'AGRI-2026-MNG-001',
    crop: 'Alphonso Mango',
    comment: 'Incredible aroma and sweetness! Scanned the QR sticker at FreshRoot store and verified Rameshji grew it in Ratnagiri without calcium carbide ripening.',
    verifiedScan: true,
  },
  {
    id: 'rev-02',
    consumerName: 'Amitabh Sen',
    location: 'Indiranagar, Bengaluru',
    rating: 5,
    date: '2026-05-09',
    batchId: 'AGRI-2026-RIC-002',
    crop: 'Basmati Rice',
    comment: 'Authentic long grain and zero pesticide taste. Knowing the farmer received ₹65/kg direct makes paying fair retail price completely worthwhile.',
    verifiedScan: true,
  },
  {
    id: 'rev-03',
    consumerName: 'Kavita Joshi',
    location: 'Aundh, Pune',
    rating: 4.8,
    date: '2026-05-04',
    batchId: 'AGRI-2026-TOM-003',
    crop: 'Vine Tomatoes',
    comment: 'Super fresh and firm. Cold chain temperature log showed 11°C consistent transit from farm to shelf.',
    verifiedScan: true,
  },
];

export const FarmerTrust: React.FC = () => {
  const { currentUser } = useApp();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testType, setTestType] = useState('Pesticide Multi-Residue Screening (GC-MS)');
  const [plotName, setPlotName] = useState('Plot A - Main Orchard (8.5 Acres)');
  const [selectedLab, setSelectedLab] = useState('State Agricultural Testing Laboratory, Pune');
  const [preferredDate, setPreferredDate] = useState('2026-05-22');
  const [requestNotice, setRequestNotice] = useState<string | null>(null);

  const trustScore = currentUser?.trustScore || 98;

  const handleScheduleTest = (e: React.FormEvent) => {
    e.preventDefault();

    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      date: preferredDate,
      title: testType,
      certId: `PENDING-ORACLE-${Date.now().toString().slice(-5)}`,
      status: 'Sample Collection Scheduled (On-Farm Visit)',
      auditor: selectedLab,
      expiryDate: 'Pending Test Completion',
      documentHash: '0x' + Array.from({length: 12}, () => Math.floor(Math.random()*16).toString(16)).join(''),
    };

    setAuditLogs([newAudit, ...auditLogs]);
    setIsTestModalOpen(false);
    setRequestNotice(`Inspection Scheduled! ${selectedLab} field officers will collect leaf/soil samples on ${preferredDate} for ${plotName}.`);

    setTimeout(() => {
      setRequestNotice(null);
    }, 7000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Toast Notice */}
      {requestNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-semibold animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{requestNotice}</span>
          </div>
          <button 
            onClick={() => setRequestNotice(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>Farmer Trust, Certification & Reputation Oracle</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Decentralized reputation score computed autonomously via laboratory test oracles, SLA tracking, and consumer scans
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Request Lab / Soil Test</span>
          </button>
        </div>
      </div>

      {/* Main Scorecard */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50 text-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{currentUser?.name || 'Ramesh Patil'}</h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-md leading-relaxed">
            Consensus trust standing permits zero-collateral forward procurement contracts, advance escrow deposits, and priority cold-chain allocation.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-medium text-emerald-800">
            <span>• 100% Residue-Free</span>
            <span>• FSSAI Registered</span>
            <span>• GI Authorized Origin</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center flex-shrink-0 w-48 shadow-2xs">
          <div className="text-4xl sm:text-5xl font-black text-emerald-700">{trustScore}</div>
          <div className="text-xs text-slate-600 font-semibold mt-1">Out of 100 Points</div>
          <div className="flex justify-center gap-1 mt-2 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono">Consensus Proof Active</div>
        </div>
      </div>

      {/* Score Breakdown Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Chemical Residues</span>
          <div className="text-2xl font-black text-emerald-700">100% Clean</div>
          <div className="text-[11px] text-slate-500">Zero synthetic chemical residues</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Dispatch SLA</span>
          <div className="text-2xl font-black text-slate-900">98.2%</div>
          <div className="text-[11px] text-slate-500">Delivered to cold reefers on time</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">GPS Land Survey</span>
          <div className="text-2xl font-black text-slate-900">100% Verified</div>
          <div className="text-[11px] text-emerald-700 font-medium">Cadastral survey on-chain</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Consumer QR Rating</span>
          <div className="text-2xl font-black text-amber-600">4.9 / 5.0</div>
          <div className="text-[11px] text-slate-500">Across 850+ QR smartphone scans</div>
        </div>
      </div>

      {/* Certified Laboratory Audit Trail */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Cryptographically Audited Certificates & Tests</h3>
            <p className="text-xs text-slate-500">Verified by state agricultural universities and authorized testing labs</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 self-start sm:self-auto">
            Oracles Verified On-Chain
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{log.title}</span>
                </div>
                <div className="text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Auditor: <strong className="text-slate-700">{log.auditor}</strong></span>
                  <span>•</span>
                  <span>Certificate ID: <strong className="font-mono text-emerald-800">{log.certId}</strong></span>
                  <span>•</span>
                  <span>Expiry: {log.expiryDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                <span className={`text-xs font-semibold ${
                  log.status.includes('Passed') || log.status.includes('Optimal') || log.status.includes('Authorized') || log.status.includes('Clean')
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}>
                  {log.status}
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">{log.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Consumer Feedback from QR Scans */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Verified Consumer Reviews (via QR Scans)</h3>
            <p className="text-xs text-slate-500">Real feedback submitted by consumers who scanned packaging QR tags</p>
          </div>
          <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>4.9 / 5.0 Average</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_CONSUMER_REVIEWS.map(rev => (
            <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{rev.consumerName}</span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(rev.rating) ? 'fill-amber-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400">{rev.location} • {rev.crop}</div>
                <p className="text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                <span className="font-mono text-emerald-700 font-bold">{rev.batchId}</span>
                <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Scan</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REQUEST LAB TEST MODAL */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Schedule Field Lab Inspection</h3>
              </div>
              <button 
                onClick={() => setIsTestModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleTest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Test Type</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-800"
                >
                  <option value="Pesticide Multi-Residue Screening (GC-MS)">Pesticide Multi-Residue Screening (GC-MS / LC-MS)</option>
                  <option value="Soil Health Card & NPK Micro-Nutrient Test">Soil Health Card & NPK Micro-Nutrient Test</option>
                  <option value="Irrigation Borewell Heavy Metals Screening">Irrigation Borewell Heavy Metals Screening</option>
                  <option value="APEDA NPOP Organic Certification Renewal">APEDA NPOP Organic Certification Renewal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agricultural Plot / Field</label>
                <select
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-800"
                >
                  <option value="Plot A - Main Orchard (8.5 Acres)">Plot A - Main Orchard (8.5 Acres - Mango/Fruit)</option>
                  <option value="Plot B - Organic Polyhouse (3.2 Acres)">Plot B - Organic Polyhouse (3.2 Acres - Vine Tomatoes)</option>
                  <option value="Plot C - Terraced Basmati Paddies (12 Acres)">Plot C - Terraced Basmati Paddies (12 Acres)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Accredited Testing Laboratory</label>
                <select
                  value={selectedLab}
                  onChange={(e) => setSelectedLab(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-800"
                >
                  <option value="State Agricultural Testing Laboratory, Pune">State Agricultural Testing Laboratory, Pune</option>
                  <option value="Konkan Krishi Vidyapeeth Agro Lab, Dapoli">Konkan Krishi Vidyapeeth Agro Lab, Dapoli</option>
                  <option value="MPKV Soil & Water Department, Rahuri">MPKV Soil & Water Department, Rahuri</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Sample Collection Date</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Test results will be cryptographically anchored to your AgriTrace account upon lab completion.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Confirm Inspection Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
