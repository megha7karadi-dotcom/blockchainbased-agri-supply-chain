import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Award, 
  Key, 
  CheckCircle2, 
  Calendar,
  Layers,
  Sprout,
  Truck,
  Store,
  Shield,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProfilePage: React.FC = () => {
  const { currentUser, currentRole, navigate, logoutUser } = useApp();
  const [isSaved, setIsSaved] = useState(false);

  if (!currentUser) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">No active profile session found.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const getRoleIcon = () => {
    switch (currentRole) {
      case 'farmer': return <Sprout className="w-5 h-5 text-emerald-600" />;
      case 'distributor': return <Truck className="w-5 h-5 text-blue-600" />;
      case 'retailer': return <Store className="w-5 h-5 text-purple-600" />;
      case 'consumer': return <User className="w-5 h-5 text-teal-600" />;
      case 'admin': return <Shield className="w-5 h-5 text-amber-600" />;
      default: return <User className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold flex items-center justify-center text-xl overflow-hidden shadow-xs shrink-0">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              <span>{currentUser.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{currentUser.name}</h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 capitalize">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {currentUser.kycStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.organization || 'AgriTrace Verified Participant'} • {currentUser.location}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            onClick={() => navigate(`/${currentRole}/dashboard`)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Go to Dashboard
          </button>
          <button
            onClick={logoutUser}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account & Security */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Cryptographic Identity
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Wallet / Node Address</span>
                <span className="font-mono text-xs text-slate-900 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 block break-all mt-1">
                  {currentUser.walletAddress}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Consensus Role</span>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleIcon()}
                  <span className="text-xs font-bold text-slate-800 capitalize">
                    {currentRole} Node
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Reputation / Trust Score</span>
                <div className="flex items-center gap-2 mt-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-base font-black text-slate-900">
                    {currentUser.trustScore} / 100
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Member Since</span>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.registeredDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-3xl p-6 border border-emerald-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Smart Contract Verified</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Your cryptographic credentials are validated against the agricultural distributed ledger. All batches minted or transacted carry non-repudiable audit trails.
            </p>
          </div>
        </div>

        {/* Right Column: Contact & Organization Info */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Participant Credentials</h2>
              <p className="text-xs text-slate-500">Authorized contact and compliance coordinates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </span>
              <span className="font-semibold text-xs text-slate-900 block truncate">
                {currentUser.email}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact Phone</span>
              </span>
              <span className="font-semibold text-xs text-slate-900 block truncate">
                {currentUser.phone}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Organization / Collective</span>
              </span>
              <span className="font-semibold text-xs text-slate-900 block truncate">
                {currentUser.organization || 'Individual Producer'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Operational Location</span>
              </span>
              <span className="font-semibold text-xs text-slate-900 block truncate">
                {currentUser.location}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Governance & Compliance Badges
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                APEDA Certified Producer
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
                FSSAI Food Safety Cleared
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-200">
                Fair Pricing Protocol Signatory
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                Zero-Residue Organic Audit
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Need to update legal registrations or APEDA certificates?
            </span>
            <button
              onClick={() => alert('Compliance certificate renewal portal opens via government DigiLocker integration.')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
            >
              Update Certificates →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
