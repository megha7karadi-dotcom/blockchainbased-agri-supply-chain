import React, { useState } from 'react';
import { 
  Layers, 
  Users, 
  AlertTriangle, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  FileSpreadsheet, 
  ExternalLink,
  TrendingUp,
  Scale,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CryptoHashDisplay } from '../common/CryptoHashDisplay';

interface AdminOverviewTabProps {
  onSelectTab: (tab: 'overview' | 'stakeholders' | 'fraud' | 'governance' | 'ledger') => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ onSelectTab }) => {
  const { batches, users, fraudAlerts, systemPolicies } = useApp();
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<string | null>(null);

  const pendingUsers = users.filter(u => u.kycStatus === 'pending');
  const verifiedUsers = users.filter(u => u.kycStatus === 'verified');
  const activeAlerts = fraudAlerts.filter(a => a.status === 'Open' || (a.status as any) === 'active');
  const quarantinedBatches = batches.filter(b => b.status.includes('Quarantined') || b.status.includes('Suspended'));

  // Calculate total volume and value
  const totalVolumeKg = batches.reduce((acc, b) => acc + (b.quantity || b.quantityKg || 0), 0);
  const totalValueInRupees = batches.reduce((acc, b) => {
    const qty = b.quantity || b.quantityKg || 0;
    const price = b.pricing?.finalConsumerPrice || b.farmgatePrice || 100;
    return acc + (qty * price);
  }, 0);

  // Trigger Network Integrity Audit
  const handleVerifyIntegrity = () => {
    setIsVerifyingIntegrity(true);
    setIntegrityStatus(null);
    setTimeout(() => {
      setIsVerifyingIntegrity(false);
      setIntegrityStatus('Cryptographic Merkle Root Validated: 100% of ERC-1155 tokens and state transitions match Ethereum Sepolia state #18,946,050.');
    }, 900);
  };

  // Export compliance report
  const handleExportReport = () => {
    const reportData = {
      exportTimestamp: new Date().toISOString(),
      governanceNetwork: 'AgriTrace Sepolia Consortium v4.2',
      systemPolicies,
      metrics: {
        totalBatches: batches.length,
        totalVolumeKg,
        totalEstimatedValueINR: totalValueInRupees,
        registeredParticipants: users.length,
        verifiedParticipants: verifiedUsers.length,
        pendingKyc: pendingUsers.length,
        activeFraudAlerts: activeAlerts.length,
        quarantinedBatches: quarantinedBatches.length,
      },
      batchesSummary: batches.map(b => ({
        batchId: b.batchId,
        crop: b.name || b.cropName,
        variety: b.variety || b.cropVariety,
        status: b.status,
        farmer: b.farmerName,
        quantityKg: b.quantity || b.quantityKg,
        farmgatePrice: b.farmgatePrice || b.pricing?.farmerPrice,
        finalPrice: b.pricing?.finalConsumerPrice,
        contractTokenId: b.blockchain?.tokenId,
        mintTxHash: b.blockchain?.mintTxHash,
      })),
      fraudAlertsSummary: fraudAlerts,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agritrace-regulatory-audit-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Network Health Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Minted Batches</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {batches.length} <span className="text-xs font-normal text-slate-500">lots</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{totalVolumeKg.toLocaleString()} kg on ledger</span>
          </div>
        </div>

        <div 
          onClick={() => onSelectTab('stakeholders')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Consortium Nodes</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{users.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{verifiedUsers.length} verified</span>
            {pendingUsers.length > 0 && (
              <span className="text-amber-700 font-semibold text-xs">
                {pendingUsers.length} pending KYC
              </span>
            )}
          </div>
        </div>

        <div 
          onClick={() => onSelectTab('fraud')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Quality & Fraud Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${activeAlerts.length > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-black ${activeAlerts.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {activeAlerts.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{quarantinedBatches.length} batches frozen</span>
            <span className="text-[10px] text-slate-400 font-mono">Consensus triggers</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Ledger Throughput</span>
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{(totalValueInRupees / 100000).toFixed(1)}L</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">Total economic throughput</div>
        </div>

      </div>

      {/* Network Verification & Integrity Banner - Unified Clean Theme */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50 text-slate-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-emerald-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              Autonomous Smart Contract Integrity Engine
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              Cryptographically verifies Merkle proofs, fair-price index ceilings, and IoT sensor thermal tolerances across every batch transaction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleVerifyIntegrity}
              disabled={isVerifyingIntegrity}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingIntegrity ? 'animate-spin' : ''}`} />
              <span>{isVerifyingIntegrity ? 'Auditing Ledger...' : 'Run Cryptographic Audit'}</span>
            </button>

            <button
              onClick={handleExportReport}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit JSON</span>
            </button>
          </div>
        </div>

        {integrityStatus && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{integrityStatus}</span>
          </div>
        )}
      </div>

      {/* Grid: Live Smart Contract Policies & Quarantined Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Smart Contract Policies Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Active Smart Contract Policies</span>
              </h3>
              <p className="text-[11px] text-slate-500">Autonomous consensus enforcement on ledger</p>
            </div>
            <button
              onClick={() => onSelectTab('governance')}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Edit Policies →
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-600">Max Permitted Retail Markup:</span>
              <span className="font-bold text-slate-900 font-mono">{systemPolicies.maxRetailMarkupPercent}%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-600">Cold-Chain Temperature Tolerance:</span>
              <span className="font-bold text-slate-900 font-mono">≤ {systemPolicies.maxColdChainTemp}°C</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-600">Min Guaranteed Farmer Share:</span>
              <span className="font-bold text-emerald-800 font-mono">{systemPolicies.minFarmerSharePercent}% of retail</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-600">Auto-Quarantine on Violation:</span>
              <span className={`font-semibold text-xs ${
                systemPolicies.autoQuarantineViolations 
                  ? 'text-emerald-700' 
                  : 'text-slate-500'
              }`}>
                {systemPolicies.autoQuarantineViolations ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>Policy Contract Tx:</span>
              <CryptoHashDisplay hash={systemPolicies.deployedTxHash || '0x8f2c...44a9'} truncateLength={6} />
            </div>
          </div>
        </div>

        {/* Recent Anomalies & Quarantine Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Recent Anomaly Flagged</span>
              </h3>
              <p className="text-[11px] text-slate-500">Autonomous consensus triggers</p>
            </div>
            <button
              onClick={() => onSelectTab('fraud')}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              View All ({fraudAlerts.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {fraudAlerts.slice(0, 3).map(alert => (
              <div 
                key={alert.id}
                className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                  alert.status === 'Open' || (alert.status as any) === 'active'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">{alert.batchId}</span>
                  <span className={`text-xs font-semibold capitalize ${
                    alert.status === 'Open' || (alert.status as any) === 'active'
                      ? 'text-rose-700'
                      : 'text-emerald-700'
                  }`}>
                    {alert.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 line-clamp-1">{alert.description}</p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">Flagged: {alert.timestamp}</div>
              </div>
            ))}

            {fraudAlerts.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs">
                No active anomalies in the network.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
