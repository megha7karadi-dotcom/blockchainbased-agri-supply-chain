import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  Link, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  Copy, 
  Check, 
  X,
  Layers,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { SEPOLIA_EXPLORER_URL } from '../../lib/blockchain/config';
import { SepoliaDeploymentModal } from './SepoliaDeploymentModal';

export const BlockchainStatusBar: React.FC = () => {
  const { 
    wallet, 
    isMetaMaskInstalled, 
    isSepolia, 
    contractAddress, 
    isContractReady, 
    connect, 
    disconnect, 
    switchToSepolia, 
    lastTx, 
    clearLastTx 
  } = useWallet();

  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  const handleCopyContract = () => {
    if (!contractAddress) return;
    navigator.clipboard.writeText(contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleCopyTx = (txHash: string) => {
    navigator.clipboard.writeText(txHash);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const shortAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <div className="w-full bg-slate-900 border-b border-slate-800 text-slate-200 text-xs px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Contract status & Network indicator */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ethereum Sepolia</span>
            </div>

            {/* Contract State */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Contract:</span>
              {isContractReady ? (
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  <button
                    onClick={handleCopyContract}
                    title="Click to copy contract address"
                    className="text-slate-300 font-mono hover:text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{shortAddress(contractAddress)}</span>
                    {copiedContract ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <a
                    href={`${SEPOLIA_EXPLORER_URL}/address/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on Sepolia Etherscan"
                    className="text-slate-400 hover:text-emerald-400 transition ml-0.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Awaiting Sepolia contract deployment
                </span>
              )}

              <button
                onClick={() => setIsDeployModalOpen(true)}
                title="Configure Sepolia Contract"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700 ml-0.5"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Wallet connection & Network check */}
          <div className="flex items-center gap-2 flex-wrap">
            {wallet.isConnected ? (
              <div className="flex items-center gap-2">
                {/* Network pill */}
                {isSepolia ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium hidden sm:inline">
                    Sepolia (11155111)
                  </span>
                ) : (
                  <button
                    onClick={() => switchToSepolia()}
                    className="flex items-center gap-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Switch to Sepolia</span>
                  </button>
                )}

                {/* Account address */}
                <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-xl text-slate-200">
                  <span className={`w-2 h-2 rounded-full ${isSepolia ? 'bg-green-400' : 'bg-amber-400'}`} />
                  <span className="font-mono text-[11px]">{shortAddress(wallet.address || '')}</span>
                </div>

                <button
                  onClick={disconnect}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer px-1 py-0.5"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect()}
                disabled={wallet.isConnecting}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] px-3 py-1 rounded-xl transition cursor-pointer shadow-xs"
              >
                {wallet.isConnecting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-3 h-3" />
                    <span>Connect MetaMask</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Transaction Notifications Banner */}
        {lastTx.status === 'pending' && (
          <div className="max-w-7xl mx-auto mt-2 bg-blue-950/70 border border-blue-800 rounded-xl p-3 flex items-center justify-between text-blue-200">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
              <div>
                <span className="font-semibold text-blue-100 block">
                  Authoritative Ethereum Sepolia Transaction Pending ({lastTx.actionName || 'Transaction'})
                </span>
                <span className="text-[11px] text-blue-300">
                  Authoritative Solidity business rules are validating this transaction on Ethereum Sepolia. Waiting for block confirmation...
                </span>
              </div>
            </div>
          </div>
        )}

        {lastTx.status === 'success' && (
          <div className="max-w-7xl mx-auto mt-2 bg-emerald-950/70 border border-emerald-800 rounded-xl p-3 flex items-center justify-between text-emerald-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-emerald-100 block">
                  Sepolia Blockchain Confirmation Verified! ({lastTx.actionName || 'Action'})
                </span>
                <span className="text-[11px] text-emerald-300 flex items-center gap-1.5 flex-wrap">
                  <span>Block #{lastTx.blockNumber} • Tx:</span>
                  <button
                    onClick={() => handleCopyTx(lastTx.hash || '')}
                    className="font-mono text-emerald-200 underline hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>{shortAddress(lastTx.hash || '')}</span>
                    {copiedTx ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                  </button>
                  {lastTx.hash && (
                    <a
                      href={`${SEPOLIA_EXPLORER_URL}/tx/${lastTx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-300 hover:text-white flex items-center gap-0.5 ml-1"
                    >
                      <span>Etherscan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </span>
              </div>
            </div>
            <button
              onClick={clearLastTx}
              className="text-emerald-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {lastTx.status === 'error' && (
          <div className="max-w-7xl mx-auto mt-2 bg-rose-950/80 border border-rose-800 rounded-xl p-3 flex items-center justify-between text-rose-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-rose-100 block">
                  Authoritative Smart Contract Reverted ({lastTx.actionName || 'Operation'})
                </span>
                <p className="text-[11px] text-rose-300 mt-0.5 max-w-2xl">
                  {lastTx.errorMessage}
                </p>
              </div>
            </div>
            <button
              onClick={clearLastTx}
              className="text-rose-400 hover:text-white p-1 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {wallet.error && (
          <div className="max-w-7xl mx-auto mt-2 bg-amber-950/80 border border-amber-800 rounded-xl p-2.5 flex items-center justify-between text-amber-200 text-[11px]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{wallet.error}</span>
            </div>
            <button
              onClick={() => connect()}
              className="text-amber-300 underline font-semibold cursor-pointer ml-2 hover:text-white"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>

      <SepoliaDeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </>
  );
};
