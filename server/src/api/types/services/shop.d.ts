import type { Request } from 'express';

declare global {
    namespace service {
        namespace shop {
            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                interface SignUp extends model.shop.ShopSchema, joiTypes.auth.SignUpShop {
                    shop_logo: Express.Multer.File;
                    shop_address: string;
                }
            }
        }
    }
}
