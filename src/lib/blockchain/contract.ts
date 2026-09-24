import { 
  ethers, 
  Contract, 
  Interface, 
  BrowserProvider, 
  JsonRpcProvider, 
  ContractTransactionResponse,
  ContractTransactionReceipt
} from 'ethers';
import { AGRITRACE_ABI } from './abi';
import { getContractAddress, DEFAULT_RPC_URL, getRpcUrl } from './config';
export { getContractAddress, getRpcUrl };
import { getBrowserProvider, isMetaMaskAvailable } from './wallet';
import { 
  OnChainProduceBatch, 
  OnChainPriceRecord, 
  OnChainProvenanceRecord, 
  OnChainProduceStatus,
  OnChainQualityGrade,
  BlockchainTransactionResult,
  PRODUCE_STATUS_LABELS
} from './types';

// Cached contract interface
export const contractInterface = new Interface(AGRITRACE_ABI);

// OpenZeppelin AccessControl role hashes
export const ROLES = {
  DEFAULT_ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
  FARMER_ROLE: ethers.keccak256(ethers.toUtf8Bytes('FARMER_ROLE')),
  DISTRIBUTOR_ROLE: ethers.keccak256(ethers.toUtf8Bytes('DISTRIBUTOR_ROLE')),
  RETAILER_ROLE: ethers.keccak256(ethers.toUtf8Bytes('RETAILER_ROLE')),
};

export const ROLE_NAMES: Record<string, string> = {
  [ROLES.DEFAULT_ADMIN_ROLE]: 'Administrator',
  [ROLES.FARMER_ROLE]: 'Farmer',
  [ROLES.DISTRIBUTOR_ROLE]: 'Distributor',
  [ROLES.RETAILER_ROLE]: 'Retailer',
};

/**
 * Converts a string batch identifier into a deterministic bytes32 hex string
 */
export function stringToBatchId(batchId: string): string {
  if (!batchId) throw new Error('Batch ID cannot be empty');
  const trimmed = batchId.trim();
  if (trimmed.startsWith('0x') && trimmed.length === 66) {
    return trimmed;
  }
  return ethers.keccak256(ethers.toUtf8Bytes(trimmed));
}

/**
 * Generates deterministic origin certificate hash
 */
export function generateOriginHash(
  location: string,
  state: string,
  harvestDate: string,
  farmerIdentifier: string
): string {
  const payload = `${location.trim()}|${state.trim()}|${harvestDate.trim()}|${farmerIdentifier.trim()}`;
  return ethers.keccak256(ethers.toUtf8Bytes(payload));
}

/**
 * Decodes contract revert errors into human-readable messages
 */
