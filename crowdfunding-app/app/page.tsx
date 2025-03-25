'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from './context/Web3Context';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Users } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  fundingGoal: string;
  currentFunding: string;
  deadline: string;
  imageUrl: string;
  category: string;
  creator: string;
  isFunded: boolean;
  isExpired: boolean;
}

export default function Home() {
  const { contract, connect, account, formatEther } = useWeb3();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!contract) return;
      try {
        const projectsData = await contract.getProjects();
        const formattedProjects = projectsData.map((project: any) => ({
          ...project,
          fundingGoal: formatEther(project.fundingGoal),
          currentFunding: formatEther(project.currentFunding),
        }));
        setProjects(formattedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [contract, formatEther]);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold mb-6">
            Fund Your Dreams with Crypto
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Create and fund innovative projects using Ethereum. Join our community of creators and backers.
          </p>
          {!account ? (
            <button
              onClick={connect}
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-100 transition-colors"
            >
              Connect Wallet
            </button>
          ) : (
            <Link
              href="/create"
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-100 transition-colors"
            >
              Create Project
            </Link>
          )}
        </motion.div>
      </section>

      {/* Featured Projects */}
      <section>
        <h2 className="text-3xl font-bold mb-8">Featured Projects</h2>
        {loading ? (
          <div className="text-center py-12">Loading projects...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48">
                  <img
                    src={project.imageUrl || '/placeholder.jpg'}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                    {project.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Goal</span>
                      <span className="font-semibold">{project.fundingGoal} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Raised</span>
                      <span className="font-semibold">{project.currentFunding} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Deadline</span>
                      <span className="font-semibold">
                        {new Date(Number(project.deadline) * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Users size={16} />
                      <span className="text-sm">Backers</span>
                    </div>
                    <Link
                      href={`/project/${project.id}`}
                      className="flex items-center text-purple-600 hover:text-purple-700"
                    >
                      <span className="mr-1">View Details</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 