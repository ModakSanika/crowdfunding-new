import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from './context/Web3Context';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Crowdfunding DApp',
  description: 'A decentralized crowdfunding platform built with Next.js and Ethereum',
};

function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-purple-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-purple-200 transition-colors">
          CrowdFund
        </Link>
        <div className="space-x-6">
          <Link 
            href="/" 
            className={`hover:text-purple-200 transition-colors ${pathname === '/' ? 'text-purple-200' : ''}`}
          >
            Home
          </Link>
          <Link 
            href="/create" 
            className={`hover:text-purple-200 transition-colors ${pathname === '/create' ? 'text-purple-200' : ''}`}
          >
            Create Project
          </Link>
          <Link 
            href="/explore" 
            className={`hover:text-purple-200 transition-colors ${pathname === '/explore' ? 'text-purple-200' : ''}`}
          >
            Explore
          </Link>
          <Link 
            href="/funded" 
            className={`hover:text-purple-200 transition-colors ${pathname === '/funded' ? 'text-purple-200' : ''}`}
          >
            Funded Projects
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster position="bottom-right" />
        </Web3Provider>
      </body>
    </html>
  );
} 