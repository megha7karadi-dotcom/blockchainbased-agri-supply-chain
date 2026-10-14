import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Award,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ResourcesPage: React.FC = () => {
  const { setActiveTab } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does AgriTrace ensure agricultural data is authentic and not falsified at the farm level?',
      a: 'AgriTrace combines multi-factor verification at the point of origin: GPS coordinates from the farmer’s verified plot, timestamped harvest logs, cross-referenced APEDA/NPOP organic certification numbers, and biometric/cryptographic digital signatures. Once logged, the batch record is hashed on-chain, preventing retro-active alteration.'
    },
    {
      q: 'Do consumers need a cryptocurrency wallet or Web3 app to verify produce?',
      a: 'No. AgriTrace was engineered specifically for mainstream consumer accessibility. Any consumer can simply point their smartphone camera at the physical QR code on the packaging to instantly view the complete farm-to-shelf provenance, cold-chain history, and price breakdown in their web browser without downloading any app or creating an account.'
    },
    {
      q: 'How is the Fair Price Index calculated across the supply chain?',
      a: 'AgriTrace compares the farmgate base price with regional APMC mandi benchmarks and standard logistical expense bands (transport, packaging, cold storage, retail shelf overhead). The platform caps non-value-adding margins, displaying the exact percentage split so consumers can verify that the farmer was equitably compensated.'
    },
    {
      q: 'What role does the Ethereum Sepolia network play in AgriTrace?',
      a: 'The blockchain layer serves as an immutable public notary. Every critical milestone—batch minting, custody transfers between distributor and retailer, IoT cold-chain excursions, and shelf price updates—is recorded as a verifiable cryptographic transaction with an unalterable timestamp and transaction hash.'
    },
    {
      q: 'How are temperature excursions detected during transit?',
      a: 'Refrigerated logistics vehicles and warehouse cold rooms are equipped with IoT temperature and humidity dataloggers. When environmental metrics exceed predefined safety thresholds (e.g. above 15°C for mangoes), an automated compliance alert is recorded on the batch record, quarantining compromised stock before it reaches consumer shelves.'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-5xl mx-auto space-y-12 pb-16"
    >
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          AgriTrace Resources & Standards
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
          Technical specifications, supply chain economics benchmarks, and regulatory compliance frameworks powering transparent agricultural commerce.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Traceability Architecture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Learn how physical produce batches are bound to digital tokens, cryptographic proofs, and multi-actor custody checkpoints.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('how-it-works')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Read 4-Stage Workflow</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Pricing Transparency Index</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discover how our fair-trade pricing algorithm benchmarks producer compensation against national APMC market indices.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('trace-products')}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Explore Price Breakdowns</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Quality Certifications</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Understand our integration with APEDA organic standards, FSSAI cold-chain regulations, and NPOP lab residue testing protocols.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('about')}
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
          >
            <span>View Standards & Partners</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Common questions regarding agricultural supply-chain traceability, farmer payouts, and data verification.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed animate-in fade-in">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </motion.div>
  );
};
