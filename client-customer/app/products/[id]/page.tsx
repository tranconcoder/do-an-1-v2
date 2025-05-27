"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NextImage from 'next/image'; // Aliased to avoid conflict if any
import Link from 'next/link';
import { ChevronLeft, ShoppingCart, Zap, Star, Package, AlertTriangle, Info, Tag, LayoutGrid, Heart, Palette } from 'lucide-react';

import productService, { ProductSkuDetail, ProductSku } from '@/lib/services/api/productService'; // Updated to use SKU interface
import { mediaService } from '@/lib/services/api/mediaService';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string; // This could be either SKU ID or SPU ID

  const [product, setProduct] = useState<ProductSkuDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [availableSkus, setAvailableSkus] = useState<ProductSku[]>([]);
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  // const [isWishlisted, setIsWishlisted] = useState(false); // For future wishlist functionality

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        setProduct(null);
        setAvailableSkus([]);
        try {
          // First try to fetch as SKU ID
          try {
            const data = await productService.getSkuById(productId);
            setProduct(data);
            setSelectedSkuId(data.sku?._id || productId);
            
            // Try to fetch other SKUs for this product
            try {
              const skus = await productService.getSkusBySpuId(data._id);
              setAvailableSkus(skus);
            } catch (skuError) {
              // Ignore if endpoint doesn't exist or fails
              console.log('Could not fetch additional SKUs:', skuError);
            }
            
          } catch (skuError) {
            // If SKU fetch fails, try as SPU ID and get first available SKU
            try {
              const skus = await productService.getSkusBySpuId(productId);
              if (skus.length > 0) {
                // Convert first SKU to ProductSkuDetail format
                const firstSku = skus[0];
                const skuDetailData = await productService.getSkuById(firstSku.sku._id);
                setProduct(skuDetailData);
                setSelectedSkuId(firstSku.sku._id);
                setAvailableSkus(skus);
              } else {
                throw new Error('No SKUs found for this product');
              }
            } catch (spuError) {
              // If both fail, try the old SPU detail endpoint as fallback
              const data = await productService.getProductById(productId);
              // Convert ProductDetail to ProductSkuDetail format
              const convertedData: ProductSkuDetail = {
                ...data,
                product_category: data.product_category || '', // Ensure it's not undefined
                product_shop: data.shop?._id || '',
                product_slug: data.product_name.toLowerCase().replace(/\s+/g, '-'),
                sku: {
                  _id: productId, // Use product ID as SKU ID fallback
                  sku_product: data._id,
                  sku_price: data.product_price,
                  sku_stock: data.product_quantity,
                  sku_thumb: data.product_thumb,
                  sku_images: data.product_images,
                  sku_value: []
                },
                product_variations: [],
                product_rating_avg: data.product_ratingsAverage
              };
              setProduct(convertedData);
              setSelectedSkuId(productId);
            }
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

  // Handle SKU selection when multiple SKUs are available
  const handleSkuSelection = async (skuId: string) => {
    if (skuId === selectedSkuId) return;
    
    setLoading(true);
    try {
      const data = await productService.getSkuById(skuId);
      setProduct(data);
      setSelectedSkuId(skuId);
      
      // Update selected image for new SKU
      if (data.sku?.sku_thumb) {
        setSelectedImage(mediaService.getMediaUrl(data.sku.sku_thumb));
      } else if (data.product_thumb) {
        setSelectedImage(mediaService.getMediaUrl(data.product_thumb));
      }
    } catch (err) {
      console.error('Failed to switch SKU:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailClick = (imageId: string) => {
    setSelectedImage(mediaService.getMediaUrl(imageId));
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
    ...(product.sku?.sku_thumb ? [product.sku.sku_thumb] : []),
    ...(product.sku?.sku_images || []),
    ...(product.product_thumb && !product.sku?.sku_thumb ? [product.product_thumb] : []),
    ...(product.product_images || [])
  ].filter((img, index, arr) => img && arr.indexOf(img) === index); // Remove duplicates

  // Get current price and stock from SKU
  const currentPrice = product.sku?.sku_price || product.salePrice || 0;
  const currentStock = product.sku?.sku_stock || 0;
  const displayThumb = product.sku?.sku_thumb || product.product_thumb;

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

            {/* Available SKUs/Variations Selector */}
            {availableSkus.length > 1 && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-gray-600" /> Available Variations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableSkus.map((skuItem) => (
                    <button
                      key={skuItem.sku._id}
                      onClick={() => handleSkuSelection(skuItem.sku._id)}
                      className={`p-3 rounded-md border-2 transition-all duration-200 text-left ${
                        selectedSkuId === skuItem.sku._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          <NextImage
                            src={mediaService.getMediaUrl(skuItem.sku.sku_thumb)}
                            alt="SKU thumbnail"
                            layout="fill"
                            objectFit="cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1 mb-1">
                            {skuItem.sku.sku_value.map((variation, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-700"
                              >
                                {variation.value}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm font-semibold text-blue-600">
                            ${skuItem.sku.sku_price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {skuItem.sku.sku_stock > 0 ? `${skuItem.sku.sku_stock} in stock` : 'Out of stock'}
                          </p>
                        </div>
                      </div>
                    </button>
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
                </div>
    </>
  );
}
