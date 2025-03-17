import '';

declare global {
    namespace serviceTypes {
        namespace checkout {
            /* ---------------------------------------------------------- */
            /*                         Definition                         */
            /* ---------------------------------------------------------- */
            namespace definition {
                interface CheckoutResult {
                    totalPriceRaw: number;
                    totalFeeShip: number;
                    totalDiscountShopPrice: number;
                    totalDiscountAdminPrice: number;
                    totalDiscountPrice: number;
                    totalCheckout: number;
                    shopsInfo: Array<{
                        shopId: string;
                        shopName: string;
                        productsInfo: Array<{
                            id: string;
                            name: string;
                            quantity: number;
                            thumb: string;
                            price: number;
                            priceRaw: number;
                        }>;
                        feeShip: number;
                        totalPriceRaw: number;
                        totalDiscountPrice: number;
                    }>;
                }
            }

            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                interface Checkout {
                    user: string;
                    discountId?: string; // Admin voucher
                    shopsDiscount: Array<{
                        shopId: string;
                        discountId: string;
                    }>;
                }
            }
        }
    }
}
