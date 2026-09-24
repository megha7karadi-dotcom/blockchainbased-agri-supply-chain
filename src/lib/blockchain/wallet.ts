import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import { WalletState } from './types';
import { SUPPORTED_NETWORKS } from './config';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Checks if MetaMask or an EIP-1193 compatible provider is present
 */
export function isMetaMaskAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
}

/**
 * Returns a BrowserProvider if window.ethereum exists
 */
export function getBrowserProvider(): BrowserProvider | null {
  if (!isMetaMaskAvailable()) return null;
  return new ethers.BrowserProvider(window.ethereum);
}

/**
 * Requests wallet connection from MetaMask
 */
export async function connectWallet(): Promise<{
  address: string;
  chainId: number;
  networkName: string;
  signer: JsonRpcSigner;
}> {
  if (!isMetaMaskAvailable()) {
    throw new Error(
      'MetaMask or Web3 wallet was not detected in your browser. Please install MetaMask to perform authoritative on-chain transactions.'
    );
  }

  const provider = getBrowserProvider()!;

  // Request user account access
  const accounts: string[] = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No Ethereum accounts were authorized by the user.');
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);
  const networkName = SUPPORTED_NETWORKS[chainId] || network.name || `Chain ID ${chainId}`;

  return {
    address,
    chainId,
    networkName,
    signer,
  };
}

/**
 * Gets currently active account without requesting prompt if already authorized
 */
export async function getActiveWallet(): Promise<{
  address: string | null;
  chainId: number | null;
  networkName: string | null;
}> {
  if (!isMetaMaskAvailable()) {
    return { address: null, chainId: null, networkName: null };
  }

  try {
    const provider = getBrowserProvider()!;
    const accounts: string[] = await window.ethereum.request({
      method: 'eth_accounts',
    });

    if (!accounts || accounts.length === 0) {
      return { address: null, chainId: null, networkName: null };
    }

    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    const networkName = SUPPORTED_NETWORKS[chainId] || network.name || `Chain ID ${chainId}`;

    return {
      address: accounts[0],
      chainId,
      networkName,
    };
  } catch (err) {
    console.warn('Failed to query active wallet:', err);
    return { address: null, chainId: null, networkName: null };
  }
}

/**
 * Subscribes to wallet events (accountsChanged, chainChanged)
 */
export function subscribeToWalletEvents(callbacks: {
  onAccountsChanged?: (accounts: string[]) => void;
  onChainChanged?: (chainIdHex: string) => void;
  onDisconnect?: () => void;
}): () => void {
  if (!isMetaMaskAvailable()) {
    return () => {};
  }

  const eth = window.ethereum;

  const handleAccounts = (accounts: string[]) => {
    callbacks.onAccountsChanged?.(accounts);
  };

  const handleChain = (chainIdHex: string) => {
    callbacks.onChainChanged?.(chainIdHex);
  };

  const handleDisconnect = () => {
    callbacks.onDisconnect?.();
  };

  eth.on?.('accountsChanged', handleAccounts);
  eth.on?.('chainChanged', handleChain);
  eth.on?.('disconnect', handleDisconnect);

  return () => {
    eth.removeListener?.('accountsChanged', handleAccounts);
    eth.removeListener?.('chainChanged', handleChain);
    eth.removeListener?.('disconnect', handleDisconnect);
  };
}
