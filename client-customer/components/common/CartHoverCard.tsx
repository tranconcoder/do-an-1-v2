"use client";

import Link from "next/link";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useState, useEffect, Fragment, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import cartService, { CartItem } from "@/lib/services/api/cartService";
import { mediaService } from "@/lib/services/api/mediaService"; // Assuming mediaService is needed for image URLs
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store/store';
import { fetchCart, addItemToCart, decreaseItemQuantity, removeItemFromCart } from '@/lib/store/slices/cartSlice';

export default function CartHoverCard() {
  const dispatch = useDispatch<AppDispatch>();
  // Access cart state from Redux store
  const { items: cartItems, isLoading, error } = useSelector((state: RootState) => state.cart);

  // Calculate total items from Redux state
  const totalItems = cartItems ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const { toast } = useToast();
  const [skuIdToRemove, setSkuIdToRemove] = useState<string | null>(null);

  // Fetch cart items when the component mounts or cartItems change (e.g., after modifications)
  useEffect(() => {
    // Only fetch if not currently loading
    if (!isLoading) {
      dispatch(fetchCart());
    }
  }, [dispatch, isLoading]);

  // Handle increasing item quantity
  const handleIncreaseQuantity = async (skuId: string) => {
    const resultAction = await dispatch(addItemToCart({ skuId, quantity: 1 }));
    if (addItemToCart.fulfilled.match(resultAction)) {
       toast({
         title: "Cập nhật giỏ hàng",
         description: "Đã tăng số lượng sản phẩm.",
       });
       // Refetch cart after successful modification
       dispatch(fetchCart());
    } else {
       toast({
         title: "Lỗi",
         description: (resultAction.payload as string) || "Không thể tăng số lượng sản phẩm.",
         variant: "destructive",
       });
    }
  };

  // Handle decreasing item quantity
  const handleDecreaseQuantity = async (skuId: string, currentQuantity: number) => {
    if (currentQuantity === 1) {
      // If quantity is 1, confirm removal
      setSkuIdToRemove(skuId);
      setShowAlertDialog(true);
    } else {
      const resultAction = await dispatch(decreaseItemQuantity(skuId));
      if (decreaseItemQuantity.fulfilled.match(resultAction)) {
        toast({
          title: "Cập nhật giỏ hàng",
          description: "Đã giảm số lượng sản phẩm.",
        });
        // Refetch cart after successful modification
        dispatch(fetchCart());
      } else {
        toast({
          title: "Lỗi",
          description: (resultAction.payload as string) || "Không thể giảm số lượng sản phẩm.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle removing item
  const handleRemoveItem = async () => {
    if (skuIdToRemove !== null) {
      const resultAction = await dispatch(removeItemFromCart(skuIdToRemove));
      if (removeItemFromCart.fulfilled.match(resultAction)) {
        toast({
          title: "Xóa sản phẩm",
          description: "Sản phẩm đã được xóa khỏi giỏ hàng.",
        });
        // Refetch cart after successful modification
        dispatch(fetchCart());
      } else {
         toast({
           title: "Lỗi",
           description: (resultAction.payload as string) || "Không thể xóa sản phẩm khỏi giỏ hàng.",
           variant: "destructive",
         });
      }
      // Close alert dialog and reset state regardless of API success/failure
      setSkuIdToRemove(null);
      setShowAlertDialog(false);
    }
  };

  return (
    <Fragment>
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-blue-600">
                {totalItems}
              </Badge>
            )}
            <span className="sr-only">Giỏ hàng</span>
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="text-sm">
            <p className="font-medium mb-2">Giỏ hàng của bạn ({totalItems} sản phẩm)</p>
            {
              isLoading ? (
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
                 <p>Giỏ hàng trống.</p>
               ) : (
                 <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                   {cartItems.map(item => (
                     <div key={item.sku_id} className="flex items-center gap-2 border-b pb-2 last:border-b-0">
                       <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <Image src={mediaService.getMediaUrl(item.product_thumb) || "/placeholder.svg"} alt={item.product_name} fill className="object-cover" />
                       </div>
                       <div className="flex-1">
                         <p className="font-medium text-sm line-clamp-1">{item.product_name}</p>
                         <p className="text-xs text-gray-500">{item.sku_price?.toLocaleString('vi-VN')}₫</p>
                       </div>
                       <div className="flex items-center gap-1 flex-shrink-0">
                         <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleDecreaseQuantity(item.sku_id, item.quantity)} disabled={isLoading}>
                           <Minus className="h-3 w-3" />
                         </Button>
                         <span className="text-sm font-medium w-5 text-center flex-shrink-0">{item.quantity}</span>
                         <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleIncreaseQuantity(item.sku_id)} disabled={isLoading}>
                           <Plus className="h-3 w-3" />
                         </Button>
                       </div>
                     </div>
                   ))}
                 </div>
               )
            }

            {cartItems.length > 0 && (
              <div className="mt-4">
                <Link href="/cart" passHref>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                    Xem giỏ hàng
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>

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
            <AlertDialogAction onClick={handleRemoveItem} className={buttonVariants({ variant: "destructive" })} disabled={isLoading}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
} 