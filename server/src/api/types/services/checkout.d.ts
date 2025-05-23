import '';

declare global {
    namespace service {
        namespace checkout {
            /* ---------------------------------------------------------- */
            /*                         Definition                         */
            /* ---------------------------------------------------------- */
            namespace definition {
                interface CheckoutResult
                    extends Omit<model.checkout.CheckoutSchema, 'user' | '_id'> {}
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
