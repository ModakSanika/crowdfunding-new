'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  formatEther: (value: ethers.BigNumber) => string;
  parseEther: (value: string) => ethers.BigNumber;
  getAddress: (address: string) => string;
}

const defaultContext: Web3ContextType = {
  provider: null,
  signer: null,
  contract: null,
  address: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  formatEther: (value: ethers.BigNumber) => value.toString(),
  parseEther: (value: string) => ethers.BigNumber.from(0),
  getAddress: (address: string) => address,
};

const Web3Context = createContext<Web3ContextType>(defaultContext);

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask to use this application');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setIsConnected(true);

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAddress(accounts[0]);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      toast.success('Connected to MetaMask');
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      toast.error('Failed to connect to MetaMask');
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAddress(null);
    setIsConnected(false);
    toast.success('Disconnected from MetaMask');
  };

  const formatEther = (value: ethers.BigNumber) => {
    return ethers.utils.formatEther(value);
  };

  const parseEther = (value: string) => {
    return ethers.utils.parseEther(value);
  };

  const getAddress = (address: string) => {
    return ethers.utils.getAddress(address);
  };

  useEffect(() => {
    // Check if already connected
    if (window.ethereum) {
      const checkConnection = async () => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            setProvider(provider);
            setSigner(signer);
            setAddress(address);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      };
      checkConnection();
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        address,
        isConnected,
        connect,
        disconnect,
        formatEther,
        parseEther,
        getAddress,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}; 