import React from 'react';
import { motion } from 'motion/react';
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
      
      {/* Hero - Unified Light Theme with Agriculture Photography */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50 border border-emerald-200/80 p-8 sm:p-12 text-slate-900 shadow-xs"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
              Fair Compensation. <span className="text-emerald-700">Unbroken Provenance.</span> Total Ownership.
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              AgriTrace equips farmers, grower collectives, and Farmer Producer Organizations (FPOs) with digital batch certificates, transparent farmgate price recording, and predictive market intelligence.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('register')}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <span>Register Your Farm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleFarmerDemo}
                className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl transition border border-slate-300 shadow-2xs cursor-pointer"
              >
                Explore Farmer Portal
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-emerald-200/80 shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80" 
                alt="Fresh farm harvest produce" 
                className="w-full h-64 sm:h-72 object-cover hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Pawapuri Agro-Heritage</div>
                  <div className="text-[10px] text-slate-500">Ratnagiri, Maharashtra • GI Certified</div>
                </div>
                <span className="text-xs font-semibold text-emerald-700">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
          <motion.div 
            whileHover={{ y: -4 }}
            className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="h-40 relative overflow-hidden bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1592417817098-8f3d69104a47?auto=format&fit=crop&w=600&q=80" 
                  alt="Harvest pricing and fair trade" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Guaranteed Fair Price Index</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your farmgate base price is recorded directly onto the ledger. Consumers can see exactly what percentage you received, stopping excessive middleman margin extraction.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="h-40 relative overflow-hidden bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80" 
                  alt="Geographical Indication certified produce" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">GI & Brand Authenticity Protection</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Protect your premium Geographical Indication crops (like Ratnagiri Alphonso or Dehradun Basmati) from counterfeit relabeling with tamper-evident QR batch certificates.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="h-40 relative overflow-hidden bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80" 
                  alt="Smart agricultural crop analytics" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700 font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Predictive Price Intelligence</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Access real-time APMC mandi forecasts and 7 to 30 day price trajectories to determine whether to harvest immediately, hold in cold storage, or ship to high-demand markets.
                </p>
              </div>
            </div>
          </motion.div>
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
      <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
        <div>
          <h3 className="text-xl font-bold text-emerald-950">Ready to get your produce verified?</h3>
          <p className="text-xs sm:text-sm text-emerald-800 mt-1">
            Join hundreds of organic growers and cooperatives already tracing with AgriTrace.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('register')}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition whitespace-nowrap shadow-xs cursor-pointer"
        >
          Create Farmer Account
        </button>
      </div>

    </div>
  );
};
