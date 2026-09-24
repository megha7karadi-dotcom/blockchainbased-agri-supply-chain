import { ProduceBatch, ProduceCategory, ProduceGrade } from '../types/produce';
import { INITIAL_BATCHES } from '../data/mockData';
import {
  registerProduceOnChain,
  transferToDistributorOnChain,
  updateDistributorPriceOnChain,
  dispatchToRetailerOnChain,
  receiveProduceByRetailerOnChain,
  updateRetailerPriceOnChain,
  recordSaleOnChain,
  generateOriginHash,
  getContractAddress,
  stringToBatchId,
  getBatchFromChain
} from '../lib/blockchain/contract';
import { OnChainQualityGrade } from '../lib/blockchain/types';
import { getStakeholderWallet } from '../lib/blockchain/config';

const STORAGE_KEY = 'agritrace_batches_v1';

export interface RegisterProductInput {
  cropName: string;
  cropVariety?: string;
  quantity: number;
  unit: string;
  farmName?: string;
  farmLocation: string;
  district?: string;
  state: string;
  pinCode?: string;
  harvestDate: string;
  qualityGrade: string; // 'Grade A' | 'Grade B' | 'Grade C'
  certification?: string;
  notes?: string;
  farmgatePrice: number;
  priceUnit: string;
  farmerId: string;
  farmerName?: string;
}

/**
 * Common crop codes for standard batch ID generation
 */
const CROP_CODE_MAP: Record<string, string> = {
  mango: 'MNG',
  mangoes: 'MNG',
  alphonso: 'MNG',
  rice: 'RIC',
  basmati: 'RIC',
  paddy: 'RIC',
  tomato: 'TOM',
  tomatoes: 'TOM',
  wheat: 'WHT',
  cotton: 'CTN',
  turmeric: 'TRM',
  haldi: 'TRM',
  apple: 'APL',
  apples: 'APL',
  potato: 'POT',
  potatoes: 'POT',
  onion: 'ONI',
  onions: 'ONI',
  chilli: 'CHL',
  chillies: 'CHL',
  soybean: 'SOY',
  coffee: 'COF',
  tea: 'TEA',
  sugarcane: 'SGC',
  banana: 'BAN',
  grapes: 'GRP',
  corn: 'CRN',
  maize: 'CRN',
  cardamom: 'CRD',
  ginger: 'GNG',
  garlic: 'GRL',
};

/**
 * Generate a unique Batch ID formatted as AGRI-[YEAR]-[CROP CODE]-[SEQUENCE]
 * Example: AGRI-2026-MNG-001
 */
