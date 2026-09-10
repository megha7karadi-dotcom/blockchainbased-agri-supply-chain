import React from 'react';
import { 
  Building2, 
  Truck, 
  Store, 
  ThermometerSnowflake, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ForBusinessesPage: React.FC = () => {
  const { setActiveTab, setRole, users, setCurrentUser } = useApp();

  const handleDistributorDemo = () => {
    const distUser = users.find(u => u.role === 'distributor');
    if (distUser) setCurrentUser(distUser);
    setRole('distributor');
    setActiveTab('distributor-dashboard');
  };

  const handleRetailerDemo = () => {
    const retUser = users.find(u => u.role === 'retailer');
    if (retUser) setCurrentUser(retUser);
    setRole('retailer');
    setActiveTab('retailer-dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-6 border border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400">
          <Building2 className="w-3.5 h-3.5" />
          <span>Enterprise Supply-Chain Solutions</span>
        </div>

        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Enterprise Traceability for Modern Agricultural Commerce
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            AgriTrace integrates distributors, cold-chain transport fleets, and modern grocery retailers into an authenticated, tamper-evident custody pipeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('register')}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
          >
            <span>Partner With AgriTrace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleDistributorDemo}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl backdrop-blur-xs transition border border-white/20"
          >
            Distributor Portal
          </button>
          <button
            onClick={handleRetailerDemo}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl backdrop-blur-xs transition border border-white/20"
          >
            Retailer Portal
          </button>
        </div>
      </div>

      {/* Two Pillars: Distributors vs Retailers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pillar 1: Distributors */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">For Logistics & Distributors</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Maintain audited custody records, prove cold-chain compliance, and streamline wholesale handoffs with zero paper friction.
            </p>

            <ul className="space-y-3 pt-2">
              {[
                { title: 'Continuous IoT Cold-Chain Logging', desc: 'Real-time temperature and humidity telemetry streams published directly to tamper-evident batch logs.' },
                { title: 'Digital Proof of Custody', desc: 'Multi-signature custody transfers prevent unauthorized diversion and protect against cargo liability disputes.' },
                { title: 'Transparent Margin Justification', desc: 'Transparently log transport, refrigeration, and packing costs to prove fair value addition to buyers.' }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">{item.title}</strong>
                    <span className="text-slate-500">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleDistributorDemo}
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <span>Explore Distributor Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pillar 2: Retailers */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">For Supermarkets & Retailers</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Earn customer trust, charge sustainable premiums for verified organics, and satisfy compliance requirements effortlessly.
            </p>

            <ul className="space-y-3 pt-2">
              {[
                { title: 'Verified Farm-to-Shelf Provenance', desc: 'Give your shoppers the ability to scan and see exactly which farm, farmer, and harvest lot their fruit came from.' },
                { title: 'Automated Fair Price Compliance', desc: 'Demonstrate transparent retail markups that adhere to government APMC and fair-trade standards.' },
                { title: 'Zero Residue & Lab Cert Verification', desc: 'Instantly view APEDA and organic pesticide laboratory certificates before stocking inventory.' }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">{item.title}</strong>
                    <span className="text-slate-500">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleRetailerDemo}
              className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <span>Explore Retailer Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Enterprise Security Section */}
      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>Enterprise Trust & Integration Specs</span>
        </h3>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          AgriTrace operates as a decentralized event engine with open API adapters. Existing ERP systems (SAP, Oracle SCM, Microsoft Dynamics) can synchronize batch intake and dispatch events directly with our smart contract verification layer.
        </p>
      </div>

    </div>
  );
};
