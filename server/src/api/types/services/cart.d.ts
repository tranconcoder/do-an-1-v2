import type { CartItemStatus } from '../../enums/cart.enum';

declare global {
    namespace serviceTypes {
        namespace cart {
            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                /* ------------------------ Get cart ------------------------ */
                interface GetCart {
                    user: string;
                }

                /* ---------------------- Add to cart  ---------------------- */
                interface AddToCart {
                    userId: string;
                    productId: string;
                }

                /* ---------------------- Update cart  ---------------------- */
                interface UpdateCart {
                    user: string;
                    cartShop: Array<{
                        shopId: string;
                        products: Array<{
                            id: string;

                            // Quantity
                            quantity: number;
                            newQuantity: number;

                            // Status
                            status: CartItemStatus;
                            newStatus: CartItemStatus;

                            // Delete
                            isDelete: boolean;
                        }>;
                    }>;
                }

                /* ---------------- Delete product from cart ---------------- */
                interface DeleteProductFromCart extends AddToCart {}
            }
        }
    }
}
