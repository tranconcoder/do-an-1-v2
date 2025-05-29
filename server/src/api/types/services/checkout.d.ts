import '';
import { CheckoutSchema } from "@/validations/zod/checkout.zod";

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
                interface Checkout extends CheckoutSchema{
                    user: string;
                }
            }
        }
    }
}
