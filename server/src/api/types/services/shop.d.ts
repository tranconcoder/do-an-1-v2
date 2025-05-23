import type { Request } from 'express';

declare global {
    namespace service {
        namespace shop {
            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                interface SignUp extends joiTypes.auth.SignUpShop {
                    shop_userId: string;
                    shop_logo: string;
                    mediaId: string;
                }

                interface GetPendingShop extends commonTypes.object.Pagination {}

                interface ApproveShop {
                    shopId: string;
                }
            }
        }
    }
}