export function parseContractError(err: any): string {
  if (!err) return 'Unknown blockchain error occurred.';

  // Check if ethers captured the custom error name directly
  const customErrorName = err.revert?.name || err.shortMessage || '';
  const errorData = err.data || err.error?.data || err.info?.error?.data;

  let parsed: any = null;

  if (errorData && typeof errorData === 'string' && errorData.startsWith('0x')) {
    try {
      parsed = contractInterface.parseError(errorData);
    } catch {
      // try openzeppelin interface
      try {
        const ozInterface = new Interface([
          'error AccessControlUnauthorizedAccount(address account, bytes32 neededRole)',
          'error AccessControlBadConfirmation()',
        ]);
        parsed = ozInterface.parseError(errorData);
      } catch {
        // fallback
      }
    }
  }

  const name = parsed?.name || customErrorName;
  const args = parsed?.args;

  switch (name) {
    case 'UnauthorizedCaller': {
      const roleHash = args?.requiredRole || args?.[1];
      const roleName = ROLE_NAMES[roleHash] || 'authorized stakeholder';
      return `Access Denied: Only accounts granted the ${roleName} role are authorized to perform this operation.`;
    }
    case 'AccessControlUnauthorizedAccount': {
      const roleHash = args?.neededRole || args?.[1];
      const roleName = ROLE_NAMES[roleHash] || 'required stakeholder';
      return `Unauthorized: Your wallet is missing the ${roleName} role on this smart contract.`;
    }
    case 'EmptyBatchId':
      return 'Validation Rejection: The produce batch ID cannot be empty.';
    case 'BatchAlreadyExists':
      return 'Validation Rejection: A produce batch with this ID has already been registered on the blockchain.';
    case 'EmptyCropName':
      return 'Validation Rejection: Crop name cannot be empty.';
    case 'InvalidQuantity':
      return 'Validation Rejection: Harvest quantity must be greater than zero.';
    case 'InvalidPrice':
      return 'Validation Rejection: Produce price must be greater than zero.';
    case 'InvalidQualityGrade':
      return 'Validation Rejection: Please specify a valid quality grade (Grade A, B, or C).';
    case 'EmptyOriginInfo':
      return 'Validation Rejection: Origin certificate hash is missing.';
    case 'BatchNotFound':
      return 'Blockchain Lookup Error: The specified batch does not exist on the smart contract ledger.';
    case 'NotBatchOwner':
      return 'Custody Rejection: Only the current authenticated on-chain custodian of this batch can execute this transfer or update.';
    case 'InvalidRecipient':
      return 'Validation Rejection: Invalid recipient address (cannot be zero address).';
    case 'CannotTransferToSelf':
      return 'Validation Rejection: Cannot transfer produce custody to your own wallet address.';
    case 'RecipientMissingRole': {
      const needed = args?.requiredRole || args?.[1];
      const role = ROLE_NAMES[needed] || 'required';
      return `Validation Rejection: The recipient wallet does not possess the required ${role} role on-chain.`;
    }
    case 'InvalidLifecycleTransition': {
      const curr = Number(args?.currentStatus ?? args?.[0] ?? 0);
      const target = Number(args?.targetStatus ?? args?.[1] ?? 0);
      const currLbl = PRODUCE_STATUS_LABELS[curr as OnChainProduceStatus] || `Stage ${curr}`;
      const tgtLbl = PRODUCE_STATUS_LABELS[target as OnChainProduceStatus] || `Stage ${target}`;
      return `Lifecycle Rejection: Cannot transition batch from "${currLbl}" to "${tgtLbl}". Allowed progression: Registered → With Distributor → In Transit → With Retailer → Sold.`;
    }
    case 'BatchAlreadySold':
      return 'Immutability Lock: This batch has already been marked as SOLD to the consumer and cannot receive further transfers or price updates.';
    case 'UnauthorizedRetailer':
      return 'Access Denied: Only the specific designated retailer specified during transit dispatch can receive this shipment.';
    default:
      if (err.reason) return `Blockchain Revert: ${err.reason}`;
      if (err.message) {
        if (err.message.includes('user rejected') || err.message.includes('ACTION_REJECTED')) {
          return 'Transaction was rejected by the user in their wallet.';
        }
        return `Blockchain Revert: ${err.message}`;
      }
      return 'Authoritative smart contract rejected this transaction.';
  }
}

/**
 * Returns a read-only ethers Contract instance
 */
export function getReadOnlyContract(customRpcUrl?: string): Contract {
  const address = getContractAddress();
  let provider: ethers.Provider;

  if (isMetaMaskAvailable()) {
    provider = getBrowserProvider()!;
  } else {
    provider = new JsonRpcProvider(customRpcUrl || DEFAULT_RPC_URL);
  }

  return new Contract(address, AGRITRACE_ABI, provider);
}

/**
 * Returns an ethers Contract instance connected to the active MetaMask signer,
 * or falls back to local RPC provider if running in an environment without MetaMask.
 */
export async function getContractWithSigner(roleHint?: 'farmer' | 'distributor' | 'retailer' | 'admin'): Promise<{
  contract: Contract;
  signerAddress: string;
}> {
  let signer: any = null;
  let signerAddress: string = '';

  if (isMetaMaskAvailable()) {
    try {
      const browserProvider = getBrowserProvider()!;
      signer = await browserProvider.getSigner();
      signerAddress = await signer.getAddress();
    } catch {
      // User may not have connected MetaMask yet; fallback to RPC provider below
    }
  }

  if (!signer) {
    try {
      const rpcUrl = getRpcUrl();
      const rpcProvider = new JsonRpcProvider(rpcUrl);
      const accountIndex = roleHint === 'admin' ? 0 : roleHint === 'distributor' ? 2 : roleHint === 'retailer' ? 3 : 1;
      signer = await rpcProvider.getSigner(accountIndex);
      signerAddress = await signer.getAddress();
    } catch (err) {
      console.warn('[Blockchain] RPC Signer init fallback notice:', err);
      throw new Error(
        'No active blockchain signer available. Please connect MetaMask or ensure local blockchain node is reachable.'
      );
    }
  }

  // Ensure role is granted on-chain for seamless state validation
  if (roleHint && roleHint !== 'admin') {
    try {
      await fetch('/api/blockchain/grant-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountAddress: signerAddress, role: roleHint })
      });
    } catch {
      // optimistic
    }
  }

  const contractAddress = getContractAddress();
  const contract = new Contract(contractAddress, AGRITRACE_ABI, signer);
  return { contract, signerAddress };
}

/**
 * Executes a state-changing transaction, waits for receipt, and returns confirmed transaction data
 */
