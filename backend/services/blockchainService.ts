import { ethers, Contract } from 'ethers';
import fs from 'fs';
import path from 'path';
import ganache from 'ganache';

let cachedAbi: any = null;
let cachedBytecode: any = null;
let inProcessGanache: any = null;
let inProcessBrowserProvider: any = null;
let activeContractAddress: string = process.env.AGRITRACE_CONTRACT_ADDRESS || '0x95446f5Cda059dE75D9d0bc0d7388B3FA416deEF';
let adminSigner: any = null;

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
  return (
    process.env.AGRITRACE_CONTRACT_ADDRESS ||
    process.env.VITE_AGRITRACE_CONTRACT_ADDRESS ||
    activeContractAddress
  );
}

export function getRpcUrl(): string {
  return (
    process.env.BLOCKCHAIN_RPC_URL ||
    process.env.VITE_BLOCKCHAIN_RPC_URL ||
    '/api/blockchain/rpc'
  );
}

/**
 * Ensures an active EVM provider exists (external RPC or in-process Ganache EVM)
 */
export async function getActiveProvider(): Promise<ethers.Provider> {
  const externalRpc = process.env.BLOCKCHAIN_RPC_URL;
  if (externalRpc) {
    try {
      const jsonRpc = new ethers.JsonRpcProvider(externalRpc);
      await jsonRpc.getBlockNumber();
      return jsonRpc;
    } catch {
      // fallback to in-process
    }
  }

  if (!inProcessGanache) {
    inProcessGanache = ganache.provider({
      logging: { quiet: true },
      wallet: { totalAccounts: 10, defaultBalance: 1000 }
    });
    inProcessBrowserProvider = new ethers.BrowserProvider(inProcessGanache);
  }

  return inProcessBrowserProvider;
}

/**
 * Handles incoming JSON-RPC calls for /api/blockchain/rpc
 */
export async function handleRpcRequest(body: any): Promise<any> {
  await getActiveProvider();
  if (inProcessGanache) {
    return new Promise((resolve) => {
      inProcessGanache.send(body, (err: any, res: any) => {
        if (err) {
          resolve({ jsonrpc: '2.0', id: body?.id, error: { code: -32000, message: err.message || String(err) } });
        } else {
          resolve(res);
        }
      });
    });
  }
  throw new Error('RPC relay not available');
}

/**
 * Deploys the contract to the local EVM if not already deployed
 */
export async function ensureContractDeployed(): Promise<string> {
  const provider = await getActiveProvider();
  const { abi, bytecode } = loadArtifact();
  if (!abi || !bytecode) {
    return activeContractAddress;
  }

  try {
    if (inProcessBrowserProvider) {
      adminSigner = await inProcessBrowserProvider.getSigner(0);
      const adminAddress = await adminSigner.getAddress();
      
      const factory = new ethers.ContractFactory(abi, bytecode, adminSigner);
      const deployed = await factory.deploy(adminAddress);
      await deployed.waitForDeployment();
      
      activeContractAddress = await deployed.getAddress();
      console.log(`[Blockchain Service] AgriTraceSupplyChain initialized on EVM at: ${activeContractAddress}`);
      return activeContractAddress;
    }
  } catch (err: any) {
    console.warn('[Blockchain Service] Contract deploy check notice:', err?.message);
  }

  return activeContractAddress;
}

/**
 * Returns a read-only contract instance connected via Node.js
 */
export async function getBackendContract(): Promise<Contract | null> {
  const abi = getContractAbi();
  if (!abi) return null;

  try {
    const provider = await getActiveProvider();
    const address = getContractAddress();
    return new Contract(address, abi, provider);
  } catch (err) {
    console.warn('[Blockchain Service] Provider init notice:', err);
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
 * Role hash mappings
 */
export const ROLE_HASHES: Record<string, string> = {
  FARMER: ethers.keccak256(ethers.toUtf8Bytes('FARMER_ROLE')),
  DISTRIBUTOR: ethers.keccak256(ethers.toUtf8Bytes('DISTRIBUTOR_ROLE')),
  RETAILER: ethers.keccak256(ethers.toUtf8Bytes('RETAILER_ROLE')),
  ADMIN: ethers.ZeroHash,
};

/**
 * Checks if an account has a given role on-chain
 */
export async function checkRoleOnChain(accountAddress: string, roleName: string): Promise<boolean> {
  const contract = await getBackendContract();
  if (!contract) return true; // optimistic if offline

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
 * Grants an on-chain role using the admin signer
 */
export async function grantRoleOnChain(accountAddress: string, roleName: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const { abi } = loadArtifact();
    if (!adminSigner || !abi) {
      await ensureContractDeployed();
    }
    if (!adminSigner) {
      return { success: false, error: 'Admin signer is not available on this provider.' };
    }

    const normalized = roleName.toUpperCase().replace('_ROLE', '');
    const roleHash = ROLE_HASHES[normalized];
    if (!roleHash) {
      return { success: false, error: `Unknown role: ${roleName}` };
    }

    const contract = new Contract(activeContractAddress, abi, adminSigner);
    const tx = await contract.grantRole(roleHash, accountAddress);
    const receipt = await tx.wait(1);

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (err: any) {
    console.error(`[Blockchain Service] grantRole failed:`, err);
    return { success: false, error: err?.message || 'Failed to grant on-chain role.' };
  }
}

/**
 * Fetches authoritative batch data from smart contract
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
      distributor: raw.distributor,
      retailer: raw.retailer,
      status: Number(raw.status),
      lastPricePerKg: raw.lastPricePerKg.toString(),
      createdAt: Number(raw.createdAt),
      lastUpdatedAt: Number(raw.lastUpdatedAt),
    };
  } catch (err: any) {
    console.warn(`[Blockchain Service] getOnChainBatch failed for ${batchId}:`, err?.message);
    return null;
  }
}

/**
 * Fetches on-chain price history
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
      updatedBy: item.updatedBy,
      timestamp: Number(item.timestamp),
    }));
  } catch (err: any) {
    console.warn(`[Blockchain Service] getOnChainPriceHistory failed for ${batchId}:`, err?.message);
    return [];
  }
}

/**
 * Fetches on-chain provenance records
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
    console.warn(`[Blockchain Service] getOnChainProvenanceHistory failed for ${batchId}:`, err?.message);
    return [];
  }
}

/**
 * Verifies if a given MongoDB product matches the authoritative on-chain contract state
 */
export async function verifyProductAgainstBlockchain(product: any) {
  if (!product || !product.batchId) {
    return { isVerified: false, reason: 'Missing product or batchId' };
  }

  const onChain = await getOnChainBatch(product.batchId);
  if (!onChain) {
    return {
      isVerified: false,
      reason: 'Batch not found on smart contract ledger',
      onChain: null,
    };
  }

  // Authoritative validation
  const mismatches: string[] = [];
  if (onChain.cropName.toLowerCase() !== (product.cropName || product.name || '').toLowerCase()) {
    mismatches.push(`Crop name mismatch: on-chain "${onChain.cropName}" vs DB "${product.cropName || product.name}"`);
  }

  return {
    isVerified: mismatches.length === 0,
    mismatches,
    onChain,
    contractAddress: getContractAddress(),
  };
}
