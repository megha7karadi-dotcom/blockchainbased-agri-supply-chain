import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FarmerNotifications: React.FC = () => {
  const { notifications, markNotificationRead, setActiveTab } = useApp();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            <span>Node Activity & Notifications</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time smart contract events, telemetry alerts, and procurement notifications
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.map((notif) => {
          return (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-5 transition flex items-start gap-4 cursor-pointer ${
                notif.read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
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
                  <span className="text-[11px] text-slate-400">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                {notif.batchId && (
                  <span className="inline-block font-mono text-[10px] text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded font-semibold mt-1">
                    Batch: {notif.batchId}
                  </span>
                )}
              </div>

              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0 mt-1.5" title="Unread"></span>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
