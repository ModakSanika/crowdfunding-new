import { ethers } from 'ethers';

export interface Project {
  id: number;
  title: string;
  description: string;
  fundingGoal: ethers.BigNumber;
  currentFunding: ethers.BigNumber;
  deadline: ethers.BigNumber;
  creator: string;
  imageUrl: string;
  category: string;
  status: 'active' | 'completed' | 'expired';
  createdAt: ethers.BigNumber;
}

export interface Backer {
  address: string;
  amount: ethers.BigNumber;
  timestamp: ethers.BigNumber;
}

export interface ProjectFormData {
  title: string;
  description: string;
  fundingGoal: string;
  deadline: string;
  imageUrl: string;
  category: string;
}

export interface FundingFormData {
  amount: string;
}

export interface Web3ContextType {
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