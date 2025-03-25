'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useWeb3 } from '@/app/context/Web3Context';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Project {
  id: number;
  title: string;
  description: string;
  fundingGoal: string;
  currentFunding: string;
  deadline: number;
  imageUrl: string;
  category: string;
  creator: string;
  isFunded: boolean;
  isExpired: boolean;
}

interface Backer {
  backer: string;
  amount: string;
}

export default function ProjectDetails() {
  const { id } = useParams();
  const { contract, account, formatEther, parseEther } = useWeb3();
  const [project, setProject] = useState<Project | null>(null);
  const [backers, setBackers] = useState<Backer[]>([]);
  const [fundingAmount, setFundingAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id, contract]);

  const fetchProjectDetails = async () => {
    if (!contract) return;

    try {
      const projectData = await contract.getProject(Number(id));
      const backersData = await contract.getBackers(Number(id));

      setProject({
        id: projectData.id.toNumber(),
        title: projectData.title,
        description: projectData.description,
        fundingGoal: formatEther(projectData.fundingGoal),
        currentFunding: formatEther(projectData.currentFunding),
        deadline: projectData.deadline.toNumber(),
        imageUrl: projectData.imageUrl,
        category: projectData.category,
        creator: projectData.creator,
        isFunded: projectData.isFunded,
        isExpired: projectData.isExpired,
      });

      setBackers(
        backersData.map((backer: any) => ({
          backer: backer.backer,
          amount: formatEther(backer.amount),
        }))
      );
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleFund = async () => {
    if (!contract || !account || !project) return;

    try {
      setFunding(true);
      const amount = parseEther(fundingAmount);
      const tx = await contract.fundProject(Number(id), { value: amount });
      await tx.wait();
      toast.success('Project funded successfully!');
      fetchProjectDetails();
      setFundingAmount('');
    } catch (error) {
      console.error('Error funding project:', error);
      toast.error('Failed to fund project');
    } finally {
      setFunding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Project not found</h1>
            <p className="text-gray-600">The project you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const progress = (Number(project.currentFunding) / Number(project.fundingGoal)) * 100;
  const daysLeft = Math.ceil((project.deadline - Date.now() / 1000) / (24 * 60 * 60));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project Image */}
            <div className="lg:col-span-2">
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>

            {/* Project Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>
                <p className="text-gray-600 mb-6">{project.description}</p>

                {/* Funding Progress */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {project.currentFunding} ETH raised
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {project.fundingGoal} ETH goal
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-2.5 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Time Left */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Campaign ended'}
                  </p>
                </div>

                {/* Fund Button */}
                {!project.isExpired && !project.isFunded && (
                  <div className="space-y-4">
                    <input
                      type="number"
                      placeholder="Amount in ETH"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleFund}
                      disabled={funding || !account}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {!account
                        ? 'Connect Wallet to Fund'
                        : funding
                        ? 'Funding...'
                        : 'Fund Project'}
                    </button>
                  </div>
                )}

                {project.isFunded && (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                    Project successfully funded!
                  </div>
                )}

                {project.isExpired && !project.isFunded && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                    Campaign has ended
                  </div>
                )}
              </div>

              {/* Project Details */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium text-gray-900">{project.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Creator</p>
                    <p className="font-medium text-gray-900">
                      {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Backers List */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Backers</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Backer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backers.map((backer, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {backer.backer.slice(0, 6)}...{backer.backer.slice(-4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {backer.amount} ETH
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 