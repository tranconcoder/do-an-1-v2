'use client';

import type { RootState } from '@/lib/store/store';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/lib/store/hooks';
import { mediaService } from '@/lib/services/api/mediaService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, MinusSquare, PlusSquare, ShoppingCartIcon, Tag, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    fetchCart,
    addItemToCart,
    decreaseItemQuantity,
    removeItemFromCart,
    updateItemStatus
} from '@/lib/store/slices/cartSlice';

export default function CartPage() {
    const { isAuthenticated, isLoading: isAuthLoading } = useSelector(
        (state: RootState) => state.user
    );
    const { items: cartItems, isLoading, error } = useSelector((state: RootState) => state.cart);
    const dispatch = useAppDispatch();

    // State cho việc chọn sản phẩm và mã giảm giá
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [discountCode, setDiscountCode] = useState<string>('');
    const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
    
    // State cho discount code từng item
    const [itemDiscountCodes, setItemDiscountCodes] = useState<Record<string, string>>({});
    const [itemDiscounts, setItemDiscounts] = useState<Record<string, number>>({});

    // Sync selected items with cart items' status on load
    useEffect(() => {
        const selectedItemIds = cartItems
            .filter(item => item.product_status === 'selected')
            .map(item => item.sku_id);
        setSelectedItems(selectedItemIds);
    }, [cartItems.length]); // Only run when cart items array length changes

    const calculateSubtotal = () => {
        return cartItems
            .filter(item => selectedItems.includes(item.sku_id))
            .reduce((total, item) => {
                const itemTotal = item.sku_price * item.quantity;
                const itemDiscount = itemDiscounts[item.sku_id] || 0;
                return total + itemTotal - itemDiscount;
            }, 0);
    };

    const calculateTotalItems = () => {
        return cartItems
            .filter(item => selectedItems.includes(item.sku_id))
            .reduce((total, item) => total + item.quantity, 0);
    };

    const calculateFinalTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal - appliedDiscount;
    };

    const handleApplyDiscount = () => {
        // Giả lập logic áp dụng mã giảm giá
        // Trong thực tế, bạn sẽ gọi API để validate và tính toán discount
        if (discountCode.toLowerCase() === 'discount10') {
            const subtotal = calculateSubtotal();
            setAppliedDiscount(subtotal * 0.1); // Giảm 10%
        } else if (discountCode.toLowerCase() === 'discount50k') {
            setAppliedDiscount(Math.min(50000, calculateSubtotal())); // Giảm 50k
        } else {
            setAppliedDiscount(0);
            alert('Mã giảm giá không hợp lệ');
        }
    };

    const handleRemoveDiscount = () => {
        setDiscountCode('');
        setAppliedDiscount(0);
    };

    // Xử lý mã giảm giá cho từng item
    const handleApplyItemDiscount = (itemId: string) => {
        const code = itemDiscountCodes[itemId];
        if (!code) return;

        const item = cartItems.find(item => item.sku_id === itemId);
        if (!item) return;

        // Giả lập logic áp dụng mã giảm giá cho item
        if (code.toLowerCase() === 'item10') {
            const itemTotal = item.sku_price * item.quantity;
            setItemDiscounts(prev => ({
                ...prev,
                [itemId]: itemTotal * 0.1 // Giảm 10%
            }));
        } else if (code.toLowerCase() === 'item20k') {
            const itemTotal = item.sku_price * item.quantity;
            setItemDiscounts(prev => ({
                ...prev,
                [itemId]: Math.min(20000, itemTotal) // Giảm 20k
            }));
        } else {
            setItemDiscounts(prev => ({
                ...prev,
                [itemId]: 0
            }));
            alert('Mã giảm giá không hợp lệ cho sản phẩm này');
        }
    };

    const handleRemoveItemDiscount = (itemId: string) => {
        setItemDiscountCodes(prev => {
            const newCodes = { ...prev };
            delete newCodes[itemId];
            return newCodes;
        });
        setItemDiscounts(prev => {
            const newDiscounts = { ...prev };
            delete newDiscounts[itemId];
            return newDiscounts;
        });
    };

    const groupedItems = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            if (!acc[item.shop_id]) {
                acc[item.shop_id] = {
                    shopId: item.shop_id,
                    shopName: item.shop_name,
                    shopLogo: item.shop_logo,
                    items: []
                };
            }
            acc[item.shop_id].items.push(item);
            return acc;
        }, {} as Record<string, { shopId: string; shopName: string; shopLogo?: string; items: typeof cartItems }>);
    }, [cartItems]);

    const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
        const currentItem = cartItems.find((item) => item.sku_id === itemId);
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
                    console.warn(
                        'Direct quantity input changes > -1 are not fully supported with the current decrease API and thunk.'
                    );
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
            // Xóa item khỏi danh sách đã chọn nếu có
            setSelectedItems(prev => prev.filter(id => id !== itemId));
            // Xóa discount code và discount của item
            setItemDiscountCodes(prev => {
                const newCodes = { ...prev };
                delete newCodes[itemId];
                return newCodes;
            });
            setItemDiscounts(prev => {
                const newDiscounts = { ...prev };
                delete newDiscounts[itemId];
                return newDiscounts;
            });
        } catch (error) {
            console.error(`Failed to remove item ${itemId}:`, error);
        }
    };

    // Xử lý chọn/bỏ chọn sản phẩm
    const handleSelectItem = async (itemId: string, checked: boolean) => {
        // Update local state first for immediate UI feedback
        if (checked) {
            setSelectedItems(prev => [...prev, itemId]);
        } else {
            setSelectedItems(prev => prev.filter(id => id !== itemId));
        }

        // Find the item to get shop ID
        const item = cartItems.find(cartItem => cartItem.sku_id === itemId);
        if (item) {
            try {
                // Update the item status via API
                const newStatus = checked ? 'selected' : 'unselected';
                await dispatch(updateItemStatus({ 
                    skuId: itemId, 
                    shopId: item.shop_id, 
                    newStatus 
                })).unwrap();
            } catch (error) {
                console.error(`Failed to update item status for ${itemId}:`, error);
                // Revert local state on error
                if (checked) {
                    setSelectedItems(prev => prev.filter(id => id !== itemId));
                } else {
                    setSelectedItems(prev => [...prev, itemId]);
                }
            }
        }
    };

    // Xử lý chọn/bỏ chọn tất cả sản phẩm trong shop
    const handleSelectShop = async (shopItems: typeof cartItems, checked: boolean) => {
        const shopItemIds = shopItems.map(item => item.sku_id);
        
        // Update local state first for immediate UI feedback
        if (checked) {
            setSelectedItems(prev => [...new Set([...prev, ...shopItemIds])]);
        } else {
            setSelectedItems(prev => prev.filter(id => !shopItemIds.includes(id)));
        }

        // Update each item's status via API
        const shopId = shopItems[0]?.shop_id;
        if (shopId) {
            try {
                const newStatus = checked ? 'selected' : 'unselected';
                // Update all items in the shop
                await Promise.all(
                    shopItems.map(item => 
                        dispatch(updateItemStatus({ 
                            skuId: item.sku_id, 
                            shopId: shopId, 
                            newStatus 
                        })).unwrap()
                    )
                );
            } catch (error) {
                console.error(`Failed to update shop items status:`, error);
                // Revert local state on error
                if (checked) {
                    setSelectedItems(prev => prev.filter(id => !shopItemIds.includes(id)));
                } else {
                    setSelectedItems(prev => [...new Set([...prev, ...shopItemIds])]);
                }
            }
        }
    };

    // Kiểm tra xem shop có được chọn toàn bộ không
    const isShopFullySelected = (shopItems: typeof cartItems) => {
        const shopItemIds = shopItems.map(item => item.sku_id);
        return shopItemIds.every(id => selectedItems.includes(id));
    };

    // Kiểm tra xem shop có được chọn một phần không
    const isShopPartiallySelected = (shopItems: typeof cartItems) => {
        const shopItemIds = shopItems.map(item => item.sku_id);
        return shopItemIds.some(id => selectedItems.includes(id)) && !isShopFullySelected(shopItems);
    };

    // Xử lý chọn/bỏ chọn tất cả sản phẩm trong giỏ hàng
    const handleSelectAll = async (checked: boolean) => {
        // Update local state first for immediate UI feedback
        if (checked) {
            const allItemIds = cartItems.map(item => item.sku_id);
            setSelectedItems(allItemIds);
        } else {
            setSelectedItems([]);
        }

        // Update all items' status via API
        try {
            const newStatus = checked ? 'selected' : 'unselected';
            // Group items by shop and update them
            const shopGroups = Object.values(groupedItems);
            await Promise.all(
                shopGroups.flatMap(shop => 
                    shop.items.map(item => 
                        dispatch(updateItemStatus({ 
                            skuId: item.sku_id, 
                            shopId: shop.shopId, 
                            newStatus 
                        })).unwrap()
                    )
                )
            );
        } catch (error) {
            console.error(`Failed to update all items status:`, error);
            // Revert local state on error
            if (checked) {
                setSelectedItems([]);
            } else {
                const allItemIds = cartItems.map(item => item.sku_id);
                setSelectedItems(allItemIds);
            }
        }
    };

    // Kiểm tra xem tất cả sản phẩm có được chọn không
    const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

    if (isLoading || isAuthLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">
                    Giỏ hàng của bạn
                </h1>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <Card
                                key={index}
                                className="flex items-center p-4 gap-4 shadow-md rounded-lg"
                            >
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
                        <CardTitle className="text-xl font-semibold mb-6 text-blue-700">
                            Tóm tắt đơn hàng
                        </CardTitle>
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
                <h2 className="text-2xl font-semibold mb-2 text-gray-700">
                    Giỏ hàng của bạn đang trống
                </h2>
                <p className="text-gray-500 mb-6">
                    Hãy khám phá và thêm sản phẩm bạn yêu thích vào giỏ hàng nhé!
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/">Tiếp tục mua sắm</Link>
                </Button>
            </div>
        );
    }

    const subtotal = calculateSubtotal();

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">
                    Giỏ hàng của bạn
                </h1>
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2 space-y-6">
                        {/* Checkbox chọn tất cả */}
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border">
                            <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={handleSelectAll}
                            />
                            <span className="font-medium text-gray-700">
                                Chọn tất cả ({cartItems.length} sản phẩm)
                            </span>
                        </div>

                        {Object.values(groupedItems).map((shopGroup) => (
                            <div key={shopGroup.shopId} className="space-y-4">
                                <div className="flex items-center gap-3 border-b pb-2 mb-4">
                                    <Checkbox
                                        checked={isShopFullySelected(shopGroup.items)}
                                        onCheckedChange={(checked) => 
                                            handleSelectShop(shopGroup.items, checked as boolean)
                                        }
                                        className="mr-2"
                                    />
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
                                    <h2 className="text-xl font-semibold text-gray-700">
                                        Shop: {shopGroup.shopName}
                                    </h2>
                                </div>
                                {shopGroup.items.map((item) => (
                                    <Card
                                        key={item.sku_id}
                                        className="p-4 shadow-md rounded-lg hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={selectedItems.includes(item.sku_id)}
                                                    onCheckedChange={(checked) => 
                                                        handleSelectItem(item.sku_id, checked as boolean)
                                                    }
                                                />
                                                <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-md overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={mediaService.getMediaUrl(item.product_thumb)}
                                                        alt={item.product_name}
                                                        layout="fill"
                                                        objectFit="cover"
                                                        className="bg-gray-100"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-grow text-center sm:text-left">
                                                <Link
                                                    href={`/products/${item.spu_id}?sku=${item.sku_id}`}
                                                    className="hover:text-blue-600"
                                                >
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {item.product_name}
                                                    </h3>
                                                </Link>
                                                <p className="text-md font-bold text-blue-600 mt-1">
                                                    {item.sku_price.toLocaleString('vi-VN')}₫
                                                </p>
                                                {itemDiscounts[item.sku_id] && (
                                                    <p className="text-sm text-green-600 font-medium">
                                                        Giảm: -{itemDiscounts[item.sku_id].toLocaleString('vi-VN')}₫
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 my-2 sm:my-0">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item.sku_id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <MinusSquare className="h-5 w-5" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        handleUpdateQuantity(
                                                            item.sku_id,
                                                            parseInt(e.target.value, 10) || 1
                                                        )
                                                    }
                                                    className="w-16 text-center h-9"
                                                    min="1"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleUpdateQuantity(
                                                            item.sku_id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                >
                                                    <PlusSquare className="h-5 w-5" />
                                                </Button>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => handleRemoveItem(item.sku_id)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        
                                        {/* Discount code input for individual item */}
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Tag className="h-4 w-4 text-orange-600" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    Mã giảm giá sản phẩm
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Nhập mã giảm giá"
                                                    value={itemDiscountCodes[item.sku_id] || ''}
                                                    onChange={(e) => 
                                                        setItemDiscountCodes(prev => ({
                                                            ...prev,
                                                            [item.sku_id]: e.target.value
                                                        }))
                                                    }
                                                    className="flex-1 text-sm"
                                                />
                                                <Button 
                                                    onClick={() => handleApplyItemDiscount(item.sku_id)}
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-orange-600 text-white hover:bg-orange-700 border-orange-600"
                                                >
                                                    Áp dụng
                                                </Button>
                                            </div>
                                            {itemDiscounts[item.sku_id] > 0 && (
                                                <div className="mt-2 flex items-center justify-between p-2 bg-green-100 rounded-md">
                                                    <span className="text-xs text-green-800 font-medium">
                                                        Mã "{itemDiscountCodes[item.sku_id]}" đã được áp dụng
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveItemDiscount(item.sku_id)}
                                                        className="text-green-700 hover:text-green-900 p-1 h-auto"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ))}
                    </div>

                    <Card className="md:col-span-1 p-6 shadow-lg rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 sticky top-24">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-xl font-semibold text-blue-700">
                                Tóm tắt đơn hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 p-0">
                            <div className="flex justify-between text-gray-700">
                                <span>
                                    Tạm tính ({calculateTotalItems()} sản phẩm đã chọn)
                                </span>
                                <span>
                                    {cartItems
                                        .filter(item => selectedItems.includes(item.sku_id))
                                        .reduce((total, item) => total + item.sku_price * item.quantity, 0)
                                        .toLocaleString('vi-VN')}₫
                                </span>
                            </div>
                            
                            {/* Hiển thị tổng giảm giá từ item-level discounts */}
                            {Object.values(itemDiscounts).some(discount => discount > 0) && (
                                <div className="flex justify-between text-orange-600">
                                    <span>Giảm giá sản phẩm</span>
                                    <span>
                                        -{Object.entries(itemDiscounts)
                                            .filter(([itemId]) => selectedItems.includes(itemId))
                                            .reduce((total, [, discount]) => total + discount, 0)
                                            .toLocaleString('vi-VN')}₫
                                    </span>
                                </div>
                            )}
                            
                            {appliedDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá đơn hàng</span>
                                    <span>-{appliedDiscount.toLocaleString('vi-VN')}₫</span>
                                </div>
                            )}

                            <div className="border-t pt-3">
                                <div className="flex justify-between text-xl font-bold text-blue-800">
                                    <span>Tổng cộng</span>
                                    <span>{calculateFinalTotal().toLocaleString('vi-VN')}₫</span>
                                </div>
                            </div>
                        </CardContent>
                        
                        {/* Global discount code input */}
                        {selectedItems.length > 0 && (
                            <div className="mt-4 p-3 bg-white rounded-lg border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Tag className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-700">Mã giảm giá đơn hàng</span>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Nhập mã giảm giá"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        className="flex-1 text-sm"
                                    />
                                    <Button 
                                        onClick={handleApplyDiscount}
                                        size="sm"
                                        variant="outline"
                                        className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                                    >
                                        Áp dụng
                                    </Button>
                                </div>
                                {appliedDiscount > 0 && (
                                    <div className="mt-2 text-xs text-green-600 flex items-center justify-between">
                                        <span>Mã "{discountCode}" đã được áp dụng</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveDiscount}
                                            className="text-green-600 hover:text-green-800 p-1 h-auto"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <CardFooter className="mt-6 p-0">
                            <Button 
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-lg py-3"
                                disabled={selectedItems.length === 0}
                            >
                                Tiến hành thanh toán ({selectedItems.length} sản phẩm)
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
