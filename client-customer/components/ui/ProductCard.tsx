import Link from 'next/link';
import NextImage from 'next/image';
import { ShoppingCart, Heart, Star, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { mediaService } from '@/lib/services/api/mediaService';
import { useToast } from '@/hooks/use-toast';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/lib/store/store';
import { addItemToCart } from '@/lib/store/slices/cartSlice';

// Interface for SKU value pair
export interface SkuValue {
    key: string;
    value: string;
}

// Interface for the SKU object within a product
export interface SkuDetails {
    _id: string;
    sku_product: string;
    sku_price: number;
    sku_stock: number;
    sku_thumb: string;
    sku_images: string[];
    sku_value: SkuValue[];
}

// Interface for product with SKU (compatible with both ProductSku and ShopProductSku)
export interface ProductWithSku {
    _id: string;
    product_name: string;
    product_rating_avg?: number;
    product_sold?: number;
    product_shop: string;
    product_thumb?: string;
    sku: SkuDetails;
}

// Interface for shop details (optional)
export interface ShopInfo {
    name: string;
    avatarMediaId: string;
}

interface ProductCardProps {
    product: ProductWithSku;
    shopInfo?: ShopInfo;
    loadingShopDetails?: boolean;
    showShopInfo?: boolean;
    onToggleWishlist?: (productId: string) => void;
    isWishlisted?: boolean;
    isWishlistLoading?: boolean;
}

export function ProductCard({
    product,
    shopInfo,
    loadingShopDetails = false,
    showShopInfo = true,
    onToggleWishlist,
    isWishlisted = false,
    isWishlistLoading = false
}: ProductCardProps) {
    const { toast } = useToast();
    const dispatch = useDispatch<AppDispatch>();

    // Prioritize SKU images over product images
    const imageUrl = product.sku?.sku_thumb || product.product_thumb;
    const currentPrice = product.sku?.sku_price || 0;
    const currentStock = product.sku?.sku_stock || 0;

    const handleAddToCart = async () => {
        if (!product.sku?._id) {
            toast({
                title: 'Lỗi',
                description: 'Sản phẩm không có sẵn',
                variant: 'destructive'
            });
            return;
        }

        try {
            await dispatch(addItemToCart({ skuId: product.sku._id, quantity: 1 })).unwrap();
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

    return (
        <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
            <Link href={`/products/${product.sku._id}`} className="block">
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                    <NextImage
                        src={
                            imageUrl ? mediaService.getMediaUrl(imageUrl) : '/placeholder-image.svg'
                        }
                        alt={product.product_name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.svg';
                            target.srcset = '';
                        }}
                    />
                </div>
            </Link>

            <div className="p-4 flex flex-col flex-grow">
                {/* Shop Info */}
                {showShopInfo && (
                    <div className="flex items-center gap-2 mb-1.5">
                        {shopInfo ? (
                            <Link
                                href={`/shop/${product.product_shop}`}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                <NextImage
                                    src={
                                        shopInfo.avatarMediaId
                                            ? mediaService.getMediaUrl(shopInfo.avatarMediaId)
                                            : '/placeholder-person.svg'
                                    }
                                    alt={shopInfo.name}
                                    width={20}
                                    height={20}
                                    className="rounded-full bg-gray-200 object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-person.svg';
                                        target.srcset = '';
                                    }}
                                />
                                <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors truncate">
                                    {shopInfo.name}
                                </span>
                            </Link>
                        ) : loadingShopDetails ? (
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-5 h-5 rounded-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Store className="w-5 h-5 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                    {product.product_shop}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Product Name */}
                <h3
                    className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors mb-1 truncate h-10 flex items-center"
                    title={product.product_name}
                >
                    <Link href={`/products/${product.sku._id}`}>{product.product_name}</Link>
                </h3>

                {/* SKU Variation Information */}
                {product.sku.sku_value && product.sku.sku_value.length > 0 && (
                    <div className="mb-2">
                        <div className="flex flex-wrap gap-1">
                            {product.sku.sku_value.map((variation, index) => (
                                <span
                                    key={index}
                                    className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200"
                                >
                                    {variation.key}: {variation.value}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Price Information */}
                <div className="mb-2">
                    <span className="text-lg font-bold text-blue-600">
                        ${currentPrice.toFixed(2)}
                    </span>
                </div>

                {/* Rating */}
                {product.product_rating_avg !== undefined ? (
                    <div className="flex items-center gap-1 mb-1.5">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                    i < Math.round(product.product_rating_avg!)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        ))}
                        <span className="text-xs text-gray-500 ml-0.5">
                            ({product.product_rating_avg.toFixed(1)})
                        </span>
                    </div>
                ) : (
                    <div className="h-[1.125rem] mb-1.5"></div>
                )}

                {/* Stock Information */}
                <div className="mb-3">
                    {currentStock > 0 ? (
                        <div className="text-xs text-green-600 font-medium">
                            <span className="inline-flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {currentStock.toLocaleString()} in stock
                            </span>
                        </div>
                    ) : (
                        <div className="text-xs text-red-500 font-medium">
                            <span className="inline-flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                Out of stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex flex-col gap-2 pt-2">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-full hover:bg-blue-500 hover:text-white group"
                            disabled={currentStock === 0}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                        </Button>
                        {onToggleWishlist && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white group disabled:opacity-50"
                                onClick={() => onToggleWishlist(product._id)}
                                disabled={isWishlistLoading}
                            >
                                <Heart
                                    className={`h-4 w-4 group-hover:fill-white ${
                                        isWishlisted ? 'fill-rose-500' : ''
                                    }`}
                                />
                                <span className="sr-only">Add to Wishlist</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="group bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <Skeleton className="w-full aspect-[4/3]" />
            <div className="p-4 flex flex-col flex-grow space-y-2">
                <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4 mb-1" />
                <Skeleton className="h-6 w-1/3 mb-1" />
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-9 w-full mt-auto" />
            </div>
        </div>
    );
}
