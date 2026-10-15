import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface BackButtonProps {
  fallback?: string;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallback,
  label = 'Back',
  className = '',
}) => {
  const { goBack } = useApp();

  return (
    <button
      type="button"
      onClick={() => goBack(fallback)}
      className={`group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-2xs hover:text-emerald-700 cursor-pointer ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600 group-hover:-translate-x-0.5 transition-transform shrink-0" />
      <span>{label}</span>
    </button>
  );
};
