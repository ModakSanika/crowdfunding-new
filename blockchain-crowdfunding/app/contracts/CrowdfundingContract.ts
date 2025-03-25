import { ethers } from 'ethers';
import { Project, Backer } from '../types';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  'function createProject(string title, string description, uint256 fundingGoal, uint256 deadline, string imageUrl, string category) public returns (uint256)',
  'function getProjects() public view returns (tuple(uint256 id, string title, string description, uint256 fundingGoal, uint256 currentFunding, uint256 deadline, string imageUrl, string category, address creator, bool isFunded, bool isExpired)[])',
  'function getProject(uint256 projectId) public view returns (tuple(uint256 id, string title, string description, uint256 fundingGoal, uint256 currentFunding, uint256 deadline, string imageUrl, string category, address creator, bool isFunded, bool isExpired))',
  'function fundProject(uint256 projectId) public payable',
  'function withdrawFunds(uint256 projectId) public',
  'function getBackers(uint256 projectId) public view returns (tuple(address address, uint256 amount, uint256 timestamp)[])',
  'function isProjectCreator(uint256 projectId) public view returns (bool)',
  'function isProjectBacker(uint256 projectId) public view returns (bool)',
];

export class CrowdfundingContract {
  private contract: ethers.Contract;

  constructor(signer: ethers.Signer) {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not found in environment variables');
    }
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }

  async createProject(
    title: string,
    description: string,
    fundingGoal: ethers.BigNumber,
    deadline: number,
    imageUrl: string,
    category: string
  ): Promise<ethers.ContractTransaction> {
    return await this.contract.createProject(
      title,
      description,
      fundingGoal,
      deadline,
      imageUrl,
      category
    );
  }

  async getProjects(): Promise<Project[]> {
    try {
      const projects = await this.contract.getProjects();
      console.log('Raw projects data:', projects); // Debug log
      
      return projects.map((project: any) => {
        console.log('Processing project:', project); // Debug log
        return {
          id: project.id || ethers.BigNumber.from(0),
          title: project.title || '',
          description: project.description || '',
          fundingGoal: project.fundingGoal || ethers.BigNumber.from(0),
          currentFunding: project.currentFunding || ethers.BigNumber.from(0),
          deadline: project.deadline || ethers.BigNumber.from(0),
          imageUrl: project.imageUrl || '',
          category: project.category || '',
          creator: project.creator || '',
          isFunded: project.isFunded || false,
          isExpired: project.isExpired || false,
        };
      });
    } catch (error) {
      console.error('Error in getProjects:', error);
      throw error;
    }
  }

  async getProject(projectId: number): Promise<Project> {
    const project = await this.contract.getProject(projectId);
    return {
      id: project.id,
      title: project.title,
      description: project.description,
      fundingGoal: project.fundingGoal,
      currentFunding: project.currentFunding,
      deadline: project.deadline,
      imageUrl: project.imageUrl,
      category: project.category,
      creator: project.creator,
      isFunded: project.isFunded,
      isExpired: project.isExpired,
    };
  }

  async fundProject(projectId: number, amount: ethers.BigNumber): Promise<void> {
    const tx = await this.contract.fundProject(projectId, { value: amount });
    await tx.wait();
  }

  async withdrawFunds(projectId: number): Promise<void> {
    const tx = await this.contract.withdrawFunds(projectId);
    await tx.wait();
  }

  async getBackers(projectId: number): Promise<Backer[]> {
    const backers = await this.contract.getBackers(projectId);
    return backers.map((backer: any) => ({
      address: backer.address,
      amount: backer.amount,
      timestamp: backer.timestamp,
    }));
  }

  async isProjectCreator(projectId: number): Promise<boolean> {
    return await this.contract.isProjectCreator(projectId);
  }

  async isProjectBacker(projectId: number): Promise<boolean> {
    return await this.contract.isProjectBacker(projectId);
  }
} 