import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, MapPin, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProductSku } from '@/lib/services/api/productService';
import { mediaService } from '@/lib/services/api/mediaService';

interface ShopInfo {
    name: string;
    logo: string;
    location?: string;
}

interface ProductCardProps {
    product: ProductSku;
    shopInfo?: ShopInfo;
    isWishlisted: boolean;
    viewMode: 'grid' | 'list';
    loadingWishlist: boolean;
    onWishlistToggle: (productId: string) => void;
    onAddToCart: (skuId: string) => void;
}

// Enhanced rating display component
const RatingDisplay = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) => {
    const starSize = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    const textSize = size === 'lg' ? 'text-base' : 'text-sm';

    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`${starSize} transition-all duration-200 ${
                            i < Math.round(rating)
                                ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm'
                                : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
            <span className={`${textSize} text-gray-600 font-medium`}>
                {rating > 0 ? rating.toFixed(1) : 'Chưa có đánh giá'}
            </span>
            {rating > 4.5 && <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />}
        </div>
    );
};

// Helper function to format VND currency
const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Enhanced SKU Attributes Display Component
const SKUAttributesDisplay = ({
    productVariations,
    skuTierIdx,
    viewMode
}: {
    productVariations?: { variation_name: string; variation_values: string[]; _id: string }[];
    skuTierIdx: number[];
    viewMode: 'grid' | 'list';
}) => {
    if (!productVariations || !skuTierIdx || skuTierIdx.length === 0) return null;

    // Map tier index to actual variation values
    const variations = skuTierIdx
        .map((tierIndex, variationIndex) => {
            const variation = productVariations[variationIndex];
            if (!variation || tierIndex >= variation.variation_values.length) {
                return null;
            }

            return {
                key: variation.variation_name,
                value: variation.variation_values[tierIndex],
                tierIndex: tierIndex
            };
        })
        .filter(Boolean) as { key: string; value: string; tierIndex: number }[];

    if (variations.length === 0) return null;

    const maxDisplay = viewMode === 'grid' ? 2 : 3;
    const displayVariations = variations.slice(0, maxDisplay);
    const remainingCount = variations.length - maxDisplay;

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
                {displayVariations.map((variation, index) => (
                    <Badge
                        key={`${variation.key}-${index}`}
                        variant="secondary"
                        className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200 hover:from-blue-200 hover:to-indigo-200 transition-all duration-200"
                        title={`${variation.key}: ${variation.value} (Tier Index: ${variation.tierIndex})`}
                    >
                        <span className="font-medium">{variation.key}:</span>
                        <span className="ml-1">{variation.value}</span>
                    </Badge>
                ))}
                {remainingCount > 0 && (
                    <Badge
                        variant="secondary"
                        className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300"
                        title={`${remainingCount} more variations available`}
                    >
                        +{remainingCount} more
                    </Badge>
                )}
            </div>
        </div>
    );
};

const ProductCard = ({
    product,
    shopInfo,
    isWishlisted,
    viewMode,
    loadingWishlist,
    onWishlistToggle,
    onAddToCart
}: ProductCardProps) => {
    const imageUrl = product.sku?.sku_thumb || product.product_thumb;
    const price = product.sku?.sku_price || 0;
    const stock = product.sku?.sku_stock || 0;
    const rating = product.product_rating_avg || 0;

    if (viewMode === 'list') {
        return (
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 bg-gradient-to-r from-white to-blue-50/30 border border-blue-100/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="flex">
                        {/* Image */}
                        <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden">
                            <Link href={`/products/${product.sku._id}`}>
                                <Image
                                    src={
                                        imageUrl
                                            ? mediaService.getMediaUrl(imageUrl)
                                            : '/placeholder-image.svg'
                                    }
                                    alt={product.product_name}
                                    fill
                                    className="object-cover hover:scale-110 transition-transform duration-500"
                                />
                            </Link>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200"
                                onClick={() => onWishlistToggle(product.sku._id)}
                                disabled={loadingWishlist}
                            >
                                <Heart
                                    className={`h-4 w-4 transition-all duration-200 ${
                                        isWishlisted
                                            ? 'fill-red-500 text-red-500 scale-110'
                                            : 'text-gray-600 hover:text-red-500'
                                    }`}
                                />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    {shopInfo && (
                                        <div className="flex items-center gap-2 mb-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                            <div className="w-6 h-6 relative">
                                                <Image
                                                    src={
                                                        shopInfo.logo
                                                            ? mediaService.getMediaUrl(
                                                                  shopInfo.logo
                                                              )
                                                            : '/placeholder-person.svg'
                                                    }
                                                    alt={shopInfo.name}
                                                    fill
                                                    className="rounded-full object-cover ring-2 ring-blue-200"
                                                />
                                            </div>
                                            <span className="text-sm text-blue-700 font-medium">
                                                {shopInfo.name}
                                            </span>
                                            {shopInfo.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 text-blue-400" />
                                                    <span className="text-xs text-blue-600">
                                                        {shopInfo.location}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <Link href={`/products/${product.sku._id}`}>
                                        <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors duration-200 mb-2">
                                            {product.product_name}
                                        </h3>
                                    </Link>

                                    {/* Enhanced Rating Display */}
                                    <div className="mb-3">
                                        <RatingDisplay rating={rating} size="lg" />
                                    </div>

                                    {/* Enhanced SKU Attributes Display */}
                                    <div className="mb-3">
                                        <SKUAttributesDisplay
                                            productVariations={product.product_variations}
                                            skuTierIdx={product.sku.sku_tier_idx}
                                            viewMode="list"
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    {/* New Stock Count above price */}
                                    <div className="text-sm mb-2">
                                        {stock > 0 ? (
                                            <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                                <span className="font-semibold text-xs">
                                                    {stock} còn hàng
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                                <span className="font-semibold text-xs">
                                                    Hết hàng
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        {formatVND(price)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                    {/* Stock badge ở góc trái */}
                                    {stock > 0 ? (
                                        <Badge
                                            variant="outline"
                                            className="text-green-600 border-green-600 bg-green-50 animate-pulse"
                                        >
                                            {stock} còn hàng
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="text-red-600 border-red-600 bg-red-50"
                                        >
                                            Hết hàng
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                    >
                                        <Link href={`/products/${product.sku._id}`}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            Xem
                                        </Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => onAddToCart(product.sku._id)}
                                        disabled={stock === 0}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Thêm vào giỏ
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50/30 border border-blue-100/50 backdrop-blur-sm">
            <CardContent className="p-0">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                    <Link href={`/products/${product.sku._id}`}>
                        <Image
                            src={
                                imageUrl
                                    ? mediaService.getMediaUrl(imageUrl)
                                    : '/placeholder-image.svg'
                            }
                            alt={product.product_name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </Link>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                        onClick={() => onWishlistToggle(product.sku._id)}
                        disabled={loadingWishlist}
                    >
                        <Heart
                            className={`h-4 w-4 transition-all duration-200 ${
                                isWishlisted
                                    ? 'fill-red-500 text-red-500 scale-110'
                                    : 'text-gray-600 hover:text-red-500'
                            }`}
                        />
                    </Button>
                    {stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                            <Badge variant="destructive" className="animate-pulse">
                                Hết hàng
                            </Badge>
                        </div>
                    )}
                    {rating > 4.5 && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                            ⭐ Đánh giá cao
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    {shopInfo && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                            <div className="w-5 h-5 relative">
                                <Image
                                    src={
                                        shopInfo.logo
                                            ? mediaService.getMediaUrl(shopInfo.logo)
                                            : '/placeholder-person.svg'
                                    }
                                    alt={shopInfo.name}
                                    fill
                                    className="rounded-full object-cover ring-2 ring-blue-200"
                                />
                            </div>
                            <span className="text-xs text-blue-700 truncate font-medium">
                                {shopInfo.name}
                            </span>
                        </div>
                    )}

                    <Link href={`/products/${product.sku._id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2 group-hover:text-blue-600 duration-200">
                            {product.product_name}
                        </h3>
                    </Link>

                    {/* Enhanced Rating Display */}
                    <div className="mb-3">
                        <RatingDisplay rating={rating} />
                    </div>

                    {/* Enhanced SKU Attributes Display */}
                    <div className="mb-3">
                        <SKUAttributesDisplay
                            productVariations={product.product_variations}
                            skuTierIdx={product.sku.sku_tier_idx}
                            viewMode="grid"
                        />
                    </div>

                    <div className="mb-3">
                        {/* New Stock Count above price */}
                        <div className="text-sm mb-2">
                            {stock > 0 ? (
                                <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                    <span className="font-semibold text-xs">{stock} còn hàng</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 border border-red-200">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                    <span className="font-semibold text-xs">Hết hàng</span>
                                </div>
                            )}
                        </div>
                        <div className="text-2xl font-bold text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {formatVND(price)}
                        </div>
                    </div>

                    <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => onAddToCart(product.sku._id)}
                        disabled={stock === 0}
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductCard;
