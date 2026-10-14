import { ethers, Contract } from 'ethers';
import fs from 'fs';
import path from 'path';
import { AGRITRACE_ABI } from '../../src/lib/blockchain/abi';

let cachedAbi: any = null;
let cachedBytecode: any = null;

// Initialize active contract address from env or deployedAddress.json (never placeholder)
function readInitialContractAddress(): string {
  if (process.env.AGRITRACE_CONTRACT_ADDRESS && isValidAddress(process.env.AGRITRACE_CONTRACT_ADDRESS)) {
    return process.env.AGRITRACE_CONTRACT_ADDRESS.trim();
  }
  if (process.env.VITE_AGRITRACE_CONTRACT_ADDRESS && isValidAddress(process.env.VITE_AGRITRACE_CONTRACT_ADDRESS)) {
    return process.env.VITE_AGRITRACE_CONTRACT_ADDRESS.trim();
  }
  try {
    const deployedJsonPath = path.resolve(process.cwd(), 'contracts', 'deployedAddress.json');
    if (fs.existsSync(deployedJsonPath)) {
      const data = JSON.parse(fs.readFileSync(deployedJsonPath, 'utf8'));
      if (data.contractAddress && isValidAddress(data.contractAddress)) {
        return data.contractAddress.trim();
      }
    }
  } catch (err) {
    console.warn('[Blockchain Service] Error reading deployedAddress.json:', err);
  }
  return '0x110D36B8FA4FAc2Fc214c1F341261BA6654a57Ef';
}

let activeContractAddress: string = readInitialContractAddress();

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';

export function isValidAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  const trimmed = address.trim();
  return trimmed.startsWith('0x') && trimmed.length === 42 && /^0x[a-fA-F0-9]{40}$/.test(trimmed);
}

export function isContractConfigured(): boolean {
  return isValidAddress(getContractAddress());
}

function loadArtifact() {
  if (cachedAbi && cachedBytecode) return { abi: cachedAbi, bytecode: cachedBytecode };
  try {
    const artifactPath = path.resolve(process.cwd(), 'contracts', 'build', 'AgriTraceSupplyChain.json');
    if (fs.existsSync(artifactPath)) {
      const data = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      cachedAbi = data.abi;
      cachedBytecode = data.bytecode;
      return { abi: cachedAbi, bytecode: cachedBytecode };
    }
  } catch (err) {
    console.warn('[Blockchain Service] Error loading build artifact:', err);
  }
  return { abi: AGRITRACE_ABI, bytecode: null };
}

export function getContractAbi() {
  const { abi } = loadArtifact();
  return abi || AGRITRACE_ABI;
}

export function getContractAddress(): string {
  if (process.env.AGRITRACE_CONTRACT_ADDRESS && isValidAddress(process.env.AGRITRACE_CONTRACT_ADDRESS)) {
    return process.env.AGRITRACE_CONTRACT_ADDRESS.trim();
  }
  if (process.env.VITE_AGRITRACE_CONTRACT_ADDRESS && isValidAddress(process.env.VITE_AGRITRACE_CONTRACT_ADDRESS)) {
    return process.env.VITE_AGRITRACE_CONTRACT_ADDRESS.trim();
  }
  return activeContractAddress;
}

export function setActiveContractAddress(address: string): boolean {
  const trimmed = (address || '').trim();
  if (!isValidAddress(trimmed)) {
    throw new Error('Invalid Ethereum contract address. Must be a 42-character hex string starting with 0x.');
  }

  activeContractAddress = trimmed;

  // Persist to contracts/deployedAddress.json
  try {
    const deployedJsonPath = path.resolve(process.cwd(), 'contracts', 'deployedAddress.json');
    fs.writeFileSync(
      deployedJsonPath,
      JSON.stringify(
        {
          contractAddress: trimmed,
          network: 'sepolia',
          chainId: SEPOLIA_CHAIN_ID,
          rpcUrl: getRpcUrl(),
          updatedAt: new Date().toISOString(),
          status: 'Deployed on Ethereum Sepolia'
        },
        null,
        2
      )
    );
    console.log(`[Blockchain Service] Updated Sepolia contract address: ${trimmed}`);
  } catch (err) {
    console.warn('[Blockchain Service] Failed to persist deployedAddress.json:', err);
  }

  return true;
}

