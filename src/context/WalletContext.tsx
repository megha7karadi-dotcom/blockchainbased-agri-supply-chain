import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  connectWallet, 
  getActiveWallet, 
  isMetaMaskAvailable, 
  subscribeToWalletEvents 
} from '../lib/blockchain/wallet';
import { getContractAddress, setCustomContractAddress } from '../lib/blockchain/config';
import { WalletState } from '../lib/blockchain/types';

interface WalletContextType {
  wallet: WalletState;
  isMetaMaskInstalled: boolean;
  contractAddress: string;
  updateContractAddress: (address: string) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
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
      onChainChanged: () => {
        // Re-check wallet state on chain change
        checkActiveConnection();
      },
      onDisconnect: () => {
        setWallet({
          isConnected: false,
          address: null,
          chainId: null,
          networkName: null,
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
        error: 'MetaMask extension is not installed in your browser. Please install MetaMask to interact with the smart contract.',
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
        isConnecting: false,
        error: null,
      });
    } catch (err: any) {
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: err?.message || 'Failed to connect wallet.',
      }));
      throw err;
    }
  };

  const disconnect = () => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      networkName: null,
      isConnecting: false,
      error: null,
    });
  };

  const updateContractAddress = (address: string) => {
    if (address && address.startsWith('0x') && address.length === 42) {
      setCustomContractAddress(address);
      setContractAddr(address);
    }
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

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isMetaMaskInstalled,
        contractAddress,
        updateContractAddress,
        connect,
        disconnect,
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