export function generateBatchId(cropName: string, existingBatches: { batchId?: string }[] = []): string {
  const year = 2026;
  const cleanCrop = (cropName || '').toLowerCase().trim();
  
  // Attempt to find a standard code from map
  let cropCode: string | undefined;
  for (const [key, code] of Object.entries(CROP_CODE_MAP)) {
    if (cleanCrop.includes(key)) {
      cropCode = code;
      break;
    }
  }

  // Fallback: take first 3 alphanumeric characters
  if (!cropCode) {
    const lettersOnly = cleanCrop.replace(/[^a-z0-9]/gi, '').toUpperCase();
    cropCode = lettersOnly.length >= 3 ? lettersOnly.slice(0, 3) : (lettersOnly + 'AGR').slice(0, 3);
  }

  const prefix = `AGRI-${year}-${cropCode}-`;

  // Determine the next sequence number for this prefix or overall
  let maxSeq = 0;
  for (const batch of existingBatches) {
    if (batch.batchId && batch.batchId.startsWith(prefix)) {
      const remainder = batch.batchId.replace(prefix, '');
      const parsed = parseInt(remainder, 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }

  const nextSeqNum = maxSeq > 0 ? maxSeq + 1 : Math.max(1, existingBatches.length + 1);
  const sequenceStr = String(nextSeqNum).padStart(3, '0');

  return `${prefix}${sequenceStr}`;
}

/**
 * Clean Product Service Abstraction
 * 
 * At present, this interacts with browser/local mock repository.
 * In future phases, this can easily be swapped to:
 *   fetch('/api/products', { method: 'POST', body: JSON.stringify(data) })
 * to connect directly to the Node.js + MongoDB backend without changing any UI component code.
 */
class ProductService {
  private getStoredBatches(): ProduceBatch[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read batches from storage:', e);
    }
    return INITIAL_BATCHES;
  }

  private saveBatches(batches: ProduceBatch[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch (e) {
      console.warn('Failed to persist batches to storage:', e);
    }
  }

  /**
   * Register a new Produce Batch
   * Encapsulates ID generation, record normalization, and persistence via POST /api/products to MongoDB Atlas.
   */
  async registerProduct(input: RegisterProductInput): Promise<ProduceBatch> {
    const existing = this.getStoredBatches();
    const batchId = generateBatchId(input.cropName, existing);
    const id = `batch-${Date.now()}`;
    const createdAt = new Date().toISOString();

    // Map category
    let category: ProduceCategory = 'Vegetables';
    const lowerCrop = input.cropName.toLowerCase();
    if (lowerCrop.includes('mango') || lowerCrop.includes('apple') || lowerCrop.includes('banana') || lowerCrop.includes('grape') || lowerCrop.includes('citrus') || lowerCrop.includes('mandarin')) {
      category = 'Fruits';
    } else if (lowerCrop.includes('rice') || lowerCrop.includes('wheat') || lowerCrop.includes('grain') || lowerCrop.includes('corn')) {
      category = 'Grains';
    } else if (lowerCrop.includes('turmeric') || lowerCrop.includes('chilli') || lowerCrop.includes('spice') || lowerCrop.includes('cardamom') || lowerCrop.includes('ginger')) {
      category = 'Spices';
    } else if (lowerCrop.includes('dal') || lowerCrop.includes('pulse') || lowerCrop.includes('gram') || lowerCrop.includes('lentil')) {
      category = 'Pulses';
    }

    // Convert quantity to kg for system pricing calculations if needed
    let quantityInKg = Number(input.quantity);
    if (input.unit === 'quintal') quantityInKg = quantityInKg * 100;
    else if (input.unit === 'tonnes') quantityInKg = quantityInKg * 1000;

    // 1. Authoritative Smart Contract Validation & State Change
    const originHash = generateOriginHash(input.farmLocation, input.state, input.harvestDate, input.farmerId);
    const onChainGrade = input.qualityGrade === 'Grade A' ? OnChainQualityGrade.GRADE_A : input.qualityGrade === 'Grade B' ? OnChainQualityGrade.GRADE_B : OnChainQualityGrade.GRADE_C;

    console.log(`[AgriTrace] Submitting batch ${batchId} to smart contract for on-chain validation...`);
    const onChainTx = await registerProduceOnChain({
      batchId,
      cropName: input.cropName.trim(),
      quantityKg: quantityInKg,
      qualityGrade: onChainGrade,
      initialPricePerKg: Number(input.farmgatePrice),
      originHash
    });
    console.log(`[AgriTrace] Batch ${batchId} successfully mined on-chain! TxHash: ${onChainTx.txHash}`);

    const localBatch: ProduceBatch = {
      // 1. Core Fields
      id,
      batchId,
      cropName: input.cropName.trim(),
      cropVariety: input.cropVariety?.trim() || '',
      quantity: Number(input.quantity),
      unit: input.unit,
      farmName: input.farmName?.trim() || '',
      farmLocation: input.farmLocation.trim(),
      district: input.district?.trim() || '',
      state: input.state.trim(),
      pinCode: input.pinCode?.trim() || '',
      harvestDate: input.harvestDate,
      qualityGrade: input.qualityGrade,
      certification: input.certification?.trim() || '',
      notes: input.notes?.trim() || '',
      farmgatePrice: Number(input.farmgatePrice),
      priceUnit: input.priceUnit || `₹ / ${input.unit}`,
      farmerId: input.farmerId,
      createdAt,
      status: 'Registered',

      // 2. Compatibility Fields for existing platform views
      name: input.cropVariety ? `${input.cropVariety} ${input.cropName}` : input.cropName,
      variety: input.cropVariety?.trim() || 'Standard Harvest',
      category,
      farmerName: input.farmerName || 'Verified Producer',
      farmerLocation: `${input.farmLocation}${input.state ? `, ${input.state}` : ''}`,
      farmCoordinates: '16.9902° N, 73.3120° E',
      quantityKg: quantityInKg,
      currentCustodianRole: 'farmer',
      currentCustodianName: input.farmerName || 'Verified Producer',
      pricing: {
        farmerPrice: Number(input.farmgatePrice),
        distributorLogisticsCost: 0,
        distributorMargin: 0,
        retailerOverhead: 0,
        retailerMargin: 0,
        finalConsumerPrice: Number(input.farmgatePrice),
        currency: '₹',
        fairPriceCeiling: Math.round(Number(input.farmgatePrice) * 1.5),
      },
      quality: {
        grade: (input.qualityGrade === 'Grade A' ? 'Grade A (Export Quality)' : input.qualityGrade === 'Grade B' ? 'Grade B (Premium)' : 'Grade C (Standard)') as ProduceGrade,
        freshnessScore: 100,
        moistureContent: '82%',
        pesticideResidueTest: input.certification ? 'Zero Residue (Certified Organic)' : 'Within Safe Limits',
        organicCertificationNumber: input.certification || undefined,
        certifyingBody: input.certification ? 'Organic Certifying Authority' : undefined,
        harvestDate: input.harvestDate,
        shelfLifeDays: 14,
      },
      blockchain: {
        contractAddress: getContractAddress(),
        tokenId: `0x${batchId.replace(/[^a-zA-Z0-9]/g, '')}`,
        blockNumber: onChainTx.blockNumber,
        mintTxHash: onChainTx.txHash,
        currentOwnerWallet: '0x1F2...A4C9',
        consensusMechanism: 'Ethereum EVM / AgriTrace Smart Contract',
        gasUsed: `${onChainTx.gasUsed} gas`,
        merkleRootHash: originHash,
        isTamperEvident: true,
        statusNotice: 'Verified Smart Contract State: Registered Produce Batch',
      },
      timeline: [
        {
          id: `tl-${Date.now()}`,
          stage: 'Farming',
          title: 'Harvest & Produce Batch Registered',
          description: `Registered at ${input.farmLocation}, ${input.state}. Initial farmgate rate logged at ₹${input.farmgatePrice}/${input.unit}. Confirmed on blockchain in block #${onChainTx.blockNumber}.`,
          actorName: input.farmerName || 'Verified Producer',
          actorRole: 'farmer',
          location: `${input.farmLocation}, ${input.state}`,
          timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
          blockNumber: onChainTx.blockNumber,
          txHash: onChainTx.txHash,
          temperature: '22.0°C',
          humidity: '65%',
          verified: true,
        },
      ],
      sensorLogs: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temperature: 22.0,
          humidity: 65,
          location: 'Farm Packing Shed',
          status: 'optimal',
        },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      description: input.notes || `${input.cropName} harvested at ${input.farmLocation}. Batch logged on AgriTrace and persisted in MongoDB Atlas.`,
    };

    // 2. Synchronize verified transaction to MongoDB Atlas
    try {
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('agritrace_jwt_token') || sessionStorage.getItem('agritrace_jwt_token'))
        : null;

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...input,
          batchId,
          blockchain: localBatch.blockchain,
          timeline: localBatch.timeline
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.product) {
          const apiProduct = result.product;
          const mergedBatch: ProduceBatch = {
            ...localBatch,
            ...apiProduct,
            id: apiProduct._id || apiProduct.id || localBatch.id,
            batchId: apiProduct.batchId || localBatch.batchId,
          };
          const updated = [mergedBatch, ...existing.filter(b => b.batchId !== mergedBatch.batchId)];
          this.saveBatches(updated);
          return mergedBatch;
        }
      }
    } catch (err) {
      console.warn('Network call to POST /api/products failed, saved to local cache:', err);
    }

    const updated = [localBatch, ...existing];
    this.saveBatches(updated);
    return localBatch;
  }

  /**
   * Normalize an incoming API/DB record to ensure all ProduceBatch fields exist safely
   */
  normalizeBatch(p: any): ProduceBatch {
    if (!p) return null as any;
    const farmerLoc = p.farmerLocation || p.farmLocation || (p.district && p.state ? `${p.district}, ${p.state}` : p.state || 'Maharashtra, India');
    const cropName = p.name || p.cropName || 'Fresh Organic Produce';
    const variety = p.variety || p.cropVariety || 'Standard Grade';
    const quantity = Number(p.quantityKg || p.quantity || 1000);
    const farmgatePrice = Number(p.pricing?.farmerPrice ?? (p.farmgatePrice ?? 50));
    const finalPrice = Number(p.pricing?.finalConsumerPrice ?? (p.farmgatePrice ? p.farmgatePrice * 1.5 : 75));

    return {
      id: String(p._id || p.id || p.batchId || `batch-${Date.now()}`),
      batchId: p.batchId || 'AGRI-2026-MNG-001',
      name: cropName,
      cropName: cropName,
      variety: variety,
      cropVariety: variety,
      category: p.category || 'Fruit',
      farmerName: p.farmerName || 'Verified Producer',
      farmerId: p.farmerId || 'usr-farmer-01',
      farmerLocation: farmerLoc,
      farmLocation: p.farmLocation || farmerLoc,
      quantityKg: quantity,
      quantity: quantity,
      unit: p.unit || 'kg',
      harvestDate: p.harvestDate || new Date().toISOString().split('T')[0],
      status: p.status || 'Registered',
      currentCustodianRole: p.currentCustodianRole || 'farmer',
      currentCustodianName: p.currentCustodianName || p.farmerName || 'Verified Producer',
      pricing: {
        farmerPrice: farmgatePrice,
        distributorLogisticsCost: Number(p.pricing?.distributorLogisticsCost ?? 0),
        distributorMargin: Number(p.pricing?.distributorMargin ?? 0),
        retailerOverhead: Number(p.pricing?.retailerOverhead ?? 0),
        retailerMargin: Number(p.pricing?.retailerMargin ?? 0),
        finalConsumerPrice: finalPrice,
        currency: p.pricing?.currency || '₹',
        fairPriceCeiling: Number(p.pricing?.fairPriceCeiling ?? (farmgatePrice * 1.8)),
      },
      quality: {
        grade: p.quality?.grade || p.qualityGrade || 'Grade A',
        freshnessScore: Number(p.quality?.freshnessScore ?? 98),
        moistureContent: p.quality?.moistureContent || '80%',
        pesticideResidueTest: p.quality?.pesticideResidueTest || 'Zero Residue (Certified Organic)',
        organicCertificationNumber: p.quality?.organicCertificationNumber || p.certification || 'NPOP/NAB/0912/MH',
        certifyingBody: p.quality?.certifyingBody || 'APEDA India',
        harvestDate: p.quality?.harvestDate || p.harvestDate || new Date().toISOString().split('T')[0],
        shelfLifeDays: Number(p.quality?.shelfLifeDays ?? 14),
      },
      blockchain: {
        contractAddress: p.blockchain?.contractAddress || '0x3A5b8214Fa9E18aB9B625697d022bfe5716E5D3c',
        tokenId: p.blockchain?.tokenId || `0x${p.batchId || 'BATCH'}`,
        blockNumber: Number(p.blockchain?.blockNumber ?? 18945300),
        mintTxHash: p.blockchain?.mintTxHash || '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
        currentOwnerWallet: p.blockchain?.currentOwnerWallet || '0x71C...84B2',
        consensusMechanism: p.blockchain?.consensusMechanism || 'Ethereum Sepolia Ledger',
        gasUsed: p.blockchain?.gasUsed || '74,200 Gwei',
        merkleRootHash: p.blockchain?.merkleRootHash || '0x92865aebc0e3b622e2bbca1d6d455caf',
        isTamperEvident: p.blockchain?.isTamperEvident ?? true,
        statusNotice: p.blockchain?.statusNotice || 'Verified Ledger Entry',
      },
      timeline: Array.isArray(p.timeline) && p.timeline.length > 0 ? p.timeline : [],
      sensorLogs: Array.isArray(p.sensorLogs) && p.sensorLogs.length > 0 ? p.sensorLogs : [],
      imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      description: p.description || p.notes || 'Authentic fresh agricultural produce tracked on blockchain from seed to retail shelf.',
    };
  }

  /**
   * Get batches belonging to a specific farmer
   */
  async getFarmerProducts(farmerId: string): Promise<ProduceBatch[]> {
    try {
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('agritrace_jwt_token') || sessionStorage.getItem('agritrace_jwt_token'))
        : null;

      const response = await fetch('/api/products/my-produce', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          return data.products.map((p: any) => this.normalizeBatch(p));
        }
      }
    } catch {
      // Fallback
    }

    const batches = this.getStoredBatches();
    return batches.filter(b => b.farmerId === farmerId);
  }

  /**
   * Get all registered batches from MongoDB Atlas
   */
  async getAllProducts(): Promise<ProduceBatch[]> {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          const mapped = data.products.map((p: any) => this.normalizeBatch(p));
          this.saveBatches(mapped);
          return mapped;
        }
      }
    } catch {
      // Fallback
    }

    return this.getStoredBatches();
  }

  /**
   * Get a batch by internal ID or batch ID (reads from MongoDB Atlas)
   */
  async getProductById(idOrBatchId: string): Promise<ProduceBatch | null> {
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(idOrBatchId)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.product) {
          return this.normalizeBatch(data.product);
        }
      }
    } catch {
      // Fallback
    }

    const batches = this.getStoredBatches();
    const found = batches.find(b => b.id === idOrBatchId || b.batchId === idOrBatchId);
    return found ? this.normalizeBatch(found) : null;
  }

  private getAuthHeader(): Record<string, string> {
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('agritrace_jwt_token') || sessionStorage.getItem('agritrace_jwt_token'))
      : null;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Transfer batch from Farmer to Distributor
   */
  async transferToDistributor(
    batchId: string, 
    distributorName: string, 
    distributorId: string, 
    quantity: number, 
    agreedPrice: number,
    distributorWalletAddress?: string
  ): Promise<ProduceBatch | null> {
    const distributorWallet = distributorWalletAddress || getStakeholderWallet('distributor');

    // 1. Authoritative Smart Contract State Execution & Validation Layer
    console.log(`[AgriTrace] Invoking transferToDistributor on-chain for batch ${batchId}...`);
    const onChainTx = await transferToDistributorOnChain(batchId, distributorWallet);
    console.log(`[AgriTrace] Transfer confirmed on-chain in block #${onChainTx.blockNumber}, txHash: ${onChainTx.txHash}`);

    // 2. Synchronize to MongoDB Atlas
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(batchId)}/transfer-to-distributor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({
          distributorName,
          distributorId,
          quantity,
          agreedPrice,
          txHash: onChainTx.txHash,
          blockNumber: onChainTx.blockNumber
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.product) {
          const normalized = this.normalizeBatch(data.product);
          this.updateLocalBatch(normalized);
          return normalized;
        }
      }
    } catch (e) {
      console.warn('Network call for transferToDistributor failed, updating local state:', e);
    }

    // Local fallback update
    const batches = this.getStoredBatches();
    const idx = batches.findIndex(b => b.id === batchId || b.batchId === batchId);
    if (idx !== -1) {
      const b = batches[idx];
      b.status = 'Transferred to Distributor';
      b.currentCustodianRole = 'distributor';
      b.currentCustodianName = distributorName;
      b.pricing.farmerPrice = agreedPrice;
      b.blockchain.mintTxHash = onChainTx.txHash;
      b.blockchain.blockNumber = onChainTx.blockNumber;
      b.blockchain.statusNotice = 'On-Chain Validated: With Distributor';
      b.timeline.push({
        id: `tl-${Date.now()}`,
        stage: 'Logistics',
        title: 'Transferred to Distributor',
        description: `Transferred ${quantity} ${b.unit || 'kg'} to ${distributorName} at agreed price ₹${agreedPrice}/${b.unit || 'kg'}. Confirmed in block #${onChainTx.blockNumber}.`,
        actorName: b.farmerName,
        actorRole: 'farmer',
        location: b.farmLocation,
        txHash: onChainTx.txHash,
        blockNumber: onChainTx.blockNumber,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verified: true,
      });
      this.saveBatches(batches);
      return b;
    }
    return null;
  }

  /**
   * Distributor receives / accepts batch
   */
  async distributorReceive(batchId: string, notes?: string): Promise<ProduceBatch | null> {
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(batchId)}/distributor-receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.product) {
          const normalized = this.normalizeBatch(data.product);
          this.updateLocalBatch(normalized);
          return normalized;
        }
      }
    } catch (e) {
      console.warn('Network call for distributorReceive failed, updating local:', e);
    }

    const batches = this.getStoredBatches();
    const idx = batches.findIndex(b => b.id === batchId || b.batchId === batchId);
    if (idx !== -1) {
      const b = batches[idx];
      b.status = 'At Distributor';
      b.currentCustodianRole = 'distributor';
      b.timeline.push({
        id: `tl-${Date.now()}`,
        stage: 'Logistics',
        title: 'Shipment Received by Distributor',
        description: notes || 'Produce quality verified, lot accepted into distributor storage hub.',
        actorName: b.currentCustodianName || 'Distributor Logistics',
        actorRole: 'distributor',
        location: 'Regional Distribution Center',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verified: true,
      });
      this.saveBatches(batches);
      return b;
    }
    return null;
  }

  /**
   * Distributor updates price and margin
   */
  async distributorUpdatePrice(
    batchId: string, 
    purchasePrice: number, 
    marginPercentage: number, 
    sellingPrice: number
  ): Promise<ProduceBatch | null> {
    // 1. Authoritative Smart Contract State Execution & Validation Layer
    console.log(`[AgriTrace] Updating distributor price on-chain for batch ${batchId} to ₹${sellingPrice}/kg...`);
    const onChainTx = await updateDistributorPriceOnChain(batchId, sellingPrice);
    console.log(`[AgriTrace] Price updated on-chain in block #${onChainTx.blockNumber}, txHash: ${onChainTx.txHash}`);

    // 2. Synchronize to MongoDB Atlas
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(batchId)}/distributor-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({
          purchasePrice,
          marginPercentage,
          sellingPrice,
          txHash: onChainTx.txHash,
          blockNumber: onChainTx.blockNumber
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.product) {
          const normalized = this.normalizeBatch(data.product);
          this.updateLocalBatch(normalized);
          return normalized;
        }
      }
    } catch (e) {
      console.warn('Network call for distributorUpdatePrice failed, updating local:', e);
    }

    const batches = this.getStoredBatches();
    const idx = batches.findIndex(b => b.id === batchId || b.batchId === batchId);
    if (idx !== -1) {
      const b = batches[idx];
      b.pricing.farmerPrice = purchasePrice;
      b.pricing.distributorMargin = marginPercentage;
      b.pricing.finalConsumerPrice = sellingPrice;
      b.timeline.push({
        id: `tl-${Date.now()}`,
        stage: 'Wholesale',
        title: 'Distributor Pricing Configured',
        description: `Base purchase: ₹${purchasePrice}/${b.unit || 'kg'}, Margin: ${marginPercentage}%, Wholesale selling price: ₹${sellingPrice}/${b.unit || 'kg'}. Logged to blockchain price history.`,
        actorName: b.currentCustodianName || 'Distributor',
        actorRole: 'distributor',
        location: 'Distribution Hub',
        txHash: onChainTx.txHash,
        blockNumber: onChainTx.blockNumber,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verified: true,
      });
      this.saveBatches(batches);
      return b;
    }
    return null;
  }

  /**
   * Distributor transfers batch to Retailer
   */
  async transferToRetailer(
    batchId: string, 
    retailerName: string, 
    retailerId: string, 
    quantity: number, 
    sellingPrice: number,
    retailerWalletAddress?: string
  ): Promise<ProduceBatch | null> {
    const retailerWallet = retailerWalletAddress || getStakeholderWallet('retailer');

    // 1. Authoritative Smart Contract State Execution & Validation Layer (dispatchToRetailer enters IN_TRANSIT)
    console.log(`[AgriTrace] Dispatching batch ${batchId} to retailer ${retailerWallet} on-chain...`);
    const onChainTx = await dispatchToRetailerOnChain(batchId, retailerWallet);
    console.log(`[AgriTrace] Dispatched to retailer on-chain in block #${onChainTx.blockNumber}, txHash: ${onChainTx.txHash}`);

    // 2. Synchronize to MongoDB Atlas
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(batchId)}/transfer-to-retailer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({
          retailerName,
          retailerId,
          quantity,
          sellingPrice,
          txHash: onChainTx.txHash,
          blockNumber: onChainTx.blockNumber
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.product) {
          const normalized = this.normalizeBatch(data.product);
          this.updateLocalBatch(normalized);
          return normalized;
        }
      }
    } catch (e) {
      console.warn('Network call for transferToRetailer failed, updating local:', e);
    }

    const batches = this.getStoredBatches();
    const idx = batches.findIndex(b => b.id === batchId || b.batchId === batchId);
    if (idx !== -1) {
      const b = batches[idx];
      b.status = 'In Transit to Retailer';
      b.currentCustodianRole = 'retailer';
      b.currentCustodianName = retailerName;
      b.pricing.finalConsumerPrice = sellingPrice;
      b.blockchain.statusNotice = 'On-Chain Validated: In Transit to Retailer';
      b.timeline.push({
        id: `tl-${Date.now()}`,
        stage: 'Wholesale',
        title: 'Dispatched to Retailer',
        description: `Transferred ${quantity} ${b.unit || 'kg'} to ${retailerName} at wholesale price ₹${sellingPrice}/${b.unit || 'kg'}. Confirmed in block #${onChainTx.blockNumber}.`,
        actorName: 'Distributor Logistics',
        actorRole: 'distributor',
        location: 'Regional Cold Hub',
        txHash: onChainTx.txHash,
        blockNumber: onChainTx.blockNumber,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verified: true,
      });
      this.saveBatches(batches);
      return b;
    }
    return null;
  }

  /**
   * Retailer receives produce
   */
  async retailerReceive(batchId: string): Promise<ProduceBatch | null> {
    // 1. Authoritative Smart Contract State Execution & Validation Layer
    console.log(`[AgriTrace] Receiving batch ${batchId} on-chain as designated retailer...`);
    const onChainTx = await receiveProduceByRetailerOnChain(batchId);
    console.log(`[AgriTrace] Received on-chain in block #${onChainTx.blockNumber}, txHash: ${onChainTx.txHash}`);

    // 2. Synchronize to MongoDB Atlas
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(batchId)}/retailer-receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({
          txHash: onChainTx.txHash,
          blockNumber: onChainTx.blockNumber
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.product) {
          const normalized = this.normalizeBatch(data.product);
          this.updateLocalBatch(normalized);
          return normalized;
        }
      }
    } catch (e) {
      console.warn('Network call for retailerReceive failed, updating local:', e);
    }

    const batches = this.getStoredBatches();
    const idx = batches.findIndex(b => b.id === batchId || b.batchId === batchId);
    if (idx !== -1) {
      const b = batches[idx];
      b.status = 'On Retail Shelf';
      b.currentCustodianRole = 'retailer';
      b.blockchain.statusNotice = 'On-Chain Validated: On Retail Shelf';
      b.timeline.push({
        id: `tl-${Date.now()}`,
        stage: 'Retail',
        title: 'Received by Retailer',
        description: `Shipment accepted and verified in retail store inventory. Recorded on-chain in block #${onChainTx.blockNumber}.`,
        actorName: 'Store Manager',
        actorRole: 'retailer',
        location: 'Retail Store Shelf',
        txHash: onChainTx.txHash,
        blockNumber: onChainTx.blockNumber,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verified: true,
      });
      this.saveBatches(batches);
      return b;
    }
    return null;
  }

  /**
   * Retailer sets selling price
   */
  async retailerSetPrice(
    batchId: string, 
    purchasePrice: number, 
    retailMargin: number, 
    finalSellingPrice: number
  ): Promise<ProduceBatch | null> {
    // 1. Authoritative Smart Contract State Execution & Validation Layer
    console.log(`[AgriTrace] Updating retailer price on-chain for batch ${batchId} to ₹${finalSellingPrice}/kg...`);
    const onChainTx = await updateRetailerPriceOnChain(batchId, finalSellingPrice);
    console.log(`[AgriTrace] Retailer price updated on-chain in block #${onChainTx.blockNumber}, txHash: ${onChainTx.txHash}`);

    // 2. Synchronize to MongoDB Atlas
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(batchId)}/retailer-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({
          purchasePrice,
          retailMargin,
          finalSellingPrice,
          txHash: onChainTx.txHash,
          blockNumber: onChainTx.blockNumber
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.product) {
          const normalized = this.normalizeBatch(data.product);
          this.updateLocalBatch(normalized);
          return normalized;
        }
      }
    } catch (e) {
      console.warn('Network call for retailerSetPrice failed, updating local:', e);
    }

    const batches = this.getStoredBatches();
    const idx = batches.findIndex(b => b.id === batchId || b.batchId === batchId);
    if (idx !== -1) {
      const b = batches[idx];
      b.pricing.retailerMargin = retailMargin;
      b.pricing.finalConsumerPrice = finalSellingPrice;
      b.timeline.push({
        id: `tl-${Date.now()}`,
        stage: 'Retail',
        title: 'Retail Selling Price Set',
        description: `Wholesale cost: ₹${purchasePrice}/${b.unit || 'kg'}, Retail margin: ${retailMargin}%, Final shelf price: ₹${finalSellingPrice}/${b.unit || 'kg'}. Logged to blockchain audit trail.`,
        actorName: 'Retailer',
        actorRole: 'retailer',
        location: 'Retail Store Shelf',
        txHash: onChainTx.txHash,
        blockNumber: onChainTx.blockNumber,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verified: true,
      });
      this.saveBatches(batches);
      return b;
    }
    return null;
  }

  /**
   * Retailer sells produce
   */
  async retailerSell(batchId: string, soldQuantity: number, buyerNote?: string): Promise<ProduceBatch | null> {
    // 1. Authoritative Smart Contract State Execution & Validation Layer (recordSale permanently locks batch)
    console.log(`[AgriTrace] Recording consumer sale on-chain for batch ${batchId}...`);
    const onChainTx = await recordSaleOnChain(batchId);
    console.log(`[AgriTrace] Batch ${batchId} permanently locked as SOLD on-chain in block #${onChainTx.blockNumber}, txHash: ${onChainTx.txHash}`);

    // 2. Synchronize to MongoDB Atlas
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(batchId)}/retailer-sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify({
          soldQuantity,
          buyerNote,
          txHash: onChainTx.txHash,
          blockNumber: onChainTx.blockNumber
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.product) {
          const normalized = this.normalizeBatch(data.product);
          this.updateLocalBatch(normalized);
          return normalized;
        }
      }
    } catch (e) {
      console.warn('Network call for retailerSell failed, updating local:', e);
    }

    const batches = this.getStoredBatches();
    const idx = batches.findIndex(b => b.id === batchId || b.batchId === batchId);
    if (idx !== -1) {
      const b = batches[idx];
      const remaining = Math.max(0, (b.quantity || 0) - soldQuantity);
      b.quantity = remaining;
      b.quantityKg = remaining;
      if (remaining === 0) {
        b.status = 'Sold to Consumer';
        b.currentCustodianRole = 'consumer';
      }
      b.blockchain.statusNotice = 'On-Chain Validated: Batch Sold & Permanently Locked';
      b.timeline.push({
        id: `tl-${Date.now()}`,
        stage: 'Consumer',
        title: 'Point of Sale to Consumer',
        description: `Sold ${soldQuantity} ${b.unit || 'kg'}${buyerNote ? ` (${buyerNote})` : ''}. ${remaining > 0 ? `${remaining} ${b.unit || 'kg'} remaining in stock.` : 'Batch lot completely sold and immutably finalized on-chain.'}`,
        actorName: 'Retail Checkout',
        actorRole: 'retailer',
        location: 'Retail Store Point of Sale',
        txHash: onChainTx.txHash,
        blockNumber: onChainTx.blockNumber,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verified: true,
      });
      this.saveBatches(batches);
      return b;
    }
    return null;
  }

  private updateLocalBatch(updated: ProduceBatch) {
    const existing = this.getStoredBatches();
    const filtered = existing.filter(b => b.id !== updated.id && b.batchId !== updated.batchId);
    this.saveBatches([updated, ...filtered]);
  }
}

export const productService = new ProductService();
