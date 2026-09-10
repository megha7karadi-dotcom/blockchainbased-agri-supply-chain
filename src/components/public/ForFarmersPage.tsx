import React from 'react';
import { 
  Sprout, 
  TrendingUp, 
  ShieldCheck, 
  QrCode, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Award,
  Users,
  LineChart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ForFarmersPage: React.FC = () => {
  const { setActiveTab, setRole, users, setCurrentUser } = useApp();

  const handleFarmerDemo = () => {
    const farmerUser = users.find(u => u.role === 'farmer');
    if (farmerUser) setCurrentUser(farmerUser);
    setRole('farmer');
    setActiveTab('farmer-dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-xs font-semibold text-emerald-200">
          <Sprout className="w-3.5 h-3.5" />
          <span>AgriTrace Grower Solutions</span>
        </div>

        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Fair Compensation. Unbroken Provenance. Total Ownership.
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            AgriTrace equips farmers, grower collectives, and Farmer Producer Organizations (FPOs) with digital batch certificates, transparent farmgate price recording, and predictive market intelligence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('register')}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
          >
            <span>Register Your Farm</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleFarmerDemo}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl backdrop-blur-xs transition border border-white/20"
          >
            Explore Farmer Portal
          </button>
        </div>
      </div>

      {/* Core Benefits Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How AgriTrace Protects Your Harvest & Income
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Engineered to eliminate information asymmetry and preserve agricultural brand value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Guaranteed Fair Price Index</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your farmgate base price is recorded directly onto the ledger. Consumers can see exactly what percentage you received, stopping excessive middleman margin extraction.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">GI & Brand Authenticity Protection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Protect your premium Geographical Indication crops (like Ratnagiri Alphonso or Dehradun Basmati) from counterfeit relabeling with tamper-evident QR batch certificates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700 font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Predictive Price Intelligence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Access real-time APMC mandi forecasts and 7 to 30 day price trajectories to determine whether to harvest immediately, hold in cold storage, or ship to high-demand markets.
            </p>
          </div>
        </div>
      </div>

      {/* Simple 3-step farmer workflow */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-8">
        <h3 className="text-xl font-bold text-slate-900">Simple 3-Step Farmgate Onboarding</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">1</span>
              <h4 className="font-bold text-sm text-slate-900">Log Harvest Lot</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-11">
              Enter crop name, variety, harvest date, GPS coordinates, organic cert number, and base price per kg.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">2</span>
              <h4 className="font-bold text-sm text-slate-900">Generate QR Tags</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-11">
              Print or attach verifiable QR labels onto crates and sacks right in the orchard or processing shed.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">3</span>
              <h4 className="font-bold text-sm text-slate-900">Hand Off With Audit</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-11">
              When the distributor truck arrives, both parties confirm the digital custody transfer in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold">Ready to get your produce verified?</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Join hundreds of organic growers and cooperatives already tracing with AgriTrace.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('register')}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition whitespace-nowrap"
        >
          Create Farmer Account
        </button>
      </div>

    </div>
  );
};
