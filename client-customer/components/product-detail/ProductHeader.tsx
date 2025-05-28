'use client';

import NextImage from 'next/image';
import Link from 'next/link';
import { Star, FolderOpen } from 'lucide-react';
import { mediaService } from '@/lib/services/api/mediaService';
import { Category } from '@/lib/services/api/categoryService';

interface ProductHeaderProps {
  productName: string;
  category?: Category[];
  rating?: number;
  soldCount?: number;
}

export default function ProductHeader({ 
  productName, 
  category, 
  rating, 
  soldCount 
}: ProductHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
          {productName}
        </h1>
      </div>

      {/* Category Information */}
      {category && category.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <div className="flex items-center gap-2">
                {category[0].category_icon && (
                  <div className="w-6 h-6 relative">
                    <NextImage
                      src={mediaService.getMediaUrl(category[0].category_icon)}
                      alt={category[0].category_name}
                      layout="fill"
                      objectFit="contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <Link 
                  href={`/categories?category=${category[0]._id}`}
                  className="text-green-700 font-semibold hover:text-green-800 transition-colors"
                >
                  {category[0].category_name}
                </Link>
              </div>
              {category[0].category_description && (
                <p className="text-sm text-gray-600 mt-1">{category[0].category_description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating and Sales Info */}
      {(rating || (soldCount && soldCount > 0)) && (
        <div className="flex items-center gap-3 text-sm">
          {rating && rating > 0 && (
            <>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="ml-1.5 text-gray-600">({rating.toFixed(1)})</span>
              </div>
              {soldCount && soldCount > 0 && <span className="text-gray-400">•</span>}
            </>
          )}
          {soldCount && soldCount > 0 && (
            <span className="text-gray-600">{soldCount.toLocaleString()} sold</span>
          )}
        </div>
      )}
    </div>
  );
}