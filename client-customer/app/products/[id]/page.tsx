"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NextImage from 'next/image'; // Aliased to avoid conflict if any
import Link from 'next/link';
import { ChevronLeft, ShoppingCart, Zap, Star, Package, AlertTriangle, Info, Tag, LayoutGrid, Heart } from 'lucide-react';

import productService, { ProductDetail } from '@/lib/services/api/productService'; // Corrected: default import
import { mediaService } from '@/lib/services/api/mediaService';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // const [isWishlisted, setIsWishlisted] = useState(false); // For future wishlist functionality

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        setProduct(null); // Reset product state on new ID
        try {
          const data = await productService.getProductById(productId);
          setProduct(data);
          if (data.product_thumb) {
            setSelectedImage(mediaService.getMediaUrl(data.product_thumb));
          } else if (data.product_images && data.product_images.length > 0) {
            setSelectedImage(mediaService.getMediaUrl(data.product_images[0]));
          } else {
            setSelectedImage('/placeholder.svg'); // Default placeholder if no images
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

  const handleThumbnailClick = (imageId: string) => {
    setSelectedImage(mediaService.getMediaUrl(imageId));
  };

  // const toggleWishlist = () => setIsWishlisted(!isWishlisted);

  if (loading) {
    return (
      <>
        <Header />
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
        <Header />
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
        <Header />
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

  const allImages = [product.product_thumb, ...(product.product_images || [])].filter(Boolean) as string[];

  return (
    <>
      <Header />
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
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm mb-3">
              {selectedImage ? (
                <NextImage // Use aliased import
                  src={selectedImage}
                  alt={product.product_name}
                  layout="fill"
                  objectFit="contain"
                  className="transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                  onLoadingComplete={(image) => image.classList.remove('opacity-0')}
                  onError={() => {
                    // Attempt to load placeholder if selectedImage fails
                    if (selectedImage !== '/placeholder.svg') {
                        setSelectedImage('/placeholder.svg');
                    }
                  }}
                priority
              />
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

            {(product.product_ratingsAverage || product.sold_count > 0) && (
                <div className="flex items-center gap-3 text-sm">
                    {product.product_ratingsAverage && product.product_ratingsAverage > 0 && (
                        <>
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                    <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < Math.round(product.product_ratingsAverage!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                                <span className="ml-1.5 text-gray-600">({product.product_ratingsAverage.toFixed(1)})</span>
                            </div>
                            {product.sold_count > 0 && <span className="text-gray-400">•</span>}
                        </>
                    )}
                    {product.sold_count > 0 && (
                        <span className="text-gray-600">{product.sold_count.toLocaleString()} sold</span>
                    )}
                </div>
            )}
            
            <div className="flex items-baseline gap-3">
                {product.salePrice && product.salePrice < product.product_price ? (
                    <>
                        <span className="text-3xl font-bold text-red-600">
                            ${product.salePrice.toFixed(2)}
                        </span>
                        <span className="text-xl text-gray-500 line-through">
                            ${product.product_price.toFixed(2)}
                </span>
                        {product.discount && (
                             <Badge variant="destructive" className="text-xs font-semibold py-0.5 px-1.5">{product.discount}% OFF</Badge>
                        )}
                    </>
                ) : (
                    <span className="text-3xl font-bold text-blue-700">
                        ${product.product_price.toFixed(2)}
                </span>
                )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Package className={`h-5 w-5 ${product.product_quantity > 0 ? 'text-green-600' : 'text-red-500'}`} />
              {product.product_quantity > 0 ? (
                <span className="font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md text-sm">
                  In Stock <span className='text-gray-600 font-normal'>({product.product_quantity} available)</span>
                </span>
              ) : (
                <span className="font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md text-sm">Out of Stock</span>
              )}
            </div>

            <Separator className="!my-5" />

            {product.shop && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1.5">Sold and Shipped by:</p>
                <Link href={`/shop/${product.shop._id}`} className="flex items-center gap-3 group p-1 -m-1 rounded-md hover:bg-gray-50 transition-colors">
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
                disabled={product.product_quantity === 0}
                onClick={() => console.log('Add to cart:', product._id)} // Placeholder action
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button
                size="lg" 
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-center text-base py-3 h-auto shadow-md hover:shadow-lg transition-shadow"
                disabled={product.product_quantity === 0}
                onClick={() => console.log('Buy now:', product._id)} // Placeholder action
              >
                <Zap className="mr-2 h-5 w-5" /> Buy Now
              </Button>
            </div>
          </div>
        </div>
                </div>
    </>
  );
}
