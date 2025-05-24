import type { UpdateCart as UpdateCartZod } from '@/validations/zod/cart.zod.js';

declare global {
    namespace service {
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
                    skuId: string;
                    quantity: number;
                }

                /* ---------------------- Update cart  ---------------------- */
                interface UpdateCart extends UpdateCartZod {
                    user: string;
                }

                interface DecreaseCartQuantity {
                    skuId: string;
                    userId: string;
                }

                /* ---------------- Delete product from cart ---------------- */
                interface DeleteProductFromCart extends Pick<AddToCart, 'skuId' | 'userId'> {}

                /* --------------- Delete products from cart  --------------- */
                interface DeleteProductsFromCart {
                    user: string;
                    products: string[];
                }
            }
        }
    }
}
