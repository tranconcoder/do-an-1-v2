'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Star, Heart, ShoppingCart, Zap, X } from 'lucide-react';

import productService, {
    ProductDetailResponse,
    ProductSku,
    ProductAttribute,
    ProductVariation,
    SpuSelect,
    SkuOther
} from '@/lib/services/api/productService';
import { Category } from '@/lib/services/api/categoryService';
import shopService, { Shop } from '@/lib/services/api/shopService';
import reviewService, { Review } from '@/lib/services/api/reviewService';
import ReviewDisplay from '@/components/review/ReviewDisplay';
import { mediaService } from '@/lib/services/api/mediaService';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store/store';
import { addItemToCart } from '@/lib/store/slices/cartSlice';

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
    RelatedProducts,
    ProductNavigation
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
    const { toast } = useToast();
    const dispatch = useDispatch<AppDispatch>();

    const [product, setProduct] = useState<ProductDetailResponse | null>(null);
    const [shop, setShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingShop, setLoadingShop] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<ProductSku[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [selectedVariations, setSelectedVariations] = useState<{ [key: string]: number }>({});
    const [currentSku, setCurrentSku] = useState<ProductDetailResponse | SkuOther | null>(null);

    // Review states
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown | null>(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [latestReview, setLatestReview] = useState<Review | null>(null);
    const [loadingLatestReview, setLoadingLatestReview] = useState(false);

    // Image modal states
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Combine SKU and SPU images with current SKU images taking priority
    const allImages = [
        ...(currentSku?.sku_thumb ? [currentSku.sku_thumb] : []),
        ...(currentSku?.sku_images || []),
        ...(product?.spu_select?.product_thumb && !currentSku?.sku_thumb
            ? [product.spu_select.product_thumb]
            : []),
        ...(product?.spu_select?.product_images || [])
    ].filter((img, index, arr) => img && arr.indexOf(img) === index); // Remove duplicates

    // Calculate current stock
    const currentStock = currentSku?.sku_stock ?? product?.spu_select?.product_quantity ?? 0;

    // Get breadcrumb data
    const breadcrumbData = product
        ? {
              category: product.spu_select.product_category,
              productName: product.spu_select.product_name
          }
        : null;

    // Helper functions for variation logic
    // B1: Initially show all options that exist in any sku_tier_idx
    // B2: When making selections, disable options that don't have compatible SKUs
    // B3: When selecting, keep compatible fields and remove incompatible ones
    // B4: Allow deselection by clicking the same button again

    const getAllAvailableOptions = (variationIndex: number) => {
        if (!product?.sku_others) return [];

        const availableOptions = new Set<number>();

        // Collect options from all other SKUs
        product.sku_others.forEach((sku) => {
            if (sku.sku_tier_idx && sku.sku_tier_idx[variationIndex] !== undefined) {
                availableOptions.add(sku.sku_tier_idx[variationIndex]);
            }
        });

        // Also include options from current SKU if it has sku_tier_idx
        if (product.sku_tier_idx && product.sku_tier_idx[variationIndex] !== undefined) {
            availableOptions.add(product.sku_tier_idx[variationIndex]);
        }

        console.log(
            `Available options for variation ${variationIndex}:`,
            Array.from(availableOptions)
        );
        return Array.from(availableOptions);
    };

    const getValidVariationOptions = (variationIndex: number) => {
        if (!product?.sku_others || !product?.spu_select?.product_variations) return [];

        // If no selections made, return all available options
        if (Object.keys(selectedVariations).length === 0) {
            return getAllAvailableOptions(variationIndex);
        }

        const validOptions = new Set<number>();
        const allSkus = [...product.sku_others];

        // Add current SKU if it has sku_tier_idx
        if (product.sku_tier_idx) {
            allSkus.push(product as any);
        }

        // Get options that are compatible with current selections
        allSkus.forEach((sku) => {
            if (sku.sku_tier_idx && sku.sku_tier_idx[variationIndex] !== undefined) {
                // Check if this SKU is compatible with current selections
                let isCompatible = true;
                Object.entries(selectedVariations).forEach(([varIdx, optIdx]) => {
                    const varIndex = parseInt(varIdx);
                    if (varIndex !== variationIndex && sku.sku_tier_idx[varIndex] !== optIdx) {
                        isCompatible = false;
                    }
                });

                if (isCompatible) {
                    validOptions.add(sku.sku_tier_idx[variationIndex]);
                }
            }
        });

        return Array.from(validOptions);
    };

    const isOptionDisabled = (variationIndex: number, optionIndex: number) => {
        if (!product?.sku_others) return true;

        // B1: Check if this option exists in ANY SKU (including current SKU)
        const allSkus = [...product.sku_others];

        // Add current SKU if it has sku_tier_idx
        if (product.sku_tier_idx) {
            allSkus.push(product as any);
        }

        const optionExists = allSkus.some(
            (sku) => sku.sku_tier_idx && sku.sku_tier_idx[variationIndex] === optionIndex
        );

        console.log(`Checking option ${optionIndex} for variation ${variationIndex}:`, {
            optionExists,
            selectedVariations,
            allSkusCount: allSkus.length,
            allSkuTierIdx: allSkus.map((sku) => sku.sku_tier_idx)
        });

        // If option doesn't exist in any SKU, disable it
        if (!optionExists) return true;

        // B1: If no selections are made, enable ALL existing options (this is the key fix!)
        if (Object.keys(selectedVariations).length === 0) {
            console.log(
                `No selections made, enabling option ${optionIndex} for variation ${variationIndex}`
            );
            return false;
        }

        // B2: Check if selecting this option would have any compatible SKU
        // We need to find at least one SKU that matches this option AND is compatible with other selections
        const hasCompatibleSku = allSkus.some((sku) => {
            if (!sku.sku_tier_idx || sku.sku_tier_idx[variationIndex] !== optionIndex) {
                return false;
            }

            // Check if this SKU is compatible with OTHER current selections (not including current variationIndex)
            return Object.entries(selectedVariations).every(([varIdx, optIdx]) => {
                const varIndex = parseInt(varIdx);
                // Skip the current variation we're testing
                if (varIndex === variationIndex) return true;
                // Check if this SKU matches the other selections
                return sku.sku_tier_idx[varIndex] === optIdx;
            });
        });

        console.log(
            `Option ${optionIndex} for variation ${variationIndex} - hasCompatibleSku:`,
            hasCompatibleSku
        );

        return !hasCompatibleSku;
    };

    const findMatchingSku = (selections: { [key: string]: number }) => {
        if (!product?.sku_others) return null;

        const allSkus = [...product.sku_others];

        // Add current SKU if it has sku_tier_idx
        if (product.sku_tier_idx) {
            allSkus.push(product as any);
        }

        return allSkus.find((sku) => {
            if (!sku.sku_tier_idx) return false;

            // Check if all selections match this SKU's tier_idx
            return Object.entries(selections).every(([varIdx, optIdx]) => {
                const variationIndex = parseInt(varIdx);
                return sku.sku_tier_idx[variationIndex] === optIdx;
            });
        });
    };

    const isSelectionComplete = (selections: { [key: string]: number }) => {
        if (!product?.spu_select?.product_variations) return false;
        return product.spu_select.product_variations.every(
            (_, index) => selections[index.toString()] !== undefined
        );
    };

    // Handle variation changes with improved logic
    const handleVariationChange = (variationIndex: string, optionIndex: number) => {
        setSelectedVariations((prev) => {
            const newSelections = { ...prev };
            const varIdx = variationIndex;

            // B4: If clicking the same option, deselect it (allow deselection)
            if (newSelections[varIdx] === optionIndex) {
                delete newSelections[varIdx];
                return newSelections;
            }

            // B3: Set the new selection first
            newSelections[varIdx] = optionIndex;

            // B3: Check each other variation to see if its current selection is still valid
            Object.keys(newSelections).forEach((otherVarIdx) => {
                if (otherVarIdx !== varIdx) {
                    const otherOptionIndex = newSelections[otherVarIdx];

                    // Get all SKUs including current SKU
                    const allSkus = [...(product?.sku_others || [])];
                    if (product?.sku_tier_idx) {
                        allSkus.push(product as any);
                    }

                    // Check if there exists any SKU that matches the new selection AND the other selection
                    const isStillValid = allSkus.some((sku) => {
                        if (!sku.sku_tier_idx) return false;
                        return (
                            sku.sku_tier_idx[parseInt(varIdx)] === optionIndex &&
                            sku.sku_tier_idx[parseInt(otherVarIdx)] === otherOptionIndex
                        );
                    });

                    // If no SKU supports both selections, remove the other selection
                    if (!isStillValid) {
                        delete newSelections[otherVarIdx];
                    }
                }
            });

            return newSelections;
        });
    };

    // Event handlers for user interactions
    const handleImageModalOpen = (index: number) => {
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

    const handleAddToCart = async () => {
        if (!currentSku?._id) {
            toast({
                title: 'Lỗi',
                description: 'Vui lòng chọn phiên bản sản phẩm',
                variant: 'destructive'
            });
            return;
        }

        try {
            await dispatch(addItemToCart({ skuId: currentSku._id, quantity: 1 })).unwrap();
            toast({
                title: 'Thành công!',
                description: 'Sản phẩm đã được thêm vào giỏ hàng',
                variant: 'success'
            });
        } catch (error) {
            toast({
                title: 'Lỗi',
                description: 'Không thể thêm sản phẩm vào giỏ hàng',
                variant: 'destructive'
            });
        }
    };

    const handleBuyNow = () => {
        // TODO: Implement buy now functionality
        console.log('Buy now clicked', currentSku?._id);
    };

    const handleSubmitReview = (reviewData: { rating: number; comment: string }) => {
        // TODO: Implement review submission
        console.log('Submit review:', reviewData);
    };

    // Function to fetch latest review for a SKU
    const fetchLatestReview = async (skuId: string) => {
        try {
            setLoadingLatestReview(true);
            const response = await reviewService.getLastReviewBySkuId(skuId);
            setLatestReview(response.metadata);
        } catch (error) {
            console.error('Error fetching latest review:', error);
            setLatestReview(null);
        } finally {
            setLoadingLatestReview(false);
        }
    };

    // Update current SKU when selections change
    useEffect(() => {
        if (!product) return;

        if (isSelectionComplete(selectedVariations)) {
            // Find matching SKU when selection is complete
            const matchingSku = findMatchingSku(selectedVariations);
            if (matchingSku) {
                setCurrentSku(matchingSku);
            }
        } else {
            // When selection is incomplete, show the first SKU or main product SKU
            if (product.sku_others && product.sku_others.length > 0) {
                setCurrentSku(product.sku_others[0]);
            } else {
                setCurrentSku(product);
            }
        }
    }, [selectedVariations, product]);

    // Fetch latest review when current SKU changes
    useEffect(() => {
        if (currentSku?._id) {
            fetchLatestReview(currentSku._id);
        }
    }, [currentSku]);

    useEffect(() => {
        if (productId) {
            const fetchProduct = async () => {
                setLoading(true);
                setError(null);
                setProduct(null);
                try {
                    // Fetch product using SKU ID only
                    const data = await productService.getSkuById(productId);
                    console.log('Product fetch result:', { data });
                    // The data should be the first item in metadata array
                    const productData = Array.isArray(data) ? data[0] : data;

                    // Debug: Log SKU information
                    console.log('Product loaded:', {
                        productId,
                        currentSku: productData,
                        allSkus: productData?.sku_others,
                        variations: productData?.spu_select?.product_variations
                    });

                    if (productData?.sku_others) {
                        console.log('All available SKU tier indices:');
                        productData.sku_others.forEach((sku: any, index: number) => {
                            console.log(`SKU ${index}:`, sku.sku_tier_idx, sku._id);
                        });
                    }

                    setProduct(productData);
                    setCurrentSku(productData);

                    // Initialize selectedVariations from current SKU's sku_tier_idx
                    if (productData?.sku_tier_idx && productData.spu_select?.product_variations) {
                        const initialSelections: { [key: string]: number } = {};
                        productData.sku_tier_idx.forEach(
                            (optionIndex: number, variationIndex: number) => {
                                if (optionIndex !== undefined && optionIndex !== null) {
                                    initialSelections[variationIndex.toString()] = optionIndex;
                                }
                            }
                        );
                        setSelectedVariations(initialSelections);
                    }

                    // Fetch shop information
                    if (productData?.spu_select?.product_shop) {
                        setLoadingShop(true);
                        try {
                            const shopData = await shopService.getShopById(
                                productData.spu_select.product_shop
                            );
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
                            const relatedData = await productService.getSkusByCategory(
                                productData.spu_select.product_category
                            );
                            // Filter out current product and get only SKUs
                            const filtered = (relatedData || [])
                                .filter((sku: ProductSku) => sku._id !== productId)
                                .slice(0, 4);
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
                                user_name: 'Nguyễn Văn A',
                                rating: 5,
                                comment: 'Sản phẩm tuyệt vời! Rất đáng mua.',
                                created_at: new Date().toISOString(),
                                helpful_count: 12
                            },
                            {
                                _id: '2',
                                user_name: 'Trần Thị B',
                                rating: 4,
                                comment: 'Chất lượng tốt, giao hàng nhanh.',
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
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Không tìm thấy sản phẩm
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {error || 'Sản phẩm bạn đang tìm kiếm không tồn tại.'}
                        </p>
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex items-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Quay lại
                            </Button>
                            <Button asChild>
                                <Link href="/products">Xem sản phẩm</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-6">
                    {/* Breadcrumbs */}
                    <ProductBreadcrumbs />

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
                                    productName={product.spu_select.product_name}
                                    rating={ratingBreakdown?.average || 0}
                                    soldCount={product.spu_select.product_sold || 0}
                                />

                                {/* Product Pricing */}
                                <ProductPricing
                                    price={currentSku?.sku_price || 0}
                                    stock={currentStock}
                                />

                                {/* Product Variants */}
                                {product.spu_select.product_variations &&
                                    product.spu_select.product_variations.length > 0 && (
                                        <ProductVariants
                                            variations={product.spu_select.product_variations}
                                            selectedVariations={selectedVariations}
                                            onVariationChange={handleVariationChange}
                                            isOptionDisabled={isOptionDisabled}
                                        />
                                    )}

                                {/* Product Actions */}
                                <ProductActions
                                    stock={currentStock}
                                    currentSkuId={currentSku?._id}
                                    onAddToCart={handleAddToCart}
                                    onBuyNow={handleBuyNow}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Shop Info */}
                        {shop && (
                            <div className="p-6">
                                <ShopInfo shop={shop} loading={loadingShop} />
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

                        {/* Latest Review for Current SKU */}
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Đánh giá gần nhất</h3>
                            {loadingLatestReview ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Đang tải đánh giá...
                                    </p>
                                </div>
                            ) : latestReview ? (
                                <ReviewDisplay review={latestReview} showProductInfo={false} />
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">
                                        Chưa có đánh giá nào cho sản phẩm này
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Hãy là người đầu tiên đánh giá sản phẩm này
                                    </p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Product Reviews */}
                        <div className="p-6">
                            <ProductReviews
                                reviews={reviews}
                                ratingBreakdown={ratingBreakdown}
                                loading={loadingReviews}
                                onSubmitReview={handleSubmitReview}
                            />
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-8">
                            <RelatedProducts
                                relatedProducts={relatedProducts}
                                loading={loadingRelated}
                            />
                        </div>
                    )}

                    {/* Product Navigation */}
                    {product?.spu_select?.product_category && currentSku?._id && (
                        <ProductNavigation
                            currentProductId={currentSku._id}
                            categoryId={product.spu_select.product_category}
                        />
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
                    onPrevious={handleImageModalPrev}
                />
            )}
        </>
    );
}
