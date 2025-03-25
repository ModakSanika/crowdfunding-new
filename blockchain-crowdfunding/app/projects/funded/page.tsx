'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { Project } from '../../types';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function FundedProjects() {
  const { isConnected, signer, formatEther } = useWeb3();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!isConnected || !signer) return;

      try {
        const CrowdfundingContract = (await import('../../contracts/CrowdfundingContract')).CrowdfundingContract;
        const contract = new CrowdfundingContract(signer);
        
        const allProjects = await contract.getProjects();
        const fundedProjects = allProjects.filter(project => project.isFunded);
        setProjects(fundedProjects);
      } catch (error) {
        console.error('Error fetching funded projects:', error);
        toast.error('Failed to load funded projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isConnected, signer]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Funded Projects</h1>

          {projects.length === 0 ? (
            <div className="text-center p-8 bg-purple-900/30 rounded-lg">
              <p className="text-xl">No funded projects found.</p>
              <Link
                href="/projects"
                className="inline-block mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg"
              >
                View All Projects
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => {
                const progress = Math.round(
                  (Number(formatEther(project.currentFunding)) /
                    Number(formatEther(project.fundingGoal))) *
                    100
                );

                return (
                  <Link
                    key={project.id.toString()}
                    href={`/projects/${project.id.toString()}`}
                    className="block transform hover:-translate-y-2 transition-all duration-200"
                  >
                    <div className="bg-white/10 backdrop-blur-sm overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="object-cover w-full h-48"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 text-xs font-medium text-pink-200 bg-pink-900/50 rounded-full">
                            {project.category}
                          </span>
                          <span className="text-sm text-gray-300">
                            {project.isExpired ? 'Expired' : 'Funded'}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                          {project.description}
                        </p>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Progress</span>
                            <span className="font-medium text-pink-300">
                              {progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm text-gray-300 mt-2">
                            <span>{formatEther(project.currentFunding)} ETH raised</span>
                            <span>of {formatEther(project.fundingGoal)} ETH</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 