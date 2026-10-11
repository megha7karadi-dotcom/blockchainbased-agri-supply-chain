import React, { useEffect, useState } from 'react';
import { MessageSquare, X, Check, Copy, ShieldCheck, ArrowRight } from 'lucide-react';

interface SmsNotificationData {
  phone: string;
  code: string;
  sender?: string;
  timestamp?: string;
  purpose?: 'login' | 'signup';
}

interface Props {
  sms: SmsNotificationData | null;
  onClose: () => void;
  onAutoFill?: (code: string) => void;
}

export const RealtimeSmsNotification: React.FC<Props> = ({ sms, onClose, onAutoFill }) => {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sms) {
      setVisible(true);

      // Play a soft, pleasant notification chime using Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const now = audioCtx.currentTime;

        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.36);
      } catch {
        // Audio playback not allowed or not supported in silent environment
      }

      // Auto-hide after 18 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 18000);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [sms, onClose]);

  if (!sms || !visible) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(sms.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFill = () => {
    if (onAutoFill) {
      onAutoFill(sms.code);
    }
  };

  return (
    <aside 
      aria-label="SMS Notification"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in slide-in-from-top duration-300 pointer-events-auto"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 flex items-start gap-3">
        {/* App Icon */}
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-md">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{sms.sender || 'AgriTrace SMS Gateway'}</span>
            </span>
            <span>Just now</span>
          </div>

          <div className="mt-1 text-xs text-slate-200 leading-snug">
            Your verification OTP for <strong className="text-white font-mono">{sms.phone}</strong> is:
          </div>

          {/* Large Code Badge */}
          <div className="mt-2 inline-flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl">
            <span className="text-base font-extrabold tracking-widest text-emerald-300 font-mono">
              {sms.code}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              (Valid 5 min)
            </span>
          </div>

          {/* Quick Actions */}
          <div className="mt-3 flex items-center gap-2">
            {onAutoFill && (
              <button
                type="button"
                onClick={handleFill}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <span>Enter Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded-lg transition flex items-center gap-1 cursor-pointer border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 200);
          }}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
