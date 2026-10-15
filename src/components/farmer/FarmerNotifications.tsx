
import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  CheckCheck,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';
import { BackButton } from '../common/BackButton';

type Language = 'en' | 'hi' | 'kn';
type FilterType = 'all' | 'procurement' | 'cold-chain' | 'fraud' | 'system';

const translations: Record<Language, Record<string, string>> = {
  en: {
    title: 'Farm Node Activity & Alerts',
    description:
      'Real-time smart contract settlements, cold-chain handovers, buyer bids, and laboratory oracles',
    markAllRead: 'Mark all as read',
    all: 'All Alerts',
    procurement: 'Bids & Escrow',
    coldChain: 'Logistics',
    fraud: 'Anomalies',
    system: 'System Oracles',
    emptyTitle: 'No notifications found',
    emptyDescription: 'All alerts in this category have been cleared.',
    lot: 'Lot:',
    takeAction: 'Take Action',
    unread: 'Unread',
  },
  hi: {
    title: 'कृषि नोड गतिविधियाँ और अलर्ट',
    description:
      'स्मार्ट कॉन्ट्रैक्ट निपटान, कोल्ड-चेन हस्तांतरण, खरीदारों की बोलियाँ और प्रयोगशाला सूचनाएँ',
    markAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
    all: 'सभी अलर्ट',
    procurement: 'बोलियाँ और एस्क्रो',
    coldChain: 'लॉजिस्टिक्स',
    fraud: 'असामान्य गतिविधियाँ',
    system: 'सिस्टम सूचनाएँ',
    emptyTitle: 'कोई सूचना नहीं मिली',
    emptyDescription: 'इस श्रेणी के सभी अलर्ट साफ़ कर दिए गए हैं।',
    lot: 'बैच:',
    takeAction: 'कार्रवाई करें',
    unread: 'अपठित',
  },
  kn: {
    title: 'ಕೃಷಿ ನೋಡ್ ಚಟುವಟಿಕೆಗಳು ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು',
    description:
      'ಸ್ಮಾರ್ಟ್ ಕಾಂಟ್ರಾಕ್ಟ್ ಇತ್ಯರ್ಥಗಳು, ಕೋಲ್ಡ್-ಚೈನ್ ಹಸ್ತಾಂತರಗಳು, ಖರೀದಿದಾರರ ಬಿಡ್‌ಗಳು ಮತ್ತು ಪ್ರಯೋಗಾಲಯ ಸೂಚನೆಗಳು',
    markAllRead: 'ಎಲ್ಲವನ್ನೂ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ',
    all: 'ಎಲ್ಲಾ ಎಚ್ಚರಿಕೆಗಳು',
    procurement: 'ಬಿಡ್‌ಗಳು ಮತ್ತು ಎಸ್ಕ್ರೋ',
    coldChain: 'ಸಾರಿಗೆ',
    fraud: 'ಅಸಾಮಾನ್ಯ ಚಟುವಟಿಕೆಗಳು',
    system: 'ಸಿಸ್ಟಮ್ ಸೂಚನೆಗಳು',
    emptyTitle: 'ಯಾವುದೇ ಸೂಚನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    emptyDescription: 'ಈ ವಿಭಾಗದ ಎಲ್ಲಾ ಎಚ್ಚರಿಕೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಲಾಗಿದೆ.',
    lot: 'ಬ್ಯಾಚ್:',
    takeAction: 'ಕ್ರಮ ಕೈಗೊಳ್ಳಿ',
    unread: 'ಓದದಿರುವುದು',
  },
};

export const FarmerNotifications: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    navigate,
    setSelectedBatchId,
  } = useApp();

  const { language } = useFarmerLanguage();
  const t = translations[language as Language] || translations.en;

  const [filterType, setFilterType] = useState<FilterType>('all');

  const safeNotifications = Array.isArray(notifications)
    ? notifications
    : [];

  const unreadCount = safeNotifications.filter(
    (notification) => !notification.read
  ).length;

  const handleMarkAllRead = () => {
    safeNotifications.forEach((notification) => {
      if (!notification.read) {
        markNotificationRead(notification.id);
      }
    });
  };

  const filteredNotifications = safeNotifications.filter((notification) => {
    if (filterType === 'all') return true;
    return notification.type === filterType;
  });

  const handleActionClick = (notification: (typeof safeNotifications)[number]) => {
    markNotificationRead(notification.id);

    if (notification.batchId) {
      setSelectedBatchId(notification.batchId);
    }

    if (notification.type === 'procurement') {
      navigate('/farmer/bids');
    } else if (
      notification.type === 'cold-chain' ||
      notification.type === 'system'
    ) {
      navigate('/farmer/my-produce');
    } else {
      navigate('/farmer/dashboard');
    }
  };

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: t.all },
    { value: 'procurement', label: t.procurement },
    { value: 'cold-chain', label: t.coldChain },
    { value: 'fraud', label: t.fraud },
    { value: 'system', label: t.system },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-start">
        <BackButton fallback="/farmer/dashboard" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            <span>{t.title}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.description}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {t.markAllRead} ({unreadCount})
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterType(option.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterType === option.value
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">
              {t.emptyTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {t.emptyDescription}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-5 transition flex items-start gap-4 ${
                notification.read
                  ? 'bg-white hover:bg-slate-50/70'
                  : 'bg-emerald-50/40 hover:bg-emerald-50/70'
              }`}
            >
              <div
                className={`p-2.5 rounded-2xl flex-shrink-0 ${
                  notification.type === 'procurement'
                    ? 'bg-emerald-100 text-emerald-800'
                    : notification.type === 'fraud'
                      ? 'bg-rose-100 text-rose-800'
                      : notification.type === 'cold-chain'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                }`}
              >
                {notification.type === 'procurement' && (
                  <DollarSign className="w-5 h-5" />
                )}
                {notification.type === 'fraud' && (
                  <AlertTriangle className="w-5 h-5" />
                )}
                {notification.type === 'cold-chain' && (
                  <TrendingUp className="w-5 h-5" />
                )}
                {notification.type === 'system' && (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3
                    className={`text-xs sm:text-sm font-bold ${
                      notification.read
                        ? 'text-slate-700'
                        : 'text-slate-900'
                    }`}
                  >
                    {notification.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {notification.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {notification.message}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1.5">
                  {notification.batchId && (
                    <span className="inline-block font-mono text-[10px] text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded font-semibold">
                      {t.lot} {notification.batchId}
                    </span>
                  )}

                  <button
                    onClick={() => handleActionClick(notification)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer ml-auto"
                  >
                    <span>{t.takeAction}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {!notification.read && (
                <span
                  className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0 mt-1.5"
                  title={t.unread}
                  aria-label={t.unread}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
