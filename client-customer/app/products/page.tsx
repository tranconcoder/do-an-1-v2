'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Grid3X3, List, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

// Services
import { categoryService, Category } from '@/lib/services/api/categoryService';
import productService, { ProductSku, ProductFilters } from '@/lib/services/api/productService';
import shopService from '@/lib/services/api/shopService';
import { wishlistService } from '@/lib/services/api/wishlistService';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store/store';
import { addItemToCart } from '@/lib/store/slices/cartSlice';

// Components
import FilterSidebar from '@/components/products/FilterSidebar';
import ProductCard from '@/components/products/ProductCard';

interface FilterState {
    categories: string[];
    priceRange: [number, number];
    inStock: boolean;
    rating: number;
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

    console.log('ProductsPage re-rendered'); // Debug log

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

    // Search state - sử dụng useRef để tránh re-render
    const [searchInputValue, setSearchInputValue] = useState(searchParams.get('search') || '');
    const [searchQuery, setSearchQuery] = useState(''); // Không khởi tạo từ searchParams
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialMount = useRef(true);

    const [filters, setFilters] = useState<FilterState>({
        categories: [],
        priceRange: [0, 50000000],
        inStock: false,
        rating: 0
    });

    // Khởi tạo searchQuery từ URL params sau khi component mount
    useEffect(() => {
        const initialSearch = searchParams.get('search');
        if (initialSearch && isInitialMount.current) {
            setSearchQuery(initialSearch);
            isInitialMount.current = false;
        }
    }, [searchParams]);

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

            // Không gọi loadProducts() ở đây - để useEffect handle
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
                search: searchQuery || undefined,
                categories:
                    filters.categories.length > 0 ? filters.categories.join(',') : undefined,
                minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
                maxPrice: filters.priceRange[1] < 50000000 ? filters.priceRange[1] : undefined,
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

    // Load products lần đầu khi categories được load
    useEffect(() => {
        if (categories.length > 0 && isInitialMount.current) {
            loadProducts();
            isInitialMount.current = false;
        }
    }, [categories.length]);

    // Reload products when any filter changes (including search after debounce)
    useEffect(() => {
        // Chỉ load products khi:
        // 1. Categories đã được load
        // 2. Và không phải lần đầu mount
        // 3. Và (có searchQuery hoặc có filters khác được set)
        if (categories.length > 0 && !isInitialMount.current) {
            loadProducts();
        }
    }, [
        filters.categories,
        filters.priceRange,
        filters.inStock,
        filters.rating,
        searchQuery,
        sortBy
    ]);

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

    const updateFilters = useCallback((key: keyof FilterState, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            categories: [],
            priceRange: [0, 50000000],
            inStock: false,
            rating: 0
        });
        setSearchInputValue(''); // Clear search input
    }, []);

    // Handle search input change với debounce manual - cho uncontrolled input
    const handleSearchValueChange = useCallback((value: string) => {
        console.log('Search input changed:', value); // Debug log
        setSearchInputValue(value);
        setIsSearching(true);

        // Clear timeout cũ
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set timeout mới
        searchTimeoutRef.current = setTimeout(() => {
            console.log('Setting search query:', value); // Debug log
            setSearchQuery(value);
            setIsSearching(false);
        }, 500);
    }, []);

    // Handle search input change với debounce manual
    const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        console.log('Search input changed:', value); // Debug log
        setSearchInputValue(value);
        setIsSearching(true);

        // Clear timeout cũ
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set timeout mới
        searchTimeoutRef.current = setTimeout(() => {
            console.log('Setting search query:', value); // Debug log
            setSearchQuery(value);
            setIsSearching(false);
        }, 500);
    }, []);

    // Cleanup timeout khi component unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Handle category change
    const handleCategoryChange = useCallback(
        (categoryId: string, checked: boolean) => {
            if (checked) {
                updateFilters('categories', [...filters.categories, categoryId]);
            } else {
                updateFilters(
                    'categories',
                    filters.categories.filter((id) => id !== categoryId)
                );
            }
        },
        [filters.categories, updateFilters]
    );

    // Handle price range change
    const handlePriceRangeChange = useCallback(
        (value: [number, number]) => {
            updateFilters('priceRange', value);
        },
        [updateFilters]
    );

    // Handle in stock change
    const handleInStockChange = useCallback(
        (checked: boolean) => {
            updateFilters('inStock', checked);
        },
        [updateFilters]
    );

    // Handle rating change
    const handleRatingChange = useCallback(
        (rating: number) => {
            updateFilters('rating', rating);
        },
        [updateFilters]
    );

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
                        Trang chủ
                    </Link>
                    <span className="text-blue-400">/</span>
                    <span className="text-blue-600 font-medium">Sản phẩm</span>
                </nav>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                            Tất cả sản phẩm
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Khám phá những sản phẩm tuyệt vời từ thị trường của chúng tôi
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
                                <SelectItem value="featured">Nổi bật</SelectItem>
                                <SelectItem value="newest">Mới nhất</SelectItem>
                                <SelectItem value="price-low">Giá: Thấp đến cao</SelectItem>
                                <SelectItem value="price-high">Giá: Cao đến thấp</SelectItem>
                                <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
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
                                    Bộ lọc
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="w-80 bg-gradient-to-b from-white to-blue-50/30 backdrop-blur-xl"
                            >
                                <SheetHeader>
                                    <SheetTitle className="text-blue-600">Bộ lọc</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                    <FilterSidebar
                                        searchInputValue={searchInputValue}
                                        isSearching={isSearching}
                                        categoriesHierarchy={categoriesHierarchy}
                                        filters={filters}
                                        onSearchChange={handleSearchValueChange}
                                        onCategoryChange={handleCategoryChange}
                                        onPriceRangeChange={handlePriceRangeChange}
                                        onInStockChange={handleInStockChange}
                                        onRatingChange={handleRatingChange}
                                        onClearFilters={clearFilters}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Filters */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <FilterSidebar
                                searchInputValue={searchInputValue}
                                isSearching={isSearching}
                                categoriesHierarchy={categoriesHierarchy}
                                filters={filters}
                                onSearchChange={handleSearchValueChange}
                                onCategoryChange={handleCategoryChange}
                                onPriceRangeChange={handlePriceRangeChange}
                                onInStockChange={handleInStockChange}
                                onRatingChange={handleRatingChange}
                                onClearFilters={clearFilters}
                            />
                        </div>
                    </div>

                    {/* Products */}
                    <div className="flex-1">
                        {/* Results Info */}
                        <div className="flex items-center justify-between mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-100">
                            <p className="text-gray-600">
                                Hiển thị{' '}
                                <span className="font-semibold text-blue-600">
                                    {filteredAndSortedProducts.length}
                                </span>{' '}
                                trong{' '}
                                <span className="font-semibold text-blue-600">
                                    {products.length}
                                </span>{' '}
                                sản phẩm
                            </p>
                            {(filters.categories.length > 0 ||
                                searchQuery ||
                                filters.inStock ||
                                filters.rating > 0) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-blue-600 hover:bg-blue-50"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Xóa bộ lọc
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
                                    Không tìm thấy sản phẩm
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn
                                </p>
                                <Button
                                    onClick={clearFilters}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    Xóa tất cả bộ lọc
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
                                        <ProductCard
                                            product={product}
                                            shopInfo={shops[product.product_shop]}
                                            isWishlisted={wishlist.has(product.sku._id)}
                                            viewMode={viewMode}
                                            loadingWishlist={loadingWishlist}
                                            onWishlistToggle={handleWishlistToggle}
                                            onAddToCart={handleAddToCart}
                                        />
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
