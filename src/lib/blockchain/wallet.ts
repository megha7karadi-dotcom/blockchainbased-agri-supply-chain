import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import { WalletState } from './types';
import { 
  SUPPORTED_NETWORKS, 
  SEPOLIA_CHAIN_ID, 
  SEPOLIA_CHAIN_ID_HEX,
  SEPOLIA_NETWORK_NAME,
  SEPOLIA_EXPLORER_URL,
  DEFAULT_RPC_URL
} from './config';

export { SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_HEX };

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
 * Checks whether the given chainId corresponds to Ethereum Sepolia (11155111)
 */
export function isSepoliaNetwork(chainId: bigint | number | string | null | undefined): boolean {
  if (chainId === null || chainId === undefined) return false;
  if (typeof chainId === 'string' && chainId.startsWith('0x')) {
    return parseInt(chainId, 16) === SEPOLIA_CHAIN_ID;
  }
  return Number(chainId) === SEPOLIA_CHAIN_ID;
}

/**
 * Prompts MetaMask to switch to Ethereum Sepolia Testnet (Chain ID 11155111).
 * If Sepolia is not configured in MetaMask, requests to add it.
 */
export async function switchToSepoliaNetwork(): Promise<boolean> {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask is not available.');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
    return true;
  } catch (switchError: any) {
    // 4902 indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID_HEX,
              chainName: SEPOLIA_NETWORK_NAME,
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [DEFAULT_RPC_URL],
              blockExplorerUrls: [SEPOLIA_EXPLORER_URL],
            },
          ],
        });
        return true;
      } catch (addError: any) {
        throw new Error(`Failed to add Sepolia network to MetaMask: ${addError.message}`);
      }
    }
    throw new Error(`Failed to switch to Sepolia network: ${switchError.message}`);
  }
}

/**
 * Requests wallet connection from MetaMask and detects Sepolia network
 */
export async function connectWallet(): Promise<{
  address: string;
  chainId: number;
  networkName: string;
  isSepolia: boolean;
  signer: JsonRpcSigner;
}> {
  if (!isMetaMaskAvailable()) {
    throw new Error(
      'MetaMask was not detected in your browser. Please install the MetaMask extension to sign transactions on Ethereum Sepolia.'
    );
  }

  const provider = getBrowserProvider()!;

  // Request user account authorization
  const accounts: string[] = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No Ethereum account was authorized in MetaMask.');
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);
  const isSepolia = chainId === SEPOLIA_CHAIN_ID;
  const networkName = SUPPORTED_NETWORKS[chainId] || (isSepolia ? 'Ethereum Sepolia Testnet' : network.name || `Chain ID ${chainId}`);

  // Automatically attempt switch to Sepolia if connected to another network
  if (!isSepolia) {
    try {
      await switchToSepoliaNetwork();
      const updatedNetwork = await provider.getNetwork();
      const updatedChainId = Number(updatedNetwork.chainId);
      return {
        address,
        chainId: updatedChainId,
        networkName: SUPPORTED_NETWORKS[updatedChainId] || 'Ethereum Sepolia Testnet',
        isSepolia: updatedChainId === SEPOLIA_CHAIN_ID,
        signer,
      };
    } catch (switchErr: any) {
      console.warn('[Wallet] Auto-switch to Sepolia deferred:', switchErr.message);
    }
  }

  return {
    address,
    chainId,
    networkName,
    isSepolia,
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
  isSepolia: boolean;
}> {
  if (!isMetaMaskAvailable()) {
    return { address: null, chainId: null, networkName: null, isSepolia: false };
  }

  try {
    const provider = getBrowserProvider()!;
    const accounts: string[] = await window.ethereum.request({
      method: 'eth_accounts',
    });

    if (!accounts || accounts.length === 0) {
      return { address: null, chainId: null, networkName: null, isSepolia: false };
    }

    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    const isSepolia = chainId === SEPOLIA_CHAIN_ID;
    const networkName = SUPPORTED_NETWORKS[chainId] || (isSepolia ? 'Ethereum Sepolia Testnet' : network.name || `Chain ID ${chainId}`);

    return {
      address: accounts[0],
      chainId,
      networkName,
      isSepolia,
    };
  } catch (err) {
    console.warn('Failed to query active wallet:', err);
    return { address: null, chainId: null, networkName: null, isSepolia: false };
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
