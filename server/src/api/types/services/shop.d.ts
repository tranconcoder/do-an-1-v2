import type { Request } from 'express';

declare global {
    namespace service {
        namespace shop {
            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                interface SignUp extends joiTypes.auth.SignUpShop, model.shop.ShopSchema  {
                    shop_logo: Express.Multer.File;
                    shop_address: string;
                }
            }
        }
    }
}
