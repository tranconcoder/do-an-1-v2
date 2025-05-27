'use client';

import Link from 'next/link';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState, useEffect, Fragment, useCallback } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { mediaService } from '@/lib/services/api/mediaService'; // Assuming mediaService is needed for image URLs
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store/store';
import { CartItem } from '@/lib/services/api/cartService.js'; // Import CartItem type
import {
    addItemToCart,
    decreaseItemQuantity,
    fetchCart,
    removeItemFromCart,
    updateItemQuantity
} from '@/lib/store/slices/cartSlice';

// Utility function for debouncing
function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null;
    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
}

export default function CartHoverCard() {
    const dispatch = useDispatch<AppDispatch>();
    // Access cart state from Redux store
    const { items: cartItems, isLoading, error } = useSelector((state: RootState) => state.cart);

    // Calculate total items from Redux state
    const totalItems = cartItems ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;

    const [showAlertDialog, setShowAlertDialog] = useState(false);
    const { toast } = useToast();
    const [skuIdToRemove, setSkuIdToRemove] = useState<string | null>(null);
    // State để theo dõi số lượng trong input tạm thời (optimistic update trên UI)
    const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

    // Đồng bộ state local quantities khi cartItems từ Redux thay đổi
    useEffect(() => {
        const initialQuantities: Record<string, number> = {};
        cartItems.forEach((item) => {
            initialQuantities[item.sku_id] = item.quantity;
        });
        setItemQuantities(initialQuantities);
    }, [cartItems]);

    // Debounced handler for quantity update
    const debouncedUpdateQuantity = useCallback(
        debounce(async (skuId: string, shopId: string, newQuantity: number) => {
            // Lấy số lượng hiện tại từ state Redux để so sánh
            const currentItem = cartItems.find((item) => item.sku_id === skuId);
            if (!currentItem) return; // Should not happen if UI is based on cartItems

            // Kiểm tra nếu số lượng thực sự thay đổi
            if (newQuantity !== currentItem.quantity) {
                // Xác thực số lượng nhập vào
                if (newQuantity <= 0) {
                    // Nếu số lượng là 0 hoặc âm, hỏi xác nhận xóa
                    setSkuIdToRemove(skuId); // Đặt skuId cần xóa
                    setShowAlertDialog(true); // Mở dialog xác nhận xóa
                    // Optional: Revert the input value back to 1 temporarily
                    setItemQuantities((prev) => ({ ...prev, [skuId]: 1 }));
                } else if (Number.isInteger(newQuantity)) {
                    // Nếu là số nguyên dương, dispatch thunk cập nhật
                    const resultAction = await dispatch(
                        updateItemQuantity({ skuId, shopId, newQuantity })
                    );

                    if (updateItemQuantity.fulfilled.match(resultAction)) {
                        toast({ title: 'Cập nhật số lượng' });
                        // State sẽ được fetchCart cập nhật sau đó
                    } else {
                        // Optional: Revert the input value back to the last valid quantity on error
                        setItemQuantities((prev) => ({ ...prev, [skuId]: currentItem.quantity }));
                        // dispatch(fetchCart()); // Fetch cart on error
                    }
                } else {
                    // Nếu không phải số nguyên dương hợp lệ
                    toast({ title: 'Số lượng không hợp lệ', variant: 'destructive' });
                    // Revert the input value back to the last valid quantity
                    setItemQuantities((prev) => ({ ...prev, [skuId]: currentItem.quantity }));
                }
            }
        }, 500), // Debounce delay 500ms
        [dispatch, cartItems, toast] // Dependencies cho useCallback
    );

    // Handle input change
    const handleInputChange = (skuId: string, shopId: string, value: string) => {
        const newQuantity = parseInt(value, 10);

        // Cập nhật state local ngay lập tức để UI phản hồi
        setItemQuantities((prev) => ({
            ...prev,
            [skuId]: isNaN(newQuantity) ? 0 : newQuantity // Sử dụng 0 hoặc giá trị tạm nếu không phải số
        }));

        // Gọi hàm debounce để xử lý logic cập nhật và dispatch thunk sau một khoảng dừng
        if (!isNaN(newQuantity)) {
            // Chỉ gọi debounce nếu giá trị nhập vào là số
            debouncedUpdateQuantity(skuId, shopId, newQuantity);
        }
    };

    // Handle increasing item quantity (Giữ lại logic này cho nút +)
    const handleIncreaseQuantity = (item: CartItem) => {
        const newQuantity = item.quantity + 1;
        // Cập nhật state local ngay lập tức
        setItemQuantities((prev) => ({ ...prev, [item.sku_id]: newQuantity }));
        // Dispatch thunk cập nhật ngay
        dispatch(updateItemQuantity({ skuId: item.sku_id, shopId: item.shop_id, newQuantity }));
    };

    // Handle decreasing item quantity (Giữ lại logic này cho nút -)
    const handleDecreaseQuantity = (item: CartItem) => {
        if (item.quantity === 1) {
            // Nếu số lượng là 1, kích hoạt xác nhận xóa
            setSkuIdToRemove(item.sku_id);
            setShowAlertDialog(true);
        } else {
            const newQuantity = item.quantity - 1;
            // Cập nhật state local ngay lập tức
            setItemQuantities((prev) => ({ ...prev, [item.sku_id]: newQuantity }));
            // Dispatch thunk cập nhật ngay
            dispatch(updateItemQuantity({ skuId: item.sku_id, shopId: item.shop_id, newQuantity }));
        }
    };

    // Handle removing item (Giữ nguyên logic xóa từ AlertDialog)
    const handleRemoveItem = async () => {
        if (skuIdToRemove !== null) {
            const resultAction = await dispatch(removeItemFromCart(skuIdToRemove));
            if (removeItemFromCart.fulfilled.match(resultAction)) {
                toast({ title: 'Xóa sản phẩm' });
            } else {
                toast({ title: 'Lỗi', variant: 'destructive' });
            }
            // Close alert dialog and reset state regardless of API success/failure
            setSkuIdToRemove(null);
            setShowAlertDialog(false);
        }
    };

    return (
        <Fragment>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <ShoppingCart className="h-5 w-5" />
                        {totalItems > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-blue-600">
                                {totalItems}
                            </Badge>
                        )}
                        <span className="sr-only">Giỏ hàng</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="text-sm">
                        <p className="font-medium mb-2">Giỏ hàng của bạn ({totalItems} sản phẩm)</p>
                        {isLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Skeleton className="w-10 h-10 rounded" />
                                        <div className="flex-1 space-y-1">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Skeleton className="h-6 w-6 rounded" />
                                            <Skeleton className="h-4 w-8" />
                                            <Skeleton className="h-6 w-6 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-4 text-gray-500">
                                <ShoppingCart className="h-10 w-10 mb-2" />
                                <p className="text-sm">Giỏ hàng trống.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.sku_id}
                                        className="flex items-center gap-2 border-b pb-2 last:border-b-0"
                                    >
                                        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                            <Image
                                                src={
                                                    mediaService.getMediaUrl(item.product_thumb) ||
                                                    '/placeholder.svg'
                                                }
                                                alt={item.product_name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm line-clamp-1">
                                                {item.product_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.sku_price?.toLocaleString('vi-VN')}₫
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleDecreaseQuantity(item)}
                                                disabled={isLoading}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <input
                                                type="number"
                                                min="0" // Cho phép nhập 0 để hỏi xóa
                                                value={itemQuantities[item.sku_id] ?? item.quantity} // Sử dụng state local hoặc giá trị từ Redux
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        item.sku_id,
                                                        item.shop_id,
                                                        e.target.value
                                                    )
                                                }
                                                className="text-sm font-medium w-12 text-center border rounded px-1 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                disabled={isLoading}
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleIncreaseQuantity(item)}
                                                disabled={isLoading}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        {/* Nút Xóa sản phẩm trực tiếp */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-gray-400 hover:text-red-500"
                                            onClick={() => {
                                                setSkuIdToRemove(item.sku_id);
                                                setShowAlertDialog(true);
                                            }}
                                            disabled={isLoading}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Nút "Xem giỏ hàng" - Luôn hiển thị khi component được render */}
                        <div className="mt-4">
                            <Link href="/cart" passHref>
                                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                                    Xem giỏ hàng
                                </Button>
                            </Link>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveItem}
                            className={buttonVariants({ variant: 'destructive' })}
                            disabled={isLoading}
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Fragment>
    );
}
