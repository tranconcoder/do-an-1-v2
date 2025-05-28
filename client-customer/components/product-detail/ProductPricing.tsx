'use client';

import { Package } from 'lucide-react';

interface ProductPricingProps {
  price: number;
  stock: number;
}

export default function ProductPricing({ price, stock }: ProductPricingProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-blue-700">
          {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Package className={`h-5 w-5 ${stock > 0 ? 'text-green-600' : 'text-red-500'}`} />
        {stock > 0 ? (
          <span className="font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md text-sm">
            Còn hàng <span className='text-gray-600 font-normal'>({stock} có sẵn)</span>
          </span>
        ) : (
          <span className="font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-md text-sm">
            Hết hàng
          </span>
        )}
      </div>
    </div>
  );
}