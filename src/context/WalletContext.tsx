import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  connectWallet, 
  getActiveWallet, 
  isMetaMaskAvailable, 
  subscribeToWalletEvents,
  switchToSepoliaNetwork,
  isSepoliaNetwork,
  SEPOLIA_CHAIN_ID
} from '../lib/blockchain/wallet';
import { 
  getContractAddress, 
  setCustomContractAddress,
  isContractConfigured,
  isValidAddress
} from '../lib/blockchain/config';
import { WalletState } from '../lib/blockchain/types';

interface WalletContextType {
  wallet: WalletState;
  isMetaMaskInstalled: boolean;
  isSepolia: boolean;
  contractAddress: string;
  isContractReady: boolean;
  updateContractAddress: (address: string) => Promise<boolean>;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToSepolia: () => Promise<boolean>;
  lastTx: {
    hash: string | null;
    status: 'idle' | 'pending' | 'success' | 'error';
    actionName?: string;
    errorMessage?: string;
    blockNumber?: number;
  };
  setTransactionPending: (actionName: string) => void;
  setTransactionSuccess: (hash: string, blockNumber: number, actionName: string) => void;
  setTransactionError: (errorMsg: string, actionName: string) => void;
  clearLastTx: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    networkName: null,
    isSepolia: false,
    isConnecting: false,
    error: null,
  });

  const [contractAddress, setContractAddr] = useState<string>(getContractAddress());
  const isMetaMaskInstalled = isMetaMaskAvailable();

  const [lastTx, setLastTx] = useState<{
    hash: string | null;
    status: 'idle' | 'pending' | 'success' | 'error';
    actionName?: string;
    errorMessage?: string;
    blockNumber?: number;
  }>({
    hash: null,
    status: 'idle',
  });

  // Sync contract address from backend /api/blockchain/info if available
  useEffect(() => {
    fetch('/api/blockchain/info')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.contractAddress && isValidAddress(data.contractAddress)) {
          const current = getContractAddress();
          if (!current || !isValidAddress(current)) {
            localStorage.setItem('agritrace_custom_contract_address', data.contractAddress);
            setContractAddr(data.contractAddress);
          }
        }
      })
      .catch(err => console.warn('[WalletContext] Backend info notice:', err));
  }, []);

  // Check if wallet is already connected
  const checkActiveConnection = useCallback(async () => {
    if (!isMetaMaskInstalled) return;
    try {
      const active = await getActiveWallet();
      if (active.address) {
        setWallet({
          isConnected: true,
          address: active.address,
          chainId: active.chainId,
          networkName: active.networkName,
          isSepolia: active.isSepolia,
          isConnecting: false,
          error: null,
        });
      }
    } catch (err) {
      console.warn('Wallet check err:', err);
    }
  }, [isMetaMaskInstalled]);

  useEffect(() => {
    checkActiveConnection();

    // Subscribe to MetaMask account or chain changes
    const unsubscribe = subscribeToWalletEvents({
      onAccountsChanged: (accounts) => {
        if (!accounts || accounts.length === 0) {
          setWallet({
            isConnected: false,
            address: null,
            chainId: null,
            networkName: null,
            isSepolia: false,
            isConnecting: false,
            error: null,
          });
        } else {
          setWallet(prev => ({
            ...prev,
            isConnected: true,
            address: accounts[0],
            error: null,
          }));
        }
      },
      onChainChanged: (chainIdHex) => {
        const chainId = parseInt(chainIdHex, 16);
        const isSepolia = chainId === SEPOLIA_CHAIN_ID;
        setWallet(prev => ({
          ...prev,
          chainId,
          isSepolia,
          networkName: isSepolia ? 'Ethereum Sepolia Testnet' : `Chain ID ${chainId}`,
        }));
        checkActiveConnection();
      },
      onDisconnect: () => {
        setWallet({
          isConnected: false,
          address: null,
          chainId: null,
          networkName: null,
          isSepolia: false,
          isConnecting: false,
          error: null,
        });
      },
    });

    return () => {
      unsubscribe();
    };
  }, [checkActiveConnection]);

  const connect = async () => {
    if (!isMetaMaskInstalled) {
      setWallet(prev => ({
        ...prev,
        error: 'MetaMask extension is not installed in your browser. Please install MetaMask to interact with the Sepolia smart contract.',
      }));
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));
    try {
      const conn = await connectWallet();
      setWallet({
        isConnected: true,
        address: conn.address,
        chainId: conn.chainId,
        networkName: conn.networkName,
        isSepolia: conn.isSepolia,
        isConnecting: false,
        error: null,
      });
    } catch (err: any) {
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: err?.message || 'Failed to connect MetaMask.',
      }));
      throw err;
    }
  };

  const switchToSepolia = async (): Promise<boolean> => {
    try {
      const switched = await switchToSepoliaNetwork();
      if (switched) {
        await checkActiveConnection();
      }
      return switched;
    } catch (err: any) {
      setWallet(prev => ({
        ...prev,
        error: err.message || 'Failed to switch network to Sepolia.',
      }));
      return false;
    }
  };

  const disconnect = () => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      networkName: null,
      isSepolia: false,
      isConnecting: false,
      error: null,
    });
  };

  const updateContractAddress = async (address: string): Promise<boolean> => {
    const trimmed = (address || '').trim();
    if (!isValidAddress(trimmed)) {
      throw new Error('Please enter a valid Ethereum contract address (42 characters hex starting with 0x).');
    }
    await setCustomContractAddress(trimmed);
    setContractAddr(trimmed);
    return true;
  };

  const setTransactionPending = (actionName: string) => {
    setLastTx({
      hash: null,
      status: 'pending',
      actionName,
    });
  };

  const setTransactionSuccess = (hash: string, blockNumber: number, actionName: string) => {
    setLastTx({
      hash,
      blockNumber,
      status: 'success',
      actionName,
    });
  };

  const setTransactionError = (errorMsg: string, actionName: string) => {
    setLastTx({
      hash: null,
      status: 'error',
      actionName,
      errorMessage: errorMsg,
    });
  };

  const clearLastTx = () => {
    setLastTx({ hash: null, status: 'idle' });
  };

  const isContractReady = isValidAddress(contractAddress);
  const isSepolia = Boolean(wallet.isSepolia || (wallet.chainId && Number(wallet.chainId) === SEPOLIA_CHAIN_ID));

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isMetaMaskInstalled,
        isSepolia,
        contractAddress,
        isContractReady,
        updateContractAddress,
        connect,
        disconnect,
        switchToSepolia,
        lastTx,
        setTransactionPending,
        setTransactionSuccess,
        setTransactionError,
        clearLastTx,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
