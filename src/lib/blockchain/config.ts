/**
 * AgriTrace Blockchain Configuration - Ethereum Sepolia Testnet
 * Reads contract address and network configurations from environment.
 * NEVER hardcodes private keys or secrets.
 */

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';
export const SEPOLIA_NETWORK_NAME = 'Ethereum Sepolia Testnet';
export const SEPOLIA_EXPLORER_URL = 'https://sepolia.etherscan.io';

// Known standard networks
export const SUPPORTED_NETWORKS: Record<number, string> = {
  11155111: 'Ethereum Sepolia Testnet',
  1: 'Ethereum Mainnet',
  1337: 'Local Dev (Ganache/Hardhat)',
  31337: 'Local Dev (Anvil/Hardhat)',
};

// No fake/placeholder contract address
export const DEFAULT_CONTRACT_ADDRESS = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AGRITRACE_CONTRACT_ADDRESS) || '0x110D36B8FA4FAc2Fc214c1F341261BA6654a57Ef';

export const DEFAULT_RPC_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BLOCKCHAIN_RPC_URL) ||
  'https://ethereum-sepolia-rpc.publicnode.com';

export function getRpcUrl(): string {
  return (
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BLOCKCHAIN_RPC_URL) ||
    DEFAULT_RPC_URL
  );
}

export function isValidAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  const trimmed = address.trim();
  return trimmed.startsWith('0x') && trimmed.length === 42 && /^0x[a-fA-F0-9]{40}$/.test(trimmed);
}

export function isContractConfigured(): boolean {
  const address = getContractAddress();
  return isValidAddress(address);
}

export function getContractAddress(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('agritrace_custom_contract_address');
    if (isValidAddress(custom)) {
      return custom!.trim();
    }
  }
  const envAddr = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_AGRITRACE_CONTRACT_ADDRESS : '';
  if (isValidAddress(envAddr)) {
    return envAddr.trim();
  }
  return DEFAULT_CONTRACT_ADDRESS;
}

export async function setCustomContractAddress(address: string): Promise<boolean> {
  const trimmed = address.trim();
  if (!isValidAddress(trimmed)) {
    throw new Error('Invalid Ethereum contract address. Must be a 42-character hex string starting with 0x.');
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('agritrace_custom_contract_address', trimmed);
    
    // Sync with backend so frontend and backend share the exact same address
    try {
      await fetch('/api/blockchain/contract-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress: trimmed })
      });
    } catch (err) {
      console.warn('[Blockchain Config] Backend sync notice:', err);
    }
  }

  return true;
}

/**
 * Returns representative or configured wallet addresses for supply-chain participants
 */
export function getStakeholderWallet(role: 'farmer' | 'distributor' | 'retailer'): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`agritrace_wallet_${role}`);
    if (isValidAddress(stored)) {
      return stored!.trim();
    }
  }
  
  switch (role) {
    case 'farmer':
      return '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    case 'distributor':
      return '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';
    case 'retailer':
      return '0x90F79bf6EB2c4f870365E785982E1f101E93b906';
    default:
      return '0x0000000000000000000000000000000000000000';
  }
}
