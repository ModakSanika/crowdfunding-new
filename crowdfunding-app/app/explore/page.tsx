'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpDown, Users, Calendar } from 'lucide-react';
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

export default function ExploreProjects() {
  const { contract, formatEther } = useWeb3();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    'Technology',
    'Art',
    'Music',
    'Film',
    'Games',
    'Design',
    'Fashion',
    'Food',
    'Other',
  ];

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

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || project.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return Number(b.deadline) - Number(a.deadline);
        case 'oldest':
          return Number(a.deadline) - Number(b.deadline);
        case 'highest':
          return Number(b.fundingGoal) - Number(a.fundingGoal);
        case 'lowest':
          return Number(a.fundingGoal) - Number(b.fundingGoal);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Explore Projects</h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Goal</option>
              <option value="lowest">Lowest Goal</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
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
                    <ArrowUpDown size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No projects found matching your criteria
        </div>
      )}
    </div>
  );
} 