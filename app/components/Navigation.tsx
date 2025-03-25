'use client';

import React from 'react';
import Link from 'next/link';
import { useWeb3 } from '../context/Web3Context';
import { WalletIcon, HomeIcon, PlusCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export const Navigation: React.FC = () => {
  const { isConnected, connect, disconnect, address } = useWeb3();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 text-gray-800 hover:text-gray-600">
              <HomeIcon className="h-6 w-6" />
              <span>Home</span>
            </Link>
            <Link href="/projects/create" className="flex items-center space-x-2 text-gray-800 hover:text-gray-600">
              <PlusCircleIcon className="h-6 w-6" />
              <span>Create Project</span>
            </Link>
            <Link href="/projects" className="flex items-center space-x-2 text-gray-800 hover:text-gray-600">
              <UserGroupIcon className="h-6 w-6" />
              <span>Explore Projects</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  onClick={disconnect}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <WalletIcon className="h-5 w-5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 