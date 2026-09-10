import React from 'react';
import { DollarSign, CheckCircle2, Clock, ArrowUpRight, ShieldCheck, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CryptoHashDisplay } from '../common/CryptoHashDisplay';

export const FarmerTransactions: React.FC = () => {
  const { batches, currentUser } = useApp();

  const farmerBatches = batches.filter(b => b.farmerId === currentUser.id || b.farmerName === currentUser.name || b.farmerId === 'usr-farmer-01');

  const transactions = [
    {
      id: 'tx-001',
      batchId: 'AGRI-2026-MNG-001',
      crop: 'Ratnagiri Alphonso Mangoes',
      amount: '₹1,44,000',
      type: 'Direct Farmer Procurement Payment',
      payer: 'KisanLogix Cold Fleet Ltd (Distributor)',
      status: 'Escrow Released to Wallet',
      date: '2026-05-02',
      hash: '0x9fa1c7849e89d10e0129bc88a71928019ab91284',
      block: 18945205,
    },
    {
      id: 'tx-002',
      batchId: 'AGRI-2026-RIC-002',
      crop: 'Dehradun Basmati Rice',
      amount: '₹1,62,500',
      type: 'Consortium Forward Purchase Contract',
      payer: 'KisanLogix Cold Fleet Ltd (Distributor)',
      status: 'Escrow Released to Wallet',
      date: '2026-04-29',
      hash: '0x3dc81048bca1209df1045938210398492019a827',
      block: 18944118,
    },
    {
      id: 'tx-003',
      batchId: 'AGRI-2026-TOM-003',
      crop: 'Organic Vine Tomatoes',
      amount: '₹19,200',
      type: 'Immediate Perishable Settlement',
      payer: 'FreshRoot Retail Stores (Direct)',
      status: 'Smart Contract Escrow Locked',
      date: '2026-05-06',
      hash: '0x889a71b238914028591823901928374901928341',
      block: 18946012,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Smart Contract Escrow Transactions</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically audited payment settlements with zero middleman deductions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold">
            Wallet Balance: ₹3,25,700
          </span>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Total Escrow Realized</span>
          <div className="text-2xl font-black text-slate-900 mt-1">₹3,06,500</div>
          <span className="text-[11px] text-emerald-700 font-medium">100% On-Time Settlement</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Escrow in Custody Transit</span>
          <div className="text-2xl font-black text-amber-600 mt-1">₹19,200</div>
          <span className="text-[11px] text-slate-500">Auto-unlocks upon retail delivery confirmation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Average Payment Clearance</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">&lt; 4 seconds</div>
          <span className="text-[11px] text-slate-500">vs 45-90 days in traditional mandis</span>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Settlement Ledger Logs</h2>
          <span className="text-xs text-slate-400 font-mono">Ethereum Sepolia Verified Settlements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Batch Reference</th>
                <th className="py-3 px-3">Payer / Source</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Settlement Status</th>
                <th className="py-3 px-3">On-Chain Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-3 font-sans text-slate-600">{tx.date}</td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900 font-sans">{tx.crop}</div>
                    <div className="text-[10px] text-emerald-700">{tx.batchId}</div>
                  </td>
                  <td className="py-3.5 px-3 font-sans text-slate-600">{tx.payer}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-700 font-sans text-sm">{tx.amount}</td>
                  <td className="py-3.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${
                      tx.status.includes('Released')
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {tx.status.includes('Released') ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{tx.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <CryptoHashDisplay hash={tx.hash} truncateLength={6} />
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
