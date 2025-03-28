import type { CategoryEnum } from '@/enums/product.enum.js';

declare global {
    namespace service {
        namespace product {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition {
                interface Product
                    extends Partial<model.product.ProductSchema>,
                        Partial<
                            Pick<
                                joiTypes.product.definition.UpdateProductSchema,
                                'product_new_category'
                            >
                        > {
                    product_attributes?: model.product.ProductSchemaList;
                }
            }

            /* ------------------------------------------------------ */
            /*                   Function arguments                   */
            /* ------------------------------------------------------ */
            namespace arguments {
                /* ------------------------------------------------------ */
                /*                         Create                         */
                /* ------------------------------------------------------ */
                interface CreateProduct extends definition.Product {}

                /* ------------------------------------------------------ */
                /*                         Search                         */
                /* ------------------------------------------------------ */
                interface SearchProduct extends joiTypes.product.definition.SearchProductSchema {}

                /* ------------------------------------------------------ */
                /*                          Get                           */
                /* ------------------------------------------------------ */
                /* ----------------- Get product by id  ----------------- */
                interface GetProductById {
                    productId: string;
                    userId?: string;
                }

                /* ---------------------------------------------------------- */
                /*                          Get all                           */
                /* ---------------------------------------------------------- */
                /* -------------------- Get all products -------------------- */
                interface GetAllProducts extends commonTypes.object.PageSlitting {}

                /* --------------- Get all product by shop -------------- */
                interface GetAllProductByShop
                    extends Pick<model.product.ProductSchema, 'product_shop'>,
                        commonTypes.object.PageSlitting {
                    userId: string;
                }

                interface GetAllProductDraftByShop extends Omit<GetAllProductByShop, 'userId'> {}

                interface GetAllProductPublishByShop extends Omit<GetAllProductByShop, 'userId'> {}

                interface GetAllProductUndraftByShop extends Omit<GetAllProductByShop, 'userId'> {}

                interface GetAllProductUnpublishByShop
                    extends Omit<GetAllProductByShop, 'userId'> {}

                /* ------------------- Update product ------------------- */
                interface UpdateProduct
                    extends joiTypes.product.definition.UpdateProductSchema,
                        Pick<model.product.ProductSchema, 'product_shop'> {
                    product_attributes: model.product.ProductSchemaList;
                }

                interface SetDraftProduct
                    extends joiTypes.product.definition.SetDraftProductSchema {
                    product_shop: string;
                }

                interface SetPublishProduct extends SetDraftProduct {}

                /* ------------------- Remove product ------------------- */
                type RemoveProduct = joiTypes.product.definition.DeleteProductSchema['product_id'];
            }
        }
    }
}
