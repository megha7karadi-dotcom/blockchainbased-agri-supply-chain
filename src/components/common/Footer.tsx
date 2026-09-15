import React from 'react';
import { 
  Leaf, 
  ShieldCheck, 
  Lock, 
  Sprout, 
  Truck, 
  Store, 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { navigate } = useApp();

  const handlePublicNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 text-xs">
      {/* Top Banner / Value Proposition */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-slate-100">
          
          {/* Column 1: Brand Info (span 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <button 
              onClick={() => handlePublicNavigate('/')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xs">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-black text-lg tracking-tight text-slate-900">
                    Agri<span className="text-emerald-600">Trace</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Transparent. Traceable. Trusted.
                </p>
              </div>
            </button>

            <p className="text-slate-600 text-xs leading-relaxed max-w-sm">
              AgriTrace is a digital agricultural supply-chain platform providing verifiable produce provenance, fair farmer price compensation, and IoT cold-chain tracking from farm to shelf.
            </p>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cryptographically verified provenance & anti-fraud auditing</span>
            </div>
          </div>

          {/* Column 2: Platform Solutions */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Solutions</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/for-farmers')}
                  className="hover:text-emerald-700 transition flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  <span>For Farmers & Growers</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/for-businesses')}
                  className="hover:text-emerald-700 transition flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>For Logistics & Distributors</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/for-businesses')}
                  className="hover:text-emerald-700 transition flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5 text-purple-600" />
                  <span>For Retailers & Supermarkets</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/trace-products')}
                  className="hover:text-emerald-700 transition flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Consumer Produce Verification</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/login')}
                  className="hover:text-emerald-700 transition flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Participant Sign In</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Standards */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/how-it-works')}
                  className="hover:text-emerald-700 transition text-left cursor-pointer"
                >
                  How Traceability Works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/trace-products')}
                  className="hover:text-emerald-700 transition text-left cursor-pointer"
                >
                  Produce Registry
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/resources')}
                  className="hover:text-emerald-700 transition text-left cursor-pointer"
                >
                  Price Transparency Models
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/resources')}
                  className="hover:text-emerald-700 transition text-left cursor-pointer"
                >
                  Cold-Chain Monitoring Guidelines
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/resources')}
                  className="hover:text-emerald-700 transition text-left cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform & Trust */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/about')}
                  className="hover:text-emerald-700 transition text-left cursor-pointer"
                >
                  About AgriTrace
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/for-farmers')}
                  className="hover:text-emerald-700 transition text-left cursor-pointer"
                >
                  Fair Price Guarantee
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/for-businesses')}
                  className="hover:text-emerald-700 transition text-left cursor-pointer"
                >
                  Commercial Integration
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/resources')}
                  className="hover:text-emerald-700 transition text-left cursor-pointer"
                >
                  Data Transparency Principles
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handlePublicNavigate('/signup')}
                  className="hover:text-emerald-700 transition text-left cursor-pointer"
                >
                  Join the Network
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} AgriTrace Platform. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Tamper-evident verification protocol</span>
            </span>
            <span className="font-mono text-slate-400">v2.4 Production</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
