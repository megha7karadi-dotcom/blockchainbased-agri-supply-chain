import React, { useState } from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  Download, 
  Wallet, 
  Building2, 
  QrCode, 
  FileText, 
  ArrowDownLeft, 
  ExternalLink,
  Filter,
  Check,
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CryptoHashDisplay } from '../common/CryptoHashDisplay';

export interface EscrowTransaction {
  id: string;
  batchId: string;
  crop: string;
  amount: number;
  type: string;
  payer: string;
  payerRole: string;
  status: 'Escrow Released to Wallet' | 'Smart Contract Escrow Locked' | 'Advance Deposit Released';
  date: string;
  hash: string;
  block: number;
  gasUsed: string;
  utrNumber: string;
}

const INITIAL_TRANSACTIONS: EscrowTransaction[] = [
  {
    id: 'tx-001',
    batchId: 'AGRI-2026-MNG-001',
    crop: 'Ratnagiri Alphonso Mangoes',
    amount: 144000,
    type: 'Direct Farmer Procurement Settlement',
    payer: 'KisanLogix Cold Fleet Ltd',
    payerRole: 'Distributor',
    status: 'Escrow Released to Wallet',
    date: '2026-05-02',
    hash: '0x9fa1c7849e89d10e0129bc88a71928019ab91284',
    block: 18945205,
    gasUsed: '0.0021 ETH (Consortium Subsidized)',
    utrNumber: 'CMS26050298124501',
  },
  {
    id: 'tx-002',
    batchId: 'AGRI-2026-RIC-002',
    crop: 'Dehradun Basmati Rice',
    amount: 162500,
    type: 'Consortium Forward Purchase Contract',
    payer: 'MahaAgro Export Consortium',
    payerRole: 'Exporters Consortium',
    status: 'Escrow Released to Wallet',
    date: '2026-04-29',
    hash: '0x3dc81048bca1209df1045938210398492019a827',
    block: 18944118,
    gasUsed: '0.0019 ETH (Consortium Subsidized)',
    utrNumber: 'CMS26042944018239',
  },
  {
    id: 'tx-003',
    batchId: 'AGRI-2026-TOM-003',
    crop: 'Organic Vine Tomatoes',
    amount: 19200,
    type: 'Direct Retail Perishable Settlement',
    payer: 'FreshRoot Retail Stores (Direct)',
    payerRole: 'Retailer',
    status: 'Smart Contract Escrow Locked',
    date: '2026-05-06',
    hash: '0x889a71b238914028591823901928374901928341',
    block: 18946012,
    gasUsed: '0.0024 ETH (Consortium Subsidized)',
    utrNumber: 'ESCROW-LOCK-77189',
  },
  {
    id: 'tx-004',
    batchId: 'AGRI-2026-TRM-004',
    crop: 'High Curcumin Turmeric',
    amount: 42000,
    type: 'Export Forward Purchase Agreement',
    payer: 'VedicSpice Agro Exporters',
    payerRole: 'Exporters Consortium',
    status: 'Escrow Released to Wallet',
    date: '2026-04-26',
    hash: '0x12a9bc489e81240189bfa98210398492019a8271',
    block: 18941098,
    gasUsed: '0.0018 ETH (Consortium Subsidized)',
    utrNumber: 'CMS26042611029384',
  },
  {
    id: 'tx-005',
    batchId: 'AGRI-2026-APL-005',
    crop: 'Royal Delicious Apple',
    amount: 76000,
    type: 'Cold-Chain Procurement Advance (40%)',
    payer: 'Reliance Retail Agri Sourcing',
    payerRole: 'Retailer',
    status: 'Advance Deposit Released',
    date: '2026-05-08',
    hash: '0x55ef019283bc8192830192837490192834109283',
    block: 18947150,
    gasUsed: '0.0020 ETH (Consortium Subsidized)',
    utrNumber: 'CMS26050855291044',
  },
];

