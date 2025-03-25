'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useWeb3 } from '../context/Web3Context';
import { CrowdfundingContract } from '../contracts/CrowdfundingContract';
import toast from 'react-hot-toast';
import { BigNumber } from 'ethers';
import { Project } from '../types';
import ProjectCard from '../components/ProjectCard';

export default function Projects() {
  const { isConnected, signer } = useWeb3();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!isConnected || !signer) {
          setError('Please connect your wallet to view projects');
          return;
        }

        const CrowdfundingContract = (await import('../contracts/CrowdfundingContract')).CrowdfundingContract;
        const contract = new CrowdfundingContract(signer);
        
        console.log('Fetching projects...'); // Debug log
        const fetchedProjects = await contract.getProjects();
        console.log('Fetched projects:', fetchedProjects); // Debug log
        
        setProjects(fetchedProjects);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err.message || 'Failed to fetch projects');
        toast.error('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isConnected, signer]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Crowdfunding Projects</h1>
            <Link
              href="/projects/create"
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Create Project
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-900/30 rounded-lg">
              <p className="text-xl text-red-200">{error}</p>
              {!isConnected && (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center p-8 bg-purple-900/30 rounded-lg">
              <p className="text-xl">No projects found. Be the first to create one!</p>
              <Link
                href="/projects/create"
                className="inline-block mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg"
              >
                Create Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <ProjectCard key={project.id.toString()} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 