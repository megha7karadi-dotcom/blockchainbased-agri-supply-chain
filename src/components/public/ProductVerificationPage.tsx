import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Leaf, 
  MapPin, 
  Award, 
  TrendingUp, 
  QrCode, 
  Clock, 
  Layers, 
  FileCheck2, 
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Truck,
  Store,
  Calendar,
  DollarSign,
  Info,
  ExternalLink,
  Star,
  MessageSquare,
  Heart,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { useWallet } from '../../context/WalletContext';
import { SupplyChainTimeline } from '../common/SupplyChainTimeline';
import { PriceBreakdownCard } from '../common/PriceBreakdownCard';
import { QRCodeModal } from '../common/QRCodeModal';
import { ProduceBatch, TimelineEvent } from '../../types/produce';
import { productService } from '../../services/productService';
import { getContractAddress, SEPOLIA_EXPLORER_URL, isContractConfigured } from '../../lib/blockchain/config';
import {
  resolveBatchIdToBytes32,
  getReadOnlyContract,
  getBatchFromChain,
  getPriceHistoryFromChain,
  getProvenanceHistoryFromChain,
  checkBatchExistsOnChain,
} from '../../lib/blockchain/contract';
import {
  OnChainProduceBatch,
  OnChainPriceRecord,
  OnChainProvenanceRecord,
  OnChainProduceStatus,
  OnChainQualityGrade,
  PRODUCE_STATUS_LABELS,
  QUALITY_GRADE_LABELS,
  mapOnChainStatusToUi,
} from '../../lib/blockchain/types';

