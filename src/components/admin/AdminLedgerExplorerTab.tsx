import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  CheckCircle2, 
  ExternalLink, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Hash,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CryptoHashDisplay } from '../common/CryptoHashDisplay';

export const AdminLedgerExplorerTab: React.FC = () => {
  const { batches, navigateToVerification } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Flatten all blockchain events from all batches into a unified chronological ledger
  const allEvents = batches.flatMap(batch => {
    const events = (batch.timeline || []).map(evt => ({
      ...evt,
      batchId: batch.batchId,
      cropName: batch.name || batch.cropName || 'Produce',
      tokenId: batch.blockchain?.tokenId || 'ERC-1155',
    }));
    return events;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredEvents = allEvents.filter(evt => {
    const matchesSearch = 
      evt.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || evt.stage.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" />
          <span>Consortium Blockchain Ledger & Transaction Explorer</span>
        </h2>
        <p className="text-xs text-slate-500">
          Chronological, tamper-evident cryptographic ledger of all agricultural state transitions mined on Sepolia.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Transaction Hash (0x...), Batch ID, Actor, or Location..."
              className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition font-mono"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition"
            >
              <option value="all">All Supply Chain Stages</option>
              <option value="farming">Farming & Harvest Mint</option>
              <option value="logistics">Cold-Chain Logistics</option>
              <option value="wholesale">Wholesale & Quality</option>
              <option value="retail">Retail Pricing & Shelf</option>
              <option value="consumer">Consumer Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Block #</th>
                <th className="py-3.5 px-4">Transaction Hash</th>
                <th className="py-3.5 px-4">Event & Produce Batch</th>
                <th className="py-3.5 px-4">Custodian / Actor</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredEvents.map(evt => (
                <tr key={evt.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 text-slate-500">
                    #{evt.blockNumber}
                  </td>

                  <td className="py-3 px-4">
                    <CryptoHashDisplay hash={evt.txHash} truncateLength={6} />
                  </td>

                  <td className="py-3 px-4 font-sans">
                    <div className="font-bold text-slate-900">{evt.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <span>{evt.batchId}</span>
                      <span>•</span>
                      <span>{evt.cropName}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-sans text-slate-700">
                    <div className="font-medium">{evt.actorName}</div>
                    <div className="text-[10px] text-slate-400">{evt.location}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold ${
                      evt.stage === 'Farming' ? 'text-emerald-700' :
                      evt.stage === 'Logistics' ? 'text-blue-700' :
                      evt.stage === 'Retail' ? 'text-purple-700' : 'text-slate-700'
                    }`}>
                      {evt.stage}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-400 text-[10px]">
                    {evt.timestamp}
                  </td>

                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={() => navigateToVerification(evt.batchId)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-[10px] transition cursor-pointer"
                    >
                      Audit Proof
                    </button>
                  </td>
                </tr>
              ))}

              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-sans">
                    No transactions match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
