import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldAlert, 
  UserPlus, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Wallet, 
  Award,
  X,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserRole } from '../../types/produce';
import { CryptoHashDisplay } from '../common/CryptoHashDisplay';

export const AdminStakeholdersTab: React.FC = () => {
  const { 
    users, 
    updateUserKYC, 
    suspendUserAccount, 
    reactivateUserAccount, 
    addStakeholderUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [selectedUserDossier, setSelectedUserDossier] = useState<UserProfile | null>(null);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);

  // New Node Form State
  const [newNode, setNewNode] = useState<{
    name: string;
    role: UserRole;
    email: string;
    phone: string;
    organization: string;
    location: string;
    walletAddress: string;
  }>({
    name: '',
    role: 'farmer',
    email: '',
    phone: '',
    organization: '',
    location: '',
    walletAddress: '',
  });

  // Filter logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.organization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery) ||
      user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.kycStatus === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Add new node submission
  const handleAddNodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNode.name.trim() || !newNode.organization.trim()) return;

    addStakeholderUser({
      name: newNode.name.trim(),
      role: newNode.role,
      email: newNode.email.trim() || `node-${Date.now()}@agritrace.org`,
      phone: newNode.phone.trim() || '+91 98000 00000',
      organization: newNode.organization.trim(),
      location: newNode.location.trim() || 'India',
      walletAddress: newNode.walletAddress.trim() || `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      kycStatus: 'verified',
      trustScore: 95,
    });

    setIsAddNodeModalOpen(false);
    setNewNode({
      name: '',
      role: 'farmer',
      email: '',
      phone: '',
      organization: '',
      location: '',
      walletAddress: '',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Consortium Participant Node Registry</span>
            </h2>
            <p className="text-xs text-slate-500">
              Manage cryptographic permissions, KYC credentials, and trust scores across supply chain actors
            </p>
          </div>

          <button
            onClick={() => setIsAddNodeModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Enterprise Node</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-6 relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by participant name, org, phone, or wallet..."
              className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition"
            >
              <option value="all">All Stakeholder Roles</option>
              <option value="farmer">Farmers</option>
              <option value="distributor">Distributors</option>
              <option value="retailer">Retailers</option>
              <option value="consumer">Consumers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none transition"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified (KYC Approved)</option>
              <option value="pending">Pending Audit</option>
              <option value="rejected">Suspended / Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Participant & Org</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4">Cryptographic Wallet</th>
                <th className="py-3.5 px-4">Trust Score</th>
                <th className="py-3.5 px-4">KYC Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{user.organization || 'Independent Actor'}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold capitalize ${
                      user.role === 'farmer' ? 'text-emerald-700' :
                      user.role === 'distributor' ? 'text-blue-700' :
                      user.role === 'retailer' ? 'text-purple-700' :
                      user.role === 'admin' ? 'text-slate-800' : 'text-teal-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    <div className="font-mono text-[11px]">{user.phone}</div>
                    <div className="text-[10px] text-slate-400">{user.email}</div>
                  </td>

                  <td className="py-3 px-4">
                    <CryptoHashDisplay hash={user.walletAddress} truncateLength={5} />
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            user.trustScore >= 90 ? 'bg-emerald-500' :
                            user.trustScore >= 75 ? 'bg-blue-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${user.trustScore}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">{user.trustScore}%</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold capitalize ${
                      user.kycStatus === 'verified' ? 'text-emerald-700' :
                      user.kycStatus === 'pending' ? 'text-amber-700' :
                      'text-rose-700'
                    }`}>
                      {user.kycStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedUserDossier(user)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition cursor-pointer"
                    >
                      Dossier
                    </button>

                    {user.kycStatus === 'pending' && (
                      <button
                        onClick={() => updateUserKYC(user.id, 'verified')}
                        className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-[11px] transition shadow-2xs cursor-pointer"
                      >
                        Approve KYC
                      </button>
                    )}

                    {user.kycStatus === 'verified' && user.role !== 'admin' && (
                      <button
                        onClick={() => suspendUserAccount(user.id, 'Administrative compliance hold')}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg text-[11px] transition cursor-pointer"
                      >
                        Suspend
                      </button>
                    )}

                    {user.kycStatus === 'rejected' && (
                      <button
                        onClick={() => reactivateUserAccount(user.id)}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold rounded-lg text-[11px] transition cursor-pointer"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No participant nodes match your search query or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Onboard Enterprise Node */}
      {isAddNodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Onboard Consortium Enterprise Node</span>
              </h3>
              <button 
                onClick={() => setIsAddNodeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNodeSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Entity Name *</label>
                  <input
                    type="text"
                    required
                    value={newNode.name}
                    onChange={(e) => setNewNode(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Sahyadri Agro Hub"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stakeholder Role *</label>
                  <select
                    value={newNode.role}
                    onChange={(e) => setNewNode(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
                  >
                    <option value="farmer">Farmer / Cooperative</option>
                    <option value="distributor">Distributor / Cold-Chain</option>
                    <option value="retailer">Retailer / Supermarket</option>
                    <option value="admin">Regulatory Auditor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Organization / Enterprise Legal Entity *</label>
                <input
                  type="text"
                  required
                  value={newNode.organization}
                  onChange={(e) => setNewNode(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="e.g. Maharashtra State APMC Federation"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={newNode.phone}
                    onChange={(e) => setNewNode(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98220 12345"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Email</label>
                  <input
                    type="email"
                    value={newNode.email}
                    onChange={(e) => setNewNode(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ops@entity.org"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Operational Location / Hub</label>
                <input
                  type="text"
                  value={newNode.location}
                  onChange={(e) => setNewNode(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Vashi APMC Yard, Navi Mumbai"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Custody Wallet Address (Auto-Generated if blank)</label>
                <input
                  type="text"
                  value={newNode.walletAddress}
                  onChange={(e) => setNewNode(prev => ({ ...prev, walletAddress: e.target.value }))}
                  placeholder="0x71C...b4a1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 font-mono"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddNodeModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Provision & Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Participant Dossier */}
      {selectedUserDossier && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedUserDossier.name}</h3>
                <span className="text-[10px] font-mono text-slate-400">{selectedUserDossier.id}</span>
              </div>
              <button 
                onClick={() => setSelectedUserDossier(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Stakeholder Role:</span>
                <span className="font-bold text-slate-900 uppercase">{selectedUserDossier.role}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Legal Entity / Organization:</span>
                <span className="font-semibold text-slate-800">{selectedUserDossier.organization || 'Independent'}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Geographic Location:</span>
                <span className="text-slate-800">{selectedUserDossier.location}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Cryptographic Identity:</span>
                <CryptoHashDisplay hash={selectedUserDossier.walletAddress} truncateLength={6} />
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Consensus Trust Score:</span>
                <span className="font-mono font-bold text-emerald-800">{selectedUserDossier.trustScore} / 100</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">KYC Status:</span>
                <span className="font-bold uppercase text-emerald-800">{selectedUserDossier.kycStatus}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Registration Date:</span>
                <span className="font-mono text-slate-700">{selectedUserDossier.registeredDate}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedUserDossier(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
