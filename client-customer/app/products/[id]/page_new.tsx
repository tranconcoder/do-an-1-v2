"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import productService, { ProductDetailResponse, ProductSku, ProductAttribute, ProductVariation, SpuSelect, SkuOther } from '@/lib/services/api/productService';
import { Category } from '@/lib/services/api/categoryService';
import shopService, { Shop } from '@/lib/services/api/shopService';
import { mediaService } from '@/lib/services/api/mediaService';
import Header from '@/components/common/Header';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, ChevronLeft } from 'lucide-react';

// Import all product detail components
import {
  ProductBreadcrumbs,
  ImageGallery,
  ImageModal,
  ProductHeader,
  ProductPricing,
  ProductVariants,
  ProductDescription,
  ProductActions,
  ShopInfo,
  ProductReviews,
  RelatedProducts
} from '@/components/product-detail';

// Review interface
interface Review {
  _id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count?: number;
  images?: string[];
}

// Rating breakdown interface
interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
  total: number;
  average: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingShop, setLoadingShop] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductSku[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<{[key: string]: number}>({});
  const [currentSku, setCurrentSku] = useState<ProductDetailResponse | SkuOther | null>(null);
  
  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  
  // Image modal states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Combine SKU and SPU images with current SKU images taking priority
  const allImages = [
    ...(currentSku?.sku_thumb ? [currentSku.sku_thumb] : []),
    ...(currentSku?.sku_images || []),
    ...(product?.spu_select?.product_thumb && !currentSku?.sku_thumb ? [product.spu_select.product_thumb] : []),
    ...(product?.spu_select?.product_images || [])
  ].filter((img, index, arr) => img && arr.indexOf(img) === index); // Remove duplicates

  // Calculate current stock
  const currentStock = currentSku?.sku_stock ?? product?.spu_select?.product_quantity ?? 0;

  // Get breadcrumb data
  const breadcrumbData = product ? {
    category: product.spu_select.product_category,
    productName: product.spu_select.product_name
  } : null;

  // Helper functions
  const handleVariationChange = (attributeId: string, variationId: number) => {
    setSelectedVariations(prev => ({
      ...prev,
      [attributeId]: variationId
    }));
  };

  const handleImageModalOpen = (index: number = 0) => {
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  const handleImageModalClose = () => {
    setIsImageModalOpen(false);
  };

  const handleImageModalNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handleImageModalPrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleAddToCart = () => {
    // Add to cart logic
    console.log('Add to cart:', product, selectedVariations);
  };

  const handleBuyNow = () => {
    // Buy now logic
    console.log('Buy now:', product, selectedVariations);
  };

  const handleSubmitReview = (review: { rating: number; comment: string }) => {
    // Submit review logic
    console.log('Submit review:', review);
    setShowReviewForm(false);
    setNewReview({ rating: 5, comment: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        setProduct(null);
        try {
          // Fetch product using SKU ID only
          const data = await productService.getSkuById(productId);
          console.log({data})
          // The data should be the first item in metadata array
          const productData = Array.isArray(data) ? data[0] : data;
          setProduct(productData);
          setCurrentSku(productData);

          // Fetch shop information
          if (productData?.spu_select?.product_shop) {
            setLoadingShop(true);
            try {
              const shopData = await shopService.getShopById(productData.spu_select.product_shop);
              setShop(shopData);
            } catch (shopError) {
              console.error('Error fetching shop data:', shopError);
            } finally {
              setLoadingShop(false);
            }
          }

          // Fetch related products
          if (productData?.spu_select?.product_category) {
            setLoadingRelated(true);
            try {
              const relatedData = await productService.getSkusByCategory(productData.spu_select.product_category);
              // Filter out current product and get only SKUs
              const filtered = (relatedData || []).filter(
                (sku: ProductSku) => sku._id !== productId
              ).slice(0, 4);
              setRelatedProducts(filtered);
            } catch (relatedError) {
              console.error('Error fetching related products:', relatedError);
            } finally {
              setLoadingRelated(false);
            }
          }

          // Fetch reviews (mock data for now)
          setLoadingReviews(true);
          try {
            // Mock reviews data
            const mockReviews: Review[] = [
              {
                _id: '1',
                user_name: 'John Doe',
                rating: 5,
                comment: 'Great product! Highly recommended.',
                created_at: new Date().toISOString(),
                helpful_count: 12
              },
              {
                _id: '2',
                user_name: 'Jane Smith',
                rating: 4,
                comment: 'Good quality, fast shipping.',
                created_at: new Date(Date.now() - 86400000).toISOString(),
                helpful_count: 8
              }
            ];
            setReviews(mockReviews);
            
            // Mock rating breakdown
            setRatingBreakdown({
              5: 150,
              4: 45,
              3: 12,
              2: 3,
              1: 2,
              total: 212,
              average: 4.6
            });
          } catch (reviewError) {
            console.error('Error fetching reviews:', reviewError);
          } finally {
            setLoadingReviews(false);
          }

        } catch (err) {
          setError('Failed to load product details');
          console.error('Error fetching product:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image skeleton */}
            <div className="space-y-4">
              <Skeleton className="w-full aspect-square rounded-lg" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-md" />
                ))}
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 flex-1" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Go Back
              </Button>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          {breadcrumbData && (
            <ProductBreadcrumbs 
              category={breadcrumbData.category}
              productName={breadcrumbData.productName}
            />
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Image Gallery */}
              <ImageGallery
                images={allImages}
                productName={product.spu_select.product_name}
                onImageClick={handleImageModalOpen}
              />

              {/* Product Info */}
              <div className="space-y-6">
                {/* Product Header */}
                <ProductHeader
                  name={product.spu_select.product_name}
                  category={product.spu_select.product_category}
                  rating={ratingBreakdown?.average || 0}
                  reviewCount={ratingBreakdown?.total || 0}
                />

                {/* Product Pricing */}
                <ProductPricing
                  price={currentSku?.sku_price || product.spu_select.product_price}
                  originalPrice={product.spu_select.product_price}
                  stock={currentStock}
                  sold={product.spu_select.product_sold || 0}
                />

                {/* Product Variants */}
                {product.spu_select.product_variations && product.spu_select.product_variations.length > 0 && (
                  <ProductVariants
                    variations={product.spu_select.product_variations}
                    selectedVariations={selectedVariations}
                    onVariationChange={handleVariationChange}
                  />
                )}

                {/* Product Actions */}
                <ProductActions
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  inStock={currentStock > 0}
                />
              </div>
            </div>

            <Separator />

            {/* Shop Info */}
            {shop && (
              <div className="p-6">
                <ShopInfo
                  shop={shop}
                  loading={loadingShop}
                />
              </div>
            )}

            <Separator />

            {/* Product Description */}
            <div className="p-6">
              <ProductDescription
                description={product.spu_select.product_description}
                attributes={product.spu_select.product_attributes}
              />
            </div>

            <Separator />

            {/* Product Reviews */}
            <div className="p-6">
              <ProductReviews
                reviews={reviews}
                ratingBreakdown={ratingBreakdown}
                loading={loadingReviews}
                showReviewForm={showReviewForm}
                newReview={newReview}
                onShowReviewForm={setShowReviewForm}
                onReviewChange={setNewReview}
                onSubmitReview={handleSubmitReview}
                formatDate={formatDate}
              />
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-8">
              <RelatedProducts
                products={relatedProducts}
                loading={loadingRelated}
              />
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <ImageModal
          images={allImages}
          currentIndex={currentImageIndex}
          productName={product.spu_select.product_name}
          isOpen={isImageModalOpen}
          onClose={handleImageModalClose}
          onNext={handleImageModalNext}
          onPrev={handleImageModalPrev}
        />
      )}
    </>
  );
}
