import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Layers, 
  Cpu, 
  Activity, 
  Lock, 
  Check, 
  X,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CryptoHashDisplay } from '../common/CryptoHashDisplay';

export const AdminDashboard: React.FC = () => {
  const { 
    batches, 
    users, 
    fraudAlerts, 
    currentUser, 
    resolveFraudAlert, 
    approveUserKyc, 
    reportFraudAlert,
    navigateToVerification 
  } = useApp();

  const [discrepancyBatchId, setDiscrepancyBatchId] = useState('AGRI-2026-MNG-001');
  const [discrepancyReason, setDiscrepancyReason] = useState('Price Gouging: Retail markup exceeds 180% fair ceiling index');

  const pendingUsers = users.filter(u => u.kycStatus === 'pending');
  const verifiedUsers = users.filter(u => u.kycStatus === 'verified');
  const activeAlerts = fraudAlerts.filter(a => a.status === 'active');

  const handleTriggerComplianceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    reportFraudAlert(discrepancyBatchId, discrepancyReason, 'high');
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Enterprise Compliance Desk • Sepolia Verification Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Agricultural Regulatory & System Admin Portal
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Officer: {currentUser.name} • {currentUser.organization}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl font-bold">
            Ledger Status: 100% Operational
          </span>
        </div>
      </div>

      {/* Network Health Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Minted Batches</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{batches.length} <span className="text-xs font-normal text-slate-500">lots</span></div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">ERC-1155 tokens on ledger</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Registered Stakeholders</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{users.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">{verifiedUsers.length} verified enterprise accounts</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Active Fraud / Quality Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className={`text-2xl font-black ${activeAlerts.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {activeAlerts.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Autonomous smart contract triggers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Sepolia Block Height</span>
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">#18,946,050</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">Avg block time 12.0s</div>
        </div>
      </div>

      {/* Fraud & Quality Anomalies Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Smart Contract Fraud & Quality Quarantine Desk</span>
            </h2>
            <p className="text-xs text-slate-500">Autonomous consensus anomaly alerts across pricing, cold-chain, and authenticity</p>
          </div>
        </div>

        {/* List of alerts */}
        {fraudAlerts.length === 0 ? (
          <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
            <span className="font-bold">Zero active anomalies detected in the network. All supply chain checkpoints comply with AgriTrace standards.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {fraudAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                  alert.status === 'active'
                    ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {alert.batchId}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      alert.status === 'active' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {alert.status.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">{alert.reason}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      const match = batches.find(b => b.batchId === alert.batchId);
                      if (match) navigateToVerification(match.id);
                    }}
                    className="px-3 py-1.5 bg-white text-slate-800 hover:bg-slate-100 border border-slate-300 text-xs font-semibold rounded-xl transition"
                  >
                    Inspect Batch
                  </button>
                  {alert.status === 'active' && (
                    <button
                      onClick={() => resolveFraudAlert(alert.id)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve & Clear</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Incident Reporting Console */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-800 block mb-2">
            Issue Regulatory Compliance or Quality Discrepancy Notice
          </span>
          <form onSubmit={handleTriggerComplianceAlert} className="flex flex-col sm:flex-row gap-2">
            <select
              value={discrepancyBatchId}
              onChange={(e) => setDiscrepancyBatchId(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none"
            >
              {batches.map(b => (
                <option key={b.id} value={b.batchId}>
                  {b.name} ({b.batchId})
                </option>
              ))}
            </select>
            <input
              type="text"
              value={discrepancyReason}
              onChange={(e) => setDiscrepancyReason(e.target.value)}
              placeholder="Anomaly description..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1 justify-center"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Issue Notice</span>
            </button>
          </form>
        </div>
      </div>

      {/* Stakeholder KYC Verification Manager */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Consortium Participant Node Registry</h2>
            <p className="text-xs text-slate-500">Approve onboarding requests and manage cryptographic permissions</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Participant Name</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Organization / Location</th>
                <th className="py-3 px-3">Wallet Address</th>
                <th className="py-3 px-3">KYC Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-semibold text-slate-800">{user.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <div>{user.organization}</div>
                    <div className="text-[10px] text-slate-400">{user.location}</div>
                  </td>
                  <td className="py-3 px-3">
                    <CryptoHashDisplay hash={user.walletAddress} truncateLength={6} />
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      user.kycStatus === 'verified'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {user.kycStatus === 'pending' ? (
                      <button
                        onClick={() => approveUserKyc(user.id)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-semibold transition"
                      >
                        Approve KYC
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Authorized</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
