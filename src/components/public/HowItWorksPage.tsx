import React, { useState } from 'react';
import { 
  Sprout, 
  Truck, 
  Store, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  FileCode, 
  Cpu, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HowItWorksPage: React.FC = () => {
  const { setRole } = useApp();
  const [selectedStage, setSelectedStage] = useState<number>(1);

  const stages = [
    {
      num: 1,
      title: 'Stage 1: Farm Origin & Token Minting',
      actor: 'Farmer',
      roleKey: 'farmer' as const,
      icon: <Sprout className="w-6 h-6 text-emerald-600" />,
      tagline: 'Harvest recorded at source with GPS & Organic Certifications',
      description: 'The farmer logs harvest date, variety, quantity, soil conditions, and farmgate base price. The system generates an ERC-1155 smart contract batch token with a unique Batch ID and cryptographic hash.',
      blockchainPayload: {
        event: 'BatchMinted',
        contract: 'AgriTraceToken.sol (ERC-1155)',
        parameters: {
          tokenId: '0x001_MNG_HAPUS',
          farmerAddress: '0x71C2...3F82',
          cropCategory: 'Fruits',
          geoCoords: '16.9902° N, 73.3120° E',
          basePricePerKg: '₹120.00',
        },
      },
      benefits: [
        'Establishes unalterable provenance',
        'Guarantees fair base compensation for the farmer',
        'Generates printable cryptographic batch tag',
      ],
    },
    {
      num: 2,
      title: 'Stage 2: Reefer Logistics & IoT Telemetry',
      actor: 'Distributor',
      roleKey: 'distributor' as const,
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      tagline: 'Cold-chain vehicle tracking & verified logistics markup',
      description: 'The distributor accepts custody of the batch, logs transport and refrigeration expenses, and sets an audited wholesale margin. In transit, IoT sensors continuously publish temperature and humidity readings.',
      blockchainPayload: {
        event: 'CustodyTransferred & TelemetryLogged',
        contract: 'AgriTraceEscrow.sol',
        parameters: {
          from: '0x71C2...3F82 (Farmer)',
          to: '0x94B1...89D1 (Distributor)',
          logisticsExpense: '₹25.00/kg',
          distributorMargin: '₹15.00/kg',
          avgTransitTemp: '12.2°C (Optimal)',
        },
      },
      benefits: [
        'Continuous cold-chain audit trail',
        'Automated alerts on temperature excursion anomalies',
        'Transparent logistics costs recorded to prevent price gouging',
      ],
    },
    {
      num: 3,
      title: 'Stage 3: Retail Stocking & Shelf Pricing',
      actor: 'Retailer',
      roleKey: 'retailer' as const,
      icon: <Store className="w-6 h-6 text-purple-600" />,
      tagline: 'Store inspection, quality grading, and fair price ceiling check',
      description: 'The retailer scans the arriving crate, confirms zero bruising and intact tamper seals, and registers the produce onto retail inventory. Store overhead and retail profit are logged transparently.',
      blockchainPayload: {
        event: 'RetailInventoryStaged',
        contract: 'AgriTraceRegistry.sol',
        parameters: {
          retailerAddress: '0x1F2A...A4C9',
          storeOverhead: '₹15.00/kg',
          retailMargin: '₹20.00/kg',
          finalConsumerPrice: '₹195.00/kg',
          fairCeilingCheck: 'Passed (Under ₹210.00 ceiling)',
        },
      },
      benefits: [
        'Retailers cannot hide artificial price hikes',
        'Store shelf life and freshness index certified',
        'Batch QR labels placed directly on consumer packaging',
      ],
    },
    {
      num: 4,
      title: 'Stage 4: Consumer Scan & Provenance Proof',
      actor: 'Consumer',
      roleKey: 'consumer' as const,
      icon: <ShoppingBag className="w-6 h-6 text-teal-600" />,
      tagline: 'Instant mobile verification of origin, quality, and fair share',
      description: 'At the supermarket or at home, the consumer scans the QR code on the packaging using their smartphone camera. They view the full journey timeline, farmer bio, pesticide test report, and the middleman price breakdown.',
      blockchainPayload: {
        event: 'BatchVerified & ConsumerCheckout',
        contract: 'AgriTraceConsumerPortal.sol',
        parameters: {
          consumerScanTimestamp: '2026-05-12 10:45 AM',
          merkleProofValid: true,
          farmerShareRetained: '62% (High Fairness)',
          zeroResidueCertification: 'Verified Active',
        },
      },
      benefits: [
        '100% confidence in authentic organic produce',
        'Knowing exactly how much the farmer was paid',
        'Zero reliance on unverified commercial labels',
      ],
    },
  ];

  const current = stages[selectedStage - 1];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          How the AgriTrace System Works
        </h1>
        <p className="text-sm text-slate-600">
          A synchronized 4-stage smart contract pipeline ensuring every physical agricultural handover is validated cryptographically.
        </p>
      </div>

      {/* Interactive Step Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stages.map((stg) => {
          const isSelected = selectedStage === stg.num;
          return (
            <button
              key={stg.num}
              onClick={() => setSelectedStage(stg.num)}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/50'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                  isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  0{stg.num}
                </span>
                <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {stg.actor}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-bold truncate">
                {(stg.title || '').split(':')[1] || stg.title || ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-200">
              {current.icon}
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{current.actor} Perspective</span>
              <h2 className="text-xl font-bold text-slate-900">{current.title}</h2>
            </div>
          </div>

          <button
            onClick={() => setRole(current.roleKey)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto shadow-xs"
          >
            <span>Open {current.actor} Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
          {current.tagline}
        </p>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {current.description}
        </p>

        {/* Two-column: Benefits + Smart Contract JSON Payload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* Key Advantages */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Key Value Chain Advantages</span>
            </h3>
            <ul className="space-y-2.5">
              {current.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Smart Contract Event Mock */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Smart Contract Event Log</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">Ethereum Sepolia</span>
            </div>
            <pre className="text-[11px] overflow-x-auto text-emerald-300 py-1">
              {JSON.stringify(current.blockchainPayload, null, 2)}
            </pre>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
              Immutable on-chain event signed with caller cryptographic key and verified with SHA-256 state proof.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
