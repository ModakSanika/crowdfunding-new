'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { motion } from 'framer-motion';
import { Users, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';

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

export default function FundedProjects() {
  const { contract, formatEther } = useWeb3();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!contract) return;
      try {
        const projectsData = await contract.getProjects();
        const formattedProjects = projectsData
          .map((project: any) => ({
            ...project,
            fundingGoal: formatEther(project.fundingGoal),
            currentFunding: formatEther(project.currentFunding),
          }))
          .filter((project: Project) => project.isFunded);
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
    <div className="space-y-8">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block p-3 bg-green-100 rounded-full mb-4"
        >
          <CheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Successfully Funded Projects</h1>
        <p className="text-gray-600">Check out these amazing projects that reached their funding goals</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
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
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                  Funded
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
                    <CheckCircle size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No funded projects found yet
        </div>
      )}
    </div>
  );
} 