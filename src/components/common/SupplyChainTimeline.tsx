import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Thermometer, 
  Droplets, 
  ShieldCheck, 
  Truck, 
  Sprout, 
  Store, 
  ShoppingBag,
  Building2
} from 'lucide-react';
import { TimelineEvent, BatchStatus } from '../../types/produce';
import { CryptoHashDisplay } from './CryptoHashDisplay';

interface Props {
  timeline: TimelineEvent[];
  currentStatus: BatchStatus;
}

export const SupplyChainTimeline: React.FC<Props> = ({ timeline, currentStatus }) => {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Farming':
        return <Sprout className="w-4 h-4 text-emerald-600" />;
      case 'Logistics':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'Wholesale':
        return <Building2 className="w-4 h-4 text-amber-600" />;
      case 'Retail':
        return <Store className="w-4 h-4 text-purple-600" />;
      case 'Consumer':
        return <ShoppingBag className="w-4 h-4 text-teal-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'Farming':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Logistics':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Wholesale':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Retail':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Consumer':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Immutable Supply Chain Journey</span>
          </h4>
          <p className="text-xs text-slate-500">
            Each physical handover is anchored with GPS, timestamp, and cryptographic proof
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Status: {currentStatus}</span>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-200 space-y-8">
        {timeline.map((event, idx) => {
          const isLatest = idx === timeline.length - 1;

          return (
            <div key={event.id || idx} className="relative group">
              {/* Dot indicator on the line */}
              <div 
                className={`absolute -left-[31px] sm:-left-[39px] top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white shadow-xs transition ${
                  isLatest 
                    ? 'border-emerald-600 ring-4 ring-emerald-100' 
                    : 'border-slate-300'
                }`}
              >
                {getStageIcon(event.stage)}
              </div>

              {/* Event card */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStageBadgeColor(event.stage)}`}>
                      {event.stage}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm sm:text-base">
                      {event.title}
                    </h5>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-mono flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">
                  {event.description}
                </p>

                {/* Metadata tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 truncate">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate"><strong className="text-slate-700">Custodian:</strong> {event.actorName}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate"><strong className="text-slate-700">Location:</strong> {event.location}</span>
                  </div>

                  {(event.temperature || event.humidity) && (
                    <div className="flex items-center gap-3 text-slate-600">
                      {event.temperature && (
                        <span className="flex items-center gap-1 text-blue-700 font-medium">
                          <Thermometer className="w-3.5 h-3.5" />
                          <span>{event.temperature}</span>
                        </span>
                      )}
                      {event.humidity && (
                        <span className="flex items-center gap-1 text-teal-700 font-medium">
                          <Droplets className="w-3.5 h-3.5" />
                          <span>{event.humidity}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Blockchain Proof Footnote */}
                <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Block:</span>
                    <span className="font-mono font-bold text-emerald-700">#{event.blockNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-slate-400 font-medium flex-shrink-0">Tx:</span>
                    <CryptoHashDisplay hash={event.txHash} truncateLength={8} />
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
