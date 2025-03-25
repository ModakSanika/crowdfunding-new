'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { Project, Backer } from '../../types';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { isConnected, signer, formatEther, parseEther } = useWeb3();
  const [project, setProject] = useState<Project | null>(null);
  const [backers, setBackers] = useState<Backer[]>([]);
  const [fundingAmount, setFundingAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [isBacker, setIsBacker] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!isConnected || !signer || !id) return;

      try {
        const CrowdfundingContract = (await import('../../contracts/CrowdfundingContract')).CrowdfundingContract;
        const contract = new CrowdfundingContract(signer);
        
        const projectData = await contract.getProject(Number(id));
        const backersData = await contract.getBackers(Number(id));
        const isCreatorCheck = await contract.isProjectCreator(Number(id));
        const isBackerCheck = await contract.isProjectBacker(Number(id));

        setProject(projectData);
        setBackers(backersData);
        setIsCreator(isCreatorCheck);
        setIsBacker(isBackerCheck);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [isConnected, signer, id]);

  const handleFund = async () => {
    if (!isConnected || !signer || !project || !fundingAmount) return;

    try {
      const CrowdfundingContract = (await import('../../contracts/CrowdfundingContract')).CrowdfundingContract;
      const contract = new CrowdfundingContract(signer);
      
      const amount = parseEther(fundingAmount);
      await contract.fundProject(project.id.toNumber(), amount);
      
      toast.success('Project funded successfully!');
      router.refresh();
    } catch (error: any) {
      console.error('Error funding project:', error);
      toast.error(error.message || 'Failed to fund project');
    }
  };

  const handleDelete = async () => {
    if (!isConnected || !signer || !project) return;

    try {
      const CrowdfundingContract = (await import('../../contracts/CrowdfundingContract')).CrowdfundingContract;
      const contract = new CrowdfundingContract(signer);
      
      await contract.withdrawFunds(project.id.toNumber());
      toast.success('Project funds withdrawn successfully!');
      router.push('/projects');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Project not found</h1>
              <p className="mt-2">The project you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const progress = Math.round(
    (Number(formatEther(project.currentFunding)) /
      Number(formatEther(project.fundingGoal))) *
      100
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                <span className="px-3 py-1 text-sm font-medium text-pink-200 bg-pink-900/50 rounded-full">
                  {project.category}
                </span>
              </div>
              {isCreator && project.isFunded && !project.isExpired && (
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Withdraw Funds
                </button>
              )}
            </div>

            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-64 object-cover rounded-xl mb-8"
            />

            <div className="prose prose-invert max-w-none mb-8">
              <h2 className="text-2xl font-semibold mb-4">About this project</h2>
              <p className="text-gray-300">{project.description}</p>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Progress</span>
                  <span className="font-medium text-pink-300">{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm mt-2 text-gray-300">
                  <span>{formatEther(project.currentFunding)} ETH raised</span>
                  <span>of {formatEther(project.fundingGoal)} ETH</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Backers</h3>
                <div className="space-y-2">
                  {backers.map((backer, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-300">
                      <span>{backer.backerAddress.slice(0, 6)}...{backer.backerAddress.slice(-4)}</span>
                      <span>{formatEther(backer.amount)} ETH</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!project.isExpired && !project.isFunded && (
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Fund this project</h3>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    placeholder="Amount in ETH"
                    className="flex-1 bg-white/10 border border-purple-500 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleFund}
                    disabled={!isConnected || !fundingAmount}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Fund Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 