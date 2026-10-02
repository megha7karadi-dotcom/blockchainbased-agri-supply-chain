import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  HelpCircle,
  FileCode,
  ArrowRight,
  Terminal,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { SEPOLIA_CHAIN_ID, SEPOLIA_EXPLORER_URL } from '../../lib/blockchain/config';

interface SepoliaDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SepoliaDeploymentModal: React.FC<SepoliaDeploymentModalProps> = ({ isOpen, onClose }) => {
  const { 
    wallet, 
    isSepolia, 
    contractAddress, 
    isContractReady, 
    updateContractAddress, 
    switchToSepolia, 
    connect 
  } = useWallet();

  const [inputAddress, setInputAddress] = useState(contractAddress || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAbi, setCopiedAbi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    const trimmed = inputAddress.trim();
    if (!trimmed.startsWith('0x') || trimmed.length !== 42 || !/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setSaveError('Invalid Ethereum contract address. Must be a 42-character hexadecimal string starting with 0x.');
      return;
    }

    try {
      setIsSaving(true);
      await updateContractAddress(trimmed);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update contract address.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySolidity = async () => {
    try {
      const res = await fetch('/contracts/AgriTraceSupplyChain.sol');
      if (res.ok) {
        const text = await res.text();
        await navigator.clipboard.writeText(text);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        return;
      }
    } catch {
      // fallback
    }
    // Fallback notice
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyAbi = async () => {
    try {
      const { AGRITRACE_ABI } = await import('../../lib/blockchain/abi');
      await navigator.clipboard.writeText(JSON.stringify(AGRITRACE_ABI, null, 2));
      setCopiedAbi(true);
      setTimeout(() => setCopiedAbi(false), 2000);
    } catch (err) {
      console.warn('Could not copy ABI:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Ethereum Sepolia Contract Deployment</h3>
              <p className="text-xs text-slate-400">Configure or link the authoritative AgriTrace smart contract</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Network & Wallet Status Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {/* Target Network Card */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 block mb-1">Target Blockchain Network</span>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Ethereum Sepolia
                </span>
                <span className="font-mono text-[11px] bg-slate-700/60 px-2 py-0.5 rounded text-slate-300">
                  Chain 11155111
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Public Node: <span className="font-mono text-slate-300">ethereum-sepolia-rpc.publicnode.com</span>
              </span>
            </div>

            {/* User Wallet Status */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 block mb-1">Connected MetaMask Wallet</span>
              {wallet.isConnected ? (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-200 text-xs">
                      {wallet.address ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}` : 'Connected'}
                    </span>
                    {isSepolia ? (
                      <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                        On Sepolia
                      </span>
                    ) : (
                      <button
                        onClick={() => switchToSepolia()}
                        className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium hover:bg-amber-500/30 transition cursor-pointer"
                      >
                        Switch to Sepolia
                      </button>
                    )}
                  </div>
                  {!isSepolia && (
                    <span className="text-[11px] text-amber-400 mt-1 block">
                      Currently on {wallet.networkName || `Chain ${wallet.chainId}`}. Click above to switch.
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-slate-400 text-xs">Not connected</span>
                  <button
                    onClick={() => connect()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                  >
                    Connect MetaMask
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contract Address Configuration Form */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
            <h4 className="text-sm font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Active Sepolia Contract Address
            </h4>
            <p className="text-xs text-slate-300 mb-3">
              Enter the deployed Sepolia contract address below. This address is synchronized across the frontend, backend verification, and QR code provenance audits.
            </p>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  placeholder="0x... (42-character Sepolia contract address)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              {saveError && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{saveError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Contract address saved and synchronized across frontend and backend!</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                {isContractReady ? (
                  <a
                    href={`${SEPOLIA_EXPLORER_URL}/address/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition"
                  >
                    <span>View on Sepolia Etherscan</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-[11px] text-amber-400 font-medium">Status: Awaiting Sepolia contract deployment</span>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-900/20"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Synchronize Address</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Step-by-Step Deployment Instructions */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              How to Deploy to Ethereum Sepolia via Remix
            </h4>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Open <a href="https://remix.ethereum.org" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline hover:text-white inline-flex items-center gap-0.5">Remix Ethereum IDE <ExternalLink className="w-2.5 h-2.5" /></a> in your browser.
              </li>
              <li>
                Create a file named <span className="font-mono text-emerald-300 bg-slate-800 px-1.5 py-0.5 rounded">AgriTraceSupplyChain.sol</span> and paste the contract code.
              </li>
              <li>
                In the <strong>Solidity Compiler</strong> tab, choose compiler <span className="font-mono text-slate-200">0.8.20</span> (or 0.8.28 with EVM Shanghai/Cancun) and click <strong>Compile</strong>.
              </li>
              <li>
                In the <strong>Deploy & Run Transactions</strong> tab:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-slate-400">
                  <li>Set <strong>Environment</strong> to <strong className="text-slate-200">"Injected Provider - MetaMask"</strong>.</li>
                  <li>Ensure your MetaMask is switched to <strong className="text-slate-200">Sepolia</strong> (with your test ETH).</li>
                  <li>In the constructor input <span className="font-mono text-slate-200">initialAdmin</span>, enter your MetaMask wallet address.</li>
                </ul>
              </li>
              <li>
                Click <strong className="text-emerald-400">Deploy</strong> and confirm the transaction in MetaMask.
              </li>
              <li>
                Copy the newly deployed contract address from Remix and paste it into the input box above.
              </li>
            </ol>

            {/* Helper Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleCopyAbi}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
              >
                {copiedAbi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAbi ? 'ABI Copied!' : 'Copy Contract ABI'}</span>
              </button>

              <a
                href="https://sepoliafaucet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-slate-700"
              >
                <span>Sepolia Faucet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://sepolia.etherscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 border border-slate-700"
              >
                <span>Sepolia Etherscan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
