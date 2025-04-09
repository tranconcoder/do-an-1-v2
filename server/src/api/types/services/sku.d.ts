import '';

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

                interface GetAllSKUByAll extends commonTypes.object.Pagination {}

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
