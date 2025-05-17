'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProfileBox from '@/components/common/ProfileBox';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-blue-100 dark:bg-slate-900/70 dark:border-slate-800">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-500 dark:to-blue-300">
              Aliconcon
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
              Shop
            </Link>
            <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
              Categories
            </Link>
            {/* Add other nav links as needed */}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 w-[200px] lg:w-[300px] bg-white/90 dark:bg-slate-800/90 border-blue-100 dark:border-slate-700 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
            />
          </div>
          <ProfileBox />
        </div>
      </div>
    </header>
  );
} 