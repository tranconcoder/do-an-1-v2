import '';
import type { GetAllSKUQuery } from '@/validations/zod/sku.zod.js';

declare global {
    namespace service {
        namespace sku {
            namespace arguments {
                interface CreateSKU extends Omit<model.sku.SKU, '_id' | 'is_deleted'> {
                    warehouse: string;
                }

                /* ---------------------------------------------------------- */
                /*                             Get                            */
                /* ---------------------------------------------------------- */
                interface GetSKUById {
                    skuId: string;
                }

                interface GetAllSKUByAll extends GetAllSKUQuery {
                    // Convert categories string to array for internal use
                    categories?: string[];
                }

                /* ---------------------------------------------------------- */
                /*                           Get all                          */
                /* ---------------------------------------------------------- */

                interface GetAllSKUShopByAll extends commonTypes.object.Pagination {
                    shopId: string;
                }

                interface GetAllOwnSKUByShop extends commonTypes.object.Pagination {
                    userId: string;
                }
            }
        }
    }
}
