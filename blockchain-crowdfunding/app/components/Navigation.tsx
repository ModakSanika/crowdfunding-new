import React from 'react';
import Link from 'next/link';
import { useWeb3 } from '../context/Web3Context';

export default function Navigation() {
  const { isConnected, connectWallet, address } = useWeb3();

  return (
    <nav className="bg-purple-900/50 backdrop-blur-sm border-b border-purple-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-white text-xl font-bold">
                Crowdfunding
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/projects"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                All Projects
              </Link>
              <Link
                href="/projects/funded"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Funded Projects
              </Link>
              <Link
                href="/projects/create"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Create Project
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {isConnected ? (
              <span className="text-gray-300">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 