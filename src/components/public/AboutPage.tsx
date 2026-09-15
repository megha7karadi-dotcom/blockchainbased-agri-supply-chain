import React from 'react';
import { motion } from 'motion/react';
import { 
  Leaf, 
  Target, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Cpu, 
  TrendingUp, 
  Database, 
  Lock,
  Building2,
  Award,
  Users,
  Globe2,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AboutPage: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-5xl mx-auto space-y-12 pb-16"
    >
      
      {/* Hero Header */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs">
        <div className="h-64 relative overflow-hidden bg-slate-100">
          <img 
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80" 
            alt="Verifiable organic agriculture fields" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/50 to-transparent flex items-end p-8 sm:p-12">
            <div className="space-y-2 text-white">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Rebuilding Trust Across the Global Agricultural Supply Chain
              </h1>
              <p className="text-slate-200 text-sm sm:text-base max-w-3xl leading-relaxed">
                AgriTrace is a digital agricultural infrastructure platform connecting farmers, distributors, retailers, and consumers through verifiable produce provenance, equitable price distribution, and tamper-evident quality records.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Agricultural Supply Chain Crisis */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 text-rose-700 font-bold text-lg">
          <ShieldAlert className="w-5 h-5" />
          <h2>The Supply Chain Imperative</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Traditional agricultural commerce is burdened by deep informational asymmetry, unmonitored transit spoilage, and non-value-adding intermediaries. In standard horticultural trade:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Predatory Middleman Margins</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Smallholder farmers frequently capture less than <strong>25%</strong> of the consumer dollar, while layers of brokers and intermediaries artificially inflate shelf prices without investing in crop handling or farmer welfare.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Rampant Counterfeiting of Premium GI Crops</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Geographical Indication (GI) harvests such as Ratnagiri Alphonso mangoes and Dehradun Basmati rice suffer widespread fraudulent relabeling in wholesale markets, eroding honest farm reputations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Post-Harvest Cold-Chain Breakdowns</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Over <strong>30%</strong> of fresh produce perishes during transportation due to undocumented refrigeration failure in transit vehicles, with no accountability for logistics negligence.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Lack of Verifiable Food Safety Proof</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consumers lack direct, tamper-proof proof of pesticide residue test results, harvest dates, and organic certifications at the grocery aisle, relying on unverifiable static stickers.
            </p>
          </div>
        </div>
      </div>

      {/* The AgriTrace Commercial Platform */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-lg">
          <Layers className="w-5 h-5" />
          <h2>Enterprise Multi-Tier Architecture</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">1. Unified Role Portals</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Custom-tailored web and mobile applications for farmers, distributors, retailers, and consumers, featuring offline-first data caching and camera-based QR optical verification.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">2. Ethereum Sepolia Smart Contracts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Solidity smart contracts mint ERC-1155 batch tokens representing physical produce lots. Multi-party custody handoffs require cryptographically signed transactions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">3. AI Price & Quality Intelligence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Predictive time-series machine learning models analyze regional mandi arrivals, meteorological parameters, and seasonal demand to guide fair grower pricing and prevent distress selling.
            </p>
          </div>
        </div>
      </div>

      {/* Measurable Value Delivered */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Driving Measurable Results for Agriculture</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-700">100%</div>
            <div className="font-bold text-xs sm:text-sm text-slate-900">Full-Chain Traceability</div>
            <p className="text-xs text-slate-600">Continuous audit trail from farm harvest to retail consumer cart.</p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-blue-700">+35%</div>
            <div className="font-bold text-xs sm:text-sm text-slate-900">Farmer Revenue Uplift</div>
            <p className="text-xs text-slate-600">Higher farmgate realization through transparent price margin caps.</p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-purple-700">&lt; 1.2s</div>
            <div className="font-bold text-xs sm:text-sm text-slate-900">Mobile QR Verification</div>
            <p className="text-xs text-slate-600">Instant verification on smartphone browser with zero app installation.</p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-emerald-950">Ready to trace produce with AgriTrace?</h3>
          <p className="text-xs sm:text-sm text-emerald-800 mt-1">
            Explore active verified batches or learn how physical produce handovers are cryptographically recorded.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('trace-products')}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Explore Batches
          </button>
          <button
            onClick={() => setActiveTab('how-it-works')}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl transition"
          >
            How It Works
          </button>
        </div>
      </div>

    </motion.div>
  );
};
