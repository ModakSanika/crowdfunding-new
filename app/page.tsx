'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from './components/Layout';
import { Navigation } from './components/Navigation';
import { useWeb3 } from './context/Web3Context';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Project } from './types';
import { CrowdfundingContract } from './contracts/CrowdfundingContract';
import toast from 'react-hot-toast';

export default function Home() {
  const { isConnected, signer, formatEther } = useWeb3();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      if (!isConnected || !signer) return;

      try {
        const contract = new CrowdfundingContract(signer);
        const projects = await contract.getProjects();
        // Get the 3 most recently created projects
        setFeaturedProjects(projects.slice(0, 3));
      } catch (error) {
        console.error('Error fetching featured projects:', error);
        toast.error('Failed to fetch featured projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, [isConnected, signer]);

  return (
    <Layout>
      <Navigation />
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white">
          <h1 className="text-5xl font-bold mb-6">
            Fund Your Dreams with Blockchain
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Create and fund innovative projects using the power of blockchain technology.
            Join our community of creators and backers.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/projects/create"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create a Project
            </Link>
            <Link
              href="/projects"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Explore Projects
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Create Projects</h3>
            <p className="text-gray-600 mb-4">
              Start your own crowdfunding campaign and reach out to potential backers worldwide.
            </p>
            <Link
              href="/projects/create"
              className="text-blue-500 hover:text-blue-600 flex items-center"
            >
              Get Started <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Fund Projects</h3>
            <p className="text-gray-600 mb-4">
              Support innovative projects and become an early backer of the next big thing.
            </p>
            <Link
              href="/projects"
              className="text-blue-500 hover:text-blue-600 flex items-center"
            >
              Browse Projects <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Secure & Transparent</h3>
            <p className="text-gray-600 mb-4">
              All transactions are secured by blockchain technology and fully transparent.
            </p>
            {!isConnected && (
              <Link
                href="#"
                className="text-blue-500 hover:text-blue-600 flex items-center"
              >
                Connect Wallet <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Link>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 bg-gray-50 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community of creators and backers today. Create your first project or support an existing one.
          </p>
          <Link
            href={isConnected ? "/projects/create" : "#"}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors inline-flex items-center"
          >
            {isConnected ? "Create Your Project" : "Connect Wallet to Start"}
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Link>
        </section>

        {/* Featured Projects Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Featured Projects
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Discover the latest projects seeking funding
            </p>
          </div>

          {!isConnected ? (
            <div className="mt-12 text-center">
              <p className="text-gray-600">
                Connect your wallet to view featured projects
              </p>
            </div>
          ) : isLoading ? (
            <div className="mt-12 text-center">
              <p className="text-gray-600">Loading featured projects...</p>
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-gray-600">No projects available yet.</p>
              <Link
                href="/projects/create"
                className="mt-4 inline-block text-blue-600 hover:text-blue-800"
              >
                Be the first to create a project!
              </Link>
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
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
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
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
        </section>
      </div>
    </Layout>
  );
} 