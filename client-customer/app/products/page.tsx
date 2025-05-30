'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Search,
    Filter,
    Grid3X3,
    List,
    Heart,
    ShoppingCart,
    Star,
    ChevronDown,
    SlidersHorizontal,
    X,
    ArrowUpDown,
    MapPin,
    Eye,
    Sparkles
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

// Services
import { categoryService, Category } from '@/lib/services/api/categoryService';
import productService, { ProductSku, ProductFilters } from '@/lib/services/api/productService';
import shopService, { Shop } from '@/lib/services/api/shopService';
import { wishlistService } from '@/lib/services/api/wishlistService';
import { mediaService } from '@/lib/services/api/mediaService';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store/store';
import { addItemToCart } from '@/lib/store/slices/cartSlice';

interface FilterState {
    categories: string[];
    priceRange: [number, number];
    inStock: boolean;
    rating: number;
    searchQuery: string;
}

interface ShopInfo {
    name: string;
    logo: string;
    location?: string;
}

// Add interface for hierarchical category structure
interface HierarchicalCategory extends Category {
    children: HierarchicalCategory[];
}

export default function ProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const dispatch = useDispatch<AppDispatch>();

    // State
    const [products, setProducts] = useState<ProductSku[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesHierarchy, setCategoriesHierarchy] = useState<HierarchicalCategory[]>([]);
    const [shops, setShops] = useState<{ [key: string]: ShopInfo }>({});
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());

    const [loading, setLoading] = useState(true);
    const [loadingWishlist, setLoadingWishlist] = useState(false);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('featured');
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState<FilterState>({
        categories: [],
        priceRange: [0, 1000],
        inStock: false,
        rating: 0,
        searchQuery: searchParams.get('search') || ''
    });

    // Build hierarchical structure of categories
    const buildCategoryHierarchy = (categoriesList: Category[]): HierarchicalCategory[] => {
        // First, identify root categories (those without a parent or parent is null/empty)
        const rootCategories = categoriesList.filter((cat) => !cat.category_parent);

        // Then build the tree recursively
        return rootCategories.map((rootCat) => {
            return {
                ...rootCat,
                children: getChildCategories(categoriesList, rootCat._id)
            };
        });
    };

    // Get all child categories for a given parent ID
    const getChildCategories = (
        categoriesList: Category[],
        parentId: string
    ): HierarchicalCategory[] => {
        const children = categoriesList.filter(
            (cat) => cat.category_parent && cat.category_parent === parentId
        );

        return children.map((child) => ({
            ...child,
            children: getChildCategories(categoriesList, child._id)
        }));
    };

    // Recursively render category options with proper indentation
    const renderCategoryFilters = (
        categories: HierarchicalCategory[],
        level: number = 0
    ): React.ReactElement[] => {
        return categories.flatMap((category) => {
            const items: React.ReactElement[] = [
                <div
                    key={category._id}
                    className="flex items-center space-x-2 hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200"
                    style={{ paddingLeft: `${level * 16}px` }}
                >
                    <Checkbox
                        id={category._id}
                        checked={filters.categories.includes(category._id)}
                        onCheckedChange={(checked) => {
                            if (checked) {
                                updateFilters('categories', [...filters.categories, category._id]);
                            } else {
                                updateFilters(
                                    'categories',
                                    filters.categories.filter((id) => id !== category._id)
                                );
                            }
                        }}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label
                        htmlFor={category._id}
                        className="text-sm text-gray-700 cursor-pointer flex items-center hover:text-blue-600 transition-colors"
                    >
                        {level > 0 && <span className="text-blue-400 mr-1">{'└─ '}</span>}
                        {category.category_name}
                    </label>
                </div>
            ];

            // Add children if they exist
            if (category.children && category.children.length > 0) {
                items.push(...renderCategoryFilters(category.children, level + 1));
            }

            return items;
        });
    };

    // Load initial data
    useEffect(() => {
        loadInitialData();
    }, []);

    // Load wishlist
    useEffect(() => {
        loadWishlist();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [categoriesData] = await Promise.all([categoryService.getAllCategories()]);

            setCategories(categoriesData);

            // Build hierarchical structure for categories
            const hierarchy = buildCategoryHierarchy(categoriesData);
            setCategoriesHierarchy(hierarchy);

            // Load products with current filters
            await loadProducts();
        } catch (error) {
            console.error('Error loading data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load data. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            // Convert current filters to API format
            const apiFilters: ProductFilters = {
                search: filters.searchQuery || undefined,
                categories:
                    filters.categories.length > 0 ? filters.categories.join(',') : undefined,
                minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
                maxPrice: filters.priceRange[1] < 1000 ? filters.priceRange[1] : undefined,
                inStock: filters.inStock || undefined,
                minRating: filters.rating > 0 ? filters.rating : undefined,
                sortBy: sortBy as any,
                limit: 50 // Load more products
            };

            const productsData = await productService.getAllProducts(apiFilters);
            setProducts(productsData);

            // Load shop info for products
            const shopIds = [...new Set(productsData.map((p) => p.product_shop))];
            const shopPromises = shopIds.map(async (shopId) => {
                try {
                    const shop = await shopService.getShopById(shopId);
                    return {
                        id: shopId,
                        info: {
                            name: shop.shop_name,
                            logo: shop.shop_logo,
                            location: shop.shop_location?.province?.province_name
                        }
                    };
                } catch (error) {
                    return {
                        id: shopId,
                        info: {
                            name: 'Unknown Shop',
                            logo: '',
                            location: ''
                        }
                    };
                }
            });

            const shopResults = await Promise.all(shopPromises);
            const shopMap = shopResults.reduce((acc, { id, info }) => {
                acc[id] = info;
                return acc;
            }, {} as { [key: string]: ShopInfo });

            setShops(shopMap);
        } catch (error) {
            console.error('Error loading products:', error);
            toast({
                title: 'Error',
                description: 'Failed to load products. Please try again.',
                variant: 'destructive'
            });
        }
    };

    // Reload products when filters or sort change
    useEffect(() => {
        if (categories.length > 0) {
            // Only load when categories are loaded
            const timeoutId = setTimeout(
                () => {
                    loadProducts();
                },
                filters.searchQuery ? 500 : 0
            ); // Debounce search by 500ms, immediate for other filters

            return () => clearTimeout(timeoutId);
        }
    }, [filters, sortBy]);

    // Filter and sort products (now mostly just return products since filtering is done server-side)
    const filteredAndSortedProducts = useMemo(() => {
        // Server-side filtering is already applied, just return the products
        return products;
    }, [products]);

    const loadWishlist = async () => {
        try {
            setLoadingWishlist(true);
            const wishlistData = await wishlistService.getWishlist();
            setWishlist(new Set(wishlistData.map((item) => item._id)));
        } catch (error) {
            console.error('Error loading wishlist:', error);
        } finally {
            setLoadingWishlist(false);
        }
    };

    const handleWishlistToggle = async (productId: string) => {
        try {
            const isWishlisted = wishlist.has(productId);

            if (isWishlisted) {
                await wishlistService.removeFromWishlist(productId);
                setWishlist((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(productId);
                    return newSet;
                });
                toast({
                    title: 'Removed from wishlist',
                    description: 'Product removed from your wishlist'
                });
            } else {
                await wishlistService.addToWishlist(productId);
                setWishlist((prev) => new Set([...prev, productId]));
                toast({
                    title: 'Added to wishlist',
                    description: 'Product added to your wishlist'
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update wishlist',
                variant: 'destructive'
            });
        }
    };

    const handleAddToCart = async (skuId: string) => {
        try {
            await dispatch(addItemToCart({ skuId, quantity: 1 })).unwrap();
            toast({
                title: 'Added to cart',
                description: 'Product added to your cart'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add product to cart',
                variant: 'destructive'
            });
        }
    };

    const updateFilters = (key: keyof FilterState, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            categories: [],
            priceRange: [0, 1000],
            inStock: false,
            rating: 0,
            searchQuery: ''
        });
    };

    const FilterSidebar = () => (
        <div className="space-y-6 backdrop-blur-sm bg-white/80 p-6 rounded-2xl border border-white/20 shadow-xl">
            {/* Search */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Search className="h-4 w-4 mr-2 text-blue-600" />
                    Search
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                    <Input
                        placeholder="Search products..."
                        value={filters.searchQuery}
                        onChange={(e) => updateFilters('searchQuery', e.target.value)}
                        className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    />
                </div>
            </div>

            {/* Categories */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-blue-600" />
                    Categories
                </h3>
                <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50">
                    {renderCategoryFilters(categoriesHierarchy)}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-blue-600 mr-2">$</span>
                    Price Range
                </h3>
                <div className="space-y-3">
                    <Slider
                        value={filters.priceRange}
                        onValueChange={(value) =>
                            updateFilters('priceRange', value as [number, number])
                        }
                        max={1000}
                        step={10}
                        className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm text-blue-600 font-medium">
                        <span>${filters.priceRange[0]}</span>
                        <span>${filters.priceRange[1]}</span>
                    </div>
                </div>
            </div>

            {/* Stock Filter */}
            <div>
                <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <Checkbox
                        id="inStock"
                        checked={filters.inStock}
                        onCheckedChange={(checked) => updateFilters('inStock', checked)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label
                        htmlFor="inStock"
                        className="text-sm text-gray-700 cursor-pointer font-medium"
                    >
                        In Stock Only
                    </label>
                </div>
            </div>

            {/* Rating Filter */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Star className="h-4 w-4 mr-2 text-yellow-400 fill-yellow-400" />
                    Minimum Rating
                </h3>
                <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                        <div
                            key={rating}
                            className="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                            <Checkbox
                                id={`rating-${rating}`}
                                checked={filters.rating === rating}
                                onCheckedChange={(checked) => {
                                    updateFilters('rating', checked ? rating : 0);
                                }}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <label
                                htmlFor={`rating-${rating}`}
                                className="flex items-center space-x-1 cursor-pointer"
                            >
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 transition-colors duration-200 ${
                                                i < rating
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-700">& up</span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Clear Filters */}
            <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
            </Button>
        </div>
    );

    const ProductCard = ({ product }: { product: ProductSku }) => {
        const shopInfo = shops[product.product_shop];
        const imageUrl = product.sku?.sku_thumb || product.product_thumb;
        const price = product.sku?.sku_price || 0;
        const stock = product.sku?.sku_stock || 0;
        const rating = product.product_rating_avg || 0;
        const isWishlisted = wishlist.has(product.sku._id);

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
                        {rating > 0 ? rating.toFixed(1) : 'No rating'}
                    </span>
                    {rating > 4.5 && <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />}
                </div>
            );
        };

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
                                    onClick={() => handleWishlistToggle(product.sku._id)}
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

                                        {product.sku.sku_value &&
                                            product.sku.sku_value.length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {product.sku.sku_value.map(
                                                        (variation, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="secondary"
                                                                className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
                                                            >
                                                                {variation.key}: {variation.value}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            ${price.toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2">
                                        {stock > 0 ? (
                                            <Badge
                                                variant="outline"
                                                className="text-green-600 border-green-600 bg-green-50 animate-pulse"
                                            >
                                                {stock} in stock
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="text-red-600 border-red-600 bg-red-50"
                                            >
                                                Out of stock
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
                                                View
                                            </Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleAddToCart(product.sku._id)}
                                            disabled={stock === 0}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Add to Cart
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
                            onClick={() => handleWishlistToggle(product.sku._id)}
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
                                    Out of Stock
                                </Badge>
                            </div>
                        )}
                        {rating > 4.5 && (
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                                ⭐ Top Rated
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

                        {product.sku.sku_value && product.sku.sku_value.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {product.sku.sku_value.slice(0, 2).map((variation, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
                                    >
                                        {variation.value}
                                    </Badge>
                                ))}
                                {product.sku.sku_value.length > 2 && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
                                    >
                                        +{product.sku.sku_value.length - 2}
                                    </Badge>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                            <div className="text-xl font-bold text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                ${price.toFixed(2)}
                            </div>
                            {stock > 0 && (
                                <Badge
                                    variant="outline"
                                    className="text-green-600 border-green-600 bg-green-50 text-xs"
                                >
                                    {stock} left
                                </Badge>
                            )}
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleAddToCart(product.sku._id)}
                            disabled={stock === 0}
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const ProductSkeleton = () => (
        <Card className="overflow-hidden animate-pulse">
            <CardContent className="p-0">
                <Skeleton className="aspect-square w-full bg-gradient-to-r from-blue-100 to-indigo-100" />
                <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-blue-100 to-indigo-100" />
                    <Skeleton className="h-4 w-1/2 bg-gradient-to-r from-blue-100 to-indigo-100" />
                    <Skeleton className="h-6 w-1/3 bg-gradient-to-r from-blue-100 to-indigo-100" />
                    <Skeleton className="h-10 w-full bg-gradient-to-r from-blue-100 to-indigo-100" />
                </div>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex gap-8">
                        <div className="hidden lg:block w-64 space-y-6">
                            <Skeleton className="h-8 w-32 bg-gradient-to-r from-blue-100 to-indigo-100" />
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        className="h-4 w-full bg-gradient-to-r from-blue-100 to-indigo-100"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-6">
                                <Skeleton className="h-8 w-48 bg-gradient-to-r from-blue-100 to-indigo-100" />
                                <Skeleton className="h-10 w-32 bg-gradient-to-r from-blue-100 to-indigo-100" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(12)].map((_, i) => (
                                    <ProductSkeleton key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                    <Link href="/" className="hover:text-blue-600 transition-colors duration-200">
                        Home
                    </Link>
                    <span className="text-blue-400">/</span>
                    <span className="text-blue-600 font-medium">Products</span>
                </nav>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                            All Products
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Discover amazing products from our marketplace
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        {/* View Mode Toggle */}
                        <div className="hidden sm:flex items-center border border-blue-200 rounded-lg p-1 bg-white/80 backdrop-blur-sm">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={
                                    viewMode === 'grid'
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'hover:bg-blue-50'
                                }
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className={
                                    viewMode === 'list'
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'hover:bg-blue-50'
                                }
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Sort */}
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-48 border-blue-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm">
                                <ArrowUpDown className="h-4 w-4 mr-2 text-blue-600" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white/95 backdrop-blur-sm border-blue-200">
                                <SelectItem value="featured">Featured</SelectItem>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                                <SelectItem value="rating">Highest Rated</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Mobile Filter Toggle */}
                        <Sheet open={showFilters} onOpenChange={setShowFilters}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="lg:hidden border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                                    Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="w-80 bg-gradient-to-b from-white to-blue-50/30 backdrop-blur-xl"
                            >
                                <SheetHeader>
                                    <SheetTitle className="text-blue-600">Filters</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                    <FilterSidebar />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Filters */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <FilterSidebar />
                        </div>
                    </div>

                    {/* Products */}
                    <div className="flex-1">
                        {/* Results Info */}
                        <div className="flex items-center justify-between mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-100">
                            <p className="text-gray-600">
                                Showing{' '}
                                <span className="font-semibold text-blue-600">
                                    {filteredAndSortedProducts.length}
                                </span>{' '}
                                of{' '}
                                <span className="font-semibold text-blue-600">
                                    {products.length}
                                </span>{' '}
                                products
                            </p>
                            {(filters.categories.length > 0 ||
                                filters.searchQuery ||
                                filters.inStock ||
                                filters.rating > 0) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-blue-600 hover:bg-blue-50"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Clear filters
                                </Button>
                            )}
                        </div>

                        {/* Products Grid */}
                        {filteredAndSortedProducts.length === 0 ? (
                            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100">
                                <div className="text-blue-400 mb-4">
                                    <Search className="h-16 w-16 mx-auto animate-pulse" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No products found
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Try adjusting your filters or search terms
                                </p>
                                <Button
                                    onClick={clearFilters}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        ) : (
                            <div
                                className={
                                    viewMode === 'grid'
                                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                        : 'space-y-4'
                                }
                            >
                                {filteredAndSortedProducts.map((product, index) => (
                                    <div
                                        key={product.sku._id}
                                        className="animate-fade-in"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                    opacity: 0;
                }

                .scrollbar-thin {
                    scrollbar-width: thin;
                }

                .scrollbar-thumb-blue-300::-webkit-scrollbar-thumb {
                    background-color: #93c5fd;
                    border-radius: 6px;
                }

                .scrollbar-track-blue-50::-webkit-scrollbar-track {
                    background-color: #eff6ff;
                }

                .scrollbar-thin::-webkit-scrollbar {
                    width: 6px;
                }
            `}</style>
        </div>
    );
}
