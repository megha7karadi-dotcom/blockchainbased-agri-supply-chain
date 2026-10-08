import React, { useState, useEffect, useCallback } from 'react';
import { 
  BadgePercent, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Loader2,
  Wallet,
  RefreshCw,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { useWallet } from '../../context/WalletContext';
import { ProduceBatch } from '../../types/produce';
import { 
  getReadOnlyContract, 
  ROLES, 
  resolveBatchIdToBytes32, 
  getPriceHistoryFromChain,
  parseContractError,
  getContractAddress
} from '../../lib/blockchain/contract';
import { SEPOLIA_EXPLORER_URL } from '../../lib/blockchain/config';
import { OnChainPriceRecord, PRODUCE_STATUS_LABELS, OnChainProduceStatus } from '../../lib/blockchain/types';

export const DistributorUpdatePrice: React.FC = () => {
  const { batches, distributorSetPrice, navigateToVerification } = useApp();
  const { wallet, connect, switchToSepolia, isSepolia } = useWallet();

  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || 'AGRI-2026-MNG-001');
  const [customBatchInput, setCustomBatchInput] = useState<string>('');
  const [logisticsCost, setLogisticsCost] = useState<number>(50);
  const [margin, setMargin] = useState<number>(70);
  const [searchQuery, setSearchQuery] = useState('');

  // Signer & on-chain validation states
  const [signerAddress, setSignerAddress] = useState<string | null>(null);
  const [hasDistributorRole, setHasDistributorRole] = useState<boolean | null>(null);
  const [isCheckingSigner, setIsCheckingSigner] = useState<boolean>(false);

  // Batch on-chain verification states
  const [resolvedBytes32, setResolvedBytes32] = useState<string>('');
  const [batchExistsOnChain, setBatchExistsOnChain] = useState<boolean | null>(null);
  const [onChainBatchData, setOnChainBatchData] = useState<{
    cropName?: string;
    currentOwner?: string;
    status?: number;
  } | null>(null);
  const [isVerifyingBatch, setIsVerifyingBatch] = useState<boolean>(false);

  // Submission & confirmed on-chain history states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txProgress, setTxProgress] = useState<string | null>(null);
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null);
  const [confirmedBlockNumber, setConfirmedBlockNumber] = useState<number | null>(null);
  const [onChainPriceHistory, setOnChainPriceHistory] = useState<OnChainPriceRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Existing on-chain batches list for convenience
  const [onChainBatchesList, setOnChainBatchesList] = useState<Array<{ id: string; cropName: string; status: number }>>([]);

  const contractAddress = getContractAddress();

  // Active batches under distributor custody or ready for pricing from app state
  const distributorBatches = batches.filter(b => 
    b.status === 'In Transit' || 
    b.status === 'At Distributor' || 
    b.status === 'Ready for Dispatch' ||
    b.currentCustodianRole === 'distributor'
  );

  const effectiveBatchCode = customBatchInput.trim() || selectedBatchId;
  const activeBatch = batches.find(b => b.id === effectiveBatchCode || b.batchId === effectiveBatchCode) || 
    batches.find(b => b.id === selectedBatchId || b.batchId === selectedBatchId) || 
    distributorBatches[0] || 
    batches[0];

  // Check signer & role
  const checkSignerAndRole = useCallback(async () => {
    setIsCheckingSigner(true);
    try {
      let currentAddr = wallet.address;
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            currentAddr = accounts[0];
          }
        } catch {
          // fallback to wallet.address
        }
      }
      setSignerAddress(currentAddr);

      if (currentAddr) {
        const contract = getReadOnlyContract();
        const hasRole = await contract.hasRole(ROLES.DISTRIBUTOR_ROLE, currentAddr);
        setHasDistributorRole(hasRole);
      } else {
        setHasDistributorRole(false);
      }
    } catch (err) {
      console.warn('[DistributorUpdatePrice] Signer check error:', err);
      setHasDistributorRole(false);
    } finally {
      setIsCheckingSigner(false);
    }
  }, [wallet.address]);

  // Check batch existence on Sepolia contract
  const verifyBatchOnChain = useCallback(async (batchCode: string) => {
    if (!batchCode) return;
    setIsVerifyingBatch(true);
    try {
      const contract = getReadOnlyContract();
      const bytes32Id = await resolveBatchIdToBytes32(batchCode);
      setResolvedBytes32(bytes32Id);

      const exists = await contract.batchExists(bytes32Id);
      setBatchExistsOnChain(exists);

      if (exists) {
        const raw = await contract.getBatch(bytes32Id);
        setOnChainBatchData({
          cropName: raw.cropName,
          currentOwner: raw.currentOwner,
          status: Number(raw.status),
        });
        const history = await getPriceHistoryFromChain(bytes32Id);
        setOnChainPriceHistory(history);
      } else {
        setOnChainBatchData(null);
      }
    } catch (err) {
      console.warn('[DistributorUpdatePrice] Batch verify error:', err);
      setBatchExistsOnChain(false);
      setOnChainBatchData(null);
    } finally {
      setIsVerifyingBatch(false);
    }
  }, []);

  // Fetch all on-chain batches to assist user
  const fetchOnChainBatches = useCallback(async () => {
    try {
      const contract = getReadOnlyContract();
      const total = await contract.getTotalBatches();
      const count = Number(total);
      const items = [];
      for (let i = 0; i < count; i++) {
        const id = await contract.getBatchIdAtIndex(i);
        const b = await contract.getBatch(id);
        items.push({
          id,
          cropName: b.cropName,
          status: Number(b.status),
        });
      }
      setOnChainBatchesList(items);
    } catch (err) {
      console.warn('[DistributorUpdatePrice] On-chain batch list error:', err);
    }
  }, []);

  useEffect(() => {
    checkSignerAndRole();
    fetchOnChainBatches();
  }, [checkSignerAndRole, fetchOnChainBatches]);

  useEffect(() => {
    if (effectiveBatchCode) {
      verifyBatchOnChain(effectiveBatchCode);
    }
  }, [effectiveBatchCode, verifyBatchOnChain]);

  const handleSelectBatch = (b: ProduceBatch) => {
    setSelectedBatchId(b.batchId || b.id);
    setCustomBatchInput('');
    setLogisticsCost(b.pricing?.distributorLogisticsCost || 50);
    setMargin(b.pricing?.distributorMargin || 70);
    setSuccessNotice(null);
    setErrorMessage(null);
  };

  const farmerPrice = activeBatch?.pricing?.farmerPrice || activeBatch?.farmgatePrice || 180;
  const wholesalePrice = farmerPrice + Number(logisticsCost) + Number(margin);
  const fairCeiling = activeBatch?.pricing?.fairPriceCeiling || Math.round(farmerPrice * 2.2);
  const isOverCeiling = wholesalePrice > fairCeiling;
  const quantityKg = activeBatch?.quantityKg || activeBatch?.quantity || 500;
  const totalWholesaleValue = wholesalePrice * quantityKg;
  const totalMarginProfit = Number(margin) * quantityKg;
  const marginPercentage = Math.round((Number(margin) / wholesalePrice) * 100) || 0;

  // Account switch prompt for MetaMask
  const handleRequestAccountSwitch = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
        await checkSignerAndRole();
      } catch (err: any) {
        console.warn('Account switch request notice:', err?.message);
      }
    }
  };

  // Authoritative price update execution
  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);
    setConfirmedTxHash(null);
    setConfirmedBlockNumber(null);

    const targetBatchIdentifier = customBatchInput.trim() || activeBatch?.batchId || activeBatch?.id;
    if (!targetBatchIdentifier) {
      setErrorMessage('Please specify or select a produce batch.');
      return;
    }

    if (wholesalePrice <= 0) {
      setErrorMessage('InvalidPrice: Wholesale price must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setTxProgress('Preparing authoritative smart contract update...');

    try {
      // Execute the blockchain transaction
      const updated = await distributorSetPrice(
        targetBatchIdentifier,
        farmerPrice,
        marginPercentage,
        wholesalePrice,
        (progress) => setTxProgress(progress)
      );

      const txHash = updated?.blockchain?.txHash || null;
      const blockNum = updated?.blockchain?.blockNumber || null;
      setConfirmedTxHash(txHash);
      setConfirmedBlockNumber(blockNum);

      // Re-fetch authoritative price history from deployed contract
      const bytes32Id = await resolveBatchIdToBytes32(targetBatchIdentifier);
      const history = await getPriceHistoryFromChain(bytes32Id);
      setOnChainPriceHistory(history);

      setSuccessNotice(
        `Authoritative wholesale price of ₹${wholesalePrice}/kg successfully updated on Ethereum Sepolia! Confirmed in block #${blockNum || 'latest'}.`
      );
      await verifyBatchOnChain(targetBatchIdentifier);
    } catch (err: any) {
      console.error('[DistributorUpdatePrice] Execution error:', err);
      const parsed = parseContractError(err);
      setErrorMessage(parsed);
    } finally {
      setIsSubmitting(false);
      setTxProgress(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-12"
    >
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/50 text-slate-900 rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
              On-Chain Distributor Pricing
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Contract: {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Wholesale Price & Margin Architecture
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Configure transparent cold-chain freight rates and distribution margins. Price updates are cryptographically signed by verified Distributors on the Ethereum Sepolia smart contract.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs text-center flex-shrink-0">
          <span className="text-[11px] text-slate-500 font-semibold block">Regulated Margin Ceiling</span>
          <span className="text-2xl font-black text-blue-700">25.0%</span>
          <span className="text-[10px] text-emerald-700 font-medium block">Fair Trade Compliant</span>
        </div>
      </div>

      {/* METAMASK SIGNER & ROLE VERIFICATION BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${hasDistributorRole ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Active MetaMask Signer:</span>
              {signerAddress ? (
                <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  {signerAddress}
                </span>
              ) : (
                <span className="text-xs font-semibold text-rose-600">Wallet Disconnected</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-slate-500 font-medium">On-Chain Role:</span>
              {isCheckingSigner ? (
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Loader2 className="w-3 h-3 animate-spin" /> Verifying role...
                </span>
              ) : hasDistributorRole ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <UserCheck className="w-3 h-3" /> DISTRIBUTOR_ROLE (Verified)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <AlertCircle className="w-3 h-3" /> Missing DISTRIBUTOR_ROLE
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!signerAddress ? (
            <button
              onClick={connect}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Connect MetaMask
            </button>
          ) : !hasDistributorRole ? (
            <button
              onClick={handleRequestAccountSwitch}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch to Account 2 in MetaMask</span>
            </button>
          ) : (
            <button
              onClick={checkSignerAndRole}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Refresh signer status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {!isSepolia && (
            <button
              onClick={switchToSepolia}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Switch to Sepolia
            </button>
          )}
        </div>
      </div>

      {/* Warning Banner if connected with Account 1 / non-distributor */}
      {signerAddress && !hasDistributorRole && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Distributor Action Requires DISTRIBUTOR_ROLE</div>
            <p>
              Your connected MetaMask account (<span className="font-mono font-bold">{signerAddress}</span>) does not possess the required on-chain <code className="bg-amber-100 px-1 py-0.5 rounded">DISTRIBUTOR_ROLE</code>.
            </p>
            <p className="text-[11px] text-amber-800">
              Please open MetaMask, switch to <strong>Account 2 (0x700c6f0a003A81f4F8c1d5C99F065409c15466b6)</strong>, and click &quot;Switch to Account 2 in MetaMask&quot; above.
            </p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successNotice && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
          <button 
            onClick={() => setSuccessNotice(null)} 
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start justify-between gap-3 text-rose-900 text-xs"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Transaction Reverted</div>
              <div className="font-mono text-[11px] mt-0.5 break-all">{errorMessage}</div>
            </div>
          </div>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-rose-700 hover:text-rose-900 font-bold cursor-pointer"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Transaction Progress Banner */}
      {txProgress && (
        <div className="p-4 bg-blue-50 border border-blue-300 rounded-2xl flex items-center gap-3 text-blue-900 text-xs animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
          <span className="font-semibold">{txProgress}</span>
        </div>
      )}

      {/* Main Layout: Batch Selection & Price Configuration Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Lot Selector & Batch Resolver (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Select Produce Lot</h2>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                {distributorBatches.length} Available
              </span>
            </div>

            {/* Custom Batch ID Input or Override */}
            <div className="space-y-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700">
                Batch ID to Update (Code or bytes32):
              </label>
              <input
                type="text"
                value={customBatchInput}
                onChange={(e) => setCustomBatchInput(e.target.value)}
                placeholder="e.g. AGRI-2026-MNG-001 or 0x8a6e..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-500">
                Supports human-readable code or direct 0x bytes32 hash.
              </p>
            </div>

            {/* On-Chain Resolution Status */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600">On-Chain bytes32 ID:</span>
                {isVerifyingBatch ? (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Loader2 className="w-3 h-3 animate-spin" /> Resolving...
                  </span>
                ) : batchExistsOnChain ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    BatchExists = true
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    BatchNotFound
                  </span>
                )}
              </div>
              <div className="font-mono text-[10px] text-slate-700 break-all bg-white p-2 rounded-xl border border-slate-200">
                {resolvedBytes32 || '0x...'}
              </div>

              {onChainBatchData && (
                <div className="pt-1 text-[11px] text-slate-600 space-y-0.5 border-t border-slate-200">
                  <div>Crop: <strong className="text-slate-800">{onChainBatchData.cropName}</strong></div>
                  <div>Status: <strong className="text-slate-800">{PRODUCE_STATUS_LABELS[onChainBatchData.status as OnChainProduceStatus] || onChainBatchData.status}</strong></div>
                  <div>Owner: <span className="font-mono text-[10px] text-slate-700">{onChainBatchData.currentOwner}</span></div>
                </div>
              )}
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by crop name or lot..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* List of Produce Batches */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {distributorBatches
                .filter(b => 
                  (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (b.batchId || '').toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(batch => {
                  const isSelected = (activeBatch?.id === batch.id || activeBatch?.batchId === batch.batchId) && !customBatchInput;
                  return (
                    <button
                      key={batch.id}
                      onClick={() => handleSelectBatch(batch)}
                      className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-400 shadow-2xs' 
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-slate-800">
                            {batch.batchId}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {batch.quantityKg || batch.quantity} kg
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 line-clamp-1">{batch.name}</div>
                        <div className="text-[11px] text-slate-500">
                          Farmer floor: <strong className="text-emerald-800 font-mono">₹{batch.pricing?.farmerPrice || batch.farmgatePrice}/kg</strong>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-900 block">
                          ₹{batch.pricing?.finalConsumerPrice || 80}/kg
                        </span>
                        <span className="text-[10px] text-blue-700 font-semibold">Wholesale</span>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* On-Chain Batches Discovered on Sepolia */}
            {onChainBatchesList.length > 0 && (
              <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-200 text-xs space-y-2">
                <div className="font-bold text-indigo-900 flex items-center justify-between">
                  <span>Registered Batches on Sepolia:</span>
                  <span className="font-mono text-[10px] font-semibold">{onChainBatchesList.length}</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {onChainBatchesList.map(ocb => (
                    <div 
                      key={ocb.id} 
                      onClick={() => setCustomBatchInput(ocb.id)}
                      className="p-1.5 bg-white rounded-lg border border-indigo-100 hover:border-indigo-300 cursor-pointer flex items-center justify-between text-[11px]"
                    >
                      <span className="font-bold text-slate-800">{ocb.cropName}</span>
                      <span className="font-mono text-[10px] text-indigo-700">{ocb.id.slice(0, 8)}...{ocb.id.slice(-6)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Margin Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeBatch ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
              
              {/* Active Lot Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {customBatchInput.trim() || activeBatch.batchId}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-semibold text-slate-500">{activeBatch.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{activeBatch.name}</h3>
                  <p className="text-xs text-slate-500">Farmer: {activeBatch.farmerName} • {activeBatch.farmerLocation || activeBatch.farmLocation}</p>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Lot Quantity</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{quantityKg.toLocaleString()} kg</span>
                </div>
              </div>

              {/* Live Cost Stack Visualizer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Supply Chain Cost Stack Breakdown</span>
                  <span className="font-mono text-blue-700">₹{wholesalePrice}/kg to Retailer</span>
                </div>

                <div className="h-4 rounded-xl overflow-hidden flex bg-slate-100 border border-slate-200 text-[10px] font-bold text-white text-center">
                  <div 
                    style={{ width: `${Math.min(100, Math.max(5, (farmerPrice / wholesalePrice) * 100))}%` }}
                    className="bg-emerald-600 flex items-center justify-center transition-all"
                    title={`Farmer Price: ₹${farmerPrice}/kg`}
                  >
                    {Math.round((farmerPrice / wholesalePrice) * 100)}%
                  </div>
                  <div 
                    style={{ width: `${Math.min(100, Math.max(5, (logisticsCost / wholesalePrice) * 100))}%` }}
                    className="bg-blue-600 flex items-center justify-center transition-all"
                    title={`Logistics: ₹${logisticsCost}/kg`}
                  >
                    {Math.round((logisticsCost / wholesalePrice) * 100)}%
                  </div>
                  <div 
                    style={{ width: `${Math.min(100, Math.max(5, (margin / wholesalePrice) * 100))}%` }}
                    className="bg-indigo-600 flex items-center justify-center transition-all"
                    title={`Distributor Margin: ₹${margin}/kg`}
                  >
                    {Math.round((margin / wholesalePrice) * 100)}%
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>Farmer: ₹{farmerPrice}/kg</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span>Cold Freight: ₹{logisticsCost}/kg</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <span>Distributor Margin: ₹{margin}/kg ({marginPercentage}%)</span>
                  </span>
                </div>
              </div>

              {/* Pricing Form */}
              <form onSubmit={handleSavePrice} className="space-y-5 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block font-bold text-slate-800">
                      Cold Reefer Freight & Handling (₹/kg)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Includes refrigerated fuel, driver labor, packaging crates, and insurance.
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        min={0}
                        max={300}
                        value={logisticsCost}
                        onChange={(e) => setLogisticsCost(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block font-bold text-slate-800">
                      Distributor Margin (₹/kg)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Wholesale profit markup capped at 25% by fair trade governance.
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        min={0}
                        max={300}
                        value={margin}
                        onChange={(e) => setMargin(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-bold font-mono text-slate-900 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Summary Box */}
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Calculated Wholesale Price to Retailer:</span>
                    <span className="text-base font-black text-blue-900 font-mono">₹{wholesalePrice}/kg</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Total Lot Wholesale Turnover ({quantityKg} kg):</span>
                    <span className="font-bold text-slate-900 font-mono">₹{totalWholesaleValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Net Distributor Margin Earned:</span>
                    <span className="font-bold text-emerald-800 font-mono">₹{totalMarginProfit.toLocaleString()}</span>
                  </div>
                </div>

                {/* Quick 300 Button for Testing */}
                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl text-[11px]">
                  <span className="text-slate-600">Testing shortcut:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const needed = 300 - farmerPrice;
                      const splitLogistics = Math.floor(needed / 2);
                      const splitMargin = needed - splitLogistics;
                      setLogisticsCost(splitLogistics);
                      setMargin(splitMargin);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg font-bold font-mono text-blue-700 cursor-pointer"
                  >
                    Set Total to ₹300/kg
                  </button>
                </div>

                {/* Fair Price Ceiling Compliance Warning */}
                {isOverCeiling ? (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2 text-amber-900 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      Notice: Wholesale price ₹{wholesalePrice}/kg exceeds fair reference ceiling of ₹{fairCeiling}/kg. On-chain transparency will record full pricing trail.
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-900 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      Compliant: Wholesale quote is within fair market limits (Ceiling: ₹{fairCeiling}/kg).
                    </span>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming on Blockchain...</span>
                      </>
                    ) : (
                      <>
                        <BadgePercent className="w-4 h-4" />
                        <span>Publish Wholesale Price on Blockchain</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToVerification(activeBatch.batchId || activeBatch.id)}
                    className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
                  >
                    View Batch Passport
                  </button>
                </div>
              </form>

              {/* CONFIRMED ON-CHAIN PRICE HISTORY & TRANSACTION DETAILS */}
              {(confirmedTxHash || onChainPriceHistory.length > 0) && (
                <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-blue-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-bold text-slate-900 text-xs">Authoritative On-Chain Price Records</h4>
                    </div>
                    {confirmedTxHash && (
                      <a
                        href={`${SEPOLIA_EXPLORER_URL}/tx/${confirmedTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <span>View on Etherscan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {confirmedTxHash && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-500 block">Transaction Hash:</span>
                        <span className="font-bold text-slate-800 break-all">{confirmedTxHash}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Sepolia Block:</span>
                        <span className="font-bold text-emerald-700">#{confirmedBlockNumber || 'Confirmed'}</span>
                      </div>
                    </div>
                  )}

                  {/* List of price records queried from smart contract */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 block">Price History from Sepolia Contract:</span>
                    {onChainPriceHistory.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">No price records logged yet for this batch.</p>
                    ) : (
                      <div className="space-y-2">
                        {onChainPriceHistory.map((rec, i) => (
                          <div 
                            key={i} 
                            className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 font-mono text-sm">₹{Number(rec.pricePerKg)}/kg</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                                  {PRODUCE_STATUS_LABELS[rec.stage as OnChainProduceStatus] || `Stage ${rec.stage}`}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Set by: {rec.setBy || rec.updatedBy || 'Authoritative Signer'}
                              </div>
                            </div>
                            <div className="text-right text-[10px] text-slate-500 flex items-center gap-1 sm:justify-end">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{new Date(Number(rec.timestamp) * 1000).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
              <BadgePercent className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-sm">No produce lot selected</p>
              <p className="text-xs text-slate-400">Select a batch from the left column to configure its price stack.</p>
            </div>
          )}
        </div>

      </div>

    </motion.div>
  );
};
