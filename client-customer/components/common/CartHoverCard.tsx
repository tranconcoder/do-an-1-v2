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
import { useState, useEffect, Fragment } from "react";
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

// Example data
const initialCartItems = [
  { id: 1, name: "Product A", quantity: 1, price: 100000, image: "/placeholder.svg" },
  { id: 2, name: "Product B", quantity: 2, price: 50000, image: "/placeholder.svg" },
];

// const totalItems = initialCartItems.reduce((sum, item) => sum + item.quantity, 0);

export default function CartHoverCard() {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [totalItems, setTotalItems] = useState(0);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [itemToRemoveId, setItemToRemoveId] = useState<number | null>(null);

  useEffect(() => {
    const newTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItems(newTotalItems);
  }, [cartItems]);

  const handleIncreaseQuantity = (id: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (id: number) => {
    const item = cartItems.find(item => item.id === id);
    if (item && item.quantity === 1) {
      setItemToRemoveId(id);
      setShowAlertDialog(true);
    } else if (item && item.quantity > 1) {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    }
  };

  const handleRemoveItem = () => {
    if (itemToRemoveId !== null) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemToRemoveId));
      setItemToRemoveId(null);
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
              cartItems.length === 0 ? (
                <p>Giỏ hàng trống.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2 border-b pb-2 last:border-b-0">
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.price.toLocaleString()}đ</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleDecreaseQuantity(item.id)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleIncreaseQuantity(item.id)}>
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
            <AlertDialogAction onClick={handleRemoveItem} className={buttonVariants({ variant: "destructive" })}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
} 