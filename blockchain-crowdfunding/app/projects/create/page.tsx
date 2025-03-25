'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import { useWeb3 } from '../../context/Web3Context';
import { CrowdfundingContract } from '../../contracts/CrowdfundingContract';
import toast from 'react-hot-toast';
import Image from 'next/image';

const categories = [
  'Art', 'Music', 'Technology', 'Games', 'Film', 
  'Fashion', 'Food', 'Publishing', 'Design', 'Other'
];

export default function CreateProject() {
  const router = useRouter();
  const { isConnected, signer, parseEther } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
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
    if (!isConnected || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Validate deadline
    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate <= new Date()) {
      toast.error('Deadline must be in the future');
      return;
    }

    // Validate funding goal
    if (!formData.fundingGoal || parseFloat(formData.fundingGoal) <= 0) {
      toast.error('Please enter a valid funding goal');
      return;
    }

    setLoading(true);
    try {
      const contract = new CrowdfundingContract(signer);
      const deadline = Math.floor(deadlineDate.getTime() / 1000);

      // Show pending toast
      toast.loading('Creating your project... Please confirm the transaction 🚀');

      // Create project transaction
      const tx = await contract.createProject(
        formData.title,
        formData.description,
        parseEther(formData.fundingGoal),
        deadline,
        formData.imageUrl,
        formData.category
      );

      // Show mining toast
      toast.loading('Transaction confirmed! Mining in progress... ⛏️');

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Dismiss all toasts
      toast.dismiss();
      
      toast.success('Project created successfully! 🎉');
      router.push('/projects');
    } catch (error: any) {
      console.error('Error creating project:', error);
      // Dismiss all toasts first
      toast.dismiss();
      
      // Show error toast
      toast.error(
        error.reason || error.message || 'Failed to create project. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'imageUrl' && value) {
      setPreviewImage(value);
    }
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-purple-900 sm:text-4xl">
              Please connect your wallet to create a project
            </h2>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden transform transition-all hover:scale-[1.01]">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-10">
              <h1 className="text-4xl font-extrabold text-white flex items-center gap-2">
                <span>✨</span>
                Create New Project
                <span>🚀</span>
              </h1>
              <p className="mt-2 text-lg text-purple-100">
                Fill in the details below to launch your amazing project
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="px-8 py-10 space-y-8">
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="block text-lg font-medium text-gray-700"
                >
                  Project Title ✨
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full text-lg rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all py-3 px-4"
                  placeholder="Enter your project title"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="block text-lg font-medium text-gray-700"
                >
                  Description 📝
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={8}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full text-lg rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all py-3 px-4"
                  placeholder="Describe your amazing project"
                />
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="fundingGoal"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Funding Goal (ETH) 💎
                  </label>
                  <input
                    type="number"
                    name="fundingGoal"
                    id="fundingGoal"
                    step="0.01"
                    required
                    value={formData.fundingGoal}
                    onChange={handleChange}
                    className="mt-1 block w-full text-lg rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all py-3 px-4"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="deadline"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Deadline ⏰
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    id="deadline"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    value={formData.deadline}
                    onChange={handleChange}
                    className="mt-1 block w-full text-lg rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all py-3 px-4"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="imageUrl"
                  className="block text-lg font-medium text-gray-700"
                >
                  Project Image URL 🖼️
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  id="imageUrl"
                  required
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full text-lg rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all py-3 px-4"
                  placeholder="https://example.com/image.jpg"
                />
                {previewImage && (
                  <div className="mt-3 relative rounded-xl overflow-hidden h-48">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setPreviewImage('')}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="block text-lg font-medium text-gray-700"
                >
                  Category 🏷️
                </label>
                <select
                  name="category"
                  id="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full text-lg rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all py-3 px-4"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-3 py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      ✨ Create Project 🚀
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 