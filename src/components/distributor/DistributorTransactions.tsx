import React, { useState } from 'react';
import { 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  DollarSign,
  TrendingUp,
  Receipt,
  Truck,
  Building2,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

interface DistributorLedgerEntry {
  id: string;
  txHash: string;
  blockNumber: number;
  date: string;
  type: 'Farmer Escrow Payout' | 'Retailer Wholesale Receipt' | 'Reefer Freight Cost' | 'Cold Hub Storage Fee';
  category: 'inflow' | 'outflow';
  counterparty: string;
  counterpartyRole: string;
  batchId: string;
  cropName: string;
  amount: number;
  status: 'Settled' | 'Processing';
  gasUsed: string;
}

const INITIAL_DISTRIBUTOR_TXS: DistributorLedgerEntry[] = [
  {
    id: 'dtx-101',
    txHash: '0x8f2d194c5e39b70129a6b5c92847d01e95b1283c47e89127db4591a0c7e8124b',
    blockNumber: 7490214,
    date: '2025-05-18 14:32',
    type: 'Retailer Wholesale Receipt',
    category: 'inflow',
    counterparty: 'FreshRoot Organics Flagship (Bandra West)',
    counterpartyRole: 'Retailer',
    batchId: 'BATCH-2025-0891',
    cropName: 'Organic Alphonso Mangoes',
    amount: 98000,
    status: 'Settled',
    gasUsed: '84,120 Gwei',
  },
  {
    id: 'dtx-102',
    txHash: '0x3a91b2c4e7f8012d93e45a6c7890123456789abcdef0123456789abcdef01234',
    blockNumber: 7490080,
    date: '2025-05-18 10:15',
    type: 'Farmer Escrow Payout',
    category: 'outflow',
    counterparty: 'Ramesh Patil (Krishi Vikas Co-op)',
    counterpartyRole: 'Farmer',
    batchId: 'BATCH-2025-0891',
    cropName: 'Organic Alphonso Mangoes',
    amount: 65000,
    status: 'Settled',
    gasUsed: '72,400 Gwei',
  },
  {
    id: 'dtx-103',
    txHash: '0x1174a82b9c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789ab',
    blockNumber: 7489912,
    date: '2025-05-17 16:40',
    type: 'Reefer Freight Cost',
    category: 'outflow',
    counterparty: 'KisanLogix Fleet Transport Depot',
    counterpartyRole: 'Logistics Fleet',
    batchId: 'BATCH-2025-0891',
    cropName: 'Organic Alphonso Mangoes',
    amount: 12500,
    status: 'Settled',
    gasUsed: '45,210 Gwei',
  },
  {
    id: 'dtx-104',
    txHash: '0x77c29e1a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abc',
    blockNumber: 7489500,
    date: '2025-05-16 11:20',
    type: 'Retailer Wholesale Receipt',
    category: 'inflow',
    counterparty: "Nature's Basket Artisanal Hub (Worli)",
    counterpartyRole: 'Retailer',
    batchId: 'BATCH-2025-0742',
    cropName: 'Nashik Red Onions (Export Grade)',
    amount: 110000,
    status: 'Settled',
    gasUsed: '81,900 Gwei',
  },
  {
    id: 'dtx-105',
    txHash: '0x44d189ab2c3e4f5061728394a5b6c7d8e9f0123456789abcdef0123456789abc',
    blockNumber: 7489310,
    date: '2025-05-15 09:05',
    type: 'Farmer Escrow Payout',
    category: 'outflow',
    counterparty: 'Balasaheb Shinde',
    counterpartyRole: 'Farmer',
    batchId: 'BATCH-2025-0742',
    cropName: 'Nashik Red Onions (Export Grade)',
    amount: 72000,
    status: 'Settled',
    gasUsed: '68,450 Gwei',
  },
  {
    id: 'dtx-106',
    txHash: '0x99e821fa4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abc',
    blockNumber: 7489110,
    date: '2025-05-14 18:00',
    type: 'Cold Hub Storage Fee',
    category: 'outflow',
    counterparty: 'Pune Central Agri Cold Storage Hub',
    counterpartyRole: 'Warehouse Facility',
    batchId: 'FACILITY-MAINT',
    cropName: 'Cold Room 4 Power & Nitrogen Gas',
    amount: 8500,
    status: 'Settled',
    gasUsed: '34,000 Gwei',
  },
];

export const DistributorTransactions: React.FC = () => {
  const { batches, navigateToVerification } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedReceipt, setSelectedReceipt] = useState<DistributorLedgerEntry | null>(null);

  const filteredTxs = INITIAL_DISTRIBUTOR_TXS.filter(tx => {
    const matchesSearch = 
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.cropName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterType === 'All') return true;
    if (filterType === 'Inflow') return tx.category === 'inflow';
    if (filterType === 'Outflow') return tx.category === 'outflow';
    return true;
  });

  const totalInflow = INITIAL_DISTRIBUTOR_TXS
    .filter(t => t.category === 'inflow')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalFarmerPayouts = INITIAL_DISTRIBUTOR_TXS
    .filter(t => t.type === 'Farmer Escrow Payout')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalFreightPaid = INITIAL_DISTRIBUTOR_TXS
    .filter(t => t.type === 'Reefer Freight Cost' || t.type === 'Cold Hub Storage Fee')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netRetainedMargin = totalInflow - (totalFarmerPayouts + totalFreightPaid);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-12"
    >
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/50 text-slate-900 rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Logistics & Settlement Ledger
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Complete record of automated smart contract escrow payouts to farmers, cold freight operating expenses, and wholesale settlements collected from certified retail supermarket chains.
          </p>
        </div>

        <button 
          onClick={() => alert('Exporting signed distributor audit ledger (CSV + Cryptographic Proofs)...')}
          className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-slate-300 shadow-2xs transition flex items-center gap-2 cursor-pointer flex-shrink-0"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Wholesale Turnover</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{totalInflow.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-700 font-semibold">100% On-Chain Settled</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Farmer Escrow Disbursed</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{totalFarmerPayouts.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">Guaranteed Farmgate Floor</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cold Fleet & Storage Opex</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{totalFreightPaid.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">Reefer Fuel & Pre-Cooling</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Net Retained Margin</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900 font-mono">₹{netRetainedMargin.toLocaleString()}</div>
          <div className="text-[11px] text-indigo-700 font-semibold">Fair-Trade Certified</div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Tx Hash, counterparty, or crop..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['All', 'Inflow', 'Outflow'].map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterType === f 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'Inflow' ? 'Wholesale Inflow' : f === 'Outflow' ? 'Disbursements' : 'All Transactions'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                <th className="py-3 px-4">Transaction / Type</th>
                <th className="py-3 px-4">Batch / Item</th>
                <th className="py-3 px-4">Counterparty</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxs.map(tx => {
                const isInflow = tx.category === 'inflow';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isInflow ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                        <span className="font-bold text-slate-900">{tx.type}</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)} • Block #{tx.blockNumber}
                      </div>
                      <div className="text-[10px] text-slate-400">{tx.date}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold text-slate-800 block mb-0.5">
                        {tx.batchId}
                      </span>
                      <span className="font-semibold text-slate-700">{tx.cropName}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{tx.counterparty}</div>
                      <div className="text-[10px] text-slate-400">{tx.counterpartyRole}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={isInflow ? 'text-emerald-700' : 'text-slate-900'}>
                        {isInflow ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{tx.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(tx)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cryptographic Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Smart Contract Settlement Receipt</h3>
              </div>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Transaction Category:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Settled Amount:</span>
                <span className="font-mono text-base font-black text-slate-900">₹{selectedReceipt.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Batch Identifier:</span>
                <span className="font-mono font-bold text-emerald-800">{selectedReceipt.batchId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-700">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Ethereum Sepolia Block:</span>
                <span className="font-mono text-blue-700 font-bold">#{selectedReceipt.blockNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Gas Consumed:</span>
                <span className="font-mono text-slate-700">{selectedReceipt.gasUsed}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Transaction Hash (TxID):</span>
              <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-[10px] text-slate-700 break-all select-all">
                {selectedReceipt.txHash}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  alert('Receipt PDF downloaded with ECDSA digital signature verification.');
                  setSelectedReceipt(null);
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Download Signed Receipt
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};
