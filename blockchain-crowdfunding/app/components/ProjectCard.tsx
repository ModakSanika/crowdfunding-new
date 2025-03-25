import React from 'react';
import Link from 'next/link';
import { Project } from '../types';
import { useWeb3 } from '../context/Web3Context';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { formatEther } = useWeb3();
  const progress = Math.round(
    (Number(formatEther(project.currentFunding)) /
      Number(formatEther(project.fundingGoal))) *
      100
  );

  return (
    <Link
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
              {project.isExpired ? 'Expired' : project.isFunded ? 'Funded' : 'Active'}
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
} 