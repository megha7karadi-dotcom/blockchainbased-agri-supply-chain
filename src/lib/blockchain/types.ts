/**
 * AgriTrace Blockchain Layer TypeScript Definitions
 * Directly aligned with AgriTraceSupplyChain.sol
 */

export enum OnChainProduceStatus {
  NONE = 0,
  REGISTERED = 1,
  WITH_DISTRIBUTOR = 2,
  IN_TRANSIT = 3,
  WITH_RETAILER = 4,
  SOLD = 5,
}

export enum OnChainQualityGrade {
  NONE = 0,
  GRADE_A = 1,
  GRADE_B = 2,
  GRADE_C = 3,
}

export interface OnChainProduceBatch {
  batchId: string; // bytes32 hex
  cropName: string;
  quantityKg: bigint;
  qualityGrade: OnChainQualityGrade;
  originHash: string; // bytes32 hex
  currentOwner: string; // 0x address
  farmer: string; // 0x address
  distributor: string; // 0x address
  retailer: string; // 0x address
  status: OnChainProduceStatus;
  lastPricePerKg: bigint;
  createdAt: bigint;
  lastUpdatedAt: bigint;
}

export interface OnChainPriceRecord {
  pricePerKg: bigint;
  stage: OnChainProduceStatus;
  updatedBy: string;
  timestamp: bigint;
}

export interface OnChainProvenanceRecord {
  fromStatus: OnChainProduceStatus;
  toStatus: OnChainProduceStatus;
  actor: string;
  fromOwner: string;
  toOwner: string;
  priceAtStep: bigint;
  remarks: string;
  timestamp: bigint;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  networkName: string | null;
  isConnecting: boolean;
  error: string | null;
}

export interface BlockchainTransactionResult {
  txHash: string;
  blockNumber: number;
  blockHash: string;
  gasUsed: bigint;
  effectiveGasPrice?: bigint;
}

export const PRODUCE_STATUS_LABELS: Record<OnChainProduceStatus, string> = {
  [OnChainProduceStatus.NONE]: 'Uninitialized',
  [OnChainProduceStatus.REGISTERED]: 'Registered',
  [OnChainProduceStatus.WITH_DISTRIBUTOR]: 'With Distributor',
  [OnChainProduceStatus.IN_TRANSIT]: 'In Transit',
  [OnChainProduceStatus.WITH_RETAILER]: 'With Retailer',
  [OnChainProduceStatus.SOLD]: 'Sold',
};

export const QUALITY_GRADE_LABELS: Record<OnChainQualityGrade, string> = {
  [OnChainQualityGrade.NONE]: 'None / Unspecified',
  [OnChainQualityGrade.GRADE_A]: 'Grade A (Export Quality)',
  [OnChainQualityGrade.GRADE_B]: 'Grade B (Premium)',
  [OnChainQualityGrade.GRADE_C]: 'Grade C (Standard)',
};

/**
 * Maps UI Quality Grade strings to Solidity QualityGrade enum
 */
export function mapUiGradeToOnChain(gradeStr: string | undefined): OnChainQualityGrade {
  if (!gradeStr) return OnChainQualityGrade.GRADE_A;
  const lower = gradeStr.toLowerCase();
  if (lower.includes('grade a') || lower.includes('export')) return OnChainQualityGrade.GRADE_A;
  if (lower.includes('grade b') || lower.includes('premium')) return OnChainQualityGrade.GRADE_B;
  if (lower.includes('grade c') || lower.includes('standard')) return OnChainQualityGrade.GRADE_C;
  return OnChainQualityGrade.GRADE_A;
}

/**
 * Maps Solidity ProduceStatus enum to UI status strings
 */
export function mapOnChainStatusToUi(status: OnChainProduceStatus): string {
  switch (status) {
    case OnChainProduceStatus.REGISTERED:
      return 'Registered';
    case OnChainProduceStatus.WITH_DISTRIBUTOR:
      return 'At Distributor';
    case OnChainProduceStatus.IN_TRANSIT:
      return 'In Transit';
    case OnChainProduceStatus.WITH_RETAILER:
      return 'On Retail Shelf';
    case OnChainProduceStatus.SOLD:
      return 'Sold to Consumer';
    default:
      return 'Registered';
  }
}
