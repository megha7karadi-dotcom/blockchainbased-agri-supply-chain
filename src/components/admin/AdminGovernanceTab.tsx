import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Thermometer, 
  Scale, 
  Lock, 
  Check, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CryptoHashDisplay } from '../common/CryptoHashDisplay';

export const AdminGovernanceTab: React.FC = () => {
  const { systemPolicies, updateSystemPolicies } = useApp();

  // Local form state
  const [maxRetailMarkup, setMaxRetailMarkup] = useState(systemPolicies.maxRetailMarkupPercent.toString());
  const [maxTemp, setMaxTemp] = useState(systemPolicies.maxColdChainTemp.toString());
  const [minFarmerShare, setMinFarmerShare] = useState(systemPolicies.minFarmerSharePercent.toString());
  const [confirmations, setConfirmations] = useState(systemPolicies.consensusConfirmations.toString());
  const [autoQuarantine, setAutoQuarantine] = useState(systemPolicies.autoQuarantineViolations);

  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    setDeploySuccess(null);

    setTimeout(() => {
      updateSystemPolicies({
        maxRetailMarkupPercent: parseFloat(maxRetailMarkup) || 80,
        maxColdChainTemp: parseFloat(maxTemp) || 8.0,
        minFarmerSharePercent: parseFloat(minFarmerShare) || 45,
        consensusConfirmations: parseInt(confirmations) || 12,
        autoQuarantineViolations: autoQuarantine,
      });

      setIsDeploying(false);
      setDeploySuccess('Governance terms successfully mined on Ethereum Sepolia contract 0x8f2c...44a9 with consensus block confirmation.');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Smart Contract Governance & Fair Pricing Policy Desk</span>
        </h2>
        <p className="text-xs text-slate-500">
          Tune algorithmic market parameters and consensus rules enforced by the AgriTrace decentralized smart contracts.
        </p>
      </div>

      {deploySuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{deploySuccess}</span>
        </div>
      )}

      {/* Governance Form & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Consensus Parameter Configuration</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Modifications require regulatory cryptographic signature before ledger commit
            </p>
          </div>

          <form onSubmit={handleSavePolicies} className="space-y-4 text-xs">
            
            {/* Rule 1: Max Markup */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Maximum Permitted Retail Markup (%)</span>
                </label>
                <span className="font-mono font-bold text-slate-900 text-sm">{maxRetailMarkup}%</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Any retail markup exceeding this threshold over verified farmgate price triggers automated price gouging alerts.
              </p>
              <input
                type="range"
                min="30"
                max="180"
                step="5"
                value={maxRetailMarkup}
                onChange={(e) => setMaxRetailMarkup(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer mt-1"
              />
            </div>

            {/* Rule 2: Cold-Chain Temperature */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-blue-600" />
                  <span>Cold-Chain Max Thermal Tolerance (°C)</span>
                </label>
                <span className="font-mono font-bold text-slate-900 text-sm">≤ {maxTemp}°C</span>
              </div>
              <p className="text-[11px] text-slate-500">
                IoT sensors in transit broadcasting temperatures above this threshold automatically mark the batch freshness degraded.
              </p>
              <input
                type="range"
                min="2.0"
                max="15.0"
                step="0.5"
                value={maxTemp}
                onChange={(e) => setMaxTemp(e.target.value)}
                className="w-full accent-blue-600 cursor-pointer mt-1"
              />
            </div>

            {/* Rule 3: Minimum Farmer Share */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-purple-600" />
                  <span>Minimum Guaranteed Farmer Share (%)</span>
                </label>
                <span className="font-mono font-bold text-slate-900 text-sm">{minFarmerShare}% of Shelf Price</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Guarantees farmers receive at least this percentage of the end-consumer retail value for fair trade indexing.
              </p>
              <input
                type="range"
                min="25"
                max="75"
                step="5"
                value={minFarmerShare}
                onChange={(e) => setMinFarmerShare(e.target.value)}
                className="w-full accent-purple-600 cursor-pointer mt-1"
              />
            </div>

            {/* Rule 4: Consensus Confirmations & Auto Quarantine */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <label className="font-bold text-slate-800 block">Block Confirmations Required</label>
                <select
                  value={confirmations}
                  onChange={(e) => setConfirmations(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl outline-none font-mono"
                >
                  <option value="6">6 Blocks (~72 sec)</option>
                  <option value="12">12 Blocks (~144 sec - Recommended)</option>
                  <option value="24">24 Blocks (~288 sec - High Security)</option>
                </select>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <label className="font-bold text-slate-800 block">Autonomous Quarantine</label>
                  <span className="text-[10px] text-slate-500 block">Freeze on critical breach</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoQuarantine}
                  onChange={(e) => setAutoQuarantine(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isDeploying}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isDeploying ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Broadcasting to Sepolia Node...</span>
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Deploy Updated Policy to Smart Contract</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 5 cols: Smart Contract Specs & Historical Deploys */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Deployed Contract Metadata</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Contract Standard:</span>
                <span className="font-mono font-bold text-slate-900">ERC-1155 Multi-Token</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Network:</span>
                <span className="font-semibold text-slate-800">Ethereum Sepolia Testnet</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Registry Contract Address:</span>
                <CryptoHashDisplay hash="0x8f2c7a109927b583901bcf5a22d49b109e" truncateLength={6} />
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Last Policy Update:</span>
                <span className="font-mono text-slate-700">{systemPolicies.lastUpdated || '2026-05-15 10:30 UTC'}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Consensus Engine:</span>
                <span className="text-slate-700">Proof-of-Stake (PoS)</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Estimated Gas / Tx:</span>
                <span className="font-mono text-emerald-800 font-bold">48,210 Gwei (Optimal)</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/80 text-slate-900 rounded-3xl p-6 border border-emerald-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Smart Contract Autonomy Note</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When retail markups exceed the configured threshold, the smart contract automatically prevents final retail settlement transactions until approved by a regulatory consortium signature.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
