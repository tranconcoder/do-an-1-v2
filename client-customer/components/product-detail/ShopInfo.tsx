'use client';

import NextImage from 'next/image';
import Link from 'next/link';
import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { mediaService } from '@/lib/services/api/mediaService';
import { Shop } from '@/lib/services/api/shopService';

interface ShopInfoProps {
  shopId?: string;
  shop?: Shop | null;
  loading?: boolean;
}

export default function ShopInfo({ shopId, shop, loading }: ShopInfoProps) {
  if (!shopId) return null;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <p className="text-xs text-gray-500 mb-1.5">Sold and Shipped by:</p>
      <Link href={`/shop/${shopId}`} className="flex items-center gap-3 group p-1 -m-1 rounded-md hover:bg-gray-50 transition-colors">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
          {loading ? (
            <Skeleton className="w-10 h-10 rounded-full" />
          ) : shop?.shop_logo ? (
            <NextImage
              src={mediaService.getMediaUrl(shop.shop_logo)}
              alt={`${shop.shop_name} logo`}
              width={40}
              height={40}
              className="rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <User className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          {loading ? (
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ) : shop ? (
            <div>
              <span className="text-md font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {shop.shop_name}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">View Store</p>
                {shop.is_brand && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    Brand
                  </Badge>
                )}
              </div>
              {shop.shop_location && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {shop.shop_location.province?.province_name}, {shop.shop_location.district?.district_name}
                </p>
              )}
            </div>
          ) : (
            <div>
              <span className="text-md font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                Shop ID: {shopId}
              </span>
              <p className="text-xs text-gray-500">View Store</p>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}