import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Check, 
  ExternalLink, 
  Search,
  Filter,
  Flame,
  ThermometerSnowflake,
  DollarSign,
  QrCode,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CryptoHashDisplay } from '../common/CryptoHashDisplay';

export const AdminFraudTab: React.FC = () => {
  const { 
    batches, 
    fraudAlerts, 
    resolveFraudAlert, 
    reportFraudAlert, 
    quarantineBatch, 
    releaseBatchQuarantine,
    navigateToVerification 
  } = useApp();

  // Notice form state
  const [targetBatchId, setTargetBatchId] = useState(batches[0]?.batchId || 'AGRI-2026-MNG-001');
  const [violationType, setViolationType] = useState<'Excessive Margin' | 'Cold-chain Temperature Spike' | 'Unverified Custody Transfer' | 'Counterfeit QR Attempt'>('Excessive Margin');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('high');
  const [discrepancyDescription, setDiscrepancyDescription] = useState('');
  const [freezeImmediately, setFreezeImmediately] = useState(true);
  const [noticeSentNotice, setNoticeSentNotice] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'Resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Resolution modal state
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionAction, setResolutionAction] = useState('');

  // Form submission: Issue Notice
  const handleIssueNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discrepancyDescription.trim()) return;

    reportFraudAlert(targetBatchId, discrepancyDescription.trim(), severity);

    if (freezeImmediately) {
      quarantineBatch(targetBatchId, `Autonomous compliance freeze: ${discrepancyDescription.trim()}`);
    }

    setNoticeSentNotice(`Official regulatory notice filed against batch ${targetBatchId}. Anomaly logged on smart contract consensus ledger.`);
    setDiscrepancyDescription('');

    setTimeout(() => {
      setNoticeSentNotice(null);
    }, 4000);
  };

  // Resolve alert
  const handleConfirmResolve = (alertId: string) => {
    if (!resolutionAction.trim()) return;
    resolveFraudAlert(alertId, resolutionAction.trim());
    setResolvingAlertId(null);
    setResolutionAction('');
  };

  const filteredAlerts = fraudAlerts.filter(a => {
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'Open' && (a.status === 'Open' || (a.status as any) === 'active')) ||
      (statusFilter === 'Resolved' && (a.status === 'Resolved' || (a.status as any) === 'resolved'));
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <span>Smart Contract Fraud, Quality & Quarantine Console</span>
        </h2>
        <p className="text-xs text-slate-500">
          Autonomous consensus anomaly detection across APMC price ceilings, IoT cold-chain sensor breaches, and physical custody transfers.
        </p>
      </div>

      {/* Grid: Issue Regulatory Notice & Quarantined Batches View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 cols: Issue Compliance Notice */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Issue Compliance Notice or Freeze</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Impose administrative holds and dispatch blockchain consensus alerts
            </p>
          </div>

          {noticeSentNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{noticeSentNotice}</span>
            </div>
          )}

          <form onSubmit={handleIssueNotice} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Produce Batch *</label>
              <select
                value={targetBatchId}
                onChange={(e) => setTargetBatchId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 font-mono"
              >
                {batches.map(b => (
                  <option key={b.id} value={b.batchId}>
                    {b.batchId} • {b.name || b.cropName} ({b.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Violation Type *</label>
                <select
                  value={violationType}
                  onChange={(e) => setViolationType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
                >
                  <option value="Excessive Margin">Excessive Margin / Gouging</option>
                  <option value="Cold-chain Temperature Spike">Cold-Chain Temp Violation</option>
                  <option value="Unverified Custody Transfer">Unverified Custody Transfer</option>
                  <option value="Counterfeit QR Attempt">Counterfeit QR Attempt</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Audit Severity *</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
                >
                  <option value="high">High (Immediate Hold)</option>
                  <option value="medium">Medium (Investigation)</option>
                  <option value="low">Low (Advisory Warning)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Incident / Discrepancy Findings *</label>
              <textarea
                required
                rows={3}
                value={discrepancyDescription}
                onChange={(e) => setDiscrepancyDescription(e.target.value)}
                placeholder="Detail the discrepancy observed (e.g. Retail markup of 210% detected exceeding ceiling index; or Temp sensor spiked to 14.2°C during transit)."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center justify-between">
              <div className="text-[11px] text-rose-900 font-medium">
                <span className="font-bold block">Quarantine Batch on Ledger</span>
                <span>Locks token transfers and retail sales instantly</span>
              </div>
              <input
                type="checkbox"
                checked={freezeImmediately}
                onChange={(e) => setFreezeImmediately(e.target.checked)}
                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Regulatory Notice</span>
            </button>
          </form>
        </div>

        {/* Right 7 cols: Current Quarantined Batches Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-600" />
                <span>Active Ledger Quarantines</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Batches currently locked by administrative or consensus triggers
              </p>
            </div>
            <span className="text-xs font-semibold text-rose-700">
              {batches.filter(b => b.status.includes('Quarantined')).length} Frozen
            </span>
          </div>

          <div className="space-y-3">
            {batches.map(batch => {
              const isQuarantined = batch.status.includes('Quarantined') || batch.status.includes('Suspended');
              return (
                <div
                  key={batch.id}
                  className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    isQuarantined 
                      ? 'bg-rose-50/80 border-rose-300 text-rose-950' 
                      : 'bg-slate-50/60 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{batch.batchId}</span>
                      <span className={`text-xs font-semibold ${
                        isQuarantined ? 'text-rose-700' : 'text-emerald-700'
                      }`}>
                        {batch.status}
                      </span>
                      <span className="text-slate-500 text-[11px] font-medium">{batch.name || batch.cropName}</span>
                    </div>

                    <div className="text-[11px] text-slate-600">
                      Farmer: <span className="font-semibold text-slate-800">{batch.farmerName}</span> • 
                      Volume: <span className="font-mono font-semibold">{batch.quantity || batch.quantityKg} kg</span>
                    </div>

                    {isQuarantined && batch.blockchain?.statusNotice && (
                      <div className="text-[10px] font-mono text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded">
                        {batch.blockchain.statusNotice}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigateToVerification(batch.id)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-semibold rounded-lg transition cursor-pointer"
                    >
                      Audit
                    </button>

                    {isQuarantined ? (
                      <button
                        onClick={() => releaseBatchQuarantine(batch.batchId)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <Unlock className="w-3 h-3" />
                        <span>Lift Hold</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => quarantineBatch(batch.batchId, 'Manual regulatory safety freeze')}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold rounded-lg transition cursor-pointer"
                      >
                        Freeze
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Section: Full Anomaly & Alert Log */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Consensus Anomaly Registry</span>
            </h3>
            <p className="text-xs text-slate-500">Complete historical audit trail of flagged supply-chain alerts</p>
          </div>

          <div className="flex gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open / Active</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
            >
              <option value="all">All Severities</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Severity</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredAlerts.map(alert => {
            const isOpen = alert.status === 'Open' || (alert.status as any) === 'active';
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border text-xs space-y-2.5 transition ${
                  isOpen 
                    ? 'bg-rose-50/60 border-rose-300 text-rose-950' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700">
                      {alert.batchId}
                    </span>
                    <span className="font-bold text-slate-800">{alert.alertType}</span>
                    <span className="text-slate-300">|</span>
                    <span className={`text-xs font-semibold capitalize ${
                      alert.severity === 'high' ? 'text-rose-700' :
                      alert.severity === 'medium' ? 'text-amber-700' : 'text-blue-700'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className={`text-xs font-semibold capitalize ${
                      isOpen ? 'text-rose-700' : 'text-emerald-700'
                    }`}>
                      {alert.status}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">{alert.timestamp}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{alert.description}</p>

                {alert.actionTaken && (
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Resolution Action:</strong> {alert.actionTaken}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                  <span className="text-[10px] text-slate-400">Reporter: {alert.flaggedBy}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const match = batches.find(b => b.batchId === alert.batchId || b.id === alert.batchId);
                        if (match) navigateToVerification(match.id);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded-lg text-[11px] transition cursor-pointer"
                    >
                      Audit Batch
                    </button>

                    {isOpen && (
                      <button
                        onClick={() => setResolvingAlertId(alert.id)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[11px] transition shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Resolve Incident</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAlerts.length === 0 && (
            <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-400 text-xs">
              No anomalies found matching current filters.
            </div>
          )}
        </div>
      </div>

      {/* Resolve Alert Modal */}
      {resolvingAlertId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Record Resolution Audit Log</span>
            </h3>
            <p className="text-xs text-slate-500">
              Provide the regulatory findings, corrective actions taken, and ledger release rationale.
            </p>

            <textarea
              rows={3}
              required
              value={resolutionAction}
              onChange={(e) => setResolutionAction(e.target.value)}
              placeholder="e.g. Retailer audited and confirmed price adjustment to ₹140/kg in compliance with APMC ceiling. Warning issued."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
            />

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setResolvingAlertId(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmResolve(resolvingAlertId)}
                className="w-1/2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
