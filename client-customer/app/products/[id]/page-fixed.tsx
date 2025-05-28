"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NextImage from 'next/image'; // Aliased to avoid conflict if any
import Link from 'next/link';
import { ChevronLeft, ShoppingCart, Zap, Star, Package, AlertTriangle, Info, Tag, LayoutGrid, Heart, Palette, FolderOpen, MessageSquare, ThumbsUp, User, Calendar, ZoomIn, ZoomOut, X, ChevronRight, ChevronLeft as ChevronLeftIcon, Maximize2 } from 'lucide-react';

import productService, { ProductSkuDetail, ProductSku } from '@/lib/services/api/productService'; // Updated to use SKU interface

// Updated interfaces to match new API structure
interface ProductAttribute {
  attr_name: string;
  attr_value: string;
  _id: string;
}

interface ProductVariation {
  variation_name: string;
  variation_values: string[];
  variation_images: string[];
  _id: string;
}

interface SpuSelect {
  _id: string;
  product_name: string;
  product_quantity: number;
  product_description: string;
  product_category: string;
  product_shop: string;
  product_sold: number;
  product_rating_avg: number;
  product_slug: string;
  product_thumb: string;
  product_images: string[];
  product_attributes: ProductAttribute[];
  product_variations: ProductVariation[];
  is_draft: boolean;
  is_publish: boolean;
}

interface Category {
  _id: string;
  category_name: string;
  category_icon: string;
  category_description: string;
  category_parent: string;
  category_level: number;
  category_order: number;
  category_product_count: number;
  is_active: boolean;
}

interface SkuOther {
  _id: string;
  sku_product: string;
  sku_price: number;
  sku_stock: number;
  sku_thumb: string;
  sku_images: string[];
  sku_tier_idx: number[];
}

