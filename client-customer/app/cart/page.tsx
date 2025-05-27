'use client';

import type { RootState } from '@/lib/store/store';
import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/lib/store/hooks';
import { mediaService } from '@/lib/services/api/mediaService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, MinusSquare, PlusSquare, ShoppingCartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  fetchCart,
  addItemToCart,
  decreaseItemQuantity,
  removeItemFromCart,
} from '@/lib/store/slices/cartSlice';

export default function CartPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useSelector((state: RootState) => state.user);
  const { items: cartItems, isLoading, error } = useSelector((state: RootState) => state.cart);
  const dispatch = useAppDispatch();

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.sku_price * item.quantity, 0);
  };

  const groupedItems = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      if (!acc[item.shop_id]) {
        acc[item.shop_id] = {
          shopId: item.shop_id,
          shopName: item.shop_name,
          shopLogo: item.shop_logo,
          items: [],
        };
      }
      acc[item.shop_id].items.push(item);
      return acc;
    }, {} as Record<string, { shopId: string; shopName: string; shopLogo?: string; items: typeof cartItems }>);
  }, [cartItems]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    const currentItem = cartItems.find(item => item.sku_id === itemId);
    if (!currentItem || newQuantity < 1) return;

    const quantityDiff = newQuantity - currentItem.quantity;

    if (quantityDiff === 0) return;

    try {
      if (quantityDiff > 0) {
        await dispatch(addItemToCart({ skuId: itemId, quantity: quantityDiff })).unwrap();
      } else {
        if (quantityDiff === -1) {
          await dispatch(decreaseItemQuantity(itemId)).unwrap();
        } else {
           console.warn("Direct quantity input changes > -1 are not fully supported with the current decrease API and thunk.");
           dispatch(fetchCart());
           return;
        }
      }

    } catch (error) {
      console.error(`Failed to update quantity for item ${itemId}:`, error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await dispatch(removeItemFromCart(itemId)).unwrap();

    } catch (error) {
      console.error(`Failed to remove item ${itemId}:`, error);
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Giỏ hàng của bạn</h1>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="flex items-center p-4 gap-4 shadow-md rounded-lg">
                <Skeleton className="h-24 w-24 rounded-md" />
                <div className="flex-grow space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="h-8 w-8" />
              </Card>
            ))}
          </div>
          <Card className="md:col-span-1 p-6 shadow-lg rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardTitle className="text-xl font-semibold mb-6 text-blue-700">Tóm tắt đơn hàng</CardTitle>
            <div className="space-y-3 mb-6">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-full" />
            </div>
            <Skeleton className="h-12 w-full rounded-md" />
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <ShoppingCartIcon className="mx-auto h-16 w-16 text-red-400 mb-4" />
        <p className="text-xl text-red-500">{error}</p>
        {!isAuthenticated && (
          <Button asChild className="mt-6 bg-blue-600 hover:bg-blue-700">
            <Link href="/auth/login">Đăng nhập</Link>
          </Button>
        )}
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-center">
        <ShoppingCartIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-500 mb-6">Hãy khám phá và thêm sản phẩm bạn yêu thích vào giỏ hàng nhé!</p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.05;
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Giỏ hàng của bạn</h1>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2 space-y-6">
            {Object.values(groupedItems).map(shopGroup => (
              <div key={shopGroup.shopId} className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-2 mb-4">
                  {shopGroup.shopLogo && (
                    <Image
                      src={mediaService.getMediaUrl(shopGroup.shopLogo)}
                      alt={`${shopGroup.shopName} logo`}
                      width={32}
                      height={32}
                      objectFit="cover"
                      className="rounded-full"
                    />
                  )}
                  <h2 className="text-xl font-semibold text-gray-700">Shop: {shopGroup.shopName}</h2>
                </div>
                {shopGroup.items.map((item) => (
                  <Card key={item.sku_id} className="flex flex-col sm:flex-row items-center p-4 gap-4 shadow-md rounded-lg hover:shadow-lg transition-shadow">
                    <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-md overflow-hidden flex-shrink-0">
                      <Image 
                        src={mediaService.getMediaUrl(item.product_thumb)}
                        alt={item.product_name} 
                        layout="fill"
                        objectFit="cover"
                        className="bg-gray-100"
                      />
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                      <Link href={`/products/${item.spu_id}?sku=${item.sku_id}`} className="hover:text-blue-600">
                        <h3 className="text-lg font-semibold text-gray-800">{item.product_name}</h3>
                      </Link>
                      <p className="text-md font-bold text-blue-600 mt-1">
                        {item.sku_price.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                    <div className="flex items-center gap-2 my-2 sm:my-0">
                      <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(item.sku_id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        <MinusSquare className="h-5 w-5" />
                      </Button>
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => handleUpdateQuantity(item.sku_id, parseInt(e.target.value, 10) || 1)}
                        className="w-16 text-center h-9"
                        min="1"
                      />
                      <Button variant="outline" size="icon" onClick={() => handleUpdateQuantity(item.sku_id, item.quantity + 1)}>
                        <PlusSquare className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveItem(item.sku_id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </Card>
                ))}
              </div>
            ))}
          </div>

          <Card className="md:col-span-1 p-6 shadow-lg rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 sticky top-24">
            <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xl font-semibold text-blue-700">Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-0">
              <div className="flex justify-between text-gray-700">
                <span>Tạm tính ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm)</span>
                <span>{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between text-gray-700 pb-3 border-b border-blue-100">
                <span>Phí vận chuyển</span>
                <span>{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}₫`}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-blue-800 pt-3">
                <span>Tổng cộng</span>
                <span>{total.toLocaleString('vi-VN')}₫</span>
              </div>
            </CardContent>
            <CardFooter className="mt-6 p-0">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-lg py-3">
                Tiến hành thanh toán
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 