export function getRpcUrl(): string {
  return (
    process.env.BLOCKCHAIN_RPC_URL ||
    process.env.VITE_BLOCKCHAIN_RPC_URL ||
    SEPOLIA_RPC_URL
  );
}

/**
 * Returns a persistent read-only JsonRpcProvider connected to Ethereum Sepolia Testnet
 */
export function getActiveProvider(): ethers.JsonRpcProvider {
  const rpc = getRpcUrl();
  return new ethers.JsonRpcProvider(rpc);
}

/**
 * Returns a read-only contract instance connected via Sepolia Node.js provider
 */
export async function getBackendContract(): Promise<Contract | null> {
  const abi = getContractAbi();
  const address = getContractAddress();
  if (!abi || !isValidAddress(address)) return null;

  try {
    const provider = getActiveProvider();
    return new Contract(address, abi, provider);
  } catch (err) {
    console.warn('[Blockchain Service] Contract init notice:', err);
    return null;
  }
}

/**
 * Converts string batch ID to bytes32 hex
 */
export function stringToBytes32(batchId: string): string {
  if (!batchId) throw new Error('batchId cannot be empty');
  const trimmed = batchId.trim();
  if (trimmed.startsWith('0x') && trimmed.length === 66) {
    return trimmed;
  }
  return ethers.keccak256(ethers.toUtf8Bytes(trimmed));
}

/**
 * OpenZeppelin AccessControl role hash mappings
 */
export const ROLE_HASHES: Record<string, string> = {
  FARMER: ethers.keccak256(ethers.toUtf8Bytes('FARMER_ROLE')),
  DISTRIBUTOR: ethers.keccak256(ethers.toUtf8Bytes('DISTRIBUTOR_ROLE')),
  RETAILER: ethers.keccak256(ethers.toUtf8Bytes('RETAILER_ROLE')),
  ADMIN: ethers.ZeroHash,
};

/**
 * Checks if an account holds a given role on the Sepolia smart contract
 */
export async function checkRoleOnChain(accountAddress: string, roleName: string): Promise<boolean> {
  const contract = await getBackendContract();
  if (!contract) return true; // optimistic if contract not yet configured

  const normalized = roleName.toUpperCase().replace('_ROLE', '');
  const roleHash = ROLE_HASHES[normalized] || ROLE_HASHES.FARMER;

  try {
    return await contract.hasRole(roleHash, accountAddress);
  } catch (err) {
    console.warn(`[Blockchain Service] hasRole check error for ${accountAddress}:`, err);
    return false;
  }
}

/**
 * Fetches authoritative batch data from Ethereum Sepolia smart contract
 */
export async function getOnChainBatch(batchId: string) {
  const contract = await getBackendContract();
  if (!contract) return null;

  try {
    const bytes32Id = stringToBytes32(batchId);
    const exists = await contract.batchExists(bytes32Id);
    if (!exists) return null;

    const raw = await contract.getBatch(bytes32Id);
    return {
      batchId: raw.batchId,
      cropName: raw.cropName,
      quantityKg: raw.quantityKg.toString(),
      qualityGrade: Number(raw.qualityGrade),
      originHash: raw.originHash,
      currentOwner: raw.currentOwner,
      farmer: raw.farmer,
      designatedRecipient: raw.designatedRecipient,
      status: Number(raw.status),
      createdAt: Number(raw.createdAt),
      lastUpdatedAt: Number(raw.lastUpdatedAt),
    };
  } catch (err: any) {
    console.warn(`[Blockchain Service] getOnChainBatch error for ${batchId}:`, err?.message);
    return null;
  }
}

/**
 * Fetches on-chain price history from Ethereum Sepolia smart contract
 */
export async function getOnChainPriceHistory(batchId: string) {
  const contract = await getBackendContract();
  if (!contract) return [];

  try {
    const bytes32Id = stringToBytes32(batchId);
    const rawList = await contract.getPriceHistory(bytes32Id);
    return rawList.map((item: any) => ({
      pricePerKg: item.pricePerKg.toString(),
      stage: Number(item.stage),
      setBy: item.setBy || item.updatedBy || '',
      timestamp: Number(item.timestamp),
    }));
  } catch (err: any) {
    console.warn(`[Blockchain Service] getOnChainPriceHistory error for ${batchId}:`, err?.message);
    return [];
  }
}

