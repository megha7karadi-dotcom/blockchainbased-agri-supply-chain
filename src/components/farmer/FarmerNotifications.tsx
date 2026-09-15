import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCheck, 
  ArrowRight,
  Filter,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FarmerNotifications: React.FC = () => {
  const { notifications, markNotificationRead, navigate, setSelectedBatchId } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'procurement' | 'cold-chain' | 'fraud' | 'system'>('all');

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    safeNotifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  const filteredNotifications = safeNotifications.filter(notif => {
    if (filterType === 'all') return true;
    return notif.type === filterType;
  });

  const handleActionClick = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id);
    if (notif.batchId) {
      setSelectedBatchId(notif.batchId);
    }
    if (notif.type === 'procurement') {
      navigate('/farmer/bids');
    } else if (notif.type === 'cold-chain' || notif.type === 'system') {
      navigate('/farmer/my-produce');
    } else {
      navigate('/farmer/dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            <span>Farm Node Activity & Alerts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time smart contract settlements, cold-chain handovers, buyer bids, and laboratory oracles
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark all as read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'procurement', 'cold-chain', 'fraud', 'system'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
              filterType === type 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {type === 'all' ? 'All Alerts' : type === 'procurement' ? 'Bids & Escrow' : type === 'cold-chain' ? 'Logistics' : type === 'fraud' ? 'Anomalies' : 'System Oracles'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">No notifications found</h3>
            <p className="text-xs text-slate-400">All alerts in this category have been cleared.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            return (
              <div
                key={notif.id}
                className={`p-5 transition flex items-start gap-4 ${
                  notif.read ? 'bg-white hover:bg-slate-50/70' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
                }`}
              >
                <div className={`p-2.5 rounded-2xl flex-shrink-0 ${
                  notif.type === 'procurement' ? 'bg-emerald-100 text-emerald-800' :
                  notif.type === 'fraud' ? 'bg-rose-100 text-rose-800' :
                  notif.type === 'cold-chain' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {notif.type === 'procurement' && <DollarSign className="w-5 h-5" />}
                  {notif.type === 'fraud' && <AlertTriangle className="w-5 h-5" />}
                  {notif.type === 'cold-chain' && <TrendingUp className="w-5 h-5" />}
                  {notif.type === 'system' && <CheckCircle2 className="w-5 h-5" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs sm:text-sm font-bold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-1.5">
                    {notif.batchId && (
                      <span className="inline-block font-mono text-[10px] text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded font-semibold">
                        Lot: {notif.batchId}
                      </span>
                    )}

                    <button
                      onClick={() => handleActionClick(notif)}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {!notif.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0 mt-1.5" title="Unread"></span>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
