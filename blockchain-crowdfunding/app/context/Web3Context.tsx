'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

interface Web3ContextType {
  isConnected: boolean;
  signer: ethers.Signer | null;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  formatEther: (value: ethers.BigNumber) => string;
  parseEther: (value: string) => ethers.BigNumber;
}

export const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  signer: null,
  address: null,
  connect: async () => {},
  disconnect: () => {},
  formatEther: (value) => value.toString(),
  parseEther: (value) => ethers.BigNumber.from(value),
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = provider.getSigner();
          setSigner(signer);
          setAddress(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connect = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Create provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Get network
        const network = await provider.getNetwork();
        console.log("Connected to network:", network);

        // Switch to Truffle development network if needed
        if (network.chainId !== 1337) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x539' }], // 1337 in hex
            });
          } catch (switchError: any) {
            // If Truffle network is not added, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x539',
                  chainName: 'Truffle Development',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['http://127.0.0.1:9545'],
                  blockExplorerUrls: []
                }]
              });
            } else {
              throw switchError;
            }
          }
        }

        // Get signer and address
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        console.log("Connected with address:", address);
        setSigner(signer);
        setAddress(address);
        setIsConnected(true);

        toast.success("Wallet connected successfully");
      } catch (error: any) {
        console.error('Error connecting:', error);
        toast.error(error.message || "Failed to connect wallet");
      }
    } else {
      toast.error("Please install MetaMask");
    }
  };

  const disconnect = () => {
    setSigner(null);
    setAddress(null);
    setIsConnected(false);
    toast.success("Wallet disconnected");
  };

  const formatEther = (value: ethers.BigNumber) => {
    return ethers.utils.formatEther(value);
  };

  const parseEther = (value: string) => {
    return ethers.utils.parseEther(value);
  };

  return (
    <Web3Context.Provider
      value={{
        isConnected,
        signer,
        address,
        connect,
        disconnect,
        formatEther,
        parseEther,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
} 