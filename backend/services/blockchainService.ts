import { ethers, Contract } from 'ethers';
import fs from 'fs';
import path from 'path';

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
  return '';
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
  return { abi: null, bytecode: null };
}

export function getContractAbi() {
  const { abi } = loadArtifact();
  return abi;
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
