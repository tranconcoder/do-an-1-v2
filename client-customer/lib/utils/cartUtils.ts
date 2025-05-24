import { CartItem, CartSummary } from '@/lib/services/api/cartService';

/**
 * Format price in Vietnamese Dong
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

/**
 * Calculate discounted price for a cart item
 */
export const getDiscountedPrice = (item: CartItem): number => {
  const price = item.sku.sku_price || item.product.product_price;
  if (item.product.product_discount) {
    return price * (1 - item.product.product_discount / 100);
  }
  return price;
};

/**
 * Calculate item subtotal (discounted price * quantity)
 */
export const getItemSubtotal = (item: CartItem): number => {
  return getDiscountedPrice(item) * item.quantity;
};

/**
 * Check if item has discount
 */
export const hasDiscount = (item: CartItem): boolean => {
  return !!(item.product.product_discount && item.product.product_discount > 0);
};

/**
 * Check if item is low in stock
 */
export const isLowStock = (item: CartItem, threshold: number = 5): boolean => {
  return item.sku.sku_stock <= threshold && item.sku.sku_stock > 0;
};

/**
 * Check if item is out of stock
 */
export const isOutOfStock = (item: CartItem): boolean => {
  return item.sku.sku_stock === 0;
};

/**
 * Get stock status message
 */
export const getStockStatus = (item: CartItem): {
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  message: string;
  variant: 'default' | 'secondary' | 'destructive';
} => {
  if (isOutOfStock(item)) {
    return {
      status: 'out_of_stock',
      message: 'Out of Stock',
      variant: 'destructive'
    };
  }
  
  if (isLowStock(item)) {
    return {
      status: 'low_stock',
      message: `Only ${item.sku.sku_stock} left`,
      variant: 'secondary'
    };
  }
  
  return {
    status: 'in_stock',
    message: 'In Stock',
    variant: 'default'
  };
};

/**
 * Calculate free shipping progress
 */
export const getFreeShippingProgress = (
  subtotal: number, 
  threshold: number = 500000
): {
  qualifies: boolean;
  remaining: number;
  percentage: number;
} => {
  const remaining = Math.max(0, threshold - subtotal);
  const percentage = Math.min((subtotal / threshold) * 100, 100);
  
  return {
    qualifies: subtotal >= threshold,
    remaining,
    percentage
  };
};

/**
 * Group cart items by shop
 */
export const groupItemsByShop = (items: CartItem[]): Record<string, CartItem[]> => {
  return items.reduce((groups, item) => {
    const shopId = item.shop._id;
    if (!groups[shopId]) {
      groups[shopId] = [];
    }
    groups[shopId].push(item);
    return groups;
  }, {} as Record<string, CartItem[]>);
};

/**
 * Calculate shop subtotal
 */
export const calculateShopSubtotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + getItemSubtotal(item), 0);
};

/**
 * Validate cart item quantity
 */
export const validateQuantity = (
  quantity: number, 
  maxStock: number
): {
  isValid: boolean;
  error?: string;
} => {
  if (quantity < 1) {
    return {
      isValid: false,
      error: 'Quantity must be at least 1'
    };
  }
  
  if (quantity > maxStock) {
    return {
      isValid: false,
      error: `Only ${maxStock} items available in stock`
    };
  }
  
  return { isValid: true };
};

/**
 * Generate cart analytics data
 */
export const getCartAnalytics = (items: CartItem[], summary: CartSummary) => {
  const shops = groupItemsByShop(items);
  const categories = items.reduce((cats, item) => {
    // Assuming we have category info in the product
    const category = (item.product as any).category || 'Unknown';
    cats[category] = (cats[category] || 0) + item.quantity;
    return cats;
  }, {} as Record<string, number>);

  return {
    totalItems: summary.itemCount,
    totalValue: summary.total,
    uniqueProducts: items.length,
    uniqueShops: Object.keys(shops).length,
    averageItemPrice: items.length > 0 ? summary.subtotal / summary.itemCount : 0,
    categories,
    shops: Object.keys(shops).map(shopId => ({
      shopId,
      shopName: shops[shopId][0].shop.shop_name,
      itemCount: shops[shopId].reduce((sum, item) => sum + item.quantity, 0),
      subtotal: calculateShopSubtotal(shops[shopId])
    }))
  };
};

/**
 * Export cart data for sharing or backup
 */
export const exportCartData = (items: CartItem[], summary: CartSummary) => {
  return {
    exportDate: new Date().toISOString(),
    items: items.map(item => ({
      productId: item.product._id,
      productName: item.product.product_name,
      skuId: item.skuId,
      quantity: item.quantity,
      price: getDiscountedPrice(item),
      subtotal: getItemSubtotal(item),
      shop: {
        id: item.shop._id,
        name: item.shop.shop_name
      }
    })),
    summary,
    analytics: getCartAnalytics(items, summary)
  };
};