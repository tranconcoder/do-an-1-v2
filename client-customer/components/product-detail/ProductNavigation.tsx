'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import productService, { ProductSku } from '@/lib/services/api/productService';
import { mediaService } from '@/lib/services/api/mediaService';

interface ProductNavigationProps {
  currentProductId: string;
  categoryId: string;
}

interface NavigationProduct {
  _id: string;
  product_name: string;
  sku: {
    _id: string;
    sku_price: number;
    sku_thumb: string;
  };
}

export default function ProductNavigation({ currentProductId, categoryId }: ProductNavigationProps) {
  const router = useRouter();
  const [previousProduct, setPreviousProduct] = useState<NavigationProduct | null>(null);
  const [nextProduct, setNextProduct] = useState<NavigationProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdjacentProducts = async () => {
      if (!categoryId || !currentProductId) return;

      setLoading(true);
      try {
        // Fetch all products in the same category
        const categoryProducts = await productService.getSkusByCategory(categoryId, 100); // Get more products for better navigation
        
        if (!categoryProducts || categoryProducts.length === 0) {
          setLoading(false);
          return;
        }

        // Find current product index
        const currentIndex = categoryProducts.findIndex(
          (product: ProductSku) => product.sku._id === currentProductId
        );

        if (currentIndex === -1) {
          setLoading(false);
          return;
        }

        // Set previous product (if exists)
        if (currentIndex > 0) {
          const prevProduct = categoryProducts[currentIndex - 1];
          setPreviousProduct({
            _id: prevProduct._id,
            product_name: prevProduct.product_name,
            sku: {
              _id: prevProduct.sku._id,
              sku_price: prevProduct.sku.sku_price,
              sku_thumb: prevProduct.sku.sku_thumb
            }
          });
        } else {
          setPreviousProduct(null);
        }

        // Set next product (if exists)
        if (currentIndex < categoryProducts.length - 1) {
          const nextProd = categoryProducts[currentIndex + 1];
          setNextProduct({
            _id: nextProd._id,
            product_name: nextProd.product_name,
            sku: {
              _id: nextProd.sku._id,
              sku_price: nextProd.sku.sku_price,
              sku_thumb: nextProd.sku.sku_thumb
            }
          });
        } else {
          setNextProduct(null);
        }

      } catch (error) {
        console.error('Error fetching adjacent products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdjacentProducts();
  }, [currentProductId, categoryId]);

  // Don't render if no adjacent products found
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="space-y-2 text-right">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-16 w-16 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!previousProduct && !nextProduct) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleNavigate = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Điều hướng sản phẩm
      </h3>
      
      <div className="flex items-center justify-between space-x-6">
        {/* Previous Product */}
        <div className="flex-1">
          {previousProduct ? (
            <button
              onClick={() => handleNavigate(previousProduct.sku._id)}
              className="flex items-center space-x-4 w-full p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
              <div className="relative h-16 w-16 flex-shrink-0">
                <Image
                  src={mediaService.getMediaUrl(previousProduct.sku.sku_thumb)}
                  alt={previousProduct.product_name}
                  fill
                  className="object-cover rounded-md"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600">
                  {previousProduct.product_name}
                </p>
                <p className="text-sm text-gray-600">
                  {formatPrice(previousProduct.sku.sku_price)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Sản phẩm trước</p>
              </div>
            </button>
          ) : (
            <div className="w-full h-16 flex items-center justify-center text-gray-400 text-sm">
              Không có sản phẩm trước
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-16 w-px bg-gray-200"></div>

        {/* Next Product */}
        <div className="flex-1">
          {nextProduct ? (
            <button
              onClick={() => handleNavigate(nextProduct.sku._id)}
              className="flex items-center space-x-4 w-full p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group flex-row-reverse"
            >
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
              <div className="relative h-16 w-16 flex-shrink-0">
                <Image
                  src={mediaService.getMediaUrl(nextProduct.sku.sku_thumb)}
                  alt={nextProduct.product_name}
                  fill
                  className="object-cover rounded-md"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600">
                  {nextProduct.product_name}
                </p>
                <p className="text-sm text-gray-600">
                  {formatPrice(nextProduct.sku.sku_price)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Sản phẩm tiếp theo</p>
              </div>
            </button>
          ) : (
            <div className="w-full h-16 flex items-center justify-center text-gray-400 text-sm">
              Không có sản phẩm tiếp theo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