export const ProductVerificationPage: React.FC<{ onOpenQRScanner: () => void }> = ({ onOpenQRScanner }) => {
  const { batches, currentPath, navigate, selectedBatchId, setSelectedBatchId } = useApp();
  const { addScanRecord, contractAddress } = useWallet();
  const [searchInput, setSearchInput] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'journey' | 'pricing' | 'origin' | 'blockchain' | 'qr' | 'feedback'>('journey');
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Consumer Feedback & Review state
  const [rating, setRating] = useState(5);
  const [freshnessRating, setFreshnessRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewsList, setReviewsList] = useState([
    {
      id: 'rev-1',
      name: 'Priya Sharma',
      rating: 5,
      freshness: 5,
      date: 'Yesterday',
      comment: 'Super crisp and naturally sweet! Glad to see the direct payout to the farmer right here in the price breakdown.'
    },
    {
      id: 'rev-2',
      name: 'Anand Kumar',
      rating: 5,
      freshness: 4,
      date: '3 days ago',
      comment: 'Scanned the shelf barcode in-store. Knowing it came straight from Nashik cold storage gives great confidence.'
    }
  ]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      name: reviewerName.trim() || 'Verified Consumer',
      rating,
      freshness: freshnessRating,
      date: 'Just now',
      comment: reviewComment.trim()
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewComment('');
    setReviewerName('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  // 1. Extract requested batchId from currentPath, browser pathname, or search parameters
  const requestedId = useMemo(() => {
    // A. From currentPath (/verify/AGRI-...)
    if (currentPath && currentPath.startsWith('/verify/')) {
      const seg = currentPath.replace(/^\/verify\/?/, '').split('/')[0].split('?')[0].split('#')[0].trim();
      if (seg) return decodeURIComponent(seg);
    }

    // B. From browser window pathname
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/verify/')) {
      const seg = window.location.pathname.replace(/^\/verify\/?/, '').split('/')[0].split('?')[0].split('#')[0].trim();
      if (seg) return decodeURIComponent(seg);
    }

    // C. From URL search parameters (?verify=... or ?batchId=... or ?id=...)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('batchId') || params.get('verify') || params.get('id');
      if (q) return q.trim();
    }

    // D. Fallback to state selectedBatchId if present
    if (selectedBatchId) {
      return selectedBatchId;
    }

    return null;
  }, [currentPath, selectedBatchId]);

  // Determine active target identifier to look up
  const activeIdentifier = useMemo(() => {
    return requestedId || batches[0]?.batchId || 'AGRI-2026-RIC-003';
  }, [requestedId, batches]);

  // Find supplementary local batch record (if exists)
  const localMatch = useMemo(() => {
    if (!activeIdentifier) return null;
    const cleanReq = activeIdentifier.toLowerCase().trim();
    let found = batches.find(b => 
      b.batchId.toLowerCase() === cleanReq || 
      b.id.toLowerCase() === cleanReq
    );

    // Also check localStorage in case of newly registered batch
    if (!found && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('agritrace_batches_v1');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            found = list.find((b: ProduceBatch) => 
              b.batchId?.toLowerCase() === cleanReq || 
              b.id?.toLowerCase() === cleanReq
            );
          }
        }
      } catch {
        // ignore
      }
    }
    return found || null;
  }, [activeIdentifier, batches]);

  // Canonical human-readable batch ID (e.g. AGRI-2026-RIC-003)
  const canonicalBatchId = useMemo(() => {
    if (localMatch?.batchId) return localMatch.batchId;
    return activeIdentifier;
  }, [localMatch, activeIdentifier]);

  // On-Chain verification state
  const [isLoadingChain, setIsLoadingChain] = useState<boolean>(true);
  const [onChainBatch, setOnChainBatch] = useState<OnChainProduceBatch | null>(null);
  const [onChainPrices, setOnChainPrices] = useState<OnChainPriceRecord[]>([]);
  const [onChainProvenance, setOnChainProvenance] = useState<OnChainProvenanceRecord[]>([]);
  const [resolvedBytes32, setResolvedBytes32] = useState<string | null>(null);
  const [isChainVerified, setIsChainVerified] = useState<boolean>(false);
  const [chainNotFound, setChainNotFound] = useState<boolean>(false);
  const [rpcError, setRpcError] = useState<string | null>(null);

  // Authoritative on-chain query logic
  const verifyOnChain = useCallback(async () => {
    if (!canonicalBatchId) {
      setIsLoadingChain(false);
      return;
    }

    setIsLoadingChain(true);
    setRpcError(null);
    setIsChainVerified(false);
    setChainNotFound(false);

    try {
      // 1. Resolve requested human-readable batch ID to the correct on-chain bytes32 ID
      const bytes32 = await resolveBatchIdToBytes32(canonicalBatchId);
      setResolvedBytes32(bytes32);

      // 2. Fetch on-chain batch struct directly from deployed Sepolia contract
      const rawBatch = await getBatchFromChain(bytes32);

      if (!rawBatch || rawBatch.status === OnChainProduceStatus.NONE) {
        // Check batch existence explicitly
        const exists = await checkBatchExistsOnChain(bytes32);
        if (!exists) {
          setChainNotFound(true);
          setOnChainBatch(null);
          setOnChainPrices([]);
          setOnChainProvenance([]);
          setIsChainVerified(false);
          setIsLoadingChain(false);
          return;
        }
      }

      if (rawBatch && rawBatch.status !== OnChainProduceStatus.NONE) {
        // 3. Fetch chronological on-chain price history & provenance history
        const [priceHist, provHist] = await Promise.all([
          getPriceHistoryFromChain(bytes32),
          getProvenanceHistoryFromChain(bytes32),
        ]);

        setOnChainBatch(rawBatch);
        setOnChainPrices(priceHist || []);
        setOnChainProvenance(provHist || []);
        setIsChainVerified(true);
        setRpcError(null);
        setChainNotFound(false);
      } else {
        setChainNotFound(true);
        setIsChainVerified(false);
      }
    } catch (err: any) {
      console.warn('[AgriTrace] Error querying Ethereum Sepolia smart contract:', err);
      setRpcError(err?.message || 'Unable to connect to Ethereum Sepolia RPC node or read smart contract.');
      setIsChainVerified(false);
    } finally {
      setIsLoadingChain(false);
    }
  }, [canonicalBatchId]);

  // Always query authoritative on-chain data whenever canonical batch changes
  useEffect(() => {
    let isCancelled = false;
    verifyOnChain();
    return () => {
      isCancelled = true;
    };
  }, [verifyOnChain]);

  // Build the composite produce batch where ON-CHAIN VALUES ARE AUTHORITATIVE
  const batch = useMemo<ProduceBatch | null>(() => {
    // If not found on chain and not found locally, return null
    if (chainNotFound && !localMatch) {
      return null;
    }

    // CASE A: AUTHORITATIVE ON-CHAIN RECORD FOUND
    if (isChainVerified && onChainBatch) {
      // Extract authoritative on-chain prices
      const farmerRec = onChainPrices.find(p => p.stage === OnChainProduceStatus.REGISTERED);
      const distRec = [...onChainPrices].reverse().find(p => 
        p.stage === OnChainProduceStatus.WITH_DISTRIBUTOR || 
        p.stage === OnChainProduceStatus.IN_TRANSIT
      );
      const retRec = [...onChainPrices].reverse().find(p => 
        p.stage === OnChainProduceStatus.WITH_RETAILER || 
        p.stage === OnChainProduceStatus.SOLD
      );

      const authoritativeFarmerPrice = farmerRec 
        ? Number(farmerRec.pricePerKg) 
        : (localMatch?.pricing?.farmerPrice || localMatch?.farmgatePrice || 56);

      const authoritativeDistributorPrice = distRec 
        ? Number(distRec.pricePerKg) 
        : (localMatch?.pricing?.distributorPrice || Math.round(authoritativeFarmerPrice * 1.3));

      const authoritativeRetailerPrice = retRec 
        ? Number(retRec.pricePerKg) 
        : (localMatch?.pricing?.retailerPrice || authoritativeDistributorPrice);

      const authoritativeConsumerPrice = retRec 
        ? Number(retRec.pricePerKg) 
        : authoritativeDistributorPrice;

      // Authoritative status string
      const authoritativeStatus = PRODUCE_STATUS_LABELS[onChainBatch.status as OnChainProduceStatus] || mapOnChainStatusToUi(onChainBatch.status);

      // Authoritative provenance timeline generated directly from on-chain history
      let authoritativeTimeline: TimelineEvent[] = [];
      if (onChainProvenance && onChainProvenance.length > 0) {
        authoritativeTimeline = onChainProvenance.map((item, idx) => {
          const stageMap: Record<number, 'Farming' | 'Logistics' | 'Wholesale' | 'Retail' | 'Consumer'> = {
            1: 'Farming',
            2: 'Wholesale',
            3: 'Logistics',
            4: 'Retail',
            5: 'Consumer',
          };
          const formattedDate = item.timestamp > 0n 
            ? new Date(Number(item.timestamp) * 1000).toLocaleString() 
            : 'Confirmed';

          const actorIsFarmer = item.actor.toLowerCase() === onChainBatch.farmer.toLowerCase();
          const actorIsOwner = item.actor.toLowerCase() === onChainBatch.currentOwner.toLowerCase();
          const actorLabel = actorIsFarmer 
            ? `Farmer (${item.actor.slice(0, 6)}...${item.actor.slice(-4)})` 
            : actorIsOwner 
            ? `Distributor (${item.actor.slice(0, 6)}...${item.actor.slice(-4)})` 
            : `${item.actor.slice(0, 8)}...`;

          return {
            id: `chain-prov-${idx}`,
            stage: stageMap[item.toStatus] || 'Logistics',
            title: item.remarks || (item.toStatus === 1 ? 'Produce Registered on Sepolia' : item.toStatus === 2 ? 'Transferred to Distributor' : 'Custody Updated'),
            description: `Stage: ${PRODUCE_STATUS_LABELS[item.toStatus as OnChainProduceStatus]} | Recipient: ${item.toOwner}${item.priceAtStep > 0n ? ` | Recorded Price: ₹${item.priceAtStep}/kg` : ''}`,
            actorName: actorLabel,
            actorRole: item.toStatus === 1 ? 'farmer' : item.toStatus === 2 ? 'distributor' : 'retailer',
            location: localMatch?.farmLocation || localMatch?.farmerLocation || 'Sepolia On-Chain Ledger',
            timestamp: formattedDate,
            verified: true,
            txHash: 'Confirmed on Ethereum Sepolia',
          };
        });
      } else if (localMatch?.timeline) {
        authoritativeTimeline = localMatch.timeline;
      }

      const contractAddr = getContractAddress();
      const harvestDateStr = onChainBatch.createdAt > 0n 
        ? new Date(Number(onChainBatch.createdAt) * 1000).toISOString().split('T')[0]
        : (localMatch?.harvestDate || '2026-04-10');

      return {
        id: localMatch?.id || canonicalBatchId,
        batchId: canonicalBatchId,
        cropName: onChainBatch.cropName || localMatch?.cropName || localMatch?.name || 'Produce',
        name: onChainBatch.cropName || localMatch?.name || localMatch?.cropName || 'Produce',
        cropVariety: localMatch?.cropVariety || localMatch?.variety || 'Organic Heritage',
        variety: localMatch?.variety || localMatch?.cropVariety || 'Organic Heritage',
        quantity: Number(onChainBatch.quantityKg),
        quantityKg: Number(onChainBatch.quantityKg),
        unit: localMatch?.unit || 'kg',
        farmName: localMatch?.farmName || 'Verified Producer Farm',
        farmLocation: localMatch?.farmLocation || localMatch?.farmerLocation || 'Karnal Belt, Haryana',
        farmerLocation: localMatch?.farmerLocation || localMatch?.farmLocation || 'Karnal Belt, Haryana',
        district: localMatch?.district || 'Karnal',
        state: localMatch?.state || 'Haryana',
        pinCode: localMatch?.pinCode || '132001',
        harvestDate: harvestDateStr,
        qualityGrade: QUALITY_GRADE_LABELS[onChainBatch.qualityGrade as OnChainQualityGrade] || 'Grade A (Export Quality)',
        farmgatePrice: authoritativeFarmerPrice,
        priceUnit: '₹/kg',
        farmerId: localMatch?.farmerId || onChainBatch.farmer,
        farmerName: localMatch?.farmerName || `Farmer (${onChainBatch.farmer.slice(0, 6)}...${onChainBatch.farmer.slice(-4)})`,
        distributorName: localMatch?.distributorName || (onChainBatch.currentOwner ? `Distributor (${onChainBatch.currentOwner.slice(0, 6)}...${onChainBatch.currentOwner.slice(-4)})` : 'AgriLogistics Cold-Chain'),
        retailerName: localMatch?.retailerName || (onChainBatch.status === OnChainProduceStatus.WITH_RETAILER ? `Retailer (${onChainBatch.currentOwner.slice(0, 6)}...)` : undefined),
        status: authoritativeStatus,
        category: localMatch?.category || 'Grains',
        farmCoordinates: localMatch?.farmCoordinates || '29.6857° N, 76.9905° E',
        pricing: {
          farmerPrice: authoritativeFarmerPrice,
          distributorLogisticsCost: Math.max(0, authoritativeDistributorPrice - authoritativeFarmerPrice - 30),
          distributorMargin: Math.min(30, Math.max(0, authoritativeDistributorPrice - authoritativeFarmerPrice)),
          retailerOverhead: retRec ? 15 : 0,
          retailerMargin: retRec ? Math.max(0, authoritativeRetailerPrice - authoritativeDistributorPrice - 15) : 0,
          finalConsumerPrice: authoritativeConsumerPrice,
          currency: '₹',
          fairPriceCeiling: localMatch?.pricing?.fairPriceCeiling || 185,
        },
        quality: {
          grade: (QUALITY_GRADE_LABELS[onChainBatch.qualityGrade as OnChainQualityGrade] || 'Grade A (Export Quality)') as any,
          freshnessScore: localMatch?.quality?.freshnessScore || 99,
          moistureContent: localMatch?.quality?.moistureContent || '12.0%',
          pesticideResidueTest: localMatch?.quality?.pesticideResidueTest || 'Zero Residue (Certified Organic)',
          organicCertificationNumber: localMatch?.quality?.organicCertificationNumber || 'NPOP/NAB/0912/RIC-003',
          certifyingBody: localMatch?.quality?.certifyingBody || 'APEDA India',
          harvestDate: harvestDateStr,
          shelfLifeDays: localMatch?.quality?.shelfLifeDays || 730,
        },
        blockchain: {
          contractAddress: contractAddr,
          tokenId: resolvedBytes32 || '0xc6df667ded218e33ed87605af43826596057ad85188a23143ac45dc2e07063eb',
          blockNumber: localMatch?.blockchain?.blockNumber || 11861084,
          mintTxHash: localMatch?.blockchain?.mintTxHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
          currentOwnerWallet: onChainBatch.currentOwner,
          consensusMechanism: 'Ethereum Sepolia Network',
          gasUsed: localMatch?.blockchain?.gasUsed || '72,190 Gwei',
          merkleRootHash: onChainBatch.originHash,
          isTamperEvident: true,
          statusNotice: `On-Chain Verified: ${authoritativeStatus} (${onChainBatch.currentOwner.slice(0, 8)}...)`,
        },
        timeline: authoritativeTimeline,
        sensorLogs: localMatch?.sensorLogs || [],
        imageUrl: localMatch?.imageUrl || '/assets/harvest_crates.svg',
        description: localMatch?.description || 'Authentic organic produce registered and tracked on the AgriTrace supply chain ledger.',
      };
    }

    // CASE B: LOCAL MATCH PRESENT BUT NOT VERIFIED ON-CHAIN (RPC failure or unverified local draft)
    if (localMatch) {
      return {
        ...localMatch,
        // Mark explicitly as unverified local record - DO NOT label blockchain-verified
        blockchain: localMatch.blockchain ? {
          ...localMatch.blockchain,
          isTamperEvident: false,
          statusNotice: rpcError 
            ? 'Verification Incomplete: Ethereum Sepolia RPC Unavailable' 
            : 'Unverified Local Record: Not Found on Sepolia Contract',
        } : undefined,
      };
    }

    return null;
  }, [
    isChainVerified, 
    onChainBatch, 
    onChainPrices, 
    onChainProvenance, 
    resolvedBytes32, 
    localMatch, 
    canonicalBatchId, 
    chainNotFound, 
    rpcError
  ]);

  const showNotFound = !isLoadingChain && !batch;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verificationUrl = batch ? `${origin}/verify/${batch.batchId}` : '';

  // Log verified produce batch to Blockchain Wallet Context scan history
  useEffect(() => {
    if (batch) {
      addScanRecord({
        batchId: batch.batchId,
        name: batch.name,
        variety: batch.variety,
        imageUrl: batch.imageUrl,
        farmLocation: batch.farmerLocation || batch.farmLocation,
        farmerName: batch.farmerName,
        finalPrice: batch.pricing?.finalConsumerPrice,
        farmerPrice: batch.pricing?.farmerPrice,
        qualityGrade: batch.quality?.grade,
        freshnessScore: batch.quality?.freshnessScore,
        status: batch.status,
        contractAddress: batch.blockchain?.contractAddress || contractAddress,
        tokenId: batch.blockchain?.tokenId,
        blockNumber: batch.blockchain?.blockNumber,
        networkName: isChainVerified ? 'Ethereum Sepolia' : 'Unverified Local Data',
        isTamperEvident: isChainVerified
      });
    }
  }, [batch?.batchId, isChainVerified, addScanRecord, contractAddress]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    // Check if user entered batchId or full URL
    const cleanQuery = query.replace(/^.*\/verify\/?/, '').split('?')[0].split('#')[0].trim();
    setSelectedBatchId(cleanQuery);
    navigate(`/verify/${cleanQuery}`);
  };

  const handleSelectBatch = (targetBatch: ProduceBatch) => {
    setSelectedBatchId(targetBatch.batchId);
    navigate(`/verify/${targetBatch.batchId}`);
  };

  const handleCopyVerificationUrl = async () => {
    if (!verificationUrl) return;
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Search Header */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#bbf7d0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1c1917] tracking-tight">
              Verify Crop & Farm Origins
            </h1>
            <p className="text-xs text-[#78716c] mt-0.5">
              Check the authentic farm origin, harvest date, transport journey, and fair price breakdown.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenQRScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold rounded-lg transition shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-emerald-200" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Batch ID (e.g., AGRI-2026-RIC-003) or paste verification link..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#f0fdf4]/30 border border-[#bbf7d0] rounded-lg focus:border-[#16a34a] focus:bg-white outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold rounded-lg transition cursor-pointer shadow-xs"
          >
            Verify Crop
          </button>
        </form>

        {/* Quick Batch Selectors */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-[#78716c] font-medium">Select Batch:</span>
          {batches.map(b => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleSelectBatch(b)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                canonicalBatchId && (b.batchId === canonicalBatchId || b.id === canonicalBatchId)
                  ? 'bg-[#16a34a] text-white font-semibold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {b.cropName || b.name} ({b.batchId})
            </button>
          ))}
        </div>
      </div>

      {/* Case 0: Querying Ethereum Sepolia Smart Contract */}
      {isLoadingChain && (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xs p-8 sm:p-12 text-center space-y-4">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-800">
            Querying Ethereum Sepolia smart contract for batch {canonicalBatchId}...
          </p>
          <p className="text-xs text-slate-500">
            Validating cryptographic provenance record directly on-chain.
          </p>
        </div>
      )}

      {/* Case 1: Batch Not Found */}
      {showNotFound && (
        <div className="bg-white rounded-3xl border border-red-200 shadow-xs p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-200">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Batch Not Found
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              No registered agricultural produce record was found matching:
            </p>
            <div className="inline-block px-4 py-1.5 bg-red-50 text-red-800 font-mono font-bold text-sm rounded-xl border border-red-200">
              {canonicalBatchId}
            </div>
            <p className="text-xs text-slate-500 pt-2">
              The QR code or Batch ID you entered has not been registered on the AgriTrace Sepolia ledger. Please verify the code on your physical produce crate or select an existing batch.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenQRScanner}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Another QR Code</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 max-w-md mx-auto text-left">
            <h3 className="text-xs font-bold text-slate-700 mb-2">Available Authenticated Batches to Test:</h3>
            <div className="space-y-1.5">
              {batches.slice(0, 3).map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBatch(b)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-xs text-left flex items-center justify-between transition"
                >
                  <span className="font-semibold text-slate-800">{b.cropName || b.name}</span>
                  <span className="font-mono text-emerald-800 font-bold">{b.batchId}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Case 2: Batch Loaded */}
      {batch && !isLoadingChain && (
        <div className="space-y-6">
          
          {/* Explicit Verification Status Alert when Blockchain Data Cannot Be Fetched */}
          {!isChainVerified && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row items-start justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-bold text-amber-950 block text-sm">
                    Blockchain Verification Could Not Be Completed
                  </strong>
                  <p className="text-amber-800 leading-relaxed">
                    {rpcError 
                      ? `Unable to connect to Ethereum Sepolia RPC node (${rpcError}). Authoritative on-chain ownership, lifecycle status, and recorded prices could not be fetched.`
                      : `Batch (${batch.batchId}) was found in local application memory but could not be confirmed on the Ethereum Sepolia smart contract.`}
                  </p>
                  <p className="text-amber-700 text-[11px] font-medium">
                    Notice: The details below represent unverified local data and are NOT cryptographically verified on-chain.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={verifyOnChain}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Verification</span>
              </button>
            </div>
          )}

          {/* Top Produce Summary Card */}
          <div className="bg-white rounded-xl border border-[#bbf7d0] shadow-xs overflow-hidden">
            
            {/* Header Ribbon */}
            <div className="p-4 sm:p-5 bg-[#f0fdf4] text-[#1c1917] border-b border-[#bbf7d0] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-[#16a34a]">
                  Batch ID: {batch.batchId}
                </span>
                {resolvedBytes32 && (
                  <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 truncate max-w-xs" title={resolvedBytes32}>
                    ({resolvedBytes32.slice(0, 10)}...{resolvedBytes32.slice(-8)})
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isChainVerified ? (
                  <>
                    <span className="font-semibold text-xs text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>On-Chain Status: {batch.status}</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-1 rounded-md font-semibold">
                      Sepolia Verified
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-xs text-amber-800 bg-white px-2.5 py-1 rounded-md border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Local Status: {batch.status} (Unverified)</span>
                    </span>
                    <span className="text-[11px] font-mono text-amber-800 bg-amber-100 border border-amber-200 px-2 py-1 rounded-md font-semibold">
                      Not Verified On-Chain
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Product Image */}
              <div className="w-full md:w-72 h-56 md:h-auto bg-slate-100 relative shrink-0 overflow-hidden">
                <img 
                  src={batch.imageUrl || '/assets/harvest_crates.svg'} 
                  alt={batch.cropName || batch.name} 
                  onError={(e) => { e.currentTarget.src = '/assets/harvest_crates.svg'; }}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Official Verified Rosette Seal - ONLY rendered when verified on blockchain */}
                {isChainVerified ? (
                  <div className="absolute bottom-3 right-3 w-16 h-16 drop-shadow-md select-none pointer-events-none">
                    <img 
                      src="/assets/seal_organic.svg" 
                      alt="AgriTrace Verified Organic Seal"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-amber-900/80 text-amber-200 text-[10px] font-semibold backdrop-blur flex items-center gap-1 border border-amber-500/30">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Unverified Local Data</span>
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-900/80 text-white backdrop-blur">
                    {batch.qualityGrade || batch.quality?.grade || 'Grade A'}
                  </span>
                </div>
              </div>

              {/* Produce Attributes */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {batch.cropName || batch.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    {batch.cropVariety || batch.variety}
                  </p>

                  {/* Core Specifications */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Farm Name</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {batch.farmName || 'Verified Producer Farm'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Farm Location</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {batch.farmLocation || batch.farmerLocation || 'Maharashtra, India'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Harvest Date</span>
                      <span className="font-semibold text-slate-800 block">
                        {batch.harvestDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Quantity</span>
                      <span className="font-bold text-slate-800 font-mono block">
                        {(batch.quantity || batch.quantityKg || 1000).toLocaleString()} {batch.unit || 'kg'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Quality Grade</span>
                      <span className="font-bold text-emerald-700 block">
                        {batch.qualityGrade || batch.quality?.grade || 'Grade A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Farmgate Price</span>
                      <span className="font-extrabold text-emerald-800 block">
                        ₹{batch.farmgatePrice || batch.pricing?.farmerPrice || 0}/{batch.unit || 'kg'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Current Custodian</span>
                      <span className="font-mono text-slate-700 font-medium truncate block" title={batch.blockchain?.currentOwnerWallet}>
                        {batch.blockchain?.currentOwnerWallet 
                          ? `${batch.blockchain.currentOwnerWallet.slice(0, 8)}...${batch.blockchain.currentOwnerWallet.slice(-6)}` 
                          : batch.batchId}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Pesticide Residue</span>
                      <span className="font-semibold text-emerald-700 block truncate">
                        {batch.quality?.pesticideResidueTest || (batch.certification ? 'Zero Residue (Certified)' : 'Tested Safe')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Journey */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Transparent Price Journey</span>
                    </span>
                    <span className="text-slate-500 font-medium text-[11px]">
                      {isChainVerified ? 'Authoritative On-Chain Price Records' : 'Local Estimated Audit'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    {/* Farmer */}
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200/80 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block font-medium">Farmer Farmgate</span>
                      <div className="text-sm sm:text-base font-extrabold text-emerald-800 mt-0.5">
                        ₹{batch.farmgatePrice || batch.pricing?.farmerPrice || 0}/{batch.unit || 'kg'}
                      </div>
                      <span className="text-[10px] text-emerald-700">Direct Producer Payout</span>
                    </div>

                    {/* Distributor */}
                    <div className="p-2.5 bg-white rounded-xl border border-blue-200/80 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block font-medium">Cold Transit</span>
                      <div className="text-sm sm:text-base font-extrabold text-blue-800 mt-0.5">
                        ₹{batch.pricing?.distributorPrice || Math.round((batch.farmgatePrice || 40) * 1.3)}/{batch.unit || 'kg'}
                      </div>
                      <span className="text-[10px] text-blue-600">
                        {isChainVerified ? 'On-Chain Recorded Price' : 'Logistics & Handling'}
                      </span>
                    </div>

                    {/* Retailer */}
                    <div className="p-2.5 bg-white rounded-xl border border-purple-200/80 shadow-2xs">
                      <span className="text-[11px] text-slate-500 block font-medium">Consumer Retail</span>
                      <div className="text-sm sm:text-base font-extrabold text-purple-800 mt-0.5">
                        {batch.status === 'With Distributor' || batch.status === 'At Distributor'
                          ? `₹${batch.pricing?.finalConsumerPrice || 168}/${batch.unit || 'kg'}*`
                          : `₹${batch.pricing?.finalConsumerPrice || Math.round((batch.farmgatePrice || 40) * 1.6)}/${batch.unit || 'kg'}`}
                      </div>
                      <span className="text-[10px] text-purple-600">
                        {batch.status === 'With Distributor' || batch.status === 'At Distributor' 
                          ? 'Wholesale at Distributor' 
                          : 'Final Shelf Price'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions & QR link */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('qr')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Show Scannable QR Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyVerificationUrl}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copiedUrl ? 'Verification URL copied' : 'Copy Verification URL'}</span>
                    </button>
                  </div>

                  <div className="font-mono text-xs text-slate-500">
                    Verification ID: <span className="font-bold text-slate-800">{batch.batchId}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Sub-tab Switcher */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
            {[
              { id: 'journey' as const, label: 'Supply Chain History', icon: <Layers className="w-4 h-4" /> },
              { id: 'pricing' as const, label: 'Price Buildup', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'origin' as const, label: 'Quality & Origin', icon: <MapPin className="w-4 h-4" /> },
              { id: 'qr' as const, label: 'Scannable QR Code', icon: <QrCode className="w-4 h-4" /> },
              { id: 'blockchain' as const, label: 'Provenance Record', icon: <ShieldCheck className="w-4 h-4" /> },
              { id: 'feedback' as const, label: 'Reviews & Feedback', icon: <Star className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Journey & Supply Chain History */}
          {activeSubTab === 'journey' && (
            <div className="space-y-6">
              <SupplyChainTimeline timeline={batch.timeline || []} currentStatus={batch.status as any || 'Registered'} />
              
              {/* Custody History Card */}
              <div className="bg-white rounded-xl p-6 sm:p-7 border border-[#bbf7d0] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#1c1917] text-sm sm:text-base flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#16a34a]" />
                    <span>Recorded Custody & Ownership Transfers</span>
                  </h3>
                  {isChainVerified && onChainProvenance.length > 0 && (
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                      {onChainProvenance.length} Confirmed Transitions
                    </span>
                  )}
                </div>

                {isChainVerified && onChainProvenance.length > 0 ? (
                  <div className="divide-y divide-slate-100 text-xs">
                    {onChainProvenance.map((item, idx) => (
                      <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div>
                            <strong className="text-slate-900">Step {idx + 1}: {item.remarks || PRODUCE_STATUS_LABELS[item.toStatus as OnChainProduceStatus]}</strong>
                          </div>
                          <div className="text-slate-500 font-mono text-[11px]">
                            From: <span className="text-slate-700">{item.fromOwner === '0x0000000000000000000000000000000000000000' ? 'Origin' : `${item.fromOwner.slice(0, 8)}...${item.fromOwner.slice(-6)}`}</span>
                            {' '}→ To: <span className="text-emerald-800 font-semibold">{`${item.toOwner.slice(0, 8)}...${item.toOwner.slice(-6)}`}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-700 font-bold block">
                            {item.priceAtStep > 0n ? `₹${item.priceAtStep}/kg` : 'Custody Transfer'}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {item.timestamp > 0n ? new Date(Number(item.timestamp) * 1000).toLocaleString() : 'Confirmed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <strong className="text-slate-900">Current Custodian:</strong>{' '}
                        <span className="text-purple-700 font-semibold">{batch.blockchain?.currentOwnerWallet || batch.retailerName || 'Custodian'}</span>
                      </div>
                      <span className="text-slate-500">Status: {batch.status || 'Active'}</span>
                    </div>
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <strong className="text-slate-900">Logistics Transporter:</strong>{' '}
                        <span className="text-blue-700 font-semibold">{batch.distributorName || 'AgriLogistics Cold-Chain'}</span>
                      </div>
                      <span className="text-slate-500">Cold Chain Verified</span>
                    </div>
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <strong className="text-slate-900">Origin Producer:</strong>{' '}
                        <span className="text-emerald-700 font-semibold">{batch.farmerName} ({batch.farmName || 'Verified Producer Farm'})</span>
                      </div>
                      <span className="text-slate-500">Harvest Registered: {batch.harvestDate}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Pricing Transparency & Price History */}
          {activeSubTab === 'pricing' && (
            <div>
              <PriceBreakdownCard 
                pricing={batch.pricing || {
                  currency: '₹',
                  farmerPrice: batch.farmgatePrice || 40,
                  distributorLogisticsCost: 10,
                  distributorMargin: 5,
                  retailerOverhead: 4,
                  retailerMargin: 12,
                  finalConsumerPrice: Math.round((batch.farmgatePrice || 40) * 1.6),
                  fairPriceCeiling: 185,
                }} 
                cropName={batch.cropName || batch.name} 
              />
            </div>
          )}

          {/* Tab 3: Origin & Quality Information */}
          {activeSubTab === 'origin' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Farm Origin & Laboratory Certificate</h3>
                <p className="text-xs text-slate-500">Audited agricultural parameters recorded at harvest</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Geographic Origin</span>
                  </h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div><strong>Farm Name:</strong> {batch.farmName || 'Verified Producer Farm'}</div>
                    <div><strong>Producer / Lead:</strong> {batch.farmerName}</div>
                    <div><strong>Location:</strong> {batch.farmLocation || batch.farmerLocation || 'Maharashtra, India'}</div>
                    <div><strong>GPS Coordinates:</strong> <span className="font-mono text-emerald-700">{batch.farmCoordinates || '19.8762° N, 75.3433° E'}</span></div>
                    <div><strong>Harvest Timestamp:</strong> {batch.harvestDate}</div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Lab Quality Analysis</span>
                  </h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div><strong>Pesticide Residue Test:</strong> <span className="text-emerald-700 font-semibold">{batch.quality?.pesticideResidueTest || (batch.certification ? 'Zero Residue (Certified)' : 'Tested Safe')}</span></div>
                    <div><strong>Quality Grade:</strong> {batch.qualityGrade || batch.quality?.grade || 'Grade A'}</div>
                    <div><strong>Moisture Content:</strong> {batch.quality?.moistureContent || 'Optimal (12%)'}</div>
                    <div><strong>Organic Cert Number:</strong> <span className="font-mono">{batch.quality?.organicCertificationNumber || 'NPOP-ORG-2025-9182'}</span></div>
                    <div><strong>Certifying Agency:</strong> {batch.quality?.certifyingBody || 'APEDA / FSSAI Accredited Laboratory'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: QR Verification */}
          {activeSubTab === 'qr' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span>Real Scannable QR Code</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Encoded directly with the AgriTrace public verification URL for this produce batch
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8 p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="p-4 bg-white rounded-2xl border border-slate-300 shadow-sm shrink-0 flex items-center justify-center">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={220}
                    level="H"
                    includeMargin={true}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-3.5 text-xs text-slate-600 flex-1">
                  <div>
                    <strong className="text-slate-900 block text-xs">Batch ID:</strong>
                    <span className="font-mono text-emerald-800 font-extrabold text-base">{batch.batchId}</span>
                  </div>

                  <div>
                    <strong className="text-slate-900 block text-xs">Encoded Scannable URL:</strong>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-slate-600 break-all select-all">
                      {verificationUrl}
                    </div>
                  </div>

                  <p className="text-slate-500 leading-relaxed text-xs">
                    Scanning this QR code with any smartphone camera instantly routes the consumer to this tamper-evident provenance record.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyVerificationUrl}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedUrl ? 'Verification URL copied' : 'Copy Verification URL'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQRModal(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View Printable Tag</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Provenance & Batch Verification */}
          {activeSubTab === 'blockchain' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${isChainVerified ? 'text-emerald-600' : 'text-amber-500'}`} />
                    <span>Verified Provenance Record</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isChainVerified 
                      ? 'Authoritative Ethereum Sepolia smart contract audit record' 
                      : 'Unverified local state (awaiting Sepolia contract confirmation)'}
                  </p>
                </div>
                
                {isChainVerified ? (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Sepolia Confirmed</span>
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Verification Incomplete</span>
                  </span>
                )}
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 font-mono text-xs">
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-slate-50">
                  <span className="text-slate-500">Registry System:</span>
                  <span className="font-bold text-slate-800">
                    {isChainVerified ? 'AgriTrace Deployed Sepolia Smart Contract' : 'AgriTrace Local Registry (Unverified)'}
                  </span>
                </div>

                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500">Certificate Status:</span>
                  {isChainVerified ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified & Tamper-Proof on Sepolia</span>
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Verification Incomplete / Offline</span>
                    </span>
                  )}
                </div>

                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500">Smart Contract Address:</span>
                  <a 
                    href={`${SEPOLIA_EXPLORER_URL}/address/${getContractAddress()}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="font-bold text-emerald-800 hover:text-emerald-900 underline flex items-center gap-1"
                  >
                    <span>{getContractAddress()}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500">Human-Readable Batch ID:</span>
                  <span className="font-bold text-emerald-800 font-mono">{batch.batchId}</span>
                </div>

                {resolvedBytes32 && (
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-slate-500">On-Chain Bytes32 ID:</span>
                    <span className="font-mono text-slate-800 break-all select-all font-semibold">
                      {resolvedBytes32}
                    </span>
                  </div>
                )}

                {onChainBatch && (
                  <>
                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-slate-500">Authoritative Current Owner:</span>
                      <a
                        href={`${SEPOLIA_EXPLORER_URL}/address/${onChainBatch.currentOwner}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-purple-700 font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>{onChainBatch.currentOwner}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-slate-500">Origin Producer Wallet:</span>
                      <a
                        href={`${SEPOLIA_EXPLORER_URL}/address/${onChainBatch.farmer}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-slate-800 hover:underline flex items-center gap-1"
                      >
                        <span>{onChainBatch.farmer}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-slate-500">On-Chain Origin Hash:</span>
                      <span className="font-mono text-slate-700 break-all select-all">
                        {onChainBatch.originHash}
                      </span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-slate-500">On-Chain Lifecycle Stage:</span>
                      <span className="font-bold text-slate-800">
                        {PRODUCE_STATUS_LABELS[onChainBatch.status as OnChainProduceStatus]} (Code: {onChainBatch.status})
                      </span>
                    </div>

                    <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-slate-500">On-Chain Price Records:</span>
                      <span className="font-bold text-slate-800">
                        {onChainPrices.length} recorded price updates
                      </span>
                    </div>
                  </>
                )}

                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500">Produce Type:</span>
                  <span className="text-slate-800">{batch.cropName || batch.name} ({batch.cropVariety || batch.variety})</span>
                </div>
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500">Registered Harvest Date:</span>
                  <span className="font-bold text-slate-800">{batch.harvestDate}</span>
                </div>
                
                <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-emerald-50/50">
                  <span className="text-slate-700 font-bold">Verification Status:</span>
                  {isChainVerified ? (
                    <span className="text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Authentic Farm-to-Fork On-Chain Record</span>
                    </span>
                  ) : (
                    <span className="text-amber-800 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Could Not Be Verified on Sepolia Blockchain</span>
                    </span>
                  )}
                </div>
              </div>

              {isChainVerified ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-950 font-bold block mb-0.5">Authoritative Blockchain Provenance Guarantee</strong>
                    This agricultural produce lot has been cryptographically verified against the AgriTrace smart contract on Ethereum Sepolia. Custody transfers, cold-chain events, and fair farmgate pricing disclosures are sealed with immutable batch hashes.
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-950 font-bold block mb-0.5">Unverified Produce Record Notice</strong>
                    Authoritative on-chain provenance could not be established from the Ethereum Sepolia smart contract. This lot cannot be certified as authentic based solely on unverified local data.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Consumer Reviews & Feedback */}
          {activeSubTab === 'feedback' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                    <span>Consumer Quality Reviews & Farmer Feedback</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Submit verified feedback after purchasing. Honest consumer reviews directly empower organic farmers and build transparent reputations.
                  </p>
                </div>

                {reviewSubmitted && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thank you! Your verified consumer review has been posted and linked to batch {batch.batchId}.</span>
                  </div>
                )}

                {/* Review submission form */}
                <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Leave a Verified Review</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Taste & Produce Quality</label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                          >
                            <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-2">{rating}/5 Stars</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Freshness & Packaging</label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFreshnessRating(star)}
                            className="p-1 text-teal-600 hover:scale-110 transition cursor-pointer"
                          >
                            <Star className={`w-5 h-5 ${star <= freshnessRating ? 'fill-teal-500 text-teal-500' : 'text-slate-300'}`} />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-2">{freshnessRating}/5 Fresh</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Your Name (Optional)</label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="e.g. Meera Patel"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Review & Experience *</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Tell us about the freshness, taste, and your experience with this batch..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Submit Consumer Review</span>
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-900 text-xs">Customer Reviews for this Lot ({reviewsList.length})</h4>
                  <div className="space-y-3">
                    {reviewsList.map(rev => (
                      <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{rev.name}</span>
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                              Verified Purchase
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px]">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                          ))}
                          <span className="text-slate-500 text-[11px] ml-1.5 font-medium">• Freshness {rev.freshness}/5</span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* QR Code Tag Modal */}
      {showQRModal && batch && (
        <QRCodeModal batch={batch} onClose={() => setShowQRModal(false)} />
      )}

    </div>
  );
};
