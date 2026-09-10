import React from 'react';
import { Award, ShieldCheck, CheckCircle2, Star, FileText, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FarmerTrust: React.FC = () => {
  const { currentUser } = useApp();

  const auditLogs = [
    {
      date: '2026-04-10',
      title: 'Annual APEDA Organic Certification Audit',
      certId: 'NPOP/NAB/0014/MH/2026',
      status: 'Passed (Zero Residues)',
      auditor: 'State Agricultural Testing Laboratory, Pune',
    },
    {
      date: '2026-03-15',
      title: 'Soil pH & Microbial Health Assessment',
      certId: 'SOIL-LAB-78901',
      status: 'Optimal (pH 6.8, Rich Humus)',
      auditor: 'Konkan Krishi Vidyapeeth',
    },
    {
      date: '2026-02-28',
      title: 'Irrigation Borewell Heavy Metals Screening',
      certId: 'WATER-TEST-3419',
      status: 'Clean (Zero Lead/Arsenic)',
      auditor: 'Maharashtra Pollution Control Board',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          <span>Farmer Trust & Reputation System</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Decentralized reputation score computed via laboratory test oracles and delivery SLAs
        </p>
      </div>

      {/* Main Scorecard */}
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-emerald-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Tier 1: Diamond Certified Producer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">{currentUser.name}</h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed">
            Eligible for zero-collateral forward procurement contracts and priority listing on cold-chain distributor bidding networks.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center flex-shrink-0 w-44">
          <div className="text-4xl sm:text-5xl font-black text-emerald-300">{currentUser.trustScore}</div>
          <div className="text-xs text-slate-300 font-semibold mt-1">Out of 100 Points</div>
          <div className="flex justify-center gap-1 mt-2 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
        </div>
      </div>

      {/* Score Breakdown Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Chemical Residues</span>
          <div className="text-2xl font-black text-emerald-700">100%</div>
          <div className="text-[11px] text-slate-500">Zero synthetic residues</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Dispatch SLA</span>
          <div className="text-2xl font-black text-slate-900">96.8%</div>
          <div className="text-[11px] text-slate-500">Handed to logistics on time</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">GPS Land Audit</span>
          <div className="text-2xl font-black text-slate-900">100%</div>
          <div className="text-[11px] text-emerald-700 font-medium">Cadastral survey verified</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Consumer Rating</span>
          <div className="text-2xl font-black text-slate-900">4.9 / 5.0</div>
          <div className="text-[11px] text-slate-500">Across 850+ QR scans</div>
        </div>
      </div>

      {/* Certified Laboratory Audit Trail */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Cryptographically Audited Lab Reports</h3>
            <p className="text-xs text-slate-500">Official reports published by state agricultural testing centers</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            Oracles Verified
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.map((log, idx) => (
            <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{log.title}</span>
                </div>
                <div className="text-slate-500">
                  Auditor: {log.auditor} • <span className="font-mono text-emerald-700">{log.certId}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center">
                <span className="font-semibold text-emerald-700">{log.status}</span>
                <span className="text-[11px] text-slate-400">{log.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
