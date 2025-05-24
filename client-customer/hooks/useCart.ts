import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { RootState, AppDispatch } from '@/lib/store/store';
import { 
  fetchCart, 
  addToCart as addToCartAction,
  updateItemQuantity,
  removeFromCart,
  clearError,
  optimisticUpdateQuantity,
  optimisticRemoveItem
} from '@/lib/store/slices/cartSlice';
import { useToast } from '@/hooks/use-toast';

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const cartState = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  // Auto-fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated && cartState.lastUpdated === null && !cartState.isLoading) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch, cartState.items.length, cartState.isLoading]);

  // Handle errors
  useEffect(() => {
    if (cartState.error) {
      toast({
        title: "Cart Error",
        description: cartState.error,
        variant: "destructive",
      });
      dispatch(clearError());
    }
  }, [cartState.error, toast, dispatch]);

  const addToCart = useCallback(async (skuId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      return false;
    }

    try {
      await dispatch(addToCartAction({ skuId, quantity })).unwrap();
      toast({
        title: "Success",
        description: "Item added to cart",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
      return false;
    }
  }, [dispatch, isAuthenticated, toast]);

  const updateQuantity = useCallback(async (skuId: string, quantity: number) => {
    if (quantity < 1) return false;

    // Optimistic update
    dispatch(optimisticUpdateQuantity({ skuId, quantity }));

    try {
      await dispatch(updateItemQuantity({ skuId, quantity })).unwrap();
      return true;
    } catch (error) {
      // Revert on error
      dispatch(fetchCart());
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
      return false;
    }
  }, [dispatch, toast]);

  const removeItem = useCallback(async (skuId: string) => {
    // Optimistic update
    dispatch(optimisticRemoveItem(skuId));

    try {
      await dispatch(removeFromCart(skuId)).unwrap();
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
      return true;
    } catch (error) {
      // Revert on error
      dispatch(fetchCart());
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
      return false;
    }
  }, [dispatch, toast]);

  const refreshCart = useCallback(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const getItemQuantity = useCallback((skuId: string) => {
    const item = cartState.items.find(item => item.skuId === skuId);
    return item ? item.quantity : 0;
  }, [cartState.items]);

  const isItemInCart = useCallback((skuId: string) => {
    return cartState.items.some(item => item.skuId === skuId);
  }, [cartState.items]);

  const getTotalItems = useCallback(() => {
    return cartState.summary.itemCount;
  }, [cartState.summary.itemCount]);

  const getTotalPrice = useCallback(() => {
    return cartState.summary.total;
  }, [cartState.summary.total]);

  return {
    // State
    items: cartState.items,
    summary: cartState.summary,
    isLoading: cartState.isLoading,
    isUpdating: cartState.isUpdating,
    error: cartState.error,
    
    // Actions
    addToCart,
    updateQuantity,
    removeItem,
    refreshCart,
    
    // Utilities
    getItemQuantity,
    isItemInCart,
    getTotalItems,
    getTotalPrice,
    
    // Computed values
    isEmpty: cartState.items.length === 0,
    hasItems: cartState.items.length > 0,
  };
};

export default useCart;