import { BigNumber } from 'ethers';

export interface Project {
  id: BigNumber;
  title: string;
  description: string;
  fundingGoal: BigNumber;
  currentFunding: BigNumber;
  deadline: BigNumber;
  imageUrl: string;
  category: string;
  creator: string;
  isFunded: boolean;
  isExpired: boolean;
}

export interface Backer {
  backerAddress: string;
  amount: BigNumber;
  timestamp: BigNumber;
} 