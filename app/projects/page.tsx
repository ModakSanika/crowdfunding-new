'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { useWeb3 } from '../context/Web3Context';
import { Project } from '../types';
import { CrowdfundingContract } from '../contracts/CrowdfundingContract';
import toast from 'react-hot-toast';

export default function Projects() {
  const { isConnected, signer, formatEther } = useWeb3();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!isConnected || !signer) return;

      try {
        const contract = new CrowdfundingContract(signer);
        const projectsData = await contract.getProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to fetch projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [isConnected, signer]);

  if (!isConnected) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-8">
            Please connect your wallet to view available projects.
          </p>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Loading Projects...</h1>
          <p className="text-gray-600">Please wait while we fetch the available projects.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Available Projects</h1>
          <Link
            href="/projects/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">No projects available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id.toNumber()}
                href={`/projects/${project.id.toNumber()}`}
                className="block"
              >
                <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Funding Progress</span>
                        <span className="font-medium">
                          {formatEther(project.currentFunding)} / {formatEther(project.fundingGoal)} ETH
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (Number(project.currentFunding) / Number(project.fundingGoal)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Deadline</span>
                        <span className="font-medium">
                          {new Date(Number(project.deadline) * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 