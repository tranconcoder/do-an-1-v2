"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useEffect, useState, useCallback } from "react";
import { Heart, ShoppingCart, Star, Store, Trash2, AlertTriangle, Info, Loader2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { wishlistService, SPU as WishlistItemSPU } from "@/lib/services/api/wishlistService";
import shopService, { Shop } from "@/lib/services/api/shopService";
import { mediaService } from "@/lib/services/api/mediaService";
import { toast } from "sonner";

interface ShopDetails {
  name: string;
  avatarMediaId: string;
}

export default function WishlistPage() {
  const [wishlistedProducts, setWishlistedProducts] = useState<WishlistItemSPU[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shopDetailsMap, setShopDetailsMap] = useState<{ [shopId: string]: ShopDetails }>({});
  const [loadingShopDetails, setLoadingShopDetails] = useState<boolean>(false);
  const router = useRouter();

  const fetchWishlistedProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const populatedProducts = await wishlistService.getWishlist();
      setWishlistedProducts(populatedProducts);
    } catch (err) {
      console.error("Failed to fetch wishlist products:", err);
      setError("Could not load your wishlist. Please try again later.");
      toast.error("Could not load your wishlist.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchWishlistedProducts();
  }, [fetchWishlistedProducts]);

  useEffect(() => {
    const fetchShopDetailsForProducts = async () => {
      if (wishlistedProducts.length === 0) return;

      const shopIdsToFetch = Array.from(new Set(wishlistedProducts.map(p => p.product_shop)))
        .filter(shopId => shopId && !shopDetailsMap[shopId]);

      if (shopIdsToFetch.length === 0) return;

      setLoadingShopDetails(true);
      const newShopDetailsMap: { [shopId: string]: ShopDetails } = {};
      try {
        await Promise.all(shopIdsToFetch.map(async (shopId) => {
          if (!shopId) return;
          try {
            const shopData: Shop = await shopService.getShopById(shopId);
            newShopDetailsMap[shopId] = { name: shopData.shop_name, avatarMediaId: shopData.shop_logo };
          } catch (shopError) {
            console.warn(`Failed to fetch shop details for ID ${shopId}:`, shopError);
            newShopDetailsMap[shopId] = { name: "Shop Unavailable", avatarMediaId: "" }; 
          }
        }));
        setShopDetailsMap(prevMap => ({ ...prevMap, ...newShopDetailsMap }));
      } catch (e) {
          console.error("Error fetching batch shop details for wishlist", e);
      }
      setLoadingShopDetails(false);
    };

    if (wishlistedProducts.length > 0) {
        fetchShopDetailsForProducts();
    }
  }, [wishlistedProducts, shopDetailsMap]);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const updatedWishlist = await wishlistService.removeFromWishlist(productId);
      setWishlistedProducts(updatedWishlist);
      toast.success("Removed from wishlist!");
    } catch (err) {
      console.error(`Failed to remove product ${productId} from wishlist:`, err);
      toast.error("Failed to remove item from wishlist.");
    }
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/products/${productId}`);
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
            <Skeleton className="h-4 w-1/3 mb-1" />
            <div className="flex gap-2 mt-auto pt-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-9" />
            </div>
        </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-semibold text-red-600 mb-2">Error Loading Wishlist</h2>
        <p className="text-gray-600 mb-6 text-center">{error}</p>
        <Button onClick={fetchWishlistedProducts} variant="outline">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Try Again
        </Button>
      </div>
    );
  }

  if (wishlistedProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-6 text-center">Looks like you haven\'t added anything to your wishlist yet.</p>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
          <Link href="/products">Discover Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <p className="text-gray-500 mt-1">Products you\'ve saved for later.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistedProducts.map((product) => {
          const shopInfo = shopDetailsMap[product.product_shop];
          const imageUrl = product.product_thumb;
          
          const itemKey = product._id;
          const actualProductIdToRemove = product._id;

          return (
            <div key={itemKey} className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
              <Link href={`/products/${product._id}`} className="block">
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                  <NextImage
                    src={imageUrl ? mediaService.getMediaUrl(imageUrl) : '/placeholder-image.svg'}
                    alt={product.product_name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    style={{ objectFit: "cover" }}
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
                <div className="flex items-center gap-2 mb-1.5">
                  {shopInfo ? (
                    <NextImage 
                        src={shopInfo.avatarMediaId ? mediaService.getMediaUrl(shopInfo.avatarMediaId) : '/placeholder-person.svg'} 
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
                  ) : loadingShopDetails && !shopDetailsMap[product.product_shop] ? (
                      <Skeleton className="w-5 h-5 rounded-full" />
                  ) : (
                      <Store className="w-5 h-5 text-gray-400" /> 
                  )}
                  <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors truncate">
                      {shopInfo ? shopInfo.name : (loadingShopDetails && !shopDetailsMap[product.product_shop] ? <Skeleton className="h-3 w-16" /> : product.product_shop) }
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors mb-1 truncate h-10 flex items-center" title={product.product_name}>
                  <Link href={`/products/${product._id}`}>{product.product_name}</Link>
                </h3>
                
                {product.product_rating_avg !== undefined && product.product_rating_avg > 0 ? (
                    <div className="flex items-center gap-1 mb-1.5">
                    {[...Array(5)].map((_, i) => (
                        <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < Math.round(product.product_rating_avg!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                    ))}
                    <span className="text-xs text-gray-500 ml-0.5">({product.product_rating_avg.toFixed(1)})</span>
                    </div>
                ) : (
                    <div className="h-[1.125rem] mb-1.5"></div>
                )}

                <div className="text-sm text-gray-600 mb-2">
                  Check variants for price
                </div>

                {product.product_quantity !== undefined ? (
                    product.product_quantity > 0 ? (
                        <div className="text-xs text-gray-500 mb-3">
                            {product.product_quantity.toLocaleString()} total items available
                        </div>
                    ) : (
                        <div className="text-xs text-red-500 font-medium mb-3">
                            Currently unavailable
                        </div>
                    )
                ) : (
                    <div className="h-[1rem] mb-3"></div>
                )}

                <div className="mt-auto flex flex-col gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 w-full hover:bg-blue-500 hover:text-white group"
                      onClick={() => handleViewProduct(product._id)}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" /> View Product
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="h-9 w-full bg-rose-500 hover:bg-rose-600 text-white group"
                      onClick={() => handleRemoveFromWishlist(actualProductIdToRemove)}
                    >
                      <Trash2 className="h-4 w-4 mr-2 group-hover:animate-pulse" /> Remove
                    </Button>
                </div>
              </div>
            </div>
          )}
        )}
      </div>
    </div>
  );
} 