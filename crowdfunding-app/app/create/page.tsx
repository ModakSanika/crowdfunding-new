'use client';

import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Image as ImageIcon, Calendar, Tag } from 'lucide-react';

export default function CreateProject() {
  const router = useRouter();
  const { contract, account, parseEther } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingGoal: '',
    deadline: '',
    imageUrl: '',
    category: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !account) return;

    try {
      setLoading(true);
      const deadline = Math.floor(new Date(formData.deadline).getTime() / 1000);
      const fundingGoal = parseEther(formData.fundingGoal);

      const tx = await contract.createProject(
        formData.title,
        formData.description,
        fundingGoal,
        deadline,
        formData.imageUrl,
        formData.category
      );

      await tx.wait();
      router.push('/');
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
            <Heart className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your Project</h1>
          <p className="text-gray-600">Share your vision and start raising funds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your project title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe your project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funding Goal (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                name="fundingGoal"
                value={formData.fundingGoal}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter funding goal"
              />
              <span className="absolute right-4 top-2 text-gray-500">ETH</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline
            </label>
            <div className="relative">
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Calendar className="absolute right-4 top-2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Image URL
            </label>
            <div className="relative">
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter image URL"
              />
              <ImageIcon className="absolute right-4 top-2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="">Select a category</option>
                <option value="Technology">Technology</option>
                <option value="Art">Art</option>
                <option value="Music">Music</option>
                <option value="Film">Film</option>
                <option value="Games">Games</option>
                <option value="Design">Design</option>
                <option value="Fashion">Fashion</option>
                <option value="Food">Food</option>
                <option value="Other">Other</option>
              </select>
              <Tag className="absolute right-4 top-2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !account}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
              loading || !account
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            } transition-colors`}
          >
            {loading ? 'Creating Project...' : 'Create Project'}
          </button>

          {!account && (
            <p className="text-center text-red-500">
              Please connect your wallet to create a project
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
} 