/**
 * Fetches on-chain provenance records from Ethereum Sepolia smart contract
 */
export async function getOnChainProvenanceHistory(batchId: string) {
  const contract = await getBackendContract();
  if (!contract) return [];

  try {
    const bytes32Id = stringToBytes32(batchId);
    const rawList = await contract.getProvenanceHistory(bytes32Id);
    return rawList.map((item: any) => ({
      fromStatus: Number(item.fromStatus),
      toStatus: Number(item.toStatus),
      actor: item.actor,
      fromOwner: item.fromOwner,
      toOwner: item.toOwner,
      priceAtStep: item.priceAtStep.toString(),
      remarks: item.remarks,
      timestamp: Number(item.timestamp),
    }));
  } catch (err: any) {
    console.warn(`[Blockchain Service] getOnChainProvenanceHistory error for ${batchId}:`, err?.message);
    return [];
  }
}

/**
 * Verifies if a given MongoDB product matches the authoritative on-chain contract state on Sepolia
 */
export async function verifyProductAgainstBlockchain(product: any) {
  const contractAddress = getContractAddress();
  if (!isContractConfigured()) {
    return {
      isVerified: false,
      reason: 'Awaiting Sepolia contract deployment. Please deploy the contract to Sepolia and supply the address.',
      contractAddress: null,
      onChain: null
    };
  }

  if (!product || !product.batchId) {
    return { isVerified: false, reason: 'Missing product record or batchId' };
  }

  const onChain = await getOnChainBatch(product.batchId);
  if (!onChain) {
    return {
      isVerified: false,
      reason: 'Batch was not found on the Ethereum Sepolia smart contract ledger',
      onChain: null,
      contractAddress,
    };
  }

  // Authoritative validation against smart contract
  const mismatches: string[] = [];
  const dbCropName = (product.cropName || product.name || '').toLowerCase();
  if (onChain.cropName.toLowerCase() !== dbCropName) {
    mismatches.push(`Crop name mismatch: on-chain "${onChain.cropName}" vs database "${product.cropName || product.name}"`);
  }

  return {
    isVerified: mismatches.length === 0,
    mismatches,
    onChain,
    network: 'Ethereum Sepolia',
    chainId: SEPOLIA_CHAIN_ID,
    contractAddress,
  };
}

export interface ValidatedTxMetadata {
  txHash: string;
  blockNumber: number;
  signerAddress?: string;
  onChainVerified: boolean;
}

export interface TxValidationOptions {
  expectedSigner?: string;
  expectedAction?: string;
  batchId?: string;
  provider?: any;
  deployedAddress?: string;
}

export interface TxValidationResult {
  valid: boolean;
  error?: string;
  retryable?: boolean;
  metadata?: ValidatedTxMetadata;
}

/**
 * Validates client-submitted transaction hash and block number metadata.
 * Validates cryptographic format, checks for on-chain receipt on Sepolia,
 * verifies execution status (status === 1, not reverted), matches target contract address,
 * and validates that the transaction corresponds to the intended lifecycle action and batch.
 * If transaction calldata is pruned or unavailable, falls back to receipt event log decoding
 * or returns a clear retryable error without falsely certifying unverified transactions.
 */