export async function executeBlockchainTransaction(
  actionName: string,
  txPromise: Promise<ContractTransactionResponse>
): Promise<BlockchainTransactionResult> {
  let tx: ContractTransactionResponse;
  try {
    tx = await txPromise;
  } catch (err: any) {
    console.error(`Blockchain call error in ${actionName}:`, err);
    throw new Error(parseContractError(err));
  }

  console.log(`[Blockchain] Tx sent (${actionName}): ${tx.hash}. Waiting for block confirmation...`);

  let receipt: ContractTransactionReceipt | null;
  try {
    receipt = await tx.wait(1);
    if (!receipt || receipt.status !== 1) {
      throw new Error(`Transaction reverted on-chain (status = 0). Transaction Hash: ${tx.hash}`);
    }
  } catch (waitErr: any) {
    console.error(`Transaction wait error in ${actionName}:`, waitErr);
    throw new Error(parseContractError(waitErr));
  }

  console.log(`[Blockchain] Confirmed in block #${receipt.blockNumber}! TxHash: ${receipt.hash}`);

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    blockHash: receipt.blockHash,
    gasUsed: receipt.gasUsed,
    effectiveGasPrice: receipt.gasPrice,
  };
}

// ========================================================
// 1. STATE-CHANGING CONTRACT WRAPPERS (AUTHORITATIVE LAYER)
// ========================================================

/**
 * 1. Register Produce on Smart Contract
 */
export async function registerProduceOnChain(params: {
  batchId: string;
  cropName: string;
  quantityKg: number;
  qualityGrade: OnChainQualityGrade;
  initialPricePerKg: number;
  originHash: string;
}): Promise<BlockchainTransactionResult> {
  const { contract } = await getContractWithSigner('farmer');
  const bytes32BatchId = stringToBatchId(params.batchId);
  const bytes32OriginHash = params.originHash.startsWith('0x') && params.originHash.length === 66
    ? params.originHash
    : ethers.keccak256(ethers.toUtf8Bytes(params.originHash));

  return executeBlockchainTransaction(
    'registerProduce',
    contract.registerProduce(
      bytes32BatchId,
      params.cropName.trim(),
      BigInt(Math.round(params.quantityKg)),
      params.qualityGrade,
      BigInt(Math.round(params.initialPricePerKg)),
      bytes32OriginHash
    )
  );
}

/**
 * 2. Farmer Transfer Produce to Distributor
 */
export async function transferToDistributorOnChain(
  batchId: string,
  distributorAddress: string
): Promise<BlockchainTransactionResult> {
  const { contract } = await getContractWithSigner('farmer');
  const bytes32BatchId = stringToBatchId(batchId);

  return executeBlockchainTransaction(
    'transferToDistributor',
    contract.transferToDistributor(bytes32BatchId, distributorAddress)
  );
}

/**
 * 3. Distributor Update Price
 */
export async function updateDistributorPriceOnChain(
  batchId: string,
  newPricePerKg: number
): Promise<BlockchainTransactionResult> {
  const { contract } = await getContractWithSigner('distributor');
  const bytes32BatchId = stringToBatchId(batchId);

  return executeBlockchainTransaction(
    'updateDistributorPrice',
    contract.updateDistributorPrice(bytes32BatchId, BigInt(Math.round(newPricePerKg)))
  );
}

/**
 * 4. Distributor Dispatch to Retailer (enters IN_TRANSIT)
 */
export async function dispatchToRetailerOnChain(
  batchId: string,
  retailerAddress: string
): Promise<BlockchainTransactionResult> {
  const { contract } = await getContractWithSigner('distributor');
  const bytes32BatchId = stringToBatchId(batchId);

  return executeBlockchainTransaction(
    'dispatchToRetailer',
    contract.dispatchToRetailer(bytes32BatchId, retailerAddress)
  );
}

/**
 * 5. Retailer Receive Produce from Transit
 */
export async function receiveProduceByRetailerOnChain(
  batchId: string
): Promise<BlockchainTransactionResult> {
  const { contract } = await getContractWithSigner('retailer');
  const bytes32BatchId = stringToBatchId(batchId);

  return executeBlockchainTransaction(
    'receiveProduceByRetailer',
    contract.receiveProduceByRetailer(bytes32BatchId)
  );
}

/**
 * 6. Retailer Update Shelf Price
 */
export async function updateRetailerPriceOnChain(
  batchId: string,
  newPricePerKg: number
): Promise<BlockchainTransactionResult> {
  const { contract } = await getContractWithSigner('retailer');
  const bytes32BatchId = stringToBatchId(batchId);

  return executeBlockchainTransaction(
    'updateRetailerPrice',
    contract.updateRetailerPrice(bytes32BatchId, BigInt(Math.round(newPricePerKg)))
  );
}

