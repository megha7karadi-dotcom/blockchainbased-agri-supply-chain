import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Activity, 
  Users, 
  AlertTriangle, 
  Scale, 
  Layers, 
  Cpu, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminStakeholdersTab } from './AdminStakeholdersTab';
import { AdminFraudTab } from './AdminFraudTab';
import { AdminGovernanceTab } from './AdminGovernanceTab';
import { AdminLedgerExplorerTab } from './AdminLedgerExplorerTab';
import { AdminPriceModelsTab } from './AdminPriceModelsTab';

export const AdminDashboard: React.FC = () => {
  const { currentUser, batches, users, fraudAlerts } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'stakeholders' | 'fraud' | 'governance' | 'ledger' | 'models'>('overview');

  const pendingKycCount = users.filter(u => u.kycStatus === 'pending').length;
  const activeAlertsCount = fraudAlerts.filter(a => a.status === 'Open' || (a.status as any) === 'active').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* Welcome Banner - Unified Clean Theme */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-emerald-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Agricultural Regulatory & System Admin Portal
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Regulatory Officer: <strong className="text-slate-900">{currentUser.name}</strong> • {currentUser.organization || 'National Agri Traceability Board'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-500 font-mono">Consortium Consensus</div>
            <div className="text-xs font-bold text-emerald-700">100% Operational • Zero Fork Anomaly</div>
          </div>
          <span className="text-xs font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-1.5 rounded-xl font-bold">
            Audit Level 4
          </span>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto text-xs font-bold">
        
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-4 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Overview & Health</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stakeholders')}
          className={`py-2.5 px-4 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'stakeholders'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>Participant Nodes</span>
          {pendingKycCount > 0 && (
            <span className="text-xs font-bold text-amber-600">
              ({pendingKycCount})
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fraud')}
          className={`py-2.5 px-4 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'fraud'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Fraud & Quarantine</span>
          {activeAlertsCount > 0 && (
            <span className="text-xs font-bold text-rose-600">
              ({activeAlertsCount})
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('governance')}
          className={`py-2.5 px-4 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'governance'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4 text-purple-600" />
          <span>Smart Contract Governance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`py-2.5 px-4 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-slate-700" />
          <span>Ledger Explorer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('models')}
          className={`py-2.5 px-4 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'models'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4 text-purple-600" />
          <span>AI Price Models</span>
        </button>

      </div>

      {/* Tab Content Rendering */}
      {activeTab === 'overview' && (
        <AdminOverviewTab onSelectTab={setActiveTab} />
      )}

      {activeTab === 'stakeholders' && (
        <AdminStakeholdersTab />
      )}

      {activeTab === 'fraud' && (
        <AdminFraudTab />
      )}

      {activeTab === 'governance' && (
        <AdminGovernanceTab />
      )}

      {activeTab === 'ledger' && (
        <AdminLedgerExplorerTab />
      )}

      {activeTab === 'models' && (
        <AdminPriceModelsTab />
      )}

    </div>
  );
};
