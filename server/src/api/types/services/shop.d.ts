import type { Request } from 'express';

declare global {
    namespace service {
        namespace shop {
            /* ---------------------------------------------------------- */
            /*                         Arguments                          */
            /* ---------------------------------------------------------- */
            namespace arguments {
                interface SignUpShop extends model.shop.ShopSchema {
                    shop_logo: Express.Multer.File;
                    shop_address: {

                    }
                }
            }
        }
    }
}
