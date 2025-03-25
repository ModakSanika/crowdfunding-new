'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '../../components/Layout';
import { useWeb3 } from '../../context/Web3Context';
import { Project, Backer } from '../../types';
import { CrowdfundingContract } from '../../contracts/CrowdfundingContract';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const params = useParams();
  const { isConnected, signer, formatEther, parseEther, address } = useWeb3();
  const [project, setProject] = useState<Project | null>(null);
  const [backers, setBackers] = useState<Backer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFunding, setIsFunding] = useState(false);
  const [fundingAmount, setFundingAmount] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [isBacker, setIsBacker] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (!signer || !params.id) return;
        const contract = new CrowdfundingContract(signer);
        const projectId = parseInt(params.id as string);
        
        const [projectData, backersData, creatorCheck, backerCheck] = await Promise.all([
          contract.getProject(projectId),
          contract.getBackers(projectId),
          contract.isProjectCreator(projectId, address || ''),
          contract.isProjectBacker(projectId, address || ''),
        ]);

        setProject(projectData);
        setBackers(backersData);
        setIsCreator(creatorCheck);
        setIsBacker(backerCheck);
      } catch (error) {
        console.error('Error fetching project data:', error);
        toast.error('Failed to fetch project data');
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected && signer) {
      fetchProjectData();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, signer, params.id, address]);

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !signer || !project) return;

    setIsFunding(true);
    try {
      const contract = new CrowdfundingContract(signer);
      const amount = parseEther(fundingAmount);
      await contract.fundProject(project.id, amount);
      toast.success('Project funded successfully!');
      // Refresh project data
      const updatedProject = await contract.getProject(project.id);
      setProject(updatedProject);
      setFundingAmount('');
    } catch (error) {
      console.error('Error funding project:', error);
      toast.error('Failed to fund project');
    } finally {
      setIsFunding(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected || !signer || !project) return;

    try {
      const contract = new CrowdfundingContract(signer);
      await contract.withdrawFunds(project.id);
      toast.success('Funds withdrawn successfully!');
      // Refresh project data
      const updatedProject = await contract.getProject(project.id);
      setProject(updatedProject);
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error('Failed to withdraw funds');
    }
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-8">
            Please connect your wallet to view project details.
          </p>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Loading Project...</h1>
          <p className="text-gray-600">Please wait while we fetch the project details.</p>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
          <p className="text-gray-600">The project you're looking for doesn't exist.</p>
        </div>
      </Layout>
    );
  }

  const progress = project.currentFunding
    .mul(100)
    .div(project.fundingGoal)
    .toNumber();
  const daysLeft = Math.ceil(
    (project.deadline.toNumber() - Math.floor(Date.now() / 1000)) / (24 * 60 * 60)
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
            <p className="text-gray-600 mb-6">{project.description}</p>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {formatEther(project.currentFunding)} ETH raised
                </span>
                <span className="text-gray-600">
                  Goal: {formatEther(project.fundingGoal)} ETH
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{daysLeft} days left</span>
                <span className="text-gray-600">{project.category}</span>
              </div>
            </div>

            {!isCreator && !isBacker && daysLeft > 0 && (
              <form onSubmit={handleFund} className="space-y-4 mb-8">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount (ETH)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isFunding}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFunding ? 'Funding...' : 'Fund Project'}
                </button>
              </form>
            )}

            {isCreator && project.currentFunding.gt(0) && (
              <button
                onClick={handleWithdraw}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                Withdraw Funds
              </button>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Backers</h2>
              <div className="space-y-4">
                {backers.map((backer, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {backer.address.slice(0, 6)}...{backer.address.slice(-4)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(backer.timestamp.toNumber() * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-medium">{formatEther(backer.amount)} ETH</p>
                  </div>
                ))}
                {backers.length === 0 && (
                  <p className="text-gray-600">No backers yet. Be the first to support this project!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 