'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import Header from '@/components/common/Header'; // Assuming Header is in common components
import { Button } from '@/components/ui/button'; // If needed for any actions
import { categoryService, Category } from '@/lib/services/api/categoryService';
import { mediaService } from '@/lib/services/api/mediaService';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        setIsLoading(true);
        const fetchedCategories = await categoryService.getAllCategories();
        setCategories(fetchedCategories);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories. Please try again later.');
      }
      setIsLoading(false);
    };

    fetchAllCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
            All Categories
          </h1>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, index) => ( // Show more skeletons for all categories page
              <div key={index} className="group relative h-40 rounded-xl overflow-hidden bg-gray-200 animate-pulse p-[10px]">
                <div className="h-full w-full bg-gray-300 rounded-md"></div>
                <div className="absolute bottom-0 left-0 right-0 p-[10px]">
                  <div className="h-4 bg-gray-400 rounded w-3/4 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center text-red-500 py-10">
            <p>{error}</p>
            {/* Optionally, add a retry button here */}
          </div>
        )}

        {!isLoading && !error && categories.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            <p>No categories found.</p>
          </div>
        )}

        {!isLoading && !error && categories.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/category/${category._id}`}
                className="group relative h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 p-[10px] shadow-md hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <Image
                  src={mediaService.getMediaUrl(category.category_icon)}
                  alt={category.category_name}
                  fill
                  className="object-contain transition-transform group-hover:scale-105 m-2"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-[10px]">
                  <h3 className="text-white font-medium text-sm text-center truncate">
                    {category.category_name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      {/* Consider adding a Footer component if you have one */}
    </div>
  );
} 