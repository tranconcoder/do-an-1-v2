"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NextImage from 'next/image'; // Aliased to avoid conflict if any
import Link from 'next/link';
import { ChevronLeft, ShoppingCart, Zap, Star, Package, AlertTriangle, Info, Tag, LayoutGrid, Heart, Palette, FolderOpen, MessageSquare, ThumbsUp, User, Calendar, ZoomIn, ZoomOut, X, ChevronRight, ChevronLeft as ChevronLeftIcon, Maximize2 } from 'lucide-react';

import productService, { ProductSkuDetail, ProductSku } from '@/lib/services/api/productService'; // Updated to use SKU interface
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

  const [product, setProduct] = useState<ProductSkuDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductSku[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  
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
  // const [isWishlisted, setIsWishlisted] = useState(false); // For future wishlist functionality

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
          setProduct(data);
          setSelectedSkuId(data.sku?._id || productId);

          // Fetch related products by category
          if (data.product_category) {
            setLoadingRelated(true);
            try {
              const related = await productService.getSkusByCategory(data.product_category, 8);
              // Filter out current product
              const filteredRelated = related.filter(p => p.sku._id !== data.sku._id);
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

  // Update selected image when product changes
  useEffect(() => {
    if (product) {
      if (product.sku?.sku_thumb) {
        setSelectedImage(mediaService.getMediaUrl(product.sku.sku_thumb));
      } else if (product.product_thumb) {
        setSelectedImage(mediaService.getMediaUrl(product.product_thumb));
      } else if (product.sku?.sku_images && product.sku.sku_images.length > 0) {
        setSelectedImage(mediaService.getMediaUrl(product.sku.sku_images[0]));
      } else if (product.product_images && product.product_images.length > 0) {
        setSelectedImage(mediaService.getMediaUrl(product.product_images[0]));
      } else {
        setSelectedImage('/placeholder.svg');
      }
    }
  }, [product]);

  const handleThumbnailClick = (imageId: string) => {
    setSelectedImage(mediaService.getMediaUrl(imageId));
  };

  // Image preview functions
  const openImageModal = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex);
    setIsImageModalOpen(true);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const nextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setImageZoom(1);
      setImagePosition({ x: 0, y: 0 });
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setImageZoom(1);
      setImagePosition({ x: 0, y: 0 });
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

  // const toggleWishlist = () => setIsWishlisted(!isWishlisted);

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

  // Combine SKU and SPU images with SKU images taking priority
  const allImages = [
    ...(product?.sku?.sku_thumb ? [product.sku.sku_thumb] : []),
    ...(product?.sku?.sku_images || []),
    ...(product?.product_thumb && !product?.sku?.sku_thumb ? [product.product_thumb] : []),
    ...(product?.product_images || [])
  ].filter((img, index, arr) => img && arr.indexOf(img) === index); // Remove duplicates

  // Get current price and stock from SKU
  const currentPrice = product?.sku?.sku_price || product?.salePrice || 0;
  const currentStock = product?.sku?.sku_stock || 0;
  const displayThumb = product?.sku?.sku_thumb || product?.product_thumb;

  return (
    <>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <nav className="mb-6 text-sm text-gray-500 flex items-center space-x-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600">Products</Link>
          <span>/</span>
          <span className="font-medium text-gray-700 truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
            {product.product_name}
              </span>
            </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className='md:sticky md:top-24'>
            <div 
              className="relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm mb-3 cursor-zoom-in group"
              onClick={() => openImageModal(0)}
            >
              {selectedImage ? (
                <>
                  <NextImage // Use aliased import
                    src={selectedImage}
                    alt={product.product_name}
                    layout="fill"
                    objectFit="contain"
                    className="transition-opacity duration-300 opacity-0 group-hover:opacity-90"
                    onLoadingComplete={(image) => image.classList.remove('opacity-0')}
                    onError={() => {
                      // Attempt to load placeholder if selectedImage fails
                      if (selectedImage !== '/placeholder.svg') {
                          setSelectedImage('/placeholder.svg');
                      }
                    }}
                  priority
                />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-2">
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
                {allImages.map((imgId) => (
                  <button
                    key={imgId}
                    onClick={() => handleThumbnailClick(imgId)}
                    className={`relative aspect-square w-full rounded-md overflow-hidden border-2 hover:border-blue-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                ${mediaService.getMediaUrl(imgId) === selectedImage ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-1' : 'border-gray-200'}`}
                  >
                    <NextImage // Use aliased import
                      src={mediaService.getMediaUrl(imgId)}
                      alt={`${product.product_name} thumbnail`}
                      layout="fill"
                      objectFit="cover"
                      className="bg-gray-50 transition-opacity duration-300 opacity-0"
                      onLoadingComplete={(image) => image.classList.remove('opacity-0')}
                      onError={(e) => { 
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                        target.srcset = ''; // Clear srcset as well if it was set
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
                </div>

          <div className="space-y-6 py-2">
            <div className="flex justify-between items-start">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">{product.product_name}</h1>
                {/* <Button variant="ghost" size="icon" onClick={toggleWishlist} className="text-gray-400 hover:text-red-500">
                    <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button> */}
          </div>

            {/* Category Information */}
            {product.category && product.category.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <div className="flex items-center gap-2">
                      {product.category[0].category_icon && (
                        <div className="w-6 h-6 relative">
                          <NextImage
                            src={mediaService.getMediaUrl(product.category[0].category_icon)}
                            alt={product.category[0].category_name}
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

            {(product.product_rating_avg || (product.sold_count && product.sold_count > 0)) && (
                <div className="flex items-center gap-3 text-sm">
                    {product.product_rating_avg && product.product_rating_avg > 0 && (
                        <>
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                    <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < Math.round(product.product_rating_avg!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                                <span className="ml-1.5 text-gray-600">({product.product_rating_avg.toFixed(1)})</span>
                            </div>
                            {product.sold_count && product.sold_count > 0 && <span className="text-gray-400">•</span>}
                        </>
                    )}
                    {product.sold_count && product.sold_count > 0 && (
                        <span className="text-gray-600">{product.sold_count.toLocaleString()} sold</span>
                    )}
                </div>
            )}
            
            <div className="flex items-baseline gap-3">
                {product.salePrice && product.salePrice < currentPrice ? (
                    <>
                        <span className="text-3xl font-bold text-red-600">
                            ${product.salePrice.toFixed(2)}
                        </span>
                        <span className="text-xl text-gray-500 line-through">
                            ${currentPrice.toFixed(2)}
                </span>
                        {product.discount && (
                             <Badge variant="destructive" className="text-xs font-semibold py-0.5 px-1.5">{product.discount}% OFF</Badge>
                        )}
                    </>
                ) : (
                    <span className="text-3xl font-bold text-blue-700">
                        ${currentPrice.toFixed(2)}
                </span>
                )}
            </div>

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

            {/* SKU Variation Display */}
            {product.sku?.sku_value && product.sku.sku_value.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-blue-600" /> Selected Variation
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sku.sku_value.map((variation, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-md border border-blue-300 shadow-sm">
                      <span className="text-sm font-medium text-gray-700">{variation.key}:</span>
                      <span className="text-sm text-blue-700 font-semibold ml-1">{variation.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="!my-5" />

            {product.shop && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1.5">Sold and Shipped by:</p>
                <Link href={`/shop/${product.shop._id || product.product_shop}`} className="flex items-center gap-3 group p-1 -m-1 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border bg-gray-100">
                    <NextImage // Use aliased import
                      src={mediaService.getMediaUrl(product.shop.shop_logo)}
                      alt={`${product.shop.shop_name} logo`}
                      layout="fill"
                      objectFit="cover"
                       onError={(e) => { 
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                        target.srcset = ''; 
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-md font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {product.shop.shop_name}
                      </span>
                     {/* <p className="text-xs text-gray-500">View Store</p> */}
                  </div>
                </Link>
                              </div>
                            )}
            
            <Separator className="!my-5"/>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" /> Product Description
              </h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                {product.product_description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.product_description.replace(/\n/g, '<br />') }} />
                 ) : (
                    <p>No description available for this product.</p>
                )}
              </div>
            </div>

            {product.product_attributes && product.product_attributes.length > 0 && (
              <div className="pt-2">
                <Separator className="!my-5" />
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-blue-600" /> Specifications
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {product.product_attributes.map((attr, index) => (
                    <li key={index} className="flex justify-between items-center border-b border-gray-100 py-2 last:border-b-0">
                      <span className="text-gray-600 font-medium">{attr.k}:</span>
                      <span className="text-gray-800 text-right">{attr.v} {attr.u || ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Separator className="!my-6" />

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <Button
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-base py-3 h-auto shadow-md hover:shadow-lg transition-shadow"
                disabled={currentStock === 0}
                onClick={() => console.log('Add to cart:', product.sku?._id)} // Use SKU ID for cart
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button
                size="lg" 
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-center text-base py-3 h-auto shadow-md hover:shadow-lg transition-shadow"
                disabled={currentStock === 0}
                onClick={() => console.log('Buy now:', product.sku?._id)} // Use SKU ID for purchase
              >
                <Zap className="mr-2 h-5 w-5" /> Buy Now
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
              <MessageSquare className="mr-3 h-6 w-6 text-blue-600" />
              Customer Reviews
            </h2>
            {ratingBreakdown && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{ratingBreakdown.average.toFixed(1)} out of 5 stars</span>
                <span>•</span>
                <span>{ratingBreakdown.total} reviews</span>
              </div>
            )}
          </div>

          {loadingReviews ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Rating Breakdown */}
              {ratingBreakdown && (
                <div className="lg:col-span-1">
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm w-3">{rating}</span>
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${(ratingBreakdown[rating as keyof typeof ratingBreakdown] / ratingBreakdown.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">{ratingBreakdown[rating as keyof typeof ratingBreakdown]}</span>
                        </div>
                      ))}
                    </div>

                    {/* Write Review Button */}
                    <Button 
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                    >
                      Write a Review
                    </Button>

                    {/* Review Form */}
                    {showReviewForm && (
                      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">Rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-6 h-6 cursor-pointer transition-colors ${
                                  star <= newReview.rating 
                                    ? 'text-yellow-400 fill-yellow-400' 
                                    : 'text-gray-300 hover:text-yellow-300'
                                }`}
                                onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">Your Review</label>
                          <textarea
                            className="w-full p-3 border rounded-md resize-none"
                            rows={4}
                            placeholder="Share your experience with this product..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSubmitReview} size="sm">
                            Submit Review
                          </Button>
                          <Button 
                            onClick={() => setShowReviewForm(false)} 
                            variant="outline" 
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review._id} className="bg-white border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{review.user_name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatDate(review.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {review.comment}
                        </p>

                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mb-4">
                            {review.images.map((img, index) => (
                              <div key={index} className="w-16 h-16 rounded border overflow-hidden">
                                <NextImage
                                  src={mediaService.getMediaUrl(img)}
                                  alt={`Review image ${index + 1}`}
                                  width={64}
                                  height={64}
                                  objectFit="cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            Helpful ({review.helpful_count || 0})
                          </button>
                          <span>•</span>
                          <span>Verified Purchase</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No reviews yet</h3>
                      <p>Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Products Section */}
        {product.category && product.category.length > 0 && (
          <div className="mt-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Related Products</h2>
              <p className="text-gray-600">Other products in {product.category[0].category_name}</p>
            </div>

            {loadingRelated ? (
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
        )}
        
        {/* Image Preview Modal */}
        {isImageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Close Button */}
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Navigation Buttons */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    disabled={currentImageIndex === allImages.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}

              {/* Zoom Controls */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <button
                  onClick={zoomIn}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all"
                  disabled={imageZoom >= 3}
                >
                  <ZoomIn className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={zoomOut}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all"
                  disabled={imageZoom <= 0.5}
                >
                  <ZoomOut className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={resetZoom}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all text-xs text-white font-medium"
                >
                  1:1
                </button>
              </div>

              {/* Image Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-white bg-opacity-20 rounded-full text-white text-sm">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              )}

              {/* Main Image */}
              <div 
                className="relative max-w-full max-h-full overflow-hidden cursor-move"
                style={{
                  transform: `scale(${imageZoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  transition: imageZoom === 1 ? 'transform 0.3s ease' : 'none'
                }}
                onMouseDown={(e) => {
                  if (imageZoom > 1) {
                    const startX = e.clientX - imagePosition.x;
                    const startY = e.clientY - imagePosition.y;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      setImagePosition({
                        x: e.clientX - startX,
                        y: e.clientY - startY
                      });
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }
                }}
              >
                <NextImage
                  src={mediaService.getMediaUrl(allImages[currentImageIndex])}
                  alt={`${product.product_name} - Image ${currentImageIndex + 1}`}
                  width={800}
                  height={800}
                  objectFit="contain"
                  className="max-w-full max-h-screen"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white bg-opacity-20 p-2 rounded-lg max-w-md overflow-x-auto">
                  {allImages.map((imgId, index) => (
                    <button
                      key={imgId}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setImageZoom(1);
                        setImagePosition({ x: 0, y: 0 });
                      }}
                      className={`relative w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-white' 
                          : 'border-transparent hover:border-white/50'
                      }`}
                    >
                      <NextImage
                        src={mediaService.getMediaUrl(imgId)}
                        alt={`Thumbnail ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
                </div>
    </>
  );
}
