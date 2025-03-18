import '';

declare global {
    namespace serviceTypes {
        namespace checkout {
            /* ---------------------------------------------------------- */
            /*                         Definition                         */
            /* ---------------------------------------------------------- */
            namespace definition {
                interface CheckoutResult
                    extends Omit<modelTypes.checkout.CheckoutSchema, 'user' | '_id'> {}
            }

            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                interface Checkout {
                    user: string;
                    discountCode?: string; // Admin voucher
                    shopsDiscount: Array<{
                        shopId: string;
                        discountCode: string;
                    }>;
                }
            }
        }
    }
}
