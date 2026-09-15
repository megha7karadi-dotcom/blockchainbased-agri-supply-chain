export type UserRole = 'public' | 'farmer' | 'distributor' | 'retailer' | 'consumer' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  location: string;
  organization?: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  trustScore: number; // 0 to 100
  registeredDate: string;
  avatar?: string;
  walletAddress: string; // Cryptographic custody and account identifier
}

export type ProduceCategory = 'Fruits' | 'Vegetables' | 'Grains' | 'Spices' | 'Pulses';

export type ProduceGrade = 'Grade A (Export Quality)' | 'Grade B (Premium)' | 'Grade C (Standard)';

export type BatchStatus = 
  | 'Harvested' 
  | 'Ready for Dispatch' 
  | 'In Transit' 
  | 'At Distributor' 
  | 'Delivered to Retailer' 
  | 'On Retail Shelf' 
  | 'Sold to Consumer';

export interface PriceBreakdown {
  farmerPrice: number; // Base price paid to farmer per kg
  distributorLogisticsCost: number; // Transport, storage, packaging
  distributorMargin: number; // Distributor markup
  retailerOverhead: number; // Retail store running cost
  retailerMargin: number; // Retailer markup
  finalConsumerPrice: number; // Retail shelf price per kg
  currency: string;
  fairPriceCeiling: number; // Government / APMC Fair benchmark ceiling
}

export interface TimelineEvent {
  id: string;
  stage: 'Farming' | 'Logistics' | 'Wholesale' | 'Retail' | 'Consumer';
  title: string;
  description: string;
  actorName: string;
  actorRole: UserRole;
  location: string;
  timestamp: string;
  blockNumber?: number;
  txHash?: string;
  temperature?: string;
  humidity?: string;
  verified: boolean;
}

export interface QualityMetrics {
  grade: ProduceGrade;
  freshnessScore: number; // 0 - 100%
  moistureContent: string;
  pesticideResidueTest: 'Zero Residue (Certified Organic)' | 'Within Safe Limits' | 'Pending Lab Test';
  organicCertificationNumber?: string;
  certifyingBody?: string;
  harvestDate: string;
  shelfLifeDays: number;
}

export interface BlockchainProof {
  contractAddress: string;
  tokenId: string; // ERC-721 / ERC-1155 Batch Token ID
  blockNumber: number;
  mintTxHash: string;
  currentOwnerWallet: string;
  consensusMechanism: string;
  gasUsed: string;
  merkleRootHash: string;
  isTamperEvident: boolean;
  statusNotice: string;
}

export interface IoTSensorLog {
  timestamp: string;
  temperature: number; // Celsius
  humidity: number; // %
  location: string;
  status: 'optimal' | 'warning' | 'critical';
}

export type ProduceUnit = 'kg' | 'quintal' | 'tonnes' | 'litres' | 'pieces';
export type QualityGrade = 'Grade A' | 'Grade B' | 'Grade C';

export interface ProduceBatch {
  // Canonical Farmer Batch Registration Fields (Section 12)
  id: string;
  batchId: string; // e.g. AGRI-2026-MNG-001
  cropName?: string;
  cropVariety?: string;
  quantity?: number;
  unit?: string; // 'kg' | 'quintal' | 'tonnes' | 'litres' | 'pieces'
  farmName?: string;
  farmLocation?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  harvestDate: string;
  qualityGrade?: string; // 'Grade A' | 'Grade B' | 'Grade C'
  certification?: string;
  notes?: string;
  farmgatePrice?: number;
  priceUnit?: string; // e.g. '₹ / kg'
  farmerId: string;
  createdAt?: string;
  status: string;

  // Platform & Ecosystem Compatibility Fields
  name?: string;
  variety?: string;
  category?: ProduceCategory;
  farmerName?: string;
  farmerLocation?: string;
  farmCoordinates?: string;
  quantityKg?: number;
  currentCustodianRole?: UserRole;
  currentCustodianName?: string;
  pricing?: PriceBreakdown;
  quality?: QualityMetrics;
  blockchain?: BlockchainProof;
  timeline?: TimelineEvent[];
  sensorLogs?: IoTSensorLog[];
  imageUrl?: string;
  description?: string;
}

export interface PricePrediction {
  crop: string;
  variety: string;
  currentMandiPrice: number;
  predictedPrice7Days: number;
  predictedPrice14Days: number;
  predictedPrice30Days: number;
  trend: 'rising' | 'falling' | 'stable';
  confidenceScore: number; // 0-100%
  recommendedAction: 'Sell Now' | 'Hold for 7 Days' | 'Store in Cold Chain';
  keyFactors: string[];
  historicalWeekly: { week: string; price: number; predicted?: number }[];
}

export interface FraudAlert {
  id: string;
  batchId: string;
  cropName: string;
  severity: 'low' | 'medium' | 'high';
  alertType: 'Excessive Margin' | 'Cold-chain Temperature Spike' | 'Unverified Custody Transfer' | 'Counterfeit QR Attempt';
  description: string;
  flaggedBy: string;
  timestamp: string;
  status: 'Open' | 'Under Investigation' | 'Resolved';
  actionTaken?: string;
}

export interface NotificationItem {
  id: string;
  targetRole: UserRole | 'all';
  targetUserId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
  linkTab?: string;
}

export interface SystemPolicies {
  maxRetailMarkupPercent: number;
  maxColdChainTemp: number;
  autoQuarantineViolations: boolean;
  minFarmerSharePercent: number;
  consensusConfirmations: number;
  lastUpdated?: string;
  deployedTxHash?: string;
}

export interface PredictionModelDetails {
  id: 'random-forest' | 'xgboost' | 'sarimax' | 'neural-net';
  name: string;
  version: string;
  algorithm: string;
  bestFitCrops: string[];
  perishabilityProfile: 'Perishable' | 'Semi-Perishable' | 'Durable Grain' | 'High-Volatility Cash Crop';
  accuracyRate: number; // e.g. 94.8%
  r2Score: number;      // e.g. 0.932
  mae: number;          // Mean absolute error (₹/kg)
  rmse: number;         // Root mean square error (₹/kg)
  description: string;
  selectionRationale: string;
}
