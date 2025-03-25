import { ethers } from 'ethers';
import { Project, Backer } from '../types';

export const CROWDFUNDING_CONTRACT_ABI = [
  'function createProject(string title, string description, uint256 fundingGoal, uint256 deadline, string imageUrl, string category) public returns (uint256)',
  'function fundProject(uint256 projectId) public payable',
  'function withdrawFunds(uint256 projectId) public',
  'function getProject(uint256 projectId) public view returns (tuple(uint256 id, string title, string description, uint256 fundingGoal, uint256 currentFunding, uint256 deadline, address creator, string imageUrl, string category, string status, uint256 createdAt))',
  'function getProjects() public view returns (tuple(uint256 id, string title, string description, uint256 fundingGoal, uint256 currentFunding, uint256 deadline, address creator, string imageUrl, string category, string status, uint256 createdAt)[])',
  'function getBackers(uint256 projectId) public view returns (tuple(address address, uint256 amount, uint256 timestamp)[])',
  'function isProjectExpired(uint256 projectId) public view returns (bool)',
  'function isProjectCompleted(uint256 projectId) public view returns (bool)',
  'function isProjectCreator(uint256 projectId, address account) public view returns (bool)',
  'function isProjectBacker(uint256 projectId, address account) public view returns (bool)',
  'event ProjectCreated(uint256 indexed projectId, string title, address indexed creator)',
  'event ProjectFunded(uint256 indexed projectId, address indexed backer, uint256 amount)',
  'event FundsWithdrawn(uint256 indexed projectId, address indexed creator)',
];

export const CROWDFUNDING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export class CrowdfundingContract {
  private contract: ethers.Contract;

  constructor(signer: ethers.Signer) {
    this.contract = new ethers.Contract(
      CROWDFUNDING_CONTRACT_ADDRESS,
      CROWDFUNDING_CONTRACT_ABI,
      signer
    );
  }

  async createProject(
    title: string,
    description: string,
    fundingGoal: ethers.BigNumber,
    deadline: ethers.BigNumber,
    imageUrl: string,
    category: string
  ): Promise<number> {
    const tx = await this.contract.createProject(
      title,
      description,
      fundingGoal,
      deadline,
      imageUrl,
      category
    );
    const receipt = await tx.wait();
    const event = receipt.events?.find((e: any) => e.event === 'ProjectCreated');
    return event?.args?.projectId.toNumber() || 0;
  }

  async fundProject(projectId: number, amount: ethers.BigNumber): Promise<void> {
    const tx = await this.contract.fundProject(projectId, { value: amount });
    await tx.wait();
  }

  async withdrawFunds(projectId: number): Promise<void> {
    const tx = await this.contract.withdrawFunds(projectId);
    await tx.wait();
  }

  async getProject(projectId: number): Promise<Project> {
    const project = await this.contract.getProject(projectId);
    return {
      id: project.id.toNumber(),
      title: project.title,
      description: project.description,
      fundingGoal: project.fundingGoal,
      currentFunding: project.currentFunding,
      deadline: project.deadline,
      creator: project.creator,
      imageUrl: project.imageUrl,
      category: project.category,
      status: project.status,
      createdAt: project.createdAt,
    };
  }

  async getProjects(): Promise<Project[]> {
    const projects = await this.contract.getProjects();
    return projects.map((project: any) => ({
      id: project.id.toNumber(),
      title: project.title,
      description: project.description,
      fundingGoal: project.fundingGoal,
      currentFunding: project.currentFunding,
      deadline: project.deadline,
      creator: project.creator,
      imageUrl: project.imageUrl,
      category: project.category,
      status: project.status,
      createdAt: project.createdAt,
    }));
  }

  async getBackers(projectId: number): Promise<Backer[]> {
    const backers = await this.contract.getBackers(projectId);
    return backers.map((backer: any) => ({
      address: backer.address,
      amount: backer.amount,
      timestamp: backer.timestamp,
    }));
  }

  async isProjectExpired(projectId: number): Promise<boolean> {
    return await this.contract.isProjectExpired(projectId);
  }

  async isProjectCompleted(projectId: number): Promise<boolean> {
    return await this.contract.isProjectCompleted(projectId);
  }

  async isProjectCreator(projectId: number, account: string): Promise<boolean> {
    return await this.contract.isProjectCreator(projectId, account);
  }

  async isProjectBacker(projectId: number, account: string): Promise<boolean> {
    return await this.contract.isProjectBacker(projectId, account);
  }
} 