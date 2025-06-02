'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    AlertTriangle,
    ArrowLeft,
    Building,
    CheckCircle,
    Info,
    MapPin,
    ShoppingBag,
    List
} from 'lucide-react';

import shopService, { Shop, ShopProductSku } from '@/lib/services/api/shopService';
import { mediaService } from '@/lib/services/api/mediaService';
import { categoryService, Category } from '@/lib/services/api/categoryService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard';
import { FloatingChat, ChatButton, FloatingChatButton } from '@/components/ui/FloatingChat';
import { CustomImage } from '@/components/ui/CustomImage';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/lib/store/hooks';

const ShopProfilePage = () => {
    const params = useParams();
    const router = useRouter();
    const shopId = params.shopId as string;

    // Get user data from Redux store
    const { user, accessToken, isAuthenticated } = useAppSelector((state) => ({
        user: state.user.user,
        accessToken: state.user.accessToken,
        isAuthenticated: state.user.isAuthenticated
    }));

    const [shop, setShop] = useState<Shop | null>(null);
    const [loadingShop, setLoadingShop] = useState(true);
    const [errorShop, setErrorShop] = useState<string | null>(null);

    const [allProducts, setAllProducts] = useState<ShopProductSku[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [errorProducts, setErrorProducts] = useState<string | null>(null);

    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [shopCategories, setShopCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatMinimized, setIsChatMinimized] = useState(false);

    useEffect(() => {
        if (shopId) {
            const fetchShopDetails = async () => {
                setLoadingShop(true);
                setErrorShop(null);
                try {
                    const shopData = await shopService.getShopById(shopId);
                    setShop(shopData);
                } catch (err) {
                    console.error('Failed to fetch shop details:', err);
                    setErrorShop('Could not load shop information.');
                }
                setLoadingShop(false);
            };

            const fetchShopProducts = async () => {
                setLoadingProducts(true);
                setErrorProducts(null);
                try {
                    const productData = await shopService.getProductsByShopId(shopId);
                    setAllProducts(productData);
                } catch (err) {
                    console.error('Failed to fetch shop products:', err);
                    setErrorProducts('Could not load products for this shop.');
                }
                setLoadingProducts(false);
            };

            const fetchCategories = async () => {
                setLoadingCategories(true);
                try {
                    const categoriesData = await categoryService.getAllCategories();
                    setAllCategories(categoriesData);
                } catch (err) {
                    console.error('Failed to fetch categories:', err);
                }
                setLoadingCategories(false);
            };

            fetchShopDetails();
            fetchShopProducts();
            fetchCategories();
        }
    }, [shopId]);

    useEffect(() => {
        if (allProducts.length > 0 && allCategories.length > 0) {
            const productCategoryIds = new Set(allProducts.map((p) => p.product_category));
            const relevantShopCategories = allCategories.filter((cat) =>
                productCategoryIds.has(cat._id)
            );
            setShopCategories(relevantShopCategories);
        }
    }, [allProducts, allCategories]);

    const filteredProducts = useMemo(() => {
        if (!selectedCategoryId) return allProducts;
        return allProducts.filter((p) => p.product_category === selectedCategoryId);
    }, [allProducts, selectedCategoryId]);

    const formatLocation = (location: Shop['shop_location']) => {
        let parts = [];
        if (location.district?.district_name) parts.push(location.district.district_name);
        if (location.province?.province_name) parts.push(location.province.province_name);
        return parts.join(', ');
    };

    const handleChatOpen = () => {
        if (!isAuthenticated || !user || !accessToken) {
            // Redirect to login or show login modal
            router.push('/auth/login');
            return;
        }
        setIsChatOpen(true);
        setIsChatMinimized(false);
    };

    const handleChatClose = () => {
        setIsChatOpen(false);
        setIsChatMinimized(false);
    };

    const handleChatToggleMinimize = () => {
        setIsChatMinimized(!isChatMinimized);
    };

    if (loadingShop) {
        return (
            <>
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-9 w-24 mb-6" />
                    <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        <Skeleton className="w-28 h-28 md:w-36 md:h-36 rounded-full flex-shrink-0" />
                        <div className="flex-grow text-center md:text-left space-y-3">
                            <Skeleton className="h-8 w-1/2 md:w-3/4" />
                            <Skeleton className="h-5 w-3/4 md:w-1/2" />
                            <Skeleton className="h-5 w-1/2 md:w-1/3" />
                        </div>
                    </div>
                    <div>
                        <Skeleton className="h-8 w-1/3 mb-2" />
                        <Skeleton className="h-px w-full mb-4" />
                        <Skeleton className="h-9 w-full mb-6" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (errorShop) {
        return (
            <>
                <div className="container mx-auto px-4 py-12 text-center min-h-[calc(100vh-150px)] flex flex-col justify-center items-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-red-600">Failed to load shop</h2>
                    <p className="text-gray-600 mt-2 mb-6">{errorShop}</p>
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            </>
        );
    }

    if (!shop) {
        return (
            <>
                <div className="container mx-auto px-4 py-12 text-center min-h-[calc(100vh-150px)] flex flex-col justify-center items-center">
                    <Info className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                    <h2 className="text-xl font-semibold">Shop not found</h2>
                    <p className="text-gray-600 mt-2 mb-6">
                        The shop you are looking for does not exist.
                    </p>
                    <Button onClick={() => router.push('/')} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        className="mb-6 text-slate-600 hover:text-slate-800"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>

                    {/* Shop Info Section */}
                    <div className="bg-white shadow-xl rounded-xl p-6 md:p-8 mb-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-slate-100 shadow-md flex-shrink-0">
                            <CustomImage
                                src={mediaService.getMediaUrl(shop.shop_logo)}
                                alt={`${shop.shop_name} logo`}
                                fill
                                objectFit="cover"
                                className="bg-gray-100"
                                fallbackSrc="/placeholder.jpg"
                            />
                        </div>
                        <div className="text-center md:text-left flex-grow">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                                {shop.shop_name}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-1 mt-2 text-slate-600">
                                {shop.shop_type && (
                                    <div className="flex items-center text-sm">
                                        <Building className="w-4 h-4 mr-1.5 text-blue-500" />
                                        <span>{shop.shop_type}</span>
                                    </div>
                                )}
                                {shop.is_brand && (
                                    <Badge
                                        variant="default"
                                        className="bg-green-100 text-green-700 border-green-300 text-xs font-medium"
                                    >
                                        <CheckCircle className="w-3 h-3 mr-1" /> Brand
                                    </Badge>
                                )}
                                {shop.shop_location && (
                                    <div className="flex items-center text-sm">
                                        <MapPin className="w-4 h-4 mr-1.5 text-orange-500 flex-shrink-0" />
                                        <span className="truncate">
                                            {formatLocation(shop.shop_location)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chat Button */}
                        <div className="flex flex-col items-center md:items-end gap-2">
                            <ChatButton onClick={handleChatOpen} className="w-full md:w-auto" />
                            <p className="text-xs text-gray-500 text-center">
                                {isAuthenticated
                                    ? 'Liên hệ trực tiếp với shop'
                                    : 'Đăng nhập để chat với shop'}
                            </p>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <h2 className="text-2xl font-semibold text-slate-700 flex items-center">
                                <ShoppingBag className="w-6 h-6 mr-2 text-blue-600" /> Products
                            </h2>
                        </div>
                        <Separator className="mb-4" />

                        {/* Category Filters */}
                        {!loadingCategories && shopCategories.length > 0 && (
                            <div className="mb-6 flex flex-wrap gap-2 items-center">
                                <span className="text-sm font-medium text-slate-600 mr-2">
                                    Filter by:
                                </span>
                                <Button
                                    variant={selectedCategoryId === null ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategoryId(null)}
                                    className={cn(
                                        'rounded-full',
                                        selectedCategoryId === null &&
                                            'bg-blue-600 hover:bg-blue-700 text-white'
                                    )}
                                >
                                    All Products
                                </Button>
                                {shopCategories.map((cat, index) => (
                                    <Button
                                        key={cat._id}
                                        variant={
                                            selectedCategoryId === cat._id ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => setSelectedCategoryId(cat._id)}
                                        className={cn(
                                            'rounded-full',
                                            selectedCategoryId === cat._id &&
                                                'bg-blue-600 hover:bg-blue-700 text-white'
                                        )}
                                    >
                                        {cat.category_name}
                                    </Button>
                                ))}
                            </div>
                        )}
                        {loadingCategories && !shopCategories.length && allProducts.length > 0 && (
                            <div className="mb-6 flex flex-wrap gap-2 items-center">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-8 w-28 rounded-full" />
                                <Skeleton className="h-8 w-24 rounded-full" />
                            </div>
                        )}

                        {loadingProducts && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        )}

                        {!loadingProducts && errorProducts && (
                            <div className="text-center py-10 bg-white rounded-lg shadow border border-red-200">
                                <AlertTriangle className="mx-auto h-10 w-10 text-red-400 mb-3" />
                                <p className="text-red-500">{errorProducts}</p>
                                <Button
                                    onClick={async () => {
                                        setLoadingProducts(true);
                                        try {
                                            const productData =
                                                await shopService.getProductsByShopId(shopId);
                                            setAllProducts(productData);
                                            setErrorProducts(null);
                                        } catch (err) {
                                            setErrorProducts('Retry failed. Please try again.');
                                        } finally {
                                            setLoadingProducts(false);
                                        }
                                    }}
                                    variant="outline"
                                    className="mt-4"
                                >
                                    Retry
                                </Button>
                            </div>
                        )}

                        {!loadingProducts && !errorProducts && filteredProducts.length === 0 && (
                            <div className="text-center py-10 bg-white rounded-lg shadow border border-slate-200 min-h-[200px] flex flex-col justify-center items-center">
                                <List className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                                <p className="text-slate-600">
                                    {selectedCategoryId
                                        ? `No products found in "${
                                              shopCategories.find(
                                                  (c) => c._id === selectedCategoryId
                                              )?.category_name || 'this category'
                                          }".`
                                        : allProducts.length === 0
                                        ? 'This shop has not listed any products yet.'
                                        : 'No products match the current filter.'}
                                </p>
                                {selectedCategoryId && (
                                    <Button
                                        variant="link"
                                        onClick={() => setSelectedCategoryId(null)}
                                        className="mt-2"
                                    >
                                        Show all products
                                    </Button>
                                )}
                            </div>
                        )}

                        {!loadingProducts && !errorProducts && filteredProducts.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {filteredProducts.map((product, index) => (
                                    <ProductCard
                                        key={index}
                                        product={product}
                                        showShopInfo={false}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Chat Component */}
            {shop && isAuthenticated && user && accessToken && (
                <FloatingChat
                    shop={{
                        _id: shop._id,
                        shop_name: shop.shop_name,
                        shop_logo: shop.shop_logo,
                        shop_userId: shop.shop_userId
                    }}
                    isOpen={isChatOpen}
                    onClose={handleChatClose}
                    onToggleMinimize={handleChatToggleMinimize}
                    isMinimized={isChatMinimized}
                    currentUserId={user._id}
                    userToken={accessToken}
                />
            )}

            {/* Floating Action Button */}
            {shop && (
                <FloatingChatButton
                    onClick={handleChatOpen}
                    isOpen={isChatOpen}
                    hasUnread={false}
                />
            )}
        </>
    );
};

export default ShopProfilePage;