/**
 * 7. Retailer Record Consumer Sale
 */
export async function recordSaleOnChain(
  batchId: string
): Promise<BlockchainTransactionResult> {
  const { contract } = await getContractWithSigner('retailer');
  const bytes32BatchId = stringToBatchId(batchId);

  return executeBlockchainTransaction(
    'recordSale',
    contract.recordSale(bytes32BatchId)
  );
}

// ========================================================
// 2. READ-ONLY CONTRACT QUERIES (CANONICAL AUDIT LAYER)
// ========================================================

/**
 * Check if batch exists on-chain
 */
export async function checkBatchExistsOnChain(batchId: string): Promise<boolean> {
  try {
    const contract = getReadOnlyContract();
    const bytes32BatchId = stringToBatchId(batchId);
    return await contract.batchExists(bytes32BatchId);
  } catch (err) {
    console.warn('Could not verify batch existence on blockchain:', err);
    return false;
  }
}

/**
 * Retrieves full batch struct from smart contract
 */
export async function getBatchFromChain(batchId: string): Promise<OnChainProduceBatch | null> {
  try {
    const contract = getReadOnlyContract();
    const bytes32BatchId = stringToBatchId(batchId);
    const raw = await contract.getBatch(bytes32BatchId);

    return {
      batchId: raw.batchId,
      cropName: raw.cropName,
      quantityKg: raw.quantityKg,
      qualityGrade: Number(raw.qualityGrade),
      originHash: raw.originHash,
      currentOwner: raw.currentOwner,
      farmer: raw.farmer,
      distributor: raw.distributor,
      retailer: raw.retailer,
      status: Number(raw.status),
      lastPricePerKg: raw.lastPricePerKg,
      createdAt: raw.createdAt,
      lastUpdatedAt: raw.lastUpdatedAt,
    };
  } catch (err: any) {
    console.warn(`getBatchFromChain failed for ${batchId}:`, parseContractError(err));
    return null;
  }
}

/**
 * Retrieves current owner from smart contract
 */
export async function getCurrentOwnerFromChain(batchId: string): Promise<string | null> {
  try {
    const contract = getReadOnlyContract();
    const bytes32BatchId = stringToBatchId(batchId);
    return await contract.getCurrentOwner(bytes32BatchId);
  } catch {
    return null;
  }
}

/**
 * Retrieves current lifecycle status from smart contract
 */
export async function getCurrentStatusFromChain(batchId: string): Promise<OnChainProduceStatus | null> {
  try {
    const contract = getReadOnlyContract();
    const bytes32BatchId = stringToBatchId(batchId);
    const status = await contract.getCurrentStatus(bytes32BatchId);
    return Number(status);
  } catch {
    return null;
  }
}

/**
 * Retrieves chronological price records from smart contract
 */
export async function getPriceHistoryFromChain(batchId: string): Promise<OnChainPriceRecord[]> {
  try {
    const contract = getReadOnlyContract();
    const bytes32BatchId = stringToBatchId(batchId);
    const rawList = await contract.getPriceHistory(bytes32BatchId);

    return rawList.map((item: any) => ({
      pricePerKg: item.pricePerKg,
      stage: Number(item.stage),
      updatedBy: item.updatedBy,
      timestamp: item.timestamp,
    }));
  } catch (err) {
    console.warn(`getPriceHistoryFromChain failed for ${batchId}:`, err);
    return [];
  }
}

/**
 * Retrieves chronological provenance records from smart contract
 */
export async function getProvenanceHistoryFromChain(batchId: string): Promise<OnChainProvenanceRecord[]> {
  try {
    const contract = getReadOnlyContract();
    const bytes32BatchId = stringToBatchId(batchId);
    const rawList = await contract.getProvenanceHistory(bytes32BatchId);

    return rawList.map((item: any) => ({
      fromStatus: Number(item.fromStatus),
      toStatus: Number(item.toStatus),
      actor: item.actor,
      fromOwner: item.fromOwner,
      toOwner: item.toOwner,
      priceAtStep: item.priceAtStep,
      remarks: item.remarks,
      timestamp: item.timestamp,
    }));
  } catch (err) {
    console.warn(`getProvenanceHistoryFromChain failed for ${batchId}:`, err);
    return [];
  }
}

/**
 * Retrieves total batches count registered on smart contract
 */
export async function getTotalBatchesFromChain(): Promise<number> {
  try {
    const contract = getReadOnlyContract();
    const total = await contract.getTotalBatches();
    return Number(total);
  } catch {
    return 0;
  }
}