export const FarmerTransactions: React.FC = () => {
  const { batches, currentUser } = useApp();

  const [transactions, setTransactions] = useState<EscrowTransaction[]>(INITIAL_TRANSACTIONS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [walletBalance, setWalletBalance] = useState<number>(382500);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bank1' | 'bank2' | 'upi'>('bank1');
  const [withdrawSuccessNotice, setWithdrawSuccessNotice] = useState<string | null>(null);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<EscrowTransaction | null>(null);

  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'released') return tx.status.includes('Released');
    if (filterStatus === 'locked') return tx.status.includes('Locked');
    return true;
  });

  // Calculate totals
  const totalReleased = transactions
    .filter(t => t.status.includes('Released'))
    .reduce((acc, t) => acc + t.amount, 0);

  const totalLocked = transactions
    .filter(t => t.status.includes('Locked'))
    .reduce((acc, t) => acc + t.amount, 0);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > walletBalance) {
      alert('Please enter a valid withdrawal amount within your wallet balance.');
      return;
    }

    const destination = selectedPaymentMethod === 'bank1' 
      ? 'HDFC Bank A/C ****4921' 
      : selectedPaymentMethod === 'bank2'
      ? 'State Bank of India (Kisan Credit Card) A/C ****1184'
      : 'UPI ID: ramesh.patil@okhdfcbank';

    const newBalance = walletBalance - amountNum;
    setWalletBalance(newBalance);

    const withdrawalTx: EscrowTransaction = {
      id: `tx-${Date.now()}`,
      batchId: 'WALLET-PAYOUT',
      crop: 'Bank Account Payout',
      amount: -amountNum,
      type: `Direct Payout to ${destination}`,
      payer: 'AgriTrace Settlement Gateway',
      payerRole: 'Consortium Smart Contract',
      status: 'Escrow Released to Wallet',
      date: new Date().toISOString().split('T')[0],
      hash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      block: 18948299,
      gasUsed: '0.0000 ETH (Free Tier)',
      utrNumber: `IMPS${Date.now().toString().slice(-10)}`,
    };

    setTransactions(prev => [withdrawalTx, ...prev]);
    setIsWithdrawModalOpen(false);
    setWithdrawAmount('');
    setWithdrawSuccessNotice(`Payout of ₹${amountNum.toLocaleString('en-IN')} successfully dispatched via IMPS to ${destination}. Ref UTR: ${withdrawalTx.utrNumber}`);

    setTimeout(() => {
      setWithdrawSuccessNotice(null);
    }, 7000);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      
      {/* Toast Notice */}
      {withdrawSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-semibold animate-fadeIn shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{withdrawSuccessNotice}</span>
          </div>
          <button 
            onClick={() => setWithdrawSuccessNotice(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <DollarSign className="w-7 h-7 text-emerald-600" />
              <span>Escrow Settlements & Farmer Wallet</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Real-time payment settlements released straight to your bank account with zero middleman deductions or commission cuts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrintStatement}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Tax Statement</span>
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Withdraw to Bank / UPI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Available Wallet Balance</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              ₹{walletBalance.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
            <span>Instant IMPS / UPI Ready</span>
            <span className="font-mono font-bold">100% Liquid</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Escrow Realized</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{totalReleased.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
            <span>Direct farmgate proceeds</span>
            <span className="text-emerald-700 font-semibold font-mono">Cleared</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Escrow in Custody Transit</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              ₹{totalLocked.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
            <span>Awaiting retail delivery</span>
            <span className="text-amber-700 font-semibold font-mono">Guaranteed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Consortium Gas Subsidized</span>
            <div className="text-2xl font-black text-teal-700 mt-1">
              ₹0.00 Paid
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
            <span>100% subsidized blockchain fee</span>
            <span className="text-teal-700 font-semibold font-mono">Consortium</span>
          </div>
        </div>

      </div>

      {/* Filter Chips & Table Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Immutable Settlement Ledger</h2>
            <p className="text-xs text-slate-500">Cryptographically signed smart contract events on Ethereum Sepolia</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </span>
            {(['all', 'released', 'locked'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                  filterStatus === st 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'All Transactions' : st === 'released' ? 'Settled to Wallet' : 'Escrow Locked'}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Batch / Description</th>
                <th className="py-3 px-3">Counterparty</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Settlement Status</th>
                <th className="py-3 px-3">On-Chain Tx Hash</th>
                <th className="py-3 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredTransactions.map(tx => {
                const isDebit = tx.amount < 0;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-3 font-sans text-slate-600 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 font-sans">{tx.crop}</div>
                      <div className="text-[10px] text-emerald-700">{tx.batchId}</div>
                    </td>
                    <td className="py-3.5 px-3 font-sans whitespace-nowrap">
                      <div className="text-slate-800 font-medium">{tx.payer}</div>
                      <div className="text-[10px] text-slate-400">{tx.payerRole}</div>
                    </td>
                    <td className="py-3.5 px-3 font-sans text-sm whitespace-nowrap">
                      <span className={`font-black ${isDebit ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {isDebit ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-sans whitespace-nowrap">
                      <span className={`text-xs font-semibold flex items-center gap-1 w-fit ${
                        tx.status.includes('Released')
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}>
                        {tx.status.includes('Released') ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        <span>{tx.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <CryptoHashDisplay hash={tx.hash} truncateLength={6} />
                    </td>
                    <td className="py-3.5 px-3 text-right font-sans whitespace-nowrap">
                      <button
                        onClick={() => setSelectedReceiptTx(tx)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-700 transition cursor-pointer"
                        title="View Cryptographic Payout Receipt"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Withdraw Funds to Bank / UPI</h3>
              </div>
              <button 
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/60 flex items-center justify-between">
                <span className="text-emerald-800 font-medium">Available Balance</span>
                <span className="text-base font-black text-emerald-900">₹{walletBalance.toLocaleString('en-IN')}</span>
              </div>

              {/* Account Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Select Settlement Account</label>
                <div className="space-y-2">
                  <div 
                    onClick={() => setSelectedPaymentMethod('bank1')}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      selectedPaymentMethod === 'bank1' ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-slate-600" />
                      <div>
                        <div>HDFC Bank (Primary Agri Account)</div>
                        <div className="text-[10px] text-slate-400 font-normal">A/C: ****4921 • IFSC: HDFC0001290</div>
                      </div>
                    </div>
                    {selectedPaymentMethod === 'bank1' && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>

                  <div 
                    onClick={() => setSelectedPaymentMethod('bank2')}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      selectedPaymentMethod === 'bank2' ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-slate-600" />
                      <div>
                        <div>State Bank of India (KCC Account)</div>
                        <div className="text-[10px] text-slate-400 font-normal">A/C: ****1184 • IFSC: SBIN0000450</div>
                      </div>
                    </div>
                    {selectedPaymentMethod === 'bank2' && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>

                  <div 
                    onClick={() => setSelectedPaymentMethod('upi')}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      selectedPaymentMethod === 'upi' ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-4 h-4 text-slate-600" />
                      <div>
                        <div>Instant UPI Rail</div>
                        <div className="text-[10px] text-slate-400 font-normal">VPA: ramesh.patil@okhdfcbank</div>
                      </div>
                    </div>
                    {selectedPaymentMethod === 'upi' && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Withdrawal Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    max={walletBalance}
                    min={100}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 50000)"
                    className="w-full pl-8 pr-16 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-bold text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(walletBalance.toString())}
                    className="absolute right-2 top-2 px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded-lg transition"
                  >
                    MAX
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Zero transfer charges • Instant IMPS dispatch within 5 seconds
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {selectedReceiptTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Settlement Receipt
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg mt-1">Smart Contract Escrow Voucher</h3>
              </div>
              <button 
                onClick={() => setSelectedReceiptTx(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReceiptTx.id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Produce Lot:</span>
                  <span className="font-bold text-slate-800">{selectedReceiptTx.crop} ({selectedReceiptTx.batchId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer Counterparty:</span>
                  <span className="font-bold text-slate-800">{selectedReceiptTx.payer}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/60 pt-2">
                  <span className="text-slate-600 font-bold">Settlement Amount:</span>
                  <span className="font-black text-emerald-700 text-base">₹{Math.abs(selectedReceiptTx.amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/80 space-y-1.5 font-mono text-[11px]">
                <div className="text-emerald-950 font-bold font-sans text-xs">Blockchain Telemetry</div>
                <div className="truncate text-slate-600">Tx Hash: {selectedReceiptTx.hash}</div>
                <div className="text-slate-600">Block Height: #{selectedReceiptTx.block}</div>
                <div className="text-slate-600">Bank UTR: {selectedReceiptTx.utrNumber}</div>
                <div className="text-slate-600">Consortium Gas: {selectedReceiptTx.gasUsed}</div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                *Agricultural produce realization is 100% exempt from Central Income Tax under Section 10(1) of the Indian Income Tax Act, 1961. This cryptographically timestamped receipt serves as official audit proof.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSelectedReceiptTx(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
