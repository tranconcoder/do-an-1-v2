'use client';

import { ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductActionsProps {
  stock: number;
  currentSkuId?: string;
  onAddToCart: (skuId?: string) => void;
  onBuyNow: (skuId?: string) => void;
}

export default function ProductActions({ 
  stock, 
  currentSkuId, 
  onAddToCart, 
  onBuyNow 
}: ProductActionsProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 pt-2">
      <Button
        size="lg" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-base py-3 h-auto shadow-md hover:shadow-lg transition-shadow"
        disabled={stock === 0}
        onClick={() => onAddToCart(currentSkuId)}
      >
        <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
      </Button>
      <Button
        size="lg" 
        variant="outline"
        className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-center text-base py-3 h-auto shadow-md hover:shadow-lg transition-shadow"
        disabled={stock === 0}
        onClick={() => onBuyNow(currentSkuId)}
      >
        <Zap className="mr-2 h-5 w-5" /> Buy Now
      </Button>
    </div>
  );
}