'use client';

import NextImage from 'next/image';
import Link from 'next/link';
import { Star, LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { mediaService } from '@/lib/services/api/mediaService';
import { ProductSku } from '@/lib/services/api/productService';
import { Category } from '@/lib/services/api/categoryService';

interface RelatedProductsProps {
  relatedProducts: ProductSku[];
  category?: Category[];
  loading?: boolean;
}

export default function RelatedProducts({ relatedProducts, category, loading }: RelatedProductsProps) {
  if (!category || category.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Related Products</h2>
        <p className="text-gray-600">Other products in {category[0].category_name}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="w-full aspect-square rounded mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      ) : relatedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {relatedProducts.map((relatedProduct) => (
            <Link 
              key={relatedProduct.sku._id}
              href={`/products/${relatedProduct.sku._id}`}
              className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <NextImage
                  src={mediaService.getMediaUrl(relatedProduct.sku.sku_thumb || relatedProduct.product_thumb)}
                  alt={relatedProduct.product_name}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {relatedProduct.product_name}
                </h3>
                {relatedProduct.product_rating_avg && relatedProduct.product_rating_avg > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < Math.round(relatedProduct.product_rating_avg!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">
                      ({relatedProduct.product_rating_avg.toFixed(1)})
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-700">
                    ${relatedProduct.sku.sku_price.toFixed(2)}
                  </span>
                  {relatedProduct.sold_count && relatedProduct.sold_count > 0 && (
                    <span className="text-xs text-gray-500">
                      {relatedProduct.sold_count} sold
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <LayoutGrid className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No related products found in this category.</p>
        </div>
      )}
    </div>
  );
}