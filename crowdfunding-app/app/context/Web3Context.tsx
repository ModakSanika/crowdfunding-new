import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

interface Web3ContextType {
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  formatEther: (value: ethers.BigNumber) => string;
  parseEther: (value: string) => ethers.BigNumber;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  contract: null,
  connect: async () => {},
  disconnect: () => {},
  formatEther: () => '',
  parseEther: () => ethers.BigNumber.from(0),
});

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  "function createProject(string _title, string _description, uint256 _fundingGoal, uint256 _deadline, string _imageUrl, string _category) public returns (uint256)",
  "function getProjects() public view returns (tuple(uint256 id, string title, string description, uint256 fundingGoal, uint256 currentFunding, uint256 deadline, string imageUrl, string category, address creator, bool isFunded, bool isExpired)[])",
  "function getProject(uint256 _projectId) public view returns (tuple(uint256 id, string title, string description, uint256 fundingGoal, uint256 currentFunding, uint256 deadline, string imageUrl, string category, address creator, bool isFunded, bool isExpired))",
  "function fundProject(uint256 _projectId) public payable",
  "function withdrawFunds(uint256 _projectId) public",
  "function getBackers(uint256 _projectId) public view returns (tuple(address backerAddress, uint256 amount, uint256 timestamp)[])",
  "function isProjectCreator(uint256 _projectId) public view returns (bool)",
  "function isProjectBacker(uint256 _projectId) public view returns (bool)"
];

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const connect = async () => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask to use this application');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS!, CONTRACT_ABI, signer);

      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setContract(contract);

      // Check if we're on the correct network
      const network = await provider.getNetwork();
      if (network.chainId !== 1337) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }], // 1337 in hex
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x539',
                chainName: 'Ganache',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['http://127.0.0.1:7545'],
                blockExplorerUrls: []
              }]
            });
          } else {
            throw switchError;
          }
        }
      }

      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    toast.success('Wallet disconnected');
  };

  const formatEther = (value: ethers.BigNumber) => {
    return ethers.utils.formatEther(value);
  };

  const parseEther = (value: string) => {
    return ethers.utils.parseEther(value);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        contract,
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