interface ProductDetailResponse {
  _id: string;
  sku_product: string;
  sku_price: number;
  sku_stock: number;
  sku_thumb: string;
  sku_images: string[];
  sku_tier_idx: number[];
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  __v: number;
  spu_select: SpuSelect;
  category: Category[];
  sku_others: SkuOther[];
}
import { mediaService } from '@/lib/services/api/mediaService';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

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
  const productId = params.id as string; // This could be either SKU ID or SPU ID

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
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
  
  // Image preview states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Combine SKU and SPU images with current SKU images taking priority
  const allImages = [
    ...(currentSku?.sku_thumb ? [currentSku.sku_thumb] : []),
    ...(currentSku?.sku_images || []),
    ...(product?.spu_select?.product_thumb && !currentSku?.sku_thumb ? [product.spu_select.product_thumb] : []),
    ...(product?.spu_select?.product_images || [])
  ].filter((img, index, arr) => img && arr.indexOf(img) === index); // Remove duplicates

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
          setSelectedSkuId(productData._id || productId);

          // Initialize selected variations based on current SKU
          if (productData.spu_select?.product_variations && productData.sku_tier_idx) {
            const initialVariations: {[key: string]: number} = {};
            productData.spu_select.product_variations.forEach((variation: ProductVariation, index: number) => {
              if (productData.sku_tier_idx[index] !== undefined) {
                initialVariations[variation._id] = productData.sku_tier_idx[index];
              }
            });
            setSelectedVariations(initialVariations);
          }

          // Fetch related products by category
          if (productData.spu_select?.product_category) {
            setLoadingRelated(true);
            try {
              const related = await productService.getSkusByCategory(productData.spu_select.product_category, 8);
              // Filter out current product
              const filteredRelated = related.filter(p => p.sku._id !== productData._id);
              setRelatedProducts(filteredRelated);
            } catch (relatedError) {
              console.error('Failed to fetch related products:', relatedError);
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
                user_avatar: '',
                rating: 5,
                comment: 'Excellent product! Highly recommended. The quality is outstanding and it arrived quickly.',
                created_at: '2024-01-15T10:30:00Z',
                helpful_count: 12,
                images: []
              },
              {
                _id: '2',
                user_name: 'Jane Smith',
                user_avatar: '',
                rating: 4,
                comment: 'Good value for money. Works as expected but could be improved.',
                created_at: '2024-01-10T14:22:00Z',
                helpful_count: 8,
                images: []
              },
              {
                _id: '3',
                user_name: 'Mike Johnson',
                user_avatar: '',
                rating: 5,
                comment: 'Perfect! Exactly what I was looking for.',
                created_at: '2024-01-08T09:15:00Z',
                helpful_count: 5,
                images: []
              }
            ];
            
            setReviews(mockReviews);
            
            // Mock rating breakdown
            setRatingBreakdown({
              5: 15,
              4: 8,
              3: 2,
              2: 1,
              1: 0,
              total: 26,
              average: 4.4
            });
          } catch (reviewError) {
            console.error('Failed to fetch reviews:', reviewError);
          } finally {
            setLoadingReviews(false);
          }
          
        } catch (err) {
          console.error('Failed to fetch product:', err);
          setError('Failed to load product details. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [productId]);

  // Update selected image when currentSku changes
  useEffect(() => {
    if (currentSku) {
      if (currentSku.sku_thumb) {
        setSelectedImage(mediaService.getMediaUrl(currentSku.sku_thumb));
      } else if (product?.spu_select?.product_thumb) {
        setSelectedImage(mediaService.getMediaUrl(product.spu_select.product_thumb));
      } else if (currentSku.sku_images && currentSku.sku_images.length > 0) {
        setSelectedImage(mediaService.getMediaUrl(currentSku.sku_images[0]));
      } else if (product?.spu_select?.product_images && product.spu_select.product_images.length > 0) {
        setSelectedImage(mediaService.getMediaUrl(product.spu_select.product_images[0]));
      } else {
        setSelectedImage('/placeholder.svg');
      }
    }
  }, [currentSku, product]);

  // Enhanced thumbnail click with smooth transition
  const handleThumbnailClick = (imageId: string) => {
    setIsImageLoading(true);
    
    setTimeout(() => {
      setSelectedImage(mediaService.getMediaUrl(imageId));
      setTimeout(() => {
        setIsImageLoading(false);
      }, 150);
    }, 100);
  };

  // Image preview functions with smooth animations
  const openImageModal = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex);
    setIsImageModalOpen(true);
    setIsModalClosing(false);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
    setIsImageLoading(true);
    
    // Add smooth fade-in animation
    document.body.style.overflow = 'hidden';
    
    // Simulate loading for smooth transition
    setTimeout(() => {
      setIsImageLoading(false);
    }, 200);
  };

  const closeImageModal = () => {
    setIsModalClosing(true);
    
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      setIsImageModalOpen(false);
      setIsModalClosing(false);
      setImageZoom(1);
      setImagePosition({ x: 0, y: 0 });
      setIsDragging(false);
      document.body.style.overflow = 'auto';
    }, 300);
  };

  const nextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
      setIsImageLoading(true);
      
      // Add smooth transition
      setTimeout(() => {
        setCurrentImageIndex(currentImageIndex + 1);
        setImageZoom(1);
        setImagePosition({ x: 0, y: 0 });
        
        setTimeout(() => {
          setIsImageLoading(false);
        }, 150);
      }, 100);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setIsImageLoading(true);
      
      // Add smooth transition
      setTimeout(() => {
        setCurrentImageIndex(currentImageIndex - 1);
        setImageZoom(1);
        setImagePosition({ x: 0, y: 0 });
        
        setTimeout(() => {
          setIsImageLoading(false);
        }, 150);
      }, 100);
    }
  };

  const zoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = () => {
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Handle variation selection
  const handleVariationChange = (variationId: string, valueIndex: number) => {
    const newSelections = {
      ...selectedVariations,
      [variationId]: valueIndex
    };
    setSelectedVariations(newSelections);

    // Find matching SKU based on selected variations
    const targetTierIdx = product?.spu_select?.product_variations.map(variation => 
      newSelections[variation._id] ?? 0
    ) || [];

    // Check if current SKU matches
    const currentMatches = JSON.stringify(product?.sku_tier_idx) === JSON.stringify(targetTierIdx);
    
    if (!currentMatches) {
      // Find in sku_others
      const matchingSku = product?.sku_others?.find(sku => 
        JSON.stringify(sku.sku_tier_idx) === JSON.stringify(targetTierIdx)
      );

      if (matchingSku) {
        setCurrentSku(matchingSku);
        setSelectedSkuId(matchingSku._id);
      }
    } else if (product) {
      // Use main SKU
      setCurrentSku(product);
      setSelectedSkuId(product._id);
    }
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (!isImageModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeImageModal();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextImage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImageModalOpen, currentImageIndex, allImages.length]);

  // Review functions
  const handleSubmitReview = () => {
    if (newReview.comment.trim()) {
      const review: Review = {
        _id: Date.now().toString(),
        user_name: 'Current User', // Would come from auth context
        rating: newReview.rating,
        comment: newReview.comment,
        created_at: new Date().toISOString(),
        helpful_count: 0
      };
      setReviews(prev => [review, ...prev]);
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb Skeleton */}
          <Skeleton className="h-6 w-1/2 mb-6" /> 
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Image Gallery Skeleton */}
            <div>
              <Skeleton className="w-full aspect-square rounded-lg mb-4" />
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-full aspect-square rounded" />
                ))}
              </div>
            </div>
            {/* Product Info Skeleton */}
            <div className="space-y-5">
              <Skeleton className="h-10 w-3/4" /> {/* Name */}
              <Skeleton className="h-6 w-1/2" /> {/* Rating/Sold */}
              <Skeleton className="h-12 w-1/3" /> {/* Price */}
              <Skeleton className="h-6 w-1/4" /> {/* Stock */}
              <Skeleton className="h-px w-full" /> {/* Separator */}
              <Skeleton className="h-20 w-full" /> {/* Shop Info */}
              <Skeleton className="h-px w-full" /> {/* Separator */}
              <Skeleton className="h-8 w-1/4 mb-2" /> {/* Description Title */}
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-px w-full mt-3" /> {/* Separator */}
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Error Loading Product</h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <Button onClick={() => router.push('/products')} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Products
          </Button>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
           <Info className="h-16 w-16 text-blue-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6 text-center">The product you are looking for does not exist or was not found.</p>
          <Button onClick={() => router.push('/products')} variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Products
          </Button>
        </div>
      </>
    );
  }

  // Get current price and stock from current SKU
  const currentPrice = currentSku?.sku_price || 0;
  const currentStock = currentSku?.sku_stock || 0;

  return (
    <>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <nav className="mb-6 text-sm text-gray-500 flex items-center space-x-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600">Products</Link>
          <span>/</span>
          <span className="font-medium text-gray-700 truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
            {product?.spu_select?.product_name}
          </span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className='md:sticky md:top-24'>
            <div 
              className="relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm mb-3 cursor-zoom-in group"
              onClick={() => openImageModal(0)}
            >
              {/* Loading Overlay */}
              {isImageLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-600">Loading...</span>
                  </div>
                </div>
              )}
              
              {selectedImage ? (
                <>
                  <NextImage
                    src={selectedImage}
                    alt={product?.spu_select?.product_name || 'Product Image'}
                    layout="fill"
                    objectFit="contain"
                    className="transition-all duration-500 ease-in-out group-hover:scale-105"
                    onLoadingComplete={(image) => {
                      image.classList.remove('opacity-0');
                      setIsImageLoading(false);
                    }}
                    onLoadStart={() => setIsImageLoading(true)}
                    onError={() => {
                      if (selectedImage !== '/placeholder.svg') {
                          setSelectedImage('/placeholder.svg');
                      }
                      setIsImageLoading(false);
                    }}
                    priority
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 bg-white bg-opacity-90 rounded-full p-2">
                      <Maximize2 className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <LayoutGrid className="w-20 h-20 text-gray-300" />
                </div>
              )}
            </div>
            
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {allImages.map((imgId, index) => (
                  <button
                    key={imgId}
                    onClick={() => handleThumbnailClick(imgId)}
                    className={`relative aspect-square w-full rounded-md overflow-hidden border-2 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      mediaService.getMediaUrl(imgId) === selectedImage 
                        ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-1 shadow-md scale-105' 
                        : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <NextImage
                      src={mediaService.getMediaUrl(imgId)}
                      alt={`${product?.spu_select?.product_name} thumbnail`}
                      layout="fill"
                      objectFit="cover"
                      className="bg-gray-50 transition-all duration-300 hover:brightness-110"
                      onLoadingComplete={(image) => image.classList.remove('opacity-0')}
                      onError={(e) => { 
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                        target.srcset = '';
                      }}
                    />
                    {/* Selection indicator */}
                    {mediaService.getMediaUrl(imgId) === selectedImage && (
                      <div className="absolute inset-0 bg-blue-600 bg-opacity-10 flex items-center justify-center">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 py-2">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                {product?.spu_select?.product_name}
              </h1>
            </div>

            {/* Category Information */}
            {product.category && product.category.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/categories?category=${product.category[0]._id}`}
                        className="text-green-700 font-semibold hover:text-green-800 transition-colors"
                      >
                        {product.category[0].category_name}
                      </Link>
                    </div>
                    {product.category[0].category_description && (
                      <p className="text-sm text-gray-600 mt-1">{product.category[0].category_description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rating and Sales */}
            {(product.spu_select.product_rating_avg || (product.spu_select.product_sold && product.spu_select.product_sold > 0)) && (
              <div className="flex items-center gap-3 text-sm">
                {product.spu_select.product_rating_avg && product.spu_select.product_rating_avg > 0 && (
                  <>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.round(product.spu_select.product_rating_avg!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="ml-1.5 text-gray-600">({product.spu_select.product_rating_avg.toFixed(1)})</span>
                    </div>
                    {product.spu_select.product_sold && product.spu_select.product_sold > 0 && <span className="text-gray-400">•</span>}
                  </>
                )}
                {product.spu_select.product_sold && product.spu_select.product_sold > 0 && (
                  <span className="text-gray-600">{product.spu_select.product_sold.toLocaleString()} sold</span>
                )}
              </div>
            )}
            
            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-blue-700">
                ${currentPrice.toFixed(2)}
              </span>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 pt-2">
              <Package className={`h-5 w-5 ${currentStock > 0 ? 'text-green-600' : 'text-red-500'}`} />
              {currentStock > 0 ? (
                <span className="font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md text-sm">
                  In Stock <span className='text-gray-600 font-normal'>({currentStock} available)</span>
                </span>
              ) : (
                <span className="font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md text-sm">Out of Stock</span>
              )}
            </div>

            <Separator className="!my-5" />

            {/* Product Variations */}
            {product.spu_select.product_variations && product.spu_select.product_variations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-blue-600" /> Select Options
                </h3>
                {product.spu_select.product_variations.map((variation) => (
                  <div key={variation._id} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {variation.variation_name}:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variation.variation_values.map((value, valueIndex) => {
                        const isSelected = selectedVariations[variation._id] === valueIndex;
                        return (
                          <button
                            key={valueIndex}
                            onClick={() => handleVariationChange(variation._id, valueIndex)}
                            className={`px-4 py-2 rounded-md border transition-all duration-200 hover:scale-105 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium shadow-md'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Current Selection Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Current Selection:</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.spu_select.product_variations.map((variation) => {
                      const selectedIndex = selectedVariations[variation._id] ?? 0;
                      const selectedValue = variation.variation_values[selectedIndex];
                      return (
                        <div key={variation._id} className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-md border border-blue-300 shadow-sm">
                          <span className="text-sm font-medium text-gray-700">{variation.variation_name}:</span>
                          <span className="text-sm text-blue-700 font-semibold ml-1">{selectedValue}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <Separator className="!my-5" />

            {/* Shop Information */}
            {product.spu_select.product_shop && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1.5">Sold and Shipped by:</p>
                <Link href={`/shop/${product.spu_select.product_shop}`} className="flex items-center gap-3 group p-1 -m-1 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <span className="text-md font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      Shop ID: {product.spu_select.product_shop}
                    </span>
                    <p className="text-xs text-gray-500">View Store</p>
                  </div>
                </Link>
              </div>
            )}
            
            <Separator className="!my-5"/>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" /> Product Description
              </h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                {product.spu_select.product_description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.spu_select.product_description.replace(/\n/g, '<br />') }} />
                ) : (
                  <p>No description available for this product.</p>
                )}
              </div>
            </div>

            {/* Product Attributes */}
            {product.spu_select.product_attributes && product.spu_select.product_attributes.length > 0 && (
              <div className="pt-2">
                <Separator className="!my-5" />
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-blue-600" /> Specifications
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {product.spu_select.product_attributes.map((attr: ProductAttribute, index: number) => (
                    <li key={index} className="flex justify-between items-center border-b border-gray-100 py-2 last:border-b-0">
                      <span className="text-gray-600 font-medium">{attr.attr_name}:</span>
                      <span className="text-gray-800 text-right">{attr.attr_value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Separator className="!my-6" />

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <Button
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-base py-3 h-auto shadow-md hover:shadow-lg transition-shadow"
                disabled={currentStock === 0}
                onClick={() => console.log('Add to cart:', currentSku?._id)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button
                size="lg" 
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-center text-base py-3 h-auto shadow-md hover:shadow-lg transition-shadow"
                disabled={currentStock === 0}
                onClick={() => console.log('Buy now:', currentSku?._id)}
              >
                <Zap className="mr-2 h-5 w-5" /> Buy Now
              </Button>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {isImageModalOpen && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
              isModalClosing 
                ? 'bg-black bg-opacity-0 opacity-0' 
                : 'bg-black bg-opacity-90 opacity-100'
            }`}
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <div className={`relative w-full h-full flex items-center justify-center p-4 transition-transform duration-300 ${
              isModalClosing ? 'scale-95' : 'scale-100'
            }`}>
              {/* Close Button */}
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 hover:scale-110"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Main Image */}
              <div className="relative max-w-full max-h-full overflow-hidden">
                <NextImage
                  src={mediaService.getMediaUrl(allImages[currentImageIndex])}
                  alt={`${product?.spu_select?.product_name} - Image ${currentImageIndex + 1}`}
                  width={800}
                  height={800}
                  objectFit="contain"
                  className="max-w-full max-h-screen"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                  priority
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
