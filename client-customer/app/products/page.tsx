'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import {
    Filter,
    Search,
    ShoppingCart,
    Heart,
    Grid3X3,
    List,
    Store,
    Star,
    AlertTriangle,
    Info
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter
} from '@/components/ui/sheet';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import { useEffect, useState, useMemo } from 'react';
import { spuService, SPU } from '@/lib/services/api/spuService';
import { categoryService, Category } from '@/lib/services/api/categoryService';
import productService, { ProductSku } from '@/lib/services/api/productService';
import shopService, { Shop } from '@/lib/services/api/shopService';
import { wishlistService, WishlistItem } from '@/lib/services/api/wishlistService';
import { mediaService } from '@/lib/services/api/mediaService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store/store';
import { addItemToCart, fetchCart } from '@/lib/store/slices/cartSlice';
import { useSearchParams } from 'next/navigation';

interface ShopDetails {
    name: string;
    avatarMediaId: string;
}

export default function ProductsPage() {
    const [fetchedCategories, setFetchedCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);

    const [products, setProducts] = useState<ProductSku[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [errorProducts, setErrorProducts] = useState<string | null>(null);
    const [shopDetailsMap, setShopDetailsMap] = useState<{ [shopId: string]: ShopDetails }>({});
    const [loadingShopDetails, setLoadingShopDetails] = useState<boolean>(false);

    const [wishlistedProductIds, setWishlistedProductIds] = useState<Set<string>>(new Set());
    const [isWishlistLoading, setIsWishlistLoading] = useState<boolean>(true);

    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setIsLoadingCategories(true);
                const categoriesData = await categoryService.getAllCategories();
                setFetchedCategories(categoriesData);
                setErrorCategories(null);
            } catch (error) {
                console.error('Failed to fetch categories for filters:', error);
                setErrorCategories('Could not load categories.');
            }
            setIsLoadingCategories(false);
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const loadWishlist = async () => {
            setIsWishlistLoading(true);
            try {
                const wishlistData = await wishlistService.getWishlist();
                const productIds = new Set(wishlistData.map((item) => item._id));
                setWishlistedProductIds(productIds);
            } catch (error) {
                console.error('Failed to fetch wishlist:', error);
                toast({
                    title: 'Lỗi',
                    description: 'Could not load your wishlist. Please try again later.',
                    variant: 'destructive'
                });
            }
            setIsWishlistLoading(false);
        };
        loadWishlist();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setIsLoadingProducts(true);
                setErrorProducts(null);
                const productsData = await productService.getAllProducts();
                setProducts(productsData);
            } catch (error) {
                console.error('Failed to fetch products:', error);
                setErrorProducts('Could not load products. Please try again later.');
            }
            setIsLoadingProducts(false);
        };
        loadProducts();
    }, []);

    useEffect(() => {
        const fetchShopDetailsForProducts = async () => {
            if (products.length === 0) return;

            const shopIdsToFetch = Array.from(new Set(products.map((p) => p.product_shop))).filter(
                (shopId) => !shopDetailsMap[shopId]
            );

            if (shopIdsToFetch.length === 0) return;

            setLoadingShopDetails(true);
            const newShopDetailsMap: { [shopId: string]: ShopDetails } = {};
            try {
                await Promise.all(
                    shopIdsToFetch.map(async (shopId) => {
                        try {
                            const shopData: Shop = await shopService.getShopById(shopId);
                            newShopDetailsMap[shopId] = {
                                name: shopData.shop_name,
                                avatarMediaId: shopData.shop_logo
                            };
                        } catch (error) {
                            console.warn(`Failed to fetch shop details for ID ${shopId}:`, error);
                            newShopDetailsMap[shopId] = {
                                name: 'Shop Unavailable',
                                avatarMediaId: ''
                            };
                        }
                    })
                );
                setShopDetailsMap((prevMap) => ({ ...prevMap, ...newShopDetailsMap }));
            } catch (e) {
                console.error('Error fetching batch shop details', e);
            }
            setLoadingShopDetails(false);
        };

        if (products.length > 0) {
            fetchShopDetailsForProducts();
        }
    }, [products, shopDetailsMap]);

    const handleToggleWishlist = async (productId: string) => {
        const isWishlisted = wishlistedProductIds.has(productId);
        try {
            if (isWishlisted) {
                await wishlistService.removeFromWishlist(productId);
                setWishlistedProductIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(productId);
                    return newSet;
                });
                toast({
                    title: 'Thành công!',
                    description: 'Đã xóa khỏi danh sách yêu thích',
                    variant: 'success'
                });
            } else {
                await wishlistService.addToWishlist(productId);
                setWishlistedProductIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.add(productId);
                    return newSet;
                });
                toast({
                    title: 'Thành công!',
                    description: 'Đã thêm vào danh sách yêu thích',
                    variant: 'success'
                });
            }
        } catch (error) {
            console.error('Failed to update wishlist:', error);
            toast({
                title: 'Lỗi',
                description: `Không thể ${
                    isWishlisted ? 'xóa khỏi' : 'thêm vào'
                } danh sách yêu thích`,
                variant: 'destructive'
            });
        }
    };

    const ProductCardSkeleton = () => (
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-blue-600">
                        Home
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">All Products</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">All Products</h1>
                        <p className="text-gray-500 mt-1">
                            Browse our collection of trendy fashion items
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <Grid3X3 className="h-4 w-4" />
                                <span className="sr-only">Grid view</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <List className="h-4 w-4" />
                                <span className="sr-only">List view</span>
                            </Button>
                        </div>
                        <Select defaultValue="featured">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="featured">Featured</SelectItem>
                                <SelectItem value="newest">Newest Arrivals</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                                <SelectItem value="best-selling">Best Selling</SelectItem>
                            </SelectContent>
                        </Select>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="md:hidden">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                                <SheetHeader className="mb-5">
                                    <SheetTitle>Filters</SheetTitle>
                                    <SheetDescription>
                                        Narrow down your product search with filters.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="space-y-6">
                                    <Accordion type="single" collapsible defaultValue="category">
                                        <AccordionItem value="category">
                                            <AccordionTrigger>Category</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-3">
                                                    {isLoadingCategories && (
                                                        <p className="text-xs text-gray-500">
                                                            Loading categories...
                                                        </p>
                                                    )}
                                                    {errorCategories && (
                                                        <p className="text-xs text-red-500">
                                                            {errorCategories}
                                                        </p>
                                                    )}
                                                    {!isLoadingCategories &&
                                                        !errorCategories &&
                                                        fetchedCategories.map((category) => (
                                                            <div
                                                                key={category._id}
                                                                className="flex items-center space-x-2"
                                                            >
                                                                <Checkbox
                                                                    id={`mobile-category-${category._id}`}
                                                                />
                                                                <label
                                                                    htmlFor={`mobile-category-${category._id}`}
                                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                >
                                                                    {category.category_name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="price">
                                            <AccordionTrigger>Price Range</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-4">
                                                    <Slider
                                                        defaultValue={[0, 100]}
                                                        max={200}
                                                        step={1}
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <div className="border rounded-md px-2 py-1 w-20">
                                                            <span className="text-xs text-gray-500">
                                                                $
                                                            </span>
                                                            <input
                                                                type="number"
                                                                className="w-14 border-0 p-0 focus:outline-none focus:ring-0"
                                                                placeholder="Min"
                                                            />
                                                        </div>
                                                        <span className="text-gray-500">-</span>
                                                        <div className="border rounded-md px-2 py-1 w-20">
                                                            <span className="text-xs text-gray-500">
                                                                $
                                                            </span>
                                                            <input
                                                                type="number"
                                                                className="w-14 border-0 p-0 focus:outline-none focus:ring-0"
                                                                placeholder="Max"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                                <SheetFooter className="mt-6">
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                                        Apply Filters
                                    </Button>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="hidden md:block w-64 shrink-0">
                        <div className="sticky top-24 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Filters</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-blue-600 hover:text-blue-800"
                                >
                                    Clear All
                                </Button>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium">Category</h4>
                                <div className="space-y-3">
                                    {isLoadingCategories && (
                                        <p className="text-xs text-gray-500">
                                            Loading categories...
                                        </p>
                                    )}
                                    {errorCategories && (
                                        <p className="text-xs text-red-500">{errorCategories}</p>
                                    )}
                                    {!isLoadingCategories &&
                                        !errorCategories &&
                                        fetchedCategories.map((category) => (
                                            <div
                                                key={category._id}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox id={`category-${category._id}`} />
                                                <label
                                                    htmlFor={`category-${category._id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {category.category_name}
                                                </label>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium">Price Range</h4>
                                <Slider defaultValue={[0, 100]} max={200} step={1} />
                                <div className="flex items-center justify-between">
                                    <div className="border rounded-md px-2 py-1 w-20">
                                        <span className="text-xs text-gray-500">$</span>
                                        <input
                                            type="number"
                                            className="w-14 border-0 p-0 focus:outline-none focus:ring-0"
                                            placeholder="Min"
                                        />
                                    </div>
                                    <span className="text-gray-500">-</span>
                                    <div className="border rounded-md px-2 py-1 w-20">
                                        <span className="text-xs text-gray-500">$</span>
                                        <input
                                            type="number"
                                            className="w-14 border-0 p-0 focus:outline-none focus:ring-0"
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                                Apply Filters
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1">
                        {isLoadingProducts ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : errorProducts ? (
                            <div className="text-center py-10 bg-white rounded-lg shadow border border-red-200 flex flex-col items-center justify-center min-h-[300px]">
                                <AlertTriangle className="mx-auto h-10 w-10 text-red-400 mb-3" />
                                <p className="text-red-500 font-semibold">
                                    Failed to load products
                                </p>
                                <p className="text-gray-600 mt-1 mb-4 text-sm">{errorProducts}</p>
                                <Button
                                    onClick={async () => {
                                        setIsLoadingProducts(true);
                                        setErrorProducts(null);
                                        try {
                                            const productsData =
                                                await productService.getAllProducts();
                                            setProducts(productsData);
                                        } catch (error) {
                                            console.error('Failed to refetch products:', error);
                                            setErrorProducts(
                                                'Retry failed. Please try again later.'
                                            );
                                        } finally {
                                            setIsLoadingProducts(false);
                                        }
                                    }}
                                    variant="outline"
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-lg shadow border border-gray-200 flex flex-col items-center justify-center min-h-[300px]">
                                <Info className="mx-auto h-10 w-10 text-blue-400 mb-3" />
                                <p className="text-gray-700 font-semibold">No products found</p>
                                <p className="text-gray-500 mt-1 text-sm">
                                    There are currently no products available. Please check back
                                    later.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map((product) => {
                                    const shopInfo = shopDetailsMap[product.product_shop];
                                    // Prioritize SKU images over product images
                                    const imageUrl =
                                        (product.sku && product.sku.sku_thumb) ||
                                        product.product_thumb;
                                    // Use SKU price if available
                                    const currentPrice = product.sku?.sku_price || 0;
                                    const currentStock = product.sku?.sku_stock || 0;
                                    return (
                                        <div
                                            key={product.sku._id}
                                            className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
                                        >
                                            <Link
                                                href={`/products/${product.sku._id}`}
                                                className="block"
                                            >
                                                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                                                    <NextImage
                                                        src={
                                                            imageUrl
                                                                ? mediaService.getMediaUrl(imageUrl)
                                                                : '/placeholder-image.svg'
                                                        }
                                                        alt={product.product_name}
                                                        layout="fill"
                                                        objectFit="cover"
                                                        className="transition-transform duration-300 group-hover:scale-105"
                                                        onError={(e) => {
                                                            const target =
                                                                e.target as HTMLImageElement;
                                                            target.src = '/placeholder-image.svg';
                                                            target.srcset = '';
                                                        }}
                                                    />
                                                </div>
                                            </Link>
                                            <div className="p-4 flex flex-col flex-grow">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    {shopInfo ? (
                                                        <Link
                                                            href={`/shop/${product.product_shop}`}
                                                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                                        >
                                                            <NextImage
                                                                src={
                                                                    shopInfo.avatarMediaId
                                                                        ? mediaService.getMediaUrl(
                                                                              shopInfo.avatarMediaId
                                                                          )
                                                                        : '/placeholder-person.svg'
                                                                }
                                                                alt={shopInfo.name}
                                                                width={20}
                                                                height={20}
                                                                className="rounded-full bg-gray-200 object-cover"
                                                                onError={(e) => {
                                                                    const target =
                                                                        e.target as HTMLImageElement;
                                                                    target.src =
                                                                        '/placeholder-person.svg';
                                                                    target.srcset = '';
                                                                }}
                                                            />
                                                            <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors truncate">
                                                                {shopInfo.name}
                                                            </span>
                                                        </Link>
                                                    ) : loadingShopDetails &&
                                                      !shopDetailsMap[product.product_shop] ? (
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

                                                <h3
                                                    className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors mb-1 truncate h-10 flex items-center"
                                                    title={product.product_name}
                                                >
                                                    <Link href={`/products/${product.sku._id}`}>
                                                        {product.product_name}
                                                    </Link>
                                                </h3>

                                                {/* SKU Variation Information */}
                                                {product.sku.sku_value &&
                                                    product.sku.sku_value.length > 0 && (
                                                        <div className="mb-2">
                                                            <div className="flex flex-wrap gap-1">
                                                                {product.sku.sku_value.map(
                                                                    (variation, index) => (
                                                                        <span
                                                                            key={index}
                                                                            className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200"
                                                                        >
                                                                            {variation.key}:{' '}
                                                                            {variation.value}
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* Price Information */}
                                                <div className="mb-2">
                                                    <span className="text-lg font-bold text-blue-600">
                                                        ${currentPrice.toFixed(2)}
                                                    </span>
                                                </div>

                                                {product.product_rating_avg !== undefined ? (
                                                    <div className="flex items-center gap-1 mb-1.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-3.5 w-3.5 ${
                                                                    i <
                                                                    Math.round(
                                                                        product.product_rating_avg!
                                                                    )
                                                                        ? 'text-yellow-400 fill-yellow-400'
                                                                        : 'text-gray-300'
                                                                }`}
                                                            />
                                                        ))}
                                                        <span className="text-xs text-gray-500 ml-0.5">
                                                            ({product.product_rating_avg.toFixed(1)}
                                                            )
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
                                                                {currentStock.toLocaleString()} in
                                                                stock
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

                                                <div className="mt-auto flex flex-col gap-2 pt-2">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 w-full hover:bg-blue-500 hover:text-white group"
                                                            disabled={currentStock === 0}
                                                            onClick={async () => {
                                                                try {
                                                                    await dispatch(
                                                                        addItemToCart({
                                                                            skuId: product.sku._id,
                                                                            quantity: 1
                                                                        })
                                                                    ).unwrap();
                                                                    toast({
                                                                        title: 'Thành công!',
                                                                        description:
                                                                            'Sản phẩm đã được thêm vào giỏ hàng',
                                                                        variant: 'success'
                                                                    });
                                                                } catch (error) {
                                                                    toast({
                                                                        title: 'Lỗi',
                                                                        description:
                                                                            'Không thể thêm sản phẩm vào giỏ hàng',
                                                                        variant: 'destructive'
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <ShoppingCart className="h-4 w-4 mr-2" />{' '}
                                                            Add to Cart
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white group disabled:opacity-50"
                                                            onClick={() =>
                                                                handleToggleWishlist(product._id)
                                                            }
                                                            disabled={isWishlistLoading}
                                                        >
                                                            <Heart
                                                                className={`h-4 w-4 group-hover:fill-white ${
                                                                    wishlistedProductIds.has(
                                                                        product._id
                                                                    )
                                                                        ? 'fill-rose-500'
                                                                        : ''
                                                                }`}
                                                            />
                                                            <span className="sr-only">
                                                                Add to Wishlist
                                                            </span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!isLoadingProducts && !errorProducts && products.length > 0 && (
                            <div className="mt-12">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious href="#" />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink href="#" isActive>
                                                1
                                            </PaginationLink>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationNext href="#" />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="bg-gradient-to-b from-white to-blue-50 border-t border-blue-100 pt-16 pb-8 mt-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        <div>
                            <Link href="/" className="inline-block mb-4">
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                                    Aliconcon
                                </span>
                            </Link>
                            <p className="text-gray-600 mb-4 max-w-xs">
                                Your one-stop destination for trendy fashion and accessories at
                                affordable prices.
                            </p>
                            <div className="flex gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        className="bi bi-facebook"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                                    </svg>
                                    <span className="sr-only">Facebook</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        className="bi bi-instagram"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                                    </svg>
                                    <span className="sr-only">Instagram</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        className="bi bi-twitter"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                                    </svg>
                                    <span className="sr-only">Twitter</span>
                                </Button>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Shop</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        New Arrivals
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        Best Sellers
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        Trending Now
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        Sale
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        All Collections
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        Shipping & Returns
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        FAQs
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        Size Guide
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        Track Order
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4">About</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        Our Story
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        Careers
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        Sustainability
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        Press
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#"
                                        className="text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        Privacy Policy
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-blue-100 pt-8 text-center text-gray-500 text-sm">
                        <p>© 2023 Aliconcon. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