export async function validateTransactionMetadata(
  txHashInput?: any,
  blockNumberInput?: any,
  optionsOrSigner?: string | TxValidationOptions
): Promise<TxValidationResult> {
  const options: TxValidationOptions = typeof optionsOrSigner === 'string'
    ? { expectedSigner: optionsOrSigner }
    : (optionsOrSigner || {});

  // If neither txHash nor blockNumber was submitted, this is an off-chain database-only record
  if (!txHashInput && (blockNumberInput === undefined || blockNumberInput === null || blockNumberInput === '')) {
    return { valid: true };
  }

  // If one was submitted without the other, reject incomplete metadata
  if (!txHashInput) {
    return {
      valid: false,
      error: 'Transaction hash (txHash) is required when block number is specified.'
    };
  }

  if (blockNumberInput === undefined || blockNumberInput === null || blockNumberInput === '') {
    return {
      valid: false,
      error: 'Block number (blockNumber) is required when transaction hash is specified.'
    };
  }

  // 1. Syntactic format check: 66-character hex string starting with 0x
  const txHash = String(txHashInput).trim();
  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return {
      valid: false,
      error: `Invalid transaction hash format (${txHash}). Must be a 66-character hexadecimal string starting with 0x.`
    };
  }

  // 2. Syntactic format check on block number: positive integer
  const blockNum = Number(blockNumberInput);
  if (!Number.isInteger(blockNum) || blockNum <= 0) {
    return {
      valid: false,
      error: `Invalid block number (${blockNumberInput}). Must be a positive integer.`
    };
  }

  // 3. Cryptographic on-chain verification against Sepolia testnet
  let resolvedSigner = options.expectedSigner;
  const deployedAddress = options.deployedAddress || getContractAddress();

  try {
    const provider = options.provider || getActiveProvider();

    // Query transaction receipt
    let receipt = await provider.getTransactionReceipt(txHash);

    // If receipt not returned immediately, short 400ms retry for replica sync
    if (!receipt) {
      await new Promise((r) => setTimeout(r, 400));
      receipt = await provider.getTransactionReceipt(txHash);
    }

    // Query transaction object for calldata and recipient
    let tx: any = null;
    try {
      tx = await provider.getTransaction(txHash);
    } catch {
      // Non-fatal if provider only has receipt
    }

    if (!receipt) {
      if (tx) {
        // Transaction exists in mempool/node, but no receipt yet -> Pending!
        return {
          valid: false,
          retryable: true,
          error: `Transaction ${txHash} is pending on Ethereum Sepolia and has not been mined into a block yet. Please wait for on-chain confirmation and retry.`
        };
      }

      // Neither receipt nor tx found: check if provider is active
      try {
        const currentBlock = await provider.getBlockNumber();
        if (currentBlock > 0) {
          return {
            valid: false,
            error: `Transaction ${txHash} was not found on Ethereum Sepolia. Transactions must be confirmed on-chain.`
          };
        }
      } catch {
        return {
          valid: false,
          retryable: true,
          error: `Could not reach Ethereum Sepolia provider to verify transaction ${txHash}.`
        };
      }
    }

    // Receipt must not be reverted
    if (receipt.status === 0) {
      return {
        valid: false,
        error: `Transaction ${txHash} failed or was reverted on Ethereum Sepolia (status = 0). State changes were not applied.`
      };
    }

    // Block number check: verify client submission matches authoritative on-chain block
    if (receipt.blockNumber !== blockNum) {
      return {
        valid: false,
        error: `Block number mismatch for ${txHash}: confirmed on Sepolia in block #${receipt.blockNumber}, but client submitted block #${blockNum}.`
      };
    }

    // Check target contract matches deployed AgriTrace contract
    const targetAddress = receipt.to || tx?.to;
    if (deployedAddress && targetAddress && targetAddress.toLowerCase() !== deployedAddress.toLowerCase()) {
      return {
        valid: false,
        error: `Transaction recipient (${targetAddress}) does not match the deployed AgriTrace contract (${deployedAddress}).`
      };
    }

    resolvedSigner = resolvedSigner || tx?.from || receipt.from;

    // Validate that the transaction corresponds to the intended lifecycle action and batch
    if (options.expectedAction || options.batchId) {
      let actionVerified = false;
      const abi = getContractAbi();

      // Method A: Decode transaction calldata if available
      if (abi && tx && tx.data && tx.data !== '0x') {
        try {
          const iface = new ethers.Interface(abi);
          const parsed = iface.parseTransaction({ data: tx.data, value: tx.value });
          if (parsed) {
            if (options.expectedAction && parsed.name !== options.expectedAction) {
              return {
                valid: false,
                error: `Transaction ${txHash} executed contract function "${parsed.name}", but the required action for this endpoint is "${options.expectedAction}". Generic transaction existence does not prove the correct action occurred.`
              };
            }
            if (options.batchId && parsed.args && parsed.args.length > 0) {
              const expectedBatchB32 = stringToBytes32(options.batchId).toLowerCase();
              const txBatchB32 = String(parsed.args[0]).toLowerCase();
              if (txBatchB32 !== expectedBatchB32) {
                return {
                  valid: false,
                  error: `Transaction ${txHash} target batch (${txBatchB32}) does not match the requested batch ID ${options.batchId} (${expectedBatchB32}).`
                };
              }
            }
            actionVerified = true;
          }
        } catch (parseErr: any) {
          console.warn('[validateTransactionMetadata] Calldata parsing notice:', parseErr?.message);
        }
      }

      // Method B: Reliable alternative - verify via receipt event logs if calldata was pruned or unavailable
      if (!actionVerified && receipt && receipt.logs && receipt.logs.length > 0 && abi) {
        try {
          const iface = new ethers.Interface(abi);
          const expectedBatchB32 = options.batchId ? stringToBytes32(options.batchId).toLowerCase() : null;

          for (const log of receipt.logs) {
            if (deployedAddress && log.address && log.address.toLowerCase() !== deployedAddress.toLowerCase()) {
              continue;
            }
            try {
              const parsedLog = iface.parseLog({ topics: log.topics as string[], data: log.data });
              if (!parsedLog) continue;

              const logBatchB32 = parsedLog.args?.batchId ? String(parsedLog.args.batchId).toLowerCase() : null;
              const batchMatches = !expectedBatchB32 || (logBatchB32 === expectedBatchB32);

              if (batchMatches) {
                if (options.expectedAction === 'updateDistributorPrice' && parsedLog.name === 'PriceUpdated') {
                  actionVerified = true;
                  break;
                } else if (options.expectedAction === 'updateRetailerPrice' && parsedLog.name === 'PriceUpdated') {
                  actionVerified = true;
                  break;
                } else if (options.expectedAction === 'registerProduce' && parsedLog.name === 'ProduceRegistered') {
                  actionVerified = true;
                  break;
                } else if (options.expectedAction === 'transferToDistributor' &&
                           (parsedLog.name === 'OwnershipTransferred' || parsedLog.name === 'StatusChanged')) {
                  actionVerified = true;
                  break;
                } else if (options.expectedAction === 'dispatchToRetailer' &&
                           (parsedLog.name === 'OwnershipTransferred' || parsedLog.name === 'StatusChanged')) {
                  actionVerified = true;
                  break;
                } else if (options.expectedAction === 'receiveProduceByRetailer' &&
                           (parsedLog.name === 'OwnershipTransferred' || parsedLog.name === 'StatusChanged')) {
                  actionVerified = true;
                  break;
                } else if (options.expectedAction === 'recordSale' &&
                           (parsedLog.name === 'OwnershipTransferred' || parsedLog.name === 'StatusChanged')) {
                  actionVerified = true;
                  break;
                } else if (!options.expectedAction) {
                  actionVerified = true;
                  break;
                }
              }
            } catch {
              // Non-matching log entry
            }
          }
        } catch (logErr: any) {
          console.warn('[validateTransactionMetadata] Receipt log parsing notice:', logErr?.message);
        }
      }

      // If neither calldata nor logs established proof of the required lifecycle action:
      if (!actionVerified) {
        return {
          valid: false,
          retryable: true,
          error: `Transaction ${txHash} confirmed on-chain, but transaction calldata and execution logs are temporarily unavailable from the RPC provider to verify function "${options.expectedAction || 'lifecycle'}" and batch ID "${options.batchId || ''}". Please retry in a few moments.`
        };
      }
    }
  } catch (rpcErr: any) {
    console.warn(`[validateTransactionMetadata] Sepolia RPC check note for ${txHash}:`, rpcErr?.message);
    return {
      valid: false,
      retryable: true,
      error: `Sepolia blockchain verification failed for ${txHash}: ${rpcErr?.message || 'RPC communication error'}`
    };
  }

  return {
    valid: true,
    metadata: {
      txHash,
      blockNumber: blockNum,
      signerAddress: resolvedSigner,
      onChainVerified: true
    }
  };
}

