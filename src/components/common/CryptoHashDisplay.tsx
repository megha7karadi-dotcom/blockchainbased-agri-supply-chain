import React, { useState } from 'react';
import { Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';

interface Props {
  hash: string;
  label?: string;
  truncateLength?: number;
  showBadge?: boolean;
}

export const CryptoHashDisplay: React.FC<Props> = ({ 
  hash, 
  label, 
  truncateLength = 10,
  showBadge = true
}) => {
  const [copied, setCopied] = useState(false);

  const displayHash = hash.length > truncateLength * 2 + 4
    ? `${hash.substring(0, truncateLength)}...${hash.substring(hash.length - truncateLength)}`
    : hash;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600 bg-slate-100 hover:bg-slate-200/80 px-2 py-1 rounded border border-slate-300/80 transition max-w-full">
      {showBadge && (
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
      )}
      {label && <span className="text-slate-500 font-sans font-medium mr-1">{label}:</span>}
      <span className="text-slate-800 font-semibold truncate" title={hash}>
        {displayHash}
      </span>
      <button 
        type="button" 
        onClick={handleCopy} 
        className="text-slate-400 hover:text-emerald-700 p-0.5 rounded transition flex-shrink-0"
        title="Copy cryptographic hash"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
