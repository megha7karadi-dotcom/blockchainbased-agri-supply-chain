/**
 * AgriTrace Blockchain Configuration
 * Reads contract address and network configurations from environment.
 * NEVER hardcodes private keys or secrets.
 */

// Known standard networks
export const SUPPORTED_NETWORKS: Record<number, string> = {
  1337: 'Local Dev (Ganache/Hardhat)',
  31337: 'Local Dev (Anvil/Hardhat)',
  11155111: 'Ethereum Sepolia Testnet',
  80002: 'Polygon Amoy Testnet',
  1: 'Ethereum Mainnet',
};

// Default fallback contract address if not specified in environment
// Can be set via VITE_AGRITRACE_CONTRACT_ADDRESS in .env
export const DEFAULT_CONTRACT_ADDRESS = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AGRITRACE_CONTRACT_ADDRESS) ||
  '0x95446f5Cda059dE75D9d0bc0d7388B3FA416deEF';

export const DEFAULT_RPC_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BLOCKCHAIN_RPC_URL) ||
  'http://127.0.0.1:8545';

export function getRpcUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/blockchain/rpc`;
  }
  return DEFAULT_RPC_URL;
}

export function getContractAddress(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('agritrace_custom_contract_address');
    if (custom && custom.startsWith('0x') && custom.length === 42) {
      return custom;
    }
  }
  return (
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AGRITRACE_CONTRACT_ADDRESS) ||
    DEFAULT_CONTRACT_ADDRESS
  );
}

export function setCustomContractAddress(address: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('agritrace_custom_contract_address', address);
  }
}

/**
 * Returns representative or configured wallet addresses for supply-chain participants
 */
export function getStakeholderWallet(role: 'farmer' | 'distributor' | 'retailer'): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`agritrace_wallet_${role}`);
    if (stored && stored.startsWith('0x') && stored.length === 42) {
      return stored;
    }
  }
  
  // Standard testnet / local addresses corresponding to roles